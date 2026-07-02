# Publishing Automation Reference

Use this reference when the user asks for Instagram, Threads, YouTube Shorts, TikTok, or cross-post upload automation.

## Default Safety

- Never upload unless the user explicitly asks for publishing.
- Never ask the user to paste raw access tokens in chat.
- Prefer local `.env`, OS secret storage, or an existing credential manager.
- If credentials are missing, create `publish-queue.json` and `publish-checklist.md` only.
- Keep a `publish-log.md` for every attempted upload.

## Local Env Convention

Use these names unless the project already has a different convention:

```text
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
META_ACCESS_TOKEN=
INSTAGRAM_USER_ID=
THREADS_ACCESS_TOKEN=
THREADS_USER_ID=
PUBLIC_MEDIA_BASE_URL=
```

`PUBLIC_MEDIA_BASE_URL` is needed because platform publishing APIs generally need media files reachable from the internet. Local file paths such as `C:\...` are not enough for direct API publishing.

## Hermes Local Orchestration

When the user asks for "Hermes가 소스 찾고 Codex로 카드뉴스/릴스 만들고 Telegram 검수 후 Meta API 업로드" style automation, use the local orchestrator instead of inventing a new flow.

The default flow is review-first, not one-shot publishing:

1. source candidate review;
2. draft/storyboard/caption review;
3. final rendered package review;
4. dry-run publish plan;
5. optional Meta API upload only after explicit final approval.

```powershell
node tools\automation\hermes-content-orchestrator.mjs --init
node tools\automation\hermes-content-orchestrator.mjs --source-send
node tools\automation\hermes-content-orchestrator.mjs --telegram-poll
node tools\automation\hermes-content-orchestrator.mjs --draft-plan
node tools\automation\hermes-content-orchestrator.mjs --run-draft-codex
node tools\automation\hermes-content-orchestrator.mjs --draft-send
node tools\automation\hermes-content-orchestrator.mjs --telegram-poll
node tools\automation\hermes-content-orchestrator.mjs --plan
node tools\automation\hermes-content-orchestrator.mjs --run-codex
node tools\automation\hermes-content-orchestrator.mjs --build-queue --validate --telegram-send
node tools\automation\hermes-content-orchestrator.mjs --telegram-poll
node tools\automation\hermes-content-orchestrator.mjs --publish-approved
```

Telegram commands:

```text
SOURCE OK <source-id>
SOURCE NO <source-id>: reason
DRAFT OK <source-id>
DRAFT REVISE <source-id>: revision note
UPLOAD <project-slug>
REVISE <project-slug>: revision note
```

Run `--publish-approved --execute` only when Meta/Threads credentials and public media hosting are configured.

Hermes or another source monitor should write candidates to:

```text
carousel-workspace/hermes-source-inbox.json
```

The orchestrator writes prompts to `carousel-workspace/hermes-runs/`, draft files to `carousel-workspace/hermes-drafts/`, queues rendered projects from `carousel-workspace/projects/<channel>/`, stores review state in `carousel-workspace/hermes-review-state.json`, and only publishes items marked approved at the final review stage.

Read `docs/hermes-content-automation.md` before wiring recurring source discovery, Telegram approvals, or official Meta API publishing.

## Publish Queue Shape

```json
{
  "items": [
    {
      "id": "2026-06-09-topic-slug",
      "platforms": ["instagram", "threads"],
      "type": "reel",
      "assets": ["output/reel.mp4"],
      "caption": "caption.md",
      "source_links": ["https://example.com"],
      "publish_at": null,
      "status": "ready_for_review"
    }
  ]
}
```

## Preflight Checklist

- Final user approval exists for this exact asset and caption.
- Caption has useful source links and does not imply ownership of the original source.
- Video is vertical 9:16 unless the user requested another ratio.
- Duration, file size, codec, and cover frame match the target platform.
- Sensitive info, tokens, private paths, and private tabs are removed.
- Source media rights are noted as direct-use, recreated, reference-only, or user-provided.
- If API upload is unavailable, explain the missing account/API/hosting requirement and stop.

## API Behavior

- Instagram upload should use the official Instagram Graph/Platform content publishing flow.
- Instagram default: publish both the paired card-news carousel and the Reel when both assets exist.
- Threads upload should use the official Threads API publishing flow.
- Threads default: publish only the paired card-news image set/carousel, then add source/GitHub/docs links in the first reply/comment.
- Do not publish the Reel/video to Threads unless the user explicitly asks for a Threads video post.
- Do not reuse the Instagram caption as-is for Threads.
- Threads posts should use a short main body, a source/comment reply, and the `AI Threads` topic tag.
- Put direct GitHub/source links in the Threads reply comment, not the main Threads body, unless the user explicitly asks otherwise.
- Treat API version, permissions, account requirements, and rate limits as current external facts: verify against official platform docs before implementing or debugging.
- Do not hardcode API versions in generated scripts unless the user asked for a fixed version.
- Save API request outcome, returned post/container IDs, URLs, errors, and retry notes in `publish-log.md`.
