import argparse
import shutil
from pathlib import Path


SKILL_DIR = Path(__file__).resolve().parents[1]
TEMPLATE_DIR = SKILL_DIR / "assets" / "templates"


PROJECT_FILES = [
    "script.md",
    "scene-plan.md",
    "source-pack.md",
    "motion-plan.md",
    "caption.md",
    "design.md",
]


def copy_template(template_name: str, destination: Path) -> None:
    source = TEMPLATE_DIR / template_name
    if not source.exists():
        raise FileNotFoundError(f"Missing template: {source}")
    shutil.copyfile(source, destination)


def scaffold(root: Path, channel: str, project: str) -> Path:
    workspace = root / "carousel-workspace"
    project_dir = workspace / "motion-projects" / channel / project
    project_dir.mkdir(parents=True, exist_ok=True)

    (project_dir / "assets").mkdir(exist_ok=True)
    (project_dir / "scenes").mkdir(exist_ok=True)
    (project_dir / "output").mkdir(exist_ok=True)

    source_file = project_dir / "source.md"
    if not source_file.exists():
        source_file.write_text(
            f"# {project} Source\n\n- Channel: {channel}\n- Input type:\n- Source URL or notes:\n",
            encoding="utf-8",
        )

    for filename in PROJECT_FILES:
        destination = project_dir / filename
        if not destination.exists():
            copy_template(filename, destination)

    return project_dir


def main() -> int:
    parser = argparse.ArgumentParser(description="Scaffold an auto-motion-news project.")
    parser.add_argument("--root", required=True, help="Workspace root.")
    parser.add_argument("--channel", required=True, help="Channel slug.")
    parser.add_argument("--project", required=True, help="Project slug.")
    args = parser.parse_args()

    project_dir = scaffold(Path(args.root).resolve(), args.channel, args.project)
    print(project_dir)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

