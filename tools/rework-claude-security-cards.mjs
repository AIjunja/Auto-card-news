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
const PROJECT = path.join(PROJECT_ROOT, "2026-05-01-claude-security-public-beta");
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
const MOTION_SECONDS = 3.4;

const URLS = {
  product: "https://claude.com/product/claude-security",
  blog: "https://claude.com/blog/claude-security-public-beta",
  tutorial: "https://claude.com/resources/tutorials/getting-started-with-claude-security",
  help: "https://support.claude.com/en/articles/14661296-use-claude-security",
};

const cards = [
  {
    kind: "cover",
    sourceImage: "claude-security-product.png",
    tag: "AI NEWS | SECURITY",
    title: "보안 알림,<br />이제 AI가<br />한 번 더 걸러줍니다",
    sub: "Claude Security가 public beta로 나왔어욤.",
    source: "Anthropic",
  },
  {
    image: "claude-security-product.png",
    title: "무슨 툴인데요?",
    body: "코드 저장소를 스캔해서<br />위험한 부분을 찾고, 고칠 방법까지 제안하는 보안 도구예요.",
    label: "제품 화면",
    chips: ["코드 스캔", "취약점 찾기", "패치 제안"],
  },
  {
    title: "그냥 키워드 검색이<br />아니에요",
    body: "파일 여러 개를 이어서 보고<br />데이터가 어디서 어디로 흐르는지 따라갑니다.",
    label: "스캔 흐름",
    visual: "dataflow",
    chips: ["파일 간 흐름", "비즈니스 로직", "숨은 취약점"],
  },
  {
    title: "헛경고를 줄이려고<br />스스로 한 번 더 검증",
    body: "찾은 결과를 바로 던지는 게 아니라<br />정말 위험한지 다시 의심해요.",
    label: "검증 단계",
    visual: "validate",
    chips: ["검증", "confidence", "오탐 감소"],
    motion: true,
  },
  {
    title: "찾고 끝이 아니라<br />수정안까지 이어집니다",
    body: "취약점 설명, 영향, 재현 방법,<br />그리고 패치 방향까지 같이 보여주는 흐름이에요.",
    label: "패치 제안",
    visual: "patch",
    chips: ["diff", "review", "approve"],
  },
  {
    title: "Slack·Jira로<br />흘려보낼 수도 있어요",
    body: "보안팀이 이미 쓰는 업무 흐름에<br />웹훅, CSV, Markdown으로 붙일 수 있습니다.",
    label: "워크플로우",
    visual: "workflow",
    chips: ["Slack", "Jira", "CSV", "Markdown"],
  },
  {
    image: "claude-security-blog.png",
    title: "핵심은<br />‘빨리 고치는 보안’",
    body: "알림을 더 많이 만드는 게 아니라<br />진짜 고칠 일을 더 빨리 팀에 넘기는 쪽이에요.",
    label: "AI쭌 해석",
    chips: ["저장", "팀 공유", "공식 페이지 확인"],
  },
];

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function rich(text) {
  return String(text).replace(/`([^`]+)`/g, '<span class="code-word">$1</span>');
}

function ensureDirs() {
  for (const dir of [
    path.join(PROJECT, "cards"),
    path.join(PROJECT, "motion"),
    path.join(PROJECT, "output"),
  ]) {
    rmSync(dir, { recursive: true, force: true });
  }

  for (const dir of [
    path.join(PROJECT, "assets", "fonts"),
    path.join(PROJECT, "assets", "images"),
    path.join(PROJECT, "cards"),
    path.join(PROJECT, "motion", "card-04-validate"),
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
    ["product", URLS.product, "claude-security-product.png"],
    ["blog", URLS.blog, "claude-security-blog.png"],
    ["tutorial", URLS.tutorial, "claude-security-tutorial.png"],
  ];
  for (const [, url, filename] of targets) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 });
    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
      await page.evaluate(() => {
        document.querySelectorAll('[aria-label*="cookie" i], button').forEach((el) => {
          const text = (el.textContent || "").toLowerCase();
          if (text.includes("accept") || text.includes("agree")) el.click();
        });
      });
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
  const html = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="1100">
    <rect width="1440" height="1100" fill="#111318"/>
    <text x="80" y="140" fill="#fff" font-size="64" font-family="Arial">${title}</text>
    <rect x="80" y="230" width="980" height="520" rx="40" fill="#1f242c"/>
    <text x="130" y="330" fill="#65ffdc" font-size="54" font-family="Arial">Claude Security</text>
    <text x="130" y="420" fill="#fff" font-size="38" font-family="Arial">scan → validate → patch</text>
  </svg>`;
  writeFileSync(path.join(PROJECT, "assets", "images", filename), html, "utf8");
}

function css() {
  return `@font-face{font-family:Griun;src:url("../assets/fonts/Griun_Mongtori-Rg.ttf") format("truetype")}
@font-face{font-family:Money;src:url("../assets/fonts/Moneygraphy-Rounded.woff2") format("woff2");font-weight:700}
*{box-sizing:border-box}
html,body{width:${CARD_W}px;height:${CARD_H}px;margin:0;overflow:hidden;background:#000;color:#fff;font-family:Money,system-ui,sans-serif;word-break:keep-all;letter-spacing:0}
.card{position:relative;width:${CARD_W}px;height:${CARD_H}px;overflow:hidden;background:#000}
.brand{position:absolute;z-index:20;top:58px;left:0;right:0;text-align:center;font-size:34px;letter-spacing:8px;font-weight:900;color:#fff}
.source{position:absolute;z-index:20;left:70px;bottom:52px;color:rgba(255,255,255,.64);font-size:23px}
.footer{position:absolute;z-index:20;right:70px;bottom:52px;font-size:28px;letter-spacing:6px;font-weight:900}
.cover-img{position:absolute;inset:-20px 0 0 0;width:100%;height:900px;object-fit:cover;filter:saturate(1.1) contrast(1.05)}
.cover-dim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.1) 0%,rgba(0,0,0,.35) 46%,#000 80%)}
.cover-copy{position:absolute;z-index:10;left:70px;right:70px;bottom:112px}
.pill{display:inline-flex;min-height:58px;align-items:center;padding:13px 22px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.72);background:rgba(0,0,0,.34);font-size:30px;backdrop-filter:blur(8px)}
.cover-title{margin:34px 0 0;font-size:98px;line-height:1.04;font-weight:900;letter-spacing:0;text-shadow:0 9px 34px rgba(0,0,0,.55)}
.cover-sub{margin:24px 0 0;color:rgba(255,255,255,.88);font-size:38px;line-height:1.32}
.media{position:absolute;left:42px;right:42px;top:142px;height:552px;overflow:hidden;border:4px solid rgba(255,255,255,.9);background:#11151b}
.media:after{content:"";position:absolute;inset:auto 0 0;height:42%;background:linear-gradient(0deg,rgba(0,0,0,.86),transparent);pointer-events:none}
.media-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.08) contrast(1.04);opacity:.88}
.copy{position:absolute;z-index:12;left:70px;right:70px;top:752px}
.num{display:flex;align-items:center;justify-content:center;width:70px;height:70px;margin-bottom:26px;border-radius:50%;background:rgba(255,255,255,.13);font-size:42px;color:rgba(255,255,255,.78);font-weight:900}
.title{margin:0;font-size:72px;line-height:1.13;font-weight:900}
.body{margin:34px 0 0;font-size:36px;line-height:1.36;color:rgba(255,255,255,.9)}
.label{position:absolute;z-index:7;left:38px;bottom:36px;display:inline-flex;min-height:52px;align-items:center;padding:12px 19px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.34);background:rgba(0,0,0,.62);font-size:27px;color:#65ffdc}
.chips{position:absolute;z-index:7;right:34px;bottom:34px;display:flex;gap:12px;flex-wrap:wrap;justify-content:flex-end;max-width:760px}
.chips span{display:inline-flex;min-height:50px;align-items:center;padding:12px 16px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.26);background:rgba(0,0,0,.62);font-size:25px;color:#65ffdc}
.visual{position:absolute;inset:0;background:linear-gradient(145deg,#151a20,#050607);overflow:hidden}
.visual:before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.055) 1px,transparent 1px);background-size:60px 60px;opacity:.6}
.node{position:absolute;z-index:4;padding:22px 24px;border-radius:20px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);font-size:31px}
.node b{display:block;font-size:35px}.node span{display:block;margin-top:8px;font-size:24px;color:rgba(255,255,255,.72)}
.flow-line{position:absolute;z-index:3;height:4px;background:#65ffdc;box-shadow:0 0 22px #65ffdc77;transform-origin:left center}
.dataflow .n1{left:70px;top:96px}.dataflow .n2{left:374px;top:72px}.dataflow .n3{right:88px;top:190px}.dataflow .n4{left:256px;bottom:126px}
.dataflow .l1{left:250px;top:170px;width:180px;transform:rotate(-12deg)}.dataflow .l2{left:558px;top:184px;width:250px;transform:rotate(23deg)}.dataflow .l3{left:420px;top:370px;width:250px;transform:rotate(-16deg)}
.validate .before,.validate .after{position:absolute;z-index:4;top:92px;width:410px;height:330px;border-radius:26px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);padding:30px}
.validate .before{left:72px}.validate .after{right:72px;border-color:#65ffdc88;box-shadow:0 0 45px #65ffdc22}
.validate h3{margin:0 0 22px;font-size:38px}.validate p{margin:0;font-size:28px;line-height:1.32;color:rgba(255,255,255,.76)}
.confidence{position:absolute;z-index:5;left:322px;bottom:118px;width:360px;height:34px;border-radius:999px;background:rgba(255,255,255,.16);overflow:hidden}.confidence i{display:block;width:78%;height:100%;background:#65ffdc}
.patch .diff{position:absolute;z-index:4;left:82px;right:82px;top:74px;bottom:98px;border-radius:24px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.55);padding:34px;font-family:Consolas,monospace;font-size:29px;line-height:1.45}
.plus{color:#7dffb2}.minus{color:#ff8b7a}.comment{color:#b8c2d2}
.workflow .lane{position:absolute;z-index:4;left:80px;right:80px;padding:26px;border-radius:24px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);font-size:36px}.workflow .lane:nth-child(1){top:78px}.workflow .lane:nth-child(2){top:220px}.workflow .lane:nth-child(3){top:362px}.workflow .lane b{color:#65ffdc}
`;
}

function mediaHtml(card, index) {
  const chips = (card.chips || []).map((chip) => `<span>${esc(chip)}</span>`).join("");
  if (card.image) {
    return `<div class="media"><img class="media-img" src="../assets/images/${esc(card.image)}" alt=""><div class="label">${esc(card.label)}</div><div class="chips">${chips}</div></div>`;
  }
  if (card.visual === "dataflow") {
    return `<div class="media"><div class="visual dataflow">
      <div class="node n1"><b>repo</b><span>여러 파일</span></div>
      <div class="node n2"><b>trace</b><span>데이터 흐름</span></div>
      <div class="node n3"><b>risk</b><span>숨은 취약점</span></div>
      <div class="node n4"><b>finding</b><span>맥락 기반 결과</span></div>
      <i class="flow-line l1"></i><i class="flow-line l2"></i><i class="flow-line l3"></i>
      <div class="label">${esc(card.label)}</div><div class="chips">${chips}</div>
    </div></div>`;
  }
  if (card.visual === "validate") {
    return `<div class="media"><div class="visual validate">
      <section class="before"><h3>기존 스캐너</h3><p>알림은 많은데<br>진짜인지 사람이 다시 봐야 함</p></section>
      <section class="after"><h3>Claude Security</h3><p>찾은 결과를<br>한 번 더 검증하고 confidence 표시</p></section>
      <div class="confidence"><i></i></div>
      <div class="label">${esc(card.label)}</div><div class="chips">${chips}</div>
    </div></div>`;
  }
  if (card.visual === "patch") {
    return `<div class="media"><div class="visual patch">
      <pre class="diff"><span class="comment">// vulnerable route</span>
<span class="minus">- const user = db.query(id)</span>
<span class="plus">+ const user = db.query(validate(id))</span>

<span class="comment">Claude proposes a targeted patch</span>
<span class="plus">+ add auth check before data access</span></pre>
      <div class="label">${esc(card.label)}</div><div class="chips">${chips}</div>
    </div></div>`;
  }
  if (card.visual === "workflow") {
    return `<div class="media"><div class="visual workflow">
      <div class="lane"><b>1</b> Finding 생성</div>
      <div class="lane"><b>2</b> Slack / Jira로 전달</div>
      <div class="lane"><b>3</b> CSV / Markdown으로 감사 기록</div>
      <div class="label">${esc(card.label)}</div><div class="chips">${chips}</div>
    </div></div>`;
  }
  return "";
}

function cardHtml(card, index) {
  if (card.kind === "cover") {
    return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><link rel="stylesheet" href="./card-shared.css"></head><body>
<article class="card">
  <img class="cover-img" src="../assets/images/${esc(card.sourceImage)}" alt="">
  <div class="cover-dim"></div>
  <div class="brand">AI TREND</div>
  <div class="cover-copy"><div class="pill">${esc(card.tag)}</div><h1 class="cover-title">${rich(card.title)}</h1><p class="cover-sub">${rich(card.sub)}</p></div>
  <div class="source">Source · ${esc(card.source)}</div>
</article></body></html>`;
  }
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><link rel="stylesheet" href="./card-shared.css"></head><body>
<article class="card">
  <div class="brand">AI TREND</div>
  ${mediaHtml(card, index)}
  <div class="copy"><div class="num">${index}</div><h1 class="title">${rich(card.title)}</h1><p class="body">${rich(card.body)}</p></div>
  <div class="source">Source · Anthropic</div><div class="footer">AI TREND</div>
</article></body></html>`;
}

function motionHtml() {
  const card = cards[3];
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><link rel="stylesheet" href="../../cards/card-shared.css"><style>
.scan{position:absolute;z-index:2;left:74px;right:74px;top:204px;height:72px;background:linear-gradient(180deg,transparent,#65ffdc55,transparent);box-shadow:0 0 28px #65ffdc33}
.bubble{position:absolute;z-index:31;right:88px;top:506px;padding:16px 22px 13px;border-radius:999px;background:#65ffdc;color:#06100d;font-size:30px;font-weight:900}
</style></head><body>${cardHtml(card, 4).match(/<article[\s\S]*<\/article>/)[0]}<div class="scan" id="scan"></div><div class="bubble" id="bubble">검증 통과</div><script>
window.renderFrame=(t)=>{
 const p=Math.max(0,Math.min(1,t/${MOTION_SECONDS}));
 document.getElementById('scan').style.transform='translateY('+(p*260)+'px)';
 document.querySelector('.confidence i').style.width=(25+p*65)+'%';
 document.getElementById('bubble').style.opacity=p>.55?'1':'0';
 document.querySelector('.after').style.transform='scale('+(1+p*.04)+')';
 document.querySelector('.before').style.opacity=String(1-p*.45);
};
window.renderFrame(0);
</script></body></html>`;
}

function indexHtml() {
  const sections = cards
    .map((_, i) => {
      const n = String(i + 1).padStart(2, "0");
      const motion = i === 3 ? `<video controls loop muted src="./output/card-04-motion.mp4"></video>` : "";
      return `<section><h2>Card ${n}${i === 3 ? " · Motion" : ""}</h2><img src="./output/card-${n}.png">${motion}</section>`;
    })
    .join("");
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>Claude Security v2</title><style>body{margin:0;background:#111;color:#fff;font-family:system-ui;padding:32px}section{margin:0 0 28px;padding:18px;border:1px solid #333;border-radius:12px;background:#181818}img,video{width:360px;margin-right:16px;border-radius:8px;vertical-align:top}</style></head><body><h1>Claude Security v2</h1>${sections}</body></html>`;
}

async function renderPng(browser, htmlPath, outPath, seek = null) {
  const page = await browser.newPage();
  await page.setViewport({ width: CARD_W, height: CARD_H, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0", timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  if (seek !== null) await page.evaluate((t) => window.renderFrame?.(t), seek);
  await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: CARD_W, height: CARD_H } });
  await page.close();
}

async function renderMotion(browser, htmlPath, frameDir, outPath) {
  rmSync(frameDir, { recursive: true, force: true });
  mkdirSync(frameDir, { recursive: true });
  const page = await browser.newPage();
  await page.setViewport({ width: CARD_W, height: CARD_H, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0", timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  const totalFrames = Math.round(FPS * MOTION_SECONDS);
  for (let frame = 0; frame <= totalFrames; frame += 1) {
    await page.evaluate((t) => window.renderFrame(t), frame / FPS);
    await page.screenshot({
      path: path.join(frameDir, `frame-${String(frame).padStart(4, "0")}.png`),
      clip: { x: 0, y: 0, width: CARD_W, height: CARD_H },
    });
  }
  await page.close();
  execFileSync(
    FFMPEG,
    [
      "-y",
      "-framerate",
      String(FPS),
      "-i",
      path.join(frameDir, "frame-%04d.png"),
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      outPath,
    ],
    { stdio: "pipe" },
  );
}

async function main() {
  ensureDirs();
  const { default: puppeteer } = await import(pathToFileURL(PUPPETEER_PATH).href);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--allow-file-access-from-files", "--disable-web-security", "--font-render-hinting=none"],
  });
  try {
    await captureSourceScreens(browser);
    writeFileSync(path.join(PROJECT, "cards", "card-shared.css"), css(), "utf8");
    cards.forEach((card, index) => {
      const n = String(index + 1).padStart(2, "0");
      writeFileSync(path.join(PROJECT, "cards", `card-${n}.html`), cardHtml(card, index + 1), "utf8");
    });
    writeFileSync(path.join(PROJECT, "motion", "card-04-validate", "index.html"), motionHtml(), "utf8");
    for (let i = 0; i < cards.length; i += 1) {
      const n = String(i + 1).padStart(2, "0");
      await renderPng(browser, path.join(PROJECT, "cards", `card-${n}.html`), path.join(PROJECT, "output", `card-${n}.png`));
    }
    await renderMotion(
      browser,
      path.join(PROJECT, "motion", "card-04-validate", "index.html"),
      path.join(PROJECT, "motion", "card-04-validate", "frames"),
      path.join(PROJECT, "output", "card-04-motion.mp4"),
    );
    await renderPng(
      browser,
      path.join(PROJECT, "motion", "card-04-validate", "index.html"),
      path.join(PROJECT, "output", "card-04-motion-preview.png"),
      MOTION_SECONDS * 0.68,
    );
    writeFileSync(path.join(PROJECT, "index.html"), indexHtml(), "utf8");
    writeFileSync(
      path.join(PROJECT, "instagram-caption.md"),
      `보안 알림이 너무 많으면 진짜 중요한 것도 같이 묻히잖아요.\n\nClaude Security는 코드 저장소를 스캔하고,\n취약점 후보를 찾고,\n헛경고를 줄이기 위해 한 번 더 검증하고,\n수정안까지 이어주는 보안 도구예요.\n\n핵심은 “AI가 알아서 배포한다”가 아니라\n팀이 리뷰하고 승인할 수 있게 진짜 고칠 일을 빨리 보여주는 쪽입니다욤.\n\n보안팀/개발팀에서 코드 점검 흐름 고민 중이면 저장해두세욤 🔐\n\nContents Editor · AI쭌\nSource · Anthropic Claude Security\n공식 페이지: ${URLS.product}\n발표 글: ${URLS.blog}\n튜토리얼: ${URLS.tutorial}\n`,
      "utf8",
    );
    console.log("Claude Security v2 rendered");
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
