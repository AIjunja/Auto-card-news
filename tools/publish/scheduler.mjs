#!/usr/bin/env node
import path from "node:path";
import {
  DEFAULT_HISTORY_PATH,
  DEFAULT_QUEUE_PATH,
  readJsonIfExists,
  scheduleDueItems,
  validateQueue,
  writeJson,
} from "./lib/publish-utils.mjs";
import { parseArgs, printSummary, resolvePath } from "./lib/cli-utils.mjs";

const { options } = parseArgs();
const queuePath = resolvePath(options.queue, DEFAULT_QUEUE_PATH);
const historyPath = resolvePath(options.history, DEFAULT_HISTORY_PATH);
const outPath = resolvePath(options.out, path.join("carousel-workspace", "publish-due.json"));
const queue = await readJsonIfExists(queuePath, null);
const history = await readJsonIfExists(historyPath, []);

if (!queue) {
  console.error(`Queue file not found: ${queuePath}`);
  process.exit(1);
}

const validation = await validateQueue(queue);
const readyIds = new Set(validation.items.filter((item) => item.status === "ready").map((item) => item.id));
const readyQueue = {
  ...queue,
  items: queue.items.filter((item) => readyIds.has(item.id)),
};
const scheduled = scheduleDueItems(readyQueue, {
  now: options.now,
  dailyLimit: Number(options.daily_limit ?? 3),
  history,
});

await writeJson(outPath, scheduled);

printSummary("publish schedule written", {
  out: outPath,
  due: scheduled.due.length,
  skipped: scheduled.skipped.length,
  blockedByValidation: queue.items.length - readyQueue.items.length,
});
