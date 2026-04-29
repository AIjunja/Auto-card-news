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
        "card_news_rhythm": "Defined during design profiling.",
        "card_composition": "Defined during design profiling.",
        "media_treatment": "Use large source media, screenshots, or video frames when they clarify the point. Protect text with dim, blur, or gradient transitions.",
        "components": "Defined during design profiling.",
        "motion": "Defined during motion planning.",
        "goal": "Defined during project brief.",
        "cta": "Defined during project brief.",
        "ratio": "4:5",
        "who_stops": "Defined by the viewer frame before angle selection.",
        "viewer_problem": "Defined by the viewer frame before angle selection.",
        "what_changes": "Defined by the viewer frame before angle selection.",
        "why_swipe": "Defined by the viewer frame before angle selection.",
        "why_save_comment_share": "Defined by the viewer frame before angle selection.",
        "plain_language_rule": "Translate abstract source phrases into ordinary viewer language.",
        "chosen_angle": "Defined after angle selection.",
        "source_summary": "Defined after source intake.",
        "media_references": "Official demos, screenshots, images, or video references will be listed here.",
        "constraints": "Defined during project brief.",
        "role": "Hook",
        "viewer_trigger": "Defined by viewer frame.",
        "headline": "Draft headline",
        "body": "Draft body",
        "visual_direction": "Draft visual direction",
        "motion_recommendation": "Static unless motion improves attention, retention, or understanding.",
        "output_type": "PNG or MP4",
        "revision_note": "Record user-requested revisions here.",
        "source_name": "Source name",
        "source_url": "Source URL",
        "source_type": "Article, docs, post, video, screenshot, or report",
        "source_importance": "Why this source matters.",
        "source_verification": "Freshness and credibility notes.",
        "media_name": "Media reference name",
        "media_url": "Media reference URL",
        "media_type": "Image, screenshot, video, or demo",
        "media_use_case": "How this media helps the carousel.",
        "media_attribution": "Attribution text.",
        "recommended_angle": "Recommended after source discovery.",
        "risk_notes": "Accuracy, rights, or context risks.",
        "card_number": "1",
        "reason": "Motion improves attention or understanding.",
        "source_media": "Screenshot, video clip, generated visual, or HTML-native animation.",
        "animation_concept": "Short reveal or transition.",
        "duration": "3s",
        "format": "MP4",
        "video_source": "Official or credible video source",
        "video_url": "Video URL",
        "usable_segment": "Timestamp or segment to reference.",
        "video_reason": "Why the video helps the viewer understand.",
        "video_attribution": "Attribution text.",
        "static_card_note": "Static cards render as PNG.",
    }

    write_if_missing(profile_dir / "profile.md", render(read_template("profile.md"), values))
    write_if_missing(profile_dir / "design.md", render(read_template("design.md"), values))
    write_if_missing(
        profile_dir / "channel.css",
        ":root {\n  --carousel-bg: #ffffff;\n  --carousel-fg: #111111;\n}\n",
    )

    write_if_missing(project_dir / "source.md", "# Source\n\nPaste or summarize the source material here.\n")
    write_if_missing(project_dir / "source-pack.md", render(read_template("source-pack.md"), values))
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
    write_if_missing(
        project_dir / "cards" / "card-01.html",
        "<!doctype html>\n"
        '<html lang="ko">\n'
        "<head>\n"
        '  <meta charset="utf-8">\n'
        f"  <title>{project} card 01</title>\n"
        '  <link rel="stylesheet" href="../style.css">\n'
        "</head>\n"
        "<body>\n"
        '  <article class="card card-01" data-output="png">\n'
        '    <p class="eyebrow">Viewer-first hook</p>\n'
        "    <h1>Draft headline</h1>\n"
        '    <p class="support">Draft support line</p>\n'
        "  </article>\n"
        "</body>\n"
        "</html>\n",
    )
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
