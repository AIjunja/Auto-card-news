#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_FAILURE_LOG,
  DEFAULT_QUEUE_PATH,
  appendFailure,
  getThreadsCardImages,
  getThreadsPublishFields,
  planThreadsPublish,
  readJsonIfExists,
  validateQueue,
  writeJson,
} from "./lib/publish-utils.mjs";
import {
  DEFAULT_ENV_FILE,
  isExpired,
  loadEnvFile,
  parseArgs,
  printSummary,
  resolvePath,
  selectQueueItems,
} from "./lib/cli-utils.mjs";

const { options, flags } = parseArgs();
const envPath = resolvePath(options.env, DEFAULT_ENV_FILE);
loadEnvFile(envPath);
const dryRun = !flags.has("execute");
const queuePath = resolvePath(options.queue, DEFAULT_QUEUE_PATH);
const failureLog = resolvePath(options.failure_log, DEFAULT_FAILURE_LOG);
const planOut = resolvePath(options.out, path.join("carousel-workspace", "publish-threads-plan.json"));
const queue = await readJsonIfExists(queuePath, null);

if (!queue) {
  console.error(`Queue file not found: ${queuePath}`);
  process.exit(1);
}

const selectedItems = selectQueueItems(queue, options.item);
if (!selectedItems.length) {
  console.error("No queue items matched. Use --item <id-or-project-slug>, or omit it to plan all items.");
  process.exit(1);
}

const selectedQueue = { ...queue, items: selectedItems };
const validation = await validateQueue(selectedQueue);
if (validation.summary.errors > 0) {
  await appendFailure(failureLog, {
    platform: "threads",
    stage: "preflight",
    queue: queuePath,
    errors: validation.summary.errors,
    items: validation.items,
  });
  console.error(`Threads preflight blocked: ${validation.summary.errors} error(s). See ${failureLog}`);
  process.exit(1);
}

const plans = selectedItems.map((item) => planThreadsPublish(item, { dryRun }));
await writeJson(planOut, {
  platform: "threads",
  dryRun,
  queue: queuePath,
  generated_at: new Date().toISOString(),
  plans,
});

if (dryRun) {
  printSummary("threads dry-run plan written", {
    out: planOut,
    items: plans.length,
    jobs: plans.reduce((total, plan) => total + plan.jobs.length, 0),
  });
  process.exit(0);
}

let accessToken = process.env.THREADS_ACCESS_TOKEN;
const threadsUserId = process.env.THREADS_USER_ID;
let tokenExpiresAt = process.env.THREADS_TOKEN_EXPIRES_AT;
const publicMediaBaseUrl = process.env.PUBLIC_MEDIA_BASE_URL;

if (!accessToken || !threadsUserId || !tokenExpiresAt || !publicMediaBaseUrl) {
  await appendFailure(failureLog, {
    platform: "threads",
    stage: "credentials",
    message: "Missing THREADS_ACCESS_TOKEN, THREADS_USER_ID, THREADS_TOKEN_EXPIRES_AT, or PUBLIC_MEDIA_BASE_URL.",
  });
  console.error("Missing THREADS_ACCESS_TOKEN, THREADS_USER_ID, THREADS_TOKEN_EXPIRES_AT, or PUBLIC_MEDIA_BASE_URL.");
  process.exit(1);
}

if (isExpired(tokenExpiresAt)) {
  await appendFailure(failureLog, {
    platform: "threads",
    stage: "credentials",
    message: "THREADS_TOKEN_EXPIRES_AT is expired.",
  });
  console.error("THREADS_TOKEN_EXPIRES_AT is expired. Generate a fresh Threads token once, then this script can auto-refresh before future expiry.");
  process.exit(1);
}

const refreshedToken = await refreshThreadsTokenIfNeeded({
  accessToken,
  envPath,
  expiresAt: tokenExpiresAt,
  refreshWindowDays: Number(options.refresh_window_days ?? 7),
});
if (refreshedToken) {
  accessToken = refreshedToken.accessToken;
  tokenExpiresAt = refreshedToken.expiresAt;
}

const publishResults = [];
for (const item of selectedItems) {
  try {
    publishResults.push(await publishThreadsItem(item, {
      accessToken,
      threadsUserId,
      publicMediaBaseUrl,
      workspaceRoot: queue.workspaceRoot,
    }));
  } catch (error) {
    await appendFailure(failureLog, {
      platform: "threads",
      stage: "publish",
      itemId: item.id,
      message: error.message,
    });
    throw error;
  }
}

const resultOut = resolvePath(options.result_out, path.join("carousel-workspace", "publish-threads-result.json"));
await writeJson(resultOut, {
  platform: "threads",
  published_at: new Date().toISOString(),
  results: publishResults,
});

printSummary("threads publish complete", {
  items: publishResults.length,
  resultOut,
});

async function publishThreadsItem(item, config) {
  const threadsFields = getThreadsPublishFields(item);
  const images = getThreadsCardImages(item);
  const cardPost = await createAndPublishCardsThread(config, images, threadsFields);
  return { itemId: item.id, projectSlug: item.projectSlug, cardPost };
}

async function createAndPublishCardsThread(config, images, fields) {
  if (images.length > 1) {
    const childContainerIds = [];
    for (const image of images) {
      const child = await threadsPost(config, `${config.threadsUserId}/threads`, {
        media_type: "IMAGE",
        image_url: remoteUrlFor(image, config.workspaceRoot, config.publicMediaBaseUrl),
        is_carousel_item: "true",
      });
      childContainerIds.push(child.id);
    }

    return createAndPublishThread(config, {
      media_type: "CAROUSEL",
      text: fields.text,
      ...(fields.topicTag ? { topic_tag: fields.topicTag } : {}),
      children: childContainerIds.join(","),
    }, fields.replyText);
  }

  return createAndPublishThread(config, {
    media_type: images.length === 1 ? "IMAGE" : "TEXT",
    text: fields.text,
    ...(fields.topicTag ? { topic_tag: fields.topicTag } : {}),
    ...(images.length === 1
      ? { image_url: remoteUrlFor(images[0], config.workspaceRoot, config.publicMediaBaseUrl) }
      : {}),
  }, fields.replyText);
}

async function createAndPublishThread(config, params, replyText = "") {
  const container = await threadsPost(config, `${config.threadsUserId}/threads`, params);
  const published = await threadsPost(config, `${config.threadsUserId}/threads_publish`, {
    creation_id: container.id,
  });
  const reply = replyText ? await createAndPublishReply(config, published.id, replyText) : null;
  return { containerId: container.id, mediaId: published.id, reply };
}

async function createAndPublishReply(config, parentThreadId, text) {
  const container = await threadsPost(config, `${config.threadsUserId}/threads`, {
    media_type: "TEXT",
    text,
    reply_to_id: parentThreadId,
  });
  const published = await threadsPost(config, `${config.threadsUserId}/threads_publish`, {
    creation_id: container.id,
  });
  return { containerId: container.id, mediaId: published.id };
}

async function threadsPost(config, resourcePath, params) {
  const url = `https://graph.threads.net/v1.0/${resourcePath}`;
  const maxAttempts = resourcePath.endsWith("/threads_publish") ? 5 : 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const body = new URLSearchParams({ ...params, access_token: config.accessToken });
    const response = await fetch(url, { method: "POST", body });
    const data = await response.json();
    if (response.ok) return data;

    const shouldRetry =
      resourcePath.endsWith("/threads_publish") &&
      data?.error?.code === 24 &&
      data?.error?.error_subcode === 4279009 &&
      attempt < maxAttempts;

    if (!shouldRetry) {
      throw new Error(`Threads API error at ${resourcePath}: ${JSON.stringify(data)}`);
    }

    await sleep(2000 * attempt);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function remoteUrlFor(filePath, workspaceRoot, publicBaseUrl) {
  const relativePath = path.relative(workspaceRoot, filePath).split(path.sep).map(encodeURIComponent).join("/");
  return new URL(relativePath, publicBaseUrl.endsWith("/") ? publicBaseUrl : `${publicBaseUrl}/`).href;
}

async function refreshThreadsTokenIfNeeded({ accessToken, envPath, expiresAt, refreshWindowDays }) {
  if (!accessToken || !expiresAt) return null;

  const expiresAtMs = Date.parse(expiresAt);
  if (!Number.isFinite(expiresAtMs)) return null;

  const refreshAtMs = Date.now() + Math.max(refreshWindowDays, 1) * 24 * 60 * 60 * 1000;
  if (expiresAtMs > refreshAtMs) return null;

  const url = new URL("https://graph.threads.net/refresh_access_token");
  url.searchParams.set("grant_type", "th_refresh_token");
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url);
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Threads token refresh failed: ${response.status} ${text}`);
  }

  if (!response.ok || data.error) {
    throw new Error(`Threads token refresh failed: ${response.status} ${JSON.stringify(scrubTokenError(data))}`);
  }

  const nextAccessToken = data.access_token;
  const nextExpiresAt = computeExpiresAt(data.expires_in);
  if (!nextAccessToken) return null;

  upsertEnvFile(envPath, {
    THREADS_ACCESS_TOKEN: nextAccessToken,
    THREADS_TOKEN_EXPIRES_AT: nextExpiresAt,
  });

  console.log(`Threads token refreshed automatically. Expires at ${nextExpiresAt}`);
  return { accessToken: nextAccessToken, expiresAt: nextExpiresAt };
}

function computeExpiresAt(expiresIn) {
  const seconds = Number.isFinite(Number(expiresIn)) ? Number(expiresIn) : 60 * 24 * 60 * 60;
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function upsertEnvFile(filePath, updates) {
  const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "") : "";
  const lines = existing.split(/\r?\n/);
  const seen = new Set();

  const nextLines = lines.map((line) => {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=/);
    if (!match || updates[match[1]] === undefined) return line;
    seen.add(match[1]);
    return `${match[1]}=${updates[match[1]]}`;
  });

  for (const [key, value] of Object.entries(updates)) {
    if (!seen.has(key)) nextLines.push(`${key}=${value}`);
  }

  fs.writeFileSync(filePath, nextLines.join("\n").replace(/\n{3,}/g, "\n\n"), "utf8");
}

function scrubTokenError(data) {
  if (!data || typeof data !== "object") return data;
  const clone = JSON.parse(JSON.stringify(data));
  if (clone.access_token) clone.access_token = "[redacted]";
  if (clone.error?.access_token) clone.error.access_token = "[redacted]";
  return clone;
}
