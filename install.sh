#!/usr/bin/env bash
set -euo pipefail

repo_url="https://github.com/AIjunja/Auto-card-news.git"
repo_zip="https://github.com/AIjunja/Auto-card-news/archive/refs/heads/master.zip"
tmp_root="$(mktemp -d)"
zip_path="$tmp_root/auto-card-news.zip"
extract_path="$tmp_root/repo"
clone_path="$tmp_root/clone"

codex_home="${CODEX_HOME:-$HOME/.codex}"
skills_dir="$codex_home/skills"
dest="$skills_dir/auto-card-news"

cleanup() {
  rm -rf "$tmp_root"
}
trap cleanup EXIT

mkdir -p "$extract_path" "$skills_dir"

if command -v git >/dev/null 2>&1; then
  git clone --depth 1 "$repo_url" "$clone_path" >/dev/null
  source_dir="$clone_path/skills/auto-card-news"
else
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$repo_zip" -o "$zip_path"
  elif command -v wget >/dev/null 2>&1; then
    wget -q "$repo_zip" -O "$zip_path"
  else
    echo "git, curl, or wget is required to download auto-card-news." >&2
    exit 1
  fi

  if command -v unzip >/dev/null 2>&1; then
    unzip -q "$zip_path" -d "$extract_path"
  else
    echo "unzip is required to install auto-card-news without git." >&2
    exit 1
  fi

  source_dir="$(find "$extract_path" -maxdepth 2 -type d -path '*/skills/auto-card-news' | head -n 1)"
fi

if [ -z "$source_dir" ] || [ ! -f "$source_dir/SKILL.md" ]; then
  echo "Could not find auto-card-news skill in downloaded repository." >&2
  exit 1
fi

rm -rf "$dest"
cp -R "$source_dir" "$dest"

echo "Installed auto-card-news to $dest"
echo "Restart Codex to pick up new skills."
