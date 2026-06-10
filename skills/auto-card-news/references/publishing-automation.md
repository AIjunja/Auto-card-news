# Publishing Automation Reference

Use this reference when the user asks for Instagram or Threads upload automation.

## Default Safety

- Never upload unless the user explicitly asks for publishing.
- Never ask the user to paste raw access tokens in chat.
- Prefer local `.env`, OS secret storage, or an existing credential manager.
- If credentials are missing, create `publish-queue.json` and `publish-checklist.md` only.
- Keep a `publish-log.md` for every attempted upload.

## Local Env Convention

Use these names unless the project already has a different convention:

```text
META_ACCESS_TOKEN=
META_IG_USER_ID=
META_THREADS_USER_ID=
META_APP_ID=
META_APP_SECRET=
PUBLIC_MEDIA_BASE_URL=
```

`PUBLIC_MEDIA_BASE_URL` is needed because Meta publishing APIs generally need media files reachable from the internet. Local file paths such as `C:\...` are not enough for direct API publishing.

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
- Video is vertical 9:16 for Reels or the requested platform ratio.
- Carousel cards are ordered and named predictably.
- Media files are under platform size/duration limits.
- Sensitive info, tokens, private paths, and private tabs are removed.
- Source media rights are noted as direct-use, recreated, reference-only, or user-provided.
- If API upload is unavailable, explain the missing account/API/hosting requirement and stop.

## API Behavior

- Instagram upload should use the official Instagram Graph/Platform content publishing flow.
- Threads upload should use the official Threads API publishing flow.
- Treat API version, permissions, account requirements, and rate limits as current external facts: verify against official Meta docs before implementing or debugging.
- Do not hardcode API versions in generated scripts unless the user asked for a fixed version.
- Save API request outcome, returned post/container IDs, URLs, errors, and retry notes in `publish-log.md`.

