#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  DEFAULT_FAILURE_LOG,
  DEFAULT_QUEUE_PATH,
  appendFailure,
  planYouTubePublish,
  readJsonIfExists,
  validateQueue,
  writeJson,
} from "./lib/publish-utils.mjs";
import {
  DEFAULT_ENV_FILE,
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
const planOut = resolvePath(options.out, path.join("carousel-workspace", "publish-youtube-plan.json"));
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
    platform: "youtube",
    stage: "preflight",
    queue: queuePath,
    errors: validation.summary.errors,
    items: validation.items,
  });
  console.error(`YouTube preflight blocked: ${validation.summary.errors} error(s). See ${failureLog}`);
  process.exit(1);
}

const plans = selectedItems.map((item) => planYouTubePublish(item, { dryRun }));
await writeJson(planOut, {
  platform: "youtube",
  dryRun,
  queue: queuePath,
  generated_at: new Date().toISOString(),
  plans,
});

if (dryRun) {
  printSummary("youtube dry-run plan written", {
    out: planOut,
    items: plans.length,
    jobs: plans.reduce((total, plan) => total + plan.jobs.length, 0),
  });
  process.exit(0);
}

const clientId = process.env.YOUTUBE_CLIENT_ID;
const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;

if (!clientId || !clientSecret || !refreshToken) {
  await appendFailure(failureLog, {
    platform: "youtube",
    stage: "credentials",
    message: "Missing YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, or YOUTUBE_REFRESH_TOKEN.",
  });
  console.error("Missing YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, or YOUTUBE_REFRESH_TOKEN.");
  process.exit(1);
}

const accessToken = await refreshYouTubeAccessToken({ clientId, clientSecret, refreshToken });
const publishResults = [];
for (const item of selectedItems) {
  if (!item.platforms.youtube?.enabled) {
    publishResults.push({ itemId: item.id, projectSlug: item.projectSlug, skipped: "no_reel_video" });
    continue;
  }

  try {
    publishResults.push(await publishYouTubeItem(item, {
      accessToken,
      privacyStatus: process.env.YOUTUBE_PRIVACY_STATUS || "private",
      categoryId: process.env.YOUTUBE_CATEGORY_ID || "28",
      madeForKids: String(process.env.YOUTUBE_MADE_FOR_KIDS ?? "false").toLowerCase() === "true",
      failureLog,
    }));
  } catch (error) {
    await appendFailure(failureLog, {
      platform: "youtube",
      stage: "publish",
      itemId: item.id,
      message: error.message,
    });
    throw error;
  }
}

const resultOut = resolvePath(options.result_out, path.join("carousel-workspace", "publish-youtube-result.json"));
await writeJson(resultOut, {
  platform: "youtube",
  published_at: new Date().toISOString(),
  results: publishResults,
});

printSummary("youtube publish complete", {
  items: publishResults.length,
  resultOut,
});

async function refreshYouTubeAccessToken({ clientId, clientSecret, refreshToken }) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(`YouTube OAuth refresh failed: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

async function publishYouTubeItem(item, config) {
  const videoPath = item.platforms.youtube.video;
  const videoBytes = await readFile(videoPath);
  const metadata = {
    snippet: {
      title: item.platforms.youtube.title,
      description: item.platforms.youtube.description,
      tags: mergeTags(item.platforms.youtube.tags, process.env.YOUTUBE_TAGS),
      categoryId: config.categoryId,
    },
    status: {
      privacyStatus: config.privacyStatus,
      selfDeclaredMadeForKids: config.madeForKids,
    },
  };

  const uploadLocation = await startResumableUpload({ accessToken: config.accessToken, metadata, videoBytes });
  const video = await uploadVideoBytes({ accessToken: config.accessToken, uploadLocation, videoBytes });
  const thumbnailResult = await maybeSetThumbnail({
    accessToken: config.accessToken,
    videoId: video.id,
    thumbnailPath: item.platforms.youtube.thumbnail,
    failureLog: config.failureLog,
    itemId: item.id,
  });

  return {
    itemId: item.id,
    projectSlug: item.projectSlug,
    videoId: video.id,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    privacyStatus: config.privacyStatus,
    thumbnail: thumbnailResult,
  };
}

function mergeTags(generatedTags = [], envTags = "") {
  const manual = envTags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  return [...new Set([...generatedTags, ...manual])].slice(0, 25);
}

async function startResumableUpload({ accessToken, metadata, videoBytes }) {
  const response = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Length": String(videoBytes.length),
      "X-Upload-Content-Type": "video/mp4",
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const data = await response.text();
    throw new Error(`YouTube resumable upload start failed: ${data}`);
  }

  const uploadLocation = response.headers.get("location");
  if (!uploadLocation) {
    throw new Error("YouTube resumable upload did not return a Location header.");
  }
  return uploadLocation;
}

async function uploadVideoBytes({ accessToken, uploadLocation, videoBytes }) {
  const response = await fetch(uploadLocation, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "video/mp4",
      "Content-Length": String(videoBytes.length),
    },
    body: videoBytes,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`YouTube video upload failed: ${JSON.stringify(data)}`);
  }
  return data;
}

async function maybeSetThumbnail({ accessToken, videoId, thumbnailPath, failureLog, itemId }) {
  if (!thumbnailPath || !existsSync(thumbnailPath)) {
    return { skipped: "missing_thumbnail" };
  }

  try {
    const thumbnailBytes = await readFile(thumbnailPath);
    const response = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${encodeURIComponent(videoId)}&uploadType=media`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "image/png",
        "Content-Length": String(thumbnailBytes.length),
      },
      body: thumbnailBytes,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }
    return { videoId, status: "set", response: data };
  } catch (error) {
    await appendFailure(failureLog, {
      platform: "youtube",
      stage: "thumbnail",
      itemId,
      message: error.message,
    });
    return { videoId, status: "failed_non_blocking", message: error.message };
  }
}
