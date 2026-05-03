# Auto Card News Handoff

This repo carries the working context for AIjjuun-style card news and motion-video production.

## Channel Context

- Channel: AI쭌
- Type: AI information and practical AI tool channel
- Audience: people who want to catch useful AI news/tools quickly and understand how to use them
- Voice: friendly AI tutor, casual and clear, with light cute endings when appropriate
- CTA style: save, follow, try the tool, or check the source link

## Core Creative Direction

- Make Instagram-first content, not PPT slides.
- Start from a human curiosity, problem, or concrete viewer situation.
- Use official screenshots, GitHub pages, docs, demos, issue pages, or recreated UI scenes as proof.
- Keep copy short and spoken. Translate source jargon into everyday Korean.
- Use strong social proof when it matters: GitHub stars, ranks, views, dates, releases, demos, benchmarks.
- Put direct source links in captions with `Contents Editor · AI쭌` and `Source · ...`.

## Design Defaults

- Static card size: `1080x1350`.
- Reel size: `1080x1920`.
- Main Korean font: `Griun Mongtori`.
- Use dark editorial AI-news layouts with large visual proof on top and large readable Korean copy below.
- For Reels, keep text away from Instagram right action rail and bottom profile/caption area.

## Current Skills

- `skills/auto-card-news`: carousel/card-news workflow, design rules, captions, source attribution, media/reference handling.
- `skills/auto-motion-news`: short-form video workflow, HyperFrames/Remotion direction, recorded footage edit mode, subtitle-light editing.

## Recent Production Scripts

The `tools/` directory contains one-off generation scripts that serve as reusable examples:

- `build-superpowers-cards.mjs`
- `build-build-your-own-x-package.mjs`
- `build-open-design-package.mjs`
- `build-google-surf-mcp-cards.mjs`
- `build-codex-pets-cards.mjs`
- `build-codex-pet-demo-reel.mjs`

Generated PNG/MP4 outputs live under `carousel-workspace/`, which is ignored by Git. Re-run scripts locally to regenerate outputs.

## Important Copy Rules

- Avoid translated or internal phrases such as "절차를 태운다", "체감 이득", "워크플로우 혁신".
- Prefer natural Korean such as "먼저 순서를 잡아줘요", "뭐가 덜 귀찮아지는지", "일하는 순서가 바뀜".
- If the source is technical, explain why a normal viewer should care before listing features.
- If the source is a GitHub repo, check star count, rank, README positioning, screenshots, and practical use case.
