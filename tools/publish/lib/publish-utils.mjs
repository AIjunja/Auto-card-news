import { appendFile, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

export const DEFAULT_QUEUE_PATH = path.join("carousel-workspace", "publish-queue.json");
export const DEFAULT_HISTORY_PATH = path.join("carousel-workspace", "publish-history.json");
export const DEFAULT_FAILURE_LOG = path.join("carousel-workspace", "publish-failures.log.jsonl");

const INSTAGRAM_CAPTION_LIMIT = 2200;
const THREADS_TEXT_LIMIT = 500;
const YOUTUBE_TITLE_LIMIT = 100;
const YOUTUBE_DESCRIPTION_LIMIT = 5000;
const MAX_INSTAGRAM_CARDS = 10;
const EXPECTED_CARD_COUNT = 7;
const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
const REEL_MAX_BYTES = 300 * 1024 * 1024;
const SUSPICIOUS_REEL_MIN_BYTES = 1024;

function stableNow(now) {
  return now ? new Date(now).toISOString() : new Date().toISOString();
}

function posixPath(value) {
  return value.replaceAll("\\", "/");
}

function hashText(value) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function cleanUrl(value) {
  return value.replace(/[)\].,，。]+$/u, "");
}

function isCreditLine(value) {
  return /^(contents\s+editor|editor|source)\b/i.test(value);
}

export function extractUrls(text) {
  return [...new Set((text.match(/https?:\/\/[^\s<>"'`]+/g) ?? []).map(cleanUrl))];
}

export function splitCaptions(caption) {
  const instagram = caption.trim();
  const paragraphs = instagram
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !isCreditLine(part));
  const urls = extractUrls(instagram).slice(0, 2);
  let threads = [...paragraphs.slice(0, 3), ...urls].join("\n\n").trim();
  if (threads.length > THREADS_TEXT_LIMIT) {
    const linkBlock = urls.length ? `\n\n${urls.join("\n")}` : "";
    const maxBody = THREADS_TEXT_LIMIT - linkBlock.length - 3;
    threads = `${threads.slice(0, Math.max(0, maxBody)).trim()}...${linkBlock}`;
  }
  return { instagram, threads };
}

function cleanCaptionLine(value) {
  return value
    .replace(/https?:\/\/[^\s<>"'`]+/g, "")
    .replace(/^#+\s*/g, "")
    .replace(/^[\s*-]*[①-⑳0-9]+[.)]?\s*/u, "")
    .trim();
}

function compactText(value, limit) {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > limit ? `${text.slice(0, Math.max(0, limit - 1)).trim()}…` : text;
}

function firstUsefulCaptionLine(caption) {
  return (
    caption
      .split(/\r?\n/)
      .map(cleanCaptionLine)
      .find((line) => line && !/^caption( draft)?$/i.test(line) && !isCreditLine(line) && !/^#/.test(line) && !/^출처\b/.test(line)) ?? ""
  );
}

function cleanYouTubeDescription(caption) {
  return caption
    .split(/\r?\n/)
    .filter((line) => !/^#\s*caption( draft)?\s*$/i.test(line.trim()))
    .join("\n")
    .trim();
}

function titleFromSlug(projectSlug) {
  return projectSlug
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function buildYouTubeMetadata({ projectSlug, caption, sourceLinks = [] }) {
  const firstLine = firstUsefulCaptionLine(caption);
  const title = compactText(firstLine || titleFromSlug(projectSlug), YOUTUBE_TITLE_LIMIT);
  const cleanedCaption = cleanYouTubeDescription(caption);
  const sourceBlock = sourceLinks.length
    ? `\n\n출처/더 보기\n${sourceLinks.slice(0, 8).map((link) => `- ${link}`).join("\n")}`
    : "";
  const description = `${cleanedCaption}${sourceBlock}`.slice(0, YOUTUBE_DESCRIPTION_LIMIT).trim();
  const slugTags = projectSlug
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
    .split(/[-_\s]+/)
    .map((tag) => tag.trim())
    .filter((tag) => tag.length >= 2 && tag.length <= 24);
  const tags = [...new Set(["AI", "AI쭌", "AI뉴스", "AI활용", "Codex", ...slugTags])].slice(0, 25);
  return { title, description, tags };
}

export async function parsePngSize(filePath) {
  const bytes = await readFile(filePath);
  if (bytes.length < 24 || bytes.toString("ascii", 1, 4) !== "PNG") {
    throw new Error(`Not a PNG file: ${filePath}`);
  }
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

async function safeReadText(filePath) {
  return existsSync(filePath) ? readFile(filePath, "utf8") : "";
}

function firstExistingPath(paths) {
  return paths.find((candidate) => existsSync(candidate)) ?? null;
}

async function listProjectDirs(workspaceRoot, channel) {
  const projectsRoot = path.join(workspaceRoot, "projects", channel);
  if (!existsSync(projectsRoot)) return [];
  const entries = await readdir(projectsRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(projectsRoot, entry.name))
    .sort();
}

async function readProject(projectPath, channel, now, defaultPublishAt) {
  const outputDir = path.join(projectPath, "output");
  const projectSlug = path.basename(projectPath);
  const captionPath = path.join(projectPath, "caption.md");
  if (!existsSync(outputDir) || !existsSync(captionPath)) return null;

  const outputFiles = await readdir(outputDir);
  const cards = outputFiles
    .filter((name) => /^card-\d{2}\.png$/i.test(name))
    .sort()
    .map((name) => path.resolve(outputDir, name));
  const reel = firstExistingPath([
    path.resolve(outputDir, "reel.mp4"),
    path.resolve(outputDir, "reel-preview.mp4"),
  ]);
  const reelFrame = firstExistingPath([
    path.resolve(outputDir, "reel-frame-05s.png"),
    path.resolve(outputDir, "reel-preview-frame-05s.png"),
    path.resolve(outputDir, "reel-preview-frame-01.png"),
    path.resolve(outputDir, "reel-preview-frame.png"),
  ]);
  const originalCaption = await readFile(captionPath, "utf8");
  const sourcePack = await safeReadText(path.join(projectPath, "source-pack.md"));
  const captions = splitCaptions(originalCaption);
  const sourceLinks = extractUrls(`${originalCaption}\n${sourcePack}`);
  const youtubeMetadata = buildYouTubeMetadata({
    projectSlug,
    caption: captions.instagram,
    sourceLinks,
  });
  const contentKey = `${channel}:${projectSlug}:${hashText(cards.join("|") + captions.instagram)}`;

  return {
    id: contentKey,
    contentKey,
    channel,
    projectSlug,
    projectPath: path.resolve(projectPath),
    created_at: now,
    publish_at: defaultPublishAt ?? null,
    status: "draft",
    sourceLinks,
    captions,
    assets: {
      cards,
      reel,
      reelFrame,
      caption: path.resolve(captionPath),
    },
    platforms: {
      instagram: {
        carousel: {
          enabled: cards.length > 0,
          mediaType: "CAROUSEL",
          caption: captions.instagram,
          cards,
        },
        reel: {
          enabled: Boolean(reel),
          mediaType: "REELS",
          caption: captions.instagram,
          video: reel,
        },
      },
      threads: {
        enabled: true,
        text: captions.threads,
        image: cards[0] ?? null,
        video: reel,
      },
      youtube: {
        enabled: Boolean(reel),
        video: reel,
        thumbnail: firstExistingPath([
          path.resolve(outputDir, "thumb-01.png"),
          path.resolve(outputDir, "thumbnail.png"),
          path.resolve(outputDir, "reel-frame-hook.png"),
          path.resolve(outputDir, "reel-frame-05s.png"),
          path.resolve(outputDir, "reel-preview-frame-05s.png"),
          cards[0] ?? "",
        ]),
        ...youtubeMetadata,
      },
    },
    checks: {},
  };
}

export async function buildQueue({
  workspaceRoot = "carousel-workspace",
  channel = "ai-jjuun",
  now,
  defaultPublishAt = null,
  projects,
} = {}) {
  const timestamp = stableNow(now);
  const projectDirs = projects?.length
    ? projects.map((project) => path.resolve(project))
    : await listProjectDirs(workspaceRoot, channel);
  const items = [];
  for (const projectPath of projectDirs) {
    const item = await readProject(projectPath, channel, timestamp, defaultPublishAt);
    if (item) items.push(item);
  }
  return {
    version: 1,
    generated_at: timestamp,
    workspaceRoot: path.resolve(workspaceRoot),
    channel,
    items,
  };
}

function problem(severity, code, message, file = null) {
  return { severity, code, message, file };
}

async function validateItem(item, options = {}) {
  const problems = [];
  const maxCards = options.maxCarouselCards ?? MAX_INSTAGRAM_CARDS;
  const expectedNames = Array.from({ length: EXPECTED_CARD_COUNT }, (_, index) => `card-${String(index + 1).padStart(2, "0")}.png`);
  const cardNames = item.assets.cards.map((card) => path.basename(card));

  if (cardNames.length !== EXPECTED_CARD_COUNT || expectedNames.some((name, index) => cardNames[index] !== name)) {
    problems.push(problem("error", "card_sequence", `Expected ${EXPECTED_CARD_COUNT} card files named card-01.png through card-07.png.`, item.projectPath));
  }
  if (cardNames.length > maxCards) {
    problems.push(problem("error", "too_many_cards", `Instagram carousel supports up to ${maxCards} cards in this queue.`, item.projectPath));
  }

  for (const card of item.assets.cards) {
    if (!existsSync(card)) {
      problems.push(problem("error", "missing_card", `Missing card file: ${path.basename(card)}`, card));
      continue;
    }
    const cardStat = await stat(card);
    if (cardStat.size > IMAGE_MAX_BYTES) {
      problems.push(problem("error", "image_too_large", `${path.basename(card)} is larger than 8 MB.`, card));
    }
    const size = await parsePngSize(card);
    const ratio = size.width / size.height;
    if (Math.abs(ratio - 0.8) > 0.015) {
      problems.push(problem("error", "bad_card_ratio", `${path.basename(card)} must be 4:5 for Instagram carousel consistency.`, card));
    }
  }

  if (item.assets.reel) {
    if (!existsSync(item.assets.reel)) {
      problems.push(problem("error", "missing_reel", "Missing reel.mp4.", item.assets.reel));
    } else {
      const reelStat = await stat(item.assets.reel);
      if (reelStat.size < SUSPICIOUS_REEL_MIN_BYTES) {
        problems.push(problem("error", "reel_too_small", "reel.mp4 is suspiciously small and may not be a valid video.", item.assets.reel));
      }
      if (reelStat.size > REEL_MAX_BYTES) {
        problems.push(problem("error", "reel_too_large", "reel.mp4 is larger than 300 MB.", item.assets.reel));
      }
    }
  }

  if (item.assets.reelFrame && existsSync(item.assets.reelFrame)) {
    const frameSize = await parsePngSize(item.assets.reelFrame);
    const frameRatio = frameSize.width / frameSize.height;
    if (Math.abs(frameRatio - 0.5625) > 0.015) {
      problems.push(problem("error", "bad_reel_ratio", "reel-frame-05s.png must be 9:16 as a reel ratio proxy.", item.assets.reelFrame));
    }
  }

  if (item.captions.instagram.length > INSTAGRAM_CAPTION_LIMIT) {
    problems.push(problem("error", "instagram_caption_too_long", `Instagram caption exceeds ${INSTAGRAM_CAPTION_LIMIT} characters.`, item.assets.caption));
  }
  if (item.platforms.threads.text.length > THREADS_TEXT_LIMIT) {
    problems.push(problem("error", "threads_caption_too_long", `Threads text exceeds ${THREADS_TEXT_LIMIT} characters.`, item.assets.caption));
  }
  if (item.platforms.youtube?.enabled) {
    if (!item.platforms.youtube.video || !existsSync(item.platforms.youtube.video)) {
      problems.push(problem("error", "missing_youtube_video", "YouTube upload needs a reel video.", item.assets.reel));
    }
    if (!item.platforms.youtube.title || item.platforms.youtube.title.length > YOUTUBE_TITLE_LIMIT) {
      problems.push(problem("error", "youtube_title_invalid", `YouTube title must be 1-${YOUTUBE_TITLE_LIMIT} characters.`, item.assets.caption));
    }
    if ((item.platforms.youtube.description ?? "").length > YOUTUBE_DESCRIPTION_LIMIT) {
      problems.push(problem("error", "youtube_description_too_long", `YouTube description exceeds ${YOUTUBE_DESCRIPTION_LIMIT} characters.`, item.assets.caption));
    }
  }
  if (!item.sourceLinks.length) {
    problems.push(problem("error", "missing_source_link", "Caption or source-pack must include at least one source link.", item.assets.caption));
  }

  const errors = problems.filter((entry) => entry.severity === "error").length;
  const warnings = problems.filter((entry) => entry.severity === "warning").length;
  return {
    id: item.id,
    projectSlug: item.projectSlug,
    status: errors ? "blocked" : "ready",
    problems,
    errors,
    warnings,
  };
}

export async function validateQueue(queue, options = {}) {
  const items = [];
  for (const item of queue.items) {
    items.push(await validateItem(item, options));
  }
  const errors = items.reduce((total, item) => total + item.errors, 0);
  const warnings = items.reduce((total, item) => total + item.warnings, 0);
  return {
    generated_at: stableNow(options.now),
    summary: { items: items.length, errors, warnings },
    items,
  };
}

export function planInstagramPublish(item, { dryRun = true, apiVersion = "v24.0" } = {}) {
  const jobs = [];
  if (item.platforms.instagram.carousel.enabled) {
    jobs.push({
      type: "instagram_carousel",
      dryRun,
      endpoint: `https://graph.facebook.com/${apiVersion}/{ig-user-id}/media`,
      publishEndpoint: `https://graph.facebook.com/${apiVersion}/{ig-user-id}/media_publish`,
      mediaType: "CAROUSEL",
      files: item.assets.cards,
      caption: item.platforms.instagram.carousel.caption,
    });
  }
  if (item.platforms.instagram.reel.enabled) {
    jobs.push({
      type: "instagram_reel",
      dryRun,
      endpoint: `https://graph.facebook.com/${apiVersion}/{ig-user-id}/media`,
      publishEndpoint: `https://graph.facebook.com/${apiVersion}/{ig-user-id}/media_publish`,
      mediaType: "REELS",
      file: item.assets.reel,
      caption: item.platforms.instagram.reel.caption,
    });
  }
  return { itemId: item.id, dryRun, jobs };
}

export function planThreadsPublish(item, { dryRun = true, apiVersion = "v1.0" } = {}) {
  const jobs = [];
  jobs.push({
    type: "threads_image_or_text",
    dryRun,
    endpoint: `https://graph.threads.net/${apiVersion}/{threads-user-id}/threads`,
    publishEndpoint: `https://graph.threads.net/${apiVersion}/{threads-user-id}/threads_publish`,
    mediaType: item.platforms.threads.image ? "IMAGE" : "TEXT",
    file: item.platforms.threads.image,
    text: item.platforms.threads.text,
  });
  if (item.platforms.threads.video) {
    jobs.push({
      type: "threads_video",
      dryRun,
      endpoint: `https://graph.threads.net/${apiVersion}/{threads-user-id}/threads`,
      publishEndpoint: `https://graph.threads.net/${apiVersion}/{threads-user-id}/threads_publish`,
      mediaType: "VIDEO",
      file: item.platforms.threads.video,
      text: item.platforms.threads.text,
    });
  }
  return { itemId: item.id, dryRun, jobs };
}

export function planYouTubePublish(item, { dryRun = true } = {}) {
  const jobs = [];
  if (item.platforms.youtube?.enabled) {
    jobs.push({
      type: "youtube_shorts_video",
      dryRun,
      endpoint: "https://www.googleapis.com/upload/youtube/v3/videos",
      thumbnailEndpoint: "https://www.googleapis.com/upload/youtube/v3/thumbnails/set",
      file: item.platforms.youtube.video,
      thumbnail: item.platforms.youtube.thumbnail,
      title: item.platforms.youtube.title,
      description: item.platforms.youtube.description,
      tags: item.platforms.youtube.tags,
    });
  }
  return { itemId: item.id, dryRun, jobs };
}

export function scheduleDueItems(queue, { now, dailyLimit = 3, history = [] } = {}) {
  const nowTime = new Date(now ?? Date.now()).getTime();
  const today = new Date(nowTime).toISOString().slice(0, 10);
  const publishedToday = history.filter((entry) => entry.status === "published" && String(entry.published_at ?? "").startsWith(today)).length;
  const publishedKeys = new Set(history.filter((entry) => entry.status === "published").map((entry) => entry.contentKey));
  const due = [];
  const skipped = [];
  let slots = Math.max(0, dailyLimit - publishedToday);

  for (const item of queue.items) {
    const publishAt = item.publish_at ? new Date(item.publish_at).getTime() : nowTime;
    if (publishedKeys.has(item.contentKey)) {
      skipped.push({ ...item, reason: "already_published" });
      continue;
    }
    if (publishAt > nowTime) {
      skipped.push({ ...item, reason: "not_due" });
      continue;
    }
    if (slots <= 0) {
      skipped.push({ ...item, reason: "daily_limit" });
      continue;
    }
    due.push(item);
    slots -= 1;
  }

  return { now: new Date(nowTime).toISOString(), dailyLimit, due, skipped };
}

export async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function readJsonIfExists(filePath, fallback) {
  if (!existsSync(filePath)) return fallback;
  const text = await readFile(filePath, "utf8");
  return JSON.parse(text.replace(/^\uFEFF/, ""));
}

export async function appendFailure(filePath, entry) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify({ at: stableNow(), ...entry })}\n`, "utf8");
}

export function queueSummary(queue) {
  return queue.items.map((item) => ({
    id: item.id,
    projectSlug: item.projectSlug,
    cards: item.assets.cards.length,
    reel: Boolean(item.assets.reel),
    publish_at: item.publish_at,
    sourceLinks: item.sourceLinks.length,
    projectPath: posixPath(item.projectPath),
  }));
}
