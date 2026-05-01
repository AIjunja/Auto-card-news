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
const PROJECT = path.join(PROJECT_ROOT, "2026-05-01-claude-code-hermes-billing");
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
  issue: "https://github.com/anthropics/claude-code/issues/53262",
  issueAlt: "https://github.com/anthropics/claude-code/issues/53171",
  extraUsage: "https://support.claude.com/en/articles/12429409-manage-extra-usage-for-paid-claude-plans",
  openclaw: "https://techcrunch.com/2026/04/04/anthropic-says-claude-code-subscribers-will-need-to-pay-extra-for-openclaw-support/",
};

const cards = [
  {
    kind: "cover",
    image: "github-issue-53262.png",
    tag: "AI NEWS | CODE",
    title: "Claude,<br />커밋 한 줄 때문에<br />토큰 폭탄 맞았다고?",
    sub: "HERMES.md 이슈, 겁먹기 전에 딱 이것만 보면 돼요.",
    source: "GitHub issue #53262",
  },
  {
    image: "github-issue-53262.png",
    label: "GitHub 이슈",
    chips: ["closed", "area:cost", "has repro"],
    title: "문제는 코드가 아니라<br />커밋 문구였어요",
    body: "최근 커밋 메시지에 `HERMES.md`가 있으면<br />Claude Code가 기본 한도 대신<br />추가 사용량으로 빠졌다는 보고예요.",
  },
  {
    visual: "terminal",
    label: "재현 예시",
    chips: ["커밋 메시지", "Claude Code", "요금 경로"],
    title: "파일 만든 게 아니라<br />글자가 걸린 거예요",
    body: "실제 파일이 없어도<br />git 기록에 그 문구가 남아 있으면<br />문제가 재현됐다는 얘기예요.",
    motion: true,
  },
  {
    visual: "compare",
    label: "헷갈리면 여기",
    chips: ["대소문자", ".md", "최근 기록"],
    title: "왜 이상하냐면<br />조건이 너무 구체적임",
    body: "`hermes.md`는 통과,<br />`HERMES.txt`도 통과.<br />그런데 `HERMES.md`만 걸렸다고 보고됐어요.",
  },
  {
    image: "claude-extra-usage.png",
    label: "extra usage",
    chips: ["기본 한도", "추가 사용량", "결제 확인"],
    title: "무서운 건<br />요금 쪽이에요",
    body: "플랜 한도가 남아 있어도<br />요청이 추가 사용량으로 잡히면<br />예상 밖 비용이 생길 수 있거든요.",
  },
  {
    visual: "repo",
    label: "AI쭌 해석",
    chips: ["파일", "커밋", "프롬프트", "요금"],
    title: "AI 코딩툴,<br />생각보다 많이 봅니다",
    body: "요즘 에이전트는 코드만 보는 게 아니라<br />파일 이름, 커밋 기록, 실행 환경까지<br />작업 힌트로 읽을 수 있어요.",
  },
  {
    image: "github-issue-53262.png",
    label: "저장용 체크",
    chips: ["저장", "공유", "링크 확인"],
    title: "Claude Code 쓴다면<br />이 3개만 체크",
    body: "최근 커밋 메시지 확인.<br />Claude 사용량 확인.<br />이상하면 이슈 링크랑 같이 문의하기.",
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
  for (const dir of [
    path.join(PROJECT, "cards"),
    path.join(PROJECT, "motion"),
    path.join(PROJECT, "output"),
  ]) {
    rmSync(dir, { recursive: true, force: true });
  }

  const dirs = [
    path.join(PROJECT, "assets", "fonts"),
    path.join(PROJECT, "assets", "images"),
    path.join(PROJECT, "cards"),
    path.join(PROJECT, "motion", "card-03-terminal"),
    path.join(PROJECT, "output"),
  ];
  dirs.forEach((dir) => mkdirSync(dir, { recursive: true }));

  for (const name of ["Griun_Mongtori-Rg.ttf", "Moneygraphy-Rounded.woff2"]) {
    const src = path.join(FONT_SOURCE, name);
    if (existsSync(src)) copyFileSync(src, path.join(PROJECT, "assets", "fonts", name));
  }
}

async function captureSourceScreens(browser) {
  const targets = [
    ["issue", URLS.issue, "github-issue-53262.png", { width: 1380, height: 1100 }],
    ["issueAlt", URLS.issueAlt, "github-issue-53171.png", { width: 1380, height: 1100 }],
    ["extraUsage", URLS.extraUsage, "claude-extra-usage.png", { width: 1380, height: 1100 }],
    ["openclaw", URLS.openclaw, "openclaw-context.png", { width: 1380, height: 1100 }],
  ];

  for (const [, url, filename, viewport] of targets) {
    const page = await browser.newPage();
    await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
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
  <text x="120" y="180" fill="#f0f6fc" font-size="58">Claude Code HERMES.md</text>
  <text x="120" y="270" fill="#7ee787" font-size="36">${escapeHtml(title)}</text>
  <text x="120" y="370" fill="#8b949e" font-size="34">source screenshot fallback</text>
  </svg>`;
  writeFileSync(path.join(PROJECT, "assets", "images", filename), svg, "utf8");
}

function css() {
  return `@font-face{font-family:Griun;src:url("../assets/fonts/Griun_Mongtori-Rg.ttf") format("truetype")}
@font-face{font-family:Money;src:url("../assets/fonts/Moneygraphy-Rounded.woff2") format("woff2");font-weight:700}
*{box-sizing:border-box}
html,body{width:${CARD_W}px;height:${CARD_H}px;margin:0;overflow:hidden;background:#000;color:#fff;font-family:Money,system-ui,sans-serif;word-break:keep-all;letter-spacing:0}
.card{position:relative;width:${CARD_W}px;height:${CARD_H}px;overflow:hidden;background:#000}
.brand{position:absolute;z-index:30;top:54px;left:0;right:0;text-align:center;font-size:34px;letter-spacing:8px;font-weight:900;color:#fff}
.footer{position:absolute;z-index:30;right:68px;bottom:48px;font-size:28px;letter-spacing:6px;font-weight:900;color:#fff}
.source{position:absolute;z-index:30;left:68px;bottom:48px;color:rgba(255,255,255,.64);font-size:23px}
.code-word{display:inline-block;padding:.04em .25em .02em;border-radius:.24em;background:rgba(101,255,220,.14);color:#65ffdc;font-family:Consolas,monospace;font-weight:900}
.cover-img{position:absolute;inset:-14px 0 0;width:100%;height:900px;object-fit:cover;filter:saturate(1.08) contrast(1.04)}
.cover-dim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.04) 0%,rgba(0,0,0,.42) 50%,#000 80%)}
.cover-copy{position:absolute;z-index:10;left:70px;right:70px;bottom:112px}
.pill{display:inline-flex;align-items:center;min-height:58px;padding:13px 22px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.74);background:rgba(0,0,0,.38);font-size:30px;backdrop-filter:blur(8px)}
.cover-title{margin:34px 0 0;font-size:98px;line-height:1.04;font-weight:900;text-shadow:0 9px 34px rgba(0,0,0,.55)}
.cover-sub{margin:24px 0 0;color:rgba(255,255,255,.88);font-size:38px;line-height:1.3}
.media{position:absolute;left:42px;right:42px;top:136px;height:555px;overflow:hidden;border:4px solid rgba(255,255,255,.9);background:#11151b}
.media:after{content:"";position:absolute;inset:auto 0 0;height:44%;background:linear-gradient(0deg,rgba(0,0,0,.9),transparent);pointer-events:none}
.media-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;filter:saturate(1.05) contrast(1.04);opacity:.9}
.copy{position:absolute;z-index:12;left:70px;right:70px;top:750px}
.num{display:flex;align-items:center;justify-content:center;width:70px;height:70px;margin-bottom:26px;border-radius:50%;background:rgba(255,255,255,.13);font-size:42px;color:rgba(255,255,255,.78);font-weight:900}
.title{margin:0;font-size:76px;line-height:1.12;font-weight:900}
.body{margin:34px 0 0;font-size:37px;line-height:1.34;color:rgba(255,255,255,.9)}
.label{position:absolute;z-index:8;left:34px;bottom:36px;display:inline-flex;align-items:center;min-height:52px;padding:12px 19px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.38);background:rgba(0,0,0,.66);font-size:27px;color:#65ffdc}
.chips{position:absolute;z-index:8;right:34px;bottom:34px;display:flex;gap:12px;flex-wrap:wrap;justify-content:flex-end;max-width:760px}
.chips span{display:inline-flex;align-items:center;min-height:50px;padding:12px 16px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.66);font-size:25px;color:#65ffdc}
.visual{position:absolute;inset:0;background:linear-gradient(145deg,#151a20,#050607);overflow:hidden}
.visual:before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px);background-size:60px 60px;opacity:.62}
.terminal-box{position:absolute;z-index:3;left:58px;right:58px;top:62px;bottom:92px;border-radius:26px;background:#0d1117;border:1px solid rgba(255,255,255,.2);box-shadow:0 30px 80px rgba(0,0,0,.46);padding:34px;font-family:Consolas,monospace;color:#dbeafe;font-size:30px;line-height:1.52}
.terminal-dot{display:inline-block;width:16px;height:16px;border-radius:50%;margin-right:8px}.red{background:#ff5f56}.yellow{background:#ffbd2e}.green{background:#27c93f}
.prompt{color:#65ffdc}.fail{color:#ff8b7a}.pass{color:#7dffb2}.dim{color:#7d8590}
.compare-grid{position:absolute;z-index:4;left:64px;right:64px;top:70px;display:grid;grid-template-columns:1fr 1fr;gap:22px}
.case-card{height:340px;border-radius:28px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.08);padding:30px}
.case-card.bad{border-color:rgba(255,139,122,.7);box-shadow:0 0 46px rgba(255,139,122,.14)}
.case-card.good{border-color:rgba(101,255,220,.65);box-shadow:0 0 46px rgba(101,255,220,.12)}
.case-card h3{margin:0 0 18px;font-size:42px}.case-card p{margin:0;font-size:31px;line-height:1.34;color:rgba(255,255,255,.82)}
.repo-cloud{position:absolute;z-index:3;left:70px;right:70px;top:65px;height:410px}
.blob{position:absolute;padding:24px 28px 20px;border-radius:26px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);font-size:34px;box-shadow:0 16px 45px rgba(0,0,0,.28)}
.blob.main{left:320px;top:136px;background:rgba(101,255,220,.16);border-color:#65ffdc99;font-size:46px}
.b1{left:12px;top:34px}.b2{right:18px;top:24px}.b3{left:70px;bottom:28px}.b4{right:80px;bottom:40px}
.line{position:absolute;height:4px;background:#65ffdc88;box-shadow:0 0 20px #65ffdc66;transform-origin:left center}.r1{left:238px;top:120px;width:190px;transform:rotate(22deg)}.r2{left:620px;top:112px;width:170px;transform:rotate(-18deg)}.r3{left:230px;top:320px;width:170px;transform:rotate(-24deg)}.r4{left:608px;top:318px;width:170px;transform:rotate(18deg)}
.meter-wrap{position:absolute;z-index:4;left:80px;right:80px;top:90px}
.meter{margin:0 0 32px;padding:28px;border-radius:28px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18)}
.meter b{display:block;margin-bottom:18px;font-size:34px}.bar{height:34px;border-radius:999px;background:rgba(255,255,255,.13);overflow:hidden}.bar i{display:block;height:100%;border-radius:999px;background:#65ffdc}.bar.danger i{background:#ff8b7a}
`;
}

function mediaHtml(card) {
  const chips = (card.chips || []).map((chip) => `<span>${escapeHtml(chip)}</span>`).join("");
  if (card.image) {
    return `<div class="media"><img class="media-img" src="../assets/images/${escapeHtml(card.image)}" alt=""><div class="label">${escapeHtml(card.label)}</div><div class="chips">${chips}</div></div>`;
  }
  if (card.visual === "terminal") {
    return `<div class="media"><div class="visual">
      <div class="terminal-box">
        <span class="terminal-dot red"></span><span class="terminal-dot yellow"></span><span class="terminal-dot green"></span><br><br>
        <span class="prompt">$</span> git commit -m "add <span class="fail">HERMES.md</span>"<br>
        <span class="dim">[main] 1 file changed</span><br><br>
        <span class="prompt">$</span> claude -p "say hello"<br>
        <span class="fail">API Error: out of extra usage</span><br><br>
        <span class="prompt">$</span> git commit -m "add <span class="pass">hermes.md</span>"<br>
        <span class="pass">Hello!</span>
      </div>
      <div class="label">${escapeHtml(card.label)}</div><div class="chips">${chips}</div>
    </div></div>`;
  }
  if (card.visual === "compare") {
    return `<div class="media"><div class="visual">
      <div class="compare-grid">
        <section class="case-card bad"><h3>문제 보고</h3><p><span class="code-word">HERMES.md</span><br>대문자 + .md<br>커밋 메시지</p></section>
        <section class="case-card good"><h3>통과 보고</h3><p><span class="code-word">hermes.md</span><br><span class="code-word">HERMES.txt</span><br>파일명만 존재</p></section>
      </div>
      <div class="label">${escapeHtml(card.label)}</div><div class="chips">${chips}</div>
    </div></div>`;
  }
  if (card.visual === "repo") {
    return `<div class="media"><div class="visual">
      <div class="repo-cloud">
        <div class="blob b1">파일</div><div class="blob b2">커밋 기록</div>
        <div class="blob main">AI agent</div><div class="blob b3">실행 환경</div><div class="blob b4">요금 경로</div>
        <i class="line r1"></i><i class="line r2"></i><i class="line r3"></i><i class="line r4"></i>
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
    <h1 class="cover-title">${card.title}</h1>
    <p class="cover-sub">${escapeHtml(card.sub)}</p>
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
body{background:#000}
.type span{opacity:0}.type span.on{opacity:1}
.cursor{display:inline-block;width:14px;height:34px;background:#65ffdc;vertical-align:-5px;animation:blink .7s infinite}
@keyframes blink{50%{opacity:.15}}
.glow{position:absolute;z-index:5;left:86px;right:86px;top:410px;height:80px;border-radius:30px;background:rgba(255,139,122,.12);border:1px solid rgba(255,139,122,.34);filter:blur(.1px);opacity:var(--warn,0)}
.route{position:absolute;z-index:6;right:86px;top:330px;padding:18px 22px 15px;border-radius:999px;background:rgba(255,139,122,.9);color:#111;font-family:Money;font-size:30px;transform:translateY(var(--routeY,20px));opacity:var(--route,0)}
</style></head><body>
<article class="card">
  <div class="brand">AI JJUN</div>
  <div class="media"><div class="visual">
    <div class="terminal-box">
      <span class="terminal-dot red"></span><span class="terminal-dot yellow"></span><span class="terminal-dot green"></span><br><br>
      <span class="prompt">$</span> <span class="type" data-text='git commit -m "add HERMES.md"'></span><span class="cursor"></span><br>
      <span class="dim">[main] 1 file changed</span><br><br>
      <span class="prompt">$</span> <span class="type" data-text='claude -p "say hello"'></span><br>
      <span class="fail type" data-text='API Error: out of extra usage'></span><br>
    </div>
    <div class="glow"></div>
    <div class="route">extra usage로 이동</div>
    <div class="label">모션 예시</div><div class="chips"><span>typing</span><span>billing route</span><span>error</span></div>
  </div></div>
  <section class="copy">
    <div class="num">3</div>
    <h1 class="title">파일 만든 게 아니라<br />글자가 걸린 거예요</h1>
    <p class="body"><span class="code-word">HERMES.md</span> 문자가 git 기록에 남으면<br />요청이 추가 사용량으로 빠졌다는 보고예요.</p>
  </section>
  <div class="footer">AI NEWS</div>
</article>
<script>
const t = Number(new URLSearchParams(location.search).get("t") || 0);
document.documentElement.style.setProperty("--warn", Math.max(0, Math.min(1, (t - 2.2) / .5)));
document.documentElement.style.setProperty("--route", Math.max(0, Math.min(1, (t - 2.4) / .45)));
document.documentElement.style.setProperty("--routeY", String(24 - Math.max(0, Math.min(1, (t - 2.4) / .45)) * 24) + "px");
for (const el of document.querySelectorAll(".type")) {
  const start = el.classList.contains("fail") ? 2.6 : (el.previousElementSibling?.classList?.contains("prompt") ? 1.35 : .25);
  const text = el.dataset.text || "";
  const count = Math.max(0, Math.min(text.length, Math.floor((t - start) * 18)));
  el.textContent = text.slice(0, count);
}
</script></body></html>`;
}

async function renderHtml(page, htmlPath, outputPath) {
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
  await page.screenshot({ path: outputPath, type: "png" });
}

async function renderMotion(browser) {
  const motionDir = path.join(PROJECT, "motion", "card-03-terminal");
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
  await page.goto(`${pathToFileURL(motionPath).href}?t=3.2`, { waitUntil: "networkidle0" });
  await page.screenshot({
    path: path.join(PROJECT, "output", "card-03-motion-preview.png"),
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
      path.join(PROJECT, "output", "card-03-motion.mp4"),
    ],
    { stdio: "ignore" },
  );
}

function writeDocs() {
  const source = `# Claude Code HERMES.md Billing Issue Source

## Primary sources

- GitHub issue #53262: ${URLS.issue}
- Related reproduction issue #53171: ${URLS.issueAlt}
- Claude Help Center, extra usage: ${URLS.extraUsage}
- TechCrunch context on OpenClaw/extra usage policy: ${URLS.openclaw}

## Verified points used

- The GitHub issue says the case-sensitive string \`HERMES.md\` in recent commit history made Claude Code route requests to extra usage instead of Max plan quota.
- The original reporter listed Claude Code v2.1.119, macOS Apple Silicon, Max 20x, and Opus models as the tested environment.
- The issue body distinguishes commit messages from an actual file named \`HERMES.md\`.
- The issue was closed, and a pinned comment said affected users were being contacted for refund plus another month of credits.
`;

  const sourcePack = `# Source Pack

## Media used

1. \`github-issue-53262.png\`
   - Source: ${URLS.issue}
   - Use: cover, proof cards, final checklist
   - Notes: official GitHub issue page; used as source screenshot.

2. \`claude-extra-usage.png\`
   - Source: ${URLS.extraUsage}
   - Use: billing/extra usage explanation card
   - Notes: official Claude Help Center.

3. \`github-issue-53171.png\`
   - Source: ${URLS.issueAlt}
   - Use: backup proof/reference.

4. \`openclaw-context.png\`
   - Source: ${URLS.openclaw}
   - Use: context only, not the main claim.

## Angle

"Claude가 경쟁사를 막았다"가 아니라 "git 기록 속 문자열 하나가 요금 경로를 이상하게 만들었다"로 설명한다.
공포 마케팅보다 Claude Code 사용자가 바로 확인할 수 있는 체크리스트를 준다.
`;

  const brief = `# Brief

## Viewer

Claude Code, Codex, Cursor 같은 AI 코딩툴을 쓰는 개발자와 AI 툴 관심자.

## Stop reason

"커밋 메시지 한 줄 때문에 요금이 이상하게 나갈 수 있다고?"라는 즉각적인 돈/도구 리스크.

## Promise

사건을 자극적으로 부풀리지 않고, 무엇이 확인됐고 무엇을 봐야 하는지 30초 안에 정리한다.

## Copy rule

기능명보다 상황을 먼저 말한다. 어려운 말은 카드 안에서 풀어쓴다.
`;

  const storyboard = `# Storyboard

1. 커밋 한 줄 때문에 Claude 요금이 새었다?
   - Visual: GitHub issue full-bleed cover.
   - Job: stop scroll.

2. 문제의 단어는 \`HERMES.md\`
   - Visual: issue screenshot.
   - Job: main fact.

3. 파일이 아니라 커밋 메시지였어요
   - Visual: terminal typing motion.
   - Job: misunderstanding correction.

4. 진짜 포인트는 딱 이거예요
   - Visual: bad/good trigger comparison.
   - Job: precise detail.

5. 왜 사람들이 놀랐냐면요
   - Visual: Claude extra usage screenshot.
   - Job: money context.

6. AI 코딩툴은 코드만 보지 않아요
   - Visual: repo metadata cloud.
   - Job: AIjjuun interpretation.

7. Claude Code 쓴다면 이 3개만 보세요
   - Visual: GitHub issue proof.
   - Job: save/share checklist.
`;

  const motionPlan = `# Motion Plan

- Card 03: MP4 terminal typing motion.
- Engine: HTML + Puppeteer frames + ffmpeg.
- Reason: the issue is easiest to understand when the viewer sees the exact git command and billing error appear in sequence.
- Static fallback: \`output/card-03.png\`.
`;

  const design = `# Design

- Format: Instagram 4:5, 1080x1350.
- Style: AI Trend-style editorial card with real source screenshots.
- Font: Moneygraphy for main text, code snippets in Consolas.
- Body cards: top 45% media/proof, bottom dark editorial copy block.
- Motion typography must match static card scale.
`;

  const caption = `Claude Code 쓰는 분들, 커밋 한 줄 때문에 토큰 폭탄 맞았다는 이슈 보셨나욤 🫠

최근 GitHub 이슈에서 \`HERMES.md\`라는 문자가 **최근 커밋 메시지**에 있으면 Claude Code 요청이 기본 플랜 한도가 아니라 extra usage 쪽으로 잡혔다는 보고가 올라왔어요.

쉽게 말하면,
파일을 새로 만든 게 문제가 아니라
git 기록에 남아 있던 특정 문구가 요청 경로를 이상하게 바꿨다는 얘기예요.

Claude Code 쓰고 있다면 이것만 체크해보세욤.

① 최근 커밋 메시지에 \`HERMES.md\`가 있었는지  
② Claude 사용량/extra usage가 갑자기 늘었는지  
③ 이상하면 GitHub 이슈 링크랑 같이 문의했는지

이슈는 closed 상태고, pinned comment에서는 영향 받은 사용자에게 refund + credits 안내를 한다고 적혀있어요.

무서워서 못 쓰자는 얘기가 아니라,
AI 코딩툴이 코드만 보는 게 아니라 작업 기록까지 읽는다는 걸 기억하자는 얘기예요.

저장해두면 팀에서 Claude Code 점검할 때 바로 써먹을 수 있어욤 ㅠ

Contents Editor · AI쭌
Source · GitHub / Claude Help Center / TechCrunch

GitHub issue #53262: ${URLS.issue}
Claude extra usage 도움말: ${URLS.extraUsage}
OpenClaw 관련 맥락: ${URLS.openclaw}

#ClaudeCode #Claude #AI코딩 #개발자뉴스 #AI뉴스 #GitHub #AI툴 #코딩툴 #AI쭌`;

  writeFileSync(path.join(PROJECT, "source.md"), source, "utf8");
  writeFileSync(path.join(PROJECT, "source-pack.md"), sourcePack, "utf8");
  writeFileSync(path.join(PROJECT, "brief.md"), brief, "utf8");
  writeFileSync(path.join(PROJECT, "storyboard.md"), storyboard, "utf8");
  writeFileSync(path.join(PROJECT, "motion-plan.md"), motionPlan, "utf8");
  writeFileSync(path.join(PROJECT, "design.md"), design, "utf8");
  writeFileSync(path.join(PROJECT, "instagram-caption.md"), caption, "utf8");
}

function writeIndex() {
  const items = cards
    .map((_, i) => {
      const num = String(i + 1).padStart(2, "0");
      const motion =
        i === 2
          ? `<video controls muted loop src="output/card-${num}-motion.mp4"></video>`
          : "";
      return `<section><h2>Card ${i + 1}</h2><img src="output/card-${num}.png" alt="card ${i + 1}">${motion}</section>`;
    })
    .join("\n");

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Claude Code HERMES Billing</title><style>
body{margin:0;background:#111;color:#fff;font-family:system-ui,sans-serif;padding:32px}
h1{font-size:34px}section{margin:0 0 44px}h2{font-size:22px;color:#65ffdc}img,video{display:block;width:min(420px,100%);border:1px solid #333;margin-bottom:14px}
</style></head><body><h1>Claude Code HERMES Billing v2</h1>${items}</body></html>`;
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
  console.log(`Claude Code HERMES v2 rendered: ${PROJECT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
