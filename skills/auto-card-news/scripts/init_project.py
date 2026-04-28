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
        "<!doctype html>\n"
        '<html lang="ko">\n'
        "<head>\n"
        '  <meta charset="utf-8">\n'
        f"  <title>{project}</title>\n"
        '  <link rel="stylesheet" href="style.css">\n'
        "</head>\n"
        "<body>\n"
        '  <main class="carousel-preview"></main>\n'
        "</body>\n"
        "</html>\n",
    )
    write_if_missing(project_dir / "style.css", f"@import url('../../../profiles/{channel}/channel.css');\n")
    (project_dir / "cards").mkdir(parents=True, exist_ok=True)
    (project_dir / "output").mkdir(parents=True, exist_ok=True)
    return project_dir


def main() -> int:
    parser = argparse.ArgumentParser(description="Scaffold an auto card news project.")
    parser.add_argument("--root", default=".", help="Directory where carousel-workspace will be created.")
    parser.add_argument("--channel", required=True, help="Channel slug, such as ai-info.")
    parser.add_argument("--project", required=True, help="Project slug, such as 2026-04-29-topic.")
    args = parser.parse_args()

    project_dir = scaffold(Path(args.root).resolve(), args.channel, args.project)
    print(f"Created carousel project: {project_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
