#!/usr/bin/env node
import path from "node:path";
import {
  DEFAULT_FAILURE_LOG,
  DEFAULT_QUEUE_PATH,
  appendFailure,
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
loadEnvFile(resolvePath(options.env, DEFAULT_ENV_FILE));
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

const accessToken = process.env.THREADS_ACCESS_TOKEN;
const threadsUserId = process.env.THREADS_USER_ID;
const publicMediaBaseUrl = process.env.PUBLIC_MEDIA_BASE_URL;

if (!accessToken || !threadsUserId || !publicMediaBaseUrl) {
  await appendFailure(failureLog, {
    platform: "threads",
    stage: "credentials",
    message: "Missing THREADS_ACCESS_TOKEN, THREADS_USER_ID, or PUBLIC_MEDIA_BASE_URL.",
  });
  console.error("Missing THREADS_ACCESS_TOKEN, THREADS_USER_ID, or PUBLIC_MEDIA_BASE_URL.");
  process.exit(1);
}

if (isExpired(process.env.THREADS_TOKEN_EXPIRES_AT)) {
  await appendFailure(failureLog, {
    platform: "threads",
    stage: "credentials",
    message: "THREADS_TOKEN_EXPIRES_AT is expired.",
  });
  console.error("THREADS_TOKEN_EXPIRES_AT is expired.");
  process.exit(1);
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
  const imagePost = await createAndPublishThread(config, {
    media_type: item.platforms.threads.image ? "IMAGE" : "TEXT",
    text: item.platforms.threads.text,
    ...(item.platforms.threads.image
      ? { image_url: remoteUrlFor(item.platforms.threads.image, config.workspaceRoot, config.publicMediaBaseUrl) }
      : {}),
  });
  const videoPost = item.platforms.threads.video
    ? await createAndPublishThread(config, {
        media_type: "VIDEO",
        text: item.platforms.threads.text,
        video_url: remoteUrlFor(item.platforms.threads.video, config.workspaceRoot, config.publicMediaBaseUrl),
      })
    : null;
  return { itemId: item.id, projectSlug: item.projectSlug, imagePost, videoPost };
}

async function createAndPublishThread(config, params) {
  const container = await threadsPost(config, `${config.threadsUserId}/threads`, params);
  const published = await threadsPost(config, `${config.threadsUserId}/threads_publish`, {
    creation_id: container.id,
  });
  return { containerId: container.id, mediaId: published.id };
}

async function threadsPost(config, resourcePath, params) {
  const url = `https://graph.threads.net/v1.0/${resourcePath}`;
  const body = new URLSearchParams({ ...params, access_token: config.accessToken });
  const response = await fetch(url, { method: "POST", body });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Threads API error at ${resourcePath}: ${JSON.stringify(data)}`);
  }
  return data;
}

function remoteUrlFor(filePath, workspaceRoot, publicBaseUrl) {
  const relativePath = path.relative(workspaceRoot, filePath).split(path.sep).map(encodeURIComponent).join("/");
  return new URL(relativePath, publicBaseUrl.endsWith("/") ? publicBaseUrl : `${publicBaseUrl}/`).href;
}
