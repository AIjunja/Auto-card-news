# Auto Motion News Skill Design

## Goal

Create a new Codex skill named `auto-motion-news` for turning scripts, existing card-news projects, or raw source material into short-form motion videos. The first target is Instagram Reels and YouTube Shorts in a 30-60 second vertical format.

This skill should not replace `auto-card-news`. It should extend the same content system so one source can become a carousel, a short script, and a motion video package.

## Primary User

The primary user is a creator who wants to publish AI information content quickly without manually searching for every image, reference clip, screenshot, motion idea, caption, and render command.

The first real channel context is AI쭌:

- Friendly AI tutor tone
- Easy, casual, and useful
- Slightly cute, but not childish
- Practical source links and clear attribution
- Short-form posts that make viewers save, comment, share, or try the tool

## Core Modes

### Script To Motion

Input: a finished script or rough talking points.

Output:

- `script.md`
- `scene-plan.md`
- `source-pack.md`
- `motion-plan.md`
- `caption.md`
- rendered MP4 when approved

The skill breaks the script into scenes, rewrites or tightens the hook when needed, searches for visual references, then creates a scene-by-scene motion plan.

### Card News To Script

Input: an existing `auto-card-news` project or pasted card copy.

Output:

- short-form video script
- narration or subtitle-first version
- scene list derived from the card flow
- optional CTA and caption

The card-news structure becomes the story spine. The skill should not simply read every card aloud. It should turn the carousel into a tighter video rhythm: hook, context, proof, useful point, channel interpretation, CTA.

### Card News To Motion

Input: an existing card-news project with HTML cards, PNGs, or storyboard.

Output:

- a motion version of the carousel flow
- MP4 scenes built from the strongest card moments
- static PNG fallback notes

The result should feel like a short-form video, not a slideshow export.

### Full Pipeline

Input: URL, report, notes, or raw source.

Output:

- source pack
- card-news angle options
- optional carousel project
- video script
- motion plan

For the first version, this mode is documented as a guided workflow. The MVP focuses on the first three modes.

## Visual Research

When the user asks for a video from only a script or source, the skill should search for:

- official product demos
- official screenshots
- GitHub repo media
- product pages
- documentation images
- credible creator walkthroughs
- open-license images or videos
- user-provided assets

The skill must record:

- source URL
- whether it is safe for direct use, reference only, or needs recreation
- attribution text
- how the visual supports the scene

Do not blindly download or reuse random social clips. Prefer official demos, user-provided assets, or recreated HTML/CSS visuals when rights are unclear.

## Motion Engine Rules

Use HyperFrames first for short HTML/CSS/GSAP motion:

- big subtitles
- typing effects
- side panels
- browser or app UI mockups
- chips and callouts
- cursor or tap paths
- screenshot zooms
- short scene loops

Use Remotion for:

- narration sync
- BGM and audio timing
- longer timelines
- multiple video clips
- advanced compositing
- reusable React video templates

Use `video-use` as a future optional reference for:

- editing user-recorded video
- transcript-based cuts
- filler-word removal
- subtitle timing
- talking-head or screen-recording edits

## Project Structure

The skill should scaffold projects under the existing `carousel-workspace` pattern:

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

Each scene can be an HTML/HyperFrames scene, a Remotion scene, or a reference-only scene. The plan must record which engine is used per scene.

## Workflow

1. Confirm channel context and video target.
2. Identify the input type: script, card-news project, card copy, or raw source.
3. Create the audience frame and retention goal.
4. Convert the input into a 30-60 second scene structure.
5. Search or request media references.
6. Classify each visual as direct use, recreate, or reference only.
7. Choose HyperFrames, Remotion, or static fallback per scene.
8. Present script and scene plan for approval.
9. Build preview motion only after approval.
10. Render final MP4 and create caption/source notes.

## Approval Gates

The skill should not jump straight to final video. It needs two lightweight approval moments:

- script and scene plan approval
- motion preview approval before final render

This keeps the workflow fast while preventing wrong-angle videos.

## Skill Artifacts

The skill should include:

- `SKILL.md`
- `references/video-workflow.md`
- `references/media-research-and-rights.md`
- `references/motion-engine-selection.md`
- `assets/templates/script.md`
- `assets/templates/scene-plan.md`
- `assets/templates/source-pack.md`
- `assets/templates/motion-plan.md`
- `assets/templates/caption.md`
- `scripts/init_motion_project.py`

## Success Criteria

- A user can paste a script and get a structured short-video plan.
- A user can point to an existing card-news project and get a video script.
- The skill clearly distinguishes HyperFrames, Remotion, and video-use roles.
- The skill searches for useful visuals before designing scenes.
- The skill records source URLs and usage notes.
- The skill defaults to vertical short-form video.
- The workflow stays separate from Instagram or YouTube upload automation.

## Out Of Scope For MVP

- Automatic social upload
- Guaranteed rights clearance for third-party media
- Full voice cloning or TTS production
- Complex long-form YouTube editing
- Fully autonomous final render without approval

