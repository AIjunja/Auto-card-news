# Auto Card News Skill Design

## Purpose

This skill helps the user create Instagram-style carousel/card-news content through a conversation with Codex. It is not a SaaS, hosted app, or automatic upload system. The skill runs inside the current Codex thread, guides the user step by step, creates local project files, previews cards as HTML/CSS, and renders final assets only after user approval.

The skill should support mixed carousel outputs: some cards can be static PNG images, while other cards can be short MP4 motion cards when motion improves retention.

## Primary Use Cases

- Convert a source URL, report, memo, draft, or GPT conversation into carousel content.
- Build channel-specific carousel assets for:
  - AI information channels
  - Football information channels
  - PitchCheck app marketing content
- Maintain separate channel context so work from one channel does not leak into another.
- Accumulate reusable profile, design, storyboard, and output files that can later become service/product data.

## Core Principles

- Conversation first: the user and Codex develop the carousel together.
- Channel context first: every project starts by selecting, creating, or updating a channel profile.
- Preview before export: HTML/CSS previews are reviewed before images or videos are rendered.
- Asset accumulation: each project leaves structured files behind.
- Mixed media by card: each card can independently output as PNG or MP4.
- Motion with intent: motion is recommended when it improves attention, explanation, or retention.

## Reference Projects

### carousel-automation

Use as a rendering reference only.

Borrow:
- HTML/CSS based carousel rendering
- JSON/content-to-template thinking
- Playwright screenshot capture
- Ratio-specific viewport and clipping ideas
- Template and content guideline separation

Do not directly inherit:
- The SaaS/CLI-centered structure
- DataTalksClub-specific visual style
- Documented but unimplemented frame types
- Fixed template assumptions that do not fit the conversational workflow

### Remotion

Use as the reference for motion cards and video export. Remotion is appropriate when a carousel card benefits from animation, sequencing, screen transitions, tactical movement, counters, reveals, or process visualization.

The skill must treat Remotion as part of the normal production decision process, not merely a future add-on. For each card, Codex should evaluate whether the card should remain static or become a motion card.

Include a reminder that Remotion has special license conditions for some company/commercial use cases, so the user should check license terms before relying on it commercially.

### shadcn/ui

Use as a reference for clean UI detail and information component design. The skill should borrow the sensibility of accessible, organized components such as cards, badges, tabs, callouts, buttons, stats, and compact information blocks. It should not turn the carousel into an app UI, but can use UI component patterns to make dense information easier to scan.

### oh-my-design

Use as a reference for creating channel-level `design.md` files. The skill should use a design-system mindset that captures voice, narrative, principles, personas, states, motion, typography, color, layout, and interaction/animation rules.

## Channel Profile Workflow

Every project starts with channel context.

1. Ask the user to select an existing channel profile or create a new one.
2. If an existing profile is selected, load it and confirm whether the current project should follow it as-is or adapt it.
3. If no profile exists, create a quick profile by collecting six fields. Ask one focused question at a time unless the user asks to answer them in one batch:
   - Who is the target audience?
   - What is the channel's purpose?
   - What tone and manner should it use?
   - What CTA style should it prefer?
   - What design direction does the user prefer?
   - What should this channel avoid?
4. If the channel already exists, ask for a channel link and recommend at least three representative posts.
5. If representative posts, screenshots, post captions, or source images are provided, create a deeper profile that analyzes:
   - Repeating topics
   - Hook style
   - Carousel length
   - Copy rhythm
   - Visual patterns
   - CTA style
   - Reader expectation and information density
   - Design risks to avoid
6. If no posts are available, avoid making strong design claims. Build a tone-and-direction profile from the channel name, description, topic, and six-question answers.

Profiles should be reusable, but never blindly applied. Each new project should briefly confirm whether the current content should follow or adjust the profile.

After each completed project, Codex should offer to update the active channel profile when the project reveals a reusable pattern, such as a stronger hook style, recurring CTA, better motion pattern, or new design rule.

## Channel Profile Files

Store channel-level assets separately from project-level assets.

```text
carousel-workspace/
  profiles/
    ai-info/
      profile.md
      design.md
      channel.css

    football-info/
      profile.md
      design.md
      channel.css

    pitchcheck-marketing/
      profile.md
      design.md
      channel.css
```

### `profile.md`

Contains:
- Channel name
- Audience
- Purpose
- Tone and manner
- CTA style
- Avoid list
- Default carousel ratio
- Common content angles
- Review checklist

### `design.md`

Contains:
- Brand/design philosophy
- Typography rules
- Color palette
- Spacing and layout rules
- Card composition patterns
- Static visual rules
- Motion principles
- UI/detail references inspired by shadcn/ui
- Design review checklist

### `channel.css`

Contains reusable channel-level CSS:
- Color tokens
- Font tokens
- Layout primitives
- Reusable card components
- Reusable emphasis styles
- Shared animation-related CSS where useful

## Project Workflow

1. Select or create channel profile.
2. Confirm project-specific goal, audience, CTA, and ratio.
3. Save the user's source material as `source.md`.
4. If the source is a URL, fetch and read the accessible content. If the content is blocked, paywalled, login-gated, or incomplete, ask the user to paste the relevant text, screenshots, captions, or report.
5. Summarize the source and infer:
   - Core message
   - Important claims
   - Useful quotes or facts
   - Audience relevance
   - Possible risks or missing context
6. Propose two or three carousel angles even if the user gives a direction. Each option should include:
   - Angle name
   - Hook example
   - Who it works best for
   - Expected 3-5 card flow
7. Let the user choose or combine angles.
8. Write a full card copy draft in one pass, numbered by card.
9. Treat this copy as first-pass approval, not final approval.
10. Create a text wireframe.
11. Evaluate each card for static or motion output.
12. Create an HTML/CSS preview.
13. Review the HTML preview with the user.
14. Apply content and design changes.
15. Render final outputs:
   - Static cards to PNG by default
   - Motion cards to MP4
   - JPEG/PDF only when requested

## Ratio Handling

Use the channel profile's default ratio when available. If none exists, recommend Instagram 4:5 as the default.

Supported ratios:
- 4:5 for Instagram feed-first carousels
- 1:1 for square carousels
- 9:16 for story/reels-style vertical content
- Custom ratio or pixel size when requested

## Project File Structure

Each carousel project should be stored under its channel.

```text
carousel-workspace/
  projects/
    ai-info/
      2026-04-29-topic-name/
        source.md
        brief.md
        storyboard.md
        motion-plan.md
        index.html
        style.css
        cards/
          card-01/
            index.html
            style.css
            output.png
          card-02/
            index.html
            style.css
            motion.tsx
            output.mp4
        output/
          card-01.png
          card-02.mp4
```

The top-level `index.html` is the review preview for the whole carousel. Each `cards/card-XX/index.html` is the render source for an individual card.

### `source.md`

Stores the original URL, report, memo, copied conversation, or user-provided source material.

### `brief.md`

Stores:
- Selected channel profile
- Project goal
- Target audience
- Chosen angle
- CTA
- Ratio
- Source summary
- User constraints

### `storyboard.md`

Stores:
- Card number
- Card role
- Headline
- Body copy
- Visual direction
- Static or motion status
- Notes from revisions

### `motion-plan.md`

Stores:
- Cards recommended for motion
- Why each card benefits from motion
- Animation concept
- Expected duration
- Output format
- Implementation notes

## Static vs Motion Decision Rules

For each card, Codex should evaluate whether motion would improve retention or understanding.

Motion is recommended for:
- Numeric impact cards, such as count-up stats or animated comparisons
- Step-by-step process cards
- Football tactic cards, such as player movement, passing lanes, pressure lines, or formation shifts
- App feature cards, such as screen transitions, taps, checks, confirmations, and progress states
- Before/after cards
- Hook cards with reveal effects
- Timeline, ranking, or transformation cards

Static is recommended for:
- Dense reading cards
- Save-worthy checklists
- Summary cards
- Cards that need quiet visual stability
- Cards where motion would distract from comprehension

When motion is recommended, the skill should explain the recommendation briefly and ask for approval before creating motion output.

## Preview and Review Rules

The skill should not render final assets immediately after writing copy.

Review stages:
1. Copy review: content flow and message clarity
2. Text wireframe review: card order and information hierarchy
3. HTML/CSS preview review: actual layout, spacing, rhythm, and design
4. Final render approval: PNG and MP4 outputs

The user can request changes by card number, such as:
- "Make card 1 hook stronger."
- "Shorten card 3."
- "Make card 2 motion instead of static."
- "Use a more football-fan tone."
- "Make the CTA less salesy."

## Rendering Rules

Static cards:
- Use HTML/CSS as source.
- Use Playwright or an equivalent browser rendering tool to capture PNG.
- PNG is the default output.
- JPEG and PDF are optional outputs only when requested.

Motion cards:
- Use a Remotion-style structure when video is needed.
- Output MP4 by default.
- Keep motion short and purposeful.
- Respect the same channel design system as static cards.

Mixed output packages are expected. A final carousel can contain both images and videos:

```text
output/
  card-01.png
  card-02.mp4
  card-03.png
  card-04.mp4
```

## Skill Behavior Requirements

- Ask in Korean by default unless the user requests another language or source material requires another language.
- Ask one focused question at a time during setup.
- Avoid forcing unnecessary choices once enough context exists.
- Keep channel profiles separated.
- Reconfirm the active channel at the start of each project.
- Do not automatically upload to Instagram or any social platform.
- Do not assume a design direction from a channel link alone if content is inaccessible.
- Make limitations explicit when source material is thin.
- Prefer user approval before expensive or final rendering steps.

## Non-Goals

- No hosted SaaS app.
- No automatic Instagram upload.
- No always-on local server requirement.
- No generic design generation detached from the channel profile.
- No single fixed template for every channel.

## Success Criteria

The skill is successful when:
- The user can call it in any thread and create a carousel through guided conversation.
- The active channel context is clear and isolated.
- The project leaves reusable profile, design, storyboard, preview, and output files.
- The user can inspect HTML before final rendering.
- Final output can mix PNG and MP4 cards.
- The workflow supports repeated use across AI, football, and PitchCheck marketing channels without mixing their tones or design rules.

