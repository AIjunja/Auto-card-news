---
name: auto-motion-news
description: Use when the user wants to turn a script, card-news project, source link, notes, screen recording, voice recording, or raw footage into a short-form motion video, especially Reels, Shorts, MP4, scene plans, captions, or visual reference research.
---

# Auto Motion News

Use this skill when the user wants to create a short-form video from a script, an existing card-news project, pasted card copy, a source URL, a report, or raw notes.

## Operating Language

Ask and explain in Korean by default. Use another language only when the user requests it or the source material requires it.

## Core Rule

This is a conversation-driven video production workflow, not social upload automation. Do not automatically upload to YouTube, Instagram, TikTok, or any social platform.

## Humanized Marketing Rule

Every script, scene plan, caption, and product-style video must pass a humanized marketing review before motion preview. This rule prevents stiff AI narration and slideshow-style explainers.

- Rewrite narration until it sounds natural when spoken out loud.
- Remove generic AI phrases, press-release rhythm, and vague benefit words.
- Check the first 2-second hook, viewer promise, proof, retention reason, and CTA.
- For product, app, campaign, launch, lead magnet, or PitchCheck promotion, activate ad/conversion mode and define the offer, audience, proof, objection, CTA, and destination.
- Keep the active channel voice, but keep factual or security content trustworthy.

Read `references/humanized-video-marketing.md` when drafting scripts, converting card-news into video, writing captions, or planning promotional videos.

## Visual Source And Typography Rule

For motion made from card-news, the MP4 should feel like the moving version of the approved cards, not a separate template.

- Search for useful official demos, screenshots, product pages, source pages, or credible reference clips for each scene, not only the opening scene.
- When a motion scene replaces or extends a static card, match the approved card typography: primary font file, `font-family`, weight, line-height, size scale, chip style, brand style, and source style.
- After rendering, inspect at least one still frame and compare it with the static card or `design.md` before calling the motion final.

## Best Fit

Use this skill for:

- Instagram Reels or YouTube Shorts from a script
- user-recorded screen recordings, voice recordings, talking-head clips, demos, or raw tutorial footage that should become a Reel/Short
- Card-news-to-script conversion
- Card-news-to-motion conversion
- Source-to-short-video planning
- Visual reference discovery for a video
- HyperFrames or Remotion scene planning
- MP4 render preparation

If the user only wants static Instagram carousel cards, use `auto-card-news` instead. If the user provides raw talking-head, audio, or screen-recording footage and asks for editing, use **Recorded Footage Edit Mode** in this skill. Treat `video-use` as an editing reference and helper source, not as a mandatory dependency.

## Supported Modes

1. **Script to Motion**
   - Input: script, rough talking points, or narration draft.
   - Output: tightened script, scene plan, visual references, motion plan, caption, and optional MP4.

2. **Card News to Script**
   - Input: an existing `auto-card-news` project, storyboard, PNG set, HTML cards, or pasted card copy.
   - Output: short-form script that turns the card flow into a video rhythm instead of reading cards aloud.

3. **Card News to Motion**
   - Input: an existing card-news project or approved carousel storyboard.
   - Output: motion-video scene plan and MP4-ready card/scene sequence.

4. **Source to Video Package**
   - Input: URL, report, memo, screenshots, or notes.
   - Output: source pack, video angle, script, scene plan, and motion plan. For MVP, keep this guided and approval-based.

5. **Recorded Footage to Reel**
   - Input: screen recording, talking-head clip, voice recording, demo footage, or raw tutorial footage.
   - Output: edit strategy, silence/dead-space cut plan, motion graphics, overlays, zoom/crop notes, source notes, and optional 9:16 MP4.
   - Default assumption: the user may add final subtitles in a separate editor. Prioritize pacing, visual clarity, callouts, and motion graphics over automatic caption generation.
   - Default to no paid APIs. Use ElevenLabs, OpenAI transcription, or any paid speech-to-text only after explicit user approval.

## Recorded Footage Edit Mode

Use this mode when the user uploads an actual recording and wants it edited into a Reel, Shorts, or social video.

This mode is inspired by `browser-use/video-use`, but adapted for this workspace: free/local-first, privacy-first, and compatible with AIjjuun/card-news typography.

### Transcription And Caption Policy

Do not assume ElevenLabs or automatic captions are required. For user-recorded edits, subtitles are optional support, not the main deliverable, unless the user asks for them.

Default order:

1. **No transcript needed**: use visual timing, waveform/silence, user notes, and manual review to cut dead space and add motion graphics.
2. **User-provided script or rough notes**: use them to understand beats and place overlays/callouts.
3. **Local/free STT if already available**: use Whisper, whisper.cpp, faster-whisper, or another local tool only if it materially improves edit decisions and the user approves.
4. **Paid STT optional**: ElevenLabs Scribe, OpenAI speech-to-text, or another paid API may be used only when the user explicitly approves cost/API usage.

If no word-level transcript exists, do not promise frame-perfect filler-word removal or word-boundary subtitles. Instead:

- cut by visible action, pauses, waveform, and user notes;
- use optional marker text or summary captions only when they help edit timing;
- ask the user for exact wording when a line matters;
- mark uncertain captions in `edit-notes.md`.

If the user says they will add subtitles later, do not burn final subtitles into the video. Use temporary guide text only when it helps preview the rhythm, and keep it removable.

### Editing Workflow

1. Inventory raw footage with `ffprobe` or equivalent: duration, resolution, audio tracks, frame rate.
2. Create an edit folder next to the source or inside the motion project; never overwrite raw footage.
3. Run a privacy pass before preview or publishing: blur or cut API keys, tokens, emails, private repo names, personal paths, billing screens, and sensitive browser tabs.
4. Create a plain-language edit strategy and wait for approval before cutting.
5. Build an edit decision list (`edl.json` or `edit-plan.md`) with source, start, end, reason, crop/zoom, caption, and overlay notes.
6. For screen recordings, prefer vertical 9:16 compositions with:
   - zoom into the active terminal/browser area;
   - cursor, command, or UI callout highlights;
   - HyperFrames or Remotion motion graphics matched to the explanation;
   - large Griun Mongtori Korean hook/callout overlays when useful;
   - short motion cards before, during, or after the real recording when they improve the hook or explain the action.
7. Add short audio fades around cuts to avoid pops.
8. If guide subtitles or labels are used, put them after overlays in the visual stack so they stay readable.
9. Render a preview, inspect cut boundaries and first/last seconds, then iterate.

### Silence And Dead-Space Cutting

For uploaded recordings, remove empty time before adding decorative motion:

- trim slow starts, waiting time, loading time, repeated attempts, and dead air;
- preserve useful hesitation only if it makes the demo feel human or builds anticipation;
- if transcript timestamps are unavailable, use waveform, visual state changes, and manual preview;
- use short crossfades or 30ms audio fades at cut points;
- keep enough context so the viewer understands what changed on screen.

### Motion Graphics Role

Use HyperFrames or Remotion to add explanatory visuals that make the footage easier to watch:

- opening hook card;
- command or button highlight;
- cursor path or tap pulse;
- zoom box, magnifier, or crop transition;
- before/after split;
- terminal side panel typing;
- checklist reveal;
- warning/attention badge;
- end recap card.

Motion graphics should explain the recording, not cover it. If an overlay hides the important screen area, reposition or shrink it.

### When To Use video-use Repo Helpers

If `browser-use/video-use` is available in the workspace, use it as a reference for:

- transcript packing ideas;
- timeline/filmstrip inspection;
- EDL-based rendering;
- cut-boundary self-evaluation;
- audio-fade production rules;
- subtitle-last production rules only if subtitles are included.

Do not require its ElevenLabs Scribe path unless the user asks for that exact workflow and approves API usage.

## Required Workflow

1. **Confirm channel and target**
   - Confirm the active channel, audience, tone, and target format.
   - Default target: 30-60 second vertical short-form video.
   - Keep AI information, football information, and PitchCheck marketing contexts separated.

2. **Identify input type**
   - Script, card-news project, pasted card copy, source URL, report, notes, or existing video footage.
   - If the user points to a card-news project, read its `brief.md`, `storyboard.md`, `motion-plan.md`, `caption.md`, HTML cards, or output files when available.
   - If the user uploads recording footage, switch to Recorded Footage Edit Mode and read `references/recorded-footage-edit-mode.md`.

3. **Create the retention frame**
   - Define who should stop watching.
   - Define the first 2-second hook.
   - Define why the viewer keeps watching after each scene.
   - Define the save, comment, share, or try reason.

4. **Draft or convert the script**
   - For raw scripts, tighten the opening and remove slow exposition.
   - For card-news, convert card roles into video beats: hook, situation, proof, useful point, channel take, CTA.
   - Do not simply read every card aloud.
   - Keep spoken lines natural and easy to say out loud.
   - Run the spoken Humanizer pass from `references/humanized-video-marketing.md` before showing the script.
   - If the video promotes a product or campaign, run ad/conversion mode before writing the final CTA.

5. **Search visual references**
   - Search official demos, product pages, screenshots, GitHub media, documentation, credible creator walkthroughs, and open-license media.
   - If fresh source discovery is needed, use `last30days`: https://github.com/mvanhorn/last30days-skill
   - Record all source URLs and usage notes in `source-pack.md`.
   - Read `references/media-research-and-rights.md` before using outside media.

6. **Build scene plan**
   - Create a scene-by-scene plan with timestamp, line, visual, motion idea, engine, and viewer reason.
   - Keep most scenes short, usually 2-6 seconds.
   - Avoid slideshow pacing. Something meaningful should change every few seconds.
   - Run the retention marketing check from `references/humanized-video-marketing.md` so every scene has a viewer reason and a visual change.

7. **Choose motion engine**
   - Prefer HyperFrames for short HTML/CSS/GSAP motion: big subtitles, typing, panels, chips, UI callouts, cursor paths, screenshot zooms.
   - Use Remotion for narration sync, audio timing, longer timelines, video compositing, or reusable React video templates.
   - Treat `video-use` as a companion/reference for editing user-recorded footage, not as the default script-to-motion engine and not as a mandatory paid-API path.
   - Read `references/motion-engine-selection.md`.

8. **Approval gate: script and scene plan**
   - Show the script and scene plan before creating motion output.
   - Ask for approval or revision.

9. **Create preview motion**
   - Build preview scenes only after approval.
   - For HyperFrames, run lint and inspect before final render.
   - For Remotion, verify preview frames and audio/video timing when used.

10. **Approval gate: motion preview**
    - Show preview image or MP4 path.
    - Ask for final approval before rendering final assets.

11. **Render final package**
    - Render MP4 only after approval.
    - Save caption and source notes.
    - Do not upload automatically.

## Artifact Structure

Use this structure by default:

```text
carousel-workspace/
  motion-projects/
    <channel-slug>/
      <date-topic>/
        source.md
        script.md
        scene-plan.md
        source-pack.md
        motion-plan.md
        caption.md
        design.md
        assets/
        scenes/
        output/
```

Use `scripts/init_motion_project.py` to scaffold this structure when helpful.

## Reference Loading

- Read `references/video-workflow.md` when converting an input into a short-form script and scene plan.
- Read `references/humanized-video-marketing.md` when polishing scripts, captions, CTAs, retention beats, or product/ad-style videos.
- Read `references/media-research-and-rights.md` before searching, using, recreating, or attributing visual references.
- Read `references/motion-engine-selection.md` before deciding HyperFrames, Remotion, video-use, or static fallback.
- Read `references/recorded-footage-edit-mode.md` when the input is a user recording, audio note, screen capture, talking-head clip, demo recording, or tutorial footage.
- Use `auto-card-news` when the job starts as a carousel and the user also wants static PNG cards.
- Use `last30days` when fresh source discovery is needed.

## Completion Criteria

A motion-news project is complete only when:

- The active channel and target platform are explicit.
- Input type is clear.
- Script, scene plan, source pack, motion plan, and caption are saved.
- Visual sources are recorded with direct-use, recreate, or reference-only notes.
- For uploaded recordings, raw files remain untouched and privacy-sensitive details are reviewed before final render.
- Each scene has a viewer reason and motion reason.
- Script, scene plan, caption, and CTA pass the Humanizer, Marketing, and ad/conversion checks when applicable.
- The engine choice is recorded per scene.
- Preview motion has been reviewed when MP4 is requested.
- Final files match the approved output plan.
