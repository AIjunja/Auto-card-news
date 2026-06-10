# Project Workflow

Use this reference when converting source material into a carousel project.

## Source Intake

Accepted inputs include URLs, reports, memos, drafts, pasted GPT conversations, screenshots, captions, and raw notes. Save the original material to `source.md`.

If the user has no source, asks for source discovery, or needs current AI information, use the installed `last30days` skill from https://github.com/mvanhorn/last30days-skill before writing carousel copy. Treat `last30days` as the fresh source discovery step, then convert its output into `source-pack.md` containing source candidates, source quality notes, freshness checks, and a recommended angle for `auto-card-news`.

When the source is a URL, fetch the accessible content. If access is blocked, ask the user to paste the relevant parts or provide screenshots. State the limitation clearly in `brief.md`.

## Media Reference Discovery

For visual or tool-based topics, search for media that helps a viewer understand the point faster:

- Official demo videos, launch videos, product pages, screenshots, docs, or blog media
- Credible creator demos when official media is unavailable
- Source images that show the actual tool, UI, workflow, before/after, field scene, or product context
- Short video segments suitable for motion-card reference or embed/cut inspiration

Do not use external media as decoration only. Each image or video must prove, clarify, or dramatize the card's message. Record media URLs, source names, usage notes, and attribution text in `source-pack.md` or `brief.md`.

If a video or image will be used in an exported post, prefer official/public source material and include source attribution. If rights are unclear, use it as reference only and create a new visual, screenshot recreation, or generated/HTML-native scene instead.

## Fresh Proof And Social Metrics

For GitHub repos, tools, models, launch posts, or creator demos, capture proof that makes the viewer believe the story quickly:

- GitHub stars, forks, latest release, README positioning, badges, topic labels, and contributor/activity signals
- ranking pages or leaderboards when the angle starts from "most starred", "top ranked", "fastest growing", or similar curiosity
- official demo screenshots, docs screenshots, or issue/PR screenshots that show the actual claim
- view counts, like counts, dates, and post context for social proof when the source is a public post

Treat these numbers as time-sensitive. Write "captured on YYYY-MM-DD" or "캡처 시점 기준" in `source-pack.md`, `brief.md`, or the caption if the metric appears in the final copy.

Use metrics only when they change the viewer's reason to care. A star count can be a strong hook for "why everyone saved this repo", but it should not replace explaining what the viewer can do with the resource.

## Viewer Frame

Before summarizing the source as a carousel, define the viewer-first frame:

| Question | Answer should sound like |
| --- | --- |
| Who stops? | "포토샵/블렌더로 작업하는 디자이너", not "AI 사용자" |
| What is annoying or interesting now? | "AI 답을 복붙하고 다시 고치는 게 귀찮음" |
| What changes? | "프로그램 안에서 바로 시키는 흐름이 생김" |
| Why keep swiping? | "내 작업에도 붙일 수 있는지 알고 싶음" |
| Why save/comment/share? | "나중에 툴 세팅할 때 참고", "내가 쓰는 툴도 되는지 댓글" |

The hook must match this frame. If the hook targets the wrong viewer, rewrite it before proceeding.

## Source Summary

Summarize after the viewer frame is clear:

- Core message
- Main claims
- Useful facts, demos, or quotes
- Audience relevance
- Missing context
- Risky assumptions
- Available visual or video proof

## Plain-Language Translation

Translate abstract source phrases into viewer language:

| Source phrase | Viewer-language rewrite |
| --- | --- |
| "tool integration" | "내가 쓰는 프로그램 안에서 바로 시킬 수 있음" |
| "productivity improvement" | "손으로 반복하던 시간이 줄어듦" |
| "creative workflow" | "디자인/영상/음악 작업 순서" |
| "automation" | "매번 하던 잡일을 덜어줌" |
| "agent" | "옆에서 작업을 이어서 도와주는 AI" |

Avoid abstract phrases such as "체감 이득", "생산성 차이", or "워크플로우 혁신" unless the next line explains what becomes easier in ordinary words.

## Angle Options

Always propose two or three angles, even when the user gives a direction. Keep each angle specific:

- Angle name
- Target viewer and situation
- Hook example
- What makes the viewer swipe
- What makes the viewer save, comment, or share
- Expected 5-8 card flow
- Static/motion potential
- Media reference needs

When the user already has a direction, treat it as the boundary for the options rather than something to ignore. For example, "PitchCheck attendance feature" can become parent pain, coach operation, player habit, or app-demo angles.

## Engagement Card Roles

Use these roles as the default skeleton. Adjust only when the topic needs a different rhythm.

| Card | Role | Job |
| --- | --- | --- |
| 1 | Stop hook | Name the viewer or situation immediately. Use motion or a strong visual if it helps stop scrolling. |
| 2 | What is this? | Explain the topic in one plain sentence. |
| 3 | Existing pain | Show the annoying current behavior, confusion, wasted time, or missed chance. |
| 4 | Change/proof/demo | Show the official demo, screenshot, before/after, or concrete proof. |
| 5 | What gets easier | Say what becomes faster, simpler, cheaper, clearer, or less annoying. |
| 6 | Channel viewpoint | Add the channel's interpretation, warning, or practical recommendation. Use `<채널명> 관점` or `<채널명> 해석`. |
| 7 | Save/comment CTA | Give a reason to save, comment, share, or try it. |

## Copy Draft

After the angle is chosen, write full card copy in one pass. Number every card. This is first-pass copy approval, not final approval.

Good user edits should be easy to make by card number:

- "Make card 1 hook stronger."
- "Shorten card 3."
- "Make card 2 motion instead of static."
- "Make the CTA less salesy."

Keep copy tight. Prefer one main sentence and one support line per card. If a card needs more than three short lines, split it or replace some text with a visual example.

## Humanized Marketing Review

Before asking for copy approval, run the review in `references/humanized-marketing-copy.md`.

The review must answer:

- Does the hook sound like one real person talking to one real viewer?
- Does the post sell a concrete reason to care, not just a feature?
- Is every technical term translated into normal viewer language?
- Is there visible proof, not just a claim?
- Is there a save, comment, share, or try reason?
- If this is product or PitchCheck marketing, is the offer, audience, proof, objection, CTA, and destination clear?

Rewrite before design if the draft still sounds like a press release, internal product note, or AI-generated summary.

## Line Break QA

Before final HTML/CSS approval, inspect rendered cards for awkward line breaks. A headline should read like a person would say it out loud.

- Do not strand a short Korean word, particle, or ending on its own line unless that isolation is the intended joke or punch.
- Keep noun phrases and audience labels together: `AI 따로 쓰는 분들`, `포토샵 쓰는 디자이너`, `내 작업에 붙이는 AI`.
- If a manual `<br>` is used, write the intended line grouping in the storyboard first.
- After changing fonts, weights, card width, or copy length, rerender and inspect again.

## PPT Smell Check

Before HTML/CSS preview, fix the carousel if any of these are true:

- Card 1 starts with the source publisher instead of the viewer's situation.
- The card sequence explains features before showing why the viewer should care.
- The copy could be read as a company briefing slide.
- There is no concrete reason to swipe after card 1.
- There is no reason to save, comment, share, or try.
- Visuals are thumbnails or decoration instead of proof.
- Technical words appear without plain-language translation.
- Every card uses the same layout rhythm.
- The CTA asks for attention without giving a clear reason to save, comment, share, click, or try.
- Promotional posts do not explain the offer, proof, objection, and next action.

## Review Stages

Use these stages in order:

1. Viewer frame review for target, pain, curiosity, and action reason
2. Copy review for message and flow
3. Media reference review for images, video, demos, screenshots, and attribution
4. Text wireframe review for hierarchy
5. HTML/CSS preview review for actual layout and line-break QA
6. Motion preview review for MP4 cards when applicable
7. Final render approval for PNG and MP4

Do not render final assets before HTML/CSS preview approval.
