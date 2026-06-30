import fs from "node:fs";
import path from "node:path";

export const DEFAULT_ENV_FILE = path.join("carousel-workspace", "hermes-content.env");

export function parseArgs(argv = process.argv.slice(2)) {
  const options = {};
  const flags = new Set();
  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      positional.push(token);
      continue;
    }

    const [rawKey, inlineValue] = token.slice(2).split("=", 2);
    const key = rawKey.replaceAll("-", "_");
    if (inlineValue !== undefined) {
      pushOption(options, key, inlineValue);
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      flags.add(key);
      continue;
    }

    pushOption(options, key, next);
    index += 1;
  }

  return { options, flags, positional };
}

function pushOption(options, key, value) {
  if (options[key] === undefined) {
    options[key] = value;
    return;
  }
  if (!Array.isArray(options[key])) {
    options[key] = [options[key]];
  }
  options[key].push(value);
}

export function optionArray(value) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function resolvePath(value, fallback) {
  return path.resolve(value ?? fallback);
}

export function loadEnvFile(filePath = DEFAULT_ENV_FILE) {
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) return false;

  const text = fs.readFileSync(resolvedPath, "utf8").replace(/^\uFEFF/, "");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex < 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    if (process.env[key] !== undefined) continue;

    const rawValue = line.slice(separatorIndex + 1).trim();
    const isQuoted =
      (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
      (rawValue.startsWith("'") && rawValue.endsWith("'"));
    process.env[key] = isQuoted ? rawValue.slice(1, -1) : rawValue;
  }

  return true;
}

export function selectQueueItems(queue, itemSelector) {
  if (!itemSelector) return queue.items;
  const selectors = new Set(optionArray(itemSelector));
  return queue.items.filter((item) => {
    return selectors.has(item.id) || selectors.has(item.projectSlug) || selectors.has(item.contentKey);
  });
}

export function isExpired(isoValue, now = new Date()) {
  if (!isoValue) return false;
  const time = new Date(isoValue).getTime();
  return Number.isFinite(time) && time <= now.getTime();
}

export function printSummary(title, value) {
  console.log(`${title}: ${JSON.stringify(value, null, 2)}`);
}
