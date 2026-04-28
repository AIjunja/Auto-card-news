# Auto-card-news Skill

Version: `0.2.0`

`auto-card-news` is a Codex skill for making channel-aware card news and Instagram carousel content through conversation.

It guides Codex through:

- channel profile setup
- source intake from URLs, reports, notes, or GPT conversations
- carousel angle proposals
- full card copy drafts
- text wireframes
- HTML/CSS preview
- card-by-card static PNG or motion MP4 planning
- reusable `profile.md`, `design.md`, `brief.md`, `storyboard.md`, and `motion-plan.md` files

This is not a hosted app and does not upload to Instagram. It is a reusable Codex skill plus templates and scaffolding.

## Install With Codex

If your Codex has the `skill-installer` skill, paste this GitHub URL and ask Codex to install it:

```text
https://github.com/AIjunja/Auto-card-news/tree/master/skills/auto-card-news
```

Example prompt:

```text
Install this Codex skill:
https://github.com/AIjunja/Auto-card-news/tree/master/skills/auto-card-news
```

Restart Codex after installation so the new skill is loaded.

## Recommended Source Discovery Skill

For fresh source discovery, install `last30days` from [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill). `auto-card-news` is written to use that skill when the user has no source yet or needs current AI information.

Codex install prompt:

```text
Install this Codex skill:
https://github.com/mvanhorn/last30days-skill/tree/main/skills/last30days
```

After restarting Codex, you can ask `$auto-card-news` to use `last30days` for source discovery before creating the carousel.

## One-Line Install

These commands work when the repository is public. If the repository is private, use the Codex install prompt above or clone with a GitHub account that has access.

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

Clone the repository and copy the skill folder into your Codex skills directory.

### Windows PowerShell

```powershell
git clone https://github.com/AIjunja/Auto-card-news.git
New-Item -ItemType Directory -Force "$env:USERPROFILE\.codex\skills" | Out-Null
Copy-Item -Recurse -Force ".\Auto-card-news\skills\auto-card-news" "$env:USERPROFILE\.codex\skills\auto-card-news"
```

### macOS / Linux

```bash
git clone https://github.com/AIjunja/Auto-card-news.git
mkdir -p "$HOME/.codex/skills"
cp -R Auto-card-news/skills/auto-card-news "$HOME/.codex/skills/auto-card-news"
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
