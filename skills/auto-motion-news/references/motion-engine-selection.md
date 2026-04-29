# Motion Engine Selection

Use this reference before deciding HyperFrames, Remotion, video-use, or static fallback for a scene.

## Default Recommendation

For short-form information videos derived from scripts or card-news, prefer:

```text
HyperFrames first
Remotion for complex video work
video-use for editing user-recorded footage
```

## HyperFrames

Use HyperFrames when the scene can be expressed as HTML/CSS/GSAP:

- big subtitles
- typing effects
- side panels
- browser or app UI mockups
- chip movement
- tooltip reveals
- cursor or tap paths
- screenshot zooms
- short visual loops

HyperFrames is a good match when copy and layout may change often because it stays close to editable HTML.

Run:

```text
hyperframes lint
hyperframes inspect
hyperframes render
```

If rendering reaches encoding and fails with `spawn ffmpeg ENOENT`, add FFmpeg to `PATH` or use an existing bundled FFmpeg such as one from a Remotion install.

## Remotion

Use Remotion when the scene or full video needs:

- narration sync
- BGM and effects timing
- multiple video tracks
- audio
- complex timeline control
- advanced compositing
- reusable React video templates
- longer videos

Remotion is often better for final assembly when many scenes, audio, and media clips must sync precisely.

Remind the user to confirm Remotion license terms for commercial use when the project depends on Remotion.

## video-use

Use video-use as a companion or future workflow when the input is existing footage:

- talking-head video
- screen recording
- interview
- lecture
- recorded tutorial
- footage that needs transcript-based cuts

It is not the default for "script to generated motion graphics." It is closer to an AI video editor for existing footage.

## Static Fallback

Choose static PNG or no motion when:

- motion does not improve clarity or retention
- the scene is a save-worthy checklist
- the screen is too dense for movement
- the visual source is weak
- the scene should be a card-news asset instead of a video scene

Motion should earn its place.

