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

## Caption Attribution Rule

When writing Instagram or social captions for external sources, use `Contents Editor · <channel/person>` for the channel's curation/editing credit. Do not use `Editor · ...` because that can imply the channel created the original tool, repo, video, or source.

Keep source attribution separate as `Source · <original owner/source>`.

Also include direct links that help viewers verify or use the source. If the post introduces a GitHub repo, tool, app, paper, official announcement, demo video, guide, or downloadable resource, add a plain CTA link line in the caption, such as:

`써보시려면 여기 GitHub 링크 참고해보세욤: <url>`

Prefer one or two high-signal links over a long source dump.

## Humanized Marketing Rule

Every carousel must pass a humanized marketing review before HTML/CSS preview and again before final caption approval. Use this as a quality gate, not an optional polish step.

- Remove AI-sounding filler, stiff summaries, and vague benefit words.
- Translate jargon into viewer language before it reaches the card.
- Check the hook, promise, proof, save/comment/share reason, and CTA.
- Run Korean Persona Copy QA with real `Nemotron-Personas-Korea` samples when the copy risks sounding translated, too global, too technical, or weak for Korean viewers.
- For product, app, campaign, launch, lead magnet, or PitchCheck promotion, activate ad/conversion mode and define the offer, audience, proof, objection, CTA, and destination.
- Keep channel personality, such as a friendly tutor voice for AIjjuun, but do not let cuteness weaken clarity or trust.

Read `references/humanized-marketing-copy.md` when drafting or revising copy, captions, CTAs, promotional angles, or any post that feels too PPT-like or AI-written.

Read `references/korean-persona-copy-qa.md` when the source is translated from English, the first hook feels generic, the topic is technical, or the user asks for more Korean-native copy. Use `scripts/sample_korean_personas.py` to sample real rows from `nvidia/Nemotron-Personas-Korea` before relying on imagined personas. If network or dependencies are unavailable, use cached samples first and only use a clearly labeled fallback panel when no real sample is available.

## Korean Persona Copy QA

Use Korean Persona Copy QA as the default rewrite layer for Korean Instagram-first posts where audience fit matters.

- Build a 5-7 person reader panel from real `Nemotron-Personas-Korea` samples whenever practical.
- Do not quote sampled personas as real people; use them as synthetic reader testers.
- Ask what each sampled reader understands in 2 seconds, what feels translated, and what phrase would make the point feel closer to daily life.
- Rewrite hooks, card headlines, body copy, captions, and CTA until the meaning is clear to a non-expert Korean reader.
- Record the panel summary and rewrite notes in `storyboard.md`.
- If the dataset cannot be accessed, write why and use cached samples or a labeled fallback panel.

Sampler command:

```powershell
python skills\auto-card-news\scripts\sample_korean_personas.py --count 7 --topic "<topic>"
```

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

## Instagram Typography Baseline

Design for phone readability after Instagram upload, not desktop preview comfort. For the default 4:5 output size (`1080x1350`), start with this larger typography scale and only reduce it when the rendered card proves it still reads clearly on mobile.

- Default Korean headline and main body font: `Griun Mongtori` from `Griun_Mongtori-Rg.ttf`.
- Use `Moneygraphy Rounded` only as a fallback, for small UI labels, or when the user explicitly asks for a different visual voice.
- For AIjjuun-style and default card-news output, headline, hook, body copy, thread mockup copy, checklist copy, and HTML-native visual text should use `Griun Mongtori`.
- Keep code, command, and tool names in a monospace font such as `Consolas` only when they are intentionally shown as code.
- When copying an older project or script, check that the generated CSS does not set `html, body`, `.title`, `.body`, `.cover-title`, or motion-card text to `Moneygraphy Rounded` as the primary font.

Default CSS pattern:

```css
@font-face {
  font-family: "Griun Mongtori";
  src: url("../assets/fonts/Griun_Mongtori-Rg.ttf") format("truetype");
  font-weight: 400;
}

@font-face {
  font-family: "Moneygraphy Rounded";
  src: url("../assets/fonts/Moneygraphy-Rounded.woff2") format("woff2");
  font-weight: 700;
}

body {
  font-family: "Moneygraphy Rounded", system-ui, sans-serif;
}

.cover-title,
.cover-sub,
.title,
.body,
.thread-text,
.checklist,
.visual-copy {
  font-family: "Griun Mongtori", "Moneygraphy Rounded", system-ui, sans-serif;
  font-weight: 400;
  letter-spacing: 0;
}
```

- Cover or hook headline: `88-104px`, line-height `1.02-1.08`.
- Normal card headline: `76-94px`, line-height `1.04-1.12`.
- Support copy: `34-42px`, line-height `1.28-1.38`.
- Prompt/code/example text that must be read: `32-38px`.
- Chips, badges, and labels: `28-34px`.
- Page numbers and source text: page `26-30px`, source `22-24px`.

Do not use small body text as the main message. Anything under `30px` should be metadata, attribution, or decorative UI only.

When using chunky Korean display fonts such as Griun Mongtori or Moneygraphy-style rounded fonts, check the rendered line breaks after increasing size. Larger is usually better for Instagram, but it must not create orphaned words, clipped text, or chip overlap.

## Static And Motion Typography Consistency

Static PNG cards and motion MP4 cards in the same carousel must feel like one design system. Before rendering a motion card, compare its CSS against the approved static card CSS or `design.md`.

- Use the same primary font file, `font-family`, weight, size scale, line-height, and letter spacing unless the storyboard explicitly calls for a different voice.
- If a motion card replaces a PNG card in the carousel, copy the matching static card's headline, body, chip, page, brand, and source typography rules first, then add animation.
- After any font change, render a still frame from the MP4 and compare it with the PNG card before final export.

## Editorial Visual Cover Rule

For the first card of news, tool, launch, or trend carousels, consider an editorial cover before using a plain graphic layout. A strong cover can use a full-bleed photo, generated visual, official screenshot, product UI, or demo frame as the main background, with the text anchored over a dark bottom gradient.

Use this cover pattern when the topic needs a fast stop-scroll signal:

- Full-bleed visual fills the card and carries the topic mood.
- Top or center brand mark stays small and clean.
- Category pill sits above the headline, e.g. `AI NEWS | PROMPT`.
- Main headline is very large, usually `88-104px`, and placed in the lower third.
- A black gradient, blur, or dim overlay protects text readability.
- Source attribution remains small but readable near the bottom.

Do not copy another creator's cover image as the final asset. Use user-provided examples as composition references, then use safe media: official screenshots, generated visuals, licensed media, or recreated HTML-native scenes.

This rule is channel-agnostic. Apply it beyond AIjjuun whenever the first card needs stronger feed impact:

- AI/news/tool channels: official UI screenshot, generated 3D object, product mockup, docs page, demo frame.
- Football channels: stadium photo, match moment, tactics board, player silhouette, app screen, fixture graphic.
- PitchCheck/app marketing: phone mockup, field/check-in scene, user workflow screenshot, before/after attendance state.
- General education or info channels: symbolic photo, generated editorial scene, diagram-as-background, creator-style thumbnail visual.

If the first card looks like a PPT title slide, redesign it as an editorial visual cover before final export unless the user explicitly wants a minimal text-only style.

When planning the storyboard, mark Card 01 as one of:

- `Editorial visual cover`
- `Motion hook cover`
- `Minimal text cover`

Default to `Editorial visual cover` or `Motion hook cover` for Instagram-first content.

## Media-Led Body Cards

Do not make only the first card visual. For cards after the cover, prefer a media-led editorial layout whenever there is useful visual proof, source material, screenshot, demo frame, generated scene, or simple diagram available.

Recommended body-card structure:

- Top half: large framed image, screenshot, video frame, UI mockup, generated visual, or HTML-native scene.
- Bottom half: black or dark copy area with a large card number, one clear headline, and 2-4 short lines of explanation.
- Keep the image or video large enough to explain the point before the viewer reads the text.
- Use the copy to translate the visual into plain language, not to repeat a long article summary.
- End with a small channel/source mark, not a large decorative footer.

AI Trend-style article cards are a default fallback for news/tool/explainer body cards:

- Use the upper `45-55%` of the card for the screenshot, demo frame, product UI, generated visual, or visual reconstruction.
- Use the lower area as a dark editorial text block with a visible card number, a big headline, and only the essential context.
- Prefer one strong visual plus one plain-language takeaway over several small decorative elements.
- If the source has a demo video, use a still frame or short motion crop for the relevant card.
- If safe direct media is unavailable, recreate the idea with HTML-native UI, prompt cards, code panels, checklists, or generated editorial visuals.

For Instagram-first carousels, cards 2-7 should usually alternate between proof image + explanation, before/after visual + takeaway, screenshot/callout + simple interpretation, checklist/diagram + save-worthy use, and motion/demo clip + one sentence result.

If a card looks like a dense slide, replace some text with a visual or split the idea into another card.

## HERMES Editorial Pattern

Use this as the default high-quality pattern for AI/news/tool/security/developer carousels unless the user asks for another style. This pattern was validated by the HERMES/Claude Code issue carousel.

- Card 01: full-bleed or near-full-bleed real source screenshot, product UI, official page, or strong generated editorial visual. Put a large human hook in the lower third over a black gradient.
- Cards 02-07: use an AI Trend-style editorial layout: upper `45-55%` = one strong visual/proof area; lower area = large card number, one big headline, and only the shortest useful explanation.
- Every card needs a different job. Do not repeat the same image with slightly different text for several cards. Rotate between proof screenshot, terminal/demo, before-after comparison, diagram, checklist, and source page.
- Prefer one large visual over many small ornaments. The viewer should understand the card faster from the visual than from the paragraph.
- Keep the copy concrete and spoken. Say "커밋 메시지에 이 문자가 있으면 요금 경로가 바뀌었다는 보고예요" instead of abstract phrases like "메타데이터 라우팅 이슈입니다."
- For developer/tool topics, terminal typing, side panel typing, diff reveal, issue page highlight, billing meter, checklist reveal, and cursor/callout motion are strong defaults.
- Motion should usually replace or enhance one important card, not every card. Pick the card where movement makes the explanation clearer or increases retention.
- Before final render, compare the motion preview with static PNGs and match the font, size scale, chip style, black background, and label placement.
- If a visual is generated as SVG, canvas, screenshot-style UI, or HTML-native mockup, use the same approved card font inside that visual too. A different internal font can make the whole carousel feel inconsistent even when the main headline CSS is correct.
- Rewrite translated source language into Korean social copy. Prefer "목표 하나 던지면 끝까지 물고 간다고?" or "커밋 한 줄 때문에 토큰 폭탄 맞았다고?" over direct translations like "persistent workflows were introduced."

Quality smell checks:

- If three cards could swap their images without changing meaning, the storyboard is too generic.
- If the card still works after deleting the visual, the visual is too decorative.
- If the body paragraph explains what the screenshot should have explained, strengthen the visual or simplify the claim.
- If the output feels like a product deck or PPT, rebuild it with the HERMES pattern.

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

5. **Build a Korean reader panel when copy risk is high**
   - If the topic comes from English source material, AI docs, GitHub, technical news, or global product copy, run Korean Persona Copy QA before finalizing angles.
   - Use `scripts/sample_korean_personas.py` to sample real `Nemotron-Personas-Korea` rows when network and dependencies are available.
   - Save the sampled panel, translation-smell notes, and rewrite decisions in `storyboard.md`.
   - If the sampler cannot run, record the reason and use cached samples before using an imagined fallback panel.

6. **Search media references**
   - For tool, app, product, sports, or visual topics, search for images, screenshots, official demos, product pages, and video references before finalizing the storyboard. Do this aggressively enough that the final carousel does not feel text-only.
   - Prefer official demos, official product pages, GitHub issues/releases, docs pages, credible creator walkthroughs, and source videos when motion or product understanding matters.
   - For news/tool topics, aim to gather at least 3-5 usable visual candidates before designing: cover candidate, proof screenshot, motion/demo candidate, context page, and checklist/source candidate.
   - Do a per-card media pass, not only a cover search: for each card, try to find or create one visual anchor such as an official screenshot, demo frame, source page, product UI, user-provided file, generated editorial visual, or HTML-native reconstruction.
   - Record media source, URL, usage idea, rights/attribution notes, and whether it is for direct use or reference-only in `source-pack.md`.
   - For first-card covers, look for a strong full-bleed visual candidate or plan a generated/editorial visual before settling for a plain text card.
   - For body cards, also look for per-card visual proof or plan HTML-native media panels. Do not stop media planning after the cover.
   - If the user provides social screenshots, use them as leads or reference unless they explicitly approve direct reuse. Verify the underlying source with official pages, GitHub, docs, blogs, articles, or credible primary material when possible.
   - If no safe media is available, create HTML-native visuals, generated visuals, or screenshot-style recreations instead of using generic decoration.

7. **Propose carousel angles**
   - Summarize the source only after the viewer frame is clear.
   - Propose two or three angles even when the user gives a direction.
   - Each angle includes an angle name, target situation, hook example, why people keep swiping, and expected 5-8 card flow.
   - Prefer hooks that name the viewer or situation: "포토샵 켜놓고 AI 따로 쓰던 분들, 이거 꽤 큽니다."
   - For each angle, state what the first-card cover visual should be, not just the hook copy.

8. **Draft copy and storyboard**
   - After the user chooses or combines angles, write the full card copy draft in one pass.
   - Number every card.
   - Keep each card to one clear job: stop, identify, explain, prove, make useful, interpret, or prompt action.
   - For every card, write both the text copy and the visual/media idea. Body cards need a visual plan, not only a headline and paragraph.
   - Apply the HERMES Editorial Pattern for AI/news/tool/developer topics by default: each card must have a visual job and a copy job.
   - Use human, plain-language copy. Avoid vague phrases such as "체감 이득" unless immediately rewritten as "뭐가 덜 귀찮아지는지 / 뭐가 빨라지는지 / 뭐가 쉬워지는지."
   - Use channel viewpoint labels such as `<채널명> 관점` or `<채널명> 해석`. Avoid awkward labels like `<채널명>식 해석` unless the user prefers it.
   - Run the Humanizer and Marketing checks from `references/humanized-marketing-copy.md` before asking for copy approval.
   - Run Korean Persona Copy QA from `references/korean-persona-copy-qa.md` before copy approval when the copy risks sounding translated or too abstract for Korean readers.
   - If the post is promotional, run ad/conversion mode before writing the CTA.
   - Treat this as first-pass approval, not final approval.
   - Create a text wireframe before HTML/CSS.

9. **Evaluate static vs motion by card**
   - For each card, decide whether static PNG or motion MP4 is more effective.
   - Prefer motion when a first-card hook, product demo, before/after, timeline, or workflow will increase retention.
   - Use searched video references, official demos, screenshots, or HTML-native animation as the motion source.
   - For HTML/CSS-native card motion, prefer HyperFrames first because it matches the per-card HTML workflow and is easier to revise for copy, layout, typing, side-panel, chip, and UI callout motion.
   - Use Remotion as the backup or primary engine for complex timelines, React-heavy templates, audio, video compositing, advanced media control, or when HyperFrames cannot render reliably.
   - Record the chosen motion engine per card in `motion-plan.md`, including the reason for choosing HyperFrames, Remotion, or static PNG.
   - Explain motion recommendations briefly.
   - Ask for approval before creating motion output.
   - Read `references/rendering-and-motion.md` for decision rules.

10. **Create preview before final export**
   - Build one HTML file per card, plus an index preview when useful.
   - Review content, layout, spacing, rhythm, visual proof, and design with the user.
   - If using external images or video references, make them large enough to carry the card and protect text readability with dimming, blur, and gradient transitions.
   - For first-card editorial covers, check that the image reads immediately and the headline remains dominant over the visual.
   - For body cards, check that the visual explains the card before the paragraph does. If the viewer must read a long paragraph to understand the card, simplify the copy or strengthen the visual.
   - For media-led cards, place small label chips in the lower safe zone instead of over the important visual proof.
   - Apply the Instagram Typography Baseline before the first serious preview. If the preview looks fine on desktop but small on a phone-like viewport, increase font size before rendering final files.
   - Check spacing between chips, section badges, and headline; adjust per card instead of forcing one saved position everywhere.
   - Run line-break QA on rendered previews: no awkward wraps, no lonely short words, no clipped text, and no heading that reads unlike natural speech.
   - Run the humanized marketing review again after layout changes because a line that worked in text may sound stiff or cramped once placed on the card.
   - Run the PPT smell check from `references/project-workflow.md` before final render.
   - Render final files only after approval.

11. **Render final assets**
   - Static cards default to PNG.
   - Motion cards default to MP4.
   - Motion-card engine default: HyperFrames for short HTML/CSS/GSAP card animations; Remotion for complex video work or as a reliable fallback.
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
- Read `references/humanized-marketing-copy.md` when polishing card copy, captions, CTAs, ad/conversion angles, or AI-sounding drafts.
- Read `references/korean-persona-copy-qa.md` when testing Korean hooks, translated source copy, captions, or CTA against real `Nemotron-Personas-Korea` samples.
- Read `references/design-and-references.md` before writing `design.md`, `channel.css`, or card layouts.
- Read `references/rendering-and-motion.md` before deciding PNG vs MP4 or producing final exports.
- Use `last30days` when fresh source discovery is needed before carousel production.

## Completion Criteria

A carousel project is complete only when:

- The active channel is explicit.
- Source, viewer frame, brief, storyboard, and motion plan are saved when applicable.
- Each card has a clear viewer reason to swipe, save, comment, or share.
- Copy, caption, and CTA pass the Humanizer, Marketing, and ad/conversion checks when applicable.
- Korean Persona Copy QA is recorded when the topic is technical, translated, or at risk of sounding unlike Korean social copy.
- HTML/CSS preview has been reviewed.
- Rendered previews pass line-break QA with no orphaned words or awkward phrase splits.
- Main text follows the Instagram Typography Baseline and remains readable after phone-size review.
- Static PNG cards and motion MP4 cards share the same approved typography system unless a deliberate exception is documented in `design.md` or `motion-plan.md`.
- Card 01 has an explicit cover decision, and Instagram-first posts avoid PPT-like title covers unless intentionally chosen.
- Body cards have explicit visual/media direction and avoid dense PPT-like paragraph slides.
- Final output files match the approved card-level export plan.
- The user has a mixed output package such as `card-01.png`, `card-02.mp4`, `card-03.png`.
