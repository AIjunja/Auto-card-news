#!/usr/bin/env node
import {
  DEFAULT_QUEUE_PATH,
  readJsonIfExists,
  validateQueue,
  writeJson,
} from "./lib/publish-utils.mjs";
import { parseArgs, printSummary, resolvePath } from "./lib/cli-utils.mjs";

const { options } = parseArgs();
const queuePath = resolvePath(options.queue, DEFAULT_QUEUE_PATH);
const queue = await readJsonIfExists(queuePath, null);

if (!queue) {
  console.error(`Queue file not found: ${queuePath}`);
  process.exit(1);
}

const validation = await validateQueue(queue);
const outPath = options.out ? resolvePath(options.out) : null;
if (outPath) {
  await writeJson(outPath, validation);
}

printSummary("publish queue validation", {
  queue: queuePath,
  out: outPath,
  ...validation.summary,
});

if (validation.summary.errors > 0) {
  process.exit(1);
}
