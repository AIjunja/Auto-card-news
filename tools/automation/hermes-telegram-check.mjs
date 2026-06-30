#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { parseArgs, printSummary, resolvePath } from "../publish/lib/cli-utils.mjs";

const DEFAULT_ENV_FILE = path.join("carousel-workspace", "hermes-content.env");

const { options, flags } = parseArgs();

if (flags.has("help")) {
  printHelp();
  process.exit(0);
}

const envPath = resolvePath(options.env, DEFAULT_ENV_FILE);
loadEnvFile(envPath);

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error(`Missing TELEGRAM_BOT_TOKEN. Put it in ${envPath}.`);
}

const me = await telegram("getMe", {});
const updates = await telegram("getUpdates", {
  limit: "10",
  allowed_updates: JSON.stringify(["message"]),
});

const chats = extractChats(updates.result ?? []);
const chatId = firstNonEmpty(options.chat_id, process.env.TELEGRAM_CHAT_ID, chats[0]?.id);

if (options.write_chat_id) {
  await writeChatId(envPath, options.write_chat_id);
}

if (flags.has("send_test")) {
  if (!chatId) {
    throw new Error("No TELEGRAM_CHAT_ID found. Send any message to your bot, then rerun this script.");
  }
  await telegram("sendMessage", {
    chat_id: String(chatId),
    text: [
      "AI JJUN Hermes Telegram is connected.",
      "",
      "You can now review source candidates, drafts, and final upload packages here.",
      "Command examples:",
      "SOURCE OK <source-id>",
      "DRAFT OK <source-id>",
      "UPLOAD <project-slug>",
    ].join("\n"),
    disable_web_page_preview: "true",
  });
}

printSummary("telegram check", {
  bot: me.result?.username ? `@${me.result.username}` : me.result?.first_name,
  env: envPath,
  chatId: chatId ?? null,
  chats,
  sentTest: flags.has("send_test"),
  next: chatId
    ? "Set TELEGRAM_CHAT_ID in hermes-content.env if it is not already saved."
    : "Send any message to your bot, then rerun this script.",
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

async function telegram(method, params) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    body: new URLSearchParams(params),
  });
  const data = await response.json();
  if (!response.ok || data.ok === false) {
    throw new Error(`Telegram API error: ${JSON.stringify(data)}`);
  }
  return data;
}

function extractChats(updates) {
  const map = new Map();
  for (const update of updates) {
    const chat = update.message?.chat;
    if (!chat?.id) continue;
    map.set(String(chat.id), {
      id: String(chat.id),
      type: chat.type,
      title: chat.title ?? [chat.first_name, chat.last_name].filter(Boolean).join(" "),
      username: chat.username ? `@${chat.username}` : null,
      lastText: update.message?.text ?? "",
    });
  }
  return [...map.values()];
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return undefined;
}

async function writeChatId(filePath, value) {
  const existing = existsSync(filePath) ? await readFile(filePath, "utf8") : "";
  const line = `TELEGRAM_CHAT_ID=${value}`;
  const next = existing.match(/^TELEGRAM_CHAT_ID=/m)
    ? existing.replace(/^TELEGRAM_CHAT_ID=.*$/m, line)
    : `${existing.trimEnd()}\n${line}\n`;
  await writeFile(filePath, next, "utf8");
}

function printHelp() {
  console.log(`Hermes Telegram check

Usage:
  node tools/automation/hermes-telegram-check.mjs
  node tools/automation/hermes-telegram-check.mjs --send-test
  node tools/automation/hermes-telegram-check.mjs --write-chat-id <chat-id>

Setup:
  1. Create a Telegram bot with @BotFather.
  2. Put TELEGRAM_BOT_TOKEN in carousel-workspace/hermes-content.env.
  3. Send any message to the bot from your Telegram account.
  4. Run this script to discover TELEGRAM_CHAT_ID.
`);
}
