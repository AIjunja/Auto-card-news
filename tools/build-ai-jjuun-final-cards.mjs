import { execFileSync } from "child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
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
const FFMPEG_CANDIDATES = [
  path.join(
    PROJECT_ROOT,
    "2026-04-29-claude-creative-work",
    "node_modules",
    "@remotion",
    "compositor-win32-x64-msvc",
    "ffmpeg.exe",
  ),
  path.join(TEMPLATE_PROJECT, "motion", "card-02-prompt-reveal", "ffmpeg.exe"),
  path.join(TEMPLATE_PROJECT, "motion", "card-04-output-shape", "ffmpeg.exe"),
  path.join(TEMPLATE_PROJECT, "motion", "prompt-typing", "ffmpeg.cmd"),
];

const CARD_W = 1080;
const CARD_H = 1350;
const FPS = 12;
const MOTION_SECONDS = 3.4;

const topics = [
  {
    slug: "2026-05-01-codex-for-work",
    category: "AI NEWS | WORK",
    brand: "OpenAI Codex",
    sourceLabel: "OpenAI",
    sourceLinks: ["https://chatgpt.com/codex/for-work/"],
    accent: "#65ffdc",
    warm: "#f7d46b",
    motionCard: 4,
    motionKind: "rows",
    cards: [
      {
        kind: "cover",
        title: "Codex, 이제<br />회사 일까지<br />맡길 수 있어요",
        sub: "보고서·시트·메일 정리,<br />코딩 말고 진짜 업무 쪽으로 왔어욤",
        visual: "workdesk",
      },
      {
        title: "코드만 보던 애가<br />문서까지 봅니다",
        body: "캘린더, 메일, 문서, 시트를 보고<br />요약·초안·정리까지 한 번에 묶어줘요.",
        visual: "documents",
        chips: ["문서", "시트", "메일", "요약"],
      },
      {
        title: "매주 보고서 쓰는 분들<br />이거 좀 편해져요",
        body: "흩어진 자료를 읽고<br />우선순위·리스크·다음 할 일로 정리합니다.",
        visual: "weekly",
        chips: ["우선순위", "리스크", "팔로업"],
      },
      {
        title: "설문 정리도<br />바로 표로 뽑기",
        body: "응답을 읽고, 주제별로 묶고<br />다음 질문까지 뽑아주는 흐름이에요.",
        visual: "survey",
        chips: ["분류", "요약", "다음 질문"],
      },
      {
        title: "그냥 챗봇이랑<br />뭐가 다르냐면요",
        body: "어디를 봐야 하는지 범위를 주고<br />결과를 파일 형태로 받는 쪽에 가까워요.",
        visual: "scope",
        chips: ["범위 지정", "파일 결과", "승인"],
      },
      {
        title: "그래도 최종 확인은<br />사람이 해야 해요",
        body: "공유·전송·실행은 승인 후.<br />내 일을 멋대로 보내는 구조는 아니에요.",
        visual: "approval",
        chips: ["검토", "승인", "공유 전 확인"],
      },
      {
        title: "처음엔 작은 일 하나만<br />맡겨보세요",
        body: "예: 이번 주 자료 보고<br />팀 업데이트 초안 만들어줘욤.",
        visual: "checklist",
        chips: ["저장", "작게 테스트", "업무 자동화"],
      },
    ],
    caption: `Codex가 이제 “코딩 도우미”에서 조금 더 회사 일 쪽으로 넓어지고 있어욤.\n\n핵심은 간단해요.\n문서, 시트, 메일, 캘린더처럼 흩어진 업무 자료를 보고\n요약·초안·정리·팔로업까지 도와주는 방향입니다.\n\n처음부터 큰 업무를 맡기기보단\n“이번 주 자료 보고 팀 업데이트 초안 만들어줘”처럼\n작은 반복 업무 하나부터 테스트해보면 좋아욤.\n\n저장해두고, 팀에서 반복되는 업무 하나 골라보세욤 👀\n\nContents Editor · AI쭌\nSource · OpenAI Codex\n써보시려면 여기 참고해보세욤: https://chatgpt.com/codex/for-work/`,
  },
  {
    slug: "2026-05-01-grok-4-3",
    category: "AI NEWS | MODEL",
    brand: "xAI Grok",
    sourceLabel: "xAI Docs",
    sourceLinks: [
      "https://docs.x.ai/developers/models/grok-4.3",
      "https://docs.x.ai/developers/cost-tracking",
    ],
    accent: "#8bdcff",
    warm: "#65ffdc",
    motionCard: 4,
    motionKind: "meter",
    cards: [
      {
        kind: "cover",
        title: "Grok 4.3<br />바로 갈아타도<br />될까?",
        sub: "모델 이름보다 먼저 볼 건<br />비용·도구·운영이에요.",
        visual: "grok",
      },
      {
        title: "새 모델 소식보다<br />내 서비스에 맞는지가 먼저",
        body: "chat API로 쓰기 전<br />무슨 일에 붙일지부터 정해야 해요.",
        visual: "model",
        chips: ["chat", "API", "서비스 적용"],
      },
      {
        title: "1번 체크<br />어디에 쓸 건데요?",
        body: "채팅? 검색? 코드 실행?<br />붙이는 기능에 따라 비용도 달라져요.",
        visual: "usecase",
        chips: ["채팅", "검색", "코드 실행"],
      },
      {
        title: "도구 붙이면<br />비용도 같이 움직여요",
        body: "웹 검색, X 검색, 코드 실행처럼<br />서버 쪽 도구까지 쓰면 계산을 봐야 해요.",
        visual: "tools",
        chips: ["Web Search", "X Search", "Code"],
      },
      {
        title: "xAI는 요청마다<br />비용을 찍어줍니다",
        body: "`cost_in_usd_ticks`로<br />이 요청이 얼마였는지 바로 확인 가능해요.",
        visual: "json",
        chips: ["cost_in_usd_ticks", "요청별 비용"],
      },
      {
        title: "갈아타기는 감성이 아니라<br />계산이에요",
        body: "빠르다보다 중요한 건<br />우리 서비스에서 안정적인가예요.",
        visual: "calc",
        chips: ["속도", "비용", "안정성"],
      },
      {
        title: "테스트 전<br />3가지만 저장",
        body: "용도, 도구 비용, 요청별 비용.<br />이 3개만 보면 훨씬 덜 흔들려요.",
        visual: "checklist",
        chips: ["용도", "도구 비용", "요청별 비용"],
      },
    ],
    caption: `Grok 4.3 소식 볼 때 “오 새 모델!”에서 끝나면 살짝 아까워욤.\n\n실제로 붙이기 전엔 3가지를 먼저 보면 좋아요.\n\n① 어디에 쓸 건지\n② 웹 검색·X 검색·코드 실행 같은 도구를 붙일 건지\n③ 요청 1번에 실제 얼마가 나오는지\n\n특히 xAI 문서에는 요청별 비용을 \`cost_in_usd_ticks\`로 확인하는 예시가 있어서\n개발자/서비스 운영자는 이 부분 먼저 체크하면 좋아욤.\n\n저장해두고 모델 바꾸기 전 체크리스트로 써보세욤 ✍️\n\nContents Editor · AI쭌\nSource · xAI Docs\n모델 문서: https://docs.x.ai/developers/models/grok-4.3\n비용 추적 문서: https://docs.x.ai/developers/cost-tracking`,
  },
  {
    slug: "2026-05-01-codex-cli-goals",
    category: "AI NEWS | CODE",
    brand: "Codex CLI",
    sourceLabel: "OpenAI GitHub",
    sourceLinks: [
      "https://github.com/openai/codex/releases/tag/rust-v0.128.0",
      "https://developers.openai.com/codex/cli",
    ],
    accent: "#f7d46b",
    warm: "#65ffdc",
    motionCard: 1,
    motionKind: "typing",
    cards: [
      {
        kind: "cover",
        title: "Codex, 이제<br />목표를 저장하고<br />계속 갑니다",
        sub: "`/goal` 기능이 Codex CLI 0.128.0에 들어왔어요.",
        visual: "terminal",
      },
      {
        title: "`/goal`은<br />작업 목표 메모장",
        body: "한 턴짜리 요청이 아니라<br />끝날 때까지 붙잡는 목표에 가까워요.",
        visual: "goal",
        chips: ["/goal", "create", "resume"],
      },
      {
        title: "중간에 끊겨도<br />다시 설명이 줄어요",
        body: "목표가 남아있으면<br />이어서 작업하기가 훨씬 쉬워져요.",
        visual: "resume",
        chips: ["pause", "resume", "clear"],
      },
      {
        title: "이럴 때<br />먼저 써보세욤",
        body: "테스트 고치기, 리팩터 마무리,<br />문서 업데이트처럼 끝이 보이는 일.",
        visual: "tasks",
        chips: ["테스트", "리팩터", "문서"],
      },
      {
        title: "단, 목표는<br />작게 잡아야 해요",
        body: "너무 크게 잡으면<br />AI도 방향을 잃기 쉬워요.",
        visual: "small",
        chips: ["작게", "명확하게", "끝 상태"],
      },
      {
        title: "이제 중요한 건<br />프롬프트보다 목표 설계",
        body: "AI가 헷갈리지 않게<br />끝 상태를 또렷하게 주는 게 포인트예요.",
        visual: "map",
        chips: ["목표", "조건", "완료 기준"],
      },
      {
        title: "첫 `/goal` 예시",
        body: "“이 테스트 파일 하나 통과시키고<br />변경 이유까지 정리해줘.”",
        visual: "checklist",
        chips: ["저장", "작게 시작", "끝까지"],
      },
    ],
    caption: `Codex CLI 쓰는 분들, \`/goal\` 이거 꽤 맛있어 보입니다욤.\n\n한 번 말하고 끝나는 요청이 아니라\n“이 작업은 여기까지 끝내자”는 목표를 저장해두고\n이어가는 쪽에 가까워요.\n\n처음부터 큰 프로젝트 전체를 맡기기보단\n테스트 하나, 문서 하나, 리팩터 한 범위처럼\n끝이 보이는 작업부터 잡는 게 좋아요.\n\n첫 예시는 이렇게요.\n“이 테스트 파일 하나 통과시키고 변경 이유까지 정리해줘.”\n\nContents Editor · AI쭌\nSource · OpenAI Codex GitHub / OpenAI Developers\n릴리스 노트: https://github.com/openai/codex/releases/tag/rust-v0.128.0\nCodex CLI 문서: https://developers.openai.com/codex/cli`,
  },
  {
    slug: "2026-05-01-claude-security-public-beta",
    category: "AI NEWS | SECURITY",
    brand: "Claude Security",
    sourceLabel: "Anthropic",
    sourceLinks: ["https://claude.com/product/claude-security#public-beta"],
    accent: "#65ffdc",
    warm: "#ff7a66",
    motionCard: 1,
    motionKind: "security",
    cards: [
      {
        kind: "cover",
        title: "보안 알림,<br />너무 많아서<br />뭐부터 볼지 모르겠다면",
        sub: "Claude Security가 public beta로 나왔어욤.",
        visual: "security",
      },
      {
        title: "Claude Security는<br />코드 보안 점검 도구",
        body: "코드베이스를 훑고<br />취약점 후보를 찾아주는 쪽이에요.",
        visual: "scan",
        chips: ["scan", "finding", "patch"],
      },
      {
        title: "찾기만 하는 게 아니라<br />한번 더 의심합니다",
        body: "결과를 바로 던지는 대신<br />검증 단계를 거쳐 헛경고를 줄이려 해요.",
        visual: "verify",
        chips: ["검증", "헛경고 감소", "우선순위"],
      },
      {
        title: "수정안까지 주지만<br />적용은 사람이 해요",
        body: "패치를 제안하고<br />팀이 리뷰한 뒤 승인하는 구조예요.",
        visual: "patch",
        chips: ["제안", "리뷰", "승인"],
      },
      {
        title: "Slack·Jira로<br />흘려보낼 수 있어요",
        body: "보안팀이 쓰는 흐름 안으로<br />결과를 보내는 방식입니다.",
        visual: "workflow",
        chips: ["Slack", "Jira", "Webhook"],
      },
      {
        title: "핵심은 알림을<br />줄이는 게 아니라 골라내는 것",
        body: "진짜 고쳐야 할 것만<br />더 빨리 보자는 이야기예요.",
        visual: "signal",
        chips: ["noise", "signal", "fix"],
      },
      {
        title: "팀 보안 담당이면<br />공식 페이지 먼저 확인",
        body: "Enterprise public beta라서<br />조건과 연결 방식을 먼저 봐야 해요.",
        visual: "checklist",
        chips: ["Enterprise", "Public Beta", "공식 문서"],
      },
    ],
    caption: `보안 알림이 너무 많으면 진짜 중요한 것까지 같이 묻히잖아요.\n\nClaude Security는 코드베이스를 훑고,\n취약점 후보를 찾고,\n검증하고,\n패치 제안까지 이어주는 방향의 도구예요.\n\n중요한 건 “AI가 알아서 고친다”가 아니라\n팀이 리뷰하고 승인할 수 있게 만드는 구조라는 점입니다욤.\n\n보안팀/개발팀에서 코드 점검 흐름 고민 중이면 저장해두세욤 🔐\n\nContents Editor · AI쭌\nSource · Anthropic Claude Security\n공식 페이지: https://claude.com/product/claude-security#public-beta`,
  },
  {
    slug: "2026-05-01-claude-code-hermes-billing",
    category: "AI NEWS | CODE",
    brand: "Claude Code",
    sourceLabel: "GitHub Issue",
    sourceLinks: [
      "https://github.com/anthropics/claude-code/issues/53262",
      "https://techcrunch.com/2026/04/04/anthropic-says-claude-code-subscribers-will-need-to-pay-extra-for-openclaw-support/",
    ],
    accent: "#ff7a66",
    warm: "#f7d46b",
    motionCard: 2,
    motionKind: "billing",
    cards: [
      {
        kind: "cover",
        title: "커밋 메시지 하나가<br />과금 경로를<br />바꿨다고요?",
        sub: "Claude Code 이슈 #53262에서 올라온 재현 보고예요.",
        visual: "billing",
      },
      {
        title: "문제의 문자는<br />`HERMES.md`",
        body: "파일이 아니라 최근 커밋 메시지에<br />들어간 문자열이 트리거였다는 보고예요.",
        visual: "commit",
        chips: ["commit", "HERMES.md", "extra usage"],
      },
      {
        title: "진짜 포인트<br />파일명이 아니에요",
        body: "디스크에 있는 파일보다<br />커밋 기록에 남은 문자가 문제였다는 점.",
        visual: "filevscommit",
        chips: ["파일 아님", "커밋 기록", "대소문자"],
      },
      {
        title: "증상은<br />더 헷갈립니다",
        body: "기본 플랜은 남아있는데<br />extra usage 오류가 뜬 사례였어요.",
        visual: "meter",
        chips: ["plan quota", "extra usage", "400 error"],
      },
      {
        title: "OpenClaw 과금 이슈랑은<br />분리해서 봐야 해요",
        body: "정책 논쟁과 별개로<br />이건 특정 문자열 재현 버그 보고입니다.",
        visual: "lanes",
        chips: ["버그 보고", "정책 이슈", "분리"],
      },
      {
        title: "AI 코딩툴은<br />코드만 보는 게 아닙니다",
        body: "커밋 기록, 프롬프트, 실행 환경까지<br />맥락으로 들어갈 수 있어요.",
        visual: "context",
        chips: ["커밋", "프롬프트", "환경"],
      },
      {
        title: "Claude Code 쓰면<br />이 3개만 확인",
        body: "최근 커밋 메시지, 사용량 페이지,<br />그리고 에러 문구를 같이 보세요.",
        visual: "checklist",
        chips: ["커밋", "사용량", "에러"],
      },
    ],
    caption: `Claude Code 쓰는 분들, 이 이슈는 저장해두면 좋아요.\n\nGitHub 이슈 #53262에서 보고된 내용은\n파일 자체가 아니라 최근 커밋 메시지에 \`HERMES.md\`라는 문자열이 있을 때\n요청이 extra usage 쪽으로 라우팅됐다는 재현 사례예요.\n\n핵심은 공포가 아니라 체크입니다욤.\n\n① 최근 커밋 메시지\n② 사용량/과금 페이지\n③ 에러 메시지\n\n이 3개를 같이 보면 원인 추적이 훨씬 빨라져요.\n\nContents Editor · AI쭌\nSource · GitHub Issue / TechCrunch\n이슈 링크: https://github.com/anthropics/claude-code/issues/53262\nOpenClaw 과금 맥락: https://techcrunch.com/2026/04/04/anthropic-says-claude-code-subscribers-will-need-to-pay-extra-for-openclaw-support/`,
  },
];

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inline(text) {
  return String(text)
    .replaceAll("`", "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function rich(text) {
  return String(text).replace(/`([^`]+)`/g, '<span class="code-word">$1</span>');
}

function findFfmpeg() {
  const found = FFMPEG_CANDIDATES.find((item) => existsSync(item));
  if (!found) throw new Error("ffmpeg executable not found in previous HyperFrames project.");
  return found;
}

function copyFonts(projectDir) {
  const target = path.join(projectDir, "assets", "fonts");
  mkdirSync(target, { recursive: true });
  for (const name of ["Griun_Mongtori-Rg.ttf", "Moneygraphy-Rounded.woff2"]) {
    const src = path.join(FONT_SOURCE, name);
    if (existsSync(src)) copyFileSync(src, path.join(target, name));
  }
}

function makeVisual(topic, card, index, motion = false) {
  const chips = card.chips || [];
  const chipHtml = chips.map((chip) => `<span>${esc(chip)}</span>`).join("");
  const brand = esc(topic.brand);
  const seed = card.visual || "default";

  if (seed === "json") {
    return `<div class="visual json-ui">
      <div class="windowbar"><i></i><i></i><i></i><b>response.json</b></div>
      <pre>{
  "model": "grok-4.3",
  "usage": {
    "input_tokens": 199,
    "output_tokens": 1,
    "cost_in_usd_ticks": 158500
  }
}</pre>
      <div class="highlight-line"></div>
      <div class="chip-row">${chipHtml}</div>
    </div>`;
  }

  if (seed === "billing" || seed === "commit") {
    return `<div class="visual terminal-ui">
      <div class="windowbar"><i></i><i></i><i></i><b>git log --oneline</b></div>
      <div class="terminal-line">$ git commit -m "add HERMES.md"</div>
      <div class="terminal-line muted">$ claude -p "hi"</div>
      <div class="terminal-error">API Error: extra usage depleted</div>
      <div class="route">
        <span>plan quota</span><strong>→</strong><span class="danger">extra usage</span>
      </div>
      <div class="chip-row">${chipHtml}</div>
    </div>`;
  }

  if (seed === "security" || seed === "scan" || seed === "verify") {
    return `<div class="visual security-ui">
      <div class="scan-grid"></div>
      <div class="alert-card one"><b>SQL Injection?</b><span>검증 전</span></div>
      <div class="alert-card two"><b>Auth bypass</b><span>높은 위험</span></div>
      <div class="alert-card three"><b>False positive</b><span>제외</span></div>
      <div class="shield">SEC</div>
      <div class="chip-row">${chipHtml}</div>
    </div>`;
  }

  if (seed === "terminal" || seed === "goal") {
    return `<div class="visual terminal-ui goal-ui">
      <div class="windowbar"><i></i><i></i><i></i><b>codex</b></div>
      <div class="terminal-line"><span class="prompt">›</span> /goal create</div>
      <div class="goal-card">테스트 파일 하나 통과시키고<br />변경 이유까지 정리하기</div>
      <div class="route">
        <span>pause</span><strong>→</strong><span>resume</span><strong>→</strong><span>done</span>
      </div>
      <div class="chip-row">${chipHtml}</div>
    </div>`;
  }

  if (seed === "grok" || seed === "model" || seed === "tools") {
    return `<div class="visual model-ui">
      <div class="model-orbit"></div>
      <div class="model-core">${seed === "grok" ? "GROK<br />4.3" : brand}</div>
      <div class="tool t1">Web</div>
      <div class="tool t2">X</div>
      <div class="tool t3">Code</div>
      <div class="meter"><span style="width:${index % 2 ? 66 : 42}%"></span></div>
      <div class="chip-row">${chipHtml}</div>
    </div>`;
  }

  if (seed === "workdesk" || seed === "documents" || seed === "weekly" || seed === "survey") {
    return `<div class="visual work-ui">
      <div class="doc-card large"><b>Weekly Brief</b><span>우선순위 · 리스크 · 다음 할 일</span></div>
      <div class="doc-card mid"><b>Sheet</b><span>응답 분류</span></div>
      <div class="doc-card small"><b>Mail</b><span>초안 작성</span></div>
      <div class="connector"></div>
      <div class="assistant-badge">CODEX</div>
      <div class="chip-row">${chipHtml}</div>
    </div>`;
  }

  if (seed === "workflow") {
    return `<div class="visual workflow-ui">
      <div class="node">Finding</div><b>→</b><div class="node">Slack</div><b>→</b><div class="node">Jira</div>
      <div class="chip-row">${chipHtml}</div>
    </div>`;
  }

  if (seed === "lanes") {
    return `<div class="visual lanes-ui">
      <div class="lane"><b>이번 이슈</b><span>문자열 재현 버그 보고</span></div>
      <div class="lane muted-lane"><b>별도 맥락</b><span>OpenClaw 과금 정책</span></div>
      <div class="chip-row">${chipHtml}</div>
    </div>`;
  }

  return `<div class="visual checklist-ui">
    <div class="check-item"><b>1</b><span>${esc(chips[0] || "핵심 확인")}</span></div>
    <div class="check-item"><b>2</b><span>${esc(chips[1] || "작게 테스트")}</span></div>
    <div class="check-item"><b>3</b><span>${esc(chips[2] || "저장하기")}</span></div>
    <div class="chip-row">${chipHtml}</div>
  </div>`;
}

function sharedCss(topic) {
  return `@font-face{font-family:Griun;src:url("../assets/fonts/Griun_Mongtori-Rg.ttf") format("truetype");font-weight:400}
@font-face{font-family:Money;src:url("../assets/fonts/Moneygraphy-Rounded.woff2") format("woff2");font-weight:700}
*{box-sizing:border-box}
html,body{margin:0;width:${CARD_W}px;height:${CARD_H}px;overflow:hidden;background:#000}
body{font-family:Money,system-ui,sans-serif;color:#fff;word-break:keep-all;letter-spacing:0}
.card{position:relative;width:${CARD_W}px;height:${CARD_H}px;overflow:hidden;background:#000}
.brand-top{position:absolute;z-index:10;top:58px;left:0;right:0;text-align:center;font-size:33px;font-weight:900;letter-spacing:7px;color:rgba(255,255,255,.94)}
.source{position:absolute;z-index:11;right:56px;bottom:48px;font-size:23px;color:rgba(255,255,255,.62)}
.article .source{left:70px;right:auto;bottom:54px}
.code-word{display:inline-block;padding:.02em .14em .04em;border-radius:.18em;background:rgba(255,255,255,.1);font-family:Money,system-ui,sans-serif;color:${topic.accent}}
.cover-bg{position:absolute;inset:0;background:radial-gradient(circle at 72% 18%,${topic.accent}55,transparent 34%),radial-gradient(circle at 8% 12%,${topic.warm}40,transparent 32%),linear-gradient(145deg,#111821,#030405 68%,#000)}
.cover-bg:before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.055) 1px,transparent 1px);background-size:72px 72px;opacity:.65}
.cover-visual{position:absolute;left:54px;right:54px;top:128px;height:700px;overflow:hidden;border-radius:34px;border:2px solid rgba(255,255,255,.2);background:linear-gradient(145deg,rgba(255,255,255,.12),rgba(255,255,255,.03));box-shadow:0 38px 100px rgba(0,0,0,.6)}
.cover-visual:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.02) 30%,rgba(0,0,0,.86))}
.cover-copy{position:absolute;z-index:8;left:70px;right:70px;bottom:104px}
.pill{display:inline-flex;align-items:center;min-height:58px;padding:13px 22px 10px;border:1px solid rgba(255,255,255,.6);border-radius:999px;background:rgba(0,0,0,.34);backdrop-filter:blur(10px);font-size:30px;color:#fff}
.cover-title{margin:34px 0 0;font-size:96px;line-height:1.05;font-weight:900;letter-spacing:0;text-shadow:0 9px 32px rgba(0,0,0,.55)}
.cover-sub{margin:24px 0 0;font-size:37px;line-height:1.32;color:rgba(255,255,255,.88)}
.article{background:#000}
.media{position:absolute;left:42px;right:42px;top:142px;height:552px;overflow:hidden;border:4px solid rgba(255,255,255,.9);background:#10141a}
.copy{position:absolute;z-index:8;left:70px;right:70px;top:752px}
.num{display:flex;align-items:center;justify-content:center;width:70px;height:70px;margin-bottom:26px;border-radius:50%;background:rgba(255,255,255,.13);font-size:42px;color:rgba(255,255,255,.78);font-weight:900}
.title{margin:0;font-size:67px;line-height:1.14;font-weight:900;letter-spacing:0}
.body{margin:34px 0 0;font-size:35px;line-height:1.38;color:rgba(255,255,255,.9)}
.footer{position:absolute;right:70px;bottom:54px;font-size:27px;font-weight:900;letter-spacing:6px;color:rgba(255,255,255,.92)}
.visual{position:absolute;inset:0;overflow:hidden;background:linear-gradient(145deg,#171d25,#06080b)}
.visual:before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.055) 1px,transparent 1px);background-size:60px 60px;opacity:.55}
.visual:after{content:"";position:absolute;inset:auto 0 0;height:42%;background:linear-gradient(0deg,rgba(0,0,0,.92),transparent)}
.chip-row{position:absolute;z-index:5;left:38px;right:38px;bottom:34px;display:flex;gap:13px;flex-wrap:wrap}
.chip-row span{display:inline-flex;align-items:center;min-height:52px;padding:13px 18px 10px;border:1px solid rgba(255,255,255,.28);border-radius:999px;background:rgba(0,0,0,.6);font-size:27px;color:${topic.accent};font-weight:900}
.windowbar{position:absolute;z-index:4;left:58px;right:58px;top:48px;height:58px;border-radius:18px 18px 0 0;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);display:flex;align-items:center;gap:12px;padding:0 22px}
.windowbar i{width:14px;height:14px;border-radius:50%;background:#ff5f56}.windowbar i:nth-child(2){background:#ffbd2e}.windowbar i:nth-child(3){background:#27c93f}.windowbar b{margin-left:8px;font-size:24px;color:rgba(255,255,255,.8)}
.terminal-ui,.json-ui{background:linear-gradient(145deg,#101419,#050607)}
.terminal-line,.terminal-error{position:relative;z-index:4;left:76px;right:76px;top:136px;font-family:ui-monospace,Consolas,monospace;font-size:31px;line-height:1.34;color:#e9f4ff}
.terminal-line+.terminal-line{margin-top:18px}.terminal-error{margin-top:20px;color:#ff8b7a;background:rgba(255,122,102,.12);border:1px solid rgba(255,122,102,.35);border-radius:16px;padding:18px;width:78%}
.route{position:absolute;z-index:4;left:76px;right:76px;bottom:126px;display:flex;align-items:center;gap:18px}.route span{padding:16px 22px;border-radius:999px;background:rgba(255,255,255,.1);font-size:28px}.route .danger{color:#ff8b7a}.route strong{font-size:44px;color:${topic.accent}}
.goal-card{position:absolute;z-index:4;left:86px;top:222px;width:610px;padding:28px;border-radius:24px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);font-size:42px;line-height:1.22}
.prompt{color:${topic.accent}}
pre{position:absolute;z-index:4;left:82px;right:82px;top:126px;margin:0;padding:28px;border-radius:22px;background:rgba(0,0,0,.48);font-family:ui-monospace,Consolas,monospace;font-size:28px;line-height:1.42;color:#e9f4ff}
.highlight-line{position:absolute;z-index:5;left:106px;right:148px;top:356px;height:47px;border-radius:12px;background:${topic.accent}30;border:1px solid ${topic.accent}99}
.doc-card{position:absolute;z-index:4;padding:28px;border-radius:25px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.1);box-shadow:0 24px 70px rgba(0,0,0,.36)}
.doc-card b{display:block;font-size:42px}.doc-card span{display:block;margin-top:14px;font-size:27px;color:rgba(255,255,255,.72)}
.doc-card.large{left:70px;top:68px;width:480px;height:210px}.doc-card.mid{right:80px;top:126px;width:330px}.doc-card.small{left:160px;top:334px;width:360px}
.assistant-badge{position:absolute;z-index:5;right:90px;bottom:132px;width:180px;height:180px;border-radius:44px;background:${topic.accent};color:#04100d;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:900;box-shadow:0 24px 80px ${topic.accent}55}
.connector{position:absolute;z-index:3;left:330px;top:270px;width:380px;height:2px;background:${topic.accent};transform:rotate(22deg);box-shadow:0 0 24px ${topic.accent}}
.model-core{position:absolute;z-index:5;left:50%;top:50%;transform:translate(-50%,-50%);width:260px;height:260px;border-radius:70px;background:${topic.accent};color:#02100d;display:flex;align-items:center;justify-content:center;text-align:center;font-size:45px;line-height:1.06;font-weight:900;box-shadow:0 28px 90px ${topic.accent}66}
.model-orbit{position:absolute;z-index:3;left:240px;top:94px;width:510px;height:350px;border:2px dashed rgba(255,255,255,.25);border-radius:50%}
.tool{position:absolute;z-index:4;padding:16px 22px;border-radius:999px;background:rgba(0,0,0,.62);border:1px solid rgba(255,255,255,.25);font-size:30px}.t1{left:120px;top:112px}.t2{right:148px;top:138px}.t3{left:390px;bottom:128px}
.meter{position:absolute;z-index:4;left:120px;right:120px;bottom:110px;height:28px;border-radius:999px;background:rgba(255,255,255,.15);overflow:hidden}.meter span{display:block;height:100%;background:${topic.accent}}
.security-ui .shield{position:absolute;z-index:5;left:50%;top:50%;transform:translate(-50%,-50%);width:190px;height:220px;border-radius:90px 90px 38px 38px;background:${topic.accent};color:#04100d;display:flex;align-items:center;justify-content:center;font-size:48px;font-weight:900}
.alert-card{position:absolute;z-index:4;width:290px;padding:24px;border-radius:22px;background:rgba(0,0,0,.62);border:1px solid rgba(255,255,255,.22)}.alert-card b{font-size:31px}.alert-card span{display:block;margin-top:11px;font-size:24px;color:rgba(255,255,255,.7)}.alert-card.one{left:72px;top:82px}.alert-card.two{right:76px;top:154px}.alert-card.three{left:148px;bottom:132px}
.scan-grid{position:absolute;inset:60px;border:1px solid rgba(255,255,255,.13);border-radius:28px;background:linear-gradient(90deg,transparent 49%,${topic.accent}28 50%,transparent 51%);opacity:.8}
.workflow-ui{display:flex;align-items:center;justify-content:center;gap:22px}.workflow-ui .node{z-index:5;padding:34px 30px;border-radius:24px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);font-size:40px}.workflow-ui b{z-index:5;font-size:50px;color:${topic.accent}}
.lane{position:absolute;z-index:4;left:70px;right:70px;top:92px;padding:34px;border-radius:26px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18)}.lane b{display:block;font-size:43px}.lane span{display:block;margin-top:13px;font-size:30px;color:rgba(255,255,255,.72)}.muted-lane{top:294px;opacity:.68}
.check-item{position:relative;z-index:4;margin:60px 86px 0;display:flex;align-items:center;gap:26px;padding:26px 28px;border-radius:24px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18)}.check-item b{width:56px;height:56px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:${topic.accent};color:#07100d;font-size:34px}.check-item span{font-size:38px}
.cover-visual .visual{inset:0}.cover-visual .chip-row{bottom:46px}
`;
}

function cardHtml(topic, card, index) {
  const visual = makeVisual(topic, card, index);
  if (card.kind === "cover") {
    return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(topic.slug)} card ${index}</title><link rel="stylesheet" href="./card-shared.css"></head><body>
<article class="card cover">
  <div class="cover-bg"></div>
  <div class="brand-top">AI TREND</div>
  <div class="cover-visual">${visual}</div>
  <div class="cover-copy">
    <div class="pill">${esc(topic.category)}</div>
    <h1 class="cover-title">${rich(card.title)}</h1>
    <p class="cover-sub">${rich(card.sub)}</p>
  </div>
  <div class="source">Source · ${esc(topic.sourceLabel)}</div>
</article></body></html>`;
  }

  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(topic.slug)} card ${index}</title><link rel="stylesheet" href="./card-shared.css"></head><body>
<article class="card article">
  <div class="brand-top">AI TREND</div>
  <div class="media">${visual}</div>
  <div class="copy">
    <div class="num">${index}</div>
    <h1 class="title">${rich(card.title)}</h1>
    <p class="body">${rich(card.body)}</p>
  </div>
  <div class="footer">AI TREND</div>
  <div class="source">Source · ${esc(topic.sourceLabel)}</div>
</article></body></html>`;
}

function indexHtml(topic) {
  const cards = topic.cards
    .map((_, idx) => {
      const n = String(idx + 1).padStart(2, "0");
      const png = `./output/card-${n}.png`;
      const motion = topic.motionCard === idx + 1 ? `./output/card-${n}-motion.mp4` : "";
      return `<section><h2>Card ${n}${motion ? " · Motion" : ""}</h2><img src="${png}" alt="card ${n}">${motion ? `<video src="${motion}" controls loop muted></video>` : ""}</section>`;
    })
    .join("\n");
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(topic.slug)} preview</title><style>
body{margin:0;background:#111;color:#fff;font-family:system-ui,sans-serif;padding:32px}h1{font-size:32px}section{margin:0 0 28px;padding:18px;border:1px solid #333;border-radius:12px;background:#181818}h2{font-size:20px}img,video{width:360px;max-width:45vw;margin-right:18px;vertical-align:top;border-radius:8px}
</style></head><body><h1>${esc(topic.slug)}</h1>${cards}</body></html>`;
}

function motionHtml(topic) {
  const card = topic.cards[topic.motionCard - 1];
  const visual = makeVisual(topic, card, topic.motionCard, true);
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(topic.slug)} motion</title><link rel="stylesheet" href="../../cards/card-shared.css"><style>
.motion-layer{position:absolute;z-index:20;inset:0;pointer-events:none}
.motion-type{position:absolute;z-index:30;left:86px;right:86px;top:558px;padding:20px 26px 18px;border-radius:22px;background:rgba(0,0,0,.74);border:1px solid rgba(255,255,255,.22);box-shadow:0 24px 80px rgba(0,0,0,.5)}
.motion-type b{display:block;font-size:38px;line-height:1.12}.motion-type span{display:block;margin-top:10px;font-size:27px;color:rgba(255,255,255,.78)}
.cursor{display:inline-block;width:22px;height:44px;margin-left:7px;background:${topic.accent};vertical-align:-7px}
.pulse{position:absolute;border:2px solid ${topic.accent};border-radius:999px;opacity:0;transform:scale(.4)}
.motion-note{position:absolute;z-index:31;right:72px;top:620px;padding:16px 22px;border-radius:999px;background:${topic.accent};color:#06100d;font-size:30px;font-weight:900}
</style></head><body>
<article class="card article">
  <div class="brand-top">AI TREND</div>
  <div class="media">${visual}</div>
  <div class="copy">
    <div class="num">${topic.motionCard}</div>
    <h1 class="title">${card.title}</h1>
    <p class="body">${card.body}</p>
  </div>
  <div class="footer">AI TREND</div>
  <div class="source">Source · ${esc(topic.sourceLabel)}</div>
  <div class="motion-layer">
    <div class="motion-note" id="note">LIVE DEMO</div>
    <div class="motion-type"><b id="typeText"></b><i class="cursor" id="cursor"></i><span id="typeSub"></span></div>
  </div>
</article>
<script>
const kind = ${JSON.stringify(topic.motionKind)};
const phrases = {
  typing: ["› /goal create", "목표 저장 → 이어서 진행"],
  rows: ["설문 응답 분류 중...", "흩어진 답변이 표로 정리되는 장면"],
  meter: ["Web + X + Code", "도구를 붙이면 비용도 같이 체크"],
  security: ["검증 중...", "헛경고는 덜고 진짜 위험만 남기기"],
  billing: ['commit: "add HERMES.md"', "커밋 메시지가 과금 경로에 영향을 준 사례"]
};
const title = document.getElementById("typeText");
const sub = document.getElementById("typeSub");
const note = document.getElementById("note");
const cursor = document.getElementById("cursor");
const media = document.querySelector(".media");
const visual = document.querySelector(".visual");
const chips = [...document.querySelectorAll(".chip-row span")];
const cards = [...document.querySelectorAll(".doc-card,.alert-card,.tool,.check-item,.lane")];
window.renderFrame = (t) => {
  const p = Math.max(0, Math.min(1, t / ${MOTION_SECONDS}));
  const [a,b] = phrases[kind] || phrases.rows;
  const typeProgress = Math.max(0, Math.min(1, (p - 0.08) / 0.46));
  title.textContent = a.slice(0, Math.floor(a.length * typeProgress));
  sub.textContent = p > 0.5 ? b : "";
  cursor.style.opacity = Math.floor(p * 20) % 2 ? "0" : "1";
  note.style.transform = "translateY(" + (Math.max(0, .18 - p) * -240) + "px)";
  note.style.opacity = p < .92 ? "1" : String((1 - p) / .08);
  media.style.transform = "scale(" + (1 + p * .035) + ")";
  visual.style.filter = "saturate(" + (1 + p * .22) + ") contrast(" + (1 + p * .08) + ")";
  cards.forEach((el,i) => {
    const s = Math.max(0, Math.min(1, (p - .12 - i * .055) / .28));
    el.style.opacity = String(.35 + s * .65);
    el.style.transform = "translateY(" + ((1 - s) * 34) + "px)";
  });
  chips.forEach((el,i) => {
    const s = Math.max(0, Math.min(1, (p - .34 - i * .08) / .22));
    el.style.opacity = String(s);
    el.style.transform = "translateY(" + ((1 - s) * 22) + "px)";
  });
};
window.renderFrame(0);
</script></body></html>`;
}

async function renderPng(browser, htmlPath, outPath, seekSeconds = null) {
  const page = await browser.newPage();
  await page.setViewport({ width: CARD_W, height: CARD_H, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0", timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  if (seekSeconds !== null) {
    await page.evaluate((time) => {
      if (typeof window.renderFrame === "function") window.renderFrame(time);
    }, seekSeconds);
  }
  await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: CARD_W, height: CARD_H } });
  await page.close();
}

async function renderMotion(browser, motionHtmlPath, frameDir, outPath, ffmpegPath) {
  rmSync(frameDir, { recursive: true, force: true });
  mkdirSync(frameDir, { recursive: true });
  const page = await browser.newPage();
  await page.setViewport({ width: CARD_W, height: CARD_H, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(motionHtmlPath).href, { waitUntil: "networkidle0", timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  const totalFrames = Math.round(FPS * MOTION_SECONDS);
  for (let frame = 0; frame <= totalFrames; frame += 1) {
    const t = frame / FPS;
    await page.evaluate((time) => window.renderFrame(time), t);
    await page.screenshot({
      path: path.join(frameDir, `frame-${String(frame).padStart(4, "0")}.png`),
      clip: { x: 0, y: 0, width: CARD_W, height: CARD_H },
    });
  }
  await page.close();
  execFileSync(
    ffmpegPath,
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

function writeProject(topic) {
  const projectDir = path.join(PROJECT_ROOT, topic.slug);
  const cardsDir = path.join(projectDir, "cards");
  const outputDir = path.join(projectDir, "output");
  const motionDir = path.join(projectDir, "motion", `card-${String(topic.motionCard).padStart(2, "0")}-motion`);
  mkdirSync(cardsDir, { recursive: true });
  mkdirSync(outputDir, { recursive: true });
  mkdirSync(motionDir, { recursive: true });
  copyFonts(projectDir);
  writeFileSync(path.join(cardsDir, "card-shared.css"), sharedCss(topic), "utf8");
  topic.cards.forEach((card, idx) => {
    const n = String(idx + 1).padStart(2, "0");
    writeFileSync(path.join(cardsDir, `card-${n}.html`), cardHtml(topic, card, idx + 1), "utf8");
  });
  writeFileSync(path.join(motionDir, "index.html"), motionHtml(topic), "utf8");
  writeFileSync(path.join(projectDir, "index.html"), indexHtml(topic), "utf8");
  writeFileSync(path.join(projectDir, "instagram-caption.md"), `${topic.caption}\n`, "utf8");
  writeFileSync(
    path.join(projectDir, "design.md"),
    `# Design\n\n- Ratio: 1080x1350 Instagram 4:5\n- Style: AI TREND-style editorial black cards with large media panels\n- Fonts: Moneygraphy Rounded for main copy, Griun available for softer accent use\n- Rule: large readable Korean typography, no orphaned short words, source links in caption\n- Motion: Card ${topic.motionCard} exports as MP4 with the same typography scale as the static cards\n`,
    "utf8",
  );
  return { projectDir, cardsDir, outputDir, motionDir };
}

async function main() {
  if (!existsSync(PUPPETEER_PATH)) throw new Error(`Missing puppeteer-core at ${PUPPETEER_PATH}`);
  if (!existsSync(CHROME_PATH)) throw new Error(`Missing Chrome at ${CHROME_PATH}`);
  const ffmpegPath = findFfmpeg();
  const { default: puppeteer } = await import(pathToFileURL(PUPPETEER_PATH).href);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--allow-file-access-from-files", "--disable-web-security", "--font-render-hinting=none"],
  });
  const manifest = [];
  try {
    for (const topic of topics) {
      const dirs = writeProject(topic);
      for (let i = 1; i <= topic.cards.length; i += 1) {
        const n = String(i).padStart(2, "0");
        await renderPng(
          browser,
          path.join(dirs.cardsDir, `card-${n}.html`),
          path.join(dirs.outputDir, `card-${n}.png`),
        );
      }
      const n = String(topic.motionCard).padStart(2, "0");
      await renderMotion(
        browser,
        path.join(dirs.motionDir, "index.html"),
        path.join(dirs.motionDir, "frames"),
        path.join(dirs.outputDir, `card-${n}-motion.mp4`),
        ffmpegPath,
      );
      await renderPng(
        browser,
        path.join(dirs.motionDir, "index.html"),
        path.join(dirs.outputDir, `card-${n}-motion-preview.png`),
        MOTION_SECONDS * 0.72,
      );
      manifest.push({
        topic: topic.slug,
        preview: path.join(dirs.projectDir, "index.html"),
        motion: path.join(dirs.outputDir, `card-${n}-motion.mp4`),
      });
      console.log(`done ${topic.slug}`);
    }
  } finally {
    await browser.close();
  }
  writeFileSync(
    path.join(PROJECT_ROOT, "2026-05-01-final-render-manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8",
  );
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
