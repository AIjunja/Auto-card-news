# Auto Card News Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable Codex skill that guides the user through channel-aware carousel/card-news creation, HTML/CSS preview, and mixed PNG/MP4 card export planning.

**Architecture:** Create a repo-local skill package under `skills/auto-card-news/` with a concise `SKILL.md`, focused reference files, reusable artifact templates, and a small scaffold script. The skill is implemented as procedural guidance plus bundled resources, not as a hosted app. Installation into `C:\Users\letgo\.codex\skills\auto-card-news` is a final explicit step because it writes outside the workspace.

**Tech Stack:** Markdown skill files, YAML metadata, Python stdlib scaffold script and tests, optional future Playwright/Remotion usage documented in references.

---

## Scope Check

The approved spec includes channel profiling, design references, static rendering, motion-card planning, and file asset management. This plan implements the Codex skill and its reusable scaffolding. It does not build a full renderer, Remotion project, or social upload system; those are intentionally generated per carousel project after the skill is invoked.

## File Structure

- Create `tests/test_carousel_creator_skill.py`: unit tests for skill structure, references, templates, and scaffold script.
- Create `skills/auto-card-news/SKILL.md`: core triggerable skill instructions.
- Create `skills/auto-card-news/agents/openai.yaml`: UI metadata for the skill chip.
- Create `skills/auto-card-news/references/channel-profiles.md`: deeper instructions for profile creation and updates.
- Create `skills/auto-card-news/references/project-workflow.md`: source intake, angle selection, copy, storyboard, review flow.
- Create `skills/auto-card-news/references/design-and-references.md`: how to use carousel-automation, shadcn/ui, oh-my-design, and channel design systems.
- Create `skills/auto-card-news/references/rendering-and-motion.md`: static PNG and Remotion-style MP4 rules.
- Create `skills/auto-card-news/assets/templates/profile.md`: channel profile template.
- Create `skills/auto-card-news/assets/templates/design.md`: channel design template.
- Create `skills/auto-card-news/assets/templates/brief.md`: project brief template.
- Create `skills/auto-card-news/assets/templates/storyboard.md`: storyboard template.
- Create `skills/auto-card-news/assets/templates/motion-plan.md`: motion plan template.
- Create `skills/auto-card-news/scripts/init_project.py`: deterministic project folder initializer.

---

### Task 1: Add Core Skill Contract Test

**Files:**
- Create: `tests/test_carousel_creator_skill.py`

- [ ] **Step 1: Write the failing frontmatter test**

Create `tests/test_carousel_creator_skill.py`:

```python
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKILL_DIR = ROOT / "skills" / "auto-card-news"
SKILL_MD = SKILL_DIR / "SKILL.md"


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def parse_frontmatter(text: str) -> dict[str, str]:
    match = re.match(r"---\n(.*?)\n---\n", text, re.S)
    assert match, "SKILL.md must start with YAML frontmatter"
    frontmatter = {}
    for line in match.group(1).splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            frontmatter[key.strip()] = value.strip().strip('"')
    return frontmatter


def test_skill_frontmatter_and_core_workflow():
    text = read_text(SKILL_MD)
    frontmatter = parse_frontmatter(text)

    assert frontmatter["name"] == "auto-card-news"
    description = frontmatter["description"].lower()
    assert "carousel" in description
    assert "channel" in description
    assert "motion" in description

    required_phrases = [
        "한국어",
        "채널 프로필",
        "HTML/CSS 미리보기",
        "PNG",
        "MP4",
        "업로드하지 않는다",
    ]
    for phrase in required_phrases:
        assert phrase in text
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```powershell
python -m unittest tests.test_carousel_creator_skill -v
```

Expected: FAIL with `FileNotFoundError` for `skills/auto-card-news/SKILL.md`.

- [ ] **Step 3: Commit the failing test**

```powershell
git add tests/test_carousel_creator_skill.py
git commit -m "test: add Auto Card News skill contract"
```

---

### Task 2: Create Core Skill Metadata and Workflow

**Files:**
- Create: `skills/auto-card-news/SKILL.md`
- Create: `skills/auto-card-news/agents/openai.yaml`

- [ ] **Step 1: Create `SKILL.md`**

Create `skills/auto-card-news/SKILL.md`:

```markdown
---
name: auto-card-news
description: Use when creating carousel/card-news content through Codex conversation, including channel profiles, HTML/CSS previews, static PNG cards, and motion MP4 cards.
---

# Auto Card News

Use this skill when the user wants to create a carousel, card-news post, Instagram carousel, mixed image/video carousel, or channel-specific content package.

## Operating Language

Ask and explain in 한국어 by default. Use another language only when the user requests it or the source material requires it.

## Core Rule

This is a conversation-driven production workflow, not a SaaS app and not an upload automation. Do not automatically upload to Instagram or any social platform.

## Required Workflow

1. **Confirm channel context**
   - Ask whether to use an existing channel profile or create a new one.
   - Reconfirm the active channel before working on the source.
   - Keep AI information, football information, and PitchCheck marketing contexts separated.

2. **Create or update the channel profile**
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
   - Build an HTML/CSS preview first.
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
```

- [ ] **Step 2: Create `agents/openai.yaml`**

Create `skills/auto-card-news/agents/openai.yaml`:

```yaml
display_name: Auto Card News
short_description: Create channel-aware carousel posts with HTML previews, PNG cards, and MP4 motion cards.
default_prompt: 카드뉴스 또는 인스타 캐러셀을 만들고 싶어요. 채널 프로필부터 잡고, HTML 미리보기 후 PNG/MP4로 출력해 주세요.
```

- [ ] **Step 3: Run the core contract test**

Run:

```powershell
python -m unittest tests.test_carousel_creator_skill -v
```

Expected: PASS for `test_skill_frontmatter_and_core_workflow`.

- [ ] **Step 4: Commit**

```powershell
git add skills/auto-card-news/SKILL.md skills/auto-card-news/agents/openai.yaml tests/test_carousel_creator_skill.py
git commit -m "feat: add Auto Card News skill core"
```

---

### Task 3: Add Reference Files

**Files:**
- Modify: `tests/test_carousel_creator_skill.py`
- Create: `skills/auto-card-news/references/channel-profiles.md`
- Create: `skills/auto-card-news/references/project-workflow.md`
- Create: `skills/auto-card-news/references/design-and-references.md`
- Create: `skills/auto-card-news/references/rendering-and-motion.md`

- [ ] **Step 1: Add reference existence test**

Append this test to `tests/test_carousel_creator_skill.py`:

```python
def test_references_exist_and_are_linked_from_skill():
    skill_text = read_text(SKILL_MD)
    references = [
        "references/channel-profiles.md",
        "references/project-workflow.md",
        "references/design-and-references.md",
        "references/rendering-and-motion.md",
    ]

    for reference in references:
        assert reference in skill_text
        path = SKILL_DIR / reference
        assert path.exists(), f"Missing reference: {reference}"
        text = read_text(path)
        assert len(text.strip()) > 500, f"Reference too thin: {reference}"
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
python -m unittest tests.test_carousel_creator_skill -v
```

Expected: FAIL because the reference files do not exist yet.

- [ ] **Step 3: Create `channel-profiles.md`**

Create `skills/auto-card-news/references/channel-profiles.md`:

```markdown
# Channel Profiles

Use this reference when selecting, creating, analyzing, or updating a channel profile.

## Quick Profile

Use Quick Profile when the channel is new or the user has no examples. Collect these six fields one at a time:

1. Target audience
2. Channel purpose
3. Tone and manner
4. CTA style
5. Design direction
6. Avoid list

Summarize the answers back to the user before saving. If the user is unsure, propose a concise default and ask for confirmation.

## Deep Profile

Use Deep Profile when the user provides a channel link, screenshots, existing posts, captions, or representative content. Recommend at least three representative posts. If access to the channel is blocked, ask for screenshots, exported images, captions, or a short report.

Analyze:

- Recurring topics
- Hook style
- Typical carousel length
- Sentence rhythm
- Visual density
- Text/image balance
- CTA patterns
- Audience expectations
- Design risks to avoid

Do not claim to have analyzed visuals that were not actually available. If only text is available, describe the profile as text-based and ask for visual samples before finalizing design rules.

## Profile Update

After each project, offer to update the active profile if reusable patterns emerged. Useful updates include:

- Better hook pattern
- Stronger CTA
- New avoid rule
- Reusable motion idea
- Improved default ratio
- More accurate audience description
- Reusable card structure

Keep channel profiles isolated. Never blend assumptions from AI information, football information, and PitchCheck marketing unless the user explicitly asks to reuse a pattern.
```

- [ ] **Step 4: Create `project-workflow.md`**

Create `skills/auto-card-news/references/project-workflow.md`:

```markdown
# Project Workflow

Use this reference when converting source material into a carousel project.

## Source Intake

Accepted inputs include URLs, reports, memos, drafts, pasted GPT conversations, screenshots, captions, and raw notes. Save the original material to `source.md`.

When the source is a URL, fetch the accessible content. If access is blocked, ask the user to paste the relevant parts or provide screenshots. State the limitation clearly in `brief.md`.

## Source Summary

Summarize:

- Core message
- Main claims
- Useful facts or quotes
- Audience relevance
- Missing context
- Risky assumptions

## Angle Options

Always propose two or three angles, even when the user gives a direction. Keep each angle at medium depth:

- Angle name
- Hook example
- Who it works best for
- Expected 3-5 card flow

Let the user choose, reject, or combine angles.

## Copy Draft

After the angle is chosen, write full card copy in one pass. Number every card. This is first-pass copy approval, not final approval.

Good user edits should be easy to make by card number:

- "Make card 1 hook stronger."
- "Shorten card 3."
- "Make card 2 motion instead of static."
- "Make the CTA less salesy."

## Review Stages

Use these stages in order:

1. Copy review for message and flow
2. Text wireframe review for hierarchy
3. HTML/CSS preview review for actual layout
4. Final render approval for PNG and MP4

Do not render final assets before HTML/CSS preview approval.
```

- [ ] **Step 5: Create `design-and-references.md`**

Create `skills/auto-card-news/references/design-and-references.md`:

```markdown
# Design and References

Use this reference before writing `design.md`, `channel.css`, card layouts, or project-level CSS.

## Design Strategy

Use a channel design system plus project-level variation. The channel keeps consistent typography, color, layout, and CTA rules. Each project can adjust visual emphasis, card rhythm, and special components.

## carousel-automation Reference

Borrow the idea of HTML/CSS templates rendered by Playwright. Useful concepts:

- Fixed ratio viewport
- One card per render target
- CSS-driven layout
- Browser screenshot export
- Content guidelines to prevent overflow

Do not inherit DataTalksClub visual style or unimplemented frame assumptions.

## shadcn/ui Reference

Use shadcn/ui as a detail reference for organized information components:

- Cards
- Badges
- Tabs
- Stats
- Callouts
- Compact lists
- Buttons and CTA blocks

The carousel should not look like an app screen unless the content is an app demo. Borrow clarity, spacing, hierarchy, and component discipline.

## oh-my-design Reference

Use an oh-my-design style mindset for `design.md`. Capture:

- Brand or channel philosophy
- Audience and persona
- Voice and tone
- Typography
- Color
- Layout
- Composition patterns
- Motion principles
- Avoid rules
- Review checklist

## Design Review

Before rendering final assets, check:

- Text fits inside each card.
- Important text is visible at mobile size.
- Card rhythm does not feel repetitive.
- CTA matches the active channel.
- Motion, if used, supports understanding or retention.
- Project-specific CSS does not fight `channel.css`.
```

- [ ] **Step 6: Create `rendering-and-motion.md`**

Create `skills/auto-card-news/references/rendering-and-motion.md`:

```markdown
# Rendering and Motion

Use this reference before choosing static PNG, motion MP4, or optional JPEG/PDF output.

## Output Model

Each card has its own output type. A final carousel can mix files:

```text
output/
  card-01.png
  card-02.mp4
  card-03.png
```

## Static PNG

Use static PNG for:

- Dense reading cards
- Save-worthy checklists
- Summary cards
- Quiet explanation cards
- Cards that need visual stability

Use HTML/CSS as the source and Playwright or an equivalent browser renderer to capture the final card. PNG is the default. JPEG and PDF are optional only when requested.

## Motion MP4

Use motion MP4 when motion improves retention, attention, or understanding.

Recommend motion for:

- Count-up numbers
- Animated comparisons
- Step-by-step processes
- Football tactics, such as player movement or passing lanes
- PitchCheck app interactions, such as taps, checks, confirmations, and screen transitions
- Before/after transformations
- Hook reveals
- Timelines and rankings

Use Remotion-style structure when creating motion cards. Keep motion short and purposeful. Respect the channel design system. Ask for approval before generating motion output.

## Remotion License Reminder

Remotion has license conditions that can matter for company or commercial use. When a project relies on Remotion for commercial work, remind the user to confirm the license terms before shipping.
```

- [ ] **Step 7: Run tests**

Run:

```powershell
python -m unittest tests.test_carousel_creator_skill -v
```

Expected: PASS for frontmatter and reference tests.

- [ ] **Step 8: Commit**

```powershell
git add tests/test_carousel_creator_skill.py skills/auto-card-news/references
git commit -m "feat: add Auto Card News references"
```

---

### Task 4: Add Artifact Templates

**Files:**
- Modify: `tests/test_carousel_creator_skill.py`
- Create: `skills/auto-card-news/assets/templates/profile.md`
- Create: `skills/auto-card-news/assets/templates/design.md`
- Create: `skills/auto-card-news/assets/templates/brief.md`
- Create: `skills/auto-card-news/assets/templates/storyboard.md`
- Create: `skills/auto-card-news/assets/templates/motion-plan.md`

- [ ] **Step 1: Add template test**

Append this test to `tests/test_carousel_creator_skill.py`:

```python
def test_templates_exist_and_contain_required_sections():
    expected = {
        "profile.md": ["# {channel_name}", "Audience", "Tone", "CTA", "Avoid"],
        "design.md": ["# {channel_name} Design", "Typography", "Color", "Layout", "Motion"],
        "brief.md": ["# {project_name} Brief", "Channel", "Goal", "Ratio", "Source Summary"],
        "storyboard.md": ["# {project_name} Storyboard", "Card", "Headline", "Output Type"],
        "motion-plan.md": ["# {project_name} Motion Plan", "Motion Cards", "Duration", "Format"],
    }

    for filename, sections in expected.items():
        path = SKILL_DIR / "assets" / "templates" / filename
        assert path.exists(), f"Missing template: {filename}"
        text = read_text(path)
        for section in sections:
            assert section in text, f"{filename} missing {section}"
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
python -m unittest tests.test_carousel_creator_skill -v
```

Expected: FAIL because template files do not exist.

- [ ] **Step 3: Create templates**

Create `skills/auto-card-news/assets/templates/profile.md`:

```markdown
# {channel_name}

## Audience

{audience}

## Purpose

{purpose}

## Tone

{tone}

## CTA Style

{cta_style}

## Design Direction

{design_direction}

## Avoid

{avoid}

## Default Ratio

{default_ratio}

## Common Content Angles

- {content_angle}

## Review Checklist

- Active channel is correct.
- Tone matches this profile.
- CTA matches this profile.
- Design choices do not conflict with avoid rules.
```

Create `skills/auto-card-news/assets/templates/design.md`:

```markdown
# {channel_name} Design

## Design Philosophy

{design_philosophy}

## Typography

{typography}

## Color

{color}

## Layout

{layout}

## Card Composition

{card_composition}

## Components

{components}

## Motion

{motion}

## Avoid

{avoid}

## Design Review Checklist

- Text remains readable on mobile.
- Important hierarchy is visible in the first second.
- Static and motion cards feel like one channel.
- Project-level CSS supports the channel system.
```

Create `skills/auto-card-news/assets/templates/brief.md`:

```markdown
# {project_name} Brief

## Channel

{channel_name}

## Goal

{goal}

## Audience

{audience}

## CTA

{cta}

## Ratio

{ratio}

## Chosen Angle

{chosen_angle}

## Source Summary

{source_summary}

## Constraints

{constraints}
```

Create `skills/auto-card-news/assets/templates/storyboard.md`:

```markdown
# {project_name} Storyboard

| Card | Role | Headline | Body | Visual Direction | Output Type |
| --- | --- | --- | --- | --- | --- |
| 1 | {role} | {headline} | {body} | {visual_direction} | {output_type} |

## Revision Notes

- {revision_note}
```

Create `skills/auto-card-news/assets/templates/motion-plan.md`:

```markdown
# {project_name} Motion Plan

## Motion Cards

| Card | Reason | Animation Concept | Duration | Format |
| --- | --- | --- | --- | --- |
| {card_number} | {reason} | {animation_concept} | {duration} | {format} |

## Static Cards

- {static_card_note}

## Render Notes

- Motion cards default to MP4.
- Static cards default to PNG.
- Confirm Remotion license terms for commercial use when motion output depends on Remotion.
```

- [ ] **Step 4: Run tests**

Run:

```powershell
python -m unittest tests.test_carousel_creator_skill -v
```

Expected: PASS for frontmatter, reference, and template tests.

- [ ] **Step 5: Commit**

```powershell
git add tests/test_carousel_creator_skill.py skills/auto-card-news/assets/templates
git commit -m "feat: add Auto Card News templates"
```

---

### Task 5: Add Project Scaffold Script

**Files:**
- Modify: `tests/test_carousel_creator_skill.py`
- Create: `skills/auto-card-news/scripts/init_project.py`

- [ ] **Step 1: Add scaffold script test**

Append this test to `tests/test_carousel_creator_skill.py`:

```python
def test_init_project_script_scaffolds_expected_files(tmp_path):
    script = SKILL_DIR / "scripts" / "init_project.py"
    assert script.exists()

    result = subprocess.run(
        [
            sys.executable,
            str(script),
            "--root",
            str(tmp_path),
            "--channel",
            "ai-info",
            "--project",
            "2026-04-29-test-topic",
        ],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )

    assert result.returncode == 0, result.stderr
    workspace = tmp_path / "carousel-workspace"
    expected_files = [
        workspace / "profiles" / "ai-info" / "profile.md",
        workspace / "profiles" / "ai-info" / "design.md",
        workspace / "profiles" / "ai-info" / "channel.css",
        workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "source.md",
        workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "brief.md",
        workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "storyboard.md",
        workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "motion-plan.md",
        workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "index.html",
        workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "style.css",
        workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "cards",
        workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "output",
    ]

    for path in expected_files:
        assert path.exists(), f"Missing scaffold path: {path}"
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
python -m unittest tests.test_carousel_creator_skill -v
```

Expected: FAIL because `scripts/init_project.py` does not exist.

- [ ] **Step 3: Create `init_project.py`**

Create `skills/auto-card-news/scripts/init_project.py`:

```python
#!/usr/bin/env python
from __future__ import annotations

import argparse
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
SKILL_DIR = SCRIPT_DIR.parent
TEMPLATE_DIR = SKILL_DIR / "assets" / "templates"


def read_template(name: str) -> str:
    return (TEMPLATE_DIR / name).read_text(encoding="utf-8")


def write_if_missing(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.write_text(content, encoding="utf-8")


def render(template: str, values: dict[str, str]) -> str:
    output = template
    for key, value in values.items():
        output = output.replace("{" + key + "}", value)
    return output


def scaffold(root: Path, channel: str, project: str) -> Path:
    workspace = root / "carousel-workspace"
    profile_dir = workspace / "profiles" / channel
    project_dir = workspace / "projects" / channel / project

    values = {
        "channel_name": channel,
        "project_name": project,
        "audience": "Defined during channel profiling.",
        "purpose": "Defined during channel profiling.",
        "tone": "Defined during channel profiling.",
        "cta_style": "Defined during channel profiling.",
        "design_direction": "Defined during channel profiling.",
        "avoid": "Defined during channel profiling.",
        "default_ratio": "4:5",
        "content_angle": "Defined after source analysis.",
        "design_philosophy": "Defined during design profiling.",
        "typography": "Defined during design profiling.",
        "color": "Defined during design profiling.",
        "layout": "Defined during design profiling.",
        "card_composition": "Defined during design profiling.",
        "components": "Defined during design profiling.",
        "motion": "Defined during motion planning.",
        "goal": "Defined during project brief.",
        "cta": "Defined during project brief.",
        "ratio": "4:5",
        "chosen_angle": "Defined after angle selection.",
        "source_summary": "Defined after source intake.",
        "constraints": "Defined during project brief.",
        "role": "Hook",
        "headline": "Draft headline",
        "body": "Draft body",
        "visual_direction": "Draft visual direction",
        "output_type": "PNG or MP4",
        "revision_note": "Record user-requested revisions here.",
        "card_number": "1",
        "reason": "Motion improves attention or understanding.",
        "animation_concept": "Short reveal or transition.",
        "duration": "3s",
        "format": "MP4",
        "static_card_note": "Static cards render as PNG.",
    }

    write_if_missing(profile_dir / "profile.md", render(read_template("profile.md"), values))
    write_if_missing(profile_dir / "design.md", render(read_template("design.md"), values))
    write_if_missing(
        profile_dir / "channel.css",
        ":root {\n  --carousel-bg: #ffffff;\n  --carousel-fg: #111111;\n}\n",
    )

    write_if_missing(project_dir / "source.md", "# Source\n\nPaste or summarize the source material here.\n")
    write_if_missing(project_dir / "brief.md", render(read_template("brief.md"), values))
    write_if_missing(project_dir / "storyboard.md", render(read_template("storyboard.md"), values))
    write_if_missing(project_dir / "motion-plan.md", render(read_template("motion-plan.md"), values))
    write_if_missing(
        project_dir / "index.html",
        "<!doctype html>\n<html lang=\"ko\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>"
        + project
        + "</title>\n  <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n  <main class=\"carousel-preview\"></main>\n</body>\n</html>\n",
    )
    write_if_missing(project_dir / "style.css", "@import url('../../../profiles/" + channel + "/channel.css');\n")
    (project_dir / "cards").mkdir(parents=True, exist_ok=True)
    (project_dir / "output").mkdir(parents=True, exist_ok=True)
    return project_dir


def main() -> int:
    parser = argparse.ArgumentParser(description="Scaffold a Auto Card News project.")
    parser.add_argument("--root", default=".", help="Directory where carousel-workspace will be created.")
    parser.add_argument("--channel", required=True, help="Channel slug, such as ai-info.")
    parser.add_argument("--project", required=True, help="Project slug, such as 2026-04-29-topic.")
    args = parser.parse_args()

    project_dir = scaffold(Path(args.root).resolve(), args.channel, args.project)
    print(f"Created carousel project: {project_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 4: Run tests**

Run:

```powershell
python -m unittest tests.test_carousel_creator_skill -v
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```powershell
git add tests/test_carousel_creator_skill.py skills/auto-card-news/scripts/init_project.py
git commit -m "feat: add carousel project scaffold script"
```

---

### Task 6: Validate Skill Package and Install Locally

**Files:**
- Read: `skills/auto-card-news/**`
- Copy to: `C:\Users\letgo\.codex\skills\auto-card-news\`

- [ ] **Step 1: Run full validation**

Run:

```powershell
python -m unittest tests.test_carousel_creator_skill -v
```

Expected: all tests PASS.

- [ ] **Step 2: Scan for unresolved planning markers**

Run:

```powershell
Select-String -Path 'skills\auto-card-news\**\*' -Pattern 'T[O]DO|T[B]D|implement\s+later'
```

Expected: no matches.

- [ ] **Step 3: Install skill into Codex skills directory**

This writes outside the workspace and requires user approval.

Run:

```powershell
Copy-Item -Recurse -Force 'skills\auto-card-news' 'C:\Users\letgo\.codex\skills\auto-card-news'
```

Expected: `C:\Users\letgo\.codex\skills\auto-card-news\SKILL.md` exists.

- [ ] **Step 4: Verify installed files**

Run:

```powershell
Test-Path 'C:\Users\letgo\.codex\skills\auto-card-news\SKILL.md'
```

Expected: `True`.

- [ ] **Step 5: Commit repository copy**

```powershell
git add skills/auto-card-news tests/test_carousel_creator_skill.py docs/superpowers/plans/2026-04-29-auto-card-news-skill-implementation.md
git commit -m "feat: add Auto Card News skill package"
```

---

## Self-Review

- Spec coverage: The plan covers channel profiles, Korean-first behavior, URL/source handling, angle proposals, copy and wireframe review, HTML preview, card-level PNG/MP4 output decisions, Remotion license reminder, shadcn/ui and oh-my-design references, file asset accumulation, and no-upload behavior.
- Placeholder scan: The plan uses template variables such as `{channel_name}` intentionally inside template files. It does not leave unresolved implementation markers.
- Type consistency: The tests consistently use `SKILL_DIR`, `SKILL_MD`, and the same reference/template filenames created in later tasks.

