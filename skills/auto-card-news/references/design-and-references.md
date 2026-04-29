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
