# Auto-card-news Skill

Version: `0.3.4`

`auto-card-news` is a Codex skill for making channel-aware card news and Instagram carousel content through conversation.

It guides Codex through:

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
- lower safe zone placement for media label chips over screenshots and demo videos
- spacing relationship checks between chips, badges, and headlines
- card-by-card static PNG or motion MP4 planning
- HyperFrames-first motion planning for short HTML/CSS card animations, with Remotion as the fallback for complex video cards
- reusable `profile.md`, `design.md`, `source-pack.md`, `brief.md`, `storyboard.md`, and `motion-plan.md` files

This is not a hosted app and does not upload to Instagram. It is a reusable Codex skill plus templates and scaffolding.

## Install With Codex

If your Codex has the `skill-installer` skill, paste these GitHub URLs and ask Codex to install them:

```text
https://github.com/AIjunja/Auto-card-news/tree/master/skills/auto-card-news
https://github.com/mvanhorn/last30days-skill/tree/main/skills/last30days
```

Example prompt:

```text
Install these Codex skills:
https://github.com/AIjunja/Auto-card-news/tree/master/skills/auto-card-news
https://github.com/mvanhorn/last30days-skill/tree/main/skills/last30days
```

Restart Codex after installation so the new skills are loaded.

## Recommended Source Discovery Skill

For fresh source discovery, this setup uses `last30days` from [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill). The one-line installers below install both `auto-card-news` and `last30days`; if you use the Codex installer manually, install both URLs shown above.

## One-Line Install

These commands install both `auto-card-news` and `last30days`. They work when the repository is public. If the repository is private, use the Codex install prompt above or clone with a GitHub account that has access.

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
Copy-Item -Recurse -Force ".\last30days-skill\skills\last30days" "$env:USERPROFILE\.codex\skills\last30days"
```

### macOS / Linux

```bash
git clone https://github.com/AIjunja/Auto-card-news.git
git clone https://github.com/mvanhorn/last30days-skill.git
mkdir -p "$HOME/.codex/skills"
cp -R Auto-card-news/skills/auto-card-news "$HOME/.codex/skills/auto-card-news"
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

## Repository Layout

```text
skills/auto-card-news/
  SKILL.md
  agents/openai.yaml
  references/
  assets/templates/
  scripts/init_project.py
tests/
docs/superpowers/
```

## Verify

```powershell
python -m unittest tests.test_auto_card_news_skill -v
```

The test suite checks the skill metadata, references, templates, scaffold script, and installation documentation.
