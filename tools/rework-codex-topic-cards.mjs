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
const MOTION_SECONDS = 4;

const projects = [
  {
    slug: "2026-05-01-codex-for-work",
    title: "Codex for Work",
    urls: {
      product: "https://openai.com/codex/",
      help: "https://help.openai.com/en/articles/11369540-codex-in-chatgpt",
      docs: "https://developers.openai.com/codex",
      forWork: "https://chatgpt.com/codex/for-work/",
    },
    captures: [
      ["product", "https://openai.com/codex/", "codex-product.png"],
      ["help", "https://help.openai.com/en/articles/11369540-codex-in-chatgpt", "codex-help.png"],
      ["docs", "https://developers.openai.com/codex", "codex-docs.png"],
    ],
    cards: [
      {
        kind: "cover",
        image: "codex-workspace-visual.svg",
        tag: "AI NEWS | CODE",
        title: "회사 개발팀,<br />Codex 여러 명<br />굴리는 시대?",
        sub: "혼자 물어보는 AI가 아니라, 일감을 나눠 맡기는 작업판에 가까워졌어요.",
        source: "OpenAI Codex",
      },
      {
        image: "codex-workspace-visual.svg",
        label: "작업판 예시",
        chips: ["worktrees", "cloud env", "parallel"],
        title: "코드만 쓰는 애가<br />아니에요",
        body: "기능 만들기, 버그 잡기, 리뷰까지<br />여러 일을 동시에 맡기는 쪽으로<br />점점 커지고 있어요.",
      },
      {
        visual: "multiAgent",
        label: "팀 작업 흐름",
        chips: ["기능", "버그", "리뷰"],
        title: "일감 쪼개면<br />Codex가 나눠 뛰어요",
        body: "하나는 기능 만들고,<br />하나는 버그 잡고,<br />하나는 PR 리뷰하는 식이에요.",
        motion: true,
      },
      {
        visual: "surfaces",
        label: "Help Center",
        chips: ["CLI", "IDE", "web", "app"],
        title: "터미널에서 시작해도<br />앱에서 이어가요",
        body: "CLI, IDE, 웹, 앱을 오가면서<br />작업 흐름을 계속 이어가는 구조예요.<br />창 바꾼다고 처음부터 설명 안 해도 되는 쪽.",
      },
      {
        visual: "workflow",
        label: "업무 자동화",
        chips: ["이슈 정리", "알림 확인", "CI/CD"],
        title: "사람 잡아먹는<br />반복일은 뒤로",
        body: "이슈 정리, 알림 확인, CI/CD 점검처럼<br />매번 손 가는 일을<br />Codex가 뒤에서 맡는 그림이에요.",
      },
      {
        image: "codex-docs.png",
        label: "관리 포인트",
        chips: ["권한", "데이터", "컴플라이언스"],
        title: "회사에서 쓰려면<br />권한부터 봐야 해요",
        body: "누가 어떤 저장소를 보는지,<br />작업 기록이 어디 남는지,<br />관리자가 확인할 수 있어야 팀에서 써요.",
      },
      {
        visual: "checklist",
        label: "저장용 체크",
        chips: ["저장", "공유", "팀 적용"],
        title: "팀 도입 전<br />이 3개만 체크",
        body: "반복 업무가 진짜 있는지.<br />접근 허용할 저장소가 어디인지.<br />마지막 리뷰를 누가 볼지.",
      },
    ],
    caption: `회사 개발팀에서 Codex 쓰는 그림이 조금 달라지고 있어욤 🧑‍💻

예전엔 “코드 좀 짜줘”에 가까웠다면,
이제는 기능 개발, 버그 수정, 코드 리뷰, 반복 점검 같은 일을 여러 Codex에게 나눠 맡기는 쪽으로 가고 있어요.

쉽게 말하면,
혼자 물어보는 코딩 챗봇이 아니라
작은 개발 작업판처럼 커지는 중입니다.

다만 회사에서 쓰려면 “잘하냐?”보다 먼저 봐야 할 게 있어요.

① 어떤 저장소까지 접근시킬지
② 작업 기록이 어디에 남는지
③ 사람이 마지막 리뷰를 볼 수 있는지

이 3개 없이 “일단 써보자” 하면 나중에 마음 아파질 수 있어욤 ㅠ

Contents Editor · AI쭌
Source · OpenAI / OpenAI Help Center

Codex 공식 페이지: https://openai.com/codex/
Codex 도움말: https://help.openai.com/en/articles/11369540-codex-in-chatgpt

#Codex #OpenAI #AI코딩 #개발자뉴스 #AI뉴스 #업무자동화 #코딩에이전트 #AI쭌`,
  },
  {
    slug: "2026-05-01-codex-cli-goals",
    title: "Codex CLI Goals",
    urls: {
      changelog: "https://changelogs.directory/tools/codex/releases/0.128.0",
      simon: "https://simonwillison.net/2026/Apr/30/codex-goals/",
      release: "https://newreleases.io/project/github/openai/codex/release/rust-v0.128.0",
      github: "https://github.com/openai/codex/releases/tag/rust-v0.128.0",
    },
    captures: [
      ["changelog", "https://changelogs.directory/tools/codex/releases/0.128.0", "codex-0128-changelog.png"],
      ["simon", "https://simonwillison.net/2026/Apr/30/codex-goals/", "simon-codex-goals.png"],
      ["release", "https://newreleases.io/project/github/openai/codex/release/rust-v0.128.0", "codex-release.png"],
    ],
    cards: [
      {
        kind: "cover",
        image: "codex-0128-changelog.png",
        tag: "AI NEWS | CLI",
        title: "목표 하나 던지면<br />끝까지 물고<br />간다고?",
        sub: "Codex CLI `/goal`, 긴 작업 맡기는 방식이 바뀌었어요.",
        source: "Codex 0.128.0 changelog",
      },
      {
        image: "codex-0128-changelog.png",
        label: "0.128.0",
        chips: ["/goal", "pause", "resume"],
        title: "`/goal`은 쉽게 말해<br />끝날 때까지 해줘",
        body: "목표를 한 번 걸어두면<br />Codex가 계획하고, 고치고, 테스트하면서<br />다음 단계로 계속 이어가는 방식이에요.",
      },
      {
        visual: "terminalGoal",
        label: "모션 예시",
        chips: ["plan", "test", "continue"],
        title: "명령 한 줄이<br />작업 지시서가 돼요",
        body: "`/goal`을 던지면<br />계획 → 수정 → 테스트 → 계속 진행.<br />이 흐름을 Codex가 붙잡고 가요.",
        motion: true,
      },
      {
        image: "simon-codex-goals.png",
        label: "외부 해석",
        chips: ["Ralph loop", "budget", "continue"],
        title: "개발자들이<br />바로 반응한 이유",
        body: "이건 그냥 새 명령어가 아니라<br />AI가 목표를 놓치지 않고<br />계속 굴러가는 쪽에 가까워요.",
      },
      {
        visual: "controls",
        label: "TUI 컨트롤",
        chips: ["create", "pause", "resume", "clear"],
        title: "중간에 멈춰도<br />다시 이어갑니다",
        body: "긴 작업은 한 번에 안 끝나요.<br />그래서 만들고, 멈추고, 다시 이어가는<br />버튼들이 같이 들어왔어요.",
      },
      {
        image: "codex-release.png",
        label: "릴리스 노트",
        chips: ["plugins", "permissions", "update"],
        title: "이번 업데이트,<br />한 줄짜리 아니에요",
        body: "플러그인, 권한 프로필,<br />`codex update`까지 같이 들어왔어요.<br />CLI가 점점 운영 도구처럼 변하는 중.",
      },
      {
        visual: "checklist",
        label: "저장용 체크",
        chips: ["업데이트", "권한", "긴 작업"],
        title: "바로 켜기 전<br />이 3개만 체크",
        body: "Codex CLI 버전 확인.<br />긴 작업에만 `/goal` 쓰기.<br />권한은 낮게 시작하기.",
      },
    ],
    caption: `Codex CLI 쓰는 분들, 이번 \`/goal\` 업데이트는 꽤 맛있습니다욤.

쉽게 말하면,
“이 목표 끝날 때까지 계속 해줘”를 Codex에게 걸어두는 기능이에요.

예전엔 중간중간 다시 설명하고 방향 잡아줘야 했다면,
이제는 계획 → 수정 → 테스트 → 이어가기 흐름을 더 오래 붙잡고 가는 쪽으로 바뀌는 중입니다.

다만 이거 막 켜놓고 맡기면 안 돼요.
긴 작업일수록 권한, 예산, 테스트 범위를 먼저 작게 잡아야 합니다.

켜보기 전 체크 3개만 기억해두세욤.

① Codex CLI 버전 확인
② \`/goal\`은 긴 작업에만 사용
③ 권한 프로필은 낮게 시작

AI 코딩툴이 이제 “대답하는 도구”에서
“목표를 물고 일하는 도구”로 넘어가는 느낌이에요.

Contents Editor · AI쭌
Source · Codex changelog / Simon Willison / newreleases

Codex 0.128.0 changelog: https://changelogs.directory/tools/codex/releases/0.128.0
Simon Willison 정리: https://simonwillison.net/2026/Apr/30/codex-goals/

#CodexCLI #Codex #OpenAI #AI코딩 #개발자뉴스 #AI뉴스 #코딩에이전트 #AI쭌`,
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

function ensureProject(project) {
  const dir = path.join(PROJECT_ROOT, project.slug);
  for (const child of ["cards", "motion", "output"]) {
    rmSync(path.join(dir, child), { recursive: true, force: true });
  }
  for (const child of ["assets/fonts", "assets/images", "cards", "motion", "output"]) {
    mkdirSync(path.join(dir, child), { recursive: true });
  }
  for (const name of ["Griun_Mongtori-Rg.ttf", "Moneygraphy-Rounded.woff2"]) {
    const src = path.join(FONT_SOURCE, name);
    if (existsSync(src)) copyFileSync(src, path.join(dir, "assets", "fonts", name));
  }
  return dir;
}

async function capture(browser, project, dir) {
  for (const [, url, filename] of project.captures) {
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
      await new Promise((resolve) => setTimeout(resolve, 900));
      await page.screenshot({
        path: path.join(dir, "assets", "images", filename),
        fullPage: false,
      });
    } catch (error) {
      console.warn(`capture failed ${url}: ${error.message}`);
      writeFallbackImage(dir, filename, project.title, url);
    } finally {
      await page.close();
    }
  }
}

function writeFallbackImage(dir, filename, title, url) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1380" height="1100">
  <defs>
    <style>
      @font-face{font-family:Money;src:url("../fonts/Moneygraphy-Rounded.woff2") format("woff2");font-weight:700}
      text{font-family:Money, Arial, sans-serif}
    </style>
  </defs>
  <rect width="1380" height="1100" fill="#0d1117"/>
  <rect x="70" y="80" width="1140" height="760" rx="34" fill="#161b22" stroke="#30363d"/>
  <text x="120" y="180" fill="#f0f6fc" font-size="58">${escapeHtml(title)}</text>
  <text x="120" y="270" fill="#65ffdc" font-size="34">${escapeHtml(url)}</text>
  <text x="120" y="370" fill="#8b949e" font-size="34">source screenshot fallback</text>
  </svg>`;
  writeFileSync(path.join(dir, "assets", "images", filename), svg, "utf8");
}

function writeGeneratedVisuals(project, dir) {
  if (project.slug !== "2026-05-01-codex-for-work") return;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1380" height="1100" viewBox="0 0 1380 1100">
  <defs>
    <style>
      @font-face{font-family:Money;src:url("../fonts/Moneygraphy-Rounded.woff2") format("woff2");font-weight:700}
      text{font-family:Money, Arial, sans-serif}
    </style>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#101827"/>
      <stop offset=".45" stop-color="#111318"/>
      <stop offset="1" stop-color="#03382f"/>
    </linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="14" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="1380" height="1100" fill="url(#bg)"/>
  <g opacity=".22" stroke="#fff">
    <path d="M0 170H1380M0 340H1380M0 510H1380M0 680H1380M0 850H1380"/>
    <path d="M180 0V1100M360 0V1100M540 0V1100M720 0V1100M900 0V1100M1080 0V1100M1260 0V1100"/>
  </g>
  <rect x="120" y="105" width="1140" height="780" rx="42" fill="#0b0f16" stroke="#ffffff55" stroke-width="2"/>
  <rect x="120" y="105" width="1140" height="82" rx="42" fill="#151a23"/>
  <circle cx="168" cy="146" r="11" fill="#ff5f56"/><circle cx="202" cy="146" r="11" fill="#ffbd2e"/><circle cx="236" cy="146" r="11" fill="#27c93f"/>
  <g transform="translate(170 250)">
    <rect width="300" height="450" rx="30" fill="#151a23" stroke="#ffffff33"/>
    <text x="34" y="70" fill="#65ffdc" font-size="34" font-weight="700">Agent 1</text>
    <text x="34" y="128" fill="#fff" font-size="30">기능 작업</text>
    <rect x="34" y="180" width="220" height="22" rx="11" fill="#65ffdc"/>
    <rect x="34" y="225" width="180" height="18" rx="9" fill="#ffffff55"/>
    <rect x="34" y="265" width="240" height="18" rx="9" fill="#ffffff33"/>
  </g>
  <g transform="translate(540 250)">
    <rect width="300" height="450" rx="30" fill="#151a23" stroke="#65ffdc88" filter="url(#glow)"/>
    <text x="34" y="70" fill="#65ffdc" font-size="34" font-weight="700">Agent 2</text>
    <text x="34" y="128" fill="#fff" font-size="30">버그 + 테스트</text>
    <rect x="34" y="180" width="230" height="22" rx="11" fill="#65ffdc"/>
    <rect x="34" y="225" width="250" height="18" rx="9" fill="#ffffff55"/>
    <rect x="34" y="265" width="160" height="18" rx="9" fill="#ffffff33"/>
  </g>
  <g transform="translate(910 250)">
    <rect width="300" height="450" rx="30" fill="#151a23" stroke="#ffffff33"/>
    <text x="34" y="70" fill="#65ffdc" font-size="34" font-weight="700">Agent 3</text>
    <text x="34" y="128" fill="#fff" font-size="30">리뷰</text>
    <rect x="34" y="180" width="180" height="22" rx="11" fill="#65ffdc"/>
    <rect x="34" y="225" width="250" height="18" rx="9" fill="#ffffff55"/>
    <rect x="34" y="265" width="210" height="18" rx="9" fill="#ffffff33"/>
  </g>
  <text x="170" y="810" fill="#f7f7f8" font-size="44" font-weight="700">한 저장소에서 여러 작업을 나눠 맡김</text>
  <text x="170" y="870" fill="#a8b3c7" font-size="30">worktrees · cloud environments · reviewable changes</text>
</svg>`;
  writeFileSync(path.join(dir, "assets", "images", "codex-workspace-visual.svg"), svg, "utf8");
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
.cover-img{position:absolute;inset:-16px 0 0;width:100%;height:900px;object-fit:cover;object-position:top center;filter:saturate(1.08) contrast(1.04)}
.cover-dim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.08) 0%,rgba(0,0,0,.4) 50%,#000 80%)}
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
.terminal{position:absolute;z-index:4;left:70px;right:70px;top:62px;bottom:88px;border-radius:26px;background:#0d1117;border:1px solid rgba(255,255,255,.2);box-shadow:0 30px 80px rgba(0,0,0,.46);padding:34px;font-family:Consolas,monospace;color:#dbeafe;font-size:30px;line-height:1.52}
.dot{display:inline-block;width:16px;height:16px;border-radius:50%;margin-right:8px}.red{background:#ff5f56}.yellow{background:#ffbd2e}.green{background:#27c93f}
.prompt{color:#65ffdc}.pass{color:#7dffb2}.dim{color:#7d8590}
.agent-grid{position:absolute;z-index:4;left:70px;right:70px;top:72px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:22px}
.agent{height:340px;border-radius:28px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.08);padding:28px}.agent b{display:block;font-size:40px}.agent span{display:block;margin-top:20px;font-size:28px;line-height:1.3;color:rgba(255,255,255,.82)}
.lane{position:absolute;z-index:4;left:80px;right:80px;padding:25px;border-radius:24px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);font-size:36px}.lane b{color:#65ffdc}.lane.l1{top:76px}.lane.l2{top:210px}.lane.l3{top:344px}
.controls-row{position:absolute;z-index:4;left:86px;right:86px;top:135px;display:grid;grid-template-columns:repeat(4,1fr);gap:18px}.ctrl{height:210px;border-radius:26px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;text-align:center;font-size:34px}.ctrl:nth-child(2){border-color:#65ffdc99}
.checklist{position:absolute;z-index:4;left:90px;right:90px;top:92px}.check{margin-bottom:26px;padding:28px;border-radius:26px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);font-size:38px}.check b{color:#65ffdc}
`;
}

function mediaHtml(card) {
  const chips = (card.chips || []).map((chip) => `<span>${escapeHtml(chip)}</span>`).join("");
  if (card.image) {
    return `<div class="media"><img class="media-img" src="../assets/images/${escapeHtml(card.image)}" alt=""><div class="label">${escapeHtml(card.label)}</div><div class="chips">${chips}</div></div>`;
  }
  if (card.visual === "multiAgent") {
    return `<div class="media"><div class="visual"><div class="agent-grid">
      <div class="agent"><b>Agent 1</b><span>새 기능<br>브랜치 생성</span></div>
      <div class="agent"><b>Agent 2</b><span>버그 수정<br>테스트 실행</span></div>
      <div class="agent"><b>Agent 3</b><span>PR 리뷰<br>문서 정리</span></div>
    </div><div class="label">${escapeHtml(card.label)}</div><div class="chips">${chips}</div></div></div>`;
  }
  if (card.visual === "workflow") {
    return `<div class="media"><div class="visual">
      <div class="lane l1"><b>1</b> 이슈 triage</div>
      <div class="lane l2"><b>2</b> 알림 monitor</div>
      <div class="lane l3"><b>3</b> CI/CD 점검</div>
      <div class="label">${escapeHtml(card.label)}</div><div class="chips">${chips}</div>
    </div></div>`;
  }
  if (card.visual === "surfaces") {
    return `<div class="media"><div class="visual">
      <div class="controls-row"><div class="ctrl">CLI</div><div class="ctrl">IDE</div><div class="ctrl">web</div><div class="ctrl">app</div></div>
      <div class="label">${escapeHtml(card.label)}</div><div class="chips">${chips}</div>
    </div></div>`;
  }
  if (card.visual === "terminalGoal") {
    return `<div class="media"><div class="visual">
      <div class="terminal"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span><br><br>
        <span class="prompt">$</span> codex<br>
        <span class="prompt">></span> /goal "리팩터링 끝날 때까지 테스트 통과"<br><br>
        <span class="dim">plan -> edit -> test -> continue</span><br>
        <span class="pass">goal kept alive</span>
      </div>
      <div class="label">${escapeHtml(card.label)}</div><div class="chips">${chips}</div>
    </div></div>`;
  }
  if (card.visual === "controls") {
    return `<div class="media"><div class="visual">
      <div class="controls-row"><div class="ctrl">create</div><div class="ctrl">pause</div><div class="ctrl">resume</div><div class="ctrl">clear</div></div>
      <div class="label">${escapeHtml(card.label)}</div><div class="chips">${chips}</div>
    </div></div>`;
  }
  if (card.visual === "checklist") {
    return `<div class="media"><div class="visual"><div class="checklist">
      <div class="check"><b>1</b> 버전 확인</div>
      <div class="check"><b>2</b> 권한 낮게 시작</div>
      <div class="check"><b>3</b> 사람이 최종 리뷰</div>
    </div><div class="label">${escapeHtml(card.label)}</div><div class="chips">${chips}</div></div></div>`;
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

function motionHtml(project, card, index) {
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../style.css"><style>
.type{white-space:pre}.cursor{display:inline-block;width:14px;height:34px;background:#65ffdc;vertical-align:-5px;animation:blink .7s infinite}@keyframes blink{50%{opacity:.1}}
.agent{transform:translateY(var(--dy,0));opacity:var(--op,1)}.agent:nth-child(1){--dy:calc(26px - var(--p,0)*26px);--op:var(--p,1)}.agent:nth-child(2){--dy:calc(32px - var(--p2,0)*32px);--op:var(--p2,1)}.agent:nth-child(3){--dy:calc(38px - var(--p3,0)*38px);--op:var(--p3,1)}
</style></head><body>${cardHtml(card, index).match(/<article[\s\S]*<\/article>/)[0]}
<script>
const t = Number(new URLSearchParams(location.search).get("t") || 0);
document.documentElement.style.setProperty("--p", Math.max(0, Math.min(1, t / .6)));
document.documentElement.style.setProperty("--p2", Math.max(0, Math.min(1, (t-.45) / .6)));
document.documentElement.style.setProperty("--p3", Math.max(0, Math.min(1, (t-.9) / .6)));
</script></body></html>`;
}

async function renderHtml(page, htmlPath, outputPath) {
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
  await page.screenshot({ path: outputPath, type: "png" });
}

async function renderMotion(browser, project, dir) {
  const motionCardIndex = project.cards.findIndex((card) => card.motion);
  if (motionCardIndex < 0) return;
  const card = project.cards[motionCardIndex];
  const cardNum = String(motionCardIndex + 1).padStart(2, "0");
  const motionDir = path.join(dir, "motion", `card-${cardNum}`);
  const framesDir = path.join(motionDir, "frames");
  rmSync(framesDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });
  const motionPath = path.join(motionDir, "index.html");
  writeFileSync(motionPath, motionHtml(project, card, motionCardIndex), "utf8");

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
    path: path.join(dir, "output", `card-${cardNum}-motion-preview.png`),
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
      path.join(dir, "output", `card-${cardNum}-motion.mp4`),
    ],
    { stdio: "ignore" },
  );
}

function writeDocs(project, dir) {
  const sourceLines = Object.entries(project.urls)
    .map(([key, url]) => `- ${key}: ${url}`)
    .join("\n");
  const mediaLines = project.captures
    .map(([, url, filename]) => `- \`${filename}\`: ${url}`)
    .join("\n");
  const storyboard = project.cards
    .map((card, index) => `${index + 1}. ${card.title.replaceAll("<br />", " ")}\n   - Visual: ${card.image || card.visual}\n   - Job: ${card.label || card.tag || "cover"}`)
    .join("\n\n");
  writeFileSync(path.join(dir, "source.md"), `# ${project.title} Source\n\n${sourceLines}\n`, "utf8");
  writeFileSync(path.join(dir, "source-pack.md"), `# Source Pack\n\n## Media\n\n${mediaLines}\n\n## Design Rule\n\nUse the HERMES Editorial Pattern: one clear visual job per card, short human copy, and at least one motion proof card.\n`, "utf8");
  writeFileSync(path.join(dir, "brief.md"), `# Brief\n\nAI쭌 채널용 AI/developer news carousel. Explain the topic in practical Korean, avoid PPT-style summaries, and make each card visually useful before reading.\n`, "utf8");
  writeFileSync(path.join(dir, "storyboard.md"), `# Storyboard\n\n${storyboard}\n`, "utf8");
  writeFileSync(path.join(dir, "motion-plan.md"), `# Motion Plan\n\nMotion card: ${project.cards.findIndex((card) => card.motion) + 1}. Use HTML-native movement to clarify the workflow, then render MP4.\n`, "utf8");
  writeFileSync(path.join(dir, "design.md"), `# Design\n\n- 1080x1350 Instagram 4:5.\n- HERMES Editorial Pattern.\n- Real screenshots on cover/body cards.\n- Dark editorial text block, large Korean headlines, short body copy.\n- Motion preview must match static typography.\n`, "utf8");
  writeFileSync(path.join(dir, "instagram-caption.md"), project.caption, "utf8");
}

function writeIndex(project, dir) {
  const items = project.cards
    .map((_, i) => {
      const num = String(i + 1).padStart(2, "0");
      const motionPath = path.join(dir, "output", `card-${num}-motion.mp4`);
      const motion = existsSync(motionPath)
        ? `<video controls muted loop src="output/card-${num}-motion.mp4"></video>`
        : "";
      return `<section><h2>Card ${i + 1}</h2><img src="output/card-${num}.png" alt="card ${i + 1}">${motion}</section>`;
    })
    .join("\n");
  writeFileSync(
    path.join(dir, "index.html"),
    `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(project.title)}</title><style>body{margin:0;background:#111;color:#fff;font-family:system-ui,sans-serif;padding:32px}h1{font-size:34px}section{margin:0 0 44px}h2{font-size:22px;color:#65ffdc}img,video{display:block;width:min(420px,100%);border:1px solid #333;margin-bottom:14px}</style></head><body><h1>${escapeHtml(project.title)} v2</h1>${items}</body></html>`,
    "utf8",
  );
}

async function renderProject(browser, project) {
  const dir = ensureProject(project);
  writeFileSync(path.join(dir, "style.css"), css(), "utf8");
  writeDocs(project, dir);
  writeGeneratedVisuals(project, dir);
  await capture(browser, project, dir);
  for (let i = 0; i < project.cards.length; i += 1) {
    const num = String(i + 1).padStart(2, "0");
    const htmlPath = path.join(dir, "cards", `card-${num}.html`);
    writeFileSync(htmlPath, cardHtml(project.cards[i], i), "utf8");
    const page = await browser.newPage();
    await page.setViewport({ width: CARD_W, height: CARD_H, deviceScaleFactor: 1 });
    await renderHtml(page, htmlPath, path.join(dir, "output", `card-${num}.png`));
    await page.close();
  }
  await renderMotion(browser, project, dir);
  writeIndex(project, dir);
  console.log(`rendered ${project.slug}`);
}

async function main() {
  const { default: puppeteer } = await import(pathToFileURL(PUPPETEER_PATH).href);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
  });
  for (const project of projects) {
    await renderProject(browser, project);
  }
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
