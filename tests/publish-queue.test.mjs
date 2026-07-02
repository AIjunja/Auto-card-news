import assert from "node:assert/strict";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  buildQueue,
  planInstagramPublish,
  planThreadsPublish,
  scheduleDueItems,
  splitCaptions,
  validateQueue,
} from "../tools/publish/lib/publish-utils.mjs";

const ROOT = path.resolve(".test-tmp", "publish-queue");

function pngBytes(width, height) {
  const bytes = Buffer.alloc(64);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(bytes, 0);
  bytes.writeUInt32BE(13, 8);
  bytes.write("IHDR", 12, "ascii");
  bytes.writeUInt32BE(width, 16);
  bytes.writeUInt32BE(height, 20);
  return bytes;
}

async function createProject(slug, options = {}) {
  const project = path.join(ROOT, "projects", "ai-jjuun", slug);
  const output = path.join(project, "output");
  await mkdir(output, { recursive: true });

  const cardSize = options.badCardRatio ? [1000, 1000] : [1080, 1350];
  for (let index = 1; index <= 7; index += 1) {
    const filename = `card-${String(index).padStart(2, "0")}.png`;
    await writeFile(path.join(output, filename), pngBytes(cardSize[0], cardSize[1]));
  }
  await writeFile(path.join(output, options.previewFrameOnly ? "reel-preview-frame-01.png" : "reel-frame-05s.png"), pngBytes(1080, 1920));
  await writeFile(path.join(output, options.previewReelOnly ? "reel-preview.mp4" : "reel.mp4"), Buffer.alloc(options.smallReel ? 100 : 220_000));

  const caption = options.caption ?? [
    "Hook: one useful AI update.",
    "",
    "Short practical caption for Instagram.",
    "https://github.com/example/source",
    "",
    "Contents Editor - AI JJUN",
    "Source - example/source",
  ].join("\n");
  await writeFile(path.join(project, "caption.md"), caption, "utf8");
  if (!options.noSourcePack) {
    await writeFile(path.join(project, "source-pack.md"), "https://github.com/example/source\n", "utf8");
  }
  return project;
}

test.beforeEach(async () => {
  await rm(ROOT, { recursive: true, force: true });
});

test.after(async () => {
  await rm(ROOT, { recursive: true, force: true });
});

test("buildQueue discovers generated card-news projects and splits platform captions", async () => {
  const project = await createProject("2026-05-07-test-topic");

  const queue = await buildQueue({
    workspaceRoot: ROOT,
    channel: "ai-jjuun",
    now: "2026-05-07T09:00:00.000Z",
  });

  assert.equal(queue.version, 1);
  assert.equal(queue.items.length, 1);
  const item = queue.items[0];
  assert.equal(item.projectSlug, "2026-05-07-test-topic");
  assert.equal(item.projectPath, project);
  assert.equal(item.assets.cards.length, 7);
  assert.match(item.assets.reel, /reel\.mp4$/);
  assert.equal(item.platforms.instagram.carousel.enabled, true);
  assert.equal(item.platforms.instagram.reel.enabled, true);
  assert.equal(item.platforms.threads.enabled, true);
  assert.equal(item.platforms.threads.images.length, 7);
  assert.ok(item.platforms.threads.text.length <= 500);
  assert.match(item.platforms.threads.replyText, /github\.com\/example\/source/);
  assert.equal(item.platforms.threads.topicTag, "AI Threads");
  assert.deepEqual(item.sourceLinks, ["https://github.com/example/source"]);

  const validation = await validateQueue(queue);
  assert.deepEqual(validation.summary, { items: 1, errors: 0, warnings: 0 });
});

test("buildQueue accepts reel-preview aliases from generated packages", async () => {
  await createProject("2026-05-07-preview-reel-topic", {
    previewReelOnly: true,
    previewFrameOnly: true,
  });

  const queue = await buildQueue({
    workspaceRoot: ROOT,
    channel: "ai-jjuun",
  });

  const item = queue.items[0];
  assert.match(item.assets.reel, /reel-preview\.mp4$/);
  assert.match(item.assets.reelFrame, /reel-preview-frame-01\.png$/);
  assert.equal(item.platforms.instagram.reel.enabled, true);
  assert.equal(item.platforms.threads.video, null);
  assert.equal(item.platforms.threads.images.length, 7);

  const validation = await validateQueue(queue);
  assert.deepEqual(validation.summary, { items: 1, errors: 0, warnings: 0 });
});

test("buildQueue keeps only the latest date-stamped project for the same source", async () => {
  await createProject("2026-05-07-duplicate-source-topic");
  await createProject("2026-05-08-duplicate-source-topic");

  const queue = await buildQueue({
    workspaceRoot: ROOT,
    channel: "ai-jjuun",
  });

  assert.equal(queue.items.length, 1);
  assert.equal(queue.items[0].projectSlug, "2026-05-08-duplicate-source-topic");
  assert.equal(queue.items[0].sourceKey, "duplicate-source-topic");
});

test("splitCaptions keeps Instagram rich and moves Threads links to a source reply", () => {
  const caption = [
    "First line is the hook.",
    "",
    "Second paragraph explains the point.",
    "https://example.com/a",
    "https://example.com/b",
    "Contents Editor - AI JJUN",
  ].join("\n");

  const result = splitCaptions(caption);

  assert.equal(result.instagram, caption);
  assert.ok(result.threads.length <= 500);
  assert.match(result.threads, /First line/);
  assert.doesNotMatch(result.threads, /https:\/\/example\.com\/a/);
  assert.match(result.threadsComment, /https:\/\/example\.com\/a/);
  assert.equal(result.threadsTopicTag, "AI Threads");
});

test("validateQueue reports ratio, caption, source, and size failures", async () => {
  await createProject("2026-05-07-bad-topic", {
    badCardRatio: true,
    smallReel: true,
    noSourcePack: true,
    caption: "A caption without source links and too many words. ".repeat(180),
  });
  const queue = await buildQueue({ workspaceRoot: ROOT, channel: "ai-jjuun" });

  const validation = await validateQueue(queue);

  assert.equal(validation.summary.items, 1);
  assert.ok(validation.summary.errors >= 4);
  const messages = validation.items[0].problems.map((problem) => problem.message).join("\n");
  assert.match(messages, /4:5/);
  assert.match(messages, /reel\.mp4/);
  assert.match(messages, /Instagram caption/);
  assert.match(messages, /source link/);
});

test("publish planners stay dry-run and describe official API jobs", async () => {
  await createProject("2026-05-07-test-topic");
  const queue = await buildQueue({ workspaceRoot: ROOT, channel: "ai-jjuun" });
  const item = queue.items[0];

  const instagram = planInstagramPublish(item, { dryRun: true });
  const threads = planThreadsPublish(item, { dryRun: true });

  assert.equal(instagram.dryRun, true);
  assert.deepEqual(instagram.jobs.map((job) => job.type), ["instagram_carousel", "instagram_reel"]);
  assert.match(instagram.jobs[0].endpoint, /graph\.facebook\.com/);
  assert.equal(threads.dryRun, true);
  assert.deepEqual(threads.jobs.map((job) => job.type), ["threads_carousel"]);
  assert.match(threads.jobs[0].endpoint, /graph\.threads\.net/);
  assert.equal(threads.jobs[0].mediaType, "CAROUSEL");
  assert.equal(threads.jobs[0].files.length, 7);
  assert.equal(Object.hasOwn(threads.jobs[0], "file"), false);
  assert.equal(threads.jobs[0].topicTag, "AI Threads");
  assert.match(threads.jobs[0].replyText, /github\.com\/example\/source/);
});

test("scheduleDueItems respects publish_at, daily limit, and history duplicates", async () => {
  await createProject("2026-05-07-a");
  await createProject("2026-05-07-b");
  const queue = await buildQueue({
    workspaceRoot: ROOT,
    channel: "ai-jjuun",
    defaultPublishAt: "2026-05-07T10:00:00.000Z",
  });
  queue.items[1].publish_at = "2026-05-08T10:00:00.000Z";

  const result = scheduleDueItems(queue, {
    now: "2026-05-07T11:00:00.000Z",
    dailyLimit: 1,
    history: [],
  });

  assert.equal(result.due.length, 1);
  assert.equal(result.skipped.length, 1);
  assert.equal(result.due[0].projectSlug, "2026-05-07-a");

  const duplicate = scheduleDueItems(queue, {
    now: "2026-05-07T11:00:00.000Z",
    dailyLimit: 5,
    history: [{ contentKey: result.due[0].contentKey, status: "published" }],
  });

  assert.equal(duplicate.due.length, 0);
  assert.ok(duplicate.skipped.some((item) => item.reason === "already_published"));
});
