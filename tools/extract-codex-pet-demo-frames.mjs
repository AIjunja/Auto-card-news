import { execFileSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import path from "path";

const ROOT = process.cwd();
const SOURCE = "C:\\Users\\letgo\\Downloads\\VID_20260502_031655_529_bsl.mp4";
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
const OUT = path.join(
  ROOT,
  "carousel-workspace",
  "motion-projects",
  "ai-jjuun",
  "2026-05-02-codex-pet-demo",
  "assets",
  "frames",
);

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const times = [
  0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80,
  88, 96, 104, 112, 120, 132, 144, 156, 168, 184, 202,
];

for (const seconds of times) {
  const name = `sample-${String(seconds).padStart(3, "0")}.jpg`;
  execFileSync(FFMPEG, [
    "-y",
    "-ss",
    String(seconds),
    "-i",
    SOURCE,
    "-frames:v",
    "1",
    "-vf",
    "scale=360:-1",
    path.join(OUT, name),
  ], { stdio: "ignore" });
}

console.log(`extracted ${times.length} frames to ${OUT}`);
