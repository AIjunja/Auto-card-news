#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { parseArgs, printSummary, resolvePath } from "../publish/lib/cli-utils.mjs";

const DEFAULT_ENV_FILE = path.join("carousel-workspace", "hermes-content.env");
const DEFAULT_GRAPH_BASE_URL = "https://graph.threads.net/v1.0";

const { options, flags } = parseArgs();

if (flags.has("help")) {
  printHelp();
  process.exit(0);
}

const envPath = resolvePath(options.env, DEFAULT_ENV_FILE);
loadEnvFile(envPath);

const token = process.env.THREADS_ACCESS_TOKEN;
const graphBaseUrl = process.env.THREADS_GRAPH_BASE_URL || DEFAULT_GRAPH_BASE_URL;

if (!token) {
  throw new Error(`Missing THREADS_ACCESS_TOKEN. Put it in ${envPath}.`);
}

const profile = await threadsGet("/me", {
  fields: "id,username",
  access_token: token,
});

const shouldWriteUserId = flags.has("write-user-id") || flags.has("write_user_id");

if (shouldWriteUserId) {
  await writeEnvValue(envPath, "THREADS_USER_ID", profile.id);
}

printSummary("threads check", {
  env: envPath,
  graphBaseUrl,
  userId: profile.id,
  username: profile.username ?? null,
  wroteUserId: shouldWriteUserId,
  next: shouldWriteUserId
    ? "THREADS_USER_ID is saved. You can run a dry-run upload next."
    : "If this is the right ai_jjuun account, rerun with --write-user-id.",
});

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

async function threadsGet(endpoint, params) {
  const url = new URL(`${stripTrailingSlash(graphBaseUrl)}${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    throw new Error(`Threads API error: ${formatGraphError(url, data, response.status)}`);
  }
  return data;
}

function stripTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function formatGraphError(url, data, status) {
  const message = data?.error?.message || JSON.stringify(data);
  const code = data?.error?.code ? ` code=${data.error.code}` : "";
  return `HTTP ${status}${code}\nURL: ${redactToken(url.toString())}\n${message}`;
}

function redactToken(value) {
  return value.replace(/access_token=[^&]+/g, "access_token=***");
}

async function writeEnvValue(filePath, key, value) {
  const existing = existsSync(filePath) ? await readFile(filePath, "utf8") : "";
  const line = `${key}=${value}`;
  const next = existing.match(new RegExp(`^${key}=`, "m"))
    ? existing.replace(new RegExp(`^${key}=.*$`, "m"), line)
    : `${existing.trimEnd()}\n${line}\n`;
  await writeFile(filePath, next, "utf8");
}

function printHelp() {
  console.log(`Hermes Threads check

Usage:
  node tools/automation/hermes-threads-check.mjs
  node tools/automation/hermes-threads-check.mjs --write-user-id

Setup:
  1. Put THREADS_ACCESS_TOKEN in carousel-workspace/hermes-content.env.
  2. Run this script to verify the token belongs to the right Threads profile.
  3. If the username is right, rerun with --write-user-id.

This script does not publish content. It only calls /me?fields=id,username.
`);
}
