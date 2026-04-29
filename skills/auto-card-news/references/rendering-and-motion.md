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

Use Remotion-style structure when creating motion cards. Keep motion short and purposeful. Respect the channel design system. Ask for approval before generating motion output.

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
- Export target: MP4 for motion cards, PNG fallback if motion is not approved

Keep the first second strong. If the card only becomes clear after several seconds, rewrite the hook or simplify the animation.

## Remotion License Reminder

Remotion has license conditions that can matter for company or commercial use. When a project relies on Remotion for commercial work, remind the user to confirm the license terms before shipping.
