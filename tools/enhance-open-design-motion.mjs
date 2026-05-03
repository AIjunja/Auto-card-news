import { execFileSync } from "child_process";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import path from "path";
import { pathToFileURL } from "url";

const ROOT = process.cwd();
const PROJECT = path.join(
  ROOT,
  "carousel-workspace",
  "projects",
  "ai-jjuun",
  "2026-05-03-open-design",
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

const FPS = 12;

function ensureDirs() {
  for (const dir of [
    "motion/card-04-usage-frames",
    "motion/reel-v2-frames",
    "motion/reel-v2-review",
  ]) {
    rmSync(path.join(PROJECT, dir), { recursive: true, force: true });
    mkdirSync(path.join(PROJECT, dir), { recursive: true });
  }
}

function sharedCss(width, height) {
  return `@font-face{font-family:"Griun Mongtori";src:url("../assets/fonts/Griun_Mongtori-Rg.ttf") format("truetype");font-weight:400}
@font-face{font-family:"Moneygraphy Rounded";src:url("../assets/fonts/Moneygraphy-Rounded.woff2") format("woff2");font-weight:700}
*{box-sizing:border-box}
html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden;background:#000;color:#fff;font-family:"Moneygraphy Rounded",system-ui,sans-serif;word-break:keep-all;letter-spacing:0}
.stage{position:relative;width:${width}px;height:${height}px;overflow:hidden;background:#000}
.brand{position:absolute;z-index:40;top:54px;left:0;right:0;text-align:center;font-size:34px;letter-spacing:8px;font-weight:900}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.055) 1px,transparent 1px);background-size:62px 62px;opacity:.48}
.glow{position:absolute;inset:-20%;background:radial-gradient(circle at 75% 18%,rgba(255,143,76,.23),transparent 26%),radial-gradient(circle at 26% 76%,rgba(255,230,194,.14),transparent 24%)}
.chip{display:inline-flex;align-items:center;min-height:54px;padding:12px 20px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.5);background:rgba(0,0,0,.62);color:#ff9b62;font-size:26px}
.title,.body,.visual-copy{font-family:"Griun Mongtori","Moneygraphy Rounded",system-ui,sans-serif;font-weight:400;letter-spacing:0}
.code{font-family:Consolas,monospace;color:#ff9b62}
.panel{position:absolute;border-radius:30px;background:rgba(13,17,23,.86);border:1px solid rgba(255,255,255,.18);box-shadow:0 28px 80px rgba(0,0,0,.48);overflow:hidden}
.bar{height:58px;background:#161b22;border-bottom:1px solid #30363d;display:flex;align-items:center;padding:0 22px;gap:9px}
.dot{width:15px;height:15px;border-radius:50%;display:inline-block}.red{background:#ff5f56}.yellow{background:#ffbd2e}.green{background:#27c93f}
.field{border-radius:22px;background:#f7eadf;color:#17110d;border:2px solid #decab8;padding:22px 24px;font-size:30px;line-height:1.22}
.terminal{font-family:Consolas,monospace;font-size:28px;line-height:1.5;color:#e6edf3}.ok{color:#7dffb2}.accent{color:#ff9b62}.muted{color:#9aa4b2}
.preview{background:linear-gradient(180deg,#f8efe7,#f6d9c3);color:#111;border-radius:24px;border:2px solid rgba(255,255,255,.46);box-shadow:0 20px 60px rgba(0,0,0,.25);overflow:hidden}
.preview-top{height:56px;background:#15171d;color:white;display:flex;align-items:center;padding:0 22px;font-size:20px;gap:8px}
.preview-body{padding:28px}
.preview h3{font-size:46px;line-height:1.05;margin:0 0 18px;font-family:"Moneygraphy Rounded",system-ui,sans-serif}
.preview p{font-size:25px;line-height:1.32;margin:0;color:#3b3029}
.button{display:inline-flex;margin-top:24px;padding:14px 20px;border-radius:999px;background:#111;color:#fff;font-size:22px}
.export{display:grid;grid-template-columns:1fr 1fr;gap:14px}.export div{height:78px;border-radius:20px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;color:#ff9b62;font-size:35px}
.progress{position:absolute;height:8px;border-radius:999px;background:rgba(255,255,255,.15);overflow:hidden;z-index:50}.progress i{display:block;height:100%;width:0;background:linear-gradient(90deg,#ff9b62,#f8ddbf)}
`;
}

function cardMotionHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${sharedCss(1080, 1350)}
.media{position:absolute;left:42px;right:42px;top:136px;height:555px;overflow:hidden;border:4px solid rgba(255,255,255,.9);background:#11151b}
.media:after{content:"";position:absolute;inset:auto 0 0;height:42%;background:linear-gradient(0deg,rgba(0,0,0,.94),transparent)}
.agent-panel{left:76px;right:76px;top:62px;height:410px}
.agent-body{display:grid;grid-template-columns:1fr 1fr;gap:18px;padding:26px}
.agent-card{height:118px;border-radius:22px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);padding:20px;opacity:0;transform:translateY(20px)}
.agent-card b{display:block;color:#ff9b62;font-size:31px}.agent-card span{display:block;margin-top:10px;color:#d7c7b4;font-size:23px}
.prompt-panel{left:76px;right:76px;top:62px;height:410px;padding:84px 34px 0;opacity:0}
.question-panel{left:76px;right:76px;top:62px;height:410px;padding:32px;opacity:0}
.question-panel .field{margin-bottom:16px;opacity:0;transform:translateX(-20px)}
.label{position:absolute;z-index:12;left:34px;bottom:36px;display:inline-flex;align-items:center;min-height:52px;padding:12px 19px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.38);background:rgba(0,0,0,.68);font-size:27px;color:#ff9b62}
.chips{position:absolute;z-index:12;right:34px;bottom:34px;display:flex;gap:12px;flex-wrap:wrap;justify-content:flex-end;max-width:760px}.chips span{display:inline-flex;align-items:center;min-height:50px;padding:12px 16px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.68);font-size:25px;color:#ff9b62}
.copy{position:absolute;z-index:20;left:70px;right:70px;top:750px}
.num{display:flex;align-items:center;justify-content:center;width:70px;height:70px;margin-bottom:26px;border-radius:50%;background:rgba(255,255,255,.13);font-size:42px;color:rgba(255,255,255,.78);font-weight:900}
.title{margin:0;font-size:78px;line-height:1.08}.body{margin:34px 0 0;font-size:38px;line-height:1.28;color:rgba(255,255,255,.9)}
.progress{left:70px;right:70px;bottom:42px}
</style></head><body><main class="stage"><div class="glow"></div><div class="grid"></div><div class="brand">AI JJUN</div><section class="media"><div class="panel agent-panel"><div class="bar"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div><div class="agent-body"><div class="agent-card a1"><b>Codex</b><span>작업 폴더 이해</span></div><div class="agent-card a2"><b>Claude Code</b><span>스킬 읽고 시안 제작</span></div><div class="agent-card a3"><b>Cursor</b><span>코드 기반 수정</span></div><div class="agent-card a4"><b>Open Design</b><span>디자인 작업대 역할</span></div></div></div><div class="panel prompt-panel"><div class="field"><span class="muted">Prompt</span><br><span id="typed"></span><span class="accent">|</span></div></div><div class="panel question-panel"><div class="field q1"><b>Q1.</b> 누구에게 보여줄까요?</div><div class="field q2"><b>Q2.</b> 어떤 톤이어야 하나요?</div><div class="field q3"><b>Q3.</b> 피해야 할 스타일은?</div></div><div class="label">Motion card</div><div class="chips"><span>Codex</span><span>Claude Code</span><span>Cursor</span></div></section><section class="copy"><div class="num">4</div><h1 class="title">핵심은<br>내 AI에 붙여서<br>쓴다는 것</h1><p class="body">Claude Design 느낌을<br>내 코딩 에이전트 옆에 붙여 쓰는 구조예요.</p></section><div class="progress"><i id="bar"></i></div></main><script>
const typed=document.getElementById("typed");const bar=document.getElementById("bar");
const prompt="AI 뉴스레터 랜딩페이지 만들어줘";
function clamp(v){return Math.max(0,Math.min(1,v))}
window.renderAt=(t)=>{
  const p=clamp(t/5);bar.style.width=(p*100)+"%";
  const cards=[...document.querySelectorAll(".agent-card")];
  cards.forEach((el,i)=>{const k=clamp((t-.25-i*.22)/.7);el.style.opacity=k;el.style.transform='translateY('+(20-20*k)+'px)'});
  const promptPanel=document.querySelector(".prompt-panel");const questionPanel=document.querySelector(".question-panel");
  const pk=clamp((t-1.35)/.55);promptPanel.style.opacity=pk;promptPanel.style.transform='translateY('+(20-20*pk)+'px)';
  typed.textContent=prompt.slice(0,Math.floor(clamp((t-1.75)/1.5)*prompt.length));
  const qk=clamp((t-3.1)/.5);questionPanel.style.opacity=qk;questionPanel.style.transform='translateY('+(24-24*qk)+'px)';
  document.querySelectorAll(".question-panel .field").forEach((el,i)=>{const k=clamp((t-3.35-i*.25)/.45);el.style.opacity=k;el.style.transform='translateX('+(-20+20*k)+'px)'});
}
window.renderAt(0);
</script></body></html>`;
}

const reelScenes = [
  { at: 0, dur: 3.8, type: "cover", title: "Claude Design\n돈 주고 쓰기 전에\n이거 보세요", sub: "Open Design" },
  { at: 3.8, dur: 4.2, type: "repo", title: "거의 복제판 느낌인데\n오픈소스", sub: "로컬에서 비슷하게 실험 가능" },
  { at: 8, dur: 5.2, type: "demoPrompt", title: "실제로 쓰면\n이런 흐름이에요", sub: "프롬프트를 먼저 던짐" },
  { at: 13.2, dur: 5.4, type: "demoQuestion", title: "바로 만들지 않고\n먼저 물어봐요", sub: "대상 · 톤 · 브랜드 · 제약" },
  { at: 18.6, dur: 5.2, type: "demoAgent", title: "내 AI가\n디자인 엔진처럼 작업", sub: "Codex · Claude Code · Cursor 연결" },
  { at: 23.8, dur: 5.4, type: "demoPreview", title: "시안이\n눈앞에 생김", sub: "랜딩페이지 · 카드뉴스 · 포스터" },
  { at: 29.2, dur: 4.8, type: "demoExport", title: "결과물도\n파일로 저장", sub: "HTML · PDF · PPTX · ZIP" },
  { at: 34, dur: 4, type: "outro", title: "디자인 때문에\n막히던 분들,\n저장해두세요", sub: "링크는 캡션에 둘게욤" },
];

function reelHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${sharedCss(1080, 1920)}
.brand{top:52px}.bg-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:72% center;opacity:.82;filter:saturate(1.08) contrast(1.05)}
.dim{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.8),rgba(0,0,0,.28) 56%,rgba(0,0,0,.18)),linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.18) 45%,rgba(0,0,0,.94))}
.copy{position:absolute;left:64px;right:300px;bottom:520px;z-index:30;filter:drop-shadow(0 20px 42px rgba(0,0,0,.62))}
.title{white-space:pre-line;margin:24px 0 0;font-size:76px;line-height:1.07}.sub{font-family:"Griun Mongtori";font-size:35px;line-height:1.26;color:rgba(255,255,255,.9);margin:22px 0 0}
.demo{position:absolute;z-index:12;left:72px;right:300px;top:198px;height:650px}
.demo .panel{position:absolute;inset:0}.prompt-box{position:absolute;left:42px;right:42px;top:122px}.prompt-box .field{font-size:34px}
.question-list{position:absolute;left:42px;right:42px;top:84px}.question-list .field{margin-bottom:18px}
.flow-list{position:absolute;left:42px;right:42px;top:72px;display:grid;gap:20px}.flow-row{display:flex;align-items:center;gap:20px;padding:24px 28px;border-radius:28px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);font-size:35px}.flow-row b{color:#ff9b62}
.preview{position:absolute;left:48px;right:48px;top:66px;height:500px}.preview-body{height:444px}.preview h3{font-size:54px}.mock-card{position:absolute;right:38px;bottom:30px;width:220px;height:270px;border-radius:22px;background:#111;color:white;padding:20px;font-size:24px}.mock-card i{display:block;width:82px;height:82px;border-radius:22px;background:#ff9b62;margin-bottom:18px}
.export{position:absolute;left:44px;right:44px;top:146px}
.progress{left:64px;right:300px;bottom:472px}.safe-note{position:absolute;left:64px;bottom:80px;font-size:24px;color:rgba(255,255,255,.42);z-index:30}
</style></head><body><main class="stage"><div id="bg"></div><div class="glow"></div><div class="grid"></div><div class="dim"></div><div class="brand">AI JJUN</div><div id="demo" class="demo"></div><section class="copy"><div class="chip">AI NEWS | DESIGN</div><h1 id="title" class="title"></h1><p id="sub" class="sub"></p></section><div class="progress"><i id="bar"></i></div><div class="safe-note">Source · nexu-io/open-design</div></main><script>
const scenes=${JSON.stringify(reelScenes)};const total=38;const bg=document.getElementById("bg");const demo=document.getElementById("demo");const title=document.getElementById("title");const sub=document.getElementById("sub");const bar=document.getElementById("bar");let last="";
function clamp(v){return Math.max(0,Math.min(1,v))}
function sceneAt(t){return scenes.find(s=>t>=s.at&&t<s.at+s.dur)||scenes.at(-1)}
function setVisual(s){
  demo.innerHTML="";bg.innerHTML="";
  if(s.type==="cover"){bg.innerHTML='<img class="bg-img" src="../assets/images/banner.png">';return}
  if(s.type==="repo"){bg.innerHTML='<img class="bg-img" src="../assets/images/github-repo.png">';demo.innerHTML='<div class="panel"><div class="bar"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div><img src="../assets/images/github-repo.png" style="position:absolute;inset:58px 0 0;width:100%;height:592px;object-fit:cover;object-position:top center;opacity:.8"></div>';return}
  if(s.type==="demoPrompt"){demo.innerHTML='<div class="panel"><div class="bar"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div><div class="prompt-box"><div class="field"><span class="muted">Prompt</span><br><span id="typed"></span><span class="accent">|</span></div></div></div>';return}
  if(s.type==="demoQuestion"){demo.innerHTML='<div class="panel"><div class="bar"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div><div class="question-list"><div class="field q">누구에게 보여줄까요?</div><div class="field q">어떤 톤이어야 하나요?</div><div class="field q">피해야 할 스타일은?</div><div class="field q">결과물은 HTML? PPTX?</div></div></div>';return}
  if(s.type==="demoAgent"){demo.innerHTML='<div class="flow-list"><div class="flow-row"><b>1</b> Codex가 폴더 구조 파악</div><div class="flow-row"><b>2</b> Claude Code가 시안 제작</div><div class="flow-row"><b>3</b> Cursor가 코드 수정</div><div class="flow-row"><b>4</b> Open Design이 미리보기 정리</div></div>';return}
  if(s.type==="demoPreview"){demo.innerHTML='<div class="preview"><div class="preview-top"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span> preview.html</div><div class="preview-body"><h3>AI 뉴스레터<br>랜딩페이지</h3><p>디자인 시스템을 적용해서<br>바로 보여줄 수 있는 시안 생성</p><span class="button">무료로 시작하기</span><div class="mock-card"><i></i>카드뉴스<br>표지 시안</div></div></div>';return}
  if(s.type==="demoExport"){demo.innerHTML='<div class="export"><div>HTML</div><div>PDF</div><div>PPTX</div><div>ZIP</div></div>';return}
  bg.innerHTML='<img class="bg-img" src="../assets/images/website.png">';
}
window.renderAt=(t)=>{const s=sceneAt(t);if(s.type+s.title!==last){setVisual(s);last=s.type+s.title}title.textContent=s.title;sub.textContent=s.sub;const local=clamp((t-s.at)/s.dur);const ease=1-Math.pow(1-local,3);document.querySelector(".copy").style.opacity=.35+.65*ease;document.querySelector(".copy").style.transform='translateY('+(24-24*ease)+'px)';bar.style.width=(t/total*100)+'%';const typed=document.getElementById("typed");if(typed){const text="AI 뉴스레터 랜딩페이지 만들어줘";typed.textContent=text.slice(0,Math.floor(clamp((local-.15)/.6)*text.length))}document.querySelectorAll(".q,.flow-row,.export div").forEach((el,i)=>{const k=clamp((local-.12-i*.08)/.35);el.style.opacity=k;el.style.transform='translateY('+(22-22*k)+'px)'})}
window.renderAt(0);
</script></body></html>`;
}

async function renderHtmlToVideo(browser, html, htmlName, frameDirName, outputName, width, height, seconds) {
  const htmlPath = path.join(PROJECT, "motion", htmlName);
  writeFileSync(htmlPath, html, "utf8");
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
  const frameDir = path.join(PROJECT, "motion", frameDirName);
  const totalFrames = Math.round(seconds * FPS);
  for (let frame = 0; frame < totalFrames; frame += 1) {
    await page.evaluate((t) => window.renderAt(t), frame / FPS);
    await page.screenshot({
      path: path.join(frameDir, `frame-${String(frame).padStart(5, "0")}.png`),
      fullPage: false,
    });
  }
  await page.close();
  const output = path.join(PROJECT, "output", outputName);
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
    output,
  ], { stdio: "ignore" });
}

function extractReviewFrames() {
  const reviewDir = path.join(PROJECT, "motion", "reel-v2-review");
  for (const t of [2, 6, 10, 15, 20, 26, 32, 36]) {
    execFileSync(FFMPEG, [
      "-y",
      "-ss",
      String(t),
      "-i",
      path.join(PROJECT, "output", "open-design-reel-v2.mp4"),
      "-frames:v",
      "1",
      "-q:v",
      "2",
      path.join(reviewDir, `review-${String(t).padStart(2, "0")}.jpg`),
    ], { stdio: "ignore" });
  }
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

async function main() {
  ensureDirs();
  const puppeteer = await import(pathToFileURL(PUPPETEER_PATH).href);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--allow-file-access-from-files"],
  });
  try {
    await renderHtmlToVideo(
      browser,
      cardMotionHtml(),
      "card-04-motion.html",
      "card-04-usage-frames",
      "card-04-motion.mp4",
      1080,
      1350,
      5,
    );
    await renderHtmlToVideo(
      browser,
      reelHtml(),
      "open-design-reel-v2.html",
      "reel-v2-frames",
      "open-design-reel-v2.mp4",
      1080,
      1920,
      38,
    );
  } finally {
    await browser.close();
  }
  extractReviewFrames();
  console.log(`enhanced motion outputs: ${PROJECT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
