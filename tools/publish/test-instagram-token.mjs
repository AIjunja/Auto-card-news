#!/usr/bin/env node
import { DEFAULT_ENV_FILE, loadEnvFile, parseArgs, resolvePath } from "./lib/cli-utils.mjs";

const { options } = parseArgs();
const envPath = resolvePath(options.env, DEFAULT_ENV_FILE);
loadEnvFile(envPath);

const accessToken = process.env.META_ACCESS_TOKEN;
const graphBaseUrl = process.env.INSTAGRAM_GRAPH_BASE_URL || "https://graph.instagram.com/v25.0";

if (!accessToken) {
  console.error("META_ACCESS_TOKEN is missing. Fill carousel-workspace/hermes-content.env first.");
  process.exit(1);
}

const url = new URL(`${graphBaseUrl.replace(/\/$/, "")}/me`);
url.searchParams.set("fields", "id,username,account_type");
url.searchParams.set("access_token", accessToken);

const response = await fetch(url);
const data = await response.json();

if (!response.ok) {
  console.error("Instagram token test failed.");
  console.error(JSON.stringify(redact(data), null, 2));
  console.error("");
  console.error("Most likely causes:");
  console.error("- META_ACCESS_TOKEN contains META_ACCESS_TOKEN=, Bearer, quotes, brackets, or spaces.");
  console.error("- You copied an app id/user id number instead of the long access token string.");
  console.error("- The token was generated for facebook.com flow, but INSTAGRAM_GRAPH_BASE_URL is graph.instagram.com.");
  process.exit(1);
}

console.log("Instagram token test OK.");
console.log(JSON.stringify({
  username: data.username,
  account_type: data.account_type,
  INSTAGRAM_USER_ID: data.id,
}, null, 2));

function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => {
      if (key.toLowerCase().includes("token")) return [key, "[redacted]"];
      return [key, redact(item)];
    }));
  }
  return value;
}
