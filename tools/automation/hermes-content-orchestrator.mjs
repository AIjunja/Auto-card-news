#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { optionArray, parseArgs, printSummary, resolvePath, selectQueueItems } from "../publish/lib/cli-utils.mjs";
import {
  DEFAULT_QUEUE_PATH,
  readJsonIfExists,
  validateQueue,
  writeJson,
} from "../publish/lib/publish-utils.mjs";

const DEFAULT_WORKSPACE_ROOT = "carousel-workspace";
const DEFAULT_CHANNEL = "ai-jjuun";
const DEFAULT_INBOX = path.join(DEFAULT_WORKSPACE_ROOT, "hermes-source-inbox.json");
const DEFAULT_REVIEW_STATE = path.join(DEFAULT_WORKSPACE_ROOT, "hermes-review-state.json");
const LEGACY_APPROVALS = path.join(DEFAULT_WORKSPACE_ROOT, "hermes-review-approvals.json");
const DEFAULT_RUNS_DIR = path.join(DEFAULT_WORKSPACE_ROOT, "hermes-runs");
const DEFAULT_DRAFTS_DIR = path.join(DEFAULT_WORKSPACE_ROOT, "hermes-drafts");
const DEFAULT_TELEGRAM_STATE = path.join(DEFAULT_WORKSPACE_ROOT, "telegram-state.json");
const DEFAULT_ENV_FILE = path.join(DEFAULT_WORKSPACE_ROOT, "hermes-content.env");
const DEFAULT_CDN_REPO = "ai-jjun-cdn";
const SOURCE_REVIEW_GATE_STATUSES = new Set(["pending", "changes_requested"]);

const { options, flags } = parseArgs();

if (flags.has("help") || process.argv.length <= 2) {
  printHelp();
  process.exit(0);
}

loadEnvFile(resolvePath(options.env, DEFAULT_ENV_FILE));

const cwd = process.cwd();
const workspaceRoot = resolvePath(options.workspace_root, DEFAULT_WORKSPACE_ROOT);
const channel = options.channel ?? DEFAULT_CHANNEL;
const inboxPath = resolvePath(options.inbox, DEFAULT_INBOX);
const reviewStatePath = resolvePath(options.review_state ?? options.approvals, DEFAULT_REVIEW_STATE);
const runsDir = resolvePath(options.runs_dir, DEFAULT_RUNS_DIR);
const draftsDir = resolvePath(options.drafts_dir, DEFAULT_DRAFTS_DIR);
const queuePath = resolvePath(options.queue, DEFAULT_QUEUE_PATH);
const telegramStatePath = resolvePath(options.telegram_state, DEFAULT_TELEGRAM_STATE);
const cdnRepoPath = resolvePath(options.cdn_repo, process.env.AIJJUN_CDN_REPO_PATH || DEFAULT_CDN_REPO);
const autoPublishOnFinalApproval = envFlag("HERMES_AUTO_PUBLISH_ON_FINAL_APPROVAL", false);
const autoPublishExecute = envFlag("HERMES_AUTO_PUBLISH_EXECUTE", false);
const autoPublishKinds = normalizeAutoPublishKinds(
  process.env.HERMES_AUTO_PUBLISH_KINDS || process.env.HERMES_AUTO_PUBLISH_KIND || "carousel,reel",
);
const hourlyOnce = flags.has("hourly_once");
const requireDraftApproval = flags.has("require_draft_approval") || envFlag("HERMES_REQUIRE_DRAFT_APPROVAL", false);
const forceFinalBuild = flags.has("force_final") || envFlag("HERMES_FORCE_FINAL_BUILD", false);
const autopilotOnNoReview = envFlag("HERMES_AUTOPILOT_ON_NO_REVIEW", false);
const sourceOnlyAutopilot = envFlag("HERMES_SOURCE_ONLY_AUTOPILOT", false);
const autopilotSourceReviewMinutes = envNumber("HERMES_AUTOPILOT_SOURCE_REVIEW_MINUTES", 60);
const autopilotDailyPublishLimit = envNumber("HERMES_AUTOPILOT_DAILY_PUBLISH_LIMIT", 2);
const archiveSourceCandidatesAfterSelection = envFlag("HERMES_ARCHIVE_SOURCE_CANDIDATES_AFTER_SELECTION", true);
const directSourceImmediate = envFlag("HERMES_DIRECT_SOURCE_IMMEDIATE", true);

if (flags.has("clean_review_state")) {
  const state = await loadReviewState();
  printSummary("review state cleaned", reviewStateSummary(state));
}

if (flags.has("init")) {
  await initFiles();
}

if (!hourlyOnce && flags.has("refresh_sources")) {
  if (flags.has("force_refresh_sources") || !(await stopForSourceReviewGate("source refresh"))) {
    await refreshSourceInbox();
  }
}

if (options.add_source_url) {
  await addManualSourceCandidate();
}

if (flags.has("source_send")) {
  await sendTelegramSourceReview();
}

if (flags.has("source_resend")) {
  await resendTelegramPendingReviewQueue();
}

if (options.approve_source) {
  await updateSourceReview(options.approve_source, "approved", options.note ?? "Source approved from CLI.");
}

if (options.reject_source) {
  await updateSourceReview(options.reject_source, "rejected", options.note ?? "Source rejected from CLI.");
}

if (!hourlyOnce && (flags.has("draft_plan") || flags.has("run_draft_codex"))) {
  await planDraftRuns({ runCodex: flags.has("run_draft_codex") });
}

if (flags.has("draft_send")) {
  await sendTelegramDraftReview();
}

if (options.approve_draft) {
  await updateDraftReview(options.approve_draft, "approved", options.note ?? "Draft approved from CLI.");
}

if (options.request_draft_changes) {
  await updateDraftReview(options.request_draft_changes, "changes_requested", options.note ?? "Draft changes requested from CLI.");
}

if (!hourlyOnce && (flags.has("plan") || flags.has("run_codex"))) {
  await planFinalRuns({ runCodex: flags.has("run_codex") });
}

if (!hourlyOnce && flags.has("build_queue")) {
  await runNodeScript("tools/publish/build-publish-queue.mjs", [
    "--workspace-root",
    workspaceRoot,
    "--channel",
    channel,
    "--out",
    queuePath,
  ]);
}

if (!hourlyOnce && flags.has("validate")) {
  await runNodeScript("tools/publish/validate-publish-queue.mjs", [
    "--queue",
    queuePath,
    "--out",
    resolvePath(options.validation_out, path.join(DEFAULT_WORKSPACE_ROOT, "publish-validation.json")),
  ]);
}

if (!hourlyOnce && flags.has("telegram_send")) {
  await sendTelegramFinalReview();
}

if (flags.has("telegram_poll")) {
  await pollTelegramCommands();
}

if (options.approve) {
  await updateFinalReview(options.approve, "approved", options.note ?? "Final package approved from CLI.");
}

if (options.request_changes) {
  await updateFinalReview(options.request_changes, "changes_requested", options.note ?? "Final package changes requested from CLI.");
}

if (options.remake) {
  await remakeFinalPackageForProject(options.remake, options.note ?? "Manual remake requested from CLI.");
}

if (flags.has("publish_approved")) {
  await publishApproved({
    execute: flags.has("execute"),
    platform: options.platform ?? "both",
    dailyLimit: Number(options.daily_limit ?? 3),
    itemSelector: options.item,
  });
}

if (hourlyOnce) {
  await applySourceReviewAutopilot();

  if (flags.has("refresh_sources")) {
    if (
      !(await stopForSourceReviewGate("hourly source refresh")) &&
      !(await stopForWorkflowBacklog("hourly source refresh"))
    ) {
      await refreshSourceInbox();
    }
  }
  if (!(await stopForWorkflowBacklog("hourly source review send"))) {
    await sendTelegramSourceReview();
  }
  {
    await planDraftRuns({ runCodex: flags.has("run_draft_codex") });
    if (flags.has("draft_review")) {
      await sendTelegramDraftReview();
    }
    await planFinalRuns({ runCodex: flags.has("run_codex") });
    await runNodeScript("tools/publish/build-publish-queue.mjs", [
      "--workspace-root",
      workspaceRoot,
      "--channel",
      channel,
      "--out",
      queuePath,
    ]);
    if (!flags.has("skip_queue_validation")) {
      await runNodeScript("tools/publish/validate-publish-queue.mjs", [
        "--queue",
        queuePath,
        "--out",
        resolvePath(options.validation_out, path.join(DEFAULT_WORKSPACE_ROOT, "publish-validation.json")),
      ]);
    }
    if (sourceOnlyAutopilot) {
      await approveReadyFinalsForSourceOnlyAutopilot();
    } else if (!flags.has("skip_final_review")) {
      await sendTelegramFinalReview();
    } else {
      printSummary("final review skipped", { reason: "skip_final_review flag" });
    }
  }
}

async function initFiles() {
  await mkdir(workspaceRoot, { recursive: true });
  if (!existsSync(inboxPath)) {
    await writeJson(inboxPath, sampleInboxV2());
  }
  if (!existsSync(reviewStatePath)) {
    await writeJson(reviewStatePath, emptyReviewState());
  }
  if (!existsSync(resolvePath(options.env, DEFAULT_ENV_FILE))) {
    await writeFile(resolvePath(options.env, DEFAULT_ENV_FILE), envTemplate(), "utf8");
  }
  printSummary("hermes automation initialized", {
    inbox: inboxPath,
    reviewState: reviewStatePath,
    env: resolvePath(options.env, DEFAULT_ENV_FILE),
  });
}

async function stopForSourceReviewGate(stepName) {
  const activeSources = await getActiveSourceReviewGateItems();
  if (!activeSources.length) return false;

  printSummary(`${stepName} skipped`, {
    reason: "waiting_for_source_approval",
    rule: "no new sources, drafts, final reviews, or questions until source review is cleared",
    activeSources: activeSources.map((item) => `${item.sourceId}:${item.status}`),
  });
  return true;
}

async function getActiveSourceReviewGateItems() {
  const state = await loadReviewState();
  return state.sources
    .filter((item) => SOURCE_REVIEW_GATE_STATUSES.has(item.status))
    .sort((a, b) => new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime());
}

function parseProjectDateFromSlug(projectSlug) {
  const match = String(projectSlug ?? "").match(/^(\d{4})-(\d{2})-(\d{2})-/);
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function finalReviewCutoffDate() {
  const days = Number(process.env.HERMES_FINAL_REVIEW_MAX_AGE_DAYS ?? 3);
  const safeDays = Number.isFinite(days) && days >= 0 ? days : 3;
  const cutoff = new Date();
  cutoff.setUTCHours(0, 0, 0, 0);
  cutoff.setUTCDate(cutoff.getUTCDate() - safeDays);
  return cutoff;
}

function pendingReviewCutoffDate() {
  const days = Number(process.env.HERMES_PENDING_REVIEW_MAX_AGE_DAYS ?? process.env.HERMES_FINAL_REVIEW_MAX_AGE_DAYS ?? 3);
  const safeDays = Number.isFinite(days) && days >= 0 ? days : 3;
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - safeDays);
  return cutoff;
}

function isFreshProjectForFinalReview(itemOrSlug) {
  const slug = typeof itemOrSlug === "string" ? itemOrSlug : itemOrSlug?.projectSlug;
  const projectDate = parseProjectDateFromSlug(slug);
  if (!projectDate) return true;
  return projectDate >= finalReviewCutoffDate();
}

function projectSourceKey(projectSlug) {
  return String(projectSlug ?? "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

function sourceKeyForItem(item) {
  return safeSlug(item?.id ?? item?.sourceId ?? item?.projectSlug ?? item?.contentKey ?? "");
}

function projectDateTime(item) {
  const slugDate = parseProjectDateFromSlug(item?.projectSlug);
  if (slugDate) return slugDate.getTime();
  const createdAt = new Date(item?.created_at ?? 0);
  return Number.isNaN(createdAt.getTime()) ? 0 : createdAt.getTime();
}

function selectLatestQueueItemsByProjectSource(items) {
  const latestBySource = new Map();
  for (const item of items) {
    const key = projectSourceKey(item.projectSlug) || item.contentKey || item.id;
    const previous = latestBySource.get(key);
    if (!previous || projectDateTime(item) >= projectDateTime(previous)) {
      latestBySource.set(key, item);
    }
  }
  return Array.from(latestBySource.values()).sort((a, b) => projectDateTime(b) - projectDateTime(a));
}

function reviewSendLimit(defaultLimit) {
  const configured = options.telegram_limit
    ?? process.env.HERMES_TELEGRAM_LIMIT
    ?? (hourlyOnce ? process.env.HERMES_HOURLY_REVIEW_LIMIT : undefined);
  return positiveInteger(configured, defaultLimit);
}

function workflowItemLimit(defaultLimit = Number.POSITIVE_INFINITY) {
  const configured = options.workflow_limit
    ?? process.env.HERMES_WORKFLOW_ITEM_LIMIT
    ?? (hourlyOnce ? process.env.HERMES_HOURLY_ITEM_LIMIT : undefined);
  return positiveInteger(configured, hourlyOnce ? 1 : defaultLimit);
}

function limitItems(items, limit) {
  if (!Number.isFinite(limit)) return items;
  return items.slice(0, Math.max(0, limit));
}

function reviewUpdatedAtMs(item) {
  const value = new Date(item?.updated_at ?? item?.created_at ?? 0).getTime();
  return Number.isFinite(value) ? value : 0;
}

function koreaDateKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function publishedTodayCount(state) {
  const today = koreaDateKey(new Date());
  return state.items.filter((item) => item.status === "published" && koreaDateKey(item.updated_at) === today).length;
}

async function stopForWorkflowBacklog(stepName) {
  const backlog = await getWorkflowBacklogItems();
  if (!backlog.length) return false;

  printSummary(`${stepName} skipped`, {
    reason: "review_or_content_backlog_active",
    rule: "finish the approved source/draft/final review before asking for new sources",
    activeItems: backlog.slice(0, 20).map((item) => `${item.stage}:${item.id}:${item.status}`),
  });
  return true;
}

async function getWorkflowBacklogItems() {
  const inbox = await readInbox();
  const state = await loadReviewState();
  const items = normalizeInboxItems(inbox);
  const draftMap = new Map(state.drafts.map((item) => [item.sourceId, item]));
  const finalSourceKeys = new Set(state.items.map((item) => projectSourceKey(item.projectSlug)));
  const finalMap = new Map(state.items.map((item) => [item.projectSlug, item]));
  const activeStatuses = new Set(["pending", "changes_requested"]);
  const backlog = [];

  for (const item of items) {
    const draftReview = draftMap.get(item.id);
    const hasFinalForSource = finalSourceKeys.has(sourceKeyForItem(item));
    if (isSourceApproved(item, state) && !isDraftApproved(item, state) && !hasFinalForSource) {
      backlog.push({
        stage: "draft-needed",
        id: item.id,
        status: draftReview?.status ?? "not_started",
      });
    }

    if (isFinalBuildAllowed(item, state) && !hasFinalForSource && isFreshProjectForFinalReview(item.projectSlug ?? item.id)) {
      const finalReview = finalMap.get(item.projectSlug ?? item.id);
      if (!["pending", "approved", "published", "changes_requested"].includes(finalReview?.status)) {
        backlog.push({
          stage: "final-needed",
          id: item.projectSlug ?? item.id,
          status: finalReview?.status ?? "not_started",
        });
      }
    }
  }

  for (const item of state.drafts.filter((item) => activeStatuses.has(item.status) && !finalSourceKeys.has(sourceKeyForItem(item)))) {
    backlog.push({ stage: "draft-review", id: item.sourceId, status: item.status });
  }
  for (const item of state.items.filter((item) => activeStatuses.has(item.status) && isFreshProjectForFinalReview(item))) {
    backlog.push({ stage: "final-review", id: item.projectSlug, status: item.status });
  }

  return backlog;
}

async function sendTelegramSourceReview() {
  const inbox = await readInbox();
  const state = await loadReviewState();
  const sourceMap = new Map(state.sources.map((item) => [item.sourceId, item]));
  const allItems = selectInboxItems(normalizeInboxItems(inbox), options.item);
  const pendingIds = new Set(state.sources
    .filter((item) => SOURCE_REVIEW_GATE_STATUSES.has(item.status))
    .map((item) => item.sourceId));
  const pendingCandidates = allItems
    .filter((item) => pendingIds.has(item.id))
    .sort((a, b) => Number(b.priority ?? 0) - Number(a.priority ?? 0));
  const freshCandidates = allItems
    .filter((item) => !pendingIds.has(item.id))
    .filter((item) => sourceNeedsReview(item, sourceMap.get(item.id)))
    .sort((a, b) => Number(b.priority ?? 0) - Number(a.priority ?? 0))
  const seen = new Set();
  const candidates = [...pendingCandidates, ...freshCandidates]
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, reviewSendLimit(6));

  if (!candidates.length) {
    printSummary("source review skipped", { reason: "no source candidates need review" });
    return;
  }

  for (const item of candidates) {
    await upsertSourceReview({
      sourceId: item.id,
      title: item.title,
      url: item.url,
      status: "pending",
      note: "Waiting for source approval.",
    });
  }

  const message = [
    "AI JJUN source review queue",
    "",
    "먼저 이 소스들로 만들지 검수해줘욤.",
    "통과: SOURCE OK <id>",
    "보류: SOURCE NO <id>: 이유",
    "",
    ...candidates.flatMap((item, index) => [
      `${index + 1}. ${item.id}`,
      `- 제목: ${item.title}`,
      `- 각도: ${item.angle ?? "(angle missing)"}`,
      `- 요약: ${item.summary ?? "(summary missing)"}`,
      `- 링크: ${item.url}`,
      `- 명령: SOURCE OK ${item.id}`,
      "",
    ]),
  ].join("\n");

  await sendTelegramMessage(buildSourceReviewMessageV8(candidates));
  printSummary("source review sent", { items: candidates.map((item) => item.id) });
}

async function applySourceReviewAutopilot() {
  if (!autopilotOnNoReview) return;
  if (!Number.isFinite(autopilotSourceReviewMinutes) || autopilotSourceReviewMinutes < 0) return;

  const state = await loadReviewState();
  const inbox = await readInbox();
  const sourceItems = new Map(normalizeInboxItems(inbox).map((item) => [item.id, item]));
  const cutoff = Date.now() - autopilotSourceReviewMinutes * 60 * 1000;
  const candidates = state.sources
    .filter((review) => review.status === "pending")
    .filter((review) => reviewUpdatedAtMs(review) <= cutoff)
    .map((review) => ({ review, item: sourceItems.get(review.sourceId) }))
    .filter(({ item }) => item)
    .sort((a, b) => {
      const priorityDiff = Number(b.item.priority ?? 0) - Number(a.item.priority ?? 0);
      if (priorityDiff) return priorityDiff;
      return reviewUpdatedAtMs(a.review) - reviewUpdatedAtMs(b.review);
    });

  const selected = limitItems(candidates, workflowItemLimit(1));
  if (!selected.length) return;

  for (const { review, item } of selected) {
    await updateSourceReview(
      review.sourceId,
      "approved",
      `Autopilot approved after ${autopilotSourceReviewMinutes} minutes without review. Priority ${item.priority ?? "n/a"}.`,
    );
  }

  await sendTelegramMessage([
    "AI JJUN 자동 진행",
    "",
    `${autopilotSourceReviewMinutes}분 동안 답장이 없어서, 우선순위가 제일 높은 소스 1개를 자동 승인했어욤.`,
    "이제 이 소스만 카드뉴스/릴스 제작으로 넘길게요.",
    "",
    ...selected.map(({ item }, index) => `${index + 1}. ${item.title}\n- id: ${item.id}\n- link: ${item.url}`),
  ].join("\n"));
  printSummary("source review autopilot approved", { items: selected.map(({ item }) => item.id) });
}

async function approveReadyFinalsForSourceOnlyAutopilot({
  ignoreDailyLimit = false,
  approvalNote = "Auto-approved by source-only Hermes flow after source review/autopilot.",
} = {}) {
  if (!sourceOnlyAutopilot) return;

  const queue = await readJsonIfExists(queuePath, null);
  if (!queue) {
    printSummary("source-only autopilot skipped", { reason: "queue not found" });
    return;
  }

  const state = await loadReviewState();
  const publishedToday = publishedTodayCount(state);
  const remainingDailySlots = ignoreDailyLimit
    ? Number.POSITIVE_INFINITY
    : Math.max(0, autopilotDailyPublishLimit - publishedToday);
  if (!ignoreDailyLimit && remainingDailySlots <= 0) {
    printSummary("source-only autopilot skipped", {
      reason: "daily publish limit reached",
      autopilotDailyPublishLimit,
      publishedToday,
    });
    return;
  }

  const validation = await validateQueue(queue);
  const finalMap = new Map(state.items.map((item) => [item.projectSlug, item]));
  const readyIds = new Set(validation.items.filter((item) => item.status === "ready").map((item) => item.id));
  const candidates = selectLatestQueueItemsByProjectSource(selectQueueItems(queue, options.item)
    .filter((item) => readyIds.has(item.id))
    .filter((item) => isFreshProjectForFinalReview(item))
    .filter((item) => {
      const status = finalMap.get(item.projectSlug)?.status;
      return !["approved", "published", "changes_requested", "rejected", "stale"].includes(status);
    }));
  const selected = limitItems(candidates, Math.min(workflowItemLimit(1), remainingDailySlots));

  if (!selected.length) {
    printSummary("source-only autopilot skipped", { reason: "no ready fresh final items" });
    return;
  }

  for (const item of selected) {
    await approveFinalReviewAndMaybePublish(
      item.projectSlug,
      approvalNote,
    );
  }

  printSummary("source-only autopilot published", {
    items: selected.map((item) => item.projectSlug),
    remainingDailySlots: Number.isFinite(remainingDailySlots) ? remainingDailySlots - selected.length : "ignored_for_direct_source",
  });
}

async function resendTelegramPendingReviewQueue() {
  const allPending = await getPendingTelegramReviewTargetsV3();
  const stageFilter = options.stage ?? "source";
  const pending = stageFilter === "all" ? allPending : allPending.filter((item) => item.stage === stageFilter);
  if (!pending.length) {
    await sendTelegramMessage("지금 처리 대기 중인 항목이 없어요. 먼저 소스/초안/최종 검수 메시지를 받아야 해욤.");
    printSummary("pending review resend skipped", { reason: "no pending review targets" });
    return;
  }

  const sortedPending = stageFilter === "source"
    ? [...pending].sort((a, b) => Number(b.priority ?? 0) - Number(a.priority ?? 0))
    : pending;
  const visibleLimit = reviewSendLimit(5);
  const visibleItems = sortedPending.slice(0, visibleLimit);
  const hiddenCount = Math.max(0, sortedPending.length - visibleItems.length);

  if (stageFilter === "source") {
    await sendTelegramMessage([
      buildSourceReviewMessageV8(visibleItems),
      hiddenCount ? `\n나머지 ${hiddenCount}개는 숨겨뒀어요. 더 보고 싶으면 --telegram-limit 10처럼 늘리면 돼욤.` : null,
    ].filter(Boolean).join("\n"));
    printSummary("pending source review queue resent", {
      stageFilter,
      visible: visibleItems.map((item) => `${item.stage}:${item.id}`),
      hiddenCount,
    });
    return;
  }

  const chunks = chunkItems(visibleItems, 5);
  for (let index = 0; index < chunks.length; index += 1) {
    const offset = index * 5;
    await sendTelegramMessage([
      `AI JJUN ${stageFilter === "all" ? "전체" : getTelegramStageLabelV3(stageFilter)} 검수 대기 큐 ${index + 1}/${chunks.length}`,
      "",
      index === 0
        ? "번호로 바로 골라줘도 되고, 링크 눌러보고 판단해도 돼욤."
        : "이어서 볼 후보들이에요.",
      "",
      "명령 예시:",
      "ㄱㄱ 2번 / 2번 ㄱㄱ",
      "대기 3번",
      "수정 4번: 첫 장 훅 더 세게",
      "ㄴㄴ 5번",
      "",
      ...formatPendingTelegramTargetsDetailedV4(chunks[index], offset),
      hiddenCount && index === chunks.length - 1
        ? `나머지 ${hiddenCount}개는 숨겨뒀어요. 많이 보고 싶으면 --telegram-limit 10처럼 늘리면 돼욤.`
        : null,
    ].join("\n"));
  }

  printSummary("pending review queue resent", {
    stageFilter,
    visible: visibleItems.map((item) => `${item.stage}:${item.id}`),
    hiddenCount,
  });
}

async function planDraftRuns({ runCodex = false } = {}) {
  const inbox = await readInbox();
  const state = await loadReviewState();
  const items = limitItems(selectInboxItems(normalizeInboxItems(inbox), options.item).filter((item) => {
    if (!isSourceApproved(item, state)) return false;
    return !isDraftApproved(item, state);
  }), workflowItemLimit());
  await mkdir(draftsDir, { recursive: true });
  await mkdir(runsDir, { recursive: true });

  const planned = [];
  for (const item of items) {
    const prompt = buildDraftPrompt(item);
    const draftItemDir = path.join(draftsDir, safeSlug(item.id));
    const runPath = path.join(runsDir, `${safeSlug(item.id)}.draft.prompt.md`);
    const psPath = path.join(runsDir, `${safeSlug(item.id)}.draft.run.ps1`);
    const lastMessagePath = path.join(runsDir, `${safeSlug(item.id)}.draft.last-message.md`);
    await mkdir(draftItemDir, { recursive: true });
    await writeFile(runPath, prompt, "utf8");
    await writeFile(psPath, buildPowerShellRunner(runPath, lastMessagePath), "utf8");
    planned.push({
      id: item.id,
      title: item.title,
      draftDir: draftItemDir,
      prompt: runPath,
      runner: psPath,
      lastMessage: lastMessagePath,
    });

    if (runCodex) {
      await runPowerShellScript(psPath);
    }
  }

  await writeJson(path.join(runsDir, "draft-plan.json"), {
    version: 1,
    generated_at: new Date().toISOString(),
    channel,
    runCodex,
    items: planned,
  });
  printSummary("draft run plan written", { runsDir, draftsDir, items: planned.length, runCodex });
}

async function sendTelegramDraftReview() {
  const inbox = await readInbox();
  const state = await loadReviewState();
  const draftMap = new Map(state.drafts.map((item) => [item.sourceId, item]));
  const items = selectInboxItems(normalizeInboxItems(inbox), options.item)
    .filter((item) => isSourceApproved(item, state))
    .filter((item) => !isDraftApproved(item, state))
    .filter((item) => !["pending", "changes_requested", "rejected"].includes(draftMap.get(item.id)?.status))
    .filter((item) => existsSync(path.join(draftsDir, safeSlug(item.id), "storyboard.md")))
    .slice(0, reviewSendLimit(5));

  if (!items.length) {
    printSummary("draft review skipped", { reason: "no generated drafts need review" });
    return;
  }

  for (const item of items) {
    await upsertDraftReview({
      sourceId: item.id,
      status: "pending",
      note: "Waiting for draft approval.",
    });
  }

  for (const item of items) {
    const draftDir = path.join(draftsDir, safeSlug(item.id));
    const storyboard = await safeRead(path.join(draftDir, "storyboard.md"));
    const caption = await safeRead(path.join(draftDir, "caption-draft.md"));
    const reel = await safeRead(path.join(draftDir, "reel-script.md"));
    const message = [
      "AI JJUN draft review",
      "",
      `id: ${item.id}`,
      `title: ${item.title}`,
      "",
      "[storyboard]",
      excerpt(storyboard, 1600),
      "",
      "[caption draft]",
      excerpt(caption, 700),
      "",
      "[reel script]",
      excerpt(reel, 700),
      "",
      `통과: DRAFT OK ${item.id}`,
      `수정: DRAFT REVISE ${item.id}: 수정사항`,
    ].join("\n");
    await sendTelegramMessage(buildDraftReviewMessageV3(item, storyboard, caption, reel));
  }

  printSummary("draft review sent", { items: items.map((item) => item.id) });
}

async function findExistingFinalPackageForSource(item, state) {
  const sourceKey = sourceKeyForItem(item);
  if (!sourceKey) return null;

  const stateMatch = state.items
    .filter((entry) => projectSourceKey(entry.projectSlug) === sourceKey)
    .sort((a, b) => projectDateTime(b) - projectDateTime(a))[0];
  if (stateMatch) {
    return {
      where: "review_state",
      projectSlug: stateMatch.projectSlug,
      status: stateMatch.status,
    };
  }

  const projectsRoot = path.join(workspaceRoot, "projects", channel);
  if (!existsSync(projectsRoot)) return null;

  const entries = await readdir(projectsRoot, { withFileTypes: true });
  const matchingSlugs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => projectSourceKey(slug) === sourceKey)
    .sort((a, b) => (parseProjectDateFromSlug(b)?.getTime() ?? 0) - (parseProjectDateFromSlug(a)?.getTime() ?? 0));

  if (!matchingSlugs.length) return null;
  return {
    where: "project_dir",
    projectSlug: matchingSlugs[0],
  };
}

async function planFinalRuns({ runCodex = false } = {}) {
  const inbox = await readInbox();
  const state = await loadReviewState();
  const items = limitItems(
    selectInboxItems(normalizeInboxItems(inbox), options.item).filter((item) => isFinalBuildAllowed(item, state)),
    workflowItemLimit(),
  );
  await mkdir(runsDir, { recursive: true });

  const planned = [];
  const skipped = [];
  for (const item of items) {
    if (!forceFinalBuild) {
      const existing = await findExistingFinalPackageForSource(item, state);
      if (existing) {
        skipped.push({
          id: item.id,
          reason: "final_package_already_exists_for_source",
          existing: existing.projectSlug,
          where: existing.where,
        });
        continue;
      }
    }

    const prompt = buildFinalPrompt(item);
    const runPath = path.join(runsDir, `${safeSlug(item.id)}.final.prompt.md`);
    const psPath = path.join(runsDir, `${safeSlug(item.id)}.final.run.ps1`);
    const lastMessagePath = path.join(runsDir, `${safeSlug(item.id)}.final.last-message.md`);
    await writeFile(runPath, prompt, "utf8");
    await writeFile(psPath, buildPowerShellRunner(runPath, lastMessagePath), "utf8");
    planned.push({
      id: item.id,
      title: item.title,
      sourceUrl: item.url,
      prompt: runPath,
      runner: psPath,
      lastMessage: lastMessagePath,
    });

    if (runCodex) {
      await runPowerShellScript(psPath);
    }
  }

  await writeJson(path.join(runsDir, "final-plan.json"), {
    version: 1,
    generated_at: new Date().toISOString(),
    channel,
    runCodex,
    items: planned,
    skipped,
  });
  printSummary("final codex run plan written", { runsDir, items: planned.length, skipped: skipped.length, runCodex });
}

async function refreshSourceInbox() {
  await mkdir(runsDir, { recursive: true });
  const promptPath = path.join(runsDir, "source-discovery.prompt.md");
  const lastMessagePath = path.join(runsDir, "source-discovery.last-message.md");

  await writeFile(promptPath, buildSourceDiscoveryPrompt(), "utf8");
  await runCodexExec(promptPath, lastMessagePath);

  printSummary("source inbox refresh requested", {
    prompt: promptPath,
    lastMessage: lastMessagePath,
    inbox: inboxPath,
  });
}

async function addManualSourceCandidate() {
  const { candidate, created } = await upsertManualSourceCandidate({
    url: options.add_source_url,
    title: options.title ?? options.source_title ?? options.add_source_url,
    id: options.id,
    summary: options.summary,
    angle: options.angle,
    bucket: options.bucket ?? "manual",
    priority: Number(options.priority ?? 10),
  });
  printSummary(created ? "manual source added" : "manual source skipped", {
    reason: created ? undefined : "duplicate",
    id: candidate.id,
    title: candidate.title,
    url: candidate.url,
    inbox: inboxPath,
  });
}

async function upsertManualSourceCandidate({
  url,
  title,
  id,
  summary,
  angle,
  bucket = "manual",
  priority = 10,
  status = "candidate",
  sourceLabel = "user-source",
  direct = false,
} = {}) {
  await mkdir(workspaceRoot, { recursive: true });
  const inbox = await readJsonIfExists(inboxPath, {
    version: 1,
    channel,
    generated_at: new Date().toISOString(),
    items: [],
  });
  const items = normalizeInboxItems(inbox);
  const cleanUrl = sanitizeSourceUrl(url);
  const cleanTitle = title || cleanUrl;
  const sourceId = id ?? `manual-${new Date().toISOString().slice(0, 10)}-${safeSlug(cleanTitle).slice(0, 42)}`;

  const duplicate = items.find((item) => item.id === sourceId || item.url === cleanUrl);
  if (duplicate) {
    return { candidate: duplicate, created: false };
  }

  const candidate = {
    id: sourceId,
    status,
    priority: Number(priority),
    bucket,
    title: cleanTitle,
    url: cleanUrl,
    summary: summary ?? "User-provided source. Verify the original source and related proof before content production.",
    angle: angle ?? "Turn this into an AI JJUN source candidate only after checking why viewers should care now.",
    sources: [
      {
        label: sourceLabel,
        url: cleanUrl,
        summary: "Source URL manually provided by the user.",
      },
    ],
    notes: [
      "Before drafting, verify the primary source, official docs/repo, social proof, demo media, pricing/license, and practical limitation.",
      direct
        ? "This was sent directly by the user in Telegram. Bypass source scouting review and produce the package immediately."
        : "If approved, produce card-news, Reel, and caption through the normal Telegram review pipeline.",
    ],
  };

  const nextInbox = Array.isArray(inbox)
    ? [candidate, ...items]
    : {
        ...inbox,
        version: inbox.version ?? 1,
        channel: inbox.channel ?? channel,
        generated_at: new Date().toISOString(),
        items: [candidate, ...items],
      };

  await writeJson(inboxPath, nextInbox);
  return { candidate, created: true };
}

function sanitizeSourceUrl(url) {
  return String(url ?? "").trim().replace(/[)\].,，。!?]+$/g, "");
}

function buildSourceDiscoveryPrompt() {
  const inboxRel = path.relative(cwd, inboxPath).replaceAll("\\", "/");
  const stateRel = path.relative(cwd, reviewStatePath).replaceAll("\\", "/");
  return [
    "You are Hermes, the AI JJUN source scout for Korean AI trend content.",
    "AI JJUN is not a generic AI news account. It must beat accounts like ai.trend.kr, ai_freaks.kr, and choi.openai by finding minor-but-useful, hands-on AI sources that Korean viewers can understand and try.",
    "",
    "Task:",
    `- Refresh ${inboxRel} with high-signal source candidates for AI JJUN.`,
    `- Read ${inboxRel} and ${stateRel} first if they exist.`,
    "- Preserve pending, approved, draft-approved, final-approved, or published items. Do not wipe work in progress.",
    "- You may replace stale candidate-only items when you find stronger candidates.",
    "",
    "Discovery targets:",
    "- Scan GeekNews/Hacker News-style Korean tech curations, X, Threads, Reddit, GitHub Trending, fresh GitHub repos, official changelogs/blogs, docs, demos, and creator posts.",
    "- Aim for diversity: GeekNews/HN-like, Threads/creator-social, X, GitHub/open-source, official docs/blogs, Reddit/community reactions.",
    "- Quality beats quota. Do not force 2 items from every bucket if the items are weak.",
    "- Start with a shortlist of 12-20 possible sources, then write only the top 6-8 high-confidence candidates to the inbox.",
    "- Rank ruthlessly. In hourly automation, 5-6 candidates are shown to the user for selection, but only one source should move into production per cycle unless the user directly sends a source URL.",
    "- If the user does not review in time, the automation may auto-produce the highest-ranked pending source and archive the rest of that candidate batch.",
    "- Priority scale: use 10 for the strongest candidate and 1 for the weakest. The automation sends higher numbers first and may auto-produce the highest-ranked item if the user does not review in time.",
    "",
    "Platform scouting playbook:",
    "- GeekNews/news.hada.io: Use GeekNews as a Korean hype signal, not as the final proof. Open the original linked source, read comments when available, and prefer tools with clear install/demo/action. Reject items that are only interesting summaries with no viewer action.",
    "- GitHub repositories: Check stars, recent star velocity when visible, latest commits/releases, README demo images/GIFs, install path, license, issues/activity, and whether a Korean viewer can understand the use case in one sentence. Prefer minor-but-useful repos over already-saturated mega repos unless there is a fresh angle.",
    "- Threads: Treat Korean creator/practitioner posts as trend radar. Do not copy their wording. Trace every claim back to original repo/docs/blog/paper. Prefer posts with screenshots, demos, concrete workflow, or strong comment reactions.",
    "- X/Twitter: Prioritize official accounts, maintainers, researchers, product leads, and high-signal builders. Use views/likes/reposts as hype only, then verify with source-of-truth links. Avoid vague viral takes without a primary source.",
    "- Reddit/community/HN comments: Use these for pain points, gotchas, backlash, and real user language. Verify facts separately. Good Reddit finds usually expose a problem normal official blogs hide.",
    "- Official blogs/docs/changelogs: Use them as proof and date verification. They become candidates only when there is a hands-on workflow, a visual demo, Korean market impact, or a direct 'try this today' angle.",
    "",
    "Source mix discipline:",
    "- Each refresh should try to include at least 3 different platform families among GeekNews/HN-like, GitHub/open-source, Threads/X social, Reddit/community, and official docs/blogs, if quality allows.",
    "- No more than 2 official-only candidates. Official sources should usually support a stronger social/GitHub/community signal.",
    "- Prefer the triangle: hype source + source-of-truth + visual/demo source.",
    "- If a candidate has no obvious first-card visual within 30 minutes, downgrade it even if the topic is important.",
    "",
    "Hard quality gate. Reject a candidate unless it has at least 4 of these 6 signals:",
    "1. Hype signal: fresh social traction, GeekNews comments, GitHub stars/trending, Reddit discussion, creator buzz, or official launch within the last 30 days.",
    "2. Source-of-truth proof: official docs, repo, changelog, release notes, paper, pricing page, demo page, or maintainer statement.",
    "3. Visual/demo proof: screenshots, demo video, product UI, repo README media, before/after, or a concrete scene that can become card 1 or a Reel hook.",
    "4. Practical payoff: viewers can try, install, check, copy, save, or apply it today.",
    "5. Korean viewer fit: useful for Korean developers, creators, marketers, founders, students, companies, or AX consulting clients.",
    "6. Non-obvious angle: more specific than a broad model-release summary or official announcement recap.",
    "",
    "Reject these even if they are famous:",
    "- Official blog posts with no hands-on use case.",
    "- Generic model benchmark/ranking posts with no viewer action.",
    "- Pure infrastructure repos where the hook is only 'new framework'.",
    "- Topics that need too much background before a normal viewer understands why it matters.",
    "- Sources with no credible proof, no visual asset, or no practical next step.",
    "- Repeated themes already used recently unless there is a fresh twist.",
    "- Social reposts that only translate someone else's thread without original proof.",
    "- GitHub repos that are trending but have no clear viewer payoff, demo, or install path.",
    "- GeekNews posts where the original link is weak, inaccessible, or not actionable.",
    "- Topics that are useful only to deep infrastructure engineers unless you can frame a simple business/AX lesson.",
    "",
    "Prioritize these angles:",
    "- AI coding agent security, cost, memory, browser control, repo rules, MCP, skills, workflow automation.",
    "- Creator/marketer tools with visible before-after: images, video, design, voice, ads, SEO/GEO, spreadsheets, presentations.",
    "- Business/AX consulting hooks: 'how a company can use this', 'what to audit', 'what template/checklist to sell'.",
    "- Korean-localized utility: Korean docs, Hangul/HWP, Korean search, Korean business workflows, Korean creator pain points.",
    "- Open-source tools with real traction and a clear one-line use case.",
    "",
    "For every written candidate, include:",
    "- viewerHook: a first-card/reel hook a non-expert can understand in 2 seconds.",
    "- whyNow: why it matters this week/month.",
    "- whoShouldCare: the exact viewer segment.",
    "- whatToTryToday: one concrete action viewers can do today.",
    "- reelFirst3Seconds: the visual opening idea for a Reel.",
    "- visualAssetsToCollect: concrete assets to fetch or generate.",
    "- proofSignals: concrete evidence such as stars, comments, views, dates, releases, source links, or maintainer names.",
    "- scores from 1 to 5 for hype, utility, visual, novelty, aiJjunFit, axConsulting, confidence.",
    "",
    "Important:",
    "- Do not return official blog posts only. Official sources are proof, not the whole list.",
    "- Pair every social/hype signal with source-of-truth proof: official docs, repo, changelog, paper, release notes, pricing, or demo.",
    "- Use natural Korean for title, summary, angle, and hooks. Avoid translated-English phrasing.",
    "- Keep the tone easy, useful, and slightly playful, but do not overdo slang.",
    "- Do not create card-news, reels, images, captions, or uploads in this step.",
    "",
    "Write only valid JSON to the inbox file. Use this shape:",
    "{",
    '  "version": 1,',
    `  "channel": "${channel}",`,
    '  "generated_at": "<ISO timestamp>",',
    '  "rule": "ai_jjun_source_quality_v2",',
    '  "items": [',
    "    {",
    '      "id": "short-safe-id",',
    '      "status": "candidate",',
    '      "priority": 10,',
    '      "bucket": "GeekNews | Threads | X | GitHub",',
    '      "title": "short content title",',
    '      "url": "primary hype/source URL",',
    '      "summary": "one-line factual summary",',
    '      "angle": "why AI JJUN viewers should care, in natural Korean",',
    '      "viewerHook": "first-card hook in natural Korean",',
    '      "whyNow": "why this should be covered now",',
    '      "whoShouldCare": "exact target viewer",',
    '      "whatToTryToday": "one concrete action viewers can try today",',
    '      "reelFirst3Seconds": "visual opening scene for Reel",',
    '      "visualAssetsToCollect": ["asset 1", "asset 2"],',
    '      "proofSignals": ["specific hype/proof signal 1", "specific proof signal 2"],',
    '      "scores": {',
    '        "hype": 1,',
    '        "utility": 1,',
    '        "visual": 1,',
    '        "novelty": 1,',
    '        "aiJjunFit": 1,',
    '        "axConsulting": 1,',
    '        "confidence": 1',
    "      },",
    '      "sources": [',
    '        {"label": "hype", "url": "https://...", "summary": "what this proves"},',
    '        {"label": "source-of-truth", "url": "https://...", "summary": "what this verifies"}',
    "      ],",
    '      "notes": ["risk/limitation to avoid overstating", "why this passed the quality gate"]',
    "    }",
    "  ]",
    "}",
    "",
    "Final response:",
    "- Briefly report how many candidates were written and where.",
  ].join("\n");
}

async function sendTelegramFinalReview() {
  const queue = await readJsonIfExists(queuePath, null);
  if (!queue) throw new Error(`Queue not found: ${queuePath}. Run --build-queue first.`);
  const validation = await validateQueue(queue);
  const state = await loadReviewState();
  const finalMap = new Map(state.items.map((item) => [item.projectSlug, item]));
  const readyIds = new Set(validation.items.filter((item) => item.status === "ready").map((item) => item.id));
  const messageCandidates = selectQueueItems(queue, options.item)
    .filter((item) => readyIds.has(item.id))
    .filter((item) => isFreshProjectForFinalReview(item))
    .filter((item) => !["pending", "approved", "published", "changes_requested"].includes(finalMap.get(item.projectSlug)?.status));
  const messageItems = selectLatestQueueItemsByProjectSource(messageCandidates)
    .slice(0, reviewSendLimit(8));

  if (!messageItems.length) {
    printSummary("final review skipped", { reason: "no pending ready items" });
    return;
  }

  for (const item of messageItems) {
    await upsertFinalReview({
      projectSlug: item.projectSlug,
      itemId: item.id,
      contentKey: item.contentKey,
      status: "pending",
      note: "Waiting for final upload approval.",
    });
  }

  const message = [
    "AI JJUN final package review",
    "",
    "최종 산출물 검수 대기 목록이에욤.",
    "업로드 승인: UPLOAD <project-slug>",
    "수정 요청: REVISE <project-slug>: 수정사항",
    "",
    ...messageItems.flatMap((item, index) => {
      const firstSource = item.sourceLinks[0] ?? "source link missing";
      const captionPreview = item.captions.instagram.split(/\n+/).find(Boolean) ?? "";
      return [
        `${index + 1}. ${item.projectSlug}`,
        `- cards: ${item.assets.cards.length}, reel: ${item.assets.reel ? "yes" : "no"}`,
        `- caption: ${captionPreview.slice(0, 100)}`,
        `- source: ${firstSource}`,
        `- upload: UPLOAD ${item.projectSlug}`,
        `- revise: REVISE ${item.projectSlug}: 수정사항`,
        "",
      ];
    }),
  ].join("\n");

  await sendTelegramMessage(buildFinalReviewMessageV4(messageItems));
  await sendTelegramFinalPreviewFiles(messageItems);
  printSummary("final review sent", { items: messageItems.map((item) => item.projectSlug) });
}

function buildSourceReviewMessage(candidates) {
  return [
    "AI JJUN source review queue",
    "",
    "먼저 이 소스로 콘텐츠를 만들지 검수해줘요.",
    "승인: SOURCE OK <id>",
    "보류: SOURCE NO <id>: 이유",
    "",
    ...candidates.flatMap((item, index) => [
      `${index + 1}. ${item.id}`,
      `- 제목: ${item.title}`,
      `- 각도: ${item.angle ?? "(angle missing)"}`,
      `- 요약: ${item.summary ?? "(summary missing)"}`,
      `- 링크: ${item.url}`,
      `- 명령: SOURCE OK ${item.id}`,
      "",
    ]),
  ].join("\n");
}

function buildDraftReviewMessage(item, storyboard, caption, reel) {
  return [
    "AI JJUN draft review",
    "",
    `id: ${item.id}`,
    `title: ${item.title}`,
    "",
    "[storyboard]",
    excerpt(storyboard, 1600),
    "",
    "[caption draft]",
    excerpt(caption, 700),
    "",
    "[reel script]",
    excerpt(reel, 700),
    "",
    `승인: DRAFT OK ${item.id}`,
    `수정: DRAFT REVISE ${item.id}: 수정사항`,
  ].join("\n");
}

function buildFinalReviewMessage(messageItems) {
  return [
    "AI JJUN final package review",
    "",
    "최종 산출물 검수 대기 목록이에요.",
    "업로드 승인: UPLOAD <project-slug>",
    "수정 요청: REVISE <project-slug>: 수정사항",
    "",
    ...messageItems.flatMap((item, index) => {
      const firstSource = item.sourceLinks[0] ?? "source link missing";
      const captionPreview = item.captions.instagram.split(/\n+/).find(Boolean) ?? "";
      return [
        `${index + 1}. ${item.projectSlug}`,
        `- cards: ${item.assets.cards.length}, reel: ${item.assets.reel ? "yes" : "no"}`,
        `- caption: ${captionPreview.slice(0, 100)}`,
        `- source: ${firstSource}`,
        `- upload: UPLOAD ${item.projectSlug}`,
        `- revise: REVISE ${item.projectSlug}: 수정사항`,
        "",
      ];
    }),
  ].join("\n");
}

function buildSourceReviewMessageV3(candidates) {
  return [
    "AI JJUN source review queue",
    "",
    "먼저 이 소스로 콘텐츠를 만들지 검수해줘요.",
    "승인: SOURCE OK <id>",
    "보류: SOURCE NO <id>: 이유",
    "",
    ...candidates.flatMap((item, index) => [
      `${index + 1}. ${item.id}`,
      `- 제목: ${item.title}`,
      `- 각도: ${item.angle ?? "(angle missing)"}`,
      `- 요약: ${item.summary ?? "(summary missing)"}`,
      `- 링크: ${item.url}`,
      `- 명령: SOURCE OK ${item.id}`,
      "",
    ]),
  ].join("\n");
}

function buildSourceReviewMessageV2(candidates) {
  return [
    "AI JJUN source review queue",
    "",
    "먼저 이 소스로 콘텐츠를 만들지 검수해주세욤.",
    "승인: SOURCE OK <id>",
    "보류: SOURCE NO <id>: 이유",
    "",
    ...candidates.flatMap((item, index) => [
      `${index + 1}. ${item.id}`,
      `- 제목: ${item.title}`,
      `- 분류: ${item.bucket ?? item.source_type ?? "(bucket missing)"}`,
      `- 각도: ${item.angle ?? "(angle missing)"}`,
      `- 요약: ${item.summary ?? "(summary missing)"}`,
      `- 링크: ${item.url}`,
      `- 명령: SOURCE OK ${item.id}`,
      "",
    ]),
  ].join("\n");
}

function buildDraftReviewMessageV2(item, storyboard, caption, reel) {
  return [
    "AI JJUN draft review",
    "",
    `id: ${item.id}`,
    `title: ${item.title}`,
    "",
    "[storyboard]",
    excerpt(storyboard, 1600),
    "",
    "[caption draft]",
    excerpt(caption, 700),
    "",
    "[reel script]",
    excerpt(reel, 700),
    "",
    `승인: DRAFT OK ${item.id}`,
    `수정: DRAFT REVISE ${item.id}: 수정사항`,
  ].join("\n");
}

function buildFinalReviewMessageV2(messageItems) {
  return [
    "AI JJUN final package review",
    "",
    "최종 산출물 검수 대기 목록이에요.",
    "업로드 승인: UPLOAD <project-slug>",
    "수정 요청: REVISE <project-slug>: 수정사항",
    "",
    ...messageItems.flatMap((item, index) => {
      const firstSource = item.sourceLinks[0] ?? "source link missing";
      const captionPreview = item.captions.instagram.split(/\n+/).find(Boolean) ?? "";
      return [
        `${index + 1}. ${item.projectSlug}`,
        `- cards: ${item.assets.cards.length}, reel: ${item.assets.reel ? "yes" : "no"}`,
        `- caption: ${captionPreview.slice(0, 100)}`,
        `- source: ${firstSource}`,
        `- upload: UPLOAD ${item.projectSlug}`,
        `- revise: REVISE ${item.projectSlug}: 수정사항`,
        "",
      ];
    }),
  ].join("\n");
}

function buildSourceReviewMessageV5(candidates) {
  return [
    "AI JJUN 소스 검수 큐",
    "",
    "먼저 어떤 소스로 콘텐츠 만들지 골라줘욤.",
    "",
    "짧은 명령:",
    "- 승인: ㄱㄱ 1번",
    "- 보류: 대기 1번",
    "- 수정: 수정 1번: 첫 장 훅 더 세게",
    "- 별로면 다시 찾기: ㄴㄴ 1번",
    "",
    "id로도 가능하지만, 번호로 보내는 게 제일 편해욤.",
    "",
    ...candidates.flatMap((item, index) => [
      `${index + 1}. [소스] ${item.id}`,
      `- 제목: ${item.title}`,
      `- 각도: ${item.angle ?? "(angle missing)"}`,
      `- 요약: ${item.summary ?? "(summary missing)"}`,
      `- 링크: ${item.url}`,
      `- 승인 예시: ㄱㄱ ${index + 1}번`,
      `- 수정 예시: 수정 ${index + 1}번: 더 실사용 예시 중심으로`,
      "",
    ]),
  ].join("\n");
}

function buildSourceReviewMessageV6(candidates) {
  return [
    "AI JJUN 소스 검수 큐",
    "",
    "이번엔 그냥 뉴스가 아니라, 진짜 콘텐츠로 만들 만한 소스인지 봐주세욤.",
    "번호만 보내도 돼요.",
    "",
    "명령 예시:",
    "- 승인: ㄱㄱ 1번",
    "- 보류: 대기 1번",
    "- 수정: 수정 1번: 첫 장 훅 더 세게",
    "- 별로면 다시 찾기: ㄴㄴ 1번",
    "",
    ...candidates.flatMap((item, index) => formatSourceCandidateForTelegramV6(item, index + 1)),
  ].join("\n");
}

function buildSourceReviewMessageV7(candidates) {
  const top = candidates.slice(0, 3);
  const extra = candidates.slice(3);
  const recommended = top[0] ?? candidates[0];

  return [
    "AI쭌 소스 후보",
    "",
    "너무 긴 설명 빼고, 콘텐츠로 만들 만한 것만 짧게 정리했어욤.",
    "",
    "TOP",
    ...top.flatMap((item, index) => formatSourceCandidateCompactV7(item, index + 1)),
    extra.length ? "추가" : null,
    ...extra.flatMap((item, index) => formatSourceCandidateCompactV7(item, top.length + index + 1)),
    recommended ? `바로 만들기 추천: 1번, ${truncateForTelegram(recommended.viewerHook ?? recommended.angle ?? recommended.summary ?? recommended.title, 70)}` : null,
    "",
    "명령:",
    "ㄱㄱ 1번 = 이걸로 제작",
    "대기 1번 = 보류",
    "수정 1번: 첫 장 훅 더 세게",
    "ㄴㄴ 1번 = 별로니까 다시 찾기",
  ].filter(Boolean).join("\n");
}

function formatSourceCandidateCompactV7(item, index) {
  const primaryLink = item.url || firstSourceUrl(item);
  const title = truncateForTelegram(item.title ?? item.id, 55);
  const summary = truncateForTelegram(item.summary ?? item.viewerHook ?? item.angle ?? "", 86);
  const angle = truncateForTelegram(item.angle ?? item.whatToTryToday ?? item.viewerHook ?? "", 86);
  const link = primaryLink ? `링크: ${primaryLink}` : "링크: 확인 필요";

  return [
    `${index}) ${title}`,
    summary ? `- 요약: ${summary}` : null,
    angle ? `- 각도: ${angle}` : null,
    `- ${link}`,
    "",
  ].filter(Boolean);
}

function buildSourceReviewMessageV8(candidates) {
  const recommended = candidates[0];
  return [
    "AI쭌 소스 후보 큐",
    "",
    "이번엔 바로 콘텐츠로 만들 만한 후보만 추렸어욤.",
    "하나 골라주면 그 소스로 카드뉴스+릴스 제작으로 넘어갑니다.",
    "",
    "명령 예시:",
    "- 승인: ㄱㄱ 1번",
    "- 보류: 대기 1번",
    "- 수정: 수정 1번: 첫 장 훅 더 세게",
    "- 별로면 다시 찾기: ㄴㄴ 1번",
    "- 직접 링크 제작: 그냥 URL 보내기",
    "",
    ...candidates.flatMap((item, index) => formatSourceCandidateCompactV8(item, index + 1)),
    recommended ? `추천 1픽: ${truncateForTelegramV8(recommended.title ?? recommended.id, 72)}` : null,
    "",
    "대기 시간이 지나면 1픽만 자동 제작하고 나머지는 보관 처리해요.",
  ].filter(Boolean).join("\n");
}

function formatSourceCandidateCompactV8(item, index) {
  const primaryLink = item.url || firstSourceUrl(item);
  const title = truncateForTelegramV8(item.title ?? item.id, 70);
  const hook = truncateForTelegramV8(item.viewerHook ?? item.angle ?? "", 92);
  const summary = truncateForTelegramV8(item.summary ?? "", 105);
  const why = truncateForTelegramV8(item.whyNow ?? item.whatToTryToday ?? item.whoShouldCare ?? "", 92);
  const link = primaryLink ? `링크: ${primaryLink}` : "링크: 확인 필요";

  return [
    `${index}. ${title}`,
    item.bucket ? `- 분류: ${item.bucket}${item.priority ? ` / 우선순위 ${item.priority}` : ""}` : null,
    hook ? `- 첫 장 훅: ${hook}` : null,
    summary ? `- 요약: ${summary}` : null,
    why ? `- 왜 좋음: ${why}` : null,
    `- ${link}`,
    `- 명령: ㄱㄱ ${index}번 / 대기 ${index}번 / 수정 ${index}번: ... / ㄴㄴ ${index}번`,
    "",
  ].filter(Boolean);
}

function truncateForTelegramV8(value, limit) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, Math.max(0, limit - 1))}…`;
}

function firstSourceUrl(item) {
  return (Array.isArray(item.sources) ? item.sources : []).find((source) => source?.url)?.url;
}

function formatSourceCandidateForTelegramV6(item, index) {
  const sources = (Array.isArray(item.sources) ? item.sources : [])
    .filter((source) => source?.url)
    .slice(0, 3)
    .map((source) => `   - ${source.label ?? "source"}: ${source.url}`);
  const assets = Array.isArray(item.visualAssetsToCollect)
    ? item.visualAssetsToCollect.slice(0, 3).join(" / ")
    : item.visualAssetsToCollect;
  const proofSignals = Array.isArray(item.proofSignals)
    ? item.proofSignals.slice(0, 3).join(" / ")
    : item.proofSignals;

  return [
    `${index}. [소스] ${item.id}`,
    `제목: ${truncateForTelegram(item.title, 80)}`,
    item.bucket ? `분류: ${item.bucket}${item.priority ? ` / 우선순위 ${item.priority}` : ""}` : null,
    item.viewerHook ? `첫 장 훅: ${truncateForTelegram(item.viewerHook, 110)}` : null,
    item.angle ? `각도: ${truncateForTelegram(item.angle, 150)}` : null,
    item.summary ? `요약: ${truncateForTelegram(item.summary, 160)}` : null,
    item.whyNow ? `왜 지금: ${truncateForTelegram(item.whyNow, 120)}` : null,
    item.whoShouldCare ? `누가 봐야 함: ${truncateForTelegram(item.whoShouldCare, 100)}` : null,
    item.whatToTryToday ? `오늘 해볼 것: ${truncateForTelegram(item.whatToTryToday, 120)}` : null,
    item.reelFirst3Seconds ? `릴스 첫 3초: ${truncateForTelegram(item.reelFirst3Seconds, 120)}` : null,
    assets ? `이미지/영상 후보: ${truncateForTelegram(assets, 140)}` : null,
    proofSignals ? `하입/검증 신호: ${truncateForTelegram(proofSignals, 140)}` : null,
    formatScoresForTelegramV6(item.scores),
    item.url ? `직접 링크: ${item.url}` : null,
    sources.length ? ["보조 링크:", ...sources].join("\n") : null,
    `명령: ㄱㄱ ${index}번 / 대기 ${index}번 / 수정 ${index}번: ... / ㄴㄴ ${index}번`,
    "",
  ].filter(Boolean);
}

function formatScoresForTelegramV6(scores) {
  if (!scores || typeof scores !== "object") return null;
  const fields = [
    ["hype", "하입"],
    ["utility", "실용"],
    ["visual", "시각"],
    ["novelty", "새로움"],
    ["aiJjunFit", "AI쭌"],
    ["axConsulting", "AX"],
    ["confidence", "확신"],
  ];
  const scoreText = fields
    .filter(([key]) => scores[key] !== undefined && scores[key] !== null)
    .map(([key, label]) => `${label} ${scores[key]}/5`)
    .join(" · ");
  return scoreText ? `점수: ${scoreText}` : null;
}

function buildSourceReviewMessageV4(candidates) {
  return [
    "AI JJUN source review queue",
    "",
    "먼저 어떤 소스로 콘텐츠 만들지 골라줘욤.",
    "",
    "명령어",
    "- 승인: ㄱㄱ <id>",
    "- 보류: 대기 <id>",
    "- 수정: 수정 <id>: 수정할 점",
    "- 별로임/다시 찾아와: ㄴㄴ <id>",
    "",
    "대기 중인 게 딱 1개면 id 없이 ㄱㄱ / 대기 / 수정 ... / ㄴㄴ 만 보내도 돼요.",
    "",
    ...candidates.flatMap((item, index) => [
      `${index + 1}. ${item.id}`,
      `- 제목: ${item.title}`,
      `- 각도: ${item.angle ?? "(angle missing)"}`,
      `- 요약: ${item.summary ?? "(summary missing)"}`,
      `- 링크: ${item.url}`,
      `- 승인 예시: ㄱㄱ ${item.id}`,
      `- 별로면: ㄴㄴ ${item.id}`,
      "",
    ]),
  ].join("\n");
}

function buildDraftReviewMessageV3(item, storyboard, caption, reel) {
  return [
    "AI JJUN draft review",
    "",
    `id: ${item.id}`,
    `title: ${item.title}`,
    "",
    "[storyboard]",
    excerpt(storyboard, 1600),
    "",
    "[caption draft]",
    excerpt(caption, 700),
    "",
    "[reel script]",
    excerpt(reel, 700),
    "",
    "명령어",
    `- 승인: ㄱㄱ ${item.id}`,
    `- 보류: 대기 ${item.id}`,
    `- 수정: 수정 ${item.id}: 수정할 점`,
    `- 별로임/다시 짜와: ㄴㄴ ${item.id}`,
  ].join("\n");
}

function buildFinalReviewMessageV3(messageItems) {
  return [
    "AI JJUN final package review",
    "",
    "최종 산출물 업로드 전 검수 목록이에요.",
    "",
    "명령어",
    "- 승인/업로드 허가: ㄱㄱ <project-slug>",
    "- 보류: 대기 <project-slug>",
    "- 수정: 수정 <project-slug>: 수정할 점",
    "- 별로임/다시 만들어: ㄴㄴ <project-slug>",
    "",
    "대기 중인 게 딱 1개면 id 없이 ㄱㄱ / 대기 / 수정 ... / ㄴㄴ 만 보내도 돼요.",
    "",
    ...messageItems.flatMap((item, index) => {
      const firstSource = item.sourceLinks[0] ?? "source link missing";
      const captionPreview = item.captions.instagram.split(/\n+/).find(Boolean) ?? "";
      return [
        `${index + 1}. ${item.projectSlug}`,
        `- cards: ${item.assets.cards.length}, reel: ${item.assets.reel ? "yes" : "no"}`,
        `- caption: ${captionPreview.slice(0, 100)}`,
        `- source: ${firstSource}`,
        `- 승인 예시: ㄱㄱ ${item.projectSlug}`,
        `- 수정 예시: 수정 ${item.projectSlug}: 첫 장 훅 더 세게`,
        "",
      ];
    }),
  ].join("\n");
}

function buildFinalReviewMessageV4(messageItems) {
  return [
    "AI JJUN 최종 검수 큐",
    "",
    "긴 기획안 말고, 실제 결과물 보고 판단하면 돼욤.",
    "아래에 카드뉴스 미리보기 이미지랑 릴스 영상도 같이 보낼게요.",
    "",
    "명령어",
    "- 승인/업로드 대기: ㄱㄱ <번호 또는 slug>",
    "- 보류: 대기 <번호 또는 slug>",
    "- 수정: 수정 <번호 또는 slug>: 수정할 점",
    "- 별로면 다시 만들기: ㄴㄴ <번호 또는 slug>",
    "",
    "대기 중인 게 1개면 그냥 ㄱㄱ / 대기 / 수정 ... / ㄴㄴ 만 보내도 알아듣게 만들었어요.",
    "",
    ...messageItems.flatMap((item, index) => {
      const firstSource = item.sourceLinks[0] ?? "source link missing";
      const captionPreview = item.captions.instagram.split(/\n+/).find(Boolean) ?? "";
      return [
        `${index + 1}. ${item.projectSlug}`,
        `- 구성: 카드 ${item.assets.cards.length}장 / 릴스 ${item.assets.reel ? "있음" : "없음"}`,
        `- 캡션 첫 줄: ${captionPreview.slice(0, 100)}`,
        `- 출처: ${firstSource}`,
        `- 승인 예시: ㄱㄱ ${index + 1}번`,
        `- 수정 예시: 수정 ${index + 1}번: 첫 장 훅 더 세게`,
        "",
      ];
    }),
  ].join("\n");
}

async function sendTelegramFinalPreviewFiles(messageItems) {
  for (const item of messageItems) {
    const outputDir = path.join(item.projectPath, "output");
    const contactSheet = path.join(outputDir, "contact-sheet.png");
    const thumbnailSheet = path.join(outputDir, "thumbnail-sheet.png");
    const reel = item.assets.reel ?? firstExistingPath([path.join(outputDir, "reel.mp4"), path.join(outputDir, "reel-preview.mp4")]);

    const commandHint = `검수: ㄱㄱ ${item.projectSlug}\n수정: 수정 ${item.projectSlug}: 수정할 점`;
    if (existsSync(contactSheet)) {
      await sendTelegramPhoto(contactSheet, `카드뉴스 미리보기\n${item.projectSlug}\n\n${commandHint}`);
    }
    if (existsSync(thumbnailSheet)) {
      await sendTelegramPhoto(thumbnailSheet, `1:1 썸네일 미리보기\n${item.projectSlug}`);
    }
    if (reel && existsSync(reel)) {
      await sendTelegramVideo(reel, `릴스 미리보기\n${item.projectSlug}\n\n${commandHint}`);
    }
  }
}

async function remakeFinalPackageForProject(projectSlug, note = "") {
  const sourceId = await resolveSourceIdForProjectSlug(projectSlug);
  if (!sourceId) {
    await sendTelegramMessage(`다시 만들 소스를 못 찾았어욤: ${projectSlug}`);
    return;
  }

  await sendTelegramMessage([
    "다시 만들기 시작할게욤.",
    `대상: ${projectSlug}`,
    `소스: ${sourceId}`,
    note ? `요청: ${note}` : null,
    "",
    "카드뉴스/릴스/캡션을 다시 뽑고, 끝나면 미리보기까지 다시 보낼게요.",
  ].filter(Boolean).join("\n"));

  const previousItem = options.item;
  try {
    options.item = sourceId;
    await planFinalRuns({ runCodex: true });

    await runNodeScript("tools/publish/build-publish-queue.mjs", [
      "--workspace-root",
      workspaceRoot,
      "--channel",
      channel,
      "--out",
      queuePath,
    ]);

    await updateFinalReview(projectSlug, "ready_for_review", note || "Regenerated from Telegram request.");
    options.item = projectSlug;
    await sendTelegramFinalReview();
  } catch (error) {
    await sendTelegramMessage([
      "다시 만들기 실패했어욤.",
      `대상: ${projectSlug}`,
      `소스: ${sourceId}`,
      `이유: ${error.message}`,
    ].join("\n"));
    printSummary("final remake failed", { projectSlug, sourceId, error: error.message });
  } finally {
    options.item = previousItem;
  }
}

async function resolveSourceIdForProjectSlug(projectSlug) {
  const inbox = await readInbox();
  const items = normalizeInboxItems(inbox);
  const exact = items.find((item) => item.id === projectSlug);
  if (exact) return exact.id;

  const withoutDate = String(projectSlug).replace(/^\d{4}-\d{2}-\d{2}-/, "");
  const dateMatch = items.find((item) => item.id === withoutDate);
  if (dateMatch) return dateMatch.id;

  const suffixMatch = items.find((item) => String(projectSlug).endsWith(`-${item.id}`));
  if (suffixMatch) return suffixMatch.id;

  const looseMatch = items.find((item) => String(projectSlug).includes(item.id));
  if (looseMatch) return looseMatch.id;

  return withoutDate || null;
}

async function pollTelegramCommands() {
  const state = await readJsonIfExists(telegramStatePath, { updateOffset: 0 });
  const data = await telegram("getUpdates", {
    offset: String(state.updateOffset ?? 0),
    timeout: "1",
    allowed_updates: JSON.stringify(["message"]),
  });
  const updates = data.result ?? [];
  let nextOffset = state.updateOffset ?? 0;
  const actions = [];

  for (const update of updates) {
    nextOffset = Math.max(nextOffset, update.update_id + 1);
    const text = update.message?.text?.trim();
    if (!text) continue;
    const action = await applyTelegramCommand(text);
    if (action) actions.push(action);
  }

  await writeJson(telegramStatePath, { updateOffset: nextOffset, updated_at: new Date().toISOString() });
  printSummary("telegram commands polled", { updates: updates.length, actions });
}

async function applyTelegramCommand(text) {
  const shortAction = await applyShortTelegramCommandV2(text);
  if (shortAction) return shortAction;

  const sourceOk = text.match(/^SOURCE\s+OK\s+([^\s:]+)\s*$/i);
  if (sourceOk) {
    await updateSourceReview(sourceOk[1], "approved", "Source approved from Telegram.");
    return { stage: "source", id: sourceOk[1], status: "approved" };
  }

  const sourceNo = text.match(/^SOURCE\s+NO\s+([^:\s]+)\s*:?\s*([\s\S]*)$/i);
  if (sourceNo) {
    await updateSourceReview(sourceNo[1], "rejected", sourceNo[2]?.trim() || "Source rejected from Telegram.");
    return { stage: "source", id: sourceNo[1], status: "rejected" };
  }

  const draftOk = text.match(/^DRAFT\s+OK\s+([^\s:]+)\s*$/i);
  if (draftOk) {
    await updateDraftReview(draftOk[1], "approved", "Draft approved from Telegram.");
    return { stage: "draft", id: draftOk[1], status: "approved" };
  }

  const draftRevise = text.match(/^DRAFT\s+REVISE\s+([^:\s]+)\s*:?\s*([\s\S]*)$/i);
  if (draftRevise) {
    await updateDraftReview(draftRevise[1], "changes_requested", draftRevise[2]?.trim() || "Draft changes requested from Telegram.");
    return { stage: "draft", id: draftRevise[1], status: "changes_requested" };
  }

  const upload = text.match(/^(UPLOAD|APPROVE)\s+([^\s:]+)\s*$/i);
  if (upload) {
    await approveFinalReviewAndMaybePublish(upload[2], "Final upload approved from Telegram.");
    return { stage: "final", id: upload[2], status: "approved" };
  }

  const revise = text.match(/^REVISE\s+([^:\s]+)\s*:?\s*([\s\S]*)$/i);
  if (revise) {
    const note = revise[2]?.trim() || "Final changes requested from Telegram.";
    await updateFinalReview(revise[1], "changes_requested", note);
    await remakeFinalPackageForProject(revise[1], note);
    return { stage: "final", id: revise[1], status: "changes_requested" };
  }

  const directSource = parseTelegramDirectSourceMessage(text);
  if (directSource) {
    const { candidate, created } = await upsertManualSourceCandidate({
      url: directSource.url,
      title: directSource.title,
      bucket: "telegram-direct",
      priority: 99,
      status: "candidate",
      sourceLabel: "telegram-direct",
      direct: true,
      summary: "User sent this source directly in Telegram. Verify it, gather source-of-truth and visual/demo proof, then produce the package.",
      angle: directSource.angle,
    });
    await updateSourceReview(candidate.id, "approved", "User sent a direct source URL in Telegram; bypass source candidate review.");
    await sendTelegramMessage([
      "직접 소스 접수했어욤.",
      "",
      `id: ${candidate.id}`,
      `제목: ${candidate.title}`,
      `링크: ${candidate.url}`,
      "",
      directSourceImmediate
        ? "이건 후보 큐랑 별개로 바로 제작 루트로 태울게요."
        : "직접 소스로 승인만 해둘게요. 다음 작업 루프에서 제작합니다.",
      created ? null : "참고: 이미 있던 링크라 기존 소스를 다시 승인했어요.",
    ].filter(Boolean).join("\n"));

    if (directSourceImmediate) {
      await runApprovedSourceProductionNow(candidate.id, "Telegram direct source intake.");
    }

    return {
      stage: "source",
      id: candidate.id,
      status: "approved",
      command: "direct-source-url",
      immediate: directSourceImmediate,
    };
  }

  const conversationalAction = await applyConversationalTelegramCommand(text);
  if (conversationalAction) return conversationalAction;

  return null;
}

function parseTelegramDirectSourceMessage(text) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (/^(SOURCE|DRAFT|UPLOAD|APPROVE|REVISE)\b/i.test(trimmed)) return null;
  if (/^(\u3131\u3131|\uB300\uAE30|\uC218\uC815|\u3134\u3134)(?:\s|$)/i.test(trimmed)) return null;

  const match = trimmed.match(/https?:\/\/[^\s<>"'`]+/i);
  if (!match) return null;

  const url = sanitizeSourceUrl(match[0]);
  const titleText = trimmed
    .replace(match[0], " ")
    .replace(/^(source|url|link|\uC18C\uC2A4|\uB9C1\uD06C|\uC774\uAC70|\uC774\uAC78\uB85C|\uC774\uAC70\uB85C)\s*[:：-]?\s*/i, " ")
    .replace(/(\uB9CC\uB4E4\uC5B4\uC918|\uC81C\uC791\uD574\uC918|\uCE74\uB4DC\uB274\uC2A4|\uB9B4\uC2A4|\uBD80\uD0C1|\uD574\uC918|\uACE0\uACE0|\u3131\u3131)/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    url,
    title: titleText || url,
    angle: titleText
      ? `User specifically asked to make content from this source: ${titleText}`
      : "User specifically asked to make content from this source URL.",
  };
}

async function applyConversationalTelegramCommand(text) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (/^(SOURCE|DRAFT|UPLOAD|APPROVE|REVISE)\b/i.test(trimmed)) return null;
  if (/^(\u3131\u3131|\uB300\uAE30|\uC218\uC815|\u3134\u3134)(?:\s|$)/i.test(trimmed)) return null;
  if (/https?:\/\/[^\s<>"'`]+/i.test(trimmed)) return null;

  const action = classifyConversationalTelegramAction(trimmed);
  if (!action) return null;

  const targetHint = parseConversationalTelegramTargetHint(trimmed);
  const target = await resolveConversationalTelegramTarget(targetHint, action, trimmed);
  if (!target) return { stage: "shortcut", status: "needs_id", command: "conversation" };

  if (action === "approve" && target.stage === "final" && !isExplicitFinalUploadApproval(trimmed)) {
    await sendTelegramMessage([
      "업로드 승인으로 볼지 살짝 애매해요.",
      "",
      `대상: ${target.id}`,
      "",
      "게시까지 원하면 이렇게 말해주면 돼요:",
      "- 좋아 올려줘",
      "- 이걸로 인스타랑 쓰레드 올려",
      "- 업로드 진행해",
      "",
      "그냥 마음에 든다는 뜻이면 보류해둘게욤.",
    ].join("\n"));
    return {
      stage: target.stage,
      id: target.id,
      status: "needs_publish_confirmation",
      command: "conversation",
    };
  }

  await applyReviewShortcutV2(target, action, trimmed);
  const status =
    action === "approve"
      ? "approved"
      : action === "hold"
        ? "pending"
        : target.stage === "source" && action === "reject"
          ? "rejected"
          : "changes_requested";
  return {
    stage: target.stage,
    id: target.id,
    status,
    command: "conversation",
  };
}

function classifyConversationalTelegramAction(text) {
  if (isNumberOnlyTelegramChoice(text)) return "approve";
  if (/(\uB300\uAE30|\uBCF4\uB958|\uB098\uC911\uC5D0|\uC7A0\uAE50\s*\uBA48\uCD94|\uC2A4\uD1B1)/i.test(text)) return "hold";
  if (/(\uBCC4\uB85C|\u3134\u3134|\uB2E4\uC2DC\s*(\uCC3E|\uC11C\uCE6D)|\uC0C8\uB85C\s*(\uCC3E|\uB9CC\uB4E4)|\uB9C8\uC74C\uC5D0\s*\uC548|\uD3D0\uAE30|\uBC84\uB824|\uAC1C\uBCC4\uB85C)/i.test(text)) return "reject";
  if (/(업로드|게시|발행|인스타|쓰레드|threads|instagram)|((좋아|괜찮|오케이|ㅇㅋ|이걸로|이거로|승인|통과|고고|가자|진행).*(올려|올리자|올려줘))/i.test(text)) return "approve";
  if (/(\uC218\uC815|\uACE0\uCCD0|\uBC14\uAFC0|\uBC14\uAFD4|\uBC18\uC601|\uB2E4\uC2DC\s*\uB9CC\uB4E4|\uB354\s*\uC138\uAC8C|\uD6C5|\uCCAB\s*\uC7A5|\uCCAB\uC7A5|\uD6C4\uD0B9|\uC774\uBBF8\uC9C0|\uC9C0\uD53C\uD2F0|\bGPT\b|\uB3C4\uC2DD|\uB808\uC774\uC544\uC6C3|\uAE00\uC528|\uD3F0\uD2B8|\uCEA1\uC158|\uC9E7\uAC8C|\uAE38\uAC8C|\uD1A4|\uB9D0\uD22C|\uB2E4\uB4EC|\uBCF4\uC644|\uCD94\uAC00|\uBE7C\uC918|\uB0B4\uB824|\uC62C\uB824|\uD0A4\uC6CC|\uC904\uC5EC|\uACB9\uCE58|\uC5B4\uC0C9)/i.test(text)) return "revise";
  if (/(좋아|괜찮|오케이|ㅇㅋ|\bok\b|\bokay\b|\bgo\b|고고|가자|진행|승인|통과|이걸로|이거로|선택|픽|만들어|제작)/i.test(text)) return "approve";
  return null;
}

function isNumberOnlyTelegramChoice(text) {
  return /^\s*#?\d+\s*(?:\uBC88|\uBC88\uC9F8|\uBC88\uC73C\uB85C|\uBC88\s*\uC18C\uC2A4)?\s*$/i.test(text);
}

function parseConversationalTelegramTargetHint(text) {
  const numberMatch = text.match(/(?:^|\s|#)(\d+)\s*(?:\uBC88|\uBC88\uC9F8|\uBC88\uC73C\uB85C|\uBC88\s*\uC18C\uC2A4)?/i);
  const stageHint = parseTelegramStageHintV3(text);
  const slugMatch = numberMatch
    ? null
    : text.match(/\b(?:20\d{2}-\d{2}-\d{2}-[a-z0-9-]+|[a-z0-9][a-z0-9-]{5,})\b/i);
  return {
    id: slugMatch ? slugMatch[0] : null,
    number: numberMatch ? Number(numberMatch[1]) : null,
    stageHint,
  };
}

function isExplicitFinalUploadApproval(text) {
  return /(올려|올려줘|올리자|업로드|게시|발행|배포|인스타|쓰레드|threads|instagram|\u3131\u3131|고고|진행|승인|통과)/i.test(text);
}

async function resolveConversationalTelegramTarget(targetHint = {}, action = "revise", originalText = "") {
  const pending = await getPendingTelegramReviewTargetsV3();

  if (targetHint.id || targetHint.number || targetHint.stageHint) {
    return resolveTelegramReviewTargetV3(targetHint);
  }

  if (pending.length === 1) return pending[0];

  const pendingFinals = pending.filter((item) => item.stage === "final");
  if (pendingFinals.length === 1 && (action !== "approve" || isExplicitFinalUploadApproval(originalText))) {
    return pendingFinals[0];
  }
  if (action === "revise" && pendingFinals.length >= 1) {
    return pendingFinals[0];
  }

  const pendingSources = pending.filter((item) => item.stage === "source");
  if (action === "approve" && pendingSources.length === 1 && !pendingFinals.length) return pendingSources[0];

  const fuzzyTarget = resolveFuzzyTelegramTargetFromText(pending, originalText);
  if (fuzzyTarget) return fuzzyTarget;

  if (!pending.length) {
    await sendTelegramMessage("지금 수정/보류할 검수 항목이 없어요. 먼저 소스 후보나 최종 미리보기를 받아야 해욤.");
    return null;
  }

  await sendTelegramMessage([
    "어느 항목을 말하는지 살짝만 붙여줘욤.",
    "",
    "예시:",
    "수정 1번: 첫 장 훅 더 세게",
    "ㄴㄴ 2번",
    "대기 3번",
    "",
    "대기 중인 항목:",
    ...formatPendingTelegramTargetsV3(pending),
  ].join("\n"));
  return null;
}

function resolveFuzzyTelegramTargetFromText(pending, text) {
  const normalized = normalizeTelegramFuzzyText(text);
  if (!normalized) return null;
  const tokens = normalized.split(" ").filter((token) => token.length >= 4);
  if (!tokens.length) return null;

  const matches = pending.filter((item) => {
    const haystack = normalizeTelegramFuzzyText([
      item.id,
      item.title,
      item.url,
      item.bucket,
      item.summary,
    ].filter(Boolean).join(" "));
    return haystack && tokens.some((token) => haystack.includes(token));
  });
  return matches.length === 1 ? matches[0] : null;
}

function normalizeTelegramFuzzyText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9가-힣]+/g, " ")
    .replace(/\b(좋아|괜찮|오케이|수정|고쳐|바꿔|올려|업로드|게시|발행|대기|보류|별로|다시|첫장|첫|훅|이미지|지피티|gpt|도식|해주세요|해줘|좀|더|세게)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function runApprovedSourceProductionNow(sourceId, note = "") {
  const previousItem = options.item;
  options.item = sourceId;
  try {
    await planFinalRuns({ runCodex: true });
    await runNodeScript("tools/publish/build-publish-queue.mjs", [
      "--workspace-root",
      workspaceRoot,
      "--channel",
      channel,
      "--out",
      queuePath,
    ]);
    if (!flags.has("skip_queue_validation")) {
      await runNodeScript("tools/publish/validate-publish-queue.mjs", [
        "--queue",
        queuePath,
        "--out",
        resolvePath(options.validation_out, path.join(DEFAULT_WORKSPACE_ROOT, "publish-validation.json")),
      ]);
    }
    if (sourceOnlyAutopilot) {
      await approveReadyFinalsForSourceOnlyAutopilot({
        ignoreDailyLimit: true,
        approvalNote: "Auto-approved from a user-supplied direct source URL.",
      });
    } else if (!flags.has("skip_final_review")) {
      await sendTelegramFinalReview();
    }
    await sendTelegramMessage([
      "직접 소스 제작 루프 끝났어욤.",
      `id: ${sourceId}`,
      note ? `메모: ${note}` : null,
      "결과물이 준비되면 검수/업로드 큐로 이어집니다.",
    ].filter(Boolean).join("\n"));
  } catch (error) {
    await sendTelegramMessage([
      "직접 소스 제작 중에 막혔어욤.",
      `id: ${sourceId}`,
      `이유: ${error.message}`,
      "로그 확인하고 다시 살려볼게요.",
    ].join("\n"));
    printSummary("direct source production failed", { sourceId, error: error.message });
  } finally {
    options.item = previousItem;
  }
}

async function applyShortTelegramCommandV2(text) {
  const trimmed = text.trim();
  const APPROVE = "\u3131\u3131";
  const HOLD = "\uB300\uAE30";
  const REVISE = "\uC218\uC815";
  const REJECT = "\u3134\u3134";

  const parsed = parseShortTelegramCommandInputV3(trimmed, { APPROVE, HOLD, REVISE, REJECT });
  if (parsed) {
    if (parsed.action === "revise" && !parsed.note) {
      await sendTelegramMessage("수정할 내용을 같이 적어줘욤. 예: 수정 2번: 첫 장 훅 더 세게");
      return { stage: "shortcut", status: "needs_note", command: parsed.command };
    }

    const target = await resolveTelegramReviewTargetV3(parsed.target);
    if (!target) return { stage: "shortcut", status: "needs_id", command: parsed.command };

    await applyReviewShortcutV2(target, parsed.action, parsed.note);
    const status =
      parsed.action === "approve"
        ? "approved"
        : parsed.action === "hold"
          ? "pending"
          : target.stage === "source" && parsed.action === "reject"
            ? "rejected"
            : "changes_requested";

    return { stage: target.stage, id: target.id, status, command: parsed.command };
  }

  const approve = trimmed.match(new RegExp(`^${APPROVE}(?:\\s+(.+))?$`, "i"));
  if (approve) {
    const target = await resolveTelegramReviewTargetV2(extractOptionalTargetId(approve[1]));
    if (!target) return { stage: "shortcut", status: "needs_id", command: APPROVE };
    await applyReviewShortcutV2(target, "approve");
    return { stage: target.stage, id: target.id, status: "approved", command: APPROVE };
  }

  const hold = trimmed.match(new RegExp(`^${HOLD}(?:\\s+(.+))?$`, "i"));
  if (hold) {
    const target = await resolveTelegramReviewTargetV2(extractOptionalTargetId(hold[1]));
    if (!target) return { stage: "shortcut", status: "needs_id", command: HOLD };
    await applyReviewShortcutV2(target, "hold");
    return { stage: target.stage, id: target.id, status: "pending", command: HOLD };
  }

  const reject = trimmed.match(new RegExp(`^${REJECT}(?:\\s+(.+))?$`, "i"));
  if (reject) {
    const target = await resolveTelegramReviewTargetV2(extractOptionalTargetId(reject[1]));
    if (!target) return { stage: "shortcut", status: "needs_id", command: REJECT };
    await applyReviewShortcutV2(target, "reject", reject[1]?.trim());
    return { stage: target.stage, id: target.id, status: target.stage === "source" ? "rejected" : "changes_requested", command: REJECT };
  }

  if (trimmed === REVISE) {
    await sendTelegramMessage("수정할 내용을 같이 적어줘욤. 예: 수정 <id>: 첫 장 훅 더 세게");
    return { stage: "shortcut", status: "needs_note", command: REVISE };
  }

  if (trimmed.startsWith(`${REVISE} `)) {
    const payload = parseRevisionPayloadV2(trimmed.slice(REVISE.length).trim());
    const target = await resolveTelegramReviewTargetV2(payload.id);
    if (!target) return { stage: "shortcut", status: "needs_id", command: REVISE };
    await applyReviewShortcutV2(target, "revise", payload.note);
    return { stage: target.stage, id: target.id, status: "changes_requested", command: REVISE };
  }

  return null;
}

function parseShortTelegramCommandInputV3(text, commands) {
  const candidates = [
    { command: commands.APPROVE, action: "approve" },
    { command: commands.HOLD, action: "hold" },
    { command: commands.REJECT, action: "reject" },
    { command: commands.REVISE, action: "revise" },
  ]
    .map((item) => ({ ...item, index: text.indexOf(item.command) }))
    .filter((item) => item.index >= 0)
    .sort((a, b) => a.index - b.index);

  const matched = candidates[0];
  if (!matched) return null;

  const before = text.slice(0, matched.index).trim();
  const after = text.slice(matched.index + matched.command.length).trim();
  const remainder = [before, after].filter(Boolean).join(" ").trim();
  const target = parseTelegramTargetHintV3(remainder);

  return {
    action: matched.action,
    command: matched.command,
    target,
    note: matched.action === "revise" ? parseTelegramRevisionNoteV3(remainder, target) : "",
  };
}

function parseTelegramTargetHintV3(rawValue = "") {
  const value = rawValue.trim();
  const numberMatch = value.match(/(?:^|\s|#)(\d+)\s*(?:\uBC88|\uBC88\uC9F8|\uBC88\uC73C\uB85C|\uBC88\s*\uC18C\uC2A4)?/i);
  const stageHint = parseTelegramStageHintV3(value);
  // If the user supplied a number, treat the remaining words as the note.
  // Example: "수정 1번: 첫장 훅 더 세게" must resolve target #1,
  // not try to resolve "첫장" as an id.
  const idCandidate = numberMatch
    ? null
    : stripTelegramTargetNoiseV3(value)
      .replace(/(?:^|\s|#)\d+\s*(?:\uBC88|\uBC88\uC9F8|\uBC88\uC73C\uB85C|\uBC88\s*\uC18C\uC2A4)?/gi, " ")
      .trim()
      .split(/\s+/)
      .find((token) => token && token !== ":");

  return {
    id: idCandidate ? idCandidate.replace(/:$/, "") : null,
    number: numberMatch ? Number(numberMatch[1]) : null,
    stageHint,
  };
}

function parseTelegramStageHintV3(value) {
  if (/(source|\uC18C\uC2A4)/i.test(value)) return "source";
  if (/(draft|\uCD08\uC548)/i.test(value)) return "draft";
  if (/(final|upload|\uCD5C\uC885|\uC5C5\uB85C\uB4DC)/i.test(value)) return "final";
  return null;
}

function stripTelegramTargetNoiseV3(value) {
  return value
    .replace(/(source|draft|final|upload)/gi, " ")
    .replace(/(\uC18C\uC2A4\uB85C|\uC18C\uC2A4\uC5D0\uC11C|\uC18C\uC2A4|\uCD08\uC548\uC73C\uB85C|\uCD08\uC548\uC5D0\uC11C|\uCD08\uC548|\uCD5C\uC885\uC73C\uB85C|\uCD5C\uC885\uC5D0\uC11C|\uCD5C\uC885|\uC5C5\uB85C\uB4DC)/g, " ")
    .replace(/(\uC774\uAC78\uB85C|\uC774\uAC70\uB85C|\uC774\uAC70|\uCC98\uB9AC|\uBD80\uD0C1|\uD574\uC8FC\uC138\uC694|\uD574\uC918|\uC73C\uB85C|\uB85C|\uB97C|\uC744|\uAC00|\uC740|\uB294|\uC880)/g, " ");
}

function parseTelegramRevisionNoteV3(rawValue, target) {
  const value = rawValue.trim();
  if (!value) return "";

  const colonIndex = value.indexOf(":");
  if (colonIndex >= 0) return value.slice(colonIndex + 1).trim();

  let note = value;
  if (target.id) note = note.replace(target.id, " ");
  if (target.number) note = note.replace(new RegExp(`${target.number}\\s*(?:\\uBC88|\\uBC88\\uC9F8|\\uBC88\\uC73C\\uB85C|\\uBC88\\s*\\uC18C\\uC2A4)?`, "g"), " ");
  note = stripTelegramTargetNoiseV3(note).trim();
  return note || "";
}
async function resolveTelegramReviewTargetV3(target = {}) {
  const pending = await getPendingTelegramReviewTargetsV3();

  if (target.id) {
    const found = pending.find((item) => item.id === target.id);
    if (found) return found;
    const finalFound = await findFinalTelegramTargetByIdV3(target.id);
    if (finalFound) return finalFound;
    await sendTelegramMessage([
      `id를 못 찾았어욤: ${target.id}`,
      "",
      "번호로도 가능해요:",
      ...formatPendingTelegramTargetsV3(pending),
    ].join("\n"));
    return null;
  }

  if (!target.number && !target.stageHint) {
    const latestFinal = await getLatestFinalTelegramTargetV3();
    if (latestFinal) return latestFinal;
  }

  if (target.number) {
    const overall = pending[target.number - 1];
    if (overall && (!target.stageHint || overall.stage === target.stageHint)) return overall;

    const pool = target.stageHint ? pending.filter((item) => item.stage === target.stageHint) : pending;
    const found = pool[target.number - 1];
    if (found) return found;
    await sendTelegramMessage([
      `${target.stageHint ? getTelegramStageLabelV3(target.stageHint) + " " : ""}${target.number}번 항목을 못 찾았어욤.`,
      "",
      "지금은 이렇게 골라주면 돼요:",
      ...formatPendingTelegramTargetsV3(pending),
    ].join("\n"));
    return null;
  }

  if (pending.length === 1) return pending[0];

  if (!pending.length) {
    await sendTelegramMessage("지금 처리 대기 중인 항목이 없어요. 먼저 소스/초안/최종 검수 메시지를 받아야 해욤.");
    return null;
  }

  await sendTelegramMessage([
    "대기 중인 항목이 여러 개라 번호만 붙여주면 돼욤.",
    "",
    "예시:",
    "ㄱㄱ 2번",
    "2번 ㄱㄱ",
    "2번 소스로 ㄱㄱ",
    "수정 3번: 첫 장 훅 더 세게",
    "ㄴㄴ 4번",
    "",
    "대기 중인 항목:",
    ...formatPendingTelegramTargetsV3(pending),
  ].join("\n"));
  return null;
}

async function getPendingTelegramReviewTargetsV3() {
  const state = await loadReviewState();
  const inboxItems = await readInboxItemsByIdSafe();
  return [
    ...state.sources
      .filter((item) => SOURCE_REVIEW_GATE_STATUSES.has(item.status))
      .map((item) => enrichTelegramTargetV3(
        { stage: "source", id: item.sourceId, title: item.title, url: item.url, updated_at: item.updated_at },
        inboxItems.get(item.sourceId),
      )),
    ...state.drafts
      .filter((item) => item.status === "pending")
      .map((item) => enrichTelegramTargetV3(
        { stage: "draft", id: item.sourceId, title: item.title, updated_at: item.updated_at },
        inboxItems.get(item.sourceId),
      )),
    ...state.items
      .filter((item) => item.status === "pending")
      .map((item) => ({ stage: "final", id: item.projectSlug, title: item.contentKey ?? item.projectSlug, updated_at: item.updated_at })),
  ].sort((a, b) => new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime());
}

async function findFinalTelegramTargetByIdV3(id) {
  const state = await loadReviewState();
  const found = state.items.find((item) => {
    return item.projectSlug === id || item.itemId === id || item.contentKey === id;
  });
  return found ? finalTelegramTargetFromStateItemV3(found) : null;
}

async function getLatestFinalTelegramTargetV3() {
  const state = await loadReviewState();
  const latest = state.items
    .filter((item) => !["published"].includes(item.status))
    .sort((a, b) => new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime())[0];
  return latest ? finalTelegramTargetFromStateItemV3(latest) : null;
}

function finalTelegramTargetFromStateItemV3(item) {
  return {
    stage: "final",
    id: item.projectSlug,
    title: item.contentKey ?? item.projectSlug,
    updated_at: item.updated_at,
  };
}

async function readInboxItemsByIdSafe() {
  try {
    const inbox = await readInbox();
    return new Map(normalizeInboxItems(inbox).map((item) => [item.id, item]));
  } catch {
    return new Map();
  }
}

function enrichTelegramTargetV3(target, inboxItem) {
  if (!inboxItem) return target;
  return {
    ...target,
    title: target.title || inboxItem.title,
    url: target.url || inboxItem.url,
    bucket: inboxItem.bucket,
    priority: inboxItem.priority,
    summary: inboxItem.summary,
    angle: inboxItem.angle,
    viewerHook: inboxItem.viewerHook,
    whyNow: inboxItem.whyNow,
    whoShouldCare: inboxItem.whoShouldCare,
    whatToTryToday: inboxItem.whatToTryToday,
    reelFirst3Seconds: inboxItem.reelFirst3Seconds,
    visualAssetsToCollect: inboxItem.visualAssetsToCollect,
    proofSignals: inboxItem.proofSignals,
    scores: inboxItem.scores,
    sources: Array.isArray(inboxItem.sources) ? inboxItem.sources : [],
  };
}

function formatPendingTelegramTargetsV3(pending, limit = 12) {
  return pending.slice(0, limit).map((item, index) => {
    const title = item.title ? ` — ${truncateForTelegram(item.title, 52)}` : "";
    const url = item.url ? `\n   링크: ${item.url}` : "";
    return `${index + 1}. [${getTelegramStageLabelV3(item.stage)}] ${item.id}${title}${url}`;
  });
}

function formatPendingTelegramTargetsDetailedV3(items, offset = 0) {
  return items.flatMap((item, localIndex) => {
    const index = offset + localIndex + 1;
    const sources = (item.sources ?? [])
      .filter((source) => source?.url)
      .slice(0, 3)
      .map((source) => `   - ${source.label ?? "source"}: ${source.url}`);

    return [
      `${index}. [${getTelegramStageLabelV3(item.stage)}] ${item.id}`,
      item.title ? `제목: ${truncateForTelegram(item.title, 80)}` : null,
      item.bucket ? `분류: ${item.bucket}${item.priority ? ` / 우선순위 ${item.priority}` : ""}` : null,
      item.angle ? `각도: ${truncateForTelegram(item.angle, 155)}` : null,
      item.summary ? `요약: ${truncateForTelegram(item.summary, 180)}` : null,
      item.url ? `직접 링크: ${item.url}` : null,
      sources.length ? ["보조 링크:", ...sources].join("\n") : null,
      `명령: ㄱㄱ ${index}번 / 대기 ${index}번 / 수정 ${index}번: ... / ㄴㄴ ${index}번`,
      "",
    ].filter(Boolean);
  });
}

function formatPendingTelegramTargetsDetailedV4(items, offset = 0) {
  return items.flatMap((item, localIndex) => {
    const index = offset + localIndex + 1;
    return formatSourceCandidateCompactV7({
      id: item.id,
      title: item.title,
      bucket: item.bucket ?? getTelegramStageLabelV3(item.stage),
      priority: item.priority,
      viewerHook: item.viewerHook,
      angle: item.angle,
      summary: item.summary,
      whyNow: item.whyNow,
      whoShouldCare: item.whoShouldCare,
      whatToTryToday: item.whatToTryToday,
      reelFirst3Seconds: item.reelFirst3Seconds,
      visualAssetsToCollect: item.visualAssetsToCollect,
      proofSignals: item.proofSignals,
      scores: item.scores,
      url: item.url,
      sources: item.sources,
    }, index);
  });
}

function truncateForTelegram(value, limit) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, Math.max(0, limit - 1))}…`;
}

function chunkItems(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function getTelegramStageLabelV3(stage) {
  if (stage === "source") return "소스";
  if (stage === "draft") return "초안";
  if (stage === "final") return "최종";
  return stage;
}

function parseRevisionPayloadV2(rawValue) {
  const value = rawValue.trim();
  if (!value) return { id: null, note: "수정 사항이 비어있어요." };

  const colonIndex = value.indexOf(":");
  if (colonIndex > 0) {
    return {
      id: value.slice(0, colonIndex).trim(),
      note: value.slice(colonIndex + 1).trim() || "수정 사항이 비어있어요.",
    };
  }

  const [firstToken, ...restTokens] = value.split(/\s+/);
  return {
    id: restTokens.length ? firstToken : null,
    note: restTokens.length ? restTokens.join(" ") : value,
  };
}

async function resolveTelegramReviewTargetV2(targetId) {
  const state = await loadReviewState();
  const pending = [
    ...state.sources
      .filter((item) => SOURCE_REVIEW_GATE_STATUSES.has(item.status))
      .map((item) => ({ stage: "source", id: item.sourceId, title: item.title, updated_at: item.updated_at })),
    ...state.drafts
      .filter((item) => item.status === "pending")
      .map((item) => ({ stage: "draft", id: item.sourceId, title: item.title, updated_at: item.updated_at })),
    ...state.items
      .filter((item) => item.status === "pending")
      .map((item) => ({ stage: "final", id: item.projectSlug, title: item.contentKey ?? item.projectSlug, updated_at: item.updated_at })),
  ].sort((a, b) => new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime());

  if (targetId) {
    const found = pending.find((item) => item.id === targetId);
    if (found) return found;
    await sendTelegramMessage([
      `id를 못 찾았어욤: ${targetId}`,
      "",
      "대기 중인 항목:",
      ...pending.slice(0, 12).map((item) => `- ${item.stage}: ${item.id}`),
    ].join("\n"));
    return null;
  }

  if (pending.length === 1) return pending[0];

  if (!pending.length) {
    await sendTelegramMessage("지금 처리 대기 중인 항목이 없어요. 먼저 소스/초안/최종 검수 메시지를 받아야 해욤.");
    return null;
  }

  await sendTelegramMessage([
    "대기 중인 항목이 여러 개라서 id를 붙여줘야 해욤.",
    "방금 보낸 ㄱㄱ는 아직 아무것도 승인하지 않았어요.",
    "",
    "예시:",
    `ㄱㄱ ${pending[0].id}`,
    `대기 ${pending[0].id}`,
    `수정 ${pending[0].id}: 첫 장 훅 더 세게`,
    `ㄴㄴ ${pending[0].id}`,
    "",
    "대기 중인 항목:",
    ...pending.slice(0, 12).map((item) => `- ${item.stage}: ${item.id}`),
  ].join("\n"));
  return null;
}

async function applyReviewShortcutV2(target, action, note = "") {
  const cleanNote = note?.trim();
  if (target.stage === "source") {
    if (action === "approve") {
      await updateSourceReview(target.id, "approved", "Source approved from Telegram shortcut.");
      await sendTelegramMessage(`소스 승인됐어욤: ${target.id}`);
      return;
    }
    if (action === "hold") {
      await updateSourceReview(target.id, "pending", "Source held from Telegram shortcut.");
      await sendTelegramMessage(`소스 보류해둘게욤: ${target.id}`);
      return;
    }
    if (action === "reject") {
      await updateSourceReview(target.id, "rejected", cleanNote || "Source rejected from Telegram shortcut. Search again.");
      await sendTelegramMessage(`소스 별로 처리했어욤. 다음 루프에서 다시 찾아올게요: ${target.id}`);
      return;
    }
    await updateSourceReview(target.id, "changes_requested", cleanNote || "Source changes requested from Telegram shortcut.");
    await sendTelegramMessage(`소스 수정 요청으로 남겼어욤: ${target.id}`);
    return;
  }

  if (target.stage === "draft") {
    if (action === "approve") {
      await updateDraftReview(target.id, "approved", "Draft approved from Telegram shortcut.");
      await sendTelegramMessage(`초안 승인됐어욤: ${target.id}`);
      return;
    }
    if (action === "hold") {
      await updateDraftReview(target.id, "pending", "Draft held from Telegram shortcut.");
      await sendTelegramMessage(`초안 보류해둘게욤: ${target.id}`);
      return;
    }
    await updateDraftReview(target.id, "changes_requested", cleanNote || "Draft changes requested from Telegram shortcut.");
    await sendTelegramMessage(`초안 다시 보라고 남겼어욤: ${target.id}`);
    return;
  }

  if (action === "approve") {
    await approveFinalReviewAndMaybePublish(target.id, "Final upload approved from Telegram shortcut.");
    return;
  }
  if (action === "hold") {
    await updateFinalReview(target.id, "pending", "Final package held from Telegram shortcut.");
    await sendTelegramMessage(`최종본 보류해둘게욤: ${target.id}`);
    return;
  }
  const remakeNote = cleanNote || "Final package changes requested from Telegram shortcut.";
  await updateFinalReview(target.id, "changes_requested", remakeNote);
  await sendTelegramMessage(`최종본 다시 만들기 요청 받았어욤: ${target.id}`);
  await remakeFinalPackageForProject(target.id, remakeNote);
}

async function applyShortTelegramCommand(text) {
  const trimmed = text.trim();
  const approve = trimmed.match(/^ㄱㄱ(?:\s+(.+))?$/i);
  if (approve) {
    const target = await resolveTelegramReviewTarget(extractOptionalTargetId(approve[1]));
    if (!target) return { stage: "shortcut", status: "ignored", command: "ㄱㄱ" };
    await applyReviewShortcut(target, "approve");
    return { stage: target.stage, id: target.id, status: "approved", command: "ㄱㄱ" };
  }

  const hold = trimmed.match(/^대기(?:\s+(.+))?$/i);
  if (hold) {
    const target = await resolveTelegramReviewTarget(extractOptionalTargetId(hold[1]));
    if (!target) return { stage: "shortcut", status: "ignored", command: "대기" };
    await applyReviewShortcut(target, "hold");
    return { stage: target.stage, id: target.id, status: "pending", command: "대기" };
  }

  const reject = trimmed.match(/^ㄴㄴ(?:\s+(.+))?$/i);
  if (reject) {
    const target = await resolveTelegramReviewTarget(extractOptionalTargetId(reject[1]));
    if (!target) return { stage: "shortcut", status: "ignored", command: "ㄴㄴ" };
    await applyReviewShortcut(target, "reject", reject[1]?.trim());
    return { stage: target.stage, id: target.id, status: target.stage === "source" ? "rejected" : "changes_requested", command: "ㄴㄴ" };
  }

  if (trimmed === "수정") {
    await sendTelegramMessage("수정할 내용을 같이 적어줘욤. 예: 수정 <id>: 첫 장 훅 더 세게");
    return { stage: "shortcut", status: "needs_note", command: "수정" };
  }

  if (trimmed.startsWith("수정 ")) {
    const payload = parseRevisionPayload(trimmed.slice("수정".length).trim());
    const target = await resolveTelegramReviewTarget(payload.id);
    if (!target) return { stage: "shortcut", status: "ignored", command: "수정" };
    await applyReviewShortcut(target, "revise", payload.note);
    return { stage: target.stage, id: target.id, status: "changes_requested", command: "수정" };
  }

  return null;
}

function extractOptionalTargetId(rawValue) {
  const value = rawValue?.trim();
  if (!value) return null;
  return value.split(/\s+/)[0].replace(/:$/, "");
}

function parseRevisionPayload(rawValue) {
  const value = rawValue.trim();
  if (!value) return { id: null, note: "수정 사항이 비어있어요." };

  const colonIndex = value.indexOf(":");
  if (colonIndex > 0) {
    return {
      id: value.slice(0, colonIndex).trim(),
      note: value.slice(colonIndex + 1).trim() || "수정 사항이 비어있어요.",
    };
  }

  const [firstToken, ...restTokens] = value.split(/\s+/);
  return {
    id: restTokens.length ? firstToken : null,
    note: restTokens.length ? restTokens.join(" ") : value,
  };
}

async function resolveTelegramReviewTarget(targetId) {
  const state = await loadReviewState();
  const pending = [
    ...state.sources
      .filter((item) => SOURCE_REVIEW_GATE_STATUSES.has(item.status))
      .map((item) => ({ stage: "source", id: item.sourceId, title: item.title, updated_at: item.updated_at })),
    ...state.drafts
      .filter((item) => item.status === "pending")
      .map((item) => ({ stage: "draft", id: item.sourceId, title: item.title, updated_at: item.updated_at })),
    ...state.items
      .filter((item) => item.status === "pending")
      .map((item) => ({ stage: "final", id: item.projectSlug, title: item.contentKey ?? item.projectSlug, updated_at: item.updated_at })),
  ].sort((a, b) => new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime());

  if (targetId) {
    const found = pending.find((item) => item.id === targetId);
    if (found) return found;
    await sendTelegramMessage([
      `id를 못 찾았어욤: ${targetId}`,
      "",
      "대기 중인 항목:",
      ...pending.slice(0, 12).map((item) => `- ${item.stage}: ${item.id}`),
    ].join("\n"));
    return null;
  }

  if (pending.length === 1) return pending[0];

  if (!pending.length) {
    await sendTelegramMessage("지금 처리할 대기 항목이 없어요. 먼저 소스/초안/최종 검수 메시지를 받아야 해욤.");
    return null;
  }

  await sendTelegramMessage([
    "대기 중인 항목이 여러 개라 id를 붙여줘야 해욤.",
    "",
    "예시:",
    `ㄱㄱ ${pending[0].id}`,
    `대기 ${pending[0].id}`,
    `수정 ${pending[0].id}: 첫 장 훅 더 세게`,
    `ㄴㄴ ${pending[0].id}`,
    "",
    "대기 중인 항목:",
    ...pending.slice(0, 12).map((item) => `- ${item.stage}: ${item.id}`),
  ].join("\n"));
  return null;
}

async function applyReviewShortcut(target, action, note = "") {
  const cleanNote = note?.trim();
  if (target.stage === "source") {
    if (action === "approve") {
      await updateSourceReview(target.id, "approved", "Source approved from Telegram shortcut.");
      await sendTelegramMessage(`소스 승인했어욤: ${target.id}`);
      return;
    }
    if (action === "hold") {
      await updateSourceReview(target.id, "pending", "Source held from Telegram shortcut.");
      await sendTelegramMessage(`소스 보류해둘게욤: ${target.id}`);
      return;
    }
    if (action === "reject") {
      await updateSourceReview(target.id, "rejected", cleanNote || "Source rejected from Telegram shortcut. Search again.");
      await sendTelegramMessage(`소스 별로 처리했어욤. 다음 루프에서 다시 찾아올게요: ${target.id}`);
      return;
    }
    await updateSourceReview(target.id, "changes_requested", cleanNote || "Source changes requested from Telegram shortcut.");
    await sendTelegramMessage(`소스 수정 요청으로 남겼어욤: ${target.id}`);
    return;
  }

  if (target.stage === "draft") {
    if (action === "approve") {
      await updateDraftReview(target.id, "approved", "Draft approved from Telegram shortcut.");
      await sendTelegramMessage(`초안 승인했어욤: ${target.id}`);
      return;
    }
    if (action === "hold") {
      await updateDraftReview(target.id, "pending", "Draft held from Telegram shortcut.");
      await sendTelegramMessage(`초안 보류해둘게욤: ${target.id}`);
      return;
    }
    await updateDraftReview(target.id, "changes_requested", cleanNote || "Draft changes requested from Telegram shortcut.");
    await sendTelegramMessage(`초안 다시 손보라고 남겼어욤: ${target.id}`);
    return;
  }

  if (action === "approve") {
    await approveFinalReviewAndMaybePublish(target.id, "Final upload approved from Telegram shortcut.");
    return;
  }
  if (action === "hold") {
    await updateFinalReview(target.id, "pending", "Final package held from Telegram shortcut.");
    await sendTelegramMessage(`최종본 보류해둘게욤: ${target.id}`);
    return;
  }
  const remakeNote = cleanNote || "Final package changes requested from Telegram shortcut.";
  await updateFinalReview(target.id, "changes_requested", remakeNote);
  await sendTelegramMessage(`최종본 다시 만들기 요청 받았어욤: ${target.id}`);
  await remakeFinalPackageForProject(target.id, remakeNote);
}

async function approveFinalReviewAndMaybePublish(projectSlug, note) {
  await updateFinalReview(projectSlug, "approved", note);
  await autoPublishApprovedProject(projectSlug);
}

async function autoPublishApprovedProject(projectSlug) {
  return autoPublishApprovedProjectV2(projectSlug);

  if (!autoPublishOnFinalApproval) {
    await sendTelegramMessage(
      [
        `최종본 승인됐어욤: ${projectSlug}`,
        "",
        "자동 게시 옵션은 꺼져 있어서 여기서 멈췄어요.",
        "켜려면 hermes-content.env에 HERMES_AUTO_PUBLISH_ON_FINAL_APPROVAL=1 을 넣어주면 돼요.",
      ].join("\n"),
    );
    return;
  }

  if (!existsSync(cdnRepoPath)) {
    await sendTelegramMessage(
      [
        `최종본은 승인됐는데 업로드 준비에서 막혔어욤: ${projectSlug}`,
        `CDN repo를 못 찾았어요: ${cdnRepoPath}`,
      ].join("\n"),
    );
    return;
  }

  const platform = resolveAutoPublishPlatform();
  const modeLabel = autoPublishExecute ? "실제 업로드" : "드라이런";
  await sendTelegramMessage(
    [
      "업로드 시작할게욤 🚀",
      `콘텐츠: ${projectSlug}`,
      `플랫폼: ${platform}`,
      `종류: ${autoPublishKinds.join(" + ")}`,
      `모드: ${modeLabel}`,
    ].join("\n"),
  );

  const completed = [];
  try {
    for (let index = 0; index < autoPublishKinds.length; index += 1) {
      const kind = autoPublishKinds[index];
      const logPath = await runCdnPublishApproved(projectSlug, {
        platform,
        kind,
        execute: autoPublishExecute,
        skipCdn: index > 0,
      });
      completed.push(`${kind} (${path.relative(cwd, logPath)})`);
    }

    await updateFinalReview(
      projectSlug,
      autoPublishExecute ? "published" : "approved",
      autoPublishExecute
        ? `Auto-published from Telegram final approval: ${completed.join(", ")}`
        : `Auto-publish dry-run completed from Telegram final approval: ${completed.join(", ")}`,
    );

    await sendTelegramMessage(
      [
        autoPublishExecute ? "게시까지 끝났어욤 ✅" : "업로드 드라이런 끝났어욤 ✅",
        `콘텐츠: ${projectSlug}`,
        `완료: ${autoPublishKinds.join(" + ")}`,
      ].join("\n"),
    );
  } catch (error) {
    await updateFinalReview(projectSlug, "approved", `Auto publish failed: ${error.message}`);
    await sendTelegramMessage(
      [
        "업로드 중에 막혔어욤 😭",
        `콘텐츠: ${projectSlug}`,
        error.message,
        "",
        "승인 상태는 유지했으니까, 문제만 고치면 다시 ㄱㄱ로 재시도할 수 있어요.",
      ].join("\n"),
    );
  }
}

async function autoPublishApprovedProjectV2(projectSlug) {
  if (!autoPublishOnFinalApproval) {
    await sendTelegramMessage(
      [
        `최종본 승인됐어욤: ${projectSlug}`,
        "",
        "자동 게시 옵션은 꺼져 있어요. 여기서 멈출게요.",
        "켜려면 hermes-content.env에 HERMES_AUTO_PUBLISH_ON_FINAL_APPROVAL=1 을 넣어주면 돼요.",
      ].join("\n"),
    );
    return;
  }

  if (!existsSync(cdnRepoPath)) {
    await sendTelegramMessage(
      [
        `최종본은 승인됐는데 업로드 준비에서 막혔어욤: ${projectSlug}`,
        `CDN repo를 못 찾았어요: ${cdnRepoPath}`,
      ].join("\n"),
    );
    return;
  }

  const platform = resolveAutoPublishPlatform();
  const platforms = normalizePublishPlatforms(platform).filter((item) => item !== "youtube");
  const modeLabel = autoPublishExecute ? "실제 업로드" : "드라이런";

  await sendTelegramMessage(
    [
      "업로드 시작할게욤 👀",
      `콘텐츠: ${projectSlug}`,
      `플랫폼: ${platforms.join(" + ")}`,
      "인스타: 카드뉴스 + 릴스",
      "쓰레드: 카드뉴스 + AI Threads 태그 + 출처 댓글",
      `모드: ${modeLabel}`,
    ].join("\n"),
  );

  const completed = [];
  try {
    const cdnLogPath = await runCdnPublishProject(projectSlug);
    completed.push(`cdn (${path.relative(cwd, cdnLogPath)})`);

    for (const publishPlatform of platforms) {
      const logPath = await runWorkspacePublishScript(projectSlug, publishPlatform, {
        execute: autoPublishExecute,
      });
      completed.push(`${publishPlatform} (${path.relative(cwd, logPath)})`);
    }

    await updateFinalReview(
      projectSlug,
      autoPublishExecute ? "published" : "approved",
      autoPublishExecute
        ? `Auto-published from Telegram final approval: ${completed.join(", ")}`
        : `Auto-publish dry-run completed from Telegram final approval: ${completed.join(", ")}`,
    );

    await sendTelegramMessage(
      [
        autoPublishExecute ? "게시까지 끝났어욤 ✅" : "업로드 드라이런 끝났어욤 ✅",
        `콘텐츠: ${projectSlug}`,
        `완료: ${completed.map((item) => item.split(" ")[0]).join(" + ")}`,
      ].join("\n"),
    );
  } catch (error) {
    await updateFinalReview(projectSlug, "approved", `Auto publish failed: ${error.message}`);
    await sendTelegramMessage(
      [
        "업로드 중에 막혔어욤 🥲",
        `콘텐츠: ${projectSlug}`,
        error.message,
        "",
        "승인 상태는 유지했으니까, 문제만 고치면 다시 승인/게시할 수 있어요.",
      ].join("\n"),
    );
  }
}

async function runCdnPublishProject(projectSlug) {
  const args = ["run", "publish:project", "--", projectSlug];
  const command = process.platform === "win32" ? "cmd.exe" : "npm";
  const commandArgs = process.platform === "win32" ? ["/c", "npm", ...args] : args;
  const result = await spawnCapture(command, commandArgs, { cwd: cdnRepoPath });

  const logDir = path.join(runsDir, "publish-logs");
  await mkdir(logDir, { recursive: true });
  const logPath = path.join(logDir, `${safeSlug(projectSlug)}-cdn-${Date.now()}.log`);
  const log = [
    `$ ${["npm", ...args].join(" ")}`,
    "",
    "[stdout]",
    result.stdout,
    "",
    "[stderr]",
    result.stderr,
  ].join("\n");
  await writeFile(logPath, redactSensitiveText(log), "utf8");

  if (result.code !== 0) {
    throw new Error(`CDN 배포 명령이 실패했어요. 로그: ${path.relative(cwd, logPath)}`);
  }
  return logPath;
}

async function runWorkspacePublishScript(projectSlug, platform, { execute }) {
  const scriptByPlatform = {
    instagram: "tools/publish/publish-instagram.mjs",
    threads: "tools/publish/publish-threads.mjs",
  };
  const scriptPath = scriptByPlatform[platform];
  if (!scriptPath) {
    throw new Error(`자동 게시에서 지원하지 않는 플랫폼이에요: ${platform}`);
  }

  const outPath = path.join(workspaceRoot, `publish-${platform}-plan.json`);
  const args = [
    scriptPath,
    "--queue",
    queuePath,
    "--item",
    projectSlug,
    "--out",
    outPath,
  ];
  if (execute) args.push("--execute");

  const result = await spawnCapture(process.execPath, args, { cwd });
  const logDir = path.join(runsDir, "publish-logs");
  await mkdir(logDir, { recursive: true });
  const logPath = path.join(logDir, `${safeSlug(projectSlug)}-${platform}-${Date.now()}.log`);
  const log = [
    `$ node ${args.join(" ")}`,
    "",
    "[stdout]",
    result.stdout,
    "",
    "[stderr]",
    result.stderr,
  ].join("\n");
  await writeFile(logPath, redactSensitiveText(log), "utf8");

  if (result.code !== 0) {
    throw new Error(`${platform} 게시 명령이 실패했어요. 로그: ${path.relative(cwd, logPath)}`);
  }
  return logPath;
}

async function runCdnPublishApproved(projectSlug, { platform, kind, execute, skipCdn }) {
  const args = [
    "run",
    "publish:approved",
    "--",
    projectSlug,
    "--platform",
    platform,
    "--kind",
    kind,
  ];
  if (skipCdn) args.push("--skip-cdn");
  if (execute) args.push("--publish");

  const command = process.platform === "win32" ? "cmd.exe" : "npm";
  const commandArgs = process.platform === "win32" ? ["/c", "npm", ...args] : args;
  const result = await spawnCapture(command, commandArgs, { cwd: cdnRepoPath });

  const logDir = path.join(runsDir, "publish-logs");
  await mkdir(logDir, { recursive: true });
  const logPath = path.join(logDir, `${safeSlug(projectSlug)}-${kind}-${Date.now()}.log`);
  const log = [
    `$ ${["npm", ...args].join(" ")}`,
    "",
    "[stdout]",
    result.stdout,
    "",
    "[stderr]",
    result.stderr,
  ].join("\n");
  await writeFile(logPath, redactSensitiveText(log), "utf8");

  if (result.code !== 0) {
    throw new Error(`Meta 게시 명령이 실패했어요. 로그: ${path.relative(cwd, logPath)}`);
  }
  return logPath;
}

async function spawnCapture(command, args, spawnOptions = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: spawnOptions.cwd ?? cwd,
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
      env: { ...process.env, ...(spawnOptions.env ?? {}) },
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("exit", (code) => resolve({ code, stdout, stderr }));
  });
}

function redactSensitiveText(text) {
  return String(text ?? "")
    .replace(/EA[A-Za-z0-9_-]{20,}/g, "[redacted-meta-token]")
    .replace(/bot\d+:[A-Za-z0-9_-]+/g, "[redacted-telegram-token]");
}

async function publishApproved({ execute, platform, dailyLimit, itemSelector }) {
  const publishPlatforms = normalizePublishPlatforms(platform);
  const queue = await readJsonIfExists(queuePath, null);
  if (!queue) throw new Error(`Queue not found: ${queuePath}. Run --build-queue first.`);
  const state = await loadReviewState();
  const approvedSlugs = new Set(
    state.items
      .filter((item) => item.status === "approved")
      .map((item) => item.projectSlug),
  );
  const selected = selectLatestQueueItemsByProjectSource(queue.items.filter((item) => {
    if (!approvedSlugs.has(item.projectSlug)) return false;
    if (!itemSelector && !isFreshProjectForFinalReview(item)) return false;
    if (!itemSelector) return true;
    return itemSelector === item.projectSlug || itemSelector === item.id || itemSelector === item.contentKey;
  }));

  if (!selected.length) {
    printSummary("publish skipped", { reason: "no upload-approved items matched" });
    return;
  }

  const limited = selected.slice(0, dailyLimit);
  const approvedQueuePath = path.join(workspaceRoot, "publish-approved.json");
  await writeJson(approvedQueuePath, { ...queue, items: limited });

  const validation = await validateQueue({ ...queue, items: limited });
  if (validation.summary.errors > 0) {
    await writeJson(path.join(workspaceRoot, "publish-approved-validation.json"), validation);
    throw new Error(`Approved publish queue has ${validation.summary.errors} validation error(s).`);
  }

  const shouldExecute = execute ? ["--execute"] : [];
  if (publishPlatforms.includes("instagram")) {
    await runNodeScript("tools/publish/publish-instagram.mjs", [
      "--queue",
      approvedQueuePath,
      "--out",
      path.join(workspaceRoot, "publish-instagram-plan.json"),
      ...shouldExecute,
    ]);
  }
  if (publishPlatforms.includes("threads")) {
    await runNodeScript("tools/publish/publish-threads.mjs", [
      "--queue",
      approvedQueuePath,
      "--out",
      path.join(workspaceRoot, "publish-threads-plan.json"),
      ...shouldExecute,
    ]);
  }
  if (publishPlatforms.includes("youtube")) {
    await runNodeScript("tools/publish/publish-youtube.mjs", [
      "--queue",
      approvedQueuePath,
      "--out",
      path.join(workspaceRoot, "publish-youtube-plan.json"),
      ...shouldExecute,
    ]);
  }

  if (execute) {
    for (const item of limited) {
      await updateFinalReview(item.projectSlug, "published", "Publish scripts completed.");
    }
  }

  printSummary("approved publish flow complete", {
    dryRun: !execute,
    platform,
    platforms: publishPlatforms,
    items: limited.map((item) => item.projectSlug),
  });
}

function normalizePublishPlatforms(platform) {
  const value = String(platform ?? "both").toLowerCase();
  if (value === "both") return ["instagram", "threads"];
  if (value === "all") return ["instagram", "threads", "youtube"];
  if (["instagram", "threads", "youtube"].includes(value)) return [value];
  throw new Error(`Unknown publish platform: ${platform}. Use instagram, threads, youtube, both, or all.`);
}

async function runCodexExec(promptPath, lastMessagePath) {
  const prompt = await readFile(promptPath, "utf8");
  if (process.platform === "win32") {
    await spawnWithInput(
      "powershell.exe",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        [
          "$ErrorActionPreference = 'Stop'",
          "$prompt = [Console]::In.ReadToEnd()",
          "$prompt | codex.cmd --search -a never exec -C $env:HERMES_CODEX_CWD -s workspace-write -o $env:HERMES_CODEX_LAST_MESSAGE -",
          "if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }",
        ].join("; "),
      ],
      prompt,
      {
        env: {
          HERMES_CODEX_CWD: cwd,
          HERMES_CODEX_LAST_MESSAGE: lastMessagePath,
        },
      },
    );
    return;
  }

  await spawnWithInput("codex", [
    "--search",
    "-a",
    "never",
    "exec",
    "-C",
    cwd,
    "-s",
    "workspace-write",
    "-o",
    lastMessagePath,
    "-",
  ], prompt);
}

async function runPowerShellScript(scriptPath) {
  await spawnWithInput("powershell.exe", [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    scriptPath,
  ], "");
}

async function runNodeScript(scriptPath, args) {
  await spawnWithInput(process.execPath, [scriptPath, ...args], "");
}

async function spawnWithInput(command, args, input, spawnOptions = {}) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["pipe", "inherit", "inherit"],
      shell: spawnOptions.shell ?? false,
      env: { ...process.env, ...(spawnOptions.env ?? {}) },
    });
    if (input) child.stdin.write(input);
    child.stdin.end();
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

function buildDraftPrompt(item) {
  const draftDir = path.join(DEFAULT_DRAFTS_DIR, safeSlug(item.id)).replaceAll("\\", "/");
  return [
    "$auto-card-news $auto-motion-news $gpt-image-2-gen",
    "",
    "Create ONLY a reviewable content draft for AI JJUN. Do not render PNG/MP4 yet.",
    "The goal is source-approved -> draft-review -> final production.",
    "",
    `Write these files under ${draftDir}:`,
    "- brief.md",
    "- storyboard.md",
    "- caption-draft.md",
    "- reel-script.md",
    "- source-review.md",
    "",
    "Draft quality rules:",
    "- Use the AI JJUN VibeVoice/GmarketSans production standard.",
    "- Start from viewer pain/result, not feature names.",
    "- Include 2-3 hook options and choose the strongest one.",
    "- Each card must have one message and one visual job.",
    "- Plan real screenshots/demo media first; if missing, plan GPT Image/editorial visual per card.",
    "- Card 01 must include a cover visual decision: real hook image/video first; if unavailable, GPT Image 2/generated editorial scene that summarizes the topic.",
    "- For any generated cover, write the image prompt in storyboard.md with source/product cues, viewer situation, composition, and clean Korean hook area.",
    "- Reel must be 15-20s: hook -> explanation -> comment/save/follow CTA.",
    "- Korean copy must sound natural and social, not translated or like a press release.",
    "- Keep card text short. Move details to caption/source notes.",
    "",
    formatSourceForPrompt(item),
    "",
    "Final response: only summarize the draft files you created and what needs user approval.",
  ].join("\n");
}

function buildFinalPrompt(item) {
  const draftDir = path.join(DEFAULT_DRAFTS_DIR, safeSlug(item.id)).replaceAll("\\", "/");
  const projectHint = `carousel-workspace/projects/${channel}/${new Date().toISOString().slice(0, 10)}-${safeSlug(item.id)}`;
  return [
    "$auto-card-news $auto-motion-news $gpt-image-2-gen",
    "",
    "Produce the final AI JJUN card-news + Reel package from this approved source and approved draft.",
    "",
    "Use these local draft files if they exist:",
    `- ${draftDir}/brief.md`,
    `- ${draftDir}/storyboard.md`,
    `- ${draftDir}/caption-draft.md`,
    `- ${draftDir}/reel-script.md`,
    `- ${draftDir}/source-review.md`,
    "",
    "Final package requirements:",
    `- Create project under ${projectHint} or an equivalent AI JJUN project slug.`,
    "- Use auto-card-news and auto-motion-news rules.",
    "- Use GmarketSans, VibeVoice-level readability, and the approved AI JJUN source-based style.",
    "- Research/capture real source screenshots, demo frames, product UI, GitHub/docs proof, and media candidates.",
    "- Card 01 cover visual is mandatory: use a real hook-worthy source/demo/product image or video frame if available.",
    "- If Card 01 has no strong real media, use GPT Image 2 / generated editorial visual to summarize the whole topic in one concrete scene.",
    "- If GPT Image 2 is unavailable, create a high-quality HTML-native editorial scene and record the blocker in source-pack.md.",
    "- Do not use generic robot/glow art. Generated visuals must include source/product cues, viewer situation, and recognizable UI/object details.",
    "- Card 01 must hook with a recognizable visual, concrete use case, or generated topic-summary image before text.",
    "- Body cards must not repeat the same screenshot with different text.",
    "- Produce output/card-01.png through output/card-07.png.",
    "- Produce output/reel.mp4 or output/reel-preview.mp4 with meaningful motion, not a static slideshow.",
    "- Produce caption.md with Contents Editor, Source, and direct useful links.",
    "- Produce source-pack.md, brief.md, storyboard.md, motion-plan.md, contact-sheet.png, thumbnail-sheet.png.",
    "- Run layout QA: no overlapping number badges, chips, source lines, captions, or Instagram 1:1 crop problems.",
    "- Do not upload. Upload is handled only after Telegram final approval.",
    "",
    formatSourceForPrompt(item),
    "",
    "Final response: report project folder, output folder, caption path, reel path, and QA result only.",
  ].join("\n");
}

function formatSourceForPrompt(item) {
  const sourceLines = (item.sources ?? []).map((source) => {
    if (typeof source === "string") return `- ${source}`;
    const label = source.label ? `[${source.label}] ` : "";
    const summary = source.summary ? ` — ${source.summary}` : "";
    return `- ${label}${source.url ?? ""}${summary}`;
  });
  const sourceBlock = sourceLines.length ? sourceLines.join("\n") : `- ${item.url}`;
  return [
    "Hermes source candidate:",
    `- id: ${item.id}`,
    `- title: ${item.title}`,
    `- url: ${item.url}`,
    `- summary: ${item.summary ?? ""}`,
    `- angle: ${item.angle ?? ""}`,
    `- priority: ${item.priority ?? ""}`,
    "",
    "Sources to verify:",
    sourceBlock,
    "",
    "Notes:",
    ...((item.notes ?? []).length ? item.notes.map((note) => `- ${note}`) : ["- No extra notes."]),
  ].join("\n");
}

function buildPowerShellRunner(promptPath, lastMessagePath) {
  const escapedPrompt = promptPath.replaceAll("'", "''");
  const escapedOutput = lastMessagePath.replaceAll("'", "''");
  const escapedCwd = cwd.replaceAll("'", "''");
  return [
    "$ErrorActionPreference = 'Stop'",
    "[Console]::InputEncoding = [System.Text.UTF8Encoding]::new()",
    "[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()",
    "$OutputEncoding = [System.Text.UTF8Encoding]::new()",
    `$prompt = Get-Content -LiteralPath '${escapedPrompt}' -Raw -Encoding UTF8`,
    `$prompt | codex.cmd --search -a never exec -C '${escapedCwd}' -s workspace-write -o '${escapedOutput}' -`,
    "if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }",
    "",
  ].join("\n");
}

async function readInbox() {
  const inbox = await readJsonIfExists(inboxPath, null);
  if (!inbox) throw new Error(`Hermes source inbox not found: ${inboxPath}. Run --init first.`);
  return inbox;
}

async function loadReviewState() {
  const state = await readJsonIfExists(reviewStatePath, null);
  if (state) {
    const normalized = normalizeReviewState(state);
    if (markStaleReviewState(normalized)) await saveReviewState(normalized);
    return normalized;
  }

  const legacyPath = resolvePath(options.approvals, LEGACY_APPROVALS);
  const legacy = await readJsonIfExists(legacyPath, null);
  if (legacy) {
    const normalized = normalizeReviewState({ ...emptyReviewState(), items: legacy.items ?? [] });
    if (markStaleReviewState(normalized)) await saveReviewState(normalized);
    return normalized;
  }

  return emptyReviewState();
}

function emptyReviewState() {
  return {
    version: 2,
    updated_at: new Date().toISOString(),
    sources: [],
    drafts: [],
    items: [],
  };
}

function normalizeReviewState(state) {
  return {
    version: 2,
    updated_at: state.updated_at ?? new Date().toISOString(),
    sources: Array.isArray(state.sources) ? state.sources : [],
    drafts: Array.isArray(state.drafts) ? state.drafts : [],
    items: Array.isArray(state.items) ? state.items : [],
  };
}

function reviewStateSummary(state) {
  const countByStatus = (items) => items.reduce((acc, item) => {
    const status = item.status ?? "unknown";
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {});
  return {
    sources: { total: state.sources.length, ...countByStatus(state.sources) },
    drafts: { total: state.drafts.length, ...countByStatus(state.drafts) },
    items: { total: state.items.length, ...countByStatus(state.items) },
  };
}

function markStaleReviewState(state) {
  const now = new Date().toISOString();
  const cutoff = pendingReviewCutoffDate();
  const activeStatuses = new Set(["pending", "changes_requested"]);
  let changed = false;

  for (const item of [...state.sources, ...state.drafts]) {
    if (!activeStatuses.has(item.status)) continue;
    const updatedAt = new Date(item.updated_at ?? 0);
    if (Number.isNaN(updatedAt.getTime()) || updatedAt >= cutoff) continue;
    item.status = "stale";
    item.note = "Archived automatically: pending review was older than the freshness window.";
    item.updated_at = now;
    changed = true;
  }

  for (const item of state.items) {
    if (!activeStatuses.has(item.status)) continue;
    if (isFreshProjectForFinalReview(item)) continue;
    item.status = "stale";
    item.note = "Archived automatically: older than final review freshness window; not eligible for upload.";
    item.updated_at = now;
    changed = true;
  }

  const latestBySource = new Map();
  for (const item of state.items) {
    const key = projectSourceKey(item.projectSlug);
    if (!key) continue;
    const previous = latestBySource.get(key);
    if (!previous || projectDateTime(item) >= projectDateTime(previous)) {
      latestBySource.set(key, item);
    }
  }

  for (const item of state.items) {
    const key = projectSourceKey(item.projectSlug);
    if (!key || latestBySource.get(key) === item || item.status === "stale") continue;
    item.status = "stale";
    item.note = "Archived automatically: newer final package exists for the same source.";
    item.updated_at = now;
    changed = true;
  }

  return changed;
}

async function saveReviewState(state) {
  state.updated_at = new Date().toISOString();
  await writeJson(reviewStatePath, state);
}

async function upsertSourceReview(update) {
  const state = await loadReviewState();
  upsertByKey(state.sources, "sourceId", update.sourceId, update);
  await saveReviewState(state);
  return state.sources.find((item) => item.sourceId === update.sourceId);
}

async function upsertDraftReview(update) {
  const state = await loadReviewState();
  upsertByKey(state.drafts, "sourceId", update.sourceId, update);
  await saveReviewState(state);
  return state.drafts.find((item) => item.sourceId === update.sourceId);
}

async function upsertFinalReview(update) {
  const state = await loadReviewState();
  upsertByKey(state.items, "projectSlug", update.projectSlug, update);
  await saveReviewState(state);
  return state.items.find((item) => item.projectSlug === update.projectSlug);
}

function upsertByKey(list, key, value, update) {
  const index = list.findIndex((item) => item[key] === value);
  const next = {
    ...(index >= 0 ? list[index] : {}),
    ...update,
    updated_at: new Date().toISOString(),
  };
  if (index >= 0) list[index] = next;
  else list.push(next);
}

async function updateSourceReview(sourceId, status, note) {
  const updated = await upsertSourceReview({ sourceId, status, note });
  if (status === "approved" && archiveSourceCandidatesAfterSelection) {
    await archiveOtherPendingSourceReviews(sourceId);
  }
  printSummary("source review updated", updated);
}

async function archiveOtherPendingSourceReviews(selectedSourceId) {
  const state = await loadReviewState();
  const now = new Date().toISOString();
  const archived = [];

  for (const item of state.sources) {
    if (item.sourceId === selectedSourceId) continue;
    if (!SOURCE_REVIEW_GATE_STATUSES.has(item.status)) continue;
    item.status = "stale";
    item.note = `Archived automatically: source ${selectedSourceId} was selected for this candidate batch.`;
    item.updated_at = now;
    archived.push(item.sourceId);
  }

  if (!archived.length) return;
  await saveReviewState(state);
  printSummary("other source candidates archived", { selectedSourceId, archived });
}

async function updateDraftReview(sourceId, status, note) {
  const updated = await upsertDraftReview({ sourceId, status, note });
  printSummary("draft review updated", updated);
}

async function updateFinalReview(projectSlug, status, note) {
  const updated = await upsertFinalReview({ projectSlug, status, note });
  printSummary("final review updated", updated);
}

function sourceNeedsReview(item, sourceReview) {
  if (["source_approved", "approved", "ready"].includes(item.status ?? "")) return false;
  if (!sourceReview) return true;
  return !["pending", "approved", "rejected", "stale"].includes(sourceReview.status);
}

function isSourceApproved(item, state) {
  if (["source_approved", "approved", "ready"].includes(item.status ?? "")) return true;
  return state.sources.some((source) => source.sourceId === item.id && source.status === "approved");
}

function isDraftApproved(item, state) {
  if (["approved", "ready"].includes(item.status ?? "")) return true;
  return state.drafts.some((draft) => draft.sourceId === item.id && draft.status === "approved");
}

function isFinalBuildAllowed(item, state) {
  if (["approved", "ready"].includes(item.status ?? "")) return true;
  return isSourceApproved(item, state) && (!requireDraftApproval || isDraftApproved(item, state));
}

async function safeRead(filePath) {
  return existsSync(filePath) ? readFile(filePath, "utf8") : "";
}

function excerpt(text, maxLength) {
  const cleaned = (text ?? "").trim();
  if (!cleaned) return "(not generated yet)";
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).trim()}\n...`;
}

async function sendTelegramMessage(text) {
  await telegram("sendMessage", {
    chat_id: requireEnv("TELEGRAM_CHAT_ID"),
    text: text.slice(0, 3900),
    disable_web_page_preview: "true",
  });
}

async function sendTelegramPhoto(filePath, caption) {
  return sendTelegramMedia("sendPhoto", "photo", filePath, caption, "image/png");
}

async function sendTelegramVideo(filePath, caption) {
  return sendTelegramMedia("sendVideo", "video", filePath, caption, "video/mp4");
}

async function sendTelegramMedia(method, fieldName, filePath, caption, contentType) {
  const token = requireEnv("TELEGRAM_BOT_TOKEN");
  const form = new FormData();
  const buffer = await readFile(filePath);

  form.append("chat_id", requireEnv("TELEGRAM_CHAT_ID"));
  if (caption) form.append("caption", caption.slice(0, 1000));
  form.append(fieldName, new Blob([buffer], { type: contentType }), path.basename(filePath));

  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    body: form,
  });
  const data = await response.json();
  if (!response.ok || data.ok === false) {
    throw new Error(`Telegram API error: ${JSON.stringify(data)}`);
  }
  return data;
}

async function telegram(method, params) {
  const token = requireEnv("TELEGRAM_BOT_TOKEN");
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    body: new URLSearchParams(params),
  });
  const data = await response.json();
  if (!response.ok || data.ok === false) {
    throw new Error(`Telegram API error: ${JSON.stringify(data)}`);
  }
  return data;
}

function firstExistingPath(paths) {
  return paths.find((candidate) => candidate && existsSync(candidate)) ?? null;
}

function envFlag(name, defaultValue = false) {
  const value = process.env[name];
  if (value === undefined || value === "") return defaultValue;
  return ["1", "true", "yes", "y", "on"].includes(String(value).trim().toLowerCase());
}

function envNumber(name, defaultValue) {
  return positiveInteger(process.env[name], defaultValue);
}

function positiveInteger(value, defaultValue) {
  if (value === undefined || value === null || value === "") return defaultValue;
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return defaultValue;
  return Math.floor(number);
}

function normalizeAutoPublishKinds(value) {
  const aliases = {
    all: ["carousel", "reel"],
    both: ["carousel", "reel"],
    cards: ["carousel"],
    card: ["carousel"],
    carousel: ["carousel"],
    reel: ["reel"],
    reels: ["reel"],
  };
  const kinds = String(value ?? "")
    .split(/[,\s]+/)
    .flatMap((kind) => aliases[kind.trim().toLowerCase()] ?? [])
    .filter(Boolean);
  return [...new Set(kinds)].length ? [...new Set(kinds)] : ["carousel", "reel"];
}

function resolveAutoPublishPlatform() {
  const configured = process.env.HERMES_AUTO_PUBLISH_PLATFORM || options.auto_publish_platform;
  if (configured && configured !== "auto") return configured;
  const threadsReady = Boolean(process.env.THREADS_ACCESS_TOKEN && process.env.THREADS_USER_ID);
  return threadsReady ? "both" : "instagram";
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Put it in ${DEFAULT_ENV_FILE} or your shell environment.`);
  return value;
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

function normalizeInboxItems(inbox) {
  if (Array.isArray(inbox)) return inbox;
  return inbox.items ?? [];
}

function selectInboxItems(items, itemSelector) {
  if (!itemSelector) return items;
  const selectors = new Set(optionArray(itemSelector));
  return items.filter((item) => {
    return selectors.has(item.id) || selectors.has(item.projectSlug) || selectors.has(item.contentKey);
  });
}

function safeSlug(value) {
  return String(value ?? "item")
    .toLowerCase()
    .replace(/[^a-z0-9가-힣._-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96) || "item";
}

function sampleInboxV2() {
  return {
    version: 1,
    channel,
    generated_at: new Date().toISOString(),
    items: [
      {
        id: "sample-anyscale-ray-vllm",
        status: "candidate",
        priority: 5,
        title: "Ray + vLLM prefill/decode disaggregation on AMD MI325X",
        url: "https://www.anyscale.com/blog/ray-vllm-prefill-decode-disaggregation-amd-mi325x-67-percent-savings",
        summary: "Anyscale claims a serving architecture change reduced cost in a specific AMD MI325X benchmark.",
        angle: "GPU 비용을 줄이고 싶은 AI 인프라/개발자에게 '모델보다 서빙 구조를 먼저 보라'는 실무형 이야기.",
        sources: [
          {
            label: "official",
            url: "https://www.anyscale.com/blog/ray-vllm-prefill-decode-disaggregation-amd-mi325x-67-percent-savings",
            summary: "Original benchmark and architecture explanation.",
          },
        ],
        notes: [
          "Do not imply every workload saves 67%. Present it as benchmark-specific.",
          "Use visual proof: architecture split, GPU cost meter, benchmark screenshot/crop.",
        ],
      },
    ],
  };
}

function sampleInbox() {
  return {
    version: 1,
    channel,
    generated_at: new Date().toISOString(),
    items: [
      {
        id: "sample-anyscale-ray-vllm",
        status: "candidate",
        priority: 5,
        bucket: "official",
        title: "Ray + vLLM prefill/decode disaggregation on AMD MI325X",
        url: "https://www.anyscale.com/blog/ray-vllm-prefill-decode-disaggregation-amd-mi325x-67-percent-savings",
        summary: "Anyscale claims a serving architecture change reduced cost in a specific AMD MI325X benchmark.",
        angle: "GPU 비용 때문에 고민하는 AI 개발자에게 '모델보다 서빙 구조를 먼저 보라'는 실무형 이야기.",
        sources: [
          {
            label: "official",
            url: "https://www.anyscale.com/blog/ray-vllm-prefill-decode-disaggregation-amd-mi325x-67-percent-savings",
            summary: "Original benchmark and architecture explanation.",
          },
        ],
        notes: [
          "Do not imply every workload saves 67%. Present it as benchmark-specific.",
          "Use visual proof: architecture split, GPU cost meter, benchmark screenshot/crop.",
        ],
      },
    ],
  };
}

function envTemplate() {
  return [
    "# Hermes -> Codex -> Telegram review local env",
    "# Do not commit real tokens.",
    "",
    "# Telegram review bot",
    "TELEGRAM_BOT_TOKEN=",
    "TELEGRAM_CHAT_ID=",
    "",
    "# Optional Meta Instagram Graph API, used later only with --publish-approved --execute",
    "META_ACCESS_TOKEN=",
    "INSTAGRAM_USER_ID=",
    "META_TOKEN_EXPIRES_AT=",
    "",
    "# Optional Threads API, used later only with --publish-approved --execute",
    "THREADS_ACCESS_TOKEN=",
    "THREADS_USER_ID=",
    "THREADS_TOKEN_EXPIRES_AT=",
    "THREADS_GRAPH_BASE_URL=https://graph.threads.net/v1.0",
    "",
    "# Public base URL where carousel-workspace files are reachable by Meta APIs.",
    "# Example: https://cdn.example.com/carousel-workspace/",
    "PUBLIC_MEDIA_BASE_URL=",
    "",
    "# Auto-publish after final Telegram approval.",
    "# With these enabled, final ㄱㄱ/UPLOAD triggers CDN deploy + Meta upload automatically.",
    "AIJJUN_CDN_REPO_PATH=ai-jjun-cdn",
    "HERMES_AUTO_PUBLISH_ON_FINAL_APPROVAL=1",
    "HERMES_AUTO_PUBLISH_EXECUTE=1",
    "HERMES_AUTO_PUBLISH_PLATFORM=both",
    "HERMES_AUTO_PUBLISH_KINDS=carousel,reel",
    "HERMES_FINAL_REVIEW_MAX_AGE_DAYS=3",
    "HERMES_PENDING_REVIEW_MAX_AGE_DAYS=3",
    "",
    "# Hourly source scouting autopilot.",
    "# Sends 5-6 source candidates per hour and produces one selected/top-ranked source.",
    "# Final upload still waits for a rendered Telegram preview and explicit approval.",
    "HERMES_TELEGRAM_LIMIT=6",
    "HERMES_HOURLY_REVIEW_LIMIT=6",
    "HERMES_HOURLY_ITEM_LIMIT=1",
    "HERMES_REQUIRE_DRAFT_APPROVAL=0",
    "HERMES_AUTOPILOT_ON_NO_REVIEW=1",
    "HERMES_AUTOPILOT_SOURCE_REVIEW_MINUTES=60",
    "HERMES_SOURCE_ONLY_AUTOPILOT=0",
    "HERMES_AUTOPILOT_DAILY_PUBLISH_LIMIT=2",
    "HERMES_ARCHIVE_SOURCE_CANDIDATES_AFTER_SELECTION=1",
    "HERMES_DIRECT_SOURCE_IMMEDIATE=1",
    "",
    "# Optional YouTube Data API, used later only with --publish-approved --platform youtube/all --execute",
    "# OAuth refresh token must include https://www.googleapis.com/auth/youtube.upload scope.",
    "YOUTUBE_CLIENT_ID=",
    "YOUTUBE_CLIENT_SECRET=",
    "YOUTUBE_REFRESH_TOKEN=",
    "YOUTUBE_PRIVACY_STATUS=private",
    "YOUTUBE_CATEGORY_ID=28",
    "YOUTUBE_MADE_FOR_KIDS=false",
    "YOUTUBE_TAGS=AI,AI쭌,Codex",
    "",
  ].join("\n");
}

function printHelp() {
  console.log(`Hermes content orchestrator

Review-first flow:
  node tools/automation/hermes-content-orchestrator.mjs --init
  node tools/automation/hermes-content-orchestrator.mjs --refresh-sources --source-send
  node tools/automation/hermes-content-orchestrator.mjs --refresh-sources --force-refresh-sources --source-send
  node tools/automation/hermes-content-orchestrator.mjs --source-send
  node tools/automation/hermes-content-orchestrator.mjs --telegram-poll
  node tools/automation/hermes-content-orchestrator.mjs --draft-plan
  node tools/automation/hermes-content-orchestrator.mjs --run-draft-codex
  node tools/automation/hermes-content-orchestrator.mjs --draft-send
  node tools/automation/hermes-content-orchestrator.mjs --telegram-poll
  node tools/automation/hermes-content-orchestrator.mjs --plan
  node tools/automation/hermes-content-orchestrator.mjs --run-codex
  node tools/automation/hermes-content-orchestrator.mjs --build-queue --validate --telegram-send
  node tools/automation/hermes-content-orchestrator.mjs --telegram-poll
  node tools/automation/hermes-content-orchestrator.mjs --clean-review-state
  node tools/automation/hermes-content-orchestrator.mjs --publish-approved
  node tools/automation/hermes-content-orchestrator.mjs --publish-approved --platform all
  node tools/automation/hermes-content-orchestrator.mjs --publish-approved --platform all --execute

  # If HERMES_AUTO_PUBLISH_ON_FINAL_APPROVAL=1,
  # final Telegram approval (ㄱㄱ / UPLOAD) automatically runs ai-jjun-cdn publish.

Hourly/local automation:
  node tools/automation/hermes-content-orchestrator.mjs --hourly-once --refresh-sources --run-codex --skip-queue-validation

  # Recommended hourly mode:
  # - Telegram receives 5-6 source candidates per hour.
  # - Only one selected or top-ranked source moves into production per cycle.
  # - If no source review arrives within HERMES_AUTOPILOT_SOURCE_REVIEW_MINUTES,
  #   Hermes auto-approves the highest-priority source and archives the rest.
  # - The rendered final package is always sent back to Telegram for review.
  #   It is uploaded only after final approval/UPLOAD.
  # - If the user sends a URL directly in Telegram, Hermes bypasses source scouting
  #   and immediately starts production for that source.

Manual source intake:
  node tools/automation/hermes-content-orchestrator.mjs --add-source-url "https://example.com/source" --title "source title" --source-send

Telegram commands:
  ㄱㄱ <optional-id>
  대기 <optional-id>
  수정 <optional-id>: revision note
  ㄴㄴ <optional-id>
  SOURCE OK <source-id>
  SOURCE NO <source-id>: reason
  DRAFT OK <source-id>
  DRAFT REVISE <source-id>: revision note
  UPLOAD <project-slug>
  REVISE <project-slug>: revision note

Auto publish env:
  AIJJUN_CDN_REPO_PATH=ai-jjun-cdn
  HERMES_AUTO_PUBLISH_ON_FINAL_APPROVAL=1
  HERMES_AUTO_PUBLISH_EXECUTE=1
  HERMES_AUTO_PUBLISH_PLATFORM=both
  HERMES_AUTO_PUBLISH_KINDS=carousel,reel
  HERMES_FINAL_REVIEW_MAX_AGE_DAYS=3
  HERMES_PENDING_REVIEW_MAX_AGE_DAYS=3
  HERMES_TELEGRAM_LIMIT=6
  HERMES_HOURLY_REVIEW_LIMIT=6
  HERMES_HOURLY_ITEM_LIMIT=1
  HERMES_REQUIRE_DRAFT_APPROVAL=0
  HERMES_AUTOPILOT_ON_NO_REVIEW=1
  HERMES_AUTOPILOT_SOURCE_REVIEW_MINUTES=60
  HERMES_SOURCE_ONLY_AUTOPILOT=0
  HERMES_AUTOPILOT_DAILY_PUBLISH_LIMIT=2
  HERMES_ARCHIVE_SOURCE_CANDIDATES_AFTER_SELECTION=1
  HERMES_DIRECT_SOURCE_IMMEDIATE=1

Manual CLI commands:
  --approve-source <source-id>
  --reject-source <source-id> --note "reason"
  --approve-draft <source-id>
  --request-draft-changes <source-id> --note "revision"
  --approve <project-slug>
  --request-changes <project-slug> --note "revision"
  --remake <project-slug> --note "revision"

Important:
  Meta API is optional until --publish-approved --execute.
  --publish-approved without --execute is a dry-run upload plan.
  Final upload only proceeds for projects marked approved by UPLOAD/APPROVE.
`);
}
