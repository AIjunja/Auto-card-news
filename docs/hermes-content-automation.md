# Hermes Content Automation

## Current AI JJUN automation mode

Use this mode when Hermes should run while the computer is on:

```powershell
powershell -ExecutionPolicy Bypass -File tools\automation\register-hermes-task.ps1 -RefreshSources
```

This registers a Windows task that runs:

1. poll Telegram approval commands;
2. refresh the source inbox with a mandatory hype mix;
3. send source candidates to Telegram;
4. generate approved drafts with Codex;
5. send drafts to Telegram;
6. generate final approved packages with Codex;
7. build a publish queue;
8. wait for upload approval;
9. after final Telegram approval, publish to the CDN and Meta automatically.

With `HERMES_AUTO_PUBLISH_ON_FINAL_APPROVAL=1` and
`HERMES_AUTO_PUBLISH_EXECUTE=1`, Telegram final approval is the upload command.
You only review in Telegram; Hermes runs the CDN deploy and Meta upload behind
the scenes.

Manual source intake:

```powershell
powershell -ExecutionPolicy Bypass -File tools\automation\hermes-add-source.ps1 -Url "https://example.com/source" -Title "source title"
```

Safe dry run without Codex execution:

```powershell
powershell -ExecutionPolicy Bypass -File tools\automation\hermes-local-run.ps1 -NoCodex
```

One full local pass with source refresh:

```powershell
powershell -ExecutionPolicy Bypass -File tools\automation\hermes-local-run.ps1 -RefreshSources
```

Hermes가 AI 소스를 찾고, 사용자가 Telegram에서 검수하고, Codex가 우리 카드뉴스/릴스 스킬 기준으로 제작한 뒤, 다시 Telegram 검수를 거치는 로컬 자동화 흐름입니다.

지금 단계의 목표는 Meta API 자동 업로드가 아닙니다.

1. Hermes가 좋은 소스 후보를 찾는다.
2. Telegram에서 소스 후보를 먼저 검수한다.
3. 승인된 소스만 Codex가 카드뉴스/릴스 초안을 만든다.
4. Telegram에서 초안 검수를 받는다.
5. 승인된 초안만 Codex가 최종 카드뉴스/릴스를 만든다.
6. Telegram에서 최종 업로드 승인을 받는다.
7. Meta API 키는 나중에 넣고, 그 전까지는 dry-run publish plan까지만 만든다.

## Pipeline

```text
Hermes source search
  -> carousel-workspace/hermes-source-inbox.json
  -> Telegram source review
  -> Codex draft generation
  -> Telegram draft review
  -> Codex final production with auto-card-news + auto-motion-news
  -> publish-queue.json
  -> Telegram final review
  -> CDN deploy
  -> Meta API upload
```

## 0.1 Telegram-Only Publishing Mode

For the current AI JJUN setup, the intended operation is:

```text
Hermes finds sources
  -> Telegram source approval
  -> Codex makes draft/final package
  -> Telegram final approval with ㄱㄱ
  -> Hermes uploads carousel + reel automatically
```

Required local env values:

```text
PUBLIC_MEDIA_BASE_URL=https://cdn.ai-jjuun.com/
AIJJUN_CDN_REPO_PATH=ai-jjun-cdn
HERMES_AUTO_PUBLISH_ON_FINAL_APPROVAL=1
HERMES_AUTO_PUBLISH_EXECUTE=1
HERMES_AUTO_PUBLISH_PLATFORM=auto
HERMES_AUTO_PUBLISH_KINDS=carousel,reel
```

`auto` means Instagram-only while Threads credentials are empty, then Instagram + Threads once `THREADS_ACCESS_TOKEN` and `THREADS_USER_ID` are filled.

## 1. Initialize

```powershell
node tools\automation\hermes-content-orchestrator.mjs --init
```

This creates local working files:

```text
carousel-workspace/hermes-source-inbox.json
carousel-workspace/hermes-review-state.json
carousel-workspace/hermes-content.env
```

You can also copy samples manually:

```powershell
Copy-Item examples\hermes-source-inbox.sample.json carousel-workspace\hermes-source-inbox.json
Copy-Item examples\hermes-content.env.sample carousel-workspace\hermes-content.env
```

## 1.1 Telegram-First Setup

Do not paste Telegram tokens into chat. Put them only in the local env file:

```text
carousel-workspace/hermes-content.env
```

Create a bot with Telegram `@BotFather`, then set:

```text
TELEGRAM_BOT_TOKEN=123456:your-bot-token
TELEGRAM_CHAT_ID=
```

Send any message to your new bot from your Telegram account, then discover the
chat ID:

```powershell
node tools\automation\hermes-telegram-check.mjs
```

Save the discovered chat ID:

```powershell
node tools\automation\hermes-telegram-check.mjs --write-chat-id <chat-id>
```

Send a test message:

```powershell
node tools\automation\hermes-telegram-check.mjs --send-test
```

After this works, one local pass is:

```powershell
powershell -ExecutionPolicy Bypass -File tools\automation\hermes-local-run.ps1
```

For a safer first run without Codex execution:

```powershell
powershell -ExecutionPolicy Bypass -File tools\automation\hermes-local-run.ps1 -NoCodex
```

To run it when Windows starts and then every hour:

```powershell
powershell -ExecutionPolicy Bypass -File tools\automation\register-hermes-task.ps1
```

## 2. Source Inbox

Hermes should write source candidates into:

```text
carousel-workspace/hermes-source-inbox.json
```

Source candidates should start as `candidate`, not `ready`.

```json
{
  "version": 1,
  "channel": "ai-jjuun",
  "items": [
    {
      "id": "short-safe-id",
      "status": "candidate",
      "priority": 5,
      "title": "Source title",
      "url": "https://example.com/source",
      "summary": "One-line factual summary.",
      "angle": "Why AIjjuun viewers should care.",
      "sources": [
        {
          "label": "official",
          "url": "https://example.com/source",
          "summary": "What this source proves."
        }
      ],
      "notes": [
        "Do not overstate claims.",
        "Use real screenshots/demo frames first."
      ]
    }
  ]
}
```

Recommended source mix:

- Hard rule for each hourly source run:
  - collect at least 2 GeekNews/Hacker News-style items;
  - collect at least 2 Threads or creator-social items;
  - collect at least 2 X items from official accounts, builders, researchers, or high-signal practitioners;
  - collect at least 2 hyped GitHub repositories with stars, recent activity, license, and README/demo proof.
- Pair every social item with a source of truth. A Threads/X post is a hype signal, not enough by itself.
- Prefer "minor but useful" discoveries: small open-source tools, AI coding workflows, security/cost warnings, MCP/agent infrastructure, Korean business use cases, and demos viewers can try.
- Reject official-blog-only candidate lists unless the official source is paired with a strong creator reaction, demo, repo, or operational gotcha.
- official docs, product blog, GitHub repo, changelog, paper, pricing page;
- GeekNews, Hacker News, Reddit, X, Threads, YouTube demos, creator hands-on posts;
- reality checks: license, pricing, limits, setup friction, security concerns.

## 3. Stage 1: Source Review

Send candidate sources to Telegram:

```powershell
node tools\automation\hermes-content-orchestrator.mjs --source-send
```

Reply in Telegram:

```text
SOURCE OK anyscale-ray-vllm-pd
```

or:

```text
SOURCE NO anyscale-ray-vllm-pd: 이건 너무 B2B 인프라 쪽이라 이번엔 보류
```

Poll Telegram replies:

```powershell
node tools\automation\hermes-content-orchestrator.mjs --telegram-poll
```

Manual CLI approval:

```powershell
node tools\automation\hermes-content-orchestrator.mjs --approve-source anyscale-ray-vllm-pd
node tools\automation\hermes-content-orchestrator.mjs --reject-source anyscale-ray-vllm-pd --note "보류 이유"
```

## 4. Stage 2: Draft Generation

After source approval, create Codex draft prompts:

```powershell
node tools\automation\hermes-content-orchestrator.mjs --draft-plan
```

Actually run Codex draft generation:

```powershell
node tools\automation\hermes-content-orchestrator.mjs --run-draft-codex
```

Draft files are written under:

```text
carousel-workspace/hermes-drafts/<source-id>/
  brief.md
  storyboard.md
  caption-draft.md
  reel-script.md
  source-review.md
```

This stage does not render final PNG/MP4 yet. It is only for checking the angle, copy, caption, and Reel flow.

## 5. Stage 3: Draft Review

Send generated drafts to Telegram:

```powershell
node tools\automation\hermes-content-orchestrator.mjs --draft-send
```

Reply:

```text
DRAFT OK anyscale-ray-vllm-pd
```

or:

```text
DRAFT REVISE anyscale-ray-vllm-pd: 첫 장 훅을 더 쉽게, GPU 비용 예시를 넣어줘
```

Poll replies:

```powershell
node tools\automation\hermes-content-orchestrator.mjs --telegram-poll
```

Manual CLI approval:

```powershell
node tools\automation\hermes-content-orchestrator.mjs --approve-draft anyscale-ray-vllm-pd
node tools\automation\hermes-content-orchestrator.mjs --request-draft-changes anyscale-ray-vllm-pd --note "수정사항"
```

## 6. Stage 4: Final Production

After source and draft approval, create final Codex prompts:

```powershell
node tools\automation\hermes-content-orchestrator.mjs --plan
```

Actually run final Codex production:

```powershell
node tools\automation\hermes-content-orchestrator.mjs --run-codex
```

The prompt forces:

- `auto-card-news` + `auto-motion-news`;
- AIjjuun VibeVoice/GmarketSans production style;
- real source screenshots/demo frames first;
- generated visual only when real media is missing;
- 7 PNG cards, short Reel, caption, source-pack, contact sheet, thumbnail sheet;
- no upload from Codex itself.

## 7. Build And Validate Publish Queue

```powershell
node tools\automation\hermes-content-orchestrator.mjs --build-queue --validate
```

Outputs:

```text
carousel-workspace/publish-queue.json
carousel-workspace/publish-validation.json
```

The queue accepts both:

- `output/reel.mp4`
- `output/reel-preview.mp4`

## 8. Stage 5: Final Review

Send final package review list:

```powershell
node tools\automation\hermes-content-orchestrator.mjs --telegram-send
```

Reply:

```text
UPLOAD 2026-06-20-topic-slug
```

or:

```text
REVISE 2026-06-20-topic-slug: 1번 카드 이미지 더 후킹되게, 4번 글자 겹침 수정
```

Poll replies:

```powershell
node tools\automation\hermes-content-orchestrator.mjs --telegram-poll
```

## 9. Dry-Run Publish Plan

This does not upload.

```powershell
node tools\automation\hermes-content-orchestrator.mjs --publish-approved
```

Outputs:

```text
carousel-workspace/publish-approved.json
carousel-workspace/publish-instagram-plan.json
carousel-workspace/publish-threads-plan.json
```

## 10. Meta API Auto Upload

When credentials are ready, fill this locally:

```text
META_ACCESS_TOKEN=
INSTAGRAM_USER_ID=
THREADS_ACCESS_TOKEN=
THREADS_USER_ID=
THREADS_GRAPH_BASE_URL=https://graph.threads.net/v1.0
PUBLIC_MEDIA_BASE_URL=
AIJJUN_CDN_REPO_PATH=ai-jjun-cdn
HERMES_AUTO_PUBLISH_ON_FINAL_APPROVAL=1
HERMES_AUTO_PUBLISH_EXECUTE=1
HERMES_AUTO_PUBLISH_PLATFORM=auto
HERMES_AUTO_PUBLISH_KINDS=carousel,reel
```

`PUBLIC_MEDIA_BASE_URL` must point to a public HTTPS URL where the files under `carousel-workspace` are reachable. Meta APIs cannot upload from local disk paths.

Threads token sanity check:

```powershell
node tools\automation\hermes-threads-check.mjs
node tools\automation\hermes-threads-check.mjs --write-user-id
```

The first command verifies the token without publishing anything. If the returned username is the right Threads profile, run the second command to save `THREADS_USER_ID`.

After this, you do not need to run a publish command manually. Final Telegram
approval triggers:

```text
CDN deploy -> public URL check -> Meta upload
```

Manual fallback command:

```powershell
node tools\automation\hermes-content-orchestrator.mjs --publish-approved --execute
```

## 11. Safe Hourly Pass

One local hourly pass:

```powershell
node tools\automation\hermes-content-orchestrator.mjs --hourly-once
```

This will:

1. send source candidates for Telegram review;
2. create draft prompts for approved sources;
3. send existing generated drafts for review;
4. create final prompts for approved drafts;
5. rebuild/validate the publish queue;
6. send final review candidates;
7. if final approval arrives through Telegram, publish automatically.

It will not run Codex unless you add:

```powershell
--run-draft-codex --run-codex
```

## What You Need Now

For the current MVP:

- Hermes or another monitor that writes `hermes-source-inbox.json`.
- Telegram bot token and chat ID.
- Codex CLI installed and able to run from this repo.
- Local skills installed or available in this repo so Codex can use the same `auto-card-news` and `auto-motion-news` rules.

For publishing:

- Meta app permissions.
- Instagram professional/business account ID.
- Threads user ID.
- Public media hosting for `carousel-workspace`.

The important part: the automation should not be one-shot publish. It should be source approval, draft approval, final approval, then upload.
