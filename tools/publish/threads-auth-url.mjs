#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_ENV_FILE, parseArgs, resolvePath } from "./lib/cli-utils.mjs";

const DEFAULT_SCOPES = ["threads_basic", "threads_content_publish"];
const DEFAULT_REDIRECT_URI = "https://oauth.pstmn.io/v1/callback";

const { options } = parseArgs();
const envPath = resolvePath(options.env, DEFAULT_ENV_FILE);
const env = readEnvFile(envPath);

const appId = options.app_id ?? env.THREADS_APP_ID;
const redirectUri = options.redirect_uri ?? env.THREADS_REDIRECT_URI ?? DEFAULT_REDIRECT_URI;
const scopes = String(options.scopes ?? env.THREADS_AUTH_SCOPES ?? DEFAULT_SCOPES.join(","))
  .split(/[,\s]+/)
  .map((scope) => scope.trim())
  .filter(Boolean);

if (!appId) {
  console.error("Missing THREADS_APP_ID. Add it to the env file or pass --app-id <id>.");
  process.exit(1);
}

const url = new URL("https://threads.net/oauth/authorize");
url.searchParams.set("client_id", appId);
url.searchParams.set("redirect_uri", redirectUri);
url.searchParams.set("scope", scopes.join(","));
url.searchParams.set("response_type", "code");

console.log("Threads OAuth URL");
console.log(url.toString());
console.log("");
console.log("Next:");
console.log("1. Open this URL in Chrome/Edge while logged into ai_jjuun.");
console.log("2. Approve the Threads permission screen.");
console.log("3. Copy the final redirected URL from the address bar.");
console.log("4. Run exchange-threads-token.mjs with --callback-url \"<copied-url>\".");
console.log("");
console.log(`Redirect URI in use: ${redirectUri}`);
console.log(`Env file: ${envPath}`);

function readEnvFile(filePath) {
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) return {};

  const env = {};
  const text = fs.readFileSync(resolvedPath, "utf8").replace(/^\uFEFF/, "");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separatorIndex = line.indexOf("=");
    if (separatorIndex < 0) continue;
    const key = line.slice(0, separatorIndex).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    env[key] = stripQuotes(line.slice(separatorIndex + 1).trim());
  }
  return env;
}

function stripQuotes(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}
