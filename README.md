# AIjjuun Auto Card News

Version: `0.5.0`

Turn one source link into an Instagram-ready AI news package:

- card-news carousel
- short Reel / Shorts plan
- caption
- source pack
- visual direction
- QA checklist

This repository is a public skill sample for creators who want to make AI trend content with Codex or Claude Code.

> AI쭌 카드뉴스 자동화: 스킬 깔고 링크 하나만 던지면, 카드뉴스 + 릴스 + 캡션 제작 흐름을 알아서 잡아주는 Agent Skill 샘플입니다.

## What It Does

Give the agent a URL, GitHub repo, official blog post, X/Threads post, GeekNews link, Reddit thread, paper, or memo.

The skills guide the agent to:

- verify the source instead of copying viral posts blindly
- find official docs, demos, screenshots, community reactions, and related GitHub repos
- frame the topic for Korean AI-curious viewers
- write short, human Korean copy instead of translated AI summaries
- create an engagement-first carousel storyboard
- plan or produce motion cards and Reels with HyperFrames or Remotion
- write a compact Instagram / Threads caption with useful source links
- connect the content to practical AX consulting angles

The goal is not “pretty slides.” The goal is:

```text
source link -> useful angle -> hook -> visual proof -> card-news -> Reel -> caption
```

## Included Skills

| Skill | Use it when |
| --- | --- |
| `ai-jjuun-content-engine` | You want the full AI쭌 production system: source discovery, hook, copy, visual, Reel, caption, QA, and AX bridge |
| `auto-card-news` | You want a card-news / Instagram carousel workflow |
| `auto-motion-news` | You want a Reel, Shorts, motion card, or script-to-video package |
| `last30days` | You want fresh source discovery from the web |

## Quick Start For Codex

### One-Line Install

Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -Command "iwr -useb https://raw.githubusercontent.com/AIjunja/Auto-card-news/master/install.ps1 | iex"
```

macOS / Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/AIjunja/Auto-card-news/master/install.sh | bash
```

Restart Codex after installation.

### Use In Codex

Paste this into Codex:

```text
$ai-jjuun-content-engine
https://openai.com/index/academy-courses-applying-ai-at-work

AI쭌 채널용으로 카드뉴스랑 릴스랑 캡션 만들어줘.
실제 사용 이미지/영상 소스도 찾아보고, 첫 장은 후킹되게 잡아줘.
```

You can also call the base skills directly:

```text
$auto-card-news
<source URL>

$auto-motion-news
<script or source URL>
```

## Quick Start For Claude Code

Claude Code can use the same `SKILL.md`-based skill folders.

### One-Line Install

Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -Command "iwr -useb https://raw.githubusercontent.com/AIjunja/Auto-card-news/master/install-claude.ps1 | iex"
```

macOS / Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/AIjunja/Auto-card-news/master/install-claude.sh | bash
```

Restart Claude Code after installation.

### Use In Claude Code

Paste a request like this:

```text
Use the ai-jjuun-content-engine skill.

Source:
https://github.com/microsoft/markitdown

Make an AI쭌-style Korean card-news package:
- 7-card carousel
- Reel plan
- caption
- source links
- visual references
- no stiff translated Korean
- explain why viewers should care
```

## Manual Install

### Codex

Copy skills into your Codex skills directory:

```text
~/.codex/skills/
```

Required folders:

```text
skills/ai-jjuun-content-engine
skills/auto-card-news
skills/auto-motion-news
```

Recommended companion:

```text
https://github.com/mvanhorn/last30days-skill/tree/main/skills/last30days
```

### Claude Code

Copy the same skill folders into your Claude skills directory:

```text
~/.claude/skills/
```

Required folders:

```text
skills/ai-jjuun-content-engine
skills/auto-card-news
skills/auto-motion-news
```

Recommended companion:

```text
https://github.com/mvanhorn/last30days-skill/tree/main/skills/last30days
```

## Example Output Package

A typical project folder should contain:

```text
source.md
source-pack.md
brief.md
storyboard.md
motion-plan.md
caption.md
design.md
cards/
output/
  card-01.png
  card-02.png
  ...
  reel-preview.mp4
  contact-sheet.png
  thumbnail-sheet.png
```

The exact rendering depends on the local agent environment, browser tools, image tools, HyperFrames, Remotion, and available media sources.

## AI쭌 Production Rules

This repo encodes the production lessons from many AI쭌 content experiments:

- Hook first. The first card or first 3 seconds must show why the viewer should stop.
- Do not make PPT slides. Use real visuals, demos, product screenshots, or generated key images.
- Do not explain technology names first. Start from the viewer’s situation and result.
- Keep Korean copy short, natural, and useful.
- Avoid “AI쭌식” wording. Use `AI JJUN` as branding, but make the explanation viewer-first.
- Use GmarketSans-style readability for Korean card text.
- For Reels, use hook -> explanation -> proof -> comment/save/follow CTA.
- Prefer minor-but-useful AI tools, GitHub repos, GeekNews, X/Threads, Reddit, docs, demos, and product updates over generic official-blog summaries.
- Add a practical AX bridge: how this could help a company, creator, developer, marketer, or solo founder.

## Best Source Types

Good sources:

- official OpenAI / Anthropic / Google / Microsoft / Figma / Adobe docs
- GitHub repos with clear use cases or hype signals
- GeekNews and Hacker News discussions
- X / Threads posts with strong reactions
- Reddit discussions with practical pain points
- YouTube demos or product videos
- release notes, changelogs, examples, cookbooks, papers

Avoid making content from a single viral post without checking the underlying source.

## What This Is Not

This is not a hosted SaaS.

This repository does not automatically upload to Instagram, Threads, TikTok, or YouTube. Upload automation requires official platform API credentials and account review. The skills can prepare the assets and captions; publishing should be handled separately.

## Repository Layout

```text
skills/
  ai-jjuun-content-engine/
    SKILL.md
    agents/openai.yaml
    references/
  auto-card-news/
    SKILL.md
    assets/templates/
    references/
    scripts/
  auto-motion-news/
    SKILL.md
    assets/templates/
    references/
    scripts/
docs/
  codex-quickstart.md
  claude-code-quickstart.md
examples/
  one-link-ai-news-prompt.md
tests/
```

## Verify

```powershell
python -m unittest tests.test_auto_card_news_skill -v
```

The test suite checks the skill metadata, references, templates, scaffold scripts, installer docs, and Claude/Codex distribution files.

## License

This repository is intended as a reusable Agent Skill sample. Check each external media source, font, screenshot, video clip, and GitHub repository license before using it commercially.
