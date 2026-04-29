# Auto Motion News Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an `auto-motion-news` Codex skill that turns scripts, card-news projects, or raw source material into short-form motion-video plans and render-ready project scaffolds.

**Architecture:** Add a new skill folder beside `auto-card-news`, with concise `SKILL.md` workflow guidance, focused references, reusable templates, and a Python scaffolding script. Update repo distribution docs/installers so GitHub installs include `auto-card-news`, `auto-motion-news`, and `last30days`.

**Tech Stack:** Markdown Codex skills, Python standard library scaffolding script, unittest distribution tests, existing PowerShell/Bash installers.

---

### Task 1: Add Skill Contract And References

**Files:**
- Create: `skills/auto-motion-news/SKILL.md`
- Create: `skills/auto-motion-news/agents/openai.yaml`
- Create: `skills/auto-motion-news/references/video-workflow.md`
- Create: `skills/auto-motion-news/references/media-research-and-rights.md`
- Create: `skills/auto-motion-news/references/motion-engine-selection.md`

- [ ] **Step 1: Write the skill entrypoint**

Create `SKILL.md` with:

```markdown
---
name: auto-motion-news
description: Use when the user wants to turn a script, card-news project, source link, or notes into a short-form motion video, especially Instagram Reels, YouTube Shorts, HyperFrames, Remotion, MP4, scene plans, captions, or visual reference research.
---
```

Include Korean default language, no automatic social upload, the four supported modes, approval gates, artifact structure, and reference-loading instructions.

- [ ] **Step 2: Write focused references**

Create the three reference files. They must cover:

- video workflow from input to MP4
- media search and rights classification
- HyperFrames, Remotion, and video-use selection rules

- [ ] **Step 3: Add OpenAI skill metadata**

Create `agents/openai.yaml` with display name, short description, and Korean default prompt.

### Task 2: Add Templates And Scaffolding

**Files:**
- Create: `skills/auto-motion-news/assets/templates/script.md`
- Create: `skills/auto-motion-news/assets/templates/scene-plan.md`
- Create: `skills/auto-motion-news/assets/templates/source-pack.md`
- Create: `skills/auto-motion-news/assets/templates/motion-plan.md`
- Create: `skills/auto-motion-news/assets/templates/caption.md`
- Create: `skills/auto-motion-news/assets/templates/design.md`
- Create: `skills/auto-motion-news/scripts/init_motion_project.py`

- [ ] **Step 1: Add templates**

Templates must include placeholders for project name, channel name, target platform, source URLs, scene timing, visual research, render engine, and attribution.

- [ ] **Step 2: Add scaffold script**

`init_motion_project.py` must accept:

```text
--root <path>
--channel <slug>
--project <slug>
```

It creates:

```text
carousel-workspace/
  motion-projects/<channel>/<project>/
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

### Task 3: Update Distribution Docs And Installers

**Files:**
- Modify: `README.md`
- Modify: `install.ps1`
- Modify: `install.sh`
- Modify: `VERSION`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Bump version to 0.4.0**

Update `VERSION`, README version line, and changelog.

- [ ] **Step 2: Update README**

Document that the repo ships both `auto-card-news` and `auto-motion-news`.

- [ ] **Step 3: Update installers**

Install `auto-motion-news` from the same repo alongside `auto-card-news`, and keep installing `last30days`.

### Task 4: Add Tests

**Files:**
- Modify: `tests/test_auto_card_news_skill.py`

- [ ] **Step 1: Add constants**

Add:

```python
MOTION_SKILL_DIR = ROOT / "skills" / "auto-motion-news"
MOTION_SKILL_MD = MOTION_SKILL_DIR / "SKILL.md"
```

- [ ] **Step 2: Add skill tests**

Test frontmatter, references, templates, scaffold script, installer content, README content, and version `0.4.0`.

- [ ] **Step 3: Run tests**

Run:

```powershell
python -m unittest tests.test_auto_card_news_skill
```

Expected: all tests pass.

### Task 5: Install, Verify, Commit, Push

**Files:**
- Copy: `skills/auto-motion-news` to `C:\Users\letgo\.codex\skills\auto-motion-news`

- [ ] **Step 1: Sync local installed skill**

Copy the new skill folder into the Codex skills directory.

- [ ] **Step 2: Verify installed skill**

Confirm installed `SKILL.md` includes `auto-motion-news`, HyperFrames, Remotion, and `video-use`.

- [ ] **Step 3: Commit and push**

Stage changed files, commit:

```bash
git commit -m "Add auto motion news skill"
```

Push:

```bash
git push origin master
```

