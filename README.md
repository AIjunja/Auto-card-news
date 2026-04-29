# Auto-card-news Skills

Version: `0.4.1`

This repository ships Codex skills for making channel-aware card news, Instagram carousel content, and short-form motion-video packages through conversation.

Included skills:

- `auto-card-news`: source or report to carousel/card-news, HTML preview, PNG, and optional MP4 motion cards
- `auto-motion-news`: script, card-news project, or source to short-form scene plan, visual references, HyperFrames/Remotion motion plan, MP4 package, and caption
- `last30days`: companion external skill for fresh source discovery

`auto-card-news` guides Codex through:

- channel profile setup
- source intake from URLs, reports, notes, or GPT conversations
- fresh source discovery with `last30days`
- viewer-first framing around the audience's situation, curiosity, pain, and action reason
- image, screenshot, official demo, and video reference discovery
- carousel angle proposals
- full card copy drafts
- text wireframes
- one-HTML-file-per-card previews
- media-led design with readable dim, blur, and gradient treatments
- line-break QA so headings do not leave awkward orphan words alone
- Humanizer-style copy review to remove AI-sounding phrasing and stiff summaries
- marketing checks for hook, promise, proof, save/comment/share reason, and CTA
- optional ad/conversion mode for product, app, campaign, lead magnet, and PitchCheck marketing posts
- lower safe zone placement for media label chips over screenshots and demo videos
- spacing relationship checks between chips, badges, and headlines
- card-by-card static PNG or motion MP4 planning
- HyperFrames-first motion planning for short HTML/CSS card animations, with Remotion as the fallback for complex video cards
- reusable `profile.md`, `design.md`, `source-pack.md`, `brief.md`, `storyboard.md`, and `motion-plan.md` files

`auto-motion-news` guides Codex through:

- script-to-motion planning for Instagram Reels and YouTube Shorts
- card-news-to-script conversion
- card-news-to-motion conversion
- source-to-short-video planning
- visual reference research with usage notes and attribution
- spoken Humanizer review for scripts and captions
- retention marketing checks for first 2-second hook, proof, scene reason, and CTA
- optional ad/conversion planning for product or PitchCheck videos
- HyperFrames-first motion planning with Remotion as the complex-video fallback
- reusable `script.md`, `scene-plan.md`, `source-pack.md`, `motion-plan.md`, `caption.md`, and `design.md` files

This is not a hosted app and does not upload to Instagram. It is a reusable Codex skill plus templates and scaffolding.

## Install With Codex

If your Codex has the `skill-installer` skill, paste these GitHub URLs and ask Codex to install them:

```text
https://github.com/AIjunja/Auto-card-news/tree/master/skills/auto-card-news
https://github.com/AIjunja/Auto-card-news/tree/master/skills/auto-motion-news
https://github.com/mvanhorn/last30days-skill/tree/main/skills/last30days
```

Example prompt:

```text
Install these Codex skills:
https://github.com/AIjunja/Auto-card-news/tree/master/skills/auto-card-news
https://github.com/AIjunja/Auto-card-news/tree/master/skills/auto-motion-news
https://github.com/mvanhorn/last30days-skill/tree/main/skills/last30days
```

Restart Codex after installation so the new skills are loaded.

## Recommended Source Discovery Skill

For fresh source discovery, this setup uses `last30days` from [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill). The one-line installers below install `auto-card-news`, `auto-motion-news`, and `last30days`; if you use the Codex installer manually, install all URLs shown above.

## One-Line Install

These commands install `auto-card-news`, `auto-motion-news`, and `last30days`. They work when the repository is public. If the repository is private, use the Codex install prompt above or clone with a GitHub account that has access.

### Windows PowerShell

```powershell
powershell -ExecutionPolicy Bypass -Command "iwr -useb https://raw.githubusercontent.com/AIjunja/Auto-card-news/master/install.ps1 | iex"
```

### macOS / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/AIjunja/Auto-card-news/master/install.sh | bash
```

Restart Codex after installation.

## Manual Install

Clone both repositories and copy the skill folders into your Codex skills directory.

### Windows PowerShell

```powershell
git clone https://github.com/AIjunja/Auto-card-news.git
git clone https://github.com/mvanhorn/last30days-skill.git
New-Item -ItemType Directory -Force "$env:USERPROFILE\.codex\skills" | Out-Null
Copy-Item -Recurse -Force ".\Auto-card-news\skills\auto-card-news" "$env:USERPROFILE\.codex\skills\auto-card-news"
Copy-Item -Recurse -Force ".\Auto-card-news\skills\auto-motion-news" "$env:USERPROFILE\.codex\skills\auto-motion-news"
Copy-Item -Recurse -Force ".\last30days-skill\skills\last30days" "$env:USERPROFILE\.codex\skills\last30days"
```

### macOS / Linux

```bash
git clone https://github.com/AIjunja/Auto-card-news.git
git clone https://github.com/mvanhorn/last30days-skill.git
mkdir -p "$HOME/.codex/skills"
cp -R Auto-card-news/skills/auto-card-news "$HOME/.codex/skills/auto-card-news"
cp -R Auto-card-news/skills/auto-motion-news "$HOME/.codex/skills/auto-motion-news"
cp -R last30days-skill/skills/last30days "$HOME/.codex/skills/last30days"
```

Restart Codex after installation.

## Use

After restarting Codex, call the skill:

```text
$auto-card-news
```

Then provide a source URL, report, memo, draft, or GPT conversation. The skill will first establish the active channel profile so AI information, football information, and PitchCheck marketing content do not mix contexts.

If you do not have a source yet, ask the skill to use `last30days` first, or call it directly:

```text
$last30days latest AI tools worth testing
```

Use the research output as source material. `auto-card-news` will turn it into a `source-pack.md` handoff, then continue with angle proposals, copy, HTML/CSS preview, and final PNG/MP4 export planning.

The current workflow is engagement-first. It should avoid PPT-like briefing slides by defining who will stop scrolling, what they care about, what becomes easier or clearer, and why they would save, comment, share, or keep swiping. For visual topics, it should also look for media references such as official demos, screenshots, product pages, creator walkthroughs, or video clips before finalizing the storyboard. Before final export, it should run line-break QA so short words, particles, or endings do not sit alone on their own line. Media label chips should sit in the lower safe zone so they do not cover the important screenshot or demo proof, then pass a spacing relationship check against nearby badges and headlines.

The copy workflow now includes a Humanizer and marketing review inspired by public marketing/copywriting skill repos. It checks whether the copy sounds like a real channel editor, whether the post gives a concrete reason to care, and whether captions include useful source or try-it links. Product and PitchCheck content can also run ad/conversion mode for offer, proof, objection, CTA, and destination planning.

For short-form video, call:

```text
$auto-motion-news
```

Then provide a script, card-news project path, pasted card copy, source URL, report, or notes. The skill will create a retention frame, video script, scene plan, media/source pack, HyperFrames or Remotion motion plan, caption, and MP4 render plan.

Motion scripts also run a spoken Humanizer pass so they do not sound like caption paragraphs read aloud. For product or campaign videos, the skill adds marketing/ad checks before preview motion.

## Repository Layout

```text
skills/auto-card-news/
  SKILL.md
  agents/openai.yaml
  references/
  assets/templates/
  scripts/init_project.py
skills/auto-motion-news/
  SKILL.md
  agents/openai.yaml
  references/
  assets/templates/
  scripts/init_motion_project.py
tests/
docs/superpowers/
```

## Verify

```powershell
python -m unittest tests.test_auto_card_news_skill -v
```

The test suite checks the skill metadata, references, templates, scaffold script, and installation documentation.
