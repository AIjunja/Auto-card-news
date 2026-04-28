---
name: auto-card-news
description: Use when the user wants to create, design, preview, or render carousel/card-news content, especially channel-aware Instagram carousels with static cards, motion cards, HTML/CSS, PNG, or MP4.
---

# Auto Card News

Use this skill when the user wants to create a carousel, card-news post, Instagram carousel, mixed image/video carousel, or channel-specific content package.

## Operating Language

Ask and explain in 한국어 by default. Use another language only when the user requests it or the source material requires it.

## Core Rule

This is a conversation-driven production workflow, not a SaaS app and not an upload automation. Do not automatically upload to Instagram or any social platform. In Korean: 업로드하지 않는다.

## Required Workflow

1. **Confirm channel context**
   - Ask whether to use an existing channel profile or create a new one.
   - Reconfirm the active channel before working on the source.
   - Keep AI information, football information, and PitchCheck marketing contexts separated.

2. **Create or update the 채널 프로필**
   - If no profile exists, collect the six profile fields one focused question at a time.
   - If the channel already exists, ask for the channel link and recommend at least three representative posts.
   - If posts are unavailable, create a tone-and-direction profile without making strong visual claims.
   - Read `references/channel-profiles.md` when creating or updating profiles.

3. **Intake source material**
   - Accept URLs, reports, memos, drafts, pasted GPT conversations, screenshots, captions, or raw notes.
   - If a URL is blocked or incomplete, ask the user to paste the relevant text or provide screenshots.
   - Save source material to `source.md` in the project.

4. **Propose carousel angles**
   - Summarize the source.
   - Infer audience relevance, core message, useful claims, and risks.
   - Propose two or three angles even when the user gives a direction.
   - Each angle includes an angle name, hook example, best-fit audience, and expected 3-5 card flow.

5. **Draft copy and storyboard**
   - After the user chooses or combines angles, write the full card copy draft in one pass.
   - Number every card.
   - Treat this as first-pass approval, not final approval.
   - Create a text wireframe before HTML/CSS.

6. **Evaluate static vs motion by card**
   - For each card, decide whether static PNG or motion MP4 is more effective.
   - Explain motion recommendations briefly.
   - Ask for approval before creating motion output.
   - Read `references/rendering-and-motion.md` for decision rules.

7. **Create preview before final export**
   - Build an HTML/CSS 미리보기 first.
   - Review content, layout, spacing, rhythm, and design with the user.
   - Render final files only after approval.

8. **Render final assets**
   - Static cards default to PNG.
   - Motion cards default to MP4.
   - JPEG and PDF are optional and only generated when requested.

## Ratio Defaults

Use the active channel profile's default ratio when available. If absent, recommend Instagram 4:5. Also support 1:1, 9:16, and custom pixel sizes when requested.

## Artifact Structure

Use this structure for projects unless the user requests another location:

```text
carousel-workspace/
  profiles/<channel-slug>/
    profile.md
    design.md
    channel.css
  projects/<channel-slug>/<date-topic-slug>/
    source.md
    brief.md
    storyboard.md
    motion-plan.md
    index.html
    style.css
    cards/
    output/
```

Use `scripts/init_project.py` to scaffold this structure when helpful.

## References

- Read `references/channel-profiles.md` when creating, analyzing, or updating a channel profile.
- Read `references/project-workflow.md` when turning source material into angles, copy, and storyboard.
- Read `references/design-and-references.md` before writing `design.md`, `channel.css`, or card layouts.
- Read `references/rendering-and-motion.md` before deciding PNG vs MP4 or producing final exports.

## Completion Criteria

A carousel project is complete only when:

- The active channel is explicit.
- Source, brief, storyboard, and motion plan are saved when applicable.
- HTML/CSS preview has been reviewed.
- Final output files match the approved card-level export plan.
- The user has a mixed output package such as `card-01.png`, `card-02.mp4`, `card-03.png`.
