# Recorded Footage Edit Mode

Use this reference when the user provides screen recordings, talking-head footage, voice recordings, app demos, tutorials, or raw clips and wants a Reel/Short-style edit.

## Goal

Turn real footage into a social-native video without forcing paid transcription. The priority is:

1. remove dead space and slow sections;
2. keep the useful screen/action moments;
3. add HyperFrames or Remotion motion graphics that explain the moment;
4. output a clean 9:16 edit the user can subtitle later.

Subtitles are optional. If the user says they will add subtitles in a later editor, do not burn final captions into the export.

## Default Position

Do not require ElevenLabs. It is only one possible speech-to-text provider, and it is not needed for basic silence cutting, pacing cleanup, or motion graphics.

Free/local-first order:

1. Use visual timing, waveform/silence, user notes, and manual review to cut dead space.
2. Use the user's script, notes, or pasted narration to understand beats and place overlays.
3. Use local STT only if available or approved for installation and it materially improves edit decisions.
4. Use paid APIs only after explicit user approval.

If there is no word-level transcript, avoid claims like "word-perfect filler removal" or "word-perfect subtitles." Use broader cuts, waveform gaps, visible state changes, and manual preview instead.

## Intake Checklist

- Source file paths and formats.
- Target platform: Instagram Reels, YouTube Shorts, TikTok, X, or general vertical video.
- Target length.
- Must-keep moments.
- Must-cut or private moments.
- Audio treatment: keep original audio, mute, lower volume, add BGM, or no audio.
- Subtitle handling: user will add later, no subtitles, guide text only, summary subtitles, or verbatim subtitles.
- Motion graphics style: hook card, command highlights, zoom boxes, cursor pulses, callouts, checklist cards, before/after panels, or end recap.
- Brand style and font. For current AIjjuun/default output, use `Griun Mongtori` for Korean headline and overlay text.

## Privacy Pass

Before preview or final render, inspect for:

- API keys, access tokens, passwords, cookies, auth headers.
- email addresses, phone numbers, usernames, account IDs.
- private repository names, client names, internal paths.
- billing pages, credit balances, invoices, payment methods.
- browser tabs or notifications that reveal personal information.

Blur, crop, cover, or cut anything sensitive.

## Edit Strategy

Before cutting, propose a short strategy:

- hook shape;
- which raw moments to keep;
- silence/dead-space removal approach;
- pacing and target runtime;
- crop/zoom plan for vertical format;
- overlays, callouts, and motion graphics;
- BGM or original-audio treatment;
- subtitle handling;
- uncertain parts that need user confirmation.

Wait for user approval before doing destructive-feeling edit work. Raw files must never be overwritten.

## Silence And Dead-Space Cutting

Before adding visual polish:

- trim long pauses, loading waits, repeated attempts, and dead air;
- keep short context before important actions so the viewer understands what changed;
- use waveform gaps, screen-state changes, and manual preview when transcript timing is unavailable;
- add short audio fades around cuts to avoid pops;
- avoid cutting so aggressively that the demo becomes confusing.

## Motion Graphics Defaults

Use HyperFrames or Remotion to create overlay graphics that are easier to revise than baked-in editing effects:

- 0-2s hook card or terminal zoom hook;
- command highlight or typed command replay;
- cursor pulse, tap circle, or selection glow;
- zoom box/magnifier for small UI text;
- side panel explaining the current step;
- before/after split for result moments;
- checklist reveal for summary;
- end card with one CTA.

Motion graphics should explain the recording, not cover it. If an overlay hides the important screen area, reposition or shrink it.

## Practical Editing Pattern

For screen recordings:

1. Start with a hook card or zoomed terminal/browser moment.
2. Crop to 9:16 around the active UI area.
3. Zoom in when text is important.
4. Highlight commands, buttons, cursor movement, or changed output.
5. Add motion graphics that explain why the moment matters.
6. Add a quick recap/CTA at the end.

For voice/talking-head recordings:

1. Cut slow starts and repeated setup.
2. Keep the strongest human line in the first 2 seconds.
3. Remove long dead air and obvious false starts.
4. Preserve useful laughs, surprise, or reaction beats when they help retention.
5. Use optional emphasis words, zooms, icons, screenshots, or recap cards.

## EDL Shape

Use a simple edit decision list:

```json
[
  {
    "source": "raw-demo.mp4",
    "start": 3.2,
    "end": 8.7,
    "beat": "HOOK",
    "guideText": "Codex에 목표를 걸어두면?",
    "crop": "terminal area",
    "overlay": "/goal command highlight",
    "reason": "shows the feature immediately"
  }
]
```

## Production Rules Borrowed From video-use

These rules are useful even without ElevenLabs:

- Keep raw footage untouched; write outputs to an `edit/` or `output/` folder.
- Use short audio fades around cuts to avoid pops.
- Put subtitles after overlays in the final visual stack only if subtitles are included.
- Inspect cut boundaries before showing a preview.
- Cache or save any transcript/notes so the next edit pass does not restart from zero.
- Persist an edit summary in `project.md` or `edit-notes.md`.

## When Paid STT Is Worth It

Paid STT can be useful when:

- the video is long;
- exact subtitles matter;
- many takes need comparison;
- filler-word removal must be precise;
- cuts must land on exact spoken word boundaries.

If the user only needs dead-space cutting and motion graphics, skip paid STT.
If using paid STT, state the provider and expected cost before running it.

## Output Package

Save:

- `source.md` or `source-notes.md`
- `edit-strategy.md`
- `edl.json` or `edit-plan.md`
- `motion-overlays.md`
- optional `caption.md` only if captions are requested
- `privacy-check.md`
- `output/preview.mp4`
- `output/final.mp4`

