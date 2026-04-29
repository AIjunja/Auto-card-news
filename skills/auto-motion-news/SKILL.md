---
name: auto-motion-news
description: Use when the user wants to turn a script, card-news project, source link, or notes into a short-form motion video, especially Instagram Reels, YouTube Shorts, HyperFrames, Remotion, MP4, scene plans, captions, or visual reference research.
---

# Auto Motion News

Use this skill when the user wants to create a short-form video from a script, an existing card-news project, pasted card copy, a source URL, a report, or raw notes.

## Operating Language

Ask and explain in Korean by default. Use another language only when the user requests it or the source material requires it.

## Core Rule

This is a conversation-driven video production workflow, not social upload automation. Do not automatically upload to YouTube, Instagram, TikTok, or any social platform.

## Best Fit

Use this skill for:

- Instagram Reels or YouTube Shorts from a script
- Card-news-to-script conversion
- Card-news-to-motion conversion
- Source-to-short-video planning
- Visual reference discovery for a video
- HyperFrames or Remotion scene planning
- MP4 render preparation

If the user only wants static Instagram carousel cards, use `auto-card-news` instead. If the user provides raw talking-head or screen-recording footage and asks for cuts, transcript cleanup, or subtitle timing, consider `video-use` as a future editing reference or companion workflow.

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

## Required Workflow

1. **Confirm channel and target**
   - Confirm the active channel, audience, tone, and target format.
   - Default target: 30-60 second vertical short-form video.
   - Keep AI information, football information, and PitchCheck marketing contexts separated.

2. **Identify input type**
   - Script, card-news project, pasted card copy, source URL, report, notes, or existing video footage.
   - If the user points to a card-news project, read its `brief.md`, `storyboard.md`, `motion-plan.md`, `caption.md`, HTML cards, or output files when available.

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

5. **Search visual references**
   - Search official demos, product pages, screenshots, GitHub media, documentation, credible creator walkthroughs, and open-license media.
   - If fresh source discovery is needed, use `last30days`: https://github.com/mvanhorn/last30days-skill
   - Record all source URLs and usage notes in `source-pack.md`.
   - Read `references/media-research-and-rights.md` before using outside media.

6. **Build scene plan**
   - Create a scene-by-scene plan with timestamp, line, visual, motion idea, engine, and viewer reason.
   - Keep most scenes short, usually 2-6 seconds.
   - Avoid slideshow pacing. Something meaningful should change every few seconds.

7. **Choose motion engine**
   - Prefer HyperFrames for short HTML/CSS/GSAP motion: big subtitles, typing, panels, chips, UI callouts, cursor paths, screenshot zooms.
   - Use Remotion for narration sync, audio timing, longer timelines, video compositing, or reusable React video templates.
   - Treat `video-use` as a companion for editing user-recorded footage, not as the default script-to-motion engine.
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
- Read `references/media-research-and-rights.md` before searching, using, recreating, or attributing visual references.
- Read `references/motion-engine-selection.md` before deciding HyperFrames, Remotion, video-use, or static fallback.
- Use `auto-card-news` when the job starts as a carousel and the user also wants static PNG cards.
- Use `last30days` when fresh source discovery is needed.

## Completion Criteria

A motion-news project is complete only when:

- The active channel and target platform are explicit.
- Input type is clear.
- Script, scene plan, source pack, motion plan, and caption are saved.
- Visual sources are recorded with direct-use, recreate, or reference-only notes.
- Each scene has a viewer reason and motion reason.
- The engine choice is recorded per scene.
- Preview motion has been reviewed when MP4 is requested.
- Final files match the approved output plan.

