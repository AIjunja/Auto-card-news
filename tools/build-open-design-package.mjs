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
const PROJECT = path.join(PROJECT_ROOT, "2026-05-03-open-design");
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
  repo: "https://github.com/nexu-io/open-design",
  readme: "https://raw.githubusercontent.com/nexu-io/open-design/main/README.md",
  readmeKo: "https://raw.githubusercontent.com/nexu-io/open-design/main/README.ko.md",
  website: "https://opendesign.lol/",
  banner: "https://github.com/nexu-io/open-design/raw/main/docs/assets/banner.png",
};

const cards = [
  {
    kind: "cover",
    image: "banner.png",
    tag: "AI NEWS | DESIGN",
    title: "Claude Design,<br>돈 주고 쓰기 전에<br>내 AI에 붙여서<br>무료로 써보세요",
    sub: "거의 복제판 느낌으로 만든 로컬 오픈소스 디자인툴",
    source: "nexu-io/open-design",
  },
  {
    image: "github-repo.png",
    label: "GitHub repo",
    chips: ["open-source", "local-first", "BYOK"],
    title: "거의 Claude Design<br>복제판 느낌인데<br>오픈소스",
    body: "Open Design은 Claude Design에서 보던<br>AI 디자인 작업 흐름을 로컬에서<br>비슷하게 실험하게 해주는 프로젝트예요.",
  },
  {
    image: "website.png",
    label: "Official site",
    chips: ["웹", "앱", "포스터", "슬라이드"],
    title: "그냥 그림 뽑는<br>툴이 아니에요",
    body: "웹사이트, 앱 화면, 포스터,<br>문서, 대시보드, 다이어그램까지<br>작업물 형태로 뽑는 쪽에 가까워요.",
  },
  {
    visual: "agent",
    label: "Agent engine",
    chips: ["Codex", "Claude Code", "Cursor", "Gemini"],
    title: "핵심은<br>내 AI에 붙여서<br>쓴다는 것",
    body: "새 앱 안에 갇히는 구조가 아니라<br>Codex, Claude Code, Cursor 같은<br>내 에이전트를 디자인 엔진으로 써요.",
    motion: true,
  },
  {
    visual: "question",
    label: "덜 삽질하는 이유",
    chips: ["목적", "톤", "브랜드", "제약"],
    title: "바로 만들기 전에<br>먼저 물어봐요",
    body: "무작정 예쁘게 만드는 게 아니라<br>처음에 방향을 잠그고 시작해서<br>AI스러운 헛발질을 줄이는 방식이에요.",
  },
  {
    visual: "systems",
    label: "Skills + Systems",
    chips: ["31 skills", "72 systems", "5 directions"],
    title: "스킬이랑<br>디자인 시스템이<br>같이 들어있음",
    body: "웹, 모바일, 대시보드, 포스터처럼<br>작업 종류별 스킬을 고르고<br>브랜드 느낌은 디자인 시스템으로 맞춰요.",
  },
  {
    visual: "export",
    label: "Output",
    chips: ["HTML", "PDF", "PPTX", "ZIP", "Markdown"],
    title: "결과물도<br>파일로 남겨요",
    body: "미리보기에서 끝나는 게 아니라<br>HTML, PDF, PPTX, ZIP 같은 파일로<br>내보내는 흐름까지 잡혀 있어요.",
  },
  {
    visual: "install",
    label: "AI쭌 노트",
    chips: ["Node 24", "pnpm", "tools-dev"],
    title: "써보고 싶으면<br>이 순서로 보면 돼요",
    body: "GitHub에서 클론하고<br>Node 24 + pnpm 환경에서 실행.<br>디자인 자동화 관심 있으면 저장각이에요.",
  },
];

const reelScenes = [
  { at: 0, dur: 4, type: "cover", title: "Claude Design\n돈 주고 쓰기 전에\n이거 보세요", sub: "Open Design", image: "banner.png" },
  { at: 4, dur: 4.5, type: "repo", title: "거의 복제판 느낌인데\n오픈소스", sub: "로컬에서 비슷하게 실험 가능", image: "github-repo.png" },
  { at: 8.5, dur: 5, type: "agent", title: "내 AI에 붙여서\n디자인 엔진처럼 씀", sub: "Codex · Claude Code · Cursor 연결" },
  { at: 13.5, dur: 5, type: "question", title: "바로 만들기 전에\n먼저 물어봐요", sub: "목적·톤·브랜드·제약부터 잠금" },
  { at: 18.5, dur: 5, type: "systems", title: "31개 스킬과\n72개 디자인 시스템", sub: "AI 프리스타일을 줄이는 장치" },
  { at: 23.5, dur: 5, type: "export", title: "미리보기에서 끝?\n아니고 파일로 저장", sub: "HTML · PDF · PPTX · ZIP · Markdown" },
  { at: 28.5, dur: 4.5, type: "outro", title: "디자인 때문에\n막히던 분들,\n저장해두세요", sub: "링크는 캡션에 둘게욤" },
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
  <text x="130" y="190" fill="#f5ead8" font-family="Arial" font-size="72" font-weight="700">Open Design</text>
  <text x="130" y="292" fill="#ff8f4c" font-family="Arial" font-size="42">local-first AI design workspace</text>
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
    [URLS.website, "website.png", { width: 1440, height: 1080 }],
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
  if (card.visual === "agent") {
    return `<div class="media"><div class="visual"><div class="agent-ui"><div class="bar"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div><div class="agent-body"><div class="agent-card"><b>Codex</b><span>내 작업 폴더에서 디자인 생성</span></div><div class="agent-card"><b>Claude Code</b><span>스킬 읽고 시안 제작</span></div><div class="agent-card"><b>Cursor</b><span>코드 기반 수정</span></div><div class="agent-card"><b>Gemini CLI</b><span>다른 엔진으로 교체</span></div></div></div><div class="label">${esc(card.label)}</div><div class="chips">${chips}</div></div></div>`;
  }
  if (card.visual === "question") {
    return `<div class="media"><div class="visual"><div class="question-form"><div class="q-title">처음부터 코드 작성 ❌<br>먼저 방향 잠그기 ✅</div><div class="q-row"><b>Surface</b> · 웹 / 앱 / 슬라이드 / 포스터</div><div class="q-row"><b>Tone</b> · 미니멀 / 에디토리얼 / 테크</div><div class="q-row"><b>Brand</b> · 참고 브랜드와 금지 스타일</div></div><div class="label">${esc(card.label)}</div><div class="chips">${chips}</div></div></div>`;
  }
  if (card.visual === "systems") {
    const names = ["Linear", "Stripe", "Apple", "Notion", "Figma", "Vercel", "Cursor", "Airbnb", "Supabase"];
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
  if (card.visual === "export") {
    const html = ["HTML", "PDF", "PPTX", "ZIP"].map((x) => `<div class="export-card">${x}</div>`).join("");
    return `<div class="media"><div class="visual"><div class="export-grid">${html}</div><div class="label">${esc(card.label)}</div><div class="chips">${chips}</div></div></div>`;
  }
  if (card.visual === "install") {
    return `<div class="media"><div class="visual"><div class="install-panel"><div class="bar"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div><div class="install-code"><span class="comment"># quickstart</span><br><span class="cmd">git clone</span> https://github.com/nexu-io/open-design<br><span class="cmd">cd</span> open-design<br><span class="cmd">corepack enable</span><br><span class="cmd">pnpm install</span><br><span class="ok">pnpm tools-dev run web</span></div></div><div class="label">${esc(card.label)}</div><div class="chips">${chips}</div></div></div>`;
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
  return `<!doctype html><html><head><meta charset="utf-8"><style>${motionCss()}</style></head><body><main class="stage"><div id="bg" class="bg"></div><div class="grid"></div><div class="dim"></div><div class="brand">AI JJUN</div><div id="mock" class="mock"></div><div id="extra"></div><section class="copy"><div id="chip" class="chip">AI NEWS | DESIGN</div><h1 id="title" class="title"></h1><p id="sub" class="sub"></p></section><div class="progress"><div id="bar" class="bar"></div></div><div class="safe-note">Source · nexu-io/open-design</div></main><script>
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
  if(scene.type==="cover"){bg.innerHTML='<img class="bg-img" src="../assets/images/banner.png">';mock.style.display="none"}
  else if(scene.type==="repo"){bg.innerHTML='<img class="bg-img" src="../assets/images/github-repo.png">';mock.innerHTML='<img class="mock-img" src="../assets/images/github-repo.png">'}
  else if(scene.type==="agent"){bg.innerHTML='';mock.style.display="none";extra.innerHTML='<div class="flow"><div class="flow-row"><b>1</b> CLI 자동 감지</div><div class="flow-row"><b>2</b> 스킬 읽고 방향 잡기</div><div class="flow-row"><b>3</b> 실제 파일로 제작</div></div>'}
  else if(scene.type==="question"){bg.innerHTML='';mock.style.display="none";extra.innerHTML='<div class="flow"><div class="flow-row"><b>질문</b> 무엇을 만들까요?</div><div class="flow-row"><b>톤</b> 어떤 느낌이어야 하나요?</div><div class="flow-row"><b>제약</b> 피해야 할 건 뭔가요?</div></div>'}
  else if(scene.type==="systems"){bg.innerHTML='';mock.style.display="none";extra.innerHTML='<div class="systems"><div class="system">웹 프로토타입</div><div class="system">모바일 앱</div><div class="system">대시보드</div><div class="system">포스터</div><div class="system">슬라이드</div><div class="system">디자인 시스템</div></div>'}
  else if(scene.type==="export"){bg.innerHTML='';mock.style.display="none";extra.innerHTML='<div class="export"><div>HTML</div><div>PDF</div><div>PPTX</div><div>ZIP</div></div>'}
  else {bg.innerHTML='<img class="bg-img" src="../assets/images/website.png">';mock.style.display="none"}
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
  const htmlPath = path.join(PROJECT, "motion", "open-design-reel.html");
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

  const out = path.join(PROJECT, "output", "open-design-reel.mp4");
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
      path.join(PROJECT, "output", "open-design-reel.mp4"),
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
- Official/guide site: ${URLS.website}
- README: ${URLS.readme}
- Korean README: ${URLS.readmeKo}

## Verified points

- Open Design positions itself as a local-first, open-source alternative to Claude Design.
- It connects coding-agent CLIs such as Claude Code, Codex, Cursor, Gemini CLI, OpenCode, Qwen, GitHub Copilot CLI, and others as the design engine.
- It highlights 31 skills, 72 design systems, local workflow, BYOK routing, sandbox previews, and export formats.
`, "utf8");

  writeFileSync(path.join(PROJECT, "brief.md"), `# Brief

## Viewer

AI 디자인 자동화, Codex/Claude Code, 디자인 시스템, 오픈소스 툴에 관심 있는 개발자/크리에이터.

## Angle

"Claude Design 좋아 보였는데 유료/닫힌 흐름이 아쉬웠던 사람들, 이제 로컬 오픈소스로 거의 비슷한 흐름을 실험할 수 있다."

## Promise

Open Design이 무엇인지, 왜 뜨는지, 어디까지 만들 수 있는지 30초 안에 이해한다.
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

  writeFileSync(path.join(PROJECT, "caption.md"), `Claude Design 돈 주고 쓰기 전에, 이거 먼저 봐도 좋겠어욤 🫠

Open Design은 Claude Design 느낌의 AI 디자인 작업 흐름을
거의 오픈소스로 옮겨온 것 같은 프로젝트예요.

Codex, Claude Code, Cursor 같은 내 AI 에이전트를
디자인 엔진처럼 붙여서 웹, 앱, 포스터, 슬라이드, 문서까지 만들게 해주는 구조예요.

핵심은 이거예요.

① Open Design 자체는 오픈소스
② 내 PC에서 로컬로 돌리는 구조
③ Codex / Claude Code / Cursor 같은 에이전트 연결
④ 31개 스킬 + 72개 디자인 시스템
⑤ HTML / PDF / PPTX / ZIP / Markdown 내보내기

단, 연결하는 AI 모델이나 API 비용은
각자 쓰는 서비스 기준으로 별도일 수 있어요.

디자인 때문에 막히는 개발자나
AI로 카드뉴스/랜딩/프로토타입 뽑고 싶은 분들은 저장해두면 좋겠어욤.

써보려면 여기 GitHub 링크 참고해보세욤:
${URLS.repo}

공식/가이드 페이지:
${URLS.website}

Contents Editor · AI쭌
Source · nexu-io/open-design

#OpenDesign #Codex #ClaudeCode #AI툴 #오픈소스 #디자인자동화 #AI쭌`, "utf8");
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
