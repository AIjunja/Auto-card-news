#!/usr/bin/env node
import fs from "node:fs";
import { DEFAULT_ENV_FILE, loadEnvFile, parseArgs, printSummary, resolvePath } from "./lib/cli-utils.mjs";

const { options, flags } = parseArgs();
const envPath = resolvePath(options.env, DEFAULT_ENV_FILE);
loadEnvFile(envPath);

const accessToken = options.access_token ?? process.env.META_ACCESS_TOKEN;
if (!accessToken) {
  console.error("Missing META_ACCESS_TOKEN. Generate a fresh Instagram token first.");
  process.exit(1);
}

try {
  const refreshed = await refreshInstagramToken(accessToken);
  const expiresAt = computeExpiresAt(refreshed.expires_in);
  if (!flags.has("dry_run")) {
    upsertEnvFile(envPath, {
      META_ACCESS_TOKEN: refreshed.access_token,
      META_TOKEN_EXPIRES_AT: expiresAt,
      INSTAGRAM_GRAPH_BASE_URL: process.env.INSTAGRAM_GRAPH_BASE_URL || "https://graph.instagram.com/v25.0",
    });
  }

  printSummary("instagram token refresh complete", {
    envPath,
    dryRun: flags.has("dry_run"),
    token: maskToken(refreshed.access_token),
    expiresAt,
  });
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

async function refreshInstagramToken(accessToken) {
  const url = new URL("https://graph.instagram.com/refresh_access_token");
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url);
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Instagram token refresh failed: ${response.status} ${text}`);
  }

  if (!response.ok || data.error) {
    throw new Error(`Instagram token refresh failed: ${response.status} ${JSON.stringify(scrubTokenError(data))}`);
  }

  return data;
}

function computeExpiresAt(expiresIn) {
  const seconds = Number.isFinite(Number(expiresIn)) ? Number(expiresIn) : 60 * 24 * 60 * 60;
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function upsertEnvFile(filePath, updates) {
  const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "") : "";
  const lines = existing.split(/\r?\n/);
  const seen = new Set();

  const nextLines = lines.map((line) => {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=/);
    if (!match || updates[match[1]] === undefined) return line;
    seen.add(match[1]);
    return `${match[1]}=${updates[match[1]]}`;
  });

  for (const [key, value] of Object.entries(updates)) {
    if (!seen.has(key)) nextLines.push(`${key}=${value}`);
  }

  fs.writeFileSync(filePath, nextLines.join("\n").replace(/\n{3,}/g, "\n\n"), "utf8");
}

function maskToken(value) {
  if (!value) return "";
  if (value.length <= 12) return `${value.slice(0, 4)}...`;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function scrubTokenError(data) {
  if (!data || typeof data !== "object") return data;
  const clone = JSON.parse(JSON.stringify(data));
  if (clone.access_token) clone.access_token = "[redacted]";
  if (clone.error?.access_token) clone.error.access_token = "[redacted]";
  return clone;
}
