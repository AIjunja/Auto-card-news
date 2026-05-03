# Design and References

Use this reference before writing `design.md`, `channel.css`, card layouts, or project-level CSS.

## Design Strategy

Use a channel design system plus project-level variation. The channel keeps consistent typography, color, layout, and CTA rules. Each project can adjust visual emphasis, card rhythm, media treatment, and special components.

The design goal is not "pretty slides." It is retention: the viewer should understand the point quickly and want to swipe again.

## Card News, Not PPT

Avoid presentation-deck composition. A good carousel card usually has one dominant job:

- Stop scrolling
- Show a relatable problem
- Explain one thing simply
- Show proof with an image, video, screenshot, or diagram
- Make the value obvious
- Ask for a save, comment, share, or try

Do not fill cards with paragraph explanations. If the text feels like a script, reduce the words and let the visual do more work.

## External Image and Video Treatment

When using searched images, screenshots, or video frames:

- Use the media as a primary visual layer, not a tiny thumbnail.
- Protect text readability with a dim overlay, blurred edge, or gradient fade from image to copy area.
- Keep source attribution small but readable.
- Prefer actual tool UI, demo clips, product screens, workflow captures, before/after examples, or field-context visuals.
- Avoid vague stock-like backgrounds when the viewer needs to understand a real tool, product, or scene.

For first cards, consider motion if a short demo loop, zoom-in, cursor movement, reveal, or before/after will stop scrolling better than a static cover.

## Instagram Typography Baseline

Instagram carousels are consumed on phones, often after compression and inside a busy feed. A desktop preview can make text feel larger than it will feel in the app. Use a larger default scale for 4:5 cards (`1080x1350`):

- Default Korean headline and main body copy should use `Griun Mongtori` from `Griun_Mongtori-Rg.ttf`.
- Use `Moneygraphy Rounded` only as a fallback, for small UI labels, or when the user explicitly asks for that look.
- Apply `Griun Mongtori` consistently to cover headlines, card titles, body explanations, checklist copy, thread mockups, HTML-native diagrams, and motion-card text.
- Keep code, command, package, and tool names in monospace only when the text needs to read as code.
- If a script or old project sets `Moneygraphy Rounded` as the primary font for `.cover-title`, `.title`, `.body`, or motion copy, change it before rendering.

- Cover or hook headline: `88-104px`.
- Normal card headline: `76-94px`.
- Support copy: `34-42px`.
- Readable prompt, code, or example text: `32-38px`.
- Chips, badges, and labels: `28-34px`.
- Page number: `26-30px`.
- Source text: `22-24px`.

Main explanatory copy should rarely be below `34px`. Text under `30px` should be limited to source attribution, small UI details, or decorative metadata.

After changing fonts or increasing type size, render again and check:

- No headline is clipped.
- No chip overlaps the final message.
- No source line collides with the CTA or bottom text.
- No single short word is stranded on its own line.
- The card is still readable when viewed at phone size.

## Static And Motion Typography Match

Static cards and motion cards from one carousel must look like the same content family. Motion is allowed to move, reveal, type, zoom, or highlight, but it should not silently switch to a different font voice.

- Start motion CSS from the approved static card CSS or `design.md`.
- Match primary font file, `font-family`, weight, line-height, size scale, letter spacing, chip text, page number, brand, and source attribution styles.
- If a different display font is used for a special beat, document why in `motion-plan.md` and preview a still frame next to the static PNG.
- Do not approve final MP4 until one still frame has been checked against the matching PNG or HTML card.

## Editorial Visual Cover Pattern

For first-card covers, prefer a feed-native editorial image layout when the topic is a news item, tool launch, AI trend, product update, or creator-facing story.

Recommended structure:

- Full-bleed background: official screenshot, product UI, demo frame, generated 3D/illustration, or licensed visual.
- Overlay: bottom-heavy black gradient with optional subtle blur so the headline remains readable.
- Brand mark: small top-center or top-left text, not the main focus.
- Category pill: compact rounded label above the headline, such as `AI NEWS | CODE`.
- Headline: large, blunt, and placed in the lower third.
- Optional proof element: floating UI card, prompt snippet, cursor, badge, or callout that connects the visual to the story.

The cover should feel like a post people would stop on in the Instagram feed, not like a title slide. If the background is too abstract, add a concrete UI, tool screen, device, or generated object that immediately explains the topic.

Use user-provided competitor/reference images only as mood and composition references. Do not reuse their artwork as final output unless the user explicitly owns or licenses it.

This pattern applies across all channel profiles, not only AI news:

- AI/tool/news: official UI, docs page, generated 3D mascot/object, app screen, demo frame.
- Football: pitch photo, tactical board, player action, stadium atmosphere, fixture or stat visual.
- App/product marketing: device mockup, user workflow, product screen, field/lifestyle scene, before/after state.
- Education/info: symbolic editorial photo, generated scene, diagram background, creator thumbnail-style visual.

During storyboard review, reject a first card that is only a title on a plain background if the topic has a useful visual proof or visual metaphor available.

## Media-Led Body Cards

The visual system should not collapse after the cover. For Instagram-first posts, body cards should usually look like editorial article cards: visual proof on top, clean explanation below.

Use this pattern when explaining examples, features, steps, tools, products, sports moments, app workflows, or source-backed claims:

- Top visual area: screenshot, video frame, generated scene, UI mockup, photo, tactical board, app screen, or HTML-native diagram.
- Bottom copy area: large number, large headline, short plain-language explanation.
- Copy density: one headline plus 2-4 short lines. If a card needs more, split it or move detail to the caption.
- Visual density: the image or demo should be big enough to make the topic understandable at a glance.
- Attribution: keep it small, clear, and separated from the main message.

For external media, prefer official sources, user-provided files, licensed media, or generated visuals. If using public screenshots or demo clips as source material, record the URL and attribution in `source-pack.md` and caption sources. Do not treat random viral images as free assets.

Run a per-card media search pass before locking the storyboard. Every card should have one planned visual anchor: direct-use media, reference-only media, generated visual, source screenshot, product UI, HTML-native reconstruction, chart, checklist, or motion crop. If a card has no visual anchor, simplify the copy or redesign the card.

For AI Trend-style reference layouts, build body cards like mini editorial articles:

- Upper visual: large enough to understand before reading, usually `45-55%` of the card height.
- Lower copy: black or very dark area with a round/soft card number, oversized title, and short context.
- Body copy should usually be `2-3` lines. If it needs more explanation, move detail into the caption.
- Use one actual proof visual per card when possible: official page, demo frame, product screen, source screenshot, workflow capture, or user-provided media.
- If using a video reference, choose the exact moment that proves the card's point; do not use random motion just because motion exists.
- If no direct media is safe, recreate the scene with HTML-native UI panels, prompt examples, terminal windows, checklist blocks, or generated editorial imagery.

## Media Bottom Label Chips

When a card uses a large screenshot, product demo, or tool UI with small supporting labels, put those chips in the lower safe zone of the media frame, over the dark gradient area. This keeps the visual proof readable while still giving the viewer quick anchors.

Use this for chips such as `장면 확인`, `스크립트 생성`, `반복 수정`, `사진 보정`, `SNS 이미지`, and `영상 사이즈`. Keep section badges such as `Blender 예시` or `Adobe 예시` near the copy block unless the card has a deliberate reason to attach the badge to the media.

## Spacing Relationship QA

Shared layout positions are defaults, not locks. After placing labels, judge the relationship between chips, section badges, and the first headline line.

- If a section badge is higher than usual, raise the chips slightly or move the badge down into the copy block.
- If the headline takes three lines, give the badge and chips extra breathing room.
- If chips, badge, and headline visually clump together, separate one element even when it breaks the shared position.

## Layout Rhythm

Vary the rhythm across cards:

- Full-bleed visual with short hook
- Split visual/text with soft transition
- Big comparison: "Before / After"
- One screenshot with two or three callouts
- Checklist or save-worthy summary
- Channel viewpoint card
- CTA card with a specific action

Never use the same title/body/card block repeatedly unless the channel deliberately uses a strict template.

## carousel-automation Reference

Borrow the idea of HTML/CSS templates rendered by Playwright. Useful concepts:

- Fixed ratio viewport
- One card per render target
- CSS-driven layout
- Browser screenshot export
- Content guidelines to prevent overflow

Do not inherit DataTalksClub visual style or unimplemented frame assumptions.

## Motion Reference

Use HyperFrames-style HTML/CSS motion first when the card can stay close to the static card design. This is especially useful for typography, side panels, chips, UI callouts, cursor paths, simple zooms, and other short card-news motion.

Use Remotion-style thinking for cards that need more complex motion:

- Hook reveal
- Demo zoom-in
- Before/after transition
- Step-by-step process
- Timeline or ranking movement
- Cursor/tap/app interaction
- Animated callouts over screenshots or video frames
- Audio, timeline-heavy edits, video compositing, or reusable React video templates

Motion must clarify the point or increase retention. Do not add motion just to make a card feel busy.

## shadcn/ui Reference

Use shadcn/ui as a detail reference for organized information components:

- Cards
- Badges
- Tabs
- Stats
- Callouts
- Compact lists
- Buttons and CTA blocks

The carousel should not look like an app screen unless the content is an app demo. Borrow clarity, spacing, hierarchy, and component discipline.

## oh-my-design Reference

Use an oh-my-design style mindset for `design.md`. Capture:

- Brand or channel philosophy
- Audience and persona
- Voice and tone
- Typography
- Color
- Layout
- Composition patterns
- Motion principles
- Media treatment rules
- Avoid rules
- Review checklist

## Design Review

Before rendering final assets, check:

- Text fits inside each card.
- Important text is visible at mobile size.
- Main copy follows the Instagram Typography Baseline, not tiny desktop-preview sizing.
- First-card covers use a strong full-bleed visual when the topic benefits from it.
- Headline line breaks preserve natural phrase chunks.
- No short word is stranded alone unless it is a deliberate emphasis choice.
- Media label chips sit in the lower safe zone and do not cover important proof.
- Check spacing between chips, section badges, and headline before approving.
- The first card names the viewer, situation, or curiosity clearly.
- Each card has one main job.
- Visuals prove or dramatize the message instead of decorating it.
- External media has readable attribution when used.
- Text over images remains readable through dim, blur, or gradient treatment.
- Card rhythm does not feel repetitive.
- CTA matches the active channel.
- Motion, if used, supports understanding or retention.
- Project-specific CSS does not fight `channel.css`.
