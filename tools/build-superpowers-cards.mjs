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
const PROJECT = path.join(PROJECT_ROOT, "2026-05-03-superpowers");
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
const MOTION_SECONDS = 5.5;

const URLS = {
  repo: "https://github.com/obra/superpowers",
  readme: "https://raw.githubusercontent.com/obra/superpowers/main/README.md",
  claudePlugin: "https://claude.com/plugins/superpowers",
  release: "https://blog.fsck.com/2025/12/superpowers.html",
};

const cards = [
  {
    kind: "cover",
    image: "github-repo.png",
    tag: "AI NEWS | AGENT",
    title: "하네스 엔지니어링<br>해보고 싶다면<br>이 세팅부터",
    sub: "GitHub 17만+ 스타. AI 코딩 에이전트가 막 달리지 않게 잡아주는 Superpowers",
    source: "obra/superpowers",
  },
  {
    image: "github-repo.png",
    label: "GitHub repo",
    chips: ["177k stars", "skills", "methodology"],
    title: "GitHub 17만 스타<br>이 정도면<br>그냥 유명함",
    body: "특정 모델 뉴스가 아니라<br>AI 개발 방식을 잡아주는 기본 세팅이라<br>언제 올려도 맥락이 살아나요.",
  },
  {
    visual: "meaning",
    label: "한 줄 설명",
    chips: ["설계 먼저", "계획 먼저", "검증 먼저"],
    title: "Superpowers는<br>스킬 모음이 아니라<br>작업 방식이에요",
    body: "AI가 바로 코드부터 쓰지 않고<br>질문하고, 설계하고, 계획하고,<br>테스트하게 만드는 방법론에 가까워요.",
  },
  {
    visual: "workflow",
    label: "Motion card",
    chips: ["질문", "설계", "TDD", "리뷰"],
    title: "바로 코딩 금지.<br>먼저 순서를<br>잡아줘요",
    body: "아이디어를 받으면<br>대화로 요구사항을 정리하고,<br>계획과 테스트, 리뷰까지 보게 해요.",
    motion: true,
  },
  {
    visual: "tdd",
    label: "핵심 루프",
    chips: ["RED", "GREEN", "REFACTOR"],
    title: "코드보다 먼저<br>실패 테스트를<br>보게 함",
    body: "README 기준으로 TDD, YAGNI, DRY를 강조해요.<br>‘됐겠지’가 아니라<br>증거를 보고 다음 단계로 가는 흐름이에요.",
  },
  {
    visual: "subagents",
    label: "혼자 달리지 않게",
    chips: ["subagents", "review", "worktrees"],
    title: "에이전트가<br>몇 시간 달려도<br>흐름을 안 잃게",
    body: "계획이 잡히면 작업을 나누고,<br>검토하고, 다시 고치게 해서<br>AI가 옆길로 새는 걸 줄이는 구조예요.",
  },
  {
    visual: "install",
    label: "설치 지원",
    chips: ["Claude", "Codex", "Cursor", "Gemini"],
    title: "Claude만 되는 게<br>아니라 여러 도구에<br>붙일 수 있음",
    body: "Claude Code, Codex, Cursor,<br>OpenCode, Copilot CLI, Gemini CLI까지<br>설치 경로가 README에 정리돼 있어요.",
  },
  {
    image: "github-repo.png",
    label: "AI쭌 노트",
    chips: ["저장각", "입문 세팅", "하네스"],
    title: "하네스 엔지니어링<br>관심 있으면<br>저장해두세요",
    body: "17만 스타가 괜히 붙은 게 아니라<br>AI에게 일 시키는 순서를 잡아주는<br>시작점으로 보기 좋은 리포예요.",
  },
];

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function rich(value) {
  return String(value)
    .replaceAll("\n", "<br>")
    .replace(/`([^`]+)`/g, '<span class="code-word">$1</span>');
}

function ensureDirs() {
  rmSync(PROJECT, { recursive: true, force: true });
  for (const dir of [
    "assets/fonts",
    "assets/images",
    "cards",
    "motion/card-04-workflow-frames",
    "output",
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

function fallbackImage(filename, title) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="980">
  <rect width="1400" height="980" fill="#050608"/>
  <defs>
    <linearGradient id="g" x1="0" x2="1">
      <stop offset="0" stop-color="#111827"/>
      <stop offset="1" stop-color="#1d0f0a"/>
    </linearGradient>
  </defs>
  <rect x="80" y="80" width="1240" height="820" rx="42" fill="url(#g)" stroke="#384152"/>
  <text x="135" y="205" fill="#ffffff" font-family="Arial" font-size="78" font-weight="700">Superpowers</text>
  <text x="135" y="300" fill="#ff9b62" font-family="Arial" font-size="44">agentic skills framework</text>
  <text x="135" y="390" fill="#dbe4ef" font-family="Arial" font-size="34">${esc(title)}</text>
  <rect x="760" y="235" width="430" height="300" rx="30" fill="#0d1117" stroke="#30363d"/>
  <text x="815" y="325" fill="#7dffb2" font-family="Consolas" font-size="34">$ superpowers</text>
  <text x="815" y="395" fill="#ff9b62" font-family="Consolas" font-size="28">brainstorm → plan</text>
  <text x="815" y="450" fill="#ff9b62" font-family="Consolas" font-size="28">test → review</text>
  </svg>`;
  writeFileSync(path.join(PROJECT, "assets", "images", filename), svg, "utf8");
}

async function captureSources(browser) {
  const targets = [
    [URLS.repo, "github-repo.png"],
    [URLS.claudePlugin, "claude-plugin.png"],
  ];
  for (const [url, filename] of targets) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1080, deviceScaleFactor: 1 });
    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 50000 });
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await page.screenshot({
        path: path.join(PROJECT, "assets", "images", filename),
        fullPage: false,
      });
    } catch (error) {
      fallbackImage(filename, url);
    } finally {
      await page.close();
    }
  }
}

function cardCss() {
  return `@font-face{font-family:"Griun Mongtori";src:url("../assets/fonts/Griun_Mongtori-Rg.ttf") format("truetype");font-weight:400}
@font-face{font-family:"Moneygraphy Rounded";src:url("../assets/fonts/Moneygraphy-Rounded.woff2") format("woff2");font-weight:700}
*{box-sizing:border-box}
html,body{width:${CARD_W}px;height:${CARD_H}px;margin:0;overflow:hidden;background:#000;color:#fff;font-family:"Moneygraphy Rounded",system-ui,sans-serif;word-break:keep-all;letter-spacing:0}
.card{position:relative;width:${CARD_W}px;height:${CARD_H}px;overflow:hidden;background:#000}
.brand{position:absolute;z-index:40;top:54px;left:0;right:0;text-align:center;font-size:34px;letter-spacing:8px;font-weight:900;color:#fff}
.footer{position:absolute;z-index:40;right:68px;bottom:48px;font-size:28px;letter-spacing:6px;font-weight:900;color:#fff}
.source{position:absolute;z-index:40;left:68px;bottom:48px;color:rgba(255,255,255,.65);font-size:23px}
.code-word{display:inline-block;padding:.04em .25em .02em;border-radius:.24em;background:rgba(255,143,76,.16);color:#ff9b62;font-family:Consolas,monospace;font-weight:900}
.cover-img{position:absolute;inset:-10px 0 auto;width:100%;height:900px;object-fit:cover;object-position:top center;filter:saturate(1.06) contrast(1.05)}
.cover-dim{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.78),rgba(0,0,0,.35) 55%,rgba(0,0,0,.18)),linear-gradient(180deg,rgba(0,0,0,.08) 0%,rgba(0,0,0,.48) 52%,#000 82%)}
.cover-copy{position:absolute;z-index:10;left:70px;right:70px;bottom:108px}
.pill{display:inline-flex;align-items:center;min-height:58px;padding:13px 22px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.74);background:rgba(0,0,0,.44);font-size:30px;backdrop-filter:blur(8px)}
.cover-title,.cover-sub,.title,.body,.visual-copy{font-family:"Griun Mongtori","Moneygraphy Rounded",system-ui,sans-serif;font-weight:400;letter-spacing:0}
.cover-title{margin:34px 0 0;font-size:96px;line-height:1.04;text-shadow:0 9px 34px rgba(0,0,0,.58)}
.cover-sub{margin:24px 0 0;color:rgba(255,255,255,.9);font-size:39px;line-height:1.24}
.media{position:absolute;left:42px;right:42px;top:136px;height:555px;overflow:hidden;border:4px solid rgba(255,255,255,.9);background:#11151b}
.media:after{content:"";position:absolute;inset:auto 0 0;height:44%;background:linear-gradient(0deg,rgba(0,0,0,.92),transparent);pointer-events:none}
.media-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;filter:saturate(1.05) contrast(1.04);opacity:.9}
.copy{position:absolute;z-index:12;left:70px;right:70px;top:750px}
.num{display:flex;align-items:center;justify-content:center;width:70px;height:70px;margin-bottom:26px;border-radius:50%;background:rgba(255,255,255,.13);font-size:42px;color:rgba(255,255,255,.78);font-weight:900}
.title{margin:0;font-size:78px;line-height:1.08}
.body{margin:34px 0 0;font-size:38px;line-height:1.28;color:rgba(255,255,255,.9)}
.label{position:absolute;z-index:9;left:34px;bottom:36px;display:inline-flex;align-items:center;min-height:52px;padding:12px 19px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.38);background:rgba(0,0,0,.68);font-size:27px;color:#ff9b62}
.chips{position:absolute;z-index:9;right:34px;bottom:34px;display:flex;gap:12px;flex-wrap:wrap;justify-content:flex-end;max-width:760px}
.chips span{display:inline-flex;align-items:center;min-height:50px;padding:12px 16px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.68);font-size:25px;color:#ff9b62}
.visual{position:absolute;inset:0;background:linear-gradient(145deg,#111827,#050607 58%,#1a0f0b);overflow:hidden}
.visual:before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.055) 1px,transparent 1px);background-size:60px 60px;opacity:.62}
.meaning-box{position:absolute;z-index:4;left:76px;right:76px;top:72px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px}
.meaning-box div{height:320px;border-radius:28px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);padding:28px;text-align:center}
.meaning-box b{display:block;color:#ff9b62;font-size:42px;margin-bottom:22px}.meaning-box span{font-family:"Griun Mongtori";font-size:31px;line-height:1.22}
.workflow{position:absolute;z-index:4;left:78px;right:78px;top:82px;display:grid;gap:17px}
.step{height:64px;border-radius:22px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);display:flex;align-items:center;padding:0 26px;font-size:31px}
.step b{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;margin-right:18px;border-radius:50%;background:#ff9b62;color:#111;font-size:24px}
.tdd{position:absolute;z-index:4;left:74px;right:74px;top:90px;display:flex;gap:22px}.tdd div{flex:1;height:320px;border-radius:28px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);padding:30px}.tdd b{display:block;font-size:50px;color:#ff9b62;margin-bottom:26px}.tdd span{font-family:"Griun Mongtori";font-size:31px;line-height:1.22}
.subagents{position:absolute;z-index:4;left:68px;right:68px;top:58px;height:410px}
.node{position:absolute;width:210px;height:112px;border-radius:26px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;text-align:center;font-size:30px;color:#fff}.n1{left:0;top:0}.n2{right:0;top:0}.n3{left:50%;top:150px;transform:translateX(-50%);background:rgba(255,143,76,.16);border-color:rgba(255,143,76,.62)}.n4{left:0;bottom:0}.n5{right:0;bottom:0}
.line{position:absolute;height:4px;background:#ff9b62aa;box-shadow:0 0 20px #ff9b6266;transform-origin:left center}.l1{left:205px;top:60px;width:270px;transform:rotate(18deg)}.l2{right:205px;top:60px;width:270px;transform:rotate(162deg)}.l3{left:205px;bottom:58px;width:270px;transform:rotate(-18deg)}.l4{right:205px;bottom:58px;width:270px;transform:rotate(198deg)}
.install-panel{position:absolute;z-index:4;left:76px;right:76px;top:70px;height:395px;border-radius:28px;background:#0d1117;border:1px solid rgba(255,255,255,.24);box-shadow:0 28px 80px rgba(0,0,0,.45);overflow:hidden}
.bar{height:58px;background:#161b22;border-bottom:1px solid #30363d;display:flex;align-items:center;padding:0 22px;gap:9px}.dot{width:15px;height:15px;border-radius:50%;display:inline-block}.red{background:#ff5f56}.yellow{background:#ffbd2e}.green{background:#27c93f}
.install-code{padding:30px 34px;font-family:Consolas,monospace;font-size:27px;line-height:1.55;color:#e6edf3}.comment{color:#8b949e}.cmd{color:#ff9b62;font-weight:900}.ok{color:#7dffb2}
`;
}

function visualHtml(card) {
  const chips = (card.chips || []).map((chip) => `<span>${esc(chip)}</span>`).join("");
  if (card.image) {
    return `<div class="media"><img class="media-img" src="../assets/images/${esc(card.image)}" alt=""><div class="label">${esc(card.label)}</div><div class="chips">${chips}</div></div>`;
  }
  if (card.visual === "meaning") {
    return `<div class="media"><div class="visual"><div class="meaning-box"><div><b>1</b><span>바로 코딩<br>멈추기</span></div><div><b>2</b><span>설계와 계획<br>먼저 만들기</span></div><div><b>3</b><span>테스트와 리뷰<br>강제하기</span></div></div><div class="label">${esc(card.label)}</div><div class="chips">${chips}</div></div></div>`;
  }
  if (card.visual === "workflow") {
    return `<div class="media"><div class="visual"><div class="workflow"><div class="step"><b>1</b>뭐 만들지 먼저 묻기</div><div class="step"><b>2</b>짧게 읽히는 설계안 만들기</div><div class="step"><b>3</b>구현 계획을 작업 단위로 쪼개기</div><div class="step"><b>4</b>실패 테스트부터 보기</div><div class="step"><b>5</b>리뷰하고 끝까지 검증하기</div></div><div class="label">${esc(card.label)}</div><div class="chips">${chips}</div></div></div>`;
  }
  if (card.visual === "tdd") {
    return `<div class="media"><div class="visual"><div class="tdd"><div><b>RED</b><span>먼저 실패하는<br>테스트를 만들고</span></div><div><b>GREEN</b><span>통과할 만큼만<br>작게 고치고</span></div><div><b>REFACTOR</b><span>검증 후에<br>정리하기</span></div></div><div class="label">${esc(card.label)}</div><div class="chips">${chips}</div></div></div>`;
  }
  if (card.visual === "subagents") {
    return `<div class="media"><div class="visual"><div class="subagents"><div class="line l1"></div><div class="line l2"></div><div class="line l3"></div><div class="line l4"></div><div class="node n1">설계</div><div class="node n2">계획</div><div class="node n3">에이전트 작업</div><div class="node n4">리뷰</div><div class="node n5">검증</div></div><div class="label">${esc(card.label)}</div><div class="chips">${chips}</div></div></div>`;
  }
  if (card.visual === "install") {
    return `<div class="media"><div class="visual"><div class="install-panel"><div class="bar"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div><div class="install-code"><span class="comment"># Claude Code</span><br><span class="cmd">/plugin install</span> superpowers<br><br><span class="comment"># Codex App</span><br>Plugins → Coding → Superpowers<br><br><span class="comment"># Cursor</span><br><span class="cmd">/add-plugin</span> superpowers</div></div><div class="label">${esc(card.label)}</div><div class="chips">${chips}</div></div></div>`;
  }
  return "";
}

function cardHtml(card, index) {
  if (card.kind === "cover") {
    return `<!doctype html><html><head><meta charset="utf-8"><style>${cardCss()}</style></head><body><main class="card"><img class="cover-img" src="../assets/images/${esc(card.image)}" alt=""><div class="cover-dim"></div><div class="brand">AI JJUN</div><section class="cover-copy"><div class="pill">${esc(card.tag)}</div><h1 class="cover-title">${card.title}</h1><p class="cover-sub">${rich(card.sub)}</p></section><div class="source">Source · ${esc(card.source)}</div></main></body></html>`;
  }
  return `<!doctype html><html><head><meta charset="utf-8"><style>${cardCss()}</style></head><body><main class="card"><div class="brand">AI JJUN</div>${visualHtml(card)}<section class="copy"><div class="num">${index}</div><h1 class="title">${rich(card.title)}</h1><p class="body">${rich(card.body)}</p></section><div class="footer">AI NEWS</div></main></body></html>`;
}

function motionHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${cardCss()}
.progress{position:absolute;left:70px;right:70px;bottom:42px;height:8px;border-radius:999px;background:rgba(255,255,255,.15);overflow:hidden;z-index:40}.progress i{display:block;height:100%;width:0;background:linear-gradient(90deg,#ff9b62,#f8ddbf)}
.step{opacity:0;transform:translateX(-28px)}
.copy{filter:drop-shadow(0 18px 36px rgba(0,0,0,.55))}
</style></head><body><main class="card"><div class="brand">AI JJUN</div>${visualHtml(cards[3])}<section class="copy"><div class="num">4</div><h1 class="title">${cards[3].title}</h1><p class="body">${cards[3].body}</p></section><div class="progress"><i id="bar"></i></div><div class="footer">AI NEWS</div></main><script>
const bar=document.getElementById("bar");
function clamp(v){return Math.max(0,Math.min(1,v))}
window.renderAt=(t)=>{const p=clamp(t/${MOTION_SECONDS});bar.style.width=(p*100)+"%";document.querySelectorAll(".step").forEach((el,i)=>{const k=clamp((t-.25-i*.55)/.6);el.style.opacity=k;el.style.transform='translateX('+(-28+28*k)+'px)'})}
window.renderAt(0);
</script></body></html>`;
}

async function renderCards(browser) {
  for (const [idx, card] of cards.entries()) {
    const htmlPath = path.join(PROJECT, "cards", `card-${String(idx + 1).padStart(2, "0")}.html`);
    const pngPath = path.join(PROJECT, "output", `card-${String(idx + 1).padStart(2, "0")}.png`);
    writeFileSync(htmlPath, cardHtml(card, idx + 1), "utf8");
    const page = await browser.newPage();
    await page.setViewport({ width: CARD_W, height: CARD_H, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
    await page.screenshot({ path: pngPath, fullPage: false });
    await page.close();
  }
}

async function renderMotion(browser) {
  const htmlPath = path.join(PROJECT, "motion", "card-04-workflow.html");
  writeFileSync(htmlPath, motionHtml(), "utf8");
  const page = await browser.newPage();
  await page.setViewport({ width: CARD_W, height: CARD_H, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
  const frameDir = path.join(PROJECT, "motion", "card-04-workflow-frames");
  const totalFrames = Math.round(MOTION_SECONDS * FPS);
  for (let frame = 0; frame < totalFrames; frame += 1) {
    await page.evaluate((value) => window.renderAt(value), frame / FPS);
    await page.screenshot({
      path: path.join(frameDir, `frame-${String(frame).padStart(5, "0")}.png`),
      fullPage: false,
    });
  }
  await page.close();
  execFileSync(FFMPEG, [
    "-y",
    "-framerate",
    String(FPS),
    "-i",
    path.join(frameDir, "frame-%05d.png"),
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-r",
    String(FPS),
    "-crf",
    "23",
    path.join(PROJECT, "output", "card-04-motion.mp4"),
  ], { stdio: "ignore" });
  execFileSync(FFMPEG, [
    "-y",
    "-ss",
    "3.5",
    "-i",
    path.join(PROJECT, "output", "card-04-motion.mp4"),
    "-frames:v",
    "1",
    "-q:v",
    "2",
    path.join(PROJECT, "output", "card-04-motion-preview.jpg"),
  ], { stdio: "ignore" });
}

function writeDocs() {
  writeFileSync(path.join(PROJECT, "source.md"), `# Source

- GitHub: ${URLS.repo}
- README: ${URLS.readme}
- Claude plugin page: ${URLS.claudePlugin}

## Verified points

- Superpowers describes itself as a complete software development methodology for coding agents, built on composable skills and initial instructions.
- The README says it makes agents step back before coding, ask what the user is really trying to do, create a spec, make an implementation plan, then use workflows such as TDD, subagent-driven development, reviews, and finishing steps.
- The README lists installation paths for Claude Code, OpenAI Codex CLI/App, Cursor, OpenCode, GitHub Copilot CLI, and Gemini CLI.
- The GitHub repository showed about 177k stars at capture time, so the carousel uses it as social proof, not as a technical guarantee.
`, "utf8");

  writeFileSync(path.join(PROJECT, "brief.md"), `# Brief

## Viewer

하네스 엔지니어링, AI 코딩 에이전트 세팅, Claude Code/Codex/Cursor 워크플로우에 관심 있는 개발자.

## Angle

Superpowers는 단기 뉴스가 아니라 AI 에이전트가 바로 코딩부터 하지 않게 순서와 검증을 잡아주는 기본 세팅이라, 언제 소개해도 좋은 리소스다.

## Promise

Superpowers가 왜 하네스 엔지니어링 입문 세팅처럼 보이는지 8장 안에 이해한다.
`, "utf8");

  writeFileSync(path.join(PROJECT, "storyboard.md"), cards.map((card, i) => {
    const title = card.title.replaceAll("<br>", " / ");
    return `${i + 1}. ${title}\n   - visual: ${card.image || card.visual}\n   - point: ${card.body || card.sub}\n`;
  }).join("\n"), "utf8");

  writeFileSync(path.join(PROJECT, "caption.md"), `하네스 엔지니어링 해보고 싶은 분들,
이 세팅은 거의 기본값처럼 봐도 좋겠어욤 🫠

GitHub 17만+ 스타가 붙은 리포라
이미 개발자들 사이에서는 꽤 유명한 편이에요.

Superpowers는 단순한 프롬프트 모음이 아니라,
AI 코딩 에이전트가 바로 코드부터 쓰지 않게 만드는
개발 방법론 + 스킬 세팅에 가까워요.

핵심은 이거예요.

① 바로 코딩하지 않고 먼저 질문
② 설계 문서 만들고 승인
③ 구현 계획을 작게 쪼갬
④ 테스트랑 리뷰까지 챙기게 함
⑤ Claude Code, Codex, Cursor, Gemini 등 여러 에이전트에 붙일 수 있음

AI에게 일을 맡기는 시대일수록
중요한 건 “더 똑똑한 모델”만이 아니라
모델이 실수하지 않게 잡아주는 작업 방식이라고 생각해요.

워낙 유명하고, 특정 뉴스에 묶인 주제가 아니라
언제 소개해도 이상하지 않은 스킬이라 공유해둡니다.

써보려면 여기 GitHub 링크 참고해보세욤:
${URLS.repo}

Contents Editor · AI쭌
Source · obra/superpowers

#Superpowers #ClaudeCode #Codex #AI쭌 #AI개발 #코딩AI #하네스엔지니어링`, "utf8");
}

async function main() {
  ensureDirs();
  const puppeteer = await import(pathToFileURL(PUPPETEER_PATH).href);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--allow-file-access-from-files"],
  });
  try {
    await captureSources(browser);
    await renderCards(browser);
    await renderMotion(browser);
  } finally {
    await browser.close();
  }
  writeDocs();
  console.log(`built package: ${PROJECT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
