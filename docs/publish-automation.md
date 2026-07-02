# Publish Automation

This folder-level toolchain prepares card-news projects for Instagram and Threads publishing.

It is intentionally staged:

1. Build a local queue from generated content folders.
2. Validate each item before upload.
3. Create dry-run API plans for Instagram and Threads.
4. Pick scheduled items with duplicate and daily-limit checks.
5. Execute official API upload only when credentials and public media URLs are configured.

## Expected Project Shape

Each content project should look like this:

```text
carousel-workspace/projects/ai-jjuun/2026-05-07-topic/
  caption.md
  source-pack.md
  output/
    card-01.png
    card-02.png
    card-03.png
    card-04.png
    card-05.png
    card-06.png
    card-07.png
    reel.mp4
    reel-frame-05s.png
```

The queue builder also accepts the preview aliases used by older/local render scripts:

```text
output/reel-preview.mp4
output/reel-preview-frame-01.png
```

## 1. Build Queue

```powershell
node tools\publish\build-publish-queue.mjs --channel ai-jjuun --out carousel-workspace\publish-queue.json
```

Useful options:

```powershell
node tools\publish\build-publish-queue.mjs --project "carousel-workspace\projects\ai-jjuun\2026-05-07-topic"
node tools\publish\build-publish-queue.mjs --publish-at "2026-05-08T09:00:00+09:00"
```

## 2. Validate Queue

```powershell
node tools\publish\validate-publish-queue.mjs --queue carousel-workspace\publish-queue.json --out carousel-workspace\publish-validation.json
```

Checks include:

- card filename sequence: `card-01.png` through `card-07.png`
- Instagram carousel ratio: 4:5
- reel proxy frame ratio: 9:16
- card image size
- reel file size
- Instagram caption length
- Threads caption length
- source links

## 3. Dry-Run API Plans

```powershell
node tools\publish\publish-instagram.mjs --queue carousel-workspace\publish-queue.json
node tools\publish\publish-threads.mjs --queue carousel-workspace\publish-queue.json
```

These create:

```text
carousel-workspace/publish-instagram-plan.json
carousel-workspace/publish-threads-plan.json
```

Dry-run mode does not upload anything. It only describes the official API jobs.

## 4. Schedule Due Items

```powershell
node tools\publish\scheduler.mjs --queue carousel-workspace\publish-queue.json --daily-limit 3 --out carousel-workspace\publish-due.json
```

The scheduler:

- only includes validation-ready items
- respects `publish_at`
- skips already-published `contentKey`s from `publish-history.json`
- respects the daily limit

## 5. Execute Upload

Execution mode is guarded because Instagram and Threads require a professional account, permissions, access tokens, and public media URLs.

Instagram:

```powershell
$env:META_ACCESS_TOKEN="..."
$env:INSTAGRAM_USER_ID="..."
$env:PUBLIC_MEDIA_BASE_URL="https://cdn.example.com/carousel-workspace/"
node tools\publish\publish-instagram.mjs --queue carousel-workspace\publish-queue.json --execute
```

Threads:

```powershell
$env:THREADS_ACCESS_TOKEN="..."
$env:THREADS_USER_ID="..."
$env:PUBLIC_MEDIA_BASE_URL="https://cdn.example.com/carousel-workspace/"
node tools\publish\publish-threads.mjs --queue carousel-workspace\publish-queue.json --execute
```

Threads publishing style:

- Publish the card-news image set only. Do not publish the Reel/video to Threads by default.
- If multiple card PNGs exist, publish them as one Threads carousel/card set.
- Do not reuse the Instagram caption as-is.
- Main Threads body should be short and link-free.
- Put GitHub/docs/source links in the first reply/comment.
- Add the `AI Threads` topic tag by default.

Instagram publishing style:

- Publish both the card-news carousel and the Reel when both assets exist.
- Use the Instagram caption as the richer caption; keep extra source links in caption or comments depending on the post plan.

Optional token expiry guards:

```powershell
$env:META_TOKEN_EXPIRES_AT="2026-06-01T00:00:00+09:00"
$env:THREADS_TOKEN_EXPIRES_AT="2026-06-01T00:00:00+09:00"
```

Failures are appended to:

```text
carousel-workspace/publish-failures.log.jsonl
```
