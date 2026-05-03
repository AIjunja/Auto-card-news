# {channel_name} Design

## Design Philosophy

{design_philosophy}

## Typography

{typography}

### Default Korean Font

- Main Korean headlines and body copy use `Griun Mongtori` from `Griun_Mongtori-Rg.ttf`.
- `Moneygraphy Rounded` is a fallback or small UI-label font, not the default headline/body voice.
- Code, commands, package names, and tool names may use monospace when they need to read as code.
- Static PNG and motion MP4 output must use the same primary Korean font.

### Instagram Typography Baseline

- 4:5 cards (`1080x1350`) should be designed for phone readability after Instagram upload.
- Cover or hook headline: `88-104px`.
- Normal card headline: `76-94px`.
- Support copy: `34-42px`.
- Readable prompt/code/example text: `32-38px`.
- Chips, badges, and labels: `28-34px`.
- Page number: `26-30px`; source text: `22-24px`.
- Main explanatory copy should not fall below `34px` unless the card is intentionally a dense reference card.

### Static And Motion Typography Match

- Static PNG and motion MP4 cards use the same approved primary font, font weights, line-height, letter spacing, chip style, brand style, and source style.
- Motion CSS starts from the matching static card CSS unless the design explicitly documents a different choice.
- After a motion render, compare at least one still frame with the PNG/HTML card before final approval.

## Color

{color}

## Layout

{layout}

## Card-News Rhythm

{card_news_rhythm}

## Card Composition

{card_composition}

### Editorial Visual Cover

- First-card news/tool/trend covers may use a full-bleed visual background instead of a plain graphic title card.
- This is a channel-wide pattern, not an AIjjuun-only style. Adapt the visual subject to the channel: AI tools, football, apps, products, education, or marketing.
- Use official screenshots, generated visuals, licensed media, or recreated HTML-native scenes.
- Add a bottom-heavy dark gradient or blur so the title stays readable.
- Place a small brand mark near the top, a compact category pill above the headline, and a very large headline in the lower third.
- Do not reuse another creator's cover artwork as final output unless the user owns or licenses it.
- If Card 01 feels like a PPT title slide and safe visual material exists, redesign it as an editorial visual cover before final export.

## Media Treatment

{media_treatment}

### Media-Led Body Cards

- Cards after the cover should still use strong visual proof when possible.
- Prefer a top visual area plus bottom copy area: screenshot/video frame/generated scene on top, large number/headline/short explanation below.
- Keep body-card copy to one headline and 2-4 short lines.
- For AI Trend-style article cards, make the upper `45-55%` a proof visual and the lower area a dark editorial copy block.
- Use actual product UI, official screenshots, demo frames, user-provided media, generated visuals, or HTML-native reconstructions as the visual proof.
- If useful external media is used, record its source and keep attribution/caption links.
- If no safe media exists, create HTML-native visual panels or generated visuals rather than falling back to dense text slides.
- Do a per-card media pass before final storyboard approval. Every card should have one visual anchor or a documented reason for staying text-first.

## Components

{components}

## Motion

{motion}

## Avoid

{avoid}

## Design Review Checklist

- Text remains readable on mobile.
- Main text follows the Instagram Typography Baseline.
- First-card covers use a strong full-bleed visual when the topic benefits from it.
- Body cards keep the same media-led editorial quality, not only the cover.
- No short word is stranded alone after rendering.
- Media label chips sit in the lower safe zone and avoid important visual proof.
- Check spacing between chips, section badges, and headline before approving.
- Important hierarchy is visible in the first second.
- The first card names a viewer, situation, or curiosity.
- Each card has one main job and one main message.
- Visuals prove, clarify, or dramatize the message.
- External media uses dim, blur, or gradient treatment when text overlays it.
- Static and motion cards feel like one channel.
- Project-level CSS supports the channel system.
- The carousel does not feel like a PPT briefing deck.
