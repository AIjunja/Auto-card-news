import re
import shutil
import subprocess
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKILL_DIR = ROOT / "skills" / "auto-card-news"
SKILL_MD = SKILL_DIR / "SKILL.md"
MOTION_SKILL_DIR = ROOT / "skills" / "auto-motion-news"
MOTION_SKILL_MD = MOTION_SKILL_DIR / "SKILL.md"
CONTENT_ENGINE_DIR = ROOT / "skills" / "ai-jjuun-content-engine"
CONTENT_ENGINE_SKILL_MD = CONTENT_ENGINE_DIR / "SKILL.md"


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


class AutoCardNewsSkillTest(unittest.TestCase):
    def test_skill_frontmatter_and_core_workflow(self):
        text = read_text(SKILL_MD)
        frontmatter = parse_frontmatter(text)

        self.assertEqual(frontmatter["name"], "auto-card-news")
        description = frontmatter["description"].lower()
        self.assertIn("carousel", description)
        self.assertIn("channel", description)
        self.assertIn("motion", description)

        required_phrases = [
            "Korean",
            "channel profile",
            "Engagement-First",
            "Search media references",
            "Line Break QA",
            "orphaned word",
            "Media Bottom Labels",
            "Spacing Relationship QA",
            "Humanized Marketing Rule",
            "Humanizer",
            "Korean Persona Copy QA",
            "Nemotron-Personas-Korea",
            "sample_korean_personas.py",
            "ad/conversion mode",
            "HyperFrames",
            "Remotion",
            "HTML/CSS preview",
            "PNG",
            "MP4",
            "Do not upload to Instagram",
            "required official API credentials",
        ]
        for phrase in required_phrases:
            self.assertIn(phrase, text)

    def test_auto_card_news_uses_last30days_for_source_discovery(self):
        text = read_text(SKILL_MD)
        workflow = read_text(SKILL_DIR / "references" / "project-workflow.md")
        combined = text + "\n" + workflow

        required_phrases = [
            "last30days",
            "https://github.com/mvanhorn/last30days-skill",
            "fresh source discovery",
            "source-pack.md",
        ]
        for phrase in required_phrases:
            self.assertIn(phrase, combined)

        self.assertNotIn("ai-source-scout", combined)
        self.assertFalse(
            (ROOT / "skills" / "ai-source-scout" / "SKILL.md").exists(),
            "Use the external last30days skill instead of shipping ai-source-scout.",
        )

    def test_references_exist_and_are_linked_from_skill(self):
        skill_text = read_text(SKILL_MD)
        references = [
            "references/channel-profiles.md",
            "references/ai-jjuun-production-playbook.md",
            "references/scrapling-source-collection.md",
            "references/project-workflow.md",
            "references/humanized-marketing-copy.md",
            "references/korean-persona-copy-qa.md",
            "references/design-and-references.md",
            "references/rendering-and-motion.md",
            "references/viral-poster-v2-style.md",
        ]

        for reference in references:
            self.assertIn(reference, skill_text)
            path = SKILL_DIR / reference
            self.assertTrue(path.exists(), f"Missing reference: {reference}")
            text = read_text(path)
            self.assertGreater(len(text.strip()), 500, f"Reference too thin: {reference}")

    def test_templates_exist_and_contain_required_sections(self):
        expected = {
            "profile.md": ["# {channel_name}", "Audience", "Tone", "CTA", "Avoid"],
            "design.md": ["# {channel_name} Design", "Typography", "Media Treatment", "Card-News Rhythm", "Motion", "No short word is stranded alone", "Media label chips sit in the lower safe zone", "Check spacing between chips, section badges, and headline"],
            "brief.md": ["# {project_name} Brief", "Viewer Frame", "Ratio", "Source Summary", "Media References"],
            "storyboard.md": ["# {project_name} Storyboard", "Engagement Frame", "Viewer Trigger", "Output Type", "Line Break Plan", "Humanizer And Marketing QA"],
            "motion-plan.md": ["# {project_name} Motion Plan", "Video / Motion References", "Motion Cards", "Duration", "Format"],
            "source-pack.md": ["# {project_name} Source Pack", "Source Candidates", "Media Candidates", "Recommended Angle"],
        }

        for filename, sections in expected.items():
            path = SKILL_DIR / "assets" / "templates" / filename
            self.assertTrue(path.exists(), f"Missing template: {filename}")
            text = read_text(path)
            for section in sections:
                self.assertIn(section, text, f"{filename} missing {section}")

    def test_init_project_script_scaffolds_expected_files(self):
        script = SKILL_DIR / "scripts" / "init_project.py"
        self.assertTrue(script.exists())

        temp_path = ROOT / ".test-tmp" / "auto-card-news"
        if temp_path.exists():
            shutil.rmtree(temp_path)
        try:
            result = subprocess.run(
                [
                    sys.executable,
                    str(script),
                    "--root",
                    str(temp_path),
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

            self.assertEqual(result.returncode, 0, result.stderr)
            workspace = temp_path / "carousel-workspace"
            expected_files = [
                workspace / "profiles" / "ai-info" / "profile.md",
                workspace / "profiles" / "ai-info" / "design.md",
                workspace / "profiles" / "ai-info" / "channel.css",
                workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "source.md",
                workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "source-pack.md",
                workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "brief.md",
                workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "storyboard.md",
                workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "motion-plan.md",
                workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "index.html",
                workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "style.css",
                workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "cards" / "card-01.html",
                workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "cards",
                workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "output",
            ]

            for path in expected_files:
                self.assertTrue(path.exists(), f"Missing scaffold path: {path}")
        finally:
            if temp_path.exists():
                shutil.rmtree(temp_path)

    def test_distribution_docs_explain_installation(self):
        readme = ROOT / "README.md"
        install_ps1 = ROOT / "install.ps1"
        install_sh = ROOT / "install.sh"
        install_claude_ps1 = ROOT / "install-claude.ps1"
        install_claude_sh = ROOT / "install-claude.sh"
        version = ROOT / "VERSION"
        changelog = ROOT / "CHANGELOG.md"
        codex_quickstart = ROOT / "docs" / "codex-quickstart.md"
        claude_quickstart = ROOT / "docs" / "claude-code-quickstart.md"
        one_link_prompt = ROOT / "examples" / "one-link-ai-news-prompt.md"

        self.assertTrue(readme.exists(), "README.md is required for GitHub installation")
        self.assertTrue(install_ps1.exists(), "install.ps1 is required for Windows users")
        self.assertTrue(install_sh.exists(), "install.sh is required for macOS/Linux users")
        self.assertTrue(install_claude_ps1.exists(), "install-claude.ps1 is required for Claude Code Windows users")
        self.assertTrue(install_claude_sh.exists(), "install-claude.sh is required for Claude Code macOS/Linux users")
        self.assertTrue(codex_quickstart.exists(), "Codex quickstart docs are required")
        self.assertTrue(claude_quickstart.exists(), "Claude Code quickstart docs are required")
        self.assertTrue(one_link_prompt.exists(), "One-link prompt example is required")
        self.assertEqual(read_text(version).strip(), "0.5.0")
        self.assertIn("0.5.0", read_text(changelog))

        text = read_text(readme)
        required_phrases = [
            "AIjjuun Auto Card News",
            "AI쭌 카드뉴스 자동화",
            "source link -> useful angle -> hook -> visual proof -> card-news -> Reel -> caption",
            "auto-card-news",
            "auto-motion-news",
            "ai-jjuun-content-engine",
            "last30days",
            "https://github.com/mvanhorn/last30days-skill",
            "https://github.com/mvanhorn/last30days-skill/tree/main/skills/last30days",
            "Quick Start For Codex",
            "Quick Start For Claude Code",
            "install-claude.ps1",
            "install-claude.sh",
            "SKILL.md",
            "Hook first",
            "Do not make PPT slides",
            "GmarketSans",
            "GeekNews",
            "AX consulting",
            "install.ps1",
            "install.sh",
            "$auto-card-news",
            "$auto-motion-news",
            "Restart Codex",
            "Restart Claude Code",
        ]
        for phrase in required_phrases:
            self.assertIn(phrase, text)

        self.assertIn("auto-card-news", read_text(install_ps1))
        self.assertIn("auto-motion-news", read_text(install_ps1))
        self.assertIn("ai-jjuun-content-engine", read_text(install_ps1))
        self.assertIn("last30days", read_text(install_ps1))
        self.assertIn("https://github.com/mvanhorn/last30days-skill.git", read_text(install_ps1))
        self.assertIn("skills/last30days", read_text(install_ps1))
        self.assertNotIn("ai-source-scout", read_text(install_ps1))
        self.assertIn("auto-card-news", read_text(install_sh))
        self.assertIn("auto-motion-news", read_text(install_sh))
        self.assertIn("ai-jjuun-content-engine", read_text(install_sh))
        self.assertIn("last30days", read_text(install_sh))
        self.assertIn("https://github.com/mvanhorn/last30days-skill.git", read_text(install_sh))
        self.assertIn("skills/last30days", read_text(install_sh))
        self.assertNotIn("ai-source-scout", read_text(install_sh))
        self.assertIn(".claude", read_text(install_claude_ps1))
        self.assertIn("CLAUDE_HOME", read_text(install_claude_ps1))
        self.assertIn("ai-jjuun-content-engine", read_text(install_claude_ps1))
        self.assertIn("last30days", read_text(install_claude_ps1))
        self.assertIn(".claude", read_text(install_claude_sh))
        self.assertIn("CLAUDE_HOME", read_text(install_claude_sh))
        self.assertIn("ai-jjuun-content-engine", read_text(install_claude_sh))
        self.assertIn("last30days", read_text(install_claude_sh))
        self.assertIn("$ai-jjuun-content-engine", read_text(codex_quickstart))
        self.assertIn("Use the ai-jjuun-content-engine skill", read_text(claude_quickstart))
        self.assertIn("<SOURCE_URL>", read_text(one_link_prompt))

    def test_korean_persona_sampler_supports_real_nemotron_samples(self):
        script = SKILL_DIR / "scripts" / "sample_korean_personas.py"
        self.assertTrue(script.exists(), "Korean persona sampler is required")
        text = read_text(script)

        required_phrases = [
            "nvidia/Nemotron-Personas-Korea",
            "load_dataset",
            "--count",
            "--cache-dir",
            "CC BY 4.0",
        ]
        for phrase in required_phrases:
            self.assertIn(phrase, text)


class AutoMotionNewsSkillTest(unittest.TestCase):
    def test_motion_skill_frontmatter_and_core_workflow(self):
        text = read_text(MOTION_SKILL_MD)
        frontmatter = parse_frontmatter(text)

        self.assertEqual(frontmatter["name"], "auto-motion-news")
        description = frontmatter["description"].lower()
        self.assertIn("script", description)
        self.assertIn("motion", description)
        self.assertIn("mp4", description)

        required_phrases = [
            "Korean",
            "Script to Motion",
            "Card News to Script",
            "Card News to Motion",
            "Source to Video Package",
            "HyperFrames",
            "Remotion",
            "video-use",
            "last30days",
            "Korean Persona Video QA",
            "Nemotron-Personas-Korea",
            "sample_korean_personas.py",
            "Do not upload to YouTube",
            "required official API credentials",
            "Approval gate",
            "Humanized Marketing Rule",
            "Humanizer",
            "ad/conversion mode",
            "scene-plan.md",
            "source-pack.md",
            "motion-plan.md",
            "caption.md",
        ]
        for phrase in required_phrases:
            self.assertIn(phrase, text)

    def test_motion_references_exist_and_are_linked_from_skill(self):
        skill_text = read_text(MOTION_SKILL_MD)
        references = [
            "references/video-workflow.md",
            "references/ai-jjuun-reel-playbook.md",
            "references/humanized-video-marketing.md",
            "references/korean-persona-video-qa.md",
            "references/media-research-and-rights.md",
            "references/motion-engine-selection.md",
            "references/viral-poster-v2-reels.md",
        ]

        for reference in references:
            self.assertIn(reference, skill_text)
            path = MOTION_SKILL_DIR / reference
            self.assertTrue(path.exists(), f"Missing reference: {reference}")
            text = read_text(path)
            self.assertGreater(len(text.strip()), 500, f"Reference too thin: {reference}")

    def test_motion_templates_exist_and_contain_required_sections(self):
        expected = {
            "script.md": ["# {project_name} Script", "Hook", "Script", "Humanizer And Marketing QA"],
            "scene-plan.md": ["# {project_name} Scene Plan", "Retention Frame", "Scenes", "Engine"],
            "source-pack.md": ["# {project_name} Source Pack", "Research Sources", "Media Candidates", "Use Type"],
            "motion-plan.md": ["# {project_name} Motion Plan", "Engine Summary", "Motion Scenes", "HyperFrames", "Remotion"],
            "caption.md": ["# {project_name} Caption", "Caption Draft", "Source Links", "Contents Editor", "Humanizer And Marketing QA"],
            "design.md": ["# {project_name} Motion Design", "Format", "Visual System", "Scene Components", "Avoid"],
        }

        for filename, sections in expected.items():
            path = MOTION_SKILL_DIR / "assets" / "templates" / filename
            self.assertTrue(path.exists(), f"Missing template: {filename}")
            text = read_text(path)
            for section in sections:
                self.assertIn(section, text, f"{filename} missing {section}")

    def test_motion_korean_persona_sampler_supports_real_nemotron_samples(self):
        script = MOTION_SKILL_DIR / "scripts" / "sample_korean_personas.py"
        self.assertTrue(script.exists(), "Motion Korean persona sampler is required")
        text = read_text(script)

        required_phrases = [
            "nvidia/Nemotron-Personas-Korea",
            "load_dataset",
            "--count",
            "--cache-dir",
            "CC BY 4.0",
        ]
        for phrase in required_phrases:
            self.assertIn(phrase, text)

    def test_init_motion_project_script_scaffolds_expected_files(self):
        script = MOTION_SKILL_DIR / "scripts" / "init_motion_project.py"
        self.assertTrue(script.exists())

        temp_path = ROOT / ".test-tmp" / "auto-motion-news"
        if temp_path.exists():
            shutil.rmtree(temp_path)
        try:
            result = subprocess.run(
                [
                    sys.executable,
                    str(script),
                    "--root",
                    str(temp_path),
                    "--channel",
                    "ai-jjuun",
                    "--project",
                    "2026-04-30-test-video",
                ],
                cwd=ROOT,
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            project = temp_path / "carousel-workspace" / "motion-projects" / "ai-jjuun" / "2026-04-30-test-video"
            expected_paths = [
                project / "source.md",
                project / "script.md",
                project / "scene-plan.md",
                project / "source-pack.md",
                project / "motion-plan.md",
                project / "caption.md",
                project / "design.md",
                project / "assets",
                project / "scenes",
                project / "output",
            ]

            for path in expected_paths:
                self.assertTrue(path.exists(), f"Missing scaffold path: {path}")
        finally:
            if temp_path.exists():
                shutil.rmtree(temp_path)


class AIJjuunContentEngineSkillTest(unittest.TestCase):
    def test_content_engine_frontmatter_and_stack(self):
        text = read_text(CONTENT_ENGINE_SKILL_MD)
        frontmatter = parse_frontmatter(text)

        self.assertEqual(frontmatter["name"], "ai-jjuun-content-engine")
        description = frontmatter["description"]
        self.assertIn("AI쭌", description)
        self.assertIn("VibeVoice", description)
        self.assertIn("AX consulting", description)

        required_phrases = [
            "../auto-card-news/SKILL.md",
            "../auto-motion-news/SKILL.md",
            "content-memory-map.md",
            "source-discovery-standard.md",
            "copy-visual-motion-standard.md",
            "monetization-and-ax-bridge.md",
            "GmarketSans",
            "humanize-korean",
            "contact-sheet.png",
            "thumbnail-sheet.png",
            "reel-preview.mp4",
        ]
        for phrase in required_phrases:
            self.assertIn(phrase, text)

    def test_content_engine_references_exist_and_are_substantial(self):
        skill_text = read_text(CONTENT_ENGINE_SKILL_MD)
        references = [
            "references/content-memory-map.md",
            "references/source-discovery-standard.md",
            "references/copy-visual-motion-standard.md",
            "references/monetization-and-ax-bridge.md",
        ]

        for reference in references:
            self.assertIn(reference, skill_text)
            path = CONTENT_ENGINE_DIR / reference
            self.assertTrue(path.exists(), f"Missing reference: {reference}")
            text = read_text(path)
            self.assertGreater(len(text.strip()), 1000, f"Reference too thin: {reference}")


if __name__ == "__main__":
    unittest.main()
