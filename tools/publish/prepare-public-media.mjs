#!/usr/bin/env node
import { copyFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { DEFAULT_QUEUE_PATH, readJsonIfExists } from "./lib/publish-utils.mjs";
import { parseArgs, printSummary, resolvePath } from "./lib/cli-utils.mjs";

const { options, flags } = parseArgs();
const queuePath = resolvePath(options.queue, DEFAULT_QUEUE_PATH);
const queue = await readJsonIfExists(queuePath, null);

if (!queue) {
  console.error(`Queue file not found: ${queuePath}`);
  process.exit(1);
}

const workspaceRoot = path.resolve(queue.workspaceRoot ?? "carousel-workspace");
const publicRoot = resolvePath(options.out, path.join("carousel-workspace", "public-media"));
assertSafePublicRoot(publicRoot, workspaceRoot);

if (!flags.has("no_clean") && existsSync(publicRoot)) {
  await rm(publicRoot, { recursive: true, force: true });
}
await mkdir(publicRoot, { recursive: true });

const files = collectMediaFiles(queue);
const copied = [];
const missing = [];

for (const file of files) {
  const source = path.resolve(file);
  if (!isInside(source, workspaceRoot)) continue;
  if (!existsSync(source)) {
    missing.push(source);
    continue;
  }

  const relative = path.relative(workspaceRoot, source);
  const target = path.join(publicRoot, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(source, target);
  copied.push({ source, target, publicPath: relative.split(path.sep).join("/") });
}

await writeNoIndex(publicRoot);

printSummary("public media prepared", {
  queue: queuePath,
  publicRoot,
  copied: copied.length,
  missing: missing.length,
  samplePublicPaths: copied.slice(0, 5).map((item) => item.publicPath),
});

if (missing.length) {
  printSummary("missing media", missing.slice(0, 20));
}

function collectMediaFiles(queueData) {
  const files = new Set();
  for (const item of queueData.items ?? []) {
    addAll(files, item.assets?.cards);
    add(files, item.assets?.reel);
    add(files, item.assets?.reelFrame);
    add(files, item.assets?.thumbnail);
    add(files, item.platforms?.threads?.image);
    add(files, item.platforms?.threads?.video);
    add(files, item.platforms?.youtube?.thumbnail);
    add(files, item.platforms?.youtube?.video);
    addAll(files, item.platforms?.instagram?.carousel?.cards);
    add(files, item.platforms?.instagram?.reel?.video);
  }
  return [...files];
}

function add(files, value) {
  if (typeof value === "string" && value.trim()) files.add(value);
}

function addAll(files, values) {
  if (!Array.isArray(values)) return;
  for (const value of values) add(files, value);
}

async function writeNoIndex(root) {
  await mkdir(root, { recursive: true });
  await copyFile(new URL("./public-media-index.html", import.meta.url), path.join(root, "index.html")).catch(async () => {
    await import("node:fs/promises").then(({ writeFile }) =>
      writeFile(path.join(root, "index.html"), "<!doctype html><meta charset=\"utf-8\"><title>AI JJUN media</title><h1>AI JJUN media server</h1>", "utf8")
    );
  });
}

function assertSafePublicRoot(target, workspaceRootPath) {
  const resolved = path.resolve(target);
  if (path.basename(resolved) !== "public-media") {
    throw new Error(`Refusing to clean non public-media directory: ${resolved}`);
  }
  if (!isInside(resolved, workspaceRootPath)) {
    throw new Error(`Refusing public root outside workspace: ${resolved}`);
  }
}

function isInside(target, root) {
  const relative = path.relative(path.resolve(root), path.resolve(target));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}
