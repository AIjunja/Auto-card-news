#!/usr/bin/env node
import {
  DEFAULT_QUEUE_PATH,
  buildQueue,
  queueSummary,
  writeJson,
} from "./lib/publish-utils.mjs";
import { optionArray, parseArgs, printSummary, resolvePath } from "./lib/cli-utils.mjs";

const { options } = parseArgs();

const queue = await buildQueue({
  workspaceRoot: options.workspace_root ?? "carousel-workspace",
  channel: options.channel ?? "ai-jjuun",
  defaultPublishAt: options.publish_at ?? null,
  projects: optionArray(options.project),
});

const outPath = resolvePath(options.out, DEFAULT_QUEUE_PATH);
await writeJson(outPath, queue);

printSummary("publish queue written", {
  out: outPath,
  items: queue.items.length,
  projects: queueSummary(queue).map((item) => item.projectSlug),
});
