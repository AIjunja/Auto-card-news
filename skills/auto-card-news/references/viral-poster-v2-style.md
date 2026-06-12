# Viral Poster V2 Style

Use this reference when the user wants the second card-news style: viral Korean promo-poster energy applied to AI news, tools, repos, and tutorials.

## Purpose

This mode exists because the normal AI news style can become too calm. The goal is to make viewers stop like they stopped on a restaurant opening, popup event, limited sale, or local hot-place post.

The content is still AI news, but the visual grammar is closer to:

- restaurant opening cards;
- popup-store announcements;
- local event posters;
- "save this list" viral utility posts;
- creator-made loud thumbnails.

## When To Use

Use it when:

- the user says `2탄`, `바이럴형`, `맛집 느낌`, `팝업스토어 느낌`, `전단지`, `도블락`, or `레퍼런스랑 더 비슷하게`;
- the topic needs non-technical people to stop scrolling;
- the source is useful but visually boring, such as GitHub repos, docs, blog posts, MCP tools, prompts, or coding-agent workflows;
- the user says the previous output looked like PPT, blog summary, or too clean.

Do not use it for sensitive crisis, legal, medical, severe security incidents, or serious apology/exploit topics unless the user explicitly wants a loud format. In those cases, keep the hook strong but reduce gimmicks.

## Visual Formula

### Cover

The cover should be the loudest card.

- Full-bleed background: real demo frame, product screenshot, creator screenshot, official media, or GPT-generated scene.
- Apply only enough dim/gradient for readability. Do not hide the image.
- Big Korean title takes 55-75% of the card height.
- Use 3-5 short title chunks, not a sentence.
- Use layered text:
  - outer white stroke;
  - inner black stroke;
  - fill in white, pink, red, or yellow;
  - hot-pink/yellow shadow;
  - optional small sparkle/firework shapes.
- Add one small round/black ticket at the bottom for the actual promise.

Good cover rhythm:

```text
>> 요즘 AI판 핵심 이슈 <<
프롬프트만
잘 쓰면
끝난 줄
알았죠?

AI가 혼자 일하게 만드는
루프 엔지니어링 등장
```

Bad cover rhythm:

```text
Loop Engineering is a technique where developers design automated feedback loops...
```

### Body Cards

Body cards should not become PPT slides. Each body card should show one visual and one idea.

Use:

- one big source/demo image;
- one oversized headline;
- 1-2 short support lines;
- 2-4 sticker chips if useful;
- clear source line.

Avoid:

- multiple paragraphs;
- abstract diagrams;
- tiny screenshots;
- repeated repo homepage screenshots;
- decorative lines connecting boxes;
- body copy that needs more than 3 seconds to read.

### CTA Card

The final card can return to cover energy.

Use:

- one bold takeaway;
- one action;
- one comment keyword when useful.

Example:

```text
다음엔
프롬프트
말고
루프 짜요

댓글에 "루프" 남기면
예시 구조 더 풀어볼게요
```

## Copy Rules

Write like a Korean creator explaining something useful to a friend.

- Replace abstract benefits with a concrete situation.
- Keep card copy short and punchy.
- Use familiar words before technical names.
- Put technical terms after the hook, not before it.
- Keep the AIjjuun cute tutor voice when it helps, but do not make the content childish.

Use these transformations:

| Weak | Better |
| --- | --- |
| 생산성 향상 | 내가 덜 붙잡고 있어도 됨 |
| 워크플로우 최적화 | 찾고, 만들고, 검사하는 순서 짜기 |
| 활용 가치가 큼 | 아침마다 자료조사 시키기 좋음 |
| 에이전트 성능 개선 | AI가 중간에 길 잃는 걸 줄임 |
| 개발자에게 유용 | 코드 리뷰, CI 실패, 릴리즈 정리에 바로 씀 |

## Layout QA

Before final:

1. Render all cards.
2. Make a contact sheet.
3. Zoom into card 1 and card 7.
4. Check that the title reads in one glance.
5. Check no Korean glyph is clipped.
6. Check text does not overlap brand, source, page number, stickers, or face/object focal points.
7. Check body cards have distinct visuals.
8. Check background images remain recognizable.

If a card fails, simplify copy before shrinking the font.

## Motion Handoff

When also making a Reel, hand this to `auto-motion-news`:

- The Reel should begin with moving poster text, a punch-in zoom, or a quick demo moment.
- Do not just fade through the static PNGs.
- Use the same thick typography and bright sticker colors.
- Keep the first hook within 2 seconds.
- Use 15-20 seconds unless the user asks longer.
