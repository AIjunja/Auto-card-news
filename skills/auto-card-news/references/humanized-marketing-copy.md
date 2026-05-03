# Humanized Marketing Copy

Use this reference before preview approval for carousel copy, captions, CTAs, and product or campaign angles. It folds in three outside inspirations without making the skill depend on them at runtime:

- Marketing Skills: use audience, hook, social-content, ad-creative, and CTA checks inspired by `https://github.com/coreyhaines31/marketingskills`.
- Humanizer: remove AI-sounding phrasing, stiff summaries, and generic filler inspired by `https://github.com/blader/humanizer`.
- Claude Ads: use campaign and paid-ad thinking for product promotion, especially PitchCheck, inspired by `https://github.com/AgriciDaniel/claude-ads`.

## Humanizer Pass

Rewrite every card and caption as if a real channel editor would say it to a specific viewer.

Replace:

- generic AI openings: "AI is changing everything", "This is a major update"
- vague benefit words: "productivity", "workflow innovation", "efficiency improvement"
- source-first openings: "Company X announced..."
- stiff explainer rhythm: definition, feature list, conclusion
- copied technical phrases that a beginner would not repeat naturally

With:

- a viewer situation: "Photoshop users who keep fixing the same thing twice..."
- a concrete before/after: "Before: copy the answer, switch apps, fix by hand. After: ask inside the tool."
- one useful point per card
- spoken Korean rhythm, even when the source is technical
- light channel personality when it fits, but never at the cost of clarity

For Korean social copy, remove literal translations and internal-business phrasing. If a phrase sounds like it came from translated product docs, rewrite it into everyday Korean before design. Examples:

| Avoid | Prefer |
| --- | --- |
| "절차를 태웁니다" | "먼저 순서를 잡아줘요" |
| "체감 이득" | "뭐가 덜 귀찮아지는지" |
| "워크플로우 혁신" | "일하는 순서가 이렇게 바뀜" |
| "에이전트 기능이 강화됨" | "AI가 끝까지 덜 헤매게 잡아줌" |
| "메타데이터 라우팅 이슈" | "커밋 한 줄 때문에 요금 경로가 바뀌었다는 보고" |

For AIjjuun-style AI information, the voice can be friendly, tutor-like, and slightly cute. Use endings like `~요` or `~욤` only when the caption or CTA benefits from warmth. Do not use cute phrasing inside a serious security warning or when it weakens trust.

## Marketing Check

Before HTML/CSS preview, answer these checks in `storyboard.md` or review notes:

- Hook: does card 1 name the viewer, the problem, or the curiosity in the first line?
- Promise: what gets easier, faster, cheaper, clearer, or less annoying?
- Proof: which screenshot, demo, example, number, source, or before/after makes it believable?
- Save reason: why would the viewer need this later?
- Comment reason: what can the viewer answer with one short comment?
- Share reason: who would the viewer send this to?
- Try reason: what can the viewer do after seeing the post?

If the source has visible social proof such as GitHub stars, forks, leaderboard rank, downloads, views, benchmark rank, official adoption, or public usage, decide whether it belongs in the hook or card 2. Use social proof to create curiosity, not as decoration. Examples:

- "GitHub 17만 스타. 이 정도면 그냥 유명함"
- "GitHub에서 별 제일 많은 레포가 뭘까?"
- "24시간 만에 470만 조회가 나온 이유"

When using changing metrics, include the capture date or phrase it as "캡처 시점 기준" in notes or captions.

If any answer is vague, revise the angle before designing. A pretty card with no viewer action reason is still weak content.

## Ad / Conversion Mode

Use this mode only when the content promotes a product, app, campaign, launch, lead magnet, event, or service. It is optional for neutral news posts.

When active, define:

- Offer: the simplest thing the viewer gets
- Audience: who has the urgent problem
- Pain: what is annoying before the product
- Proof: demo, result, review, screenshot, number, or credible source
- Objection: what makes the viewer hesitate
- CTA: one action, not three competing actions
- Destination: app store, GitHub, landing page, DM keyword, comment keyword, or saved checklist

For PitchCheck marketing, prefer concrete football operations language over startup jargon. Example: "attendance is missing again" is clearer than "team operations are fragmented."

## Caption Style

Keep captions useful and readable:

- Open with one strong sentence or two short lines.
- Use short sections and numbered bullets only when they make scanning easier.
- Put source links near the end.
- Use `Contents Editor · <channel>` for curation credit.
- Use `Source · <original owner/source>` separately.
- Add a practical link line when viewers can try the tool or read the source.

Avoid making the caption a second full article unless the user explicitly wants a long explainer.
