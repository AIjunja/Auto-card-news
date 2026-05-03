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
const PROJECT = path.join(PROJECT_ROOT, "2026-05-02-codex-pets");
const FONT_SOURCE = path.join(PROJECT_ROOT, "2026-04-30-openai-gpt55-prompt-guidance", "assets", "fonts");
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
const MOTION_SECONDS = 4.5;
const SOURCE_URL = "https://developers.openai.com/codex/app/settings#codex-pets";

const cards = [
  {
    kind: "cover",
    tag: "AI NEWS | CODEX",
    title: "Codex에도<br>펫이 생겼대요",
    sub: "`/pet` 치면 작은 친구가 깨어나요.",
    label: "공식 문서 기준",
    visual: "cover-pet",
  },
  {
    visual: "tweet",
    label: "원문 포인트",
    chips: ["OpenAI Devs", "/pet", "Codex app"],
    title: "애완동물.<br>이제 Codex에서<br>쓸 수 있어요",
    body: "OpenAI Developers가 공개한 새 기능이에요.<br>Codex 안에서 작은 펫 오버레이를 켤 수 있습니다.",
  },
  {
    visual: "docs",
    label: "설정 위치",
    chips: ["Settings", "Appearance", "Pets"],
    title: "켜는 곳은<br>여기예요",
    body: "Codex 앱에서 Settings로 들어간 뒤<br>Appearance → Pets에서 고르면 돼요.",
  },
  {
    visual: "commands",
    label: "빠른 실행",
    chips: ["/pet", "Cmd/Ctrl+K", "Wake Pet"],
    title: "제일 쉬운 건<br>`/pet` 한 번",
    body: "입력창에 `/pet`을 치거나<br>명령 팔레트에서 Wake Pet을 실행하면<br>떠다니는 펫이 켜져요.",
    motion: true,
  },
  {
    visual: "states",
    label: "얘가 하는 일",
    chips: ["running", "waiting", "review"],
    title: "귀여운 장식만은<br>아니에요",
    body: "펫은 지금 Codex가 실행 중인지,<br>입력을 기다리는지, 리뷰할 준비가 됐는지<br>작게 알려줘요.",
  },
  {
    visual: "custom",
    label: "커스텀 펫",
    chips: ["hatch-pet", "reload skills", "custom"],
    title: "내 프로젝트 느낌으로<br>펫도 만들 수 있음",
    body: "`hatch-pet` 스킬을 설치하고<br>스킬을 다시 불러온 뒤,<br>원하는 스타일의 펫을 요청하면 됩니다.",
  },
  {
    visual: "checklist",
    label: "따라하기",
    chips: ["1분 컷", "저장 추천", "귀여움"],
    title: "해보고 싶으면<br>이 순서대로",
    body: "Settings → Appearance → Pets<br>또는 `/pet` 입력.<br>커스텀은 `$skill-installer hatch-pet`부터!",
  },
];

function ensureDirs() {
  for (const dir of [path.join(PROJECT, "cards"), path.join(PROJECT, "motion"), path.join(PROJECT, "output")]) {
    rmSync(dir, { recursive: true, force: true });
  }
  for (const dir of [
    path.join(PROJECT, "assets", "fonts"),
    path.join(PROJECT, "assets", "images"),
    path.join(PROJECT, "cards"),
    path.join(PROJECT, "motion", "card-04-pet"),
    path.join(PROJECT, "output"),
  ]) {
    mkdirSync(dir, { recursive: true });
  }
  for (const name of ["Griun_Mongtori-Rg.ttf", "Moneygraphy-Rounded.woff2"]) {
    const src = path.join(FONT_SOURCE, name);
    if (existsSync(src)) copyFileSync(src, path.join(PROJECT, "assets", "fonts", name));
  }
}

function rich(value) {
  return String(value).replace(/`([^`]+)`/g, '<span class="code-word">$1</span>');
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function css() {
  return `@font-face{font-family:"Griun Mongtori";src:url("../assets/fonts/Griun_Mongtori-Rg.ttf") format("truetype");font-weight:400}
@font-face{font-family:"Moneygraphy Rounded";src:url("../assets/fonts/Moneygraphy-Rounded.woff2") format("woff2");font-weight:700}
*{box-sizing:border-box}
html,body{width:${CARD_W}px;height:${CARD_H}px;margin:0;overflow:hidden;background:#050608;color:#fff;font-family:"Moneygraphy Rounded",system-ui,sans-serif;word-break:keep-all;letter-spacing:0}
.card{position:relative;width:${CARD_W}px;height:${CARD_H}px;overflow:hidden;background:#050608}
.brand{position:absolute;z-index:40;top:54px;left:0;right:0;text-align:center;font-size:34px;letter-spacing:8px;font-weight:900;color:#fff}
.footer{position:absolute;z-index:40;right:68px;bottom:48px;font-size:28px;letter-spacing:6px;font-weight:900;color:#fff}
.source{position:absolute;z-index:40;left:68px;bottom:48px;color:rgba(255,255,255,.62);font-size:22px}
.code-word{display:inline-block;padding:.05em .28em .02em;border-radius:.25em;background:rgba(101,255,220,.16);color:#65ffdc;font-family:Consolas,monospace;font-weight:900}
.cover-bg{position:absolute;inset:0;background:radial-gradient(circle at 48% 34%,rgba(83,120,255,.46),transparent 24%),radial-gradient(circle at 80% 10%,rgba(101,255,220,.22),transparent 25%),linear-gradient(180deg,#0b111b 0%,#050608 80%)}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.055) 1px,transparent 1px);background-size:58px 58px;opacity:.55;mask-image:linear-gradient(180deg,#000,transparent 86%)}
.cover-copy{position:absolute;z-index:20;left:68px;right:68px;bottom:96px}
.pill{display:inline-flex;align-items:center;min-height:58px;padding:13px 22px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.72);background:rgba(0,0,0,.42);font-size:30px;backdrop-filter:blur(8px)}
.cover-title,.title,.body{font-family:"Griun Mongtori","Moneygraphy Rounded",system-ui,sans-serif;font-weight:400;letter-spacing:0}
.cover-title{margin:34px 0 0;font-size:96px;line-height:1.04;text-shadow:0 10px 36px rgba(0,0,0,.64)}
.cover-sub{margin:28px 0 0;color:rgba(255,255,255,.92);font-family:"Griun Mongtori","Moneygraphy Rounded",system-ui,sans-serif;font-size:40px;line-height:1.24}
.media{position:absolute;left:42px;right:42px;top:136px;height:555px;overflow:hidden;border:4px solid rgba(255,255,255,.9);background:#101318}
.media:after{content:"";position:absolute;inset:auto 0 0;height:43%;background:linear-gradient(0deg,rgba(0,0,0,.92),transparent);pointer-events:none}
.copy{position:absolute;z-index:15;left:70px;right:70px;top:750px}
.num{display:flex;align-items:center;justify-content:center;width:70px;height:70px;margin-bottom:26px;border-radius:50%;background:rgba(255,255,255,.14);font-size:42px;color:rgba(255,255,255,.78);font-weight:900}
.title{margin:0;font-size:78px;line-height:1.08}
.body{margin:34px 0 0;font-size:38px;line-height:1.28;color:rgba(255,255,255,.9)}
.label{position:absolute;z-index:12;left:34px;bottom:36px;display:inline-flex;align-items:center;min-height:52px;padding:12px 19px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.38);background:rgba(0,0,0,.66);font-size:27px;color:#65ffdc}
.chips{position:absolute;z-index:12;right:34px;bottom:34px;display:flex;gap:12px;flex-wrap:wrap;justify-content:flex-end;max-width:760px}
.chips span{display:inline-flex;align-items:center;min-height:50px;padding:12px 16px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.66);font-size:25px;color:#65ffdc}
.pet{position:absolute;z-index:8;left:50%;top:50%;width:190px;height:230px;transform:translate(-50%,-50%);filter:drop-shadow(0 28px 50px rgba(63,106,255,.45))}
.pet .head{position:absolute;left:10px;right:10px;top:12px;height:138px;border-radius:46px 46px 40px 40px;background:linear-gradient(180deg,#73a2ff,#3953db)}
.pet .fluff{position:absolute;background:#79a8ff;border-radius:999px}.pet .f1{width:62px;height:62px;left:18px;top:0}.pet .f2{width:76px;height:76px;left:58px;top:-12px}.pet .f3{width:62px;height:62px;right:18px;top:0}
.pet .face{position:absolute;left:35px;right:35px;top:46px;height:72px;border-radius:20px;background:#202637}
.pet .eye{position:absolute;top:26px;width:15px;height:9px;border-radius:0 0 10px 10px;border-bottom:4px solid #bce7ff}.pet .e1{left:28px}.pet .e2{right:28px}
.pet .body{position:absolute;left:54px;right:54px;top:140px;height:58px;border-radius:18px;background:linear-gradient(180deg,#567cff,#2d43c7)}
.pet .body:after{content:">_";position:absolute;inset:10px 0 0;text-align:center;font-family:Consolas,monospace;font-size:27px;color:white}
.pet .leg{position:absolute;bottom:0;width:35px;height:48px;border-radius:18px;background:#4165e6}.pet .l1{left:54px}.pet .l2{right:54px}
.pet .arm{position:absolute;top:152px;width:32px;height:60px;border-radius:18px;background:#4165e6}.pet .a1{left:22px;transform:rotate(14deg)}.pet .a2{right:22px;transform:rotate(-14deg)}
.media-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;filter:saturate(1.08) contrast(1.04);opacity:.88}
.visual{position:absolute;inset:0;background:linear-gradient(145deg,#151a20,#050607);overflow:hidden}
.visual:before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px);background-size:60px 60px;opacity:.58}
.tweet-card{position:absolute;z-index:5;left:72px;right:72px;top:36px;border-radius:32px;background:#0d0f13;border:1px solid rgba(255,255,255,.2);padding:28px;box-shadow:0 26px 70px rgba(0,0,0,.45)}
.tweet-top{display:flex;align-items:center;gap:18px}.openai-dot{width:58px;height:58px;border-radius:50%;background:#fff;display:grid;place-items:center;color:#050608;font-size:34px;font-weight:900}
.tweet-name{font-size:30px;font-weight:900}.tweet-handle{font-size:24px;color:#8992a0;margin-top:2px}
.tweet-text{margin-top:18px;font-family:"Griun Mongtori";font-size:33px;line-height:1.24;color:#fff}
.video-window{position:relative;margin:12px auto 0;width:390px;height:118px;border-radius:24px;background:#191b20;border:1px solid rgba(255,255,255,.12);display:grid;place-items:center}
.video-window .pet{left:50%;top:50%;transform:translate(-50%,-50%) scale(.4)}
.command-pet{left:77%;top:58%;width:150px;height:182px}
.docs-window,.cmd-window,.status-panel,.custom-panel,.check-panel{position:absolute;z-index:5;left:76px;right:76px;top:58px;height:420px;border-radius:30px;background:#0f131a;border:1px solid rgba(255,255,255,.2);box-shadow:0 24px 70px rgba(0,0,0,.45);overflow:hidden}
.window-bar{height:62px;background:#171c25;border-bottom:1px solid rgba(255,255,255,.12);display:flex;align-items:center;padding:0 22px;gap:9px}.dot{width:15px;height:15px;border-radius:50%;display:inline-block}.red{background:#ff5f56}.yellow{background:#ffbd2e}.green{background:#27c93f}
.docs-body{padding:30px}.setting-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;padding:20px 22px;border-radius:20px;background:rgba(255,255,255,.07);font-size:29px}.setting-row strong{color:#65ffdc}
.cmd-body{padding:34px;font-family:Consolas,monospace;font-size:38px;line-height:1.5}.prompt{color:#8b949e}.cmd{color:#65ffdc;text-shadow:0 0 18px rgba(101,255,220,.35)}
.status-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;padding:72px 28px 0}.status{height:244px;border-radius:24px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.status b{font-size:28px;color:#65ffdc}.status span{margin-top:12px;font-size:24px;color:#d9e1ec}.mini-pet{position:relative;width:78px;height:92px;margin-bottom:18px;filter:drop-shadow(0 14px 26px rgba(63,106,255,.38))}.mini-pet:before{content:"";position:absolute;left:8px;right:8px;top:8px;height:58px;border-radius:22px;background:linear-gradient(180deg,#73a2ff,#3953db)}.mini-pet:after{content:">_";position:absolute;left:19px;right:19px;top:27px;height:24px;border-radius:8px;background:#202637;color:#c8efff;font-family:Consolas,monospace;font-size:16px;line-height:24px;text-align:center}.mini-pet span{position:absolute;left:25px;right:25px;bottom:0;height:30px;border-radius:10px;background:#4165e6;margin:0}
.custom-panel{padding:98px 42px 0}.code-line{font-family:Consolas,monospace;font-size:31px;line-height:1.6}.code-line .mint{color:#65ffdc}.hint{margin-top:28px;font-family:"Griun Mongtori";font-size:34px;line-height:1.28}
.check-panel{padding:78px 52px}.check-item{display:flex;align-items:center;gap:20px;margin-bottom:22px;font-family:"Griun Mongtori";font-size:38px}.box{width:44px;height:44px;border-radius:10px;background:#65ffdc;color:#050608;display:grid;place-items:center;font-family:Arial;font-weight:900}
`;
}

async function captureDocs(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1380, height: 1000, deviceScaleFactor: 1 });
  try {
    await page.goto(SOURCE_URL, { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise((resolve) => setTimeout(resolve, 1400));
    await page.screenshot({
      path: path.join(PROJECT, "assets", "images", "codex-settings-pets.png"),
      fullPage: false,
    });
  } catch (error) {
    await page.setContent(`<!doctype html><html><body style="margin:0;width:1380px;height:1000px;background:#080b10;color:white;font-family:Arial,sans-serif;overflow:hidden"><div style="position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px);background-size:68px 68px;opacity:.45"></div><section style="position:absolute;left:90px;top:96px;width:780px"><div style="font-size:42px;color:#65ffdc;margin-bottom:28px">OpenAI Developers</div><h1 style="font-size:96px;line-height:1.02;margin:0">Codex app<br>settings</h1><p style="font-size:44px;line-height:1.35;color:#dce7f5">Settings → Appearance → Pets</p><p style="font-size:34px;line-height:1.45;color:#aeb8c8">Choose a built-in pet, refresh custom pets,<br>or wake the overlay with /pet.</p></section><div style="position:absolute;right:130px;top:210px;width:280px;height:340px;filter:drop-shadow(0 36px 70px rgba(70,100,255,.55))"><div style="position:absolute;left:20px;right:20px;top:30px;height:210px;border-radius:72px;background:linear-gradient(180deg,#73a2ff,#3953db)"></div><div style="position:absolute;left:70px;right:70px;top:98px;height:82px;border-radius:24px;background:#202637;color:#c8efff;text-align:center;font:48px/82px Consolas,monospace">&gt;_</div><div style="position:absolute;left:88px;right:88px;bottom:0;height:110px;border-radius:30px;background:#4165e6"></div></div></body></html>`);
    await page.screenshot({
      path: path.join(PROJECT, "assets", "images", "codex-settings-pets.png"),
      fullPage: false,
    });
  } finally {
    await page.close();
  }
}

function petHtml(extraClass = "") {
  return `<div class="pet ${extraClass}"><div class="fluff f1"></div><div class="fluff f2"></div><div class="fluff f3"></div><div class="head"><div class="face"><span class="eye e1"></span><span class="eye e2"></span></div></div><div class="arm a1"></div><div class="arm a2"></div><div class="body"></div><div class="leg l1"></div><div class="leg l2"></div></div>`;
}

function mediaHtml(card) {
  const chips = card.chips.map((chip) => `<span>${esc(chip)}</span>`).join("");
  if (card.visual === "tweet") {
    return `<div class="media"><div class="visual"><div class="tweet-card"><div class="tweet-top"><div class="openai-dot">◎</div><div><div class="tweet-name">OpenAI Developers</div><div class="tweet-handle">@OpenAIDevs</div></div></div><div class="tweet-text">애완동물.<br>이제 Codex에서 사용 가능합니다.<br><br><span class="code-word">/pet</span>을 사용해<br>애완동물을 깨우세요.</div><div class="video-window">${petHtml()}</div></div><div class="label">${esc(card.label)}</div><div class="chips">${chips}</div></div></div>`;
  }
  if (card.visual === "docs") {
    return `<div class="media"><img class="media-img" src="../assets/images/codex-settings-pets.png" alt=""><div class="label">${esc(card.label)}</div><div class="chips">${chips}</div></div>`;
  }
  if (card.visual === "commands") {
    return `<div class="media"><div class="visual"><div class="cmd-window"><div class="window-bar"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div><div class="cmd-body"><span class="prompt">composer ></span> <span class="cmd">/pet</span><br><span class="prompt">command ></span> Wake Pet<br><span class="prompt">command ></span> Tuck Away Pet</div></div>${petHtml("command-pet")}<div class="label">${esc(card.label)}</div><div class="chips">${chips}</div></div></div>`;
  }
  if (card.visual === "states") {
    return `<div class="media"><div class="visual"><div class="status-panel"><div class="status-grid"><div class="status"><div class="mini-pet"><span></span></div><b>실행 중</b><span>작업 중</span></div><div class="status"><div class="mini-pet"><span></span></div><b>대기 중</b><span>입력 기다림</span></div><div class="status"><div class="mini-pet"><span></span></div><b>리뷰 준비</b><span>확인 가능</span></div></div></div><div class="label">${esc(card.label)}</div><div class="chips">${chips}</div></div></div>`;
  }
  if (card.visual === "custom") {
    return `<div class="media"><div class="visual"><div class="custom-panel"><div class="code-line">$ <span class="mint">skill-installer</span> hatch-pet</div><div class="code-line">$ <span class="mint">hatch-pet</span> create a new pet</div><div class="hint">내 최근 프로젝트 느낌으로<br>작은 코딩 친구 만들기</div></div><div class="label">${esc(card.label)}</div><div class="chips">${chips}</div></div></div>`;
  }
  if (card.visual === "checklist") {
    return `<div class="media"><div class="visual"><div class="check-panel"><div class="check-item"><span class="box">1</span>Settings 열기</div><div class="check-item"><span class="box">2</span>Appearance → Pets</div><div class="check-item"><span class="box">3</span>입력창에 <span class="code-word">/pet</span></div><div class="check-item"><span class="box">4</span>커스텀은 hatch-pet</div></div><div class="label">${esc(card.label)}</div><div class="chips">${chips}</div></div></div>`;
  }
  return "";
}

function cardHtml(card, index) {
  if (card.kind === "cover") {
    return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../style.css"></head><body><article class="card"><div class="cover-bg"></div><div class="grid"></div><div class="brand">AI JJUN</div>${petHtml()}<section class="cover-copy"><div class="pill">${esc(card.tag)}</div><h1 class="cover-title">${rich(card.title)}</h1><p class="cover-sub">${rich(card.sub)}</p></section><div class="source">Source · OpenAI Developers</div></article></body></html>`;
  }
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../style.css"></head><body><article class="card"><div class="brand">AI JJUN</div>${mediaHtml(card)}<section class="copy"><div class="num">${index + 1}</div><h1 class="title">${rich(card.title)}</h1><p class="body">${rich(card.body)}</p></section><div class="footer">AI NEWS</div></article></body></html>`;
}

function motionHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../style.css"><style>
.pet{--jump:0;transform:translate(-50%,calc(-50% - var(--jump) * 34px)) scale(calc(.9 + var(--wake) * .1))}
.pet .eye{transform:scaleY(calc(.2 + var(--wake) * .8));transform-origin:center}
.cmd{opacity:var(--cmd,1);text-shadow:0 0 calc(14px + var(--cmd) * 22px) rgba(101,255,220,.72)}
.cmd-window{transform:translateY(calc(26px - var(--wake) * 26px));opacity:calc(.45 + var(--wake) * .55)}
</style></head><body>${cardHtml(cards[3], 3).match(/<article[\s\S]*<\/article>/)[0]}<script>
const t = Number(new URLSearchParams(location.search).get("t") || 0);
const clamp = (v) => Math.max(0, Math.min(1, v));
const wake = clamp((t - .3) / 1.2);
const jump = Math.sin(Math.max(0, t - 1.05) * 6) * Math.exp(-Math.max(0, t - 1.05) * .9);
document.documentElement.style.setProperty("--wake", wake.toFixed(3));
document.documentElement.style.setProperty("--jump", Math.max(0, jump).toFixed(3));
document.documentElement.style.setProperty("--cmd", clamp((t - .1) / .8).toFixed(3));
</script></body></html>`;
}

async function renderHtml(page, htmlPath, outputPath) {
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
  await page.screenshot({ path: outputPath, type: "png" });
}

async function renderMotion(browser) {
  const motionDir = path.join(PROJECT, "motion", "card-04-pet");
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
    await page.screenshot({ path: path.join(framesDir, `frame-${String(frame).padStart(4, "0")}.png`), type: "png" });
  }
  await page.goto(`${pathToFileURL(motionPath).href}?t=2.1`, { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(PROJECT, "output", "card-04-motion-preview.png"), type: "png" });
  await page.close();
  if (existsSync(FFMPEG)) {
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
      path.join(PROJECT, "output", "card-04-motion.mp4"),
    ], { stdio: "ignore" });
  }
}

function writeDocs() {
  writeFileSync(path.join(PROJECT, "source.md"), `# Source\n\n- OpenAI Developers docs: ${SOURCE_URL}\n- User-provided X screenshot used as composition reference only.\n\n## Verified points\n\n- Codex pets are optional animated companions for the Codex app.\n- In Settings > Appearance, choose Pets to select a built-in pet or refresh custom pets.\n- Type \`/pet\`, use Wake Pet/Tuck Away Pet in settings, or run commands from Cmd/Ctrl+K.\n- The overlay shows active thread/status while using other apps.\n- Custom pets can be made by installing \`hatch-pet\`, reloading skills, and asking it to create a pet.\n`, "utf8");
  writeFileSync(path.join(PROJECT, "brief.md"), `# Brief\n\nAI쭌 viewers like cute but practical AI features. This post turns Codex pets into a quick follow-along guide: what it is, why it is useful, how to enable it, and how to customize it.\n`, "utf8");
  writeFileSync(path.join(PROJECT, "storyboard.md"), cards.map((card, i) => `${i + 1}. ${card.title.replaceAll("<br>", " ")}\n   - Visual: ${card.visual || card.kind}\n   - Job: ${card.label || "hook"}`).join("\n\n"), "utf8");
  writeFileSync(path.join(PROJECT, "motion-plan.md"), `# Motion Plan\n\n- Card 04 has a motion version where \`/pet\` wakes the small Codex pet.\n- Static fallback: output/card-04.png\n- Motion output: output/card-04-motion.mp4\n`, "utf8");
  writeFileSync(path.join(PROJECT, "design.md"), `# Design\n\n- Style: cute AI news + Codex dark UI.\n- Font: Griun Mongtori for Korean headlines/body; monospace for commands.\n- Color: black, deep gray, mint, blue pet glow.\n- Layout: HERMES editorial top visual + bottom big explanation.\n`, "utf8");
  writeFileSync(path.join(PROJECT, "instagram-caption.md"), `Codex에 작은 애완동물이 생겼대요 🐾\n\nOpenAI Developers 문서에 Codex pets가 추가됐습니다.\n이제 Codex 앱에서 작은 펫 오버레이를 켜고,\n작업 상태를 귀엽게 확인할 수 있어요.\n\n핵심만 보면 이거예요.\n\n① Settings → Appearance → Pets\n기본 펫을 선택하거나 로컬 커스텀 펫을 새로고침할 수 있어요.\n\n② 입력창에 /pet\n가장 빠르게 깨우는 방법입니다.\n명령 팔레트에서 Wake Pet / Tuck Away Pet도 가능해요.\n\n③ 작업 상태 확인\nCodex가 실행 중인지, 입력을 기다리는지, 리뷰 준비됐는지 작은 오버레이로 보여줍니다.\n\n④ 커스텀 펫도 가능\n\`$skill-installer hatch-pet\` 설치 후 스킬을 다시 불러오고,\n원하는 느낌의 펫을 만들어달라고 하면 됩니다.\n\n귀여운데 은근 실용적이라 한 번 켜볼 만해욤.\n\n써보시려면 여기 OpenAI 공식 문서 참고해보세요:\n${SOURCE_URL}\n\nContents Editor · AI쭌\nSource · OpenAI Developers\n\n#Codex #OpenAI #AI툴 #개발자도구 #AI뉴스 #생성형AI #코딩AI\n`, "utf8");
  const index = `<!doctype html><html><head><meta charset="utf-8"><title>Codex Pets</title><style>body{margin:0;background:#111;color:#fff;font-family:system-ui,sans-serif;padding:32px}img,video{display:block;width:min(420px,100%);border:1px solid #333;margin-bottom:14px}section{margin-bottom:44px}</style></head><body><h1>Codex Pets</h1>${cards.map((_, i) => `<section><h2>Card ${i + 1}</h2><img src="output/card-${String(i + 1).padStart(2, "0")}.png"></section>`).join("")}<section><h2>Motion</h2><video src="output/card-04-motion.mp4" controls></video></section></body></html>`;
  writeFileSync(path.join(PROJECT, "index.html"), index, "utf8");
}

async function main() {
  ensureDirs();
  const puppeteer = await import(pathToFileURL(PUPPETEER_PATH).href);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  await captureDocs(browser);
  writeFileSync(path.join(PROJECT, "style.css"), css(), "utf8");
  const page = await browser.newPage();
  await page.setViewport({ width: CARD_W, height: CARD_H, deviceScaleFactor: 1 });
  for (let i = 0; i < cards.length; i += 1) {
    const htmlPath = path.join(PROJECT, "cards", `card-${String(i + 1).padStart(2, "0")}.html`);
    writeFileSync(htmlPath, cardHtml(cards[i], i), "utf8");
    await renderHtml(page, htmlPath, path.join(PROJECT, "output", `card-${String(i + 1).padStart(2, "0")}.png`));
  }
  await page.close();
  await renderMotion(browser);
  await browser.close();
  writeDocs();
  console.log(`codex-pets rendered: ${PROJECT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
