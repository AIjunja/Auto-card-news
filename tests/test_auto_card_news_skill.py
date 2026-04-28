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
            "한국어",
            "채널 프로필",
            "HTML/CSS 미리보기",
            "PNG",
            "MP4",
            "업로드하지 않는다",
        ]
        for phrase in required_phrases:
            self.assertIn(phrase, text)

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
            "design.md": ["# {channel_name} Design", "Typography", "Color", "Layout", "Motion"],
            "brief.md": ["# {project_name} Brief", "Channel", "Goal", "Ratio", "Source Summary"],
            "storyboard.md": ["# {project_name} Storyboard", "Card", "Headline", "Output Type"],
            "motion-plan.md": ["# {project_name} Motion Plan", "Motion Cards", "Duration", "Format"],
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
                workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "brief.md",
                workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "storyboard.md",
                workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "motion-plan.md",
                workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "index.html",
                workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "style.css",
                workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "cards",
                workspace / "projects" / "ai-info" / "2026-04-29-test-topic" / "output",
            ]

            for path in expected_files:
                self.assertTrue(path.exists(), f"Missing scaffold path: {path}")
        finally:
            if temp_path.exists():
                shutil.rmtree(temp_path)
