#!/usr/bin/env node
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
loadEnvFile(resolvePath(options.env, DEFAULT_ENV_FILE));
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

const accessToken = process.env.META_ACCESS_TOKEN;
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
  console.error("META_TOKEN_EXPIRES_AT is expired.");
  process.exit(1);
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
  const published = await graphPost(config, `${config.instagramUserId}/media_publish`, {
    creation_id: container.id,
  });
  return { containerId: container.id, mediaId: published.id };
}

async function publishReel(item, config) {
  const container = await graphPost(config, `${config.instagramUserId}/media`, {
    media_type: "REELS",
    video_url: remoteUrlFor(item.assets.reel, config.workspaceRoot, config.publicMediaBaseUrl),
    caption: item.captions.instagram,
    share_to_feed: "true",
  });
  await waitForMediaContainer(config, container.id);
  const published = await graphPost(config, `${config.instagramUserId}/media_publish`, {
    creation_id: container.id,
  });
  return { containerId: container.id, mediaId: published.id };
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
