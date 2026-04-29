# {project_name} Motion Plan

## Motion Decision

Motion is used only when it improves attention, retention, or understanding.

## Video / Motion References

| Source | URL | Usable Segment | Why It Helps | Attribution |
| --- | --- | --- | --- | --- |
| {video_source} | {video_url} | {usable_segment} | {video_reason} | {video_attribution} |

## Motion Cards

| Card | Viewer Reason | Source Media | Animation Concept | Duration | Engine | Format |
| --- | --- | --- | --- | --- | --- | --- |
| {card_number} | {reason} | {source_media} | {animation_concept} | {duration} | {engine} | {format} |

## Engine Choice

For each motion card, record the render engine and why it was chosen.

| Card | Engine | Why This Engine |
| --- | --- | --- |
| {card_number} | HyperFrames / Remotion / Other | {engine_reason} |

## Static Cards

- {static_card_note}

## Render Notes

- Motion cards default to MP4.
- Prefer HyperFrames for short HTML/CSS/GSAP card motion such as typing, side panels, chip movement, cursor paths, and simple UI callouts.
- Use Remotion for complex timelines, audio, video compositing, advanced media control, or as a fallback if HyperFrames cannot render reliably.
- Static cards default to PNG.
- First-card motion should make the hook clear within the first second.
- Confirm Remotion license terms for commercial use when motion output depends on Remotion.
