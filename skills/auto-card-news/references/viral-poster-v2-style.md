# Viral Poster V2 Style

Use this reference when the user asks for `스킬 2`, `2탄`, `바이럴형`, `도블락 느낌`, or points to the VibeVoice result as the desired style.

## Canonical Benchmark

The canonical benchmark is:

`carousel-workspace/projects/ai-jjuun/2026-06-11-vibevoice/output`

This is the style to imitate, not the earlier over-decorated restaurant flyer experiment.

## What This Style Is

Viral Poster V2 is an AI쭌-specific viral card-news format:

- dark tech base;
- subtle grid or soft gradient;
- GmarketSans Korean type;
- big readable headlines;
- actual product/source/demo visuals;
- white rounded cards and chips;
- mint, pink, yellow accent colors;
- short human Korean copy;
- clear source line and page number.

It should feel more viral and punchy than the normal AI news template, but it must still be readable, useful, and source-backed.

## What This Style Is Not

Do not make it:

- a random restaurant flyer;
- a PPT slide;
- a plain GitHub screenshot with text slapped on;
- a dark blurry background where the source image cannot be recognized;
- a decorative poster full of arrows, fireworks, badges, and stickers with no clear message.

## Cover Formula

The first card must stop the scroll with a concrete use case or payoff.

Good:

```text
녹음 안 했는데
팟캐스트가
나옵니다
```

Good:

```text
회의 녹음,
다시 듣지 말고
쪼개서 보세요
```

Bad:

```text
Microsoft VibeVoice
오픈소스 음성 AI 모델 소개
```

Rules:

- Use a recognizable hook visual: official demo, product screenshot, source image, generated scene, or reconstructed UI.
- Use only enough dim/gradient for text readability.
- Main title should be huge and readable in Instagram grid view.
- Keep title to 2-4 short chunks.
- Add one small label chip such as `AI NEWS | VOICE`, `왜 봐야 하냐면`, or `공식 자료`.
- Add one short subtitle/promise line only if needed.

## Body Card Formula

Each card should explain one thing.

Use this structure:

1. One large visual proof or demo image.
2. One big Korean headline.
3. One short support sentence.
4. Optional 2-4 chips or boxes only if they make the idea easier.

Good body card jobs:

- `what is it?`
- `why should I care?`
- `how can I use it?`
- `what changed?`
- `what should I watch out for?`

Bad body card jobs:

- listing every feature;
- explaining the whole repo;
- summarizing an official blog paragraph;
- repeating the same screenshot across cards.

## Copy Rules

Write like a Korean AI tutor talking to a friend.

- Prefer concrete situations over abstract benefits.
- Use familiar Korean first, technical terms second.
- Avoid translated-English phrasing.
- Avoid empty labels like `TTS / ASR / Realtime` unless you immediately explain what they mean.
- Use `~요`, `~해요`, `~해보세요`, and occasional cute AI쭌 tone in captions, but do not make the card childish.

Transform copy like this:

| Weak | Better |
| --- | --- |
| TTS / ASR / Realtime | 대본 읽기 / 녹음 받아쓰기 / 바로 말하기 |
| 생산성 향상 | 다시 듣는 시간을 줄여줘요 |
| 워크플로우 최적화 | 찾고, 만들고, 검토하는 순서를 줄여요 |
| 에이전트 성능 개선 | AI가 중간에 길 잃는 걸 줄여요 |
| 개발자에게 유용 | 코드 리뷰, CI 실패, 릴리즈 정리에 바로 써요 |

## Layout Rules

- Use GmarketSans as default. Before rendering, verify the project contains the actual font files: `assets/fonts/gmarket/GmarketSansTTFBold.ttf`, `GmarketSansTTFMedium.ttf`, and `GmarketSansTTFLight.ttf`. If any file is missing, copy it from the VibeVoice benchmark project or the user's GmarketSans archive before rendering. Do not accept browser fallback fonts.
- Use `word-break: keep-all`.
- Do not scale font size with viewport width.
- Keep large text away from page numbers and source lines.
- Number badges must not touch or overlap headlines.
- If using arrows, keep them large and simple; do not build thin connector diagrams.
- Chips/boxes must be centered vertically and horizontally.
- If a chip has two lines, both lines must fit naturally.
- If text does not fit, shorten the copy before shrinking the font.

## Visual Rules

- Use the real image/video/source when it helps understanding.
- Do not blur the main visual so much that the subject disappears.
- Avoid grayscale filters unless the source itself is grayscale.
- Avoid using the same GitHub repo screenshot on every card.
- For GitHub repos, capture distinct anchors: repo home, README section, demo image, examples folder, issue/release, or reconstructed use-case UI.
- If no useful visual exists, create an HTML-native scene that shows the practical workflow.

## QA Checklist

Before final:

1. Render every card to PNG.
2. Create `contact-sheet.png`.
3. Create `thumbnail-sheet.png` using the Instagram square crop.
4. Check card 1 in grid size.
5. Check no Korean glyph is clipped.
6. Check no title overlaps badges, arrows, boxes, source, or page number.
7. Check each card has a distinct visual job.
8. Check background/source images are recognizable.
9. Check there is a caption with `Contents Editor`, source links, and a comment/follow CTA.
10. If Instagram-first, also make or hand off a Reel using the same visual language.
11. Confirm the rendered typography visually matches the VibeVoice benchmark. If it looks thinner, rounder, handwritten, or browser-default, the font load failed.

If a card fails, simplify copy first. Do not fix layout by making all text tiny.

## Motion Handoff

For `auto-motion-news`, Viral V2 reels should:

- be 15-20 seconds by default;
- start with a moving hook in the first 2 seconds;
- show typing, zoom, cursor highlight, checklist reveal, or source/demo motion;
- avoid only fading through static cards;
- keep the safe zone clear for Instagram/Reels UI;
- use the same GmarketSans, dark tech base, and mint/pink/yellow accents.
