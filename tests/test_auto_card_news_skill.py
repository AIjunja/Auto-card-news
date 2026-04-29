import re
import shutil
import subprocess
import sys
import unittest
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
            "HTML/CSS preview",
            "PNG",
            "MP4",
            "Do not automatically upload",
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
            "references/project-workflow.md",
            "references/design-and-references.md",
            "references/rendering-and-motion.md",
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
            "storyboard.md": ["# {project_name} Storyboard", "Engagement Frame", "Viewer Trigger", "Output Type", "Line Break Plan"],
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
        version = ROOT / "VERSION"
        changelog = ROOT / "CHANGELOG.md"

        self.assertTrue(readme.exists(), "README.md is required for GitHub installation")
        self.assertTrue(install_ps1.exists(), "install.ps1 is required for Windows users")
        self.assertTrue(install_sh.exists(), "install.sh is required for macOS/Linux users")
        self.assertEqual(read_text(version).strip(), "0.3.3")
        self.assertIn("0.3.3", read_text(changelog))

        text = read_text(readme)
        required_phrases = [
            "auto-card-news",
            "last30days",
            "https://github.com/AIjunja/Auto-card-news/tree/master/skills/auto-card-news",
            "https://github.com/mvanhorn/last30days-skill",
            "https://github.com/mvanhorn/last30days-skill/tree/main/skills/last30days",
            "One-Line Install",
            "engagement-first",
            "video reference",
            "line-break QA",
            "lower safe zone",
            "spacing relationship",
            "install.ps1",
            "install.sh",
            "$auto-card-news",
            "Restart Codex",
        ]
        for phrase in required_phrases:
            self.assertIn(phrase, text)

        self.assertIn("auto-card-news", read_text(install_ps1))
        self.assertIn("last30days", read_text(install_ps1))
        self.assertIn("https://github.com/mvanhorn/last30days-skill.git", read_text(install_ps1))
        self.assertIn("skills/last30days", read_text(install_ps1))
        self.assertNotIn("ai-source-scout", read_text(install_ps1))
        self.assertIn("auto-card-news", read_text(install_sh))
        self.assertIn("last30days", read_text(install_sh))
        self.assertIn("https://github.com/mvanhorn/last30days-skill.git", read_text(install_sh))
        self.assertIn("skills/last30days", read_text(install_sh))
        self.assertNotIn("ai-source-scout", read_text(install_sh))


if __name__ == "__main__":
    unittest.main()
