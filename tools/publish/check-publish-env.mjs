#!/usr/bin/env node
import { DEFAULT_ENV_FILE, isExpired, loadEnvFile, parseArgs, printSummary, resolvePath } from "./lib/cli-utils.mjs";

const { options, flags } = parseArgs();
const envPath = resolvePath(options.env, DEFAULT_ENV_FILE);
const loaded = loadEnvFile(envPath);

const groups = [
  {
    name: "telegram_review",
    required: ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"],
  },
  {
    name: "instagram_publish",
    required: ["META_ACCESS_TOKEN", "INSTAGRAM_USER_ID", "PUBLIC_MEDIA_BASE_URL"],
    optional: ["META_TOKEN_EXPIRES_AT", "INSTAGRAM_GRAPH_BASE_URL"],
    expiry: "META_TOKEN_EXPIRES_AT",
  },
  {
    name: "threads_publish",
    required: ["THREADS_ACCESS_TOKEN", "THREADS_USER_ID", "PUBLIC_MEDIA_BASE_URL"],
    optional: ["THREADS_TOKEN_EXPIRES_AT"],
    expiry: "THREADS_TOKEN_EXPIRES_AT",
  },
  {
    name: "youtube_publish_later",
    required: ["YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET", "YOUTUBE_REFRESH_TOKEN"],
    optional: ["YOUTUBE_PRIVACY_STATUS", "YOUTUBE_CATEGORY_ID", "YOUTUBE_MADE_FOR_KIDS", "YOUTUBE_TAGS"],
  },
];

const report = {
  envPath,
  loaded,
  groups: groups.map((group) => {
    const required = group.required.map((key) => ({ key, status: valueStatus(key) }));
    const optional = (group.optional ?? []).map((key) => ({ key, status: valueStatus(key) }));
    const missingRequired = required.filter((item) => item.status === "missing").map((item) => item.key);
    return {
      name: group.name,
      ready: missingRequired.length === 0 && (!group.expiry || !isExpired(process.env[group.expiry])),
      missingRequired,
      expired: group.expiry ? isExpired(process.env[group.expiry]) : false,
      required,
      optional,
    };
  }),
};

printSummary("publish env check", report);

const hasProblem = report.groups.some((group) => group.missingRequired.length > 0 || group.expired);
if (flags.has("strict") && hasProblem) {
  process.exit(1);
}

function valueStatus(key) {
  const value = process.env[key];
  return value === undefined || value === "" ? "missing" : "set";
}
