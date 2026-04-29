# Changelog

## 0.3.4

- Added HyperFrames-first motion guidance for short HTML/CSS/GSAP card animations.
- Kept Remotion as the fallback or primary choice for complex timelines, audio, video compositing, and advanced media cards.
- Updated motion-plan templates to record the chosen motion engine and reason per card.

## 0.3.3

- Added spacing relationship QA for media label chips, section badges, and headlines.
- Clarified that shared label positions are defaults and should be adjusted per card when elements feel crowded.

## 0.3.2

- Added media bottom label guidance so small chips sit in the lower safe zone of screenshot and demo cards.
- Updated design review checks to keep label chips from covering important visual proof.

## 0.3.1

- Added line-break QA guidance so headings keep natural Korean phrase chunks together.
- Updated design and storyboard templates to catch orphaned words before final PNG/MP4 render.

## 0.3.0

- Reworked the skill around an engagement-first carousel workflow so posts start from viewer situation, curiosity, pain, and action reason instead of source-summary slides.
- Added media reference discovery guidance for official demos, screenshots, images, videos, attribution, and reference-only usage.
- Added motion planning guidance for card-level MP4 decisions, first-card hooks, video references, Remotion-style motion, and source media notes.
- Updated design guidance to avoid PPT-like layouts and use large visuals with dim, blur, or gradient text protection.
- Expanded scaffold templates with `source-pack.md`, viewer frames, media references, motion references, and per-card HTML scaffolding.

## 0.2.1

- Updated one-line installers to install both `auto-card-news` and `last30days`.
- Updated Codex and manual install docs to include the `last30days` companion skill.
- Kept `last30days` as an external dependency fetched from https://github.com/mvanhorn/last30days-skill.

## 0.2.0

- Updated `auto-card-news` to use the external `last30days` skill for fresh source discovery.
- Documented the recommended `last30days` install flow from https://github.com/mvanhorn/last30days-skill.
- Kept this repository focused on the card-news production skill while delegating research to `last30days`.
- Added distribution tests for README, install scripts, and version metadata.

## 0.1.0

- Added the initial `auto-card-news` skill for channel-aware card-news/carousel creation.
