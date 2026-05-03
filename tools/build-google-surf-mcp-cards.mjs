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
const PROJECT_ROOT = path.join(ROOT, "carousel-workspace", "projects", "ai-jjuun");
const PROJECT = path.join(PROJECT_ROOT, "2026-05-01-google-surf-mcp");
const TEMPLATE_PROJECT = path.join(PROJECT_ROOT, "2026-04-30-openai-gpt55-prompt-guidance");
const FONT_SOURCE = path.join(TEMPLATE_PROJECT, "assets", "fonts");
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
  PROJECT_ROOT,
  "2026-04-29-claude-creative-work",
  "node_modules",
  "@remotion",
  "compositor-win32-x64-msvc",
  "ffmpeg.exe",
);

const CARD_W = 1080;
const CARD_H = 1350;
const FPS = 12;
const MOTION_SECONDS = 4.2;

const URLS = {
  repo: "https://github.com/HarimxChoi/google-surf-mcp",
  readmeKo: "https://raw.githubusercontent.com/HarimxChoi/google-surf-mcp/main/README.ko.md",
  readme: "https://raw.githubusercontent.com/HarimxChoi/google-surf-mcp/main/README.md",
  npm: "https://www.npmjs.com/package/google-surf-mcp",
  demo: "https://raw.githubusercontent.com/HarimxChoi/google-surf-mcp/main/assets/demo.gif",
  reddit:
    "https://www.reddit.com/r/coolgithubprojects/comments/1t0lnh1/i_built_a_free_google_search_mcp_that_actually/",
};

const cards = [
  {
    kind: "cover",
    image: "github-repo.png",
    tag: "AI NEWS | MCP",
    title: "구글 검색 MCP,<br />무료로 되는 거<br />찾고 있었죠?",
    sub: "검색하고, 본문까지 읽어오는 MCP가 나왔어요.",
    source: "HarimxChoi/google-surf-mcp",
  },
  {
    visual: "thread",
    label: "개발자 원문",
    chips: ["무료", "API 키 없음", "검색+본문"],
    title: "무료 MCP 6개<br />테스트했는데 다 실패",
    body: "그래서 직접 만들었다는 흐름이에요.<br />핵심은 구글 검색을 MCP 도구처럼<br />바로 쓰게 해주는 겁니다.",
  },
  {
    image: "github-repo.png",
    label: "GitHub README",
    chips: ["No API key", "local use", "Chrome profile"],
    title: "이 MCP가<br />다른 점은요",
    body: "API 키, 프록시, CAPTCHA 솔버 없이<br />로컬 Chrome 프로필로 검색을 돌리는 방식이에요.",
  },
  {
    visual: "tools",
    label: "4개 도구",
    chips: ["search", "extract", "search_extract"],
    title: "검색만 하는 게<br />끝이 아니에요",
    body: "`search_extract`를 쓰면<br />검색 결과만 던지는 게 아니라<br />페이지 본문까지 같이 읽어옵니다.",
    motion: true,
  },
  {
    visual: "captcha",
    label: "CAPTCHA 대응",
    chips: ["사람이 1회 해결", "자동 재시도", "프로필 평판"],
    title: "막히면<br />사람이 한 번 풀어요",
    body: "CAPTCHA가 뜨면 Chrome 창이 열리고,<br />사람이 풀면 같은 프로필로<br />자동 재시도하는 구조예요.",
  },
  {
    visual: "speed",
    label: "속도 감각",
    chips: ["~2s/query", "parallel x4", "x10 ~5s"],
    title: "느린 검색 MCP가<br />싫었던 분들",
    body: "README 기준 sequential은 약 2초,<br />parallel x4는 약 2초 wall,<br />search_extract x5는 약 7초예요.",
  },
  {
    visual: "install",
    label: "설치 체크",
    chips: ["Node 18+", "Chrome", "npx"],
    title: "써보려면<br />이 3개만 보면 돼요",
    body: "Node 18 이상.<br />Chrome 또는 Chromium 설치.<br />클라이언트 config에 `npx google-surf-mcp` 추가.",
  },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function rich(text) {
  return String(text)
    .replace(/`([^`]+)`/g, '<span class="code-word">$1</span>')
    .replaceAll("\n", "<br />");
}

function ensureDirs() {
  for (const dir of [path.join(PROJECT, "cards"), path.join(PROJECT, "motion"), path.join(PROJECT, "output")]) {
    rmSync(dir, { recursive: true, force: true });
  }
  for (const dir of [
    path.join(PROJECT, "assets", "fonts"),
    path.join(PROJECT, "assets", "images"),
    path.join(PROJECT, "cards"),
    path.join(PROJECT, "motion", "card-04-tools"),
    path.join(PROJECT, "output"),
  ]) {
    mkdirSync(dir, { recursive: true });
  }
  for (const name of ["Griun_Mongtori-Rg.ttf", "Moneygraphy-Rounded.woff2"]) {
    const src = path.join(FONT_SOURCE, name);
    if (existsSync(src)) copyFileSync(src, path.join(PROJECT, "assets", "fonts", name));
  }
}

async function captureSourceScreens(browser) {
  const targets = [
    [URLS.repo, "github-repo.png"],
    [URLS.npm, "npm-page.png"],
  ];

  for (const [url, filename] of targets) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1380, height: 1100, deviceScaleFactor: 1 });
    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        for (const button of buttons) {
          const text = (button.textContent || "").toLowerCase();
          if (text.includes("accept") || text.includes("agree") || text.includes("continue")) {
            button.click();
          }
        }
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await page.screenshot({
        path: path.join(PROJECT, "assets", "images", filename),
        fullPage: false,
      });
    } catch (error) {
      console.warn(`capture failed ${url}: ${error.message}`);
      writeFallbackImage(filename, url);
    } finally {
      await page.close();
    }
  }
}

function writeFallbackImage(filename, title) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1380" height="1100">
  <defs>
    <style>
      @font-face{font-family:Money;src:url("../fonts/Moneygraphy-Rounded.woff2") format("woff2");font-weight:700}
      text{font-family:Money, Arial, sans-serif}
    </style>
  </defs>
  <rect width="1380" height="1100" fill="#0d1117"/>
  <rect x="70" y="80" width="1140" height="760" rx="34" fill="#161b22" stroke="#30363d"/>
  <text x="120" y="180" fill="#f0f6fc" font-size="58">google-surf-mcp</text>
  <text x="120" y="270" fill="#65ffdc" font-size="36">${escapeHtml(title)}</text>
  <text x="120" y="370" fill="#8b949e" font-size="34">source screenshot fallback</text>
  </svg>`;
  writeFileSync(path.join(PROJECT, "assets", "images", filename), svg, "utf8");
}

function css() {
  return `@font-face{font-family:"Griun Mongtori";src:url("../assets/fonts/Griun_Mongtori-Rg.ttf") format("truetype");font-weight:400}
@font-face{font-family:"Moneygraphy Rounded";src:url("../assets/fonts/Moneygraphy-Rounded.woff2") format("woff2");font-weight:700}
*{box-sizing:border-box}
html,body{width:${CARD_W}px;height:${CARD_H}px;margin:0;overflow:hidden;background:#000;color:#fff;font-family:"Moneygraphy Rounded",system-ui,sans-serif;word-break:keep-all;letter-spacing:0}
.card{position:relative;width:${CARD_W}px;height:${CARD_H}px;overflow:hidden;background:#000}
.brand{position:absolute;z-index:30;top:54px;left:0;right:0;text-align:center;font-size:34px;letter-spacing:8px;font-weight:900;color:#fff}
.footer{position:absolute;z-index:30;right:68px;bottom:48px;font-size:28px;letter-spacing:6px;font-weight:900;color:#fff}
.source{position:absolute;z-index:30;left:68px;bottom:48px;color:rgba(255,255,255,.64);font-size:23px}
.code-word{display:inline-block;padding:.04em .25em .02em;border-radius:.24em;background:rgba(101,255,220,.14);color:#65ffdc;font-family:Consolas,monospace;font-weight:900}
.cover-img{position:absolute;inset:-14px 0 0;width:100%;height:900px;object-fit:cover;object-position:top center;filter:saturate(1.08) contrast(1.04)}
.cover-dim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.04) 0%,rgba(0,0,0,.45) 50%,#000 81%)}
.cover-copy{position:absolute;z-index:10;left:70px;right:70px;bottom:112px}
.pill{display:inline-flex;align-items:center;min-height:58px;padding:13px 22px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.74);background:rgba(0,0,0,.38);font-size:30px;backdrop-filter:blur(8px)}
.cover-title{margin:34px 0 0;font-family:"Griun Mongtori","Moneygraphy Rounded",system-ui,sans-serif;font-size:98px;line-height:1.04;font-weight:400;letter-spacing:0;text-shadow:0 9px 34px rgba(0,0,0,.55)}
.cover-sub{margin:24px 0 0;font-family:"Griun Mongtori","Moneygraphy Rounded",system-ui,sans-serif;color:rgba(255,255,255,.9);font-size:39px;line-height:1.25;letter-spacing:0}
.media{position:absolute;left:42px;right:42px;top:136px;height:555px;overflow:hidden;border:4px solid rgba(255,255,255,.9);background:#11151b}
.media:after{content:"";position:absolute;inset:auto 0 0;height:44%;background:linear-gradient(0deg,rgba(0,0,0,.9),transparent);pointer-events:none}
.media-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;filter:saturate(1.05) contrast(1.04);opacity:.9}
.copy{position:absolute;z-index:12;left:70px;right:70px;top:750px}
.num{display:flex;align-items:center;justify-content:center;width:70px;height:70px;margin-bottom:26px;border-radius:50%;background:rgba(255,255,255,.13);font-size:42px;color:rgba(255,255,255,.78);font-weight:900}
.title{margin:0;font-family:"Griun Mongtori","Moneygraphy Rounded",system-ui,sans-serif;font-size:78px;line-height:1.08;font-weight:400;letter-spacing:0}
.body{margin:34px 0 0;font-family:"Griun Mongtori","Moneygraphy Rounded",system-ui,sans-serif;font-size:38px;line-height:1.28;color:rgba(255,255,255,.9);letter-spacing:0}
.label{position:absolute;z-index:8;left:34px;bottom:36px;display:inline-flex;align-items:center;min-height:52px;padding:12px 19px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.38);background:rgba(0,0,0,.66);font-size:27px;color:#65ffdc}
.chips{position:absolute;z-index:8;right:34px;bottom:34px;display:flex;gap:12px;flex-wrap:wrap;justify-content:flex-end;max-width:760px}
.chips span{display:inline-flex;align-items:center;min-height:50px;padding:12px 16px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.66);font-size:25px;color:#65ffdc}
.visual{position:absolute;inset:0;background:linear-gradient(145deg,#151a20,#050607);overflow:hidden}
.visual:before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px);background-size:60px 60px;opacity:.62}
.thread-card{position:absolute;z-index:3;left:70px;right:70px;top:58px;height:410px;border-radius:28px;background:#0d0f13;border:1px solid rgba(255,255,255,.2);box-shadow:0 24px 70px rgba(0,0,0,.5);padding:32px}
.avatar{width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,#d8e8ff,#111);display:inline-block;vertical-align:middle;margin-right:16px}
.thread-name{font-size:31px;color:#fff}.thread-time{color:#88909b;font-size:25px;margin-left:12px}
.thread-text{margin-top:28px;font-size:32px;line-height:1.42;color:#fff}.check{color:#65ffdc}
.tools-grid{position:absolute;z-index:4;left:78px;right:78px;top:72px;display:grid;grid-template-columns:1fr 1fr;gap:20px}
.tool{height:180px;border-radius:28px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);padding:28px}.tool b{display:block;color:#65ffdc;font-size:38px}.tool span{display:block;margin-top:18px;color:rgba(255,255,255,.8);font-size:27px;line-height:1.25}
.captcha-window{position:absolute;z-index:3;left:76px;right:76px;top:56px;height:422px;border-radius:30px;background:#f6f8fa;color:#111;overflow:hidden;box-shadow:0 26px 70px rgba(0,0,0,.48)}
.browser-top{height:70px;background:#e9edf2;border-bottom:1px solid #c8d0da;display:flex;align-items:center;padding:0 24px;gap:10px}.dot{width:15px;height:15px;border-radius:50%;display:inline-block}.red{background:#ff5f56}.yellow{background:#ffbd2e}.green{background:#27c93f}
.urlbar{flex:1;height:38px;border-radius:999px;background:white;border:1px solid #d0d7de;margin-left:16px;color:#57606a;font-family:Consolas,monospace;font-size:18px;display:flex;align-items:center;padding-left:18px}
.captcha-body{padding:34px}.captcha-box{margin:18px auto 0;width:410px;height:210px;border:2px solid #ccd4dd;border-radius:16px;background:white;display:flex;align-items:center;justify-content:center;text-align:center;font-size:36px;line-height:1.25}.captcha-box small{display:block;margin-top:10px;font-size:22px;color:#57606a}
.speed-list{position:absolute;z-index:4;left:92px;right:92px;top:64px}.speed-row{display:grid;grid-template-columns:1.1fr 1fr;align-items:center;margin-bottom:16px;padding:19px 30px;border-radius:26px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18)}.speed-row b{font-size:37px}.speed-row span{font-size:37px;color:#65ffdc;text-align:right}
.install-panel{position:absolute;z-index:4;left:80px;right:80px;top:66px;height:390px;border-radius:28px;background:#0d1117;border:1px solid rgba(255,255,255,.24);box-shadow:0 28px 80px rgba(0,0,0,.45);overflow:hidden}
.install-bar{height:56px;background:#161b22;border-bottom:1px solid #30363d;display:flex;align-items:center;padding:0 22px;gap:9px}
.install-code{padding:28px 34px;font-family:Consolas,monospace;font-size:28px;line-height:1.55;color:#e6edf3}
.install-code .comment{color:#8b949e}.install-code .ok{color:#65ffdc}.install-code .cmd{color:#fff;font-weight:900}
`;
}

function mediaHtml(card) {
  const chips = (card.chips || []).map((chip) => `<span>${escapeHtml(chip)}</span>`).join("");
  if (card.image) {
    return `<div class="media"><img class="media-img" src="../assets/images/${escapeHtml(card.image)}" alt=""><div class="label">${escapeHtml(card.label)}</div><div class="chips">${chips}</div></div>`;
  }
  if (card.visual === "thread") {
    return `<div class="media"><div class="visual">
      <section class="thread-card">
        <span class="avatar"></span><span class="thread-name">ha_rim_choii</span><span class="thread-time">7시간</span>
        <div class="thread-text">구글 검색 MCP가 전부 안돼서 직접 만들었음<br><br>
        <span class="check">✅</span> 실제로 잘됨<br>
        <span class="check">✅</span> search / extract / search_extract<br>
        <span class="check">✅</span> API 키, 프록시 불필요</div>
      </section>
      <div class="label">${escapeHtml(card.label)}</div><div class="chips">${chips}</div>
    </div></div>`;
  }
  if (card.visual === "tools") {
    return `<div class="media"><div class="visual">
      <div class="tools-grid">
        <div class="tool"><b>search</b><span>구글 결과<br>빠르게 가져오기</span></div>
        <div class="tool"><b>search_parallel</b><span>여러 검색어<br>한 번에 처리</span></div>
        <div class="tool"><b>extract</b><span>URL 본문<br>마크다운 추출</span></div>
        <div class="tool"><b>search_extract</b><span>검색 + 본문<br>한 번에 끝</span></div>
      </div>
      <div class="label">${escapeHtml(card.label)}</div><div class="chips">${chips}</div>
    </div></div>`;
  }
  if (card.visual === "captcha") {
    return `<div class="media"><div class="visual">
      <div class="captcha-window">
        <div class="browser-top"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span><div class="urlbar">google.com/search?q=...</div></div>
        <div class="captcha-body">
          <div style="font-size:32px;font-weight:900">CAPTCHA가 뜨면</div>
          <div class="captcha-box">사람이 한 번 풀기<small>이후 호출은 자동 재시도</small></div>
        </div>
      </div>
      <div class="label">${escapeHtml(card.label)}</div><div class="chips">${chips}</div>
    </div></div>`;
  }
  if (card.visual === "speed") {
    return `<div class="media"><div class="visual">
      <div class="speed-list">
        <div class="speed-row"><b>sequential</b><span>~2s/query</span></div>
        <div class="speed-row"><b>parallel x4</b><span>~2s wall</span></div>
        <div class="speed-row"><b>parallel x10</b><span>~5s wall</span></div>
        <div class="speed-row"><b>search_extract x5</b><span>~7s wall</span></div>
      </div>
      <div class="label">${escapeHtml(card.label)}</div><div class="chips">${chips}</div>
    </div></div>`;
  }
  if (card.visual === "install") {
    return `<div class="media"><div class="visual">
      <div class="install-panel">
        <div class="install-bar"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
        <div class="install-code">
          <div><span class="comment"># Node 18+ / Chrome needed</span></div>
          <div><span class="cmd">npx</span> <span class="ok">google-surf-mcp</span></div>
          <br>
          <div><span class="comment"># MCP client config</span></div>
          <div>{ "command": "npx",</div>
          <div>&nbsp;&nbsp;"args": ["-y", "google-surf-mcp"] }</div>
        </div>
      </div>
      <div class="label">${escapeHtml(card.label)}</div><div class="chips">${chips}</div>
    </div></div>`;
  }
  return "";
}

function cardHtml(card, index) {
  if (card.kind === "cover") {
    return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../style.css"></head><body>
<article class="card">
  <div class="brand">AI JJUN</div>
  <img class="cover-img" src="../assets/images/${escapeHtml(card.image)}" alt="">
  <div class="cover-dim"></div>
  <section class="cover-copy">
    <div class="pill">${escapeHtml(card.tag)}</div>
    <h1 class="cover-title">${rich(card.title)}</h1>
    <p class="cover-sub">${rich(card.sub)}</p>
  </section>
  <div class="source">Source · ${escapeHtml(card.source)}</div>
</article></body></html>`;
  }
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../style.css"></head><body>
<article class="card">
  <div class="brand">AI JJUN</div>
  ${mediaHtml(card)}
  <section class="copy">
    <div class="num">${index + 1}</div>
    <h1 class="title">${rich(card.title)}</h1>
    <p class="body">${rich(card.body)}</p>
  </section>
  <div class="footer">AI NEWS</div>
</article></body></html>`;
}

function motionHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../style.css"><style>
.tool{transform:translateY(calc(30px - var(--p,0) * 30px));opacity:var(--p,1)}
.tool:nth-child(2){transform:translateY(calc(30px - var(--p2,0) * 30px));opacity:var(--p2,1)}
.tool:nth-child(3){transform:translateY(calc(30px - var(--p3,0) * 30px));opacity:var(--p3,1)}
.tool:nth-child(4){transform:translateY(calc(30px - var(--p4,0) * 30px));opacity:var(--p4,1);border-color:#65ffdc99;box-shadow:0 0 42px rgba(101,255,220,.18)}
.flow{position:absolute;z-index:10;left:170px;right:170px;bottom:90px;height:72px;border-radius:999px;background:rgba(101,255,220,.12);border:1px solid rgba(101,255,220,.5);display:flex;align-items:center;justify-content:center;color:#65ffdc;font-size:34px;opacity:var(--flow,0);transform:translateY(calc(20px - var(--flow,0) * 20px))}
</style></head><body>
${cardHtml(cards[3], 3).match(/<article[\s\S]*<\/article>/)[0]}
<script>
const t = Number(new URLSearchParams(location.search).get("t") || 0);
const clamp = (v) => Math.max(0, Math.min(1, v));
document.documentElement.style.setProperty("--p", clamp(t / .45));
document.documentElement.style.setProperty("--p2", clamp((t - .35) / .45));
document.documentElement.style.setProperty("--p3", clamp((t - .7) / .45));
document.documentElement.style.setProperty("--p4", clamp((t - 1.05) / .45));
document.documentElement.style.setProperty("--flow", clamp((t - 1.7) / .5));
</script></body></html>`;
}

async function renderHtml(page, htmlPath, outputPath) {
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
  await page.screenshot({ path: outputPath, type: "png" });
}

async function renderMotion(browser) {
  const motionDir = path.join(PROJECT, "motion", "card-04-tools");
  const framesDir = path.join(motionDir, "frames");
  rmSync(framesDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });
  const motionPath = path.join(motionDir, "index.html");
  writeFileSync(motionPath, motionHtml(), "utf8");

  const page = await browser.newPage();
  await page.setViewport({ width: CARD_W, height: CARD_H, deviceScaleFactor: 1 });
  const totalFrames = Math.round(MOTION_SECONDS * FPS);
  for (let frame = 0; frame < totalFrames; frame += 1) {
    const t = frame / FPS;
    await page.goto(`${pathToFileURL(motionPath).href}?t=${t.toFixed(3)}`, { waitUntil: "networkidle0" });
    await page.screenshot({
      path: path.join(framesDir, `frame-${String(frame).padStart(4, "0")}.png`),
      type: "png",
    });
  }
  await page.goto(`${pathToFileURL(motionPath).href}?t=2.4`, { waitUntil: "networkidle0" });
  await page.screenshot({
    path: path.join(PROJECT, "output", "card-04-motion-preview.png"),
    type: "png",
  });
  await page.close();

  execFileSync(
    FFMPEG,
    [
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
      path.join(PROJECT, "output", "card-04-motion.mp4"),
    ],
    { stdio: "ignore" },
  );
}

function writeDocs() {
  const source = `# google-surf-mcp Source

## Primary sources

- GitHub repository: ${URLS.repo}
- Korean README: ${URLS.readmeKo}
- npm package: ${URLS.npm}
- Developer thread screenshot: user-provided Threads image in chat
- Reddit post mirroring the same launch claims: ${URLS.reddit}

## Verified points used

- google-surf-mcp is described as an Anti-Bot Search MCP with no API key.
- It exposes four tools: search, search_parallel, extract, search_extract.
- It uses Playwright, persistent Chrome profile, stealth, Readability, and Turndown.
- CAPTCHA recovery opens Chrome for a human solve, then retries.
- README reports sequential ~2s/query, parallel x4 ~2s wall, parallel x10 ~5s wall, and search_extract x5 ~7s wall.
`;

  const sourcePack = `# Source Pack

## Media used

- \`github-repo.png\`: ${URLS.repo}
- \`npm-page.png\`: ${URLS.npm}
- HTML-native reconstructed thread card based on user-provided screenshot.
- HTML-native tool cards, CAPTCHA window, and speed table.

## Angle

무료 Google 검색 MCP를 찾다가 계속 실패했던 사람에게, "검색만 되는 MCP"가 아니라 "검색하고 본문까지 읽는 MCP"라는 점을 쉽게 보여준다.
`;

  const brief = `# Brief

## Viewer

Claude Code, Cursor, Codex, MCP를 쓰는 AI 활용자/개발자. 특히 최신 정보 검색을 AI에게 맡기고 싶은 사람.

## Promise

API 키 없이 로컬 Chrome 기반으로 Google 검색과 본문 추출을 같이 처리하는 MCP를 30초 안에 이해시킨다.
`;

  const storyboard = cards
    .map((card, index) => {
      const visual = card.image || card.visual;
      return `${index + 1}. ${card.title.replaceAll("<br />", " ")}
   - Visual: ${visual}
   - Job: ${card.label || card.tag || "cover"}`;
    })
    .join("\n\n");

  const motionPlan = `# Motion Plan

- Card 04: tools reveal motion.
- Engine: HTML + Puppeteer frames + ffmpeg.
- Reason: four tools appear one by one, then \`search_extract\` is highlighted as the key "검색 + 본문" feature.
- Static fallback: \`output/card-04.png\`.
`;

  const design = `# Design

- Format: Instagram 4:5, 1080x1350.
- Style: HERMES editorial pattern.
- Font: Moneygraphy for Korean copy, Consolas for code/tool names.
- Body cards: top proof visual, bottom black editorial copy.
- Motion card uses the same typography and chip style as static cards.
`;

  const caption = `구글 검색 MCP 찾다가 계속 실패했던 분들, 이거 꽤 야물딱집니다욤 🔎

HarimxChoi님이 만든 \`google-surf-mcp\`는 API 키 없이 Google 검색을 MCP 도구로 붙이는 프로젝트예요.

핵심은 “검색 결과 링크만 주는 도구”가 아니라,
검색하고 → URL 본문까지 읽어오는 흐름을 한 MCP 안에서 처리한다는 점이에요.

지원 도구는 4개예요.

① \`search\`  
단일 검색

② \`search_parallel\`  
여러 검색어 병렬 처리

③ \`extract\`  
URL 본문을 마크다운으로 추출

④ \`search_extract\`  
검색 + 본문 추출을 한 번에

API 키, 프록시, CAPTCHA 솔버 없이 로컬 Chrome 프로필을 쓰는 구조고,
CAPTCHA가 뜨면 사람이 Chrome 창에서 한 번 풀고 자동 재시도하는 방식이에요.

AI에게 최신 정보 찾기 맡기고 싶은 분들은 저장해두면 좋을 듯해욤.
써보려면 GitHub 링크 참고하면 됩니다 👇

GitHub: ${URLS.repo}
npm: ${URLS.npm}

Contents Editor · AI쭌
Source · HarimxChoi / GitHub / npm

#MCP #GoogleSearch #ClaudeCode #AI툴 #개발자뉴스 #AI검색 #오픈소스 #AI쭌`;

  writeFileSync(path.join(PROJECT, "source.md"), source, "utf8");
  writeFileSync(path.join(PROJECT, "source-pack.md"), sourcePack, "utf8");
  writeFileSync(path.join(PROJECT, "brief.md"), brief, "utf8");
  writeFileSync(path.join(PROJECT, "storyboard.md"), `# Storyboard\n\n${storyboard}\n`, "utf8");
  writeFileSync(path.join(PROJECT, "motion-plan.md"), motionPlan, "utf8");
  writeFileSync(path.join(PROJECT, "design.md"), design, "utf8");
  writeFileSync(path.join(PROJECT, "instagram-caption.md"), caption, "utf8");
}

function writeIndex() {
  const items = cards
    .map((_, i) => {
      const num = String(i + 1).padStart(2, "0");
      const motion =
        i === 3
          ? `<video controls muted loop src="output/card-${num}-motion.mp4"></video>`
          : "";
      return `<section><h2>Card ${i + 1}</h2><img src="output/card-${num}.png" alt="card ${i + 1}">${motion}</section>`;
    })
    .join("\n");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>google-surf-mcp</title><style>
body{margin:0;background:#111;color:#fff;font-family:system-ui,sans-serif;padding:32px}
h1{font-size:34px}section{margin:0 0 44px}h2{font-size:22px;color:#65ffdc}img,video{display:block;width:min(420px,100%);border:1px solid #333;margin-bottom:14px}
</style></head><body><h1>google-surf-mcp carousel</h1>${items}</body></html>`;
  writeFileSync(path.join(PROJECT, "index.html"), html, "utf8");
}

async function main() {
  ensureDirs();
  writeFileSync(path.join(PROJECT, "style.css"), css(), "utf8");
  writeDocs();

  const { default: puppeteer } = await import(pathToFileURL(PUPPETEER_PATH).href);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
  });

  await captureSourceScreens(browser);

  for (let i = 0; i < cards.length; i += 1) {
    const num = String(i + 1).padStart(2, "0");
    const htmlPath = path.join(PROJECT, "cards", `card-${num}.html`);
    writeFileSync(htmlPath, cardHtml(cards[i], i), "utf8");
    const page = await browser.newPage();
    await page.setViewport({ width: CARD_W, height: CARD_H, deviceScaleFactor: 1 });
    await renderHtml(page, htmlPath, path.join(PROJECT, "output", `card-${num}.png`));
    await page.close();
  }

  await renderMotion(browser);
  await browser.close();
  writeIndex();
  console.log(`google-surf-mcp rendered: ${PROJECT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
