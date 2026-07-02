#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_ENV_FILE, parseArgs, resolvePath } from "./lib/cli-utils.mjs";

const DEFAULT_REDIRECT_URI = "https://oauth.pstmn.io/v1/callback";
const GRAPH_BASE = "https://graph.threads.net";

const { options } = parseArgs();
const envPath = resolvePath(options.env, DEFAULT_ENV_FILE);
const env = readEnvFile(envPath);

const appId = options.app_id ?? env.THREADS_APP_ID;
const appSecret = options.app_secret ?? env.THREADS_APP_SECRET;
const redirectUri = options.redirect_uri ?? env.THREADS_REDIRECT_URI ?? DEFAULT_REDIRECT_URI;
const code = extractCode(options.code ?? options.callback_url ?? env.THREADS_AUTH_CODE ?? env.THREADS_AUTH_CALLBACK_URL);
const directAccessToken = options.access_token ?? env.THREADS_SHORT_LIVED_TOKEN ?? env.THREADS_GENERATED_ACCESS_TOKEN;

if (!appSecret || (!directAccessToken && (!appId || !redirectUri || !code))) {
  console.error("Missing required values.");
  console.error("Need either:");
  console.error("- THREADS_APP_ID, THREADS_APP_SECRET, THREADS_REDIRECT_URI, and an auth code/callback URL; or");
  console.error("- THREADS_APP_SECRET and --access-token \"<Threads user token>\" from the Meta token generator.");
  console.error("Tip: token-generator flow avoids OAuth redirect URI setup pain for your own tester account.");
  process.exit(1);
}

try {
  const tokenResult = directAccessToken
    ? await resolveDirectToken({ appSecret, accessToken: directAccessToken, existingExpiresAt: env.THREADS_TOKEN_EXPIRES_AT })
    : await resolveOAuthCodeToken({ appId, appSecret, redirectUri, code });
  const profile = await getThreadsProfile(tokenResult.access_token);
  const expiresAt = tokenResult.expiresAt;

  const updates = {
    THREADS_ACCESS_TOKEN: tokenResult.access_token,
    THREADS_USER_ID: profile.id,
    THREADS_TOKEN_EXPIRES_AT: expiresAt,
    THREADS_GRAPH_BASE_URL: `${GRAPH_BASE}/v1.0`,
  };

  upsertEnvFile(envPath, updates);

  console.log("Threads token updated.");
  console.log(JSON.stringify({
    envPath,
    userId: profile.id,
    username: profile.username ?? null,
    token: maskToken(tokenResult.access_token),
    expiresAt,
    mode: tokenResult.mode,
  }, null, 2));
} catch (error) {
  console.error(scrubSecrets(error.message));
  process.exit(1);
}

async function resolveOAuthCodeToken({ appId, appSecret, redirectUri, code }) {
  const shortToken = await exchangeCodeForShortToken({ appId, appSecret, redirectUri, code });
  const longToken = await exchangeShortForLongToken({ appSecret, accessToken: shortToken.access_token });
  return {
    access_token: longToken.access_token,
    expiresAt: computeExpiresAt(longToken.expires_in),
    mode: "oauth-code-exchanged",
  };
}

async function resolveDirectToken({ appSecret, accessToken, existingExpiresAt }) {
  try {
    const longToken = await exchangeShortForLongToken({ appSecret, accessToken });
    return {
      access_token: longToken.access_token,
      expiresAt: computeExpiresAt(longToken.expires_in),
      mode: "direct-token-exchanged",
    };
  } catch (exchangeError) {
    try {
      await getThreadsProfile(accessToken);
      return {
        access_token: accessToken,
        expiresAt: normalizeExpiresAt(existingExpiresAt),
        mode: "direct-token-saved",
      };
    } catch (profileError) {
      throw new Error(
        [
          "Threads token could not be exchanged or used directly.",
          "",
          `Exchange error: ${exchangeError.message}`,
          `Direct profile check error: ${profileError.message}`,
          "",
          "Most likely fixes:",
          "- Generate a fresh token from Meta Developers > Threads API access > User Token Generator.",
          "- Make sure the token is for the ai_jjuun Threads account, not Instagram/Facebook Graph API.",
          "- Make sure it includes threads_basic and threads_content_publish.",
          "- Paste only the raw token string, with no quotes copied from a web page.",
        ].join("\n")
      );
    }
  }
}

async function exchangeCodeForShortToken({ appId, appSecret, redirectUri, code }) {
  const body = new URLSearchParams();
  body.set("client_id", appId);
  body.set("client_secret", appSecret);
  body.set("grant_type", "authorization_code");
  body.set("redirect_uri", redirectUri);
  body.set("code", code);

  const response = await fetch(`${GRAPH_BASE}/oauth/access_token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  return readApiJson(response, "short token exchange");
}

async function exchangeShortForLongToken({ appSecret, accessToken }) {
  const url = new URL(`${GRAPH_BASE}/access_token`);
  url.searchParams.set("grant_type", "th_exchange_token");
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url);
  return readApiJson(response, "long token exchange");
}

async function getThreadsProfile(accessToken) {
  const url = new URL(`${GRAPH_BASE}/v1.0/me`);
  url.searchParams.set("fields", "id,username");
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url);
  return readApiJson(response, "profile check");
}

async function readApiJson(response, label) {
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`${label} failed: ${response.status} ${scrubSecrets(text)}`);
  }

  if (!response.ok || body.error) {
    throw new Error(`${label} failed: ${response.status} ${scrubSecrets(JSON.stringify(body))}`);
  }
  return body;
}

function extractCode(value) {
  if (!value) return "";
  const raw = String(value).trim();
  try {
    const url = new URL(raw);
    return cleanCode(url.searchParams.get("code") ?? "");
  } catch {
    return cleanCode(raw);
  }
}

function cleanCode(value) {
  return decodeURIComponent(String(value).replace(/#_$/, "").trim());
}

function computeExpiresAt(expiresIn) {
  const seconds = Number.isFinite(Number(expiresIn)) ? Number(expiresIn) : 60 * 24 * 60 * 60;
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function normalizeExpiresAt(value) {
  if (value && !Number.isNaN(Date.parse(value)) && Date.parse(value) > Date.now()) return value;
  return computeExpiresAt(60 * 24 * 60 * 60);
}

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

function upsertEnvFile(filePath, updates) {
  const resolvedPath = path.resolve(filePath);
  const existing = fs.existsSync(resolvedPath) ? fs.readFileSync(resolvedPath, "utf8").replace(/^\uFEFF/, "") : "";
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

  fs.writeFileSync(resolvedPath, nextLines.join("\n").replace(/\n{3,}/g, "\n\n"), "utf8");
}

function stripQuotes(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function maskToken(value) {
  if (!value) return "";
  if (value.length <= 12) return `${value.slice(0, 4)}...`;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function scrubSecrets(value) {
  return String(value)
    .replace(/(access_token=)[^&\s"]+/gi, "$1[redacted]")
    .replace(/("access_token"\s*:\s*")[^"]+(")/gi, "$1[redacted]$2")
    .replace(/(client_secret=)[^&\s"]+/gi, "$1[redacted]")
    .replace(/("client_secret"\s*:\s*")[^"]+(")/gi, "$1[redacted]$2");
}
