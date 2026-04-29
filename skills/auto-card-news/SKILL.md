---
name: auto-card-news
description: Use when the user wants to create, design, preview, or render carousel/card-news content, especially channel-aware Instagram carousels with static cards, motion cards, HTML/CSS, PNG, or MP4.
---

# Auto Card News

Use this skill when the user wants to create a carousel, card-news post, Instagram carousel, mixed image/video carousel, or channel-specific content package.

## Operating Language

Ask and explain in Korean by default. Use another language only when the user requests it or the source material requires it.

## Core Rule

This is a conversation-driven production workflow, not a SaaS app and not upload automation. Do not automatically upload to Instagram or any social platform.

## Engagement-First Rule

Do not make PPT-like briefing slides. A carousel must start from the viewer's concrete situation, pain, desire, or curiosity. The source is supporting evidence, not the opening frame.

Before writing copy, define:

- Who will stop scrolling for this?
- What are they already frustrated by, curious about, or trying to do?
- What becomes easier, faster, clearer, or less annoying after knowing this?
- Why would they save, comment, share, or swipe to the next card?

If those answers are vague, fix the angle before designing.

## Line Break QA

Treat line breaks as part of the copy, not decoration. Do not leave an orphaned word, particle, or short ending alone on its own line unless the card is intentionally designed around that emphasis.

- Keep meaning chunks together: `AI 따로 쓰는 분들`, not `AI 따로 쓰는 / 분들`.
- Add manual `<br>` only after deciding the spoken phrase grouping.
- When a font changes, render again and re-check all headings because glyph width can change the line breaks.

## Media Bottom Labels

For cards with a large screenshot, demo video, or tool UI plus small label chips, place the chips in the lower safe zone of the media frame, over the dark gradient area near the bottom. Do not cover the main subject, cursor, UI state, or proof area with label chips.

- Keep the category badge such as `Blender 예시` or `Adobe 예시` near the copy block if that card uses it as the section label.
- Put supporting chips such as `장면 확인`, `스크립트 생성`, `반복 수정`, `사진 보정`, or `SNS 이미지` near the media-frame bottom.
- Use this as the default for similar media-led cards unless the visual needs a different callout position.

## Spacing Relationship QA

Do not copy a saved position blindly. After applying a reusable layout rule, check the spacing relationship between chips, section badges, and the first headline line.

- If chips feel crowded against a section badge such as `Adobe 예시` or `Blender 예시`, move the chips slightly within the media gradient or move the badge into the copy block.
- If the headline is tall or three lines, leave more breathing room between the badge and chips.
- Prefer a visually balanced relationship over identical pixel positions across different cards.

## Required Workflow

1. **Confirm channel context**
   - Ask whether to use an existing channel profile or create a new one.
   - Reconfirm the active channel before working on the source.
   - Keep AI information, football information, and PitchCheck marketing contexts separated.

2. **Create or update the channel profile**
   - If no profile exists, collect the six profile fields one focused question at a time.
   - If the channel already exists, ask for the channel link and recommend at least three representative posts.
   - If posts are unavailable, create a tone-and-direction profile without making strong visual claims.
   - Read `references/channel-profiles.md` when creating or updating profiles.

3. **Intake source material**
   - Accept URLs, reports, memos, drafts, pasted GPT conversations, screenshots, captions, or raw notes.
   - If the user has no source, asks for source discovery, or needs current AI information, use the installed `last30days` skill first: https://github.com/mvanhorn/last30days-skill
   - Ask `last30days` for fresh source discovery, then convert its research output into `source-pack.md` with source candidates, verification notes, and recommended angles.
   - If a URL is blocked or incomplete, ask the user to paste the relevant text or provide screenshots.
   - Save source material to `source.md` in the project.

4. **Define the viewer frame**
   - Write a short audience-first frame before proposing angles.
   - Translate abstract claims into plain Korean. Example: "tool integration" becomes "내가 쓰는 프로그램 안에서 바로 시킬 수 있음."
   - Reject hooks aimed at the wrong audience. Example: if the content is for designers, do not open with a generic "AI 답변 복붙하던 사람들."
   - Save the frame in `brief.md`.

5. **Search media references**
   - For tool, app, product, sports, or visual topics, search for images, screenshots, official demos, product pages, and video references before finalizing the storyboard.
   - Prefer official demos and credible creator walkthroughs when motion or product understanding matters.
   - Record media source, URL, usage idea, rights/attribution notes, and whether it is for direct use or reference-only in `source-pack.md`.
   - If no safe media is available, create HTML-native visuals, generated visuals, or screenshot-style recreations instead of using generic decoration.

6. **Propose carousel angles**
   - Summarize the source only after the viewer frame is clear.
   - Propose two or three angles even when the user gives a direction.
   - Each angle includes an angle name, target situation, hook example, why people keep swiping, and expected 5-8 card flow.
   - Prefer hooks that name the viewer or situation: "포토샵 켜놓고 AI 따로 쓰던 분들, 이거 꽤 큽니다."

7. **Draft copy and storyboard**
   - After the user chooses or combines angles, write the full card copy draft in one pass.
   - Number every card.
   - Keep each card to one clear job: stop, identify, explain, prove, make useful, interpret, or prompt action.
   - Use human, plain-language copy. Avoid vague phrases such as "체감 이득" unless immediately rewritten as "뭐가 덜 귀찮아지는지 / 뭐가 빨라지는지 / 뭐가 쉬워지는지."
   - Use channel viewpoint labels such as `<채널명> 관점` or `<채널명> 해석`. Avoid awkward labels like `<채널명>식 해석` unless the user prefers it.
   - Treat this as first-pass approval, not final approval.
   - Create a text wireframe before HTML/CSS.

8. **Evaluate static vs motion by card**
   - For each card, decide whether static PNG or motion MP4 is more effective.
   - Prefer motion when a first-card hook, product demo, before/after, timeline, or workflow will increase retention.
   - Use searched video references, official demos, screenshots, or HTML-native animation as the motion source.
   - Explain motion recommendations briefly.
   - Ask for approval before creating motion output.
   - Read `references/rendering-and-motion.md` for decision rules.

9. **Create preview before final export**
   - Build one HTML file per card, plus an index preview when useful.
   - Review content, layout, spacing, rhythm, visual proof, and design with the user.
   - If using external images or video references, make them large enough to carry the card and protect text readability with dimming, blur, and gradient transitions.
   - For media-led cards, place small label chips in the lower safe zone instead of over the important visual proof.
   - Check spacing between chips, section badges, and headline; adjust per card instead of forcing one saved position everywhere.
   - Run line-break QA on rendered previews: no awkward wraps, no lonely short words, no clipped text, and no heading that reads unlike natural speech.
   - Run the PPT smell check from `references/project-workflow.md` before final render.
   - Render final files only after approval.

10. **Render final assets**
   - Static cards default to PNG.
   - Motion cards default to MP4.
   - JPEG and PDF are optional and only generated when requested.

## Ratio Defaults

Use the active channel profile's default ratio when available. If absent, recommend Instagram 4:5. Also support 1:1, 9:16, and custom pixel sizes when requested.

## Artifact Structure

Use this structure for projects unless the user requests another location:

```text
carousel-workspace/
  profiles/<channel-slug>/
    profile.md
    design.md
    channel.css
  projects/<channel-slug>/<date-topic-slug>/
    source.md
    source-pack.md
    brief.md
    storyboard.md
    motion-plan.md
    index.html
    style.css
    cards/
    output/
```

Use `scripts/init_project.py` to scaffold this structure when helpful.

## References

- Read `references/channel-profiles.md` when creating, analyzing, or updating a channel profile.
- Read `references/project-workflow.md` when turning source material into viewer frames, angles, copy, and storyboard.
- Read `references/design-and-references.md` before writing `design.md`, `channel.css`, or card layouts.
- Read `references/rendering-and-motion.md` before deciding PNG vs MP4 or producing final exports.
- Use `last30days` when fresh source discovery is needed before carousel production.

## Completion Criteria

A carousel project is complete only when:

- The active channel is explicit.
- Source, viewer frame, brief, storyboard, and motion plan are saved when applicable.
- Each card has a clear viewer reason to swipe, save, comment, or share.
- HTML/CSS preview has been reviewed.
- Rendered previews pass line-break QA with no orphaned words or awkward phrase splits.
- Final output files match the approved card-level export plan.
- The user has a mixed output package such as `card-01.png`, `card-02.mp4`, `card-03.png`.
