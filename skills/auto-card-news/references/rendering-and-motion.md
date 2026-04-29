# Rendering and Motion

Use this reference before choosing static PNG, motion MP4, or optional JPEG/PDF output.

## Output Model

Each card has its own output type. A final carousel can mix files:

```text
output/
  card-01.png
  card-02.mp4
  card-03.png
```

## Static PNG

Use static PNG for:

- Dense reading cards
- Save-worthy checklists
- Summary cards
- Quiet explanation cards
- Cards that need visual stability

Use HTML/CSS as the source and Playwright or an equivalent browser renderer to capture the final card. PNG is the default. JPEG and PDF are optional only when requested.

## Motion MP4

Use motion MP4 when motion improves retention, attention, or understanding.

Recommend motion for:

- Count-up numbers
- Animated comparisons
- Step-by-step processes
- Football tactics, such as player movement or passing lanes
- PitchCheck app interactions, such as taps, checks, confirmations, and screen transitions
- Before/after transformations
- Hook reveals
- Timelines and rankings
- Official demo clips or UI walkthroughs
- Screenshot callouts with zoom, cursor, or tap movement

Keep motion short and purposeful. Respect the channel design system. Ask for approval before generating motion output.

## Motion Engine Selection

Prefer HyperFrames first for normal card-news motion when the card is already designed in HTML/CSS.

Use HyperFrames for:

- Short 3-6 second card animations
- Typing effects, side panels, chip movement, tooltip reveals, cursor/tap paths, UI callouts, and simple zooms
- HTML/CSS/GSAP-native scenes that should stay close to the static card design
- Fast copy and layout iteration where the user may revise wording, line breaks, or placement
- Browser-extension-style previews or future workflows where text editing happens directly on HTML cards

Use Remotion when:

- The card needs complex timeline control, React components, audio, heavy video compositing, or multiple media tracks
- A searched demo video must be cut, layered, timed, or combined with other footage
- HyperFrames is unavailable, fails to render reliably, or cannot handle the required media
- A reusable production video template is more important than direct HTML/CSS editability

Record the chosen engine in `motion-plan.md` for every motion card:

```text
Card 02
- Output: MP4
- Engine: HyperFrames
- Reason: HTML side-panel typing motion; copy and chip placement may change often.
```

Do not choose motion just because an engine is available. If a card is clearer as a static save-worthy card, keep it PNG.

## HyperFrames Render Notes

Run `hyperframes lint` and `hyperframes inspect` before final rendering when HyperFrames is used. If lint warns that a composition file is too large, split scenes or layers into smaller composition files before making the pattern reusable.

HyperFrames rendering needs Chrome and FFmpeg. If rendering reaches encoding and fails with `spawn ffmpeg ENOENT`, add a known FFmpeg directory to `PATH` or use the FFmpeg bundled with an existing Remotion install when available.

Use `npx hyperframes render ... --quality draft` for quick proof renders, then render final quality only after the user approves the motion direction.

## Video Reference Search

When a topic involves a tool, app, product launch, or workflow, look for useful video references before deciding the motion plan:

- Official announcement videos
- Product demos
- Documentation demos
- Credible creator walkthroughs
- Short clips showing the exact feature, UI, or before/after result

Record the chosen video source, URL, usable segment, and attribution text in `motion-plan.md` or `source-pack.md`.

Do not rely on a video just because it looks exciting. Use it only when it helps the viewer understand what changed, how it works, or why they should care.

## Motion Card Structure

For each MP4 card, define:

- Viewer reason: what will make the viewer stop or keep watching
- Source media: video, screenshot, generated scene, or HTML-native animation
- Motion idea: reveal, zoom, comparison, callout, tap/cursor path, timeline, or loop
- Duration: usually 3-6 seconds for a carousel card
- Engine: HyperFrames, Remotion, or another explicitly chosen renderer
- Export target: MP4 for motion cards, PNG fallback if motion is not approved

Keep the first second strong. If the card only becomes clear after several seconds, rewrite the hook or simplify the animation.

## Remotion License Reminder

Remotion has license conditions that can matter for company or commercial use. When a project relies on Remotion for commercial work, remind the user to confirm the license terms before shipping.
