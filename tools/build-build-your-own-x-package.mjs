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
const PROJECT = path.join(PROJECT_ROOT, "2026-05-03-build-your-own-x");
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
const REEL_W = 1080;
const REEL_H = 1920;
const FPS = 12;
const REEL_SECONDS = 33;

const URLS = {
  repo: "https://github.com/codecrafters-io/build-your-own-x",
  readme: "https://raw.githubusercontent.com/codecrafters-io/build-your-own-x/master/README.md",
  leaderboard: "https://githublb.vercel.app/",
  starHistory: "https://www.star-history.com/codecrafters-io/build-your-own-x",
  banner: "https://raw.githubusercontent.com/codecrafters-io/build-your-own-x/master/codecrafters-banner.png",
};

const cards = [
  {
    kind: "cover",
    image: "github-repo.png",
    tag: "AI NEWS | GITHUB",
    title: "GitHub에서<br>별 제일 많은<br>레포가 뭘까?",
    sub: "정답은 build-your-own-x. 약 50만 스타짜리 개발 공부 보물창고",
    source: "codecrafters-io/build-your-own-x",
  },
  {
    image: "leaderboard.png",
    label: "Star leaderboard",
    chips: ["#1", "498k+", "daily ranking"],
    title: "1위가<br>리액트도 아니고<br>이거였음",
    body: "GitHub Stars Leaderboard 기준<br>build-your-own-x가 전체 1위로 잡혀요.<br>사람들이 저장한 이유가 확실해요.",
  },
  {
    image: "github-repo.png",
    label: "GitHub repo",
    chips: ["499k stars", "47k forks", "Markdown"],
    title: "이름부터<br>너무 직관적이에요",
    body: "Build your own X.<br>말 그대로 내가 쓰는 기술을<br>처음부터 직접 만들어보는 가이드 모음이에요.",
  },
  {
    visual: "categories",
    label: "What can I build?",
    chips: ["OS", "DB", "Docker", "Browser"],
    title: "운영체제부터<br>DB, 브라우저까지<br>직접 만들어봄",
    body: "검색엔진, Git, Docker, Redis,<br>토이 OS, 프로그래밍 언어까지.<br>목록만 봐도 공부 욕구가 올라와요.",
    motion: true,
  },
  {
    visual: "code",
    label: "Learning loop",
    chips: ["읽기", "만들기", "고치기"],
    title: "강의만 보면<br>아는 것 같은데<br>손은 안 움직이죠",
    body: "이 레포의 포인트는 간단해요.<br>읽고 끝내는 게 아니라<br>작게라도 직접 만들어보게 만드는 것.",
  },
  {
    visual: "feynman",
    label: "Feynman mode",
    chips: ["create", "understand", "debug"],
    title: "진짜 이해했는지<br>확인하는 방법은<br>하나예요",
    body: "설명을 들을 때는 쉬워 보이는데<br>직접 만들면 구조, 예외, 성능 문제가<br>한 번에 튀어나와요.",
  },
  {
    visual: "ai-era",
    label: "AI era",
    chips: ["검수력", "설계력", "디버깅"],
    title: "AI가 코드를<br>써주는 시대에도<br>이게 필요한 이유",
    body: "AI가 만들어준 코드가 맞는지<br>판단하려면 결국 구조를 알아야 해요.<br>이 레포는 그 감각을 키우는 쪽이에요.",
  },
  {
    visual: "install",
    label: "AI쭌 노트",
    chips: ["저장각", "입문자", "개발자"],
    title: "개발 공부<br>다시 시작하고 싶으면<br>저장해두세요",
    body: "관심 있는 기술 하나만 골라서<br>주말에 작게 따라 만들어보면 돼요.<br>이건 오래 가는 공부 링크예요.",
  },
];

const reelScenes = [
  { at: 0, dur: 3.5, type: "cover", title: "GitHub에서\n별 제일 많은\n레포가 뭘까?", sub: "정답이 꽤 의외예요" },
  { at: 3.5, dur: 4, type: "leaderboard", title: "1위는\nbuild-your-own-x", sub: "약 50만 스타짜리 개발 공부 보물창고" },
  { at: 7.5, dur: 4.5, type: "repo", title: "이름 그대로\n직접 만들어보는\n가이드 모음", sub: "Build your own X" },
  { at: 12, dur: 5, type: "categories", title: "운영체제부터\nDB, 브라우저까지", sub: "목록만 봐도 공부 욕구 올라옴" },
  { at: 17, dur: 4.5, type: "code", title: "강의만 보면\n아는 것 같죠?", sub: "근데 직접 만들면 바로 달라져요" },
  { at: 21.5, dur: 5, type: "ai-era", title: "AI가 코드 써줘도\n이게 중요한 이유", sub: "구조를 알아야 검수하고 고칠 수 있어요" },
  { at: 26.5, dur: 6.5, type: "outro", title: "개발 공부\n다시 시작하고 싶으면\n저장해두세요", sub: "링크는 캡션에 둘게욤" },
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

async function download(url, filename) {
  const dest = path.join(PROJECT, "assets", "images", filename);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    writeFileSync(dest, buffer);
  } catch (error) {
    writeFallbackImage(filename, url, error.message);
  }
}

function writeFallbackImage(filename, title, reason = "") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="980">
  <rect width="1400" height="980" fill="#080706"/>
  <defs>
    <linearGradient id="g" x1="0" x2="1">
      <stop offset="0" stop-color="#20140d"/>
      <stop offset="1" stop-color="#0e151a"/>
    </linearGradient>
  </defs>
  <rect x="70" y="70" width="1260" height="840" rx="46" fill="url(#g)" stroke="#4c3523"/>
  <text x="130" y="190" fill="#f5ead8" font-family="Arial" font-size="72" font-weight="700">Build Your Own X</text>
  <text x="130" y="292" fill="#ff8f4c" font-family="Arial" font-size="42">GitHub #1 learning repository</text>
  <text x="130" y="382" fill="#d7c6af" font-family="Arial" font-size="34">${esc(title)}</text>
  <text x="130" y="442" fill="#7e766e" font-family="Arial" font-size="24">${esc(reason)}</text>
  <rect x="820" y="210" width="360" height="220" rx="28" fill="#f7e3d4" opacity=".9"/>
  <rect x="690" y="470" width="430" height="260" rx="28" fill="#111318" stroke="#514538"/>
  <rect x="760" y="560" width="310" height="44" rx="22" fill="#ff8f4c"/>
  <rect x="760" y="630" width="220" height="24" rx="12" fill="#f5ead8" opacity=".75"/>
  </svg>`;
  writeFileSync(destPath(filename), svg, "utf8");
}

function destPath(filename) {
  return path.join(PROJECT, "assets", "images", filename);
}

function ensureDirs() {
  rmSync(PROJECT, { recursive: true, force: true });
  for (const dir of [
    "assets/fonts",
    "assets/images",
    "cards",
    "motion/frames",
    "motion/review-frames",
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

async function captureSourceScreens(browser) {
  const targets = [
    [URLS.repo, "github-repo.png", { width: 1440, height: 1080 }],
    [URLS.leaderboard, "leaderboard.png", { width: 1440, height: 1080 }],
    [URLS.starHistory, "star-history.png", { width: 1440, height: 1080 }],
  ];

  for (const [url, filename, viewport] of targets) {
    const page = await browser.newPage();
    await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 50000 });
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await page.screenshot({ path: destPath(filename), fullPage: false });
    } catch (error) {
      writeFallbackImage(filename, url, error.message);
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
.cover-img{position:absolute;inset:-10px 0 auto;width:100%;height:900px;object-fit:cover;object-position:72% center;filter:saturate(1.08) contrast(1.05)}
.cover-dim{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.82),rgba(0,0,0,.34) 54%,rgba(0,0,0,.18)),linear-gradient(180deg,rgba(0,0,0,.08) 0%,rgba(0,0,0,.48) 51%,#000 82%)}
.cover-copy{position:absolute;z-index:10;left:70px;right:70px;bottom:108px}
.pill{display:inline-flex;align-items:center;min-height:58px;padding:13px 22px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.74);background:rgba(0,0,0,.44);font-size:30px;backdrop-filter:blur(8px)}
.cover-title,.cover-sub,.title,.body,.visual-copy{font-family:"Griun Mongtori","Moneygraphy Rounded",system-ui,sans-serif;font-weight:400;letter-spacing:0}
.cover-title{margin:34px 0 0;font-size:98px;line-height:1.04;text-shadow:0 9px 34px rgba(0,0,0,.58)}
.cover-sub{margin:24px 0 0;color:rgba(255,255,255,.9);font-size:39px;line-height:1.24}
.media{position:absolute;left:42px;right:42px;top:136px;height:555px;overflow:hidden;border:4px solid rgba(255,255,255,.9);background:#11151b}
.media:after{content:"";position:absolute;inset:auto 0 0;height:44%;background:linear-gradient(0deg,rgba(0,0,0,.92),transparent);pointer-events:none}
.media-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;filter:saturate(1.06) contrast(1.04);opacity:.9}
.copy{position:absolute;z-index:12;left:70px;right:70px;top:750px}
.num{display:flex;align-items:center;justify-content:center;width:70px;height:70px;margin-bottom:26px;border-radius:50%;background:rgba(255,255,255,.13);font-size:42px;color:rgba(255,255,255,.78);font-weight:900}
.title{margin:0;font-size:78px;line-height:1.08}
.body{margin:34px 0 0;font-size:38px;line-height:1.28;color:rgba(255,255,255,.9)}
.label{position:absolute;z-index:9;left:34px;bottom:36px;display:inline-flex;align-items:center;min-height:52px;padding:12px 19px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.38);background:rgba(0,0,0,.68);font-size:27px;color:#ff9b62}
.chips{position:absolute;z-index:9;right:34px;bottom:34px;display:flex;gap:12px;flex-wrap:wrap;justify-content:flex-end;max-width:760px}
.chips span{display:inline-flex;align-items:center;min-height:50px;padding:12px 16px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.68);font-size:25px;color:#ff9b62}
.visual{position:absolute;inset:0;background:linear-gradient(145deg,#1c130e,#050607);overflow:hidden}
.visual:before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.055) 1px,transparent 1px);background-size:60px 60px;opacity:.62}
.agent-ui{position:absolute;z-index:3;left:68px;right:68px;top:60px;height:395px;border-radius:30px;background:#0d1117;border:1px solid rgba(255,255,255,.18);box-shadow:0 28px 80px rgba(0,0,0,.44);overflow:hidden}
.bar{height:58px;background:#161b22;border-bottom:1px solid #30363d;display:flex;align-items:center;padding:0 22px;gap:9px}.dot{width:15px;height:15px;border-radius:50%;display:inline-block}.red{background:#ff5f56}.yellow{background:#ffbd2e}.green{background:#27c93f}
.agent-body{display:grid;grid-template-columns:1fr 1fr;gap:22px;padding:28px}.agent-card{height:128px;border-radius:22px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);padding:22px}.agent-card b{display:block;color:#ff9b62;font-size:31px}.agent-card span{display:block;margin-top:10px;color:#d7c7b4;font-size:24px}
.question-form{position:absolute;z-index:4;left:78px;right:78px;top:58px;height:410px;border-radius:30px;background:#f6eadf;color:#111;box-shadow:0 28px 80px rgba(0,0,0,.42);padding:34px}.q-title{font-size:42px;font-weight:900}.q-row{margin-top:18px;padding:18px 22px;border:2px solid #decab8;border-radius:22px;font-size:29px}.q-row b{color:#d95b1f}
.systems-grid{position:absolute;z-index:4;left:72px;right:72px;top:70px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px}.system-card{height:142px;border-radius:26px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);padding:20px}.system-card b{display:block;font-size:29px;color:#fff}.swatches{display:flex;gap:8px;margin-top:18px}.swatches i{width:34px;height:34px;border-radius:50%;display:block}
.export-grid{position:absolute;z-index:4;left:78px;right:78px;top:72px;display:grid;grid-template-columns:1fr 1fr;gap:20px}.export-card{height:166px;border-radius:28px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-size:54px;color:#ff9b62}
.install-panel{position:absolute;z-index:4;left:76px;right:76px;top:70px;height:395px;border-radius:28px;background:#0d1117;border:1px solid rgba(255,255,255,.24);box-shadow:0 28px 80px rgba(0,0,0,.45);overflow:hidden}
.install-code{padding:30px 34px;font-family:Consolas,monospace;font-size:27px;line-height:1.55;color:#e6edf3}.comment{color:#8b949e}.cmd{color:#ff9b62;font-weight:900}.ok{color:#7dffb2}
`;
}

function visualHtml(card) {
  const chips = (card.chips || []).map((chip) => `<span>${esc(chip)}</span>`).join("");
  if (card.image) {
    return `<div class="media"><img class="media-img" src="../assets/images/${esc(card.image)}" alt=""><div class="label">${esc(card.label)}</div><div class="chips">${chips}</div></div>`;
  }
  if (card.visual === "categories") {
    return `<div class="media"><div class="visual"><div class="agent-ui"><div class="bar"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div><div class="agent-body"><div class="agent-card"><b>OS</b><span>토이 운영체제 만들기</span></div><div class="agent-card"><b>Database</b><span>작은 DB 엔진 만들기</span></div><div class="agent-card"><b>Docker</b><span>컨테이너 원리 따라가기</span></div><div class="agent-card"><b>Browser</b><span>렌더링 흐름 직접 보기</span></div></div></div><div class="label">${esc(card.label)}</div><div class="chips">${chips}</div></div></div>`;
  }
  if (card.visual === "code") {
    return `<div class="media"><div class="visual"><div class="install-panel"><div class="bar"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div><div class="install-code"><span class="comment"># weekend project</span><br><span class="cmd">pick</span> build-your-own-redis<br><span class="cmd">read</span> tiny step-by-step guide<br><span class="cmd">make</span> parser · storage · commands<br><span class="ok">understand by building</span></div></div><div class="label">${esc(card.label)}</div><div class="chips">${chips}</div></div></div>`;
  }
  if (card.visual === "feynman") {
    const names = ["읽기", "따라 만들기", "막히기", "검색하기", "고치기", "다시 만들기", "성능 보기", "예외 처리", "내 것으로 이해"];
    const html = names.map((name, i) => {
      const palettes = [
        ["#5e6ad2", "#111", "#f7f8fa"],
        ["#635bff", "#00d4ff", "#fff"],
        ["#fff", "#111", "#999"],
        ["#fff", "#000", "#f5f0e8"],
        ["#f24e1e", "#a259ff", "#0acf83"],
        ["#fff", "#000", "#666"],
        ["#8b5cf6", "#111827", "#22c55e"],
        ["#ff5a5f", "#00a699", "#fc642d"],
        ["#3ecf8e", "#1f2937", "#e5e7eb"],
      ][i];
      return `<div class="system-card"><b>${name}</b><div class="swatches">${palettes.map((c) => `<i style="background:${c}"></i>`).join("")}</div></div>`;
    }).join("");
    return `<div class="media"><div class="visual"><div class="systems-grid">${html}</div><div class="label">${esc(card.label)}</div><div class="chips">${chips}</div></div></div>`;
  }
  if (card.visual === "ai-era") {
    const html = ["AI 코드", "구조 이해", "검수", "디버깅"].map((x) => `<div class="export-card">${x}</div>`).join("");
    return `<div class="media"><div class="visual"><div class="export-grid">${html}</div><div class="label">${esc(card.label)}</div><div class="chips">${chips}</div></div></div>`;
  }
  if (card.visual === "install") {
    return `<div class="media"><div class="visual"><div class="install-panel"><div class="bar"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div><div class="install-code"><span class="comment"># save this repo</span><br><span class="cmd">open</span> github.com/codecrafters-io/build-your-own-x<br><span class="cmd">choose</span> Database / Docker / Browser / Git<br><span class="cmd">build</span> one tiny version<br><span class="ok">weekend level-up unlocked</span></div></div><div class="label">${esc(card.label)}</div><div class="chips">${chips}</div></div></div>`;
  }
  return "";
}

function cardHtml(card, index) {
  if (card.kind === "cover") {
    return `<!doctype html><html><head><meta charset="utf-8"><style>${cardCss()}</style></head><body><main class="card"><img class="cover-img" src="../assets/images/${esc(card.image)}" alt=""><div class="cover-dim"></div><div class="brand">AI JJUN</div><section class="cover-copy"><div class="pill">${esc(card.tag)}</div><h1 class="cover-title">${card.title}</h1><p class="cover-sub">${rich(card.sub)}</p></section><div class="source">Source · ${esc(card.source)}</div></main></body></html>`;
  }
  return `<!doctype html><html><head><meta charset="utf-8"><style>${cardCss()}</style></head><body><main class="card"><div class="brand">AI JJUN</div>${visualHtml(card)}<section class="copy"><div class="num">${index}</div><h1 class="title">${rich(card.title)}</h1><p class="body">${rich(card.body)}</p></section><div class="footer">AI NEWS</div></main></body></html>`;
}

function motionCss() {
  return `@font-face{font-family:"Griun Mongtori";src:url("../assets/fonts/Griun_Mongtori-Rg.ttf") format("truetype");font-weight:400}
@font-face{font-family:"Moneygraphy Rounded";src:url("../assets/fonts/Moneygraphy-Rounded.woff2") format("woff2");font-weight:700}
*{box-sizing:border-box}
html,body{margin:0;width:${REEL_W}px;height:${REEL_H}px;background:#000;color:#fff;overflow:hidden;font-family:"Moneygraphy Rounded",system-ui,sans-serif;word-break:keep-all;letter-spacing:0}
.stage{position:relative;width:${REEL_W}px;height:${REEL_H}px;overflow:hidden;background:#000}
.bg{position:absolute;inset:0;background:#000}
.bg-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:72% center;filter:saturate(1.08) contrast(1.05);opacity:.82;transform:scale(1.04)}
.dim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.18),rgba(0,0,0,.22) 45%,rgba(0,0,0,.92))}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.055) 1px,transparent 1px);background-size:70px 70px;opacity:.5}
.brand{position:absolute;top:52px;left:0;right:0;text-align:center;font-size:34px;letter-spacing:8px;font-weight:900;z-index:20}
.copy{position:absolute;left:64px;right:300px;bottom:520px;z-index:20;filter:drop-shadow(0 20px 42px rgba(0,0,0,.62))}
.chip{display:inline-flex;align-items:center;min-height:56px;padding:13px 22px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.58);background:rgba(0,0,0,.58);color:#ff9b62;font-size:28px}
.title{white-space:pre-line;margin:24px 0 0;font-family:"Griun Mongtori","Moneygraphy Rounded",system-ui,sans-serif;font-size:76px;line-height:1.07;font-weight:400;letter-spacing:0}
.sub{margin:22px 0 0;font-family:"Griun Mongtori","Moneygraphy Rounded",system-ui,sans-serif;font-size:35px;line-height:1.26;color:rgba(255,255,255,.9)}
.mock{position:absolute;left:72px;right:300px;top:190px;height:660px;border:3px solid rgba(255,255,255,.22);border-radius:34px;background:rgba(13,17,23,.78);box-shadow:0 35px 100px rgba(0,0,0,.45);overflow:hidden;z-index:8}
.mock-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;opacity:.82}
.mock:after{content:"";position:absolute;inset:auto 0 0;height:48%;background:linear-gradient(0deg,rgba(0,0,0,.9),transparent)}
.flow{position:absolute;left:120px;right:340px;top:260px;display:grid;gap:26px;z-index:9}
.flow-row{display:flex;align-items:center;gap:20px;padding:24px 28px;border-radius:28px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);font-size:35px}
.flow-row b{color:#ff9b62}
.systems{position:absolute;left:88px;right:330px;top:250px;display:grid;grid-template-columns:1fr 1fr;gap:20px;z-index:9}
.system{height:142px;border-radius:26px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);padding:24px;font-size:32px}
.export{position:absolute;left:88px;right:330px;top:300px;display:grid;grid-template-columns:1fr 1fr;gap:20px;z-index:9}
.export div{height:150px;border-radius:28px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-size:52px;color:#ff9b62}
.progress{position:absolute;left:64px;right:300px;bottom:472px;height:8px;border-radius:999px;background:rgba(255,255,255,.17);overflow:hidden;z-index:30}
.bar{height:100%;width:0;background:linear-gradient(90deg,#ff9b62,#f7e1c4)}
.safe-note{position:absolute;left:64px;bottom:80px;font-size:24px;color:rgba(255,255,255,.42);z-index:30}
`;
}

function motionHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${motionCss()}</style></head><body><main class="stage"><div id="bg" class="bg"></div><div class="grid"></div><div class="dim"></div><div class="brand">AI JJUN</div><div id="mock" class="mock"></div><div id="extra"></div><section class="copy"><div id="chip" class="chip">AI NEWS | GITHUB</div><h1 id="title" class="title"></h1><p id="sub" class="sub"></p></section><div class="progress"><div id="bar" class="bar"></div></div><div class="safe-note">Source · codecrafters-io/build-your-own-x</div></main><script>
const scenes=${JSON.stringify(reelScenes)};
const total=${REEL_SECONDS};
const bg=document.getElementById("bg");
const mock=document.getElementById("mock");
const extra=document.getElementById("extra");
const title=document.getElementById("title");
const sub=document.getElementById("sub");
const bar=document.getElementById("bar");
function currentScene(t){return scenes.find((s)=>t>=s.at&&t<s.at+s.dur)||scenes.at(-1)}
function visual(scene){
  mock.style.display="block"; extra.innerHTML="";
  if(scene.type==="cover"){bg.innerHTML='<img class="bg-img" src="../assets/images/github-repo.png">';mock.style.display="none"}
  else if(scene.type==="leaderboard"){bg.innerHTML='<img class="bg-img" src="../assets/images/leaderboard.png">';mock.innerHTML='<img class="mock-img" src="../assets/images/leaderboard.png">'}
  else if(scene.type==="repo"){bg.innerHTML='<img class="bg-img" src="../assets/images/github-repo.png">';mock.innerHTML='<img class="mock-img" src="../assets/images/github-repo.png">'}
  else if(scene.type==="categories"){bg.innerHTML='';mock.style.display="none";extra.innerHTML='<div class="systems"><div class="system">Operating System</div><div class="system">Database</div><div class="system">Docker</div><div class="system">Browser</div><div class="system">Git</div><div class="system">Search Engine</div></div>'}
  else if(scene.type==="code"){bg.innerHTML='';mock.style.display="none";extra.innerHTML='<div class="flow"><div class="flow-row"><b>1</b> 관심 기술 하나 고르기</div><div class="flow-row"><b>2</b> 작은 버전 직접 만들기</div><div class="flow-row"><b>3</b> 막히면서 구조 이해하기</div></div>'}
  else if(scene.type==="ai-era"){bg.innerHTML='';mock.style.display="none";extra.innerHTML='<div class="export"><div>AI 코드</div><div>구조 이해</div><div>검수</div><div>디버깅</div></div>'}
  else {bg.innerHTML='<img class="bg-img" src="../assets/images/star-history.png">';mock.style.display="none"}
}
let last="";
window.renderAt=(t)=>{
  const scene=currentScene(t); const key=scene.type+scene.title;
  if(key!==last){visual(scene);last=key}
  title.textContent=scene.title; sub.textContent=scene.sub;
  const local=Math.max(0,Math.min(1,(t-scene.at)/scene.dur));
  const ease=1-Math.pow(1-local,3);
  document.querySelector(".copy").style.transform='translateY('+(24-24*ease)+'px)';
  document.querySelector(".copy").style.opacity=String(.35+.65*ease);
  const scale=1.03+0.04*local;
  const img=document.querySelector(".bg-img"); if(img) img.style.transform='scale('+scale+')';
  bar.style.width=((t/total)*100).toFixed(2)+'%';
}
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
  const htmlPath = path.join(PROJECT, "motion", "build-your-own-x-reel.html");
  writeFileSync(htmlPath, motionHtml(), "utf8");
  const page = await browser.newPage();
  await page.setViewport({ width: REEL_W, height: REEL_H, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
  const frameDir = path.join(PROJECT, "motion", "frames");
  const totalFrames = Math.round(REEL_SECONDS * FPS);
  for (let frame = 0; frame < totalFrames; frame += 1) {
    const t = frame / FPS;
    await page.evaluate((value) => window.renderAt(value), t);
    await page.screenshot({
      path: path.join(frameDir, `frame-${String(frame).padStart(5, "0")}.png`),
      fullPage: false,
    });
  }
  await page.close();

  const out = path.join(PROJECT, "output", "build-your-own-x-reel.mp4");
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
    out,
  ], { stdio: "ignore" });
}

async function renderReviewFrames() {
  const reviewDir = path.join(PROJECT, "motion", "review-frames");
  for (const t of [2, 6, 11, 16, 21, 26, 31]) {
    execFileSync(FFMPEG, [
      "-y",
      "-ss",
      String(t),
      "-i",
      path.join(PROJECT, "output", "build-your-own-x-reel.mp4"),
      "-frames:v",
      "1",
      "-q:v",
      "2",
      path.join(reviewDir, `review-${String(t).padStart(2, "0")}.jpg`),
    ], { stdio: "ignore" });
  }
}

function writeDocs() {
  writeFileSync(path.join(PROJECT, "source.md"), `# Source

- GitHub: ${URLS.repo}
- README: ${URLS.readme}
- GitHub Stars Leaderboard: ${URLS.leaderboard}
- Star history: ${URLS.starHistory}

## Verified points

- The GitHub page showed about 499k stars at capture time.
- GitHub Stars Leaderboard surfaced codecrafters-io/build-your-own-x as the top starred repository in the captured ranking view.
- The README describes the repository as a collection of step-by-step guides for recreating technologies from scratch.
- The repository links guides for topics such as operating systems, databases, Docker, Git, browsers, search engines, programming languages, and AI/ML-related systems.
`, "utf8");

  writeFileSync(path.join(PROJECT, "brief.md"), `# Brief

## Viewer

개발 공부를 다시 제대로 해보고 싶은 사람, AI 코딩 시대에 구조 이해가 필요하다고 느끼는 개발자/입문자.

## Angle

"GitHub에서 스타 제일 많은 레포가 뭘까?"라는 궁금증에서 출발해, 정답이 왜 개발자들의 공부법으로 이어지는지 보여준다.

## Promise

build-your-own-x가 왜 그렇게 많이 저장됐는지, 그리고 AI 시대에도 왜 직접 만들어보는 공부가 중요한지 30초 안에 이해한다.
`, "utf8");

  writeFileSync(path.join(PROJECT, "storyboard.md"), cards.map((card, i) => {
    const title = card.title.replaceAll("<br>", " / ");
    return `${i + 1}. ${title}\n   - visual: ${card.image || card.visual}\n   - point: ${card.body || card.sub}\n`;
  }).join("\n"), "utf8");

  writeFileSync(path.join(PROJECT, "motion-plan.md"), `# Motion Plan

- Format: 1080x1920, 33 seconds, no audio.
- Safe zone: text avoids Instagram right action rail and bottom profile/caption area.
- Motion style: editorial dark tech layout, large Griun Mongtori Korean copy, source screenshots, simple UI motion panels.
`, "utf8");

  writeFileSync(path.join(PROJECT, "caption.md"), `GitHub에서 스타 제일 많은 레포가 뭘까?
궁금해서 찾아봤는데 답이 꽤 맛있었어욤 🫠

정답은 codecrafters-io/build-your-own-x.
캡처 시점 기준 GitHub에서 약 49.9만 스타가 붙어 있고,
GitHub Stars Leaderboard에서도 1위로 잡히는 레포예요.

이 레포는 이름 그대로
"내가 직접 X를 만들어보는" 가이드 모음이에요.

핵심은 이거예요.

① 운영체제, DB, Docker, Git, 브라우저 같은 걸 직접 만들어보는 가이드
② 단순 링크 모음이 아니라 "따라 만들며 이해하는" 공부 방식
③ 개발자가 왜 구조를 알아야 하는지 몸으로 느끼게 해줌
④ AI가 코드를 써주는 시대에도 검수력과 디버깅 감각을 키워줌
⑤ 오래 두고 볼 만한 개발 공부 북마크

강의만 보면 아는 것 같은데
막상 직접 만들면 바로 막히는 순간 있잖아요.
그 막히는 순간이 진짜 공부가 되는 지점이라고 생각해요.

써보려면 여기 GitHub 링크 참고해보세욤:
${URLS.repo}

Contents Editor · AI쭌
Source · codecrafters-io/build-your-own-x / GitHub Stars Leaderboard

#BuildYourOwnX #GitHub #개발공부 #코딩공부 #오픈소스 #AI개발 #AI쭌`, "utf8");
}

async function main() {
  ensureDirs();
  await download(URLS.banner, "banner.png");
  const puppeteer = await import(pathToFileURL(PUPPETEER_PATH).href);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--allow-file-access-from-files"],
  });
  try {
    await captureSourceScreens(browser);
    await renderCards(browser);
    await renderMotion(browser);
    await renderReviewFrames();
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
