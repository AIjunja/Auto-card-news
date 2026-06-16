---
name: ai-jjuun-content-engine
description: "Use when the user wants AI쭌-style AI news, GitHub/open-source, tool, research, or AX consulting content from a source link, source bundle, trend list, or reference screenshots. This skill distills the channel's past carousel/Reel experiments and reference feedback into a single production engine for source discovery, hook framing, Korean-native copy, VibeVoice-level card-news, Reels, captions, and QA."
---

# AI쭌 Content Engine

This skill is the memory layer for AI쭌 content production. It does not replace `auto-card-news` or `auto-motion-news`; it forces them to operate with the learned AI쭌 standards from prior projects, references, and account feedback.

## Required Skill Stack

Before producing content, read and apply:

- `../auto-card-news/SKILL.md`
- `../auto-motion-news/SKILL.md`
- `../auto-card-news/references/ai-jjuun-production-playbook.md`
- `../auto-motion-news/references/ai-jjuun-reel-playbook.md`
- `references/content-memory-map.md`
- `references/source-discovery-standard.md`
- `references/copy-visual-motion-standard.md`
- `references/monetization-and-ax-bridge.md`

If the user explicitly mentions `$auto-card-news`, `$auto-motion-news`, `VibeVoice`, `스킬 2`, `AI쭌`, or asks to make AI/news/tool content for the channel, treat this skill as the top-level quality gate.

## Channel Positioning

AI쭌 is not a generic AI news repost account. It should feel like a friendly Korean tutor/curator who finds minor-but-useful AI tools, explains them without translationese, and gradually builds trust as an AX consultant.

Default promise:

- "바쁜 사람이 바로 이해하고 써먹게 해준다."
- "공식 발표만 요약하지 않고, 실제 사용 장면과 주의점을 보여준다."
- "유행하는 소스를 한국 시청자 입장에서 다시 번역한다."

## Default Production Flow

1. **Source discovery or verification**
   - If the user gives one URL, verify the official source and gather field signals.
   - If the user asks for topics, search official sources plus GitHub, GeekNews, Hacker News, Reddit, X/Threads, creator demos, changelogs, issues, and hands-on posts.
   - Score each topic for usefulness, novelty, visual potential, Reel potential, and AX bridge.

2. **Angle selection**
   - Never open with "X가 발표했습니다" unless the human payoff is already clear.
   - Find the viewer pain, curiosity, fear, shortcut, or money/time angle.
   - Pick one of the learned AI쭌 angles:
     - "이거 쓰면 반복 업무가 줄어듦"
     - "AI 에이전트 쓰기 전에 이 보안/비용/권한부터 봐야 함"
     - "개발자/마케터/크리에이터가 바로 써먹는 세팅"
     - "남들이 공식 블로그만 볼 때 실제 사용법까지 정리"
     - "AX 컨설팅 체크리스트로 이어지는 실무 주제"

3. **Content package**
   - Produce card-news and Reel together by default.
   - Card-news target: 6-8 cards, one message per card, GmarketSans, VibeVoice-level readability.
   - Reel target: 15-20 seconds, Hook -> Explanation -> Engagement CTA, meaningful motion.
   - Caption target: short scan-friendly caption with source link, `Contents Editor · AI JJUN`, and a comment CTA.

4. **Visual proof**
   - Capture or use real official/product/source screenshots whenever possible.
   - Search for official demos or source media before generating images.
   - Use GPT-generated images only when they explain the viewer result or scenario better than a generic screenshot.
   - Do not ship repeated screenshots with different text.

5. **Copy and humanization**
   - Write Korean as if explaining to a smart but busy viewer.
   - Preserve AI쭌's friendly tutor warmth, but do not let cuteness hide the point.
   - Use `humanize-korean` as a QA layer, not a blind rewrite.
   - Do not use `AI쭌식` as a label. Use `AI JJUN`, `AI NEWS`, category chips, or concrete labels.

6. **QA before final**
   - Render card PNGs.
   - Create and inspect `contact-sheet.png` and `thumbnail-sheet.png`.
   - Render Reel MP4 and inspect hook/middle/CTA frames.
   - Fix overlap, small text, awkward line breaks, hidden source visuals, and Instagram safe-zone issues.

## Hard Fails

Revise before final if any of these happen:

- The first card is only a GitHub README or blog screenshot with a summary.
- The visual is hidden under heavy blur, grayscale, or dimming.
- The copy reads like a translated official blog.
- The viewer needs to read a paragraph to understand the value.
- Cards 2-6 reuse the same image without a new visual job.
- The Reel is just static cards fading in and out.
- The CTA does not give a reason to comment, save, follow, or ask for a link.
- The topic cannot connect to a practical use case, caution, or AX consulting insight.

## Output Checklist

Save or update these files in the project:

- `source.md`
- `source-pack.md`
- `brief.md`
- `storyboard.md`
- `humanize-input.md`
- `humanize-report.md`
- `motion-plan.md`
- `caption.md`
- `output/card-01.png` through final card
- `output/contact-sheet.png`
- `output/thumbnail-sheet.png`
- `output/reel-preview.mp4` or documented blocker

Report the exact output paths and what was visually inspected.
