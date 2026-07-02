#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_FAILURE_LOG,
  DEFAULT_QUEUE_PATH,
  appendFailure,
  planInstagramPublish,
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
const jobFilter = options.job ?? "all";
const queuePath = resolvePath(options.queue, DEFAULT_QUEUE_PATH);
const failureLog = resolvePath(options.failure_log, DEFAULT_FAILURE_LOG);
const planOut = resolvePath(options.out, path.join("carousel-workspace", "publish-instagram-plan.json"));
const queue = await readJsonIfExists(queuePath, null);

if (!queue) {
  console.error(`Queue file not found: ${queuePath}`);
  process.exit(1);
}

if (!["all", "carousel", "reel"].includes(jobFilter)) {
  console.error("Invalid --job value. Use all, carousel, or reel.");
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
    platform: "instagram",
    stage: "preflight",
    queue: queuePath,
    errors: validation.summary.errors,
    items: validation.items,
  });
  console.error(`Instagram preflight blocked: ${validation.summary.errors} error(s). See ${failureLog}`);
  process.exit(1);
}

const plans = selectedItems.map((item) => planInstagramPublish(item, { dryRun }));
await writeJson(planOut, {
  platform: "instagram",
  dryRun,
  queue: queuePath,
  generated_at: new Date().toISOString(),
  plans,
});

if (dryRun) {
  printSummary("instagram dry-run plan written", {
    out: planOut,
    items: plans.length,
    jobs: plans.reduce((total, plan) => total + plan.jobs.length, 0),
  });
  process.exit(0);
}

let accessToken = process.env.META_ACCESS_TOKEN;
const instagramUserId = process.env.INSTAGRAM_USER_ID;
const publicMediaBaseUrl = process.env.PUBLIC_MEDIA_BASE_URL;
const graphBaseUrl = process.env.INSTAGRAM_GRAPH_BASE_URL || "https://graph.instagram.com/v25.0";

if (!accessToken || !instagramUserId || !publicMediaBaseUrl) {
  await appendFailure(failureLog, {
    platform: "instagram",
    stage: "credentials",
    message: "Missing META_ACCESS_TOKEN, INSTAGRAM_USER_ID, or PUBLIC_MEDIA_BASE_URL.",
  });
  console.error("Missing META_ACCESS_TOKEN, INSTAGRAM_USER_ID, or PUBLIC_MEDIA_BASE_URL.");
  process.exit(1);
}

if (isExpired(process.env.META_TOKEN_EXPIRES_AT)) {
  await appendFailure(failureLog, {
    platform: "instagram",
    stage: "credentials",
    message: "META_TOKEN_EXPIRES_AT is expired.",
  });
  console.error("META_TOKEN_EXPIRES_AT is expired. Generate a fresh Instagram token once, then this script can auto-refresh before future expiry.");
  process.exit(1);
}

const refreshedToken = await refreshInstagramTokenIfNeeded({
  accessToken,
  envPath,
  expiresAt: process.env.META_TOKEN_EXPIRES_AT,
  refreshWindowDays: Number(options.refresh_window_days ?? 7),
});
if (refreshedToken) {
  accessToken = refreshedToken.accessToken;
}

const publishResults = [];
for (const item of selectedItems) {
  try {
    publishResults.push(await publishInstagramItem(item, {
      accessToken,
      instagramUserId,
      publicMediaBaseUrl,
      graphBaseUrl,
      workspaceRoot: queue.workspaceRoot,
      jobFilter,
    }));
  } catch (error) {
    await appendFailure(failureLog, {
      platform: "instagram",
      stage: "publish",
      itemId: item.id,
      message: error.message,
    });
    throw error;
  }
}

await writeJson(resolvePath(options.result_out, path.join("carousel-workspace", "publish-instagram-result.json")), {
  platform: "instagram",
  published_at: new Date().toISOString(),
  results: publishResults,
});

printSummary("instagram publish complete", {
  items: publishResults.length,
  resultOut: resolvePath(options.result_out, path.join("carousel-workspace", "publish-instagram-result.json")),
});

async function publishInstagramItem(item, config) {
  const carousel = config.jobFilter !== "reel" ? await publishCarousel(item, config) : null;
  const reel = config.jobFilter !== "carousel" && item.assets.reel ? await publishReel(item, config) : null;
  return { itemId: item.id, projectSlug: item.projectSlug, carousel, reel };
}

async function publishCarousel(item, config) {
  const childIds = [];
  for (const card of item.assets.cards) {
    const child = await graphPost(config, `${config.instagramUserId}/media`, {
      image_url: remoteUrlFor(card, config.workspaceRoot, config.publicMediaBaseUrl),
      is_carousel_item: "true",
    });
    childIds.push(child.id);
  }
  const container = await graphPost(config, `${config.instagramUserId}/media`, {
    media_type: "CAROUSEL",
    children: childIds.join(","),
    caption: item.captions.instagram,
  });
  const published = await publishMediaContainer(config, container.id);
  return { containerId: container.id, mediaId: published.id };
}

async function publishReel(item, config) {
  const container = await graphPost(config, `${config.instagramUserId}/media`, {
    media_type: "REELS",
    video_url: remoteUrlFor(item.assets.reel, config.workspaceRoot, config.publicMediaBaseUrl),
    caption: item.captions.instagram,
    share_to_feed: "true",
  });
  const published = await publishMediaContainer(config, container.id);
  return { containerId: container.id, mediaId: published.id };
}

async function publishMediaContainer(config, containerId) {
  const maxAttempts = Number(process.env.INSTAGRAM_PUBLISH_ATTEMPTS ?? 12);
  const delayMs = Number(process.env.INSTAGRAM_PUBLISH_DELAY_MS ?? 5000);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    await waitForMediaContainer(config, containerId);
    try {
      return await graphPost(config, `${config.instagramUserId}/media_publish`, {
        creation_id: containerId,
      });
    } catch (error) {
      if (!isMediaNotReadyError(error) || attempt === maxAttempts) throw error;
      await sleep(delayMs);
    }
  }

  throw new Error(`Instagram media container was not publishable: ${containerId}`);
}

async function waitForMediaContainer(config, containerId) {
  const maxAttempts = Number(process.env.INSTAGRAM_MEDIA_READY_ATTEMPTS ?? 30);
  const delayMs = Number(process.env.INSTAGRAM_MEDIA_READY_DELAY_MS ?? 5000);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const status = await graphGet(config, `${containerId}`, {
      fields: "status_code,status",
    });
    if (status.status_code === "FINISHED" || status.status_code === "PUBLISHED") return status;
    if (status.status_code === "ERROR" || status.status_code === "EXPIRED") {
      throw new Error(`Instagram media container failed: ${JSON.stringify(status)}`);
    }
    await sleep(delayMs);
  }

  throw new Error(`Instagram media container was not ready after ${maxAttempts} attempts: ${containerId}`);
}

async function graphPost(config, resourcePath, params) {
  const url = `${config.graphBaseUrl.replace(/\/$/, "")}/${resourcePath}`;
  const body = new URLSearchParams({ ...params, access_token: config.accessToken });
  const response = await fetch(url, { method: "POST", body });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Meta API error at ${resourcePath}: ${JSON.stringify(data)}`);
  }
  return data;
}

function isMediaNotReadyError(error) {
  return error.message.includes('"code":9007') || error.message.includes("Media ID is not available");
}

async function graphGet(config, resourcePath, params) {
  const url = new URL(`${config.graphBaseUrl.replace(/\/$/, "")}/${resourcePath}`);
  for (const [key, value] of Object.entries({ ...params, access_token: config.accessToken })) {
    url.searchParams.set(key, value);
  }
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Meta API error at ${resourcePath}: ${JSON.stringify(data)}`);
  }
  return data;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function remoteUrlFor(filePath, workspaceRoot, publicBaseUrl) {
  const relativePath = path.relative(workspaceRoot, filePath).split(path.sep).map(encodeURIComponent).join("/");
  return new URL(relativePath, publicBaseUrl.endsWith("/") ? publicBaseUrl : `${publicBaseUrl}/`).href;
}

async function refreshInstagramTokenIfNeeded({ accessToken, envPath, expiresAt, refreshWindowDays }) {
  if (!accessToken || !expiresAt) return null;

  const expiresAtMs = Date.parse(expiresAt);
  if (!Number.isFinite(expiresAtMs)) return null;

  const refreshAtMs = Date.now() + Math.max(refreshWindowDays, 1) * 24 * 60 * 60 * 1000;
  if (expiresAtMs > refreshAtMs) return null;

  const refreshed = await refreshInstagramToken(accessToken);
  const nextExpiresAt = computeExpiresAt(refreshed.expires_in);

  upsertEnvFile(envPath, {
    META_ACCESS_TOKEN: refreshed.access_token,
    META_TOKEN_EXPIRES_AT: nextExpiresAt,
  });

  console.log(`Instagram token refreshed automatically. Expires at ${nextExpiresAt}`);
  return { accessToken: refreshed.access_token, expiresAt: nextExpiresAt };
}

async function refreshInstagramToken(accessToken) {
  const url = new URL("https://graph.instagram.com/refresh_access_token");
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url);
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Instagram token refresh failed: ${response.status} ${text}`);
  }

  if (!response.ok || data.error) {
    throw new Error(`Instagram token refresh failed: ${response.status} ${JSON.stringify(scrubTokenError(data))}`);
  }

  return data;
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
