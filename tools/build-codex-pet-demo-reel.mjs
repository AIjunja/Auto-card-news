import { execFileSync } from "child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "fs";
import path from "path";
import { pathToFileURL } from "url";

const ROOT = process.cwd();
const SOURCE = "C:\\Users\\letgo\\Downloads\\VID_20260502_031655_529_bsl.mp4";
const PROJECT = path.join(
  ROOT,
  "carousel-workspace",
  "motion-projects",
  "ai-jjuun",
  "2026-05-02-codex-pet-demo",
);
const FONT_SOURCE = path.join(
  ROOT,
  "carousel-workspace",
  "projects",
  "ai-jjuun",
  "2026-04-30-openai-gpt55-prompt-guidance",
  "assets",
  "fonts",
);
const PUPPETEER_PATH = path.join(
  ROOT,
  ".npm-cache",
  "_npx",
  "d1e1684a442009a1",
  "node_modules",
  "puppeteer-core",
  "lib",
  "esm",
  "puppeteer",
  "puppeteer-core.js",
);
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
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

const W = 1080;
const H = 1920;
const FPS = 12;

const scenes = [
  {
    id: "01-hook",
    srcStart: 104,
    sourceDuration: 3.4,
    duration: 3.4,
    title: "Codex 펫,\n직접 깨워봤어요",
    sub: "입력창에 /pet 치면 끝",
    chip: "HOOK",
    focus: "center",
  },
  {
    id: "02-settings",
    srcStart: 0,
    sourceDuration: 4.2,
    duration: 4.2,
    title: "먼저 설정에서\n펫을 찾아요",
    sub: "한글 UI면 설정 → 모양/외관 쪽",
    chip: "STEP 1",
    focus: "top",
  },
  {
    id: "03-choose",
    srcStart: 40,
    sourceDuration: 4.2,
    duration: 4.2,
    title: "기본 펫을\n하나 골라주고",
    sub: "작은 파란 친구 선택",
    chip: "STEP 2",
    focus: "center",
  },
  {
    id: "04-command",
    srcStart: 80,
    sourceDuration: 4.8,
    duration: 4.8,
    title: "입력창에\n/pet",
    sub: "명령 팔레트에서 Wake Pet도 가능",
    chip: "STEP 3",
    focus: "keyboard",
  },
  {
    id: "05-wake",
    srcStart: 104,
    sourceDuration: 5.0,
    duration: 5.0,
    title: "그러면 이렇게\n조그맣게 뜸",
    sub: "작업창 위에 살짝 따라다녀요",
    chip: "RESULT",
    focus: "pet",
  },
  {
    id: "06-ask",
    srcStart: 132,
    sourceDuration: 4.8,
    duration: 4.8,
    title: "얘가 뭐 하냐면",
    sub: "Codex 상태를 귀엽게 보여주는 친구",
    chip: "WHY",
    focus: "bottom",
  },
  {
    id: "07-answer",
    srcStart: 144,
    sourceDuration: 5.2,
    duration: 5.2,
    title: "작업 중인지\n대기 중인지",
    sub: "다른 앱을 봐도 오버레이로 확인",
    chip: "USEFUL",
    focus: "text",
  },
  {
    id: "08-outro",
    srcStart: 184,
    sourceDuration: 4.2,
    duration: 4.2,
    title: "해보고 싶으면\n/pet",
    sub: "귀여운데 은근 실용적이에욤",
    chip: "TRY",
    focus: "center",
  },
];

function ensureDirs() {
  for (const dir of [
    "assets/fonts",
    "assets/clips",
    "frames/final",
    "output",
    "compose",
  ]) {
    mkdirSync(path.join(PROJECT, dir), { recursive: true });
  }
  for (const name of ["Griun_Mongtori-Rg.ttf", "Moneygraphy-Rounded.woff2"]) {
    const src = path.join(FONT_SOURCE, name);
    if (existsSync(src)) {
      copyFileSync(src, path.join(PROJECT, "assets", "fonts", name));
    }
  }
}

function clipPath(scene) {
  return path.join(PROJECT, "assets", "clips", `${scene.id}.mp4`);
}

function renderSceneClips() {
  for (const scene of scenes) {
    execFileSync(FFMPEG, [
      "-y",
      "-ss",
      String(scene.srcStart),
      "-i",
      SOURCE,
      "-t",
      String(scene.sourceDuration),
      "-an",
      "-vf",
      "scale=1080:1920",
      "-r",
      "24",
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "24",
      "-pix_fmt",
      "yuv420p",
      clipPath(scene),
    ], { stdio: "ignore" });
  }
}

function html() {
  const scenePayload = scenes.map((scene) => ({
    ...scene,
    file: `../assets/clips/${scene.id}.mp4`,
  }));

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
@font-face{font-family:"Griun Mongtori";src:url("../assets/fonts/Griun_Mongtori-Rg.ttf") format("truetype");font-weight:400}
@font-face{font-family:"Moneygraphy Rounded";src:url("../assets/fonts/Moneygraphy-Rounded.woff2") format("woff2");font-weight:700}
*{box-sizing:border-box}
html,body{margin:0;width:${W}px;height:${H}px;background:#050608;overflow:hidden;color:#fff}
body{font-family:"Griun Mongtori","Moneygraphy Rounded",system-ui,sans-serif}
.stage{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:#050608}
video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.08) contrast(1.04)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.52),rgba(0,0,0,.06) 28%,rgba(0,0,0,.18) 58%,rgba(0,0,0,.9));pointer-events:none}
.brand{position:absolute;left:0;right:0;top:50px;text-align:center;font-family:"Moneygraphy Rounded",system-ui,sans-serif;font-size:34px;letter-spacing:9px;font-weight:900;text-shadow:0 8px 22px rgba(0,0,0,.8)}
.copy{position:absolute;left:62px;right:300px;bottom:520px;filter:drop-shadow(0 18px 34px rgba(0,0,0,.58))}
.chip{display:inline-flex;align-items:center;min-height:56px;padding:13px 22px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.48);background:rgba(0,0,0,.62);color:#65ffdc;font-family:"Moneygraphy Rounded";font-size:28px;letter-spacing:1px}
.title{white-space:pre-line;margin:24px 0 0;font-size:70px;line-height:1.05;font-weight:400;letter-spacing:0}
.sub{margin:22px 0 0;font-size:33px;line-height:1.28;color:rgba(255,255,255,.9);letter-spacing:0}
.code{display:inline-block;padding:.04em .26em .01em;border-radius:.22em;background:rgba(101,255,220,.18);color:#65ffdc;font-family:Consolas,monospace;font-weight:900}
.progress{position:absolute;left:62px;right:300px;bottom:472px;height:8px;border-radius:999px;background:rgba(255,255,255,.16);overflow:hidden}
.bar{height:100%;width:0;background:linear-gradient(90deg,#65ffdc,#72a2ff)}
.pulse{position:absolute;width:210px;height:210px;border-radius:50%;border:5px solid rgba(101,255,220,.86);box-shadow:0 0 44px rgba(101,255,220,.42);opacity:0;transform:translate(-50%,-50%) scale(.75)}
.arrow{position:absolute;left:62px;top:620px;width:190px;height:92px;border-radius:999px;border:3px solid rgba(101,255,220,.8);background:rgba(0,0,0,.46);display:flex;align-items:center;justify-content:center;color:#65ffdc;font-size:32px;opacity:0;transform:translateY(16px)}
.pet-badge{position:absolute;right:310px;bottom:520px;width:126px;height:154px;filter:drop-shadow(0 24px 45px rgba(72,103,255,.45));opacity:.95}
.pet-badge:before{content:"";position:absolute;left:10px;right:10px;top:10px;height:92px;border-radius:32px;background:linear-gradient(180deg,#73a2ff,#3953db)}
.pet-badge:after{content:">_";position:absolute;left:32px;right:32px;top:40px;height:36px;border-radius:12px;background:#202637;color:#c8efff;font-family:Consolas,monospace;font-size:21px;line-height:36px;text-align:center}
.pet-body{position:absolute;left:42px;right:42px;bottom:0;height:60px;border-radius:18px;background:#4165e6}
.scene-04-command .pulse{left:28%;top:63%;opacity:1}
.scene-05-wake .pulse{left:76%;top:56%;opacity:1}
.scene-07-answer .arrow{opacity:1;transform:translateY(0)}
.scene-01-hook .title,.scene-08-outro .title{font-size:78px}
.scene-04-command .copy{bottom:520px}
.scene-04-command .title{font-size:68px}
</style>
</head>
<body>
<main id="stage" class="stage">
  <video id="video" muted playsinline></video>
  <div class="shade"></div>
  <div class="brand">AI JJUN</div>
  <div class="pulse"></div>
  <div class="arrow">상태 확인</div>
  <div class="pet-badge"><span class="pet-body"></span></div>
  <section class="copy">
    <div id="chip" class="chip"></div>
    <h1 id="title" class="title"></h1>
    <p id="sub" class="sub"></p>
  </section>
  <div class="progress"><div id="bar" class="bar"></div></div>
</main>
<script>
const scenes = ${JSON.stringify(scenePayload)};
const total = scenes.reduce((sum, scene) => sum + scene.duration, 0);
const video = document.getElementById("video");
const stage = document.getElementById("stage");
const chip = document.getElementById("chip");
const title = document.getElementById("title");
const sub = document.getElementById("sub");
const bar = document.getElementById("bar");
let current = -1;

function rich(text) {
  return String(text).replaceAll("/pet", '<span class="code">/pet</span>');
}

function locate(t) {
  let cursor = 0;
  for (let i = 0; i < scenes.length; i++) {
    const end = cursor + scenes[i].duration;
    if (t <= end || i === scenes.length - 1) {
      return { index: i, local: Math.max(0, t - cursor), scene: scenes[i] };
    }
    cursor = end;
  }
}

async function setScene(index) {
  if (current === index) return;
  current = index;
  const scene = scenes[index];
  video.src = scene.file;
  chip.textContent = scene.chip;
  title.innerHTML = rich(scene.title);
  sub.innerHTML = rich(scene.sub);
  stage.className = "stage scene-" + scene.id;
  await new Promise((resolve) => {
    if (video.readyState >= 1) resolve();
    else video.addEventListener("loadedmetadata", resolve, { once: true });
  });
}

window.renderAt = async (t) => {
  const found = locate(t);
  await setScene(found.index);
  const seekTo = Math.min(found.local, Math.max(0, video.duration - 0.05));
  await new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      resolve();
    };
    video.addEventListener("seeked", onSeeked);
    video.currentTime = seekTo;
  });
  const sceneProgress = Math.min(1, found.local / found.scene.duration);
  bar.style.width = ((t / total) * 100).toFixed(2) + "%";
  const ease = Math.min(1, sceneProgress * 2.8);
  document.querySelector(".copy").style.transform = "translateY(" + ((1 - ease) * 26).toFixed(2) + "px)";
  document.querySelector(".copy").style.opacity = String(0.55 + ease * 0.45);
  document.querySelector(".pulse").style.transform = "translate(-50%,-50%) scale(" + (0.74 + Math.sin(t * 5) * 0.06).toFixed(3) + ")";
  return true;
};

window.__duration = total;
</script>
</body>
</html>`;
}

async function renderFrames() {
  const puppeteer = await import(pathToFileURL(PUPPETEER_PATH).href);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--allow-file-access-from-files"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  const htmlPath = path.join(PROJECT, "compose", "index.html");
  writeFileSync(htmlPath, html(), "utf8");
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
  const duration = await page.evaluate(() => window.__duration);
  const totalFrames = Math.round(duration * FPS);
  const framesDir = path.join(PROJECT, "frames", "final");
  rmSync(framesDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });
  for (let frame = 0; frame < totalFrames; frame += 1) {
    const t = frame / FPS;
    await page.evaluate((time) => window.renderAt(time), t);
    await page.screenshot({
      path: path.join(framesDir, `frame-${String(frame).padStart(4, "0")}.png`),
      type: "png",
    });
  }
  await page.evaluate(() => window.renderAt(12.4));
  await page.screenshot({
    path: path.join(PROJECT, "output", "preview-frame.png"),
    type: "png",
  });
  await browser.close();
  return { framesDir, totalFrames };
}

function encode(framesDir) {
  execFileSync(FFMPEG, [
    "-y",
    "-framerate",
    String(FPS),
    "-i",
    path.join(framesDir, "frame-%04d.png"),
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    path.join(PROJECT, "output", "codex-pet-demo-reel-draft.mp4"),
  ], { stdio: "ignore" });
}

function writeDocs() {
  const plan = scenes.map((scene, index) => {
    return `${index + 1}. ${scene.chip} (${scene.duration.toFixed(1)}s)\n   - Source: ${scene.srcStart}s~${(scene.srcStart + scene.sourceDuration).toFixed(1)}s\n   - Overlay: ${scene.title.replaceAll("\n", " / ")}\n   - Note: ${scene.sub}`;
  }).join("\n\n");
  writeFileSync(path.join(PROJECT, "edit-plan.md"), `# Codex Pet Demo Edit Plan\n\nTarget: 9:16 silent Instagram Reel draft.\n\n${plan}\n`, "utf8");
  writeFileSync(path.join(PROJECT, "source.md"), `# Source\n\n- Raw footage: ${SOURCE}\n- Metadata: 2160x3840, 60fps, 209.4s, screen recording.\n- Edit policy: raw file is untouched; all output is generated inside this project.\n`, "utf8");
  writeFileSync(path.join(PROJECT, "design.md"), `# Design\n\n- AI쭌 dark editorial style.\n- Griun Mongtori for Korean overlays.\n- Mint code chips and progress bar.\n- No burned subtitles because the source has no voice and the user may add captions later.\n`, "utf8");
  writeFileSync(path.join(PROJECT, "caption.md"), `Codex 펫 직접 켜봤어욤 🐾\n\n입력창에 /pet 치면 작은 펫이 깨어나고,\nCodex가 작업 중인지 대기 중인지 귀엽게 보여줍니다.\n\n설정에서 펫 고르고 → /pet 입력 → 끝.\n귀여운데 은근 실용적이라 한 번 켜볼 만함요 ㅋㅋ\n\nContents Editor · AI쭌\nSource · OpenAI Codex app / 직접 녹화\n\n#Codex #OpenAI #AI툴 #코딩AI #개발자도구 #AI뉴스\n`, "utf8");
}

async function main() {
  ensureDirs();
  renderSceneClips();
  const { framesDir } = await renderFrames();
  encode(framesDir);
  writeDocs();
  console.log(`rendered draft reel: ${path.join(PROJECT, "output", "codex-pet-demo-reel-draft.mp4")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
