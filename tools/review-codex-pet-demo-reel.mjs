import { execFileSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import path from "path";

const ROOT = process.cwd();
const PROJECT = path.join(
  ROOT,
  "carousel-workspace",
  "motion-projects",
  "ai-jjuun",
  "2026-05-02-codex-pet-demo",
);
const FFMPEG = path.join(
  ROOT,
  "carousel-workspace",
  "projects",
  "ai-jjuun",
  "2026-04-29-claude-creative-work",
  "node_modules",
  "@remotion",
  "compositor-win32-x64-msvc",
  "ffmpeg.exe",
);
const input = path.join(PROJECT, "output", "codex-pet-demo-reel-draft.mp4");
const outDir = path.join(PROJECT, "output", "review-frames");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

for (const t of [2, 7, 12, 17, 23, 30, 34]) {
  execFileSync(FFMPEG, [
    "-y",
    "-ss",
    String(t),
    "-i",
    input,
    "-frames:v",
    "1",
    "-vf",
    "scale=270:-1",
    path.join(outDir, `review-${String(t).padStart(2, "0")}.jpg`),
  ], { stdio: "ignore" });
}

console.log(outDir);
