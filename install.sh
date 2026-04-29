#!/usr/bin/env bash
set -euo pipefail

auto_card_news_repo_url="https://github.com/AIjunja/Auto-card-news.git"
auto_card_news_repo_zip="https://github.com/AIjunja/Auto-card-news/archive/refs/heads/master.zip"
last30days_repo_url="https://github.com/mvanhorn/last30days-skill.git"
last30days_repo_zip="https://github.com/mvanhorn/last30days-skill/archive/refs/heads/main.zip"
last30days_skill_path="skills/last30days"

tmp_root="$(mktemp -d)"
auto_card_news_zip_path="$tmp_root/auto-card-news.zip"
last30days_zip_path="$tmp_root/last30days-skill.zip"
auto_card_news_extract_path="$tmp_root/auto-card-news-repo"
last30days_extract_path="$tmp_root/last30days-repo"
auto_card_news_clone_path="$tmp_root/auto-card-news"
last30days_clone_path="$tmp_root/last30days-skill"

codex_home="${CODEX_HOME:-$HOME/.codex}"
skills_dir="$codex_home/skills"

cleanup() {
  rm -rf "$tmp_root"
}
trap cleanup EXIT

download_file() {
  local url="$1"
  local output="$2"

  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$url" -o "$output"
  elif command -v wget >/dev/null 2>&1; then
    wget -q "$url" -O "$output"
  else
    echo "git, curl, or wget is required to download auto-card-news." >&2
    exit 1
  fi
}

extract_zip_root() {
  local zip_url="$1"
  local zip_path="$2"
  local extract_path="$3"

  download_file "$zip_url" "$zip_path"

  if command -v unzip >/dev/null 2>&1; then
    unzip -q "$zip_path" -d "$extract_path"
  else
    echo "unzip is required to install auto-card-news without git." >&2
    exit 1
  fi

  find "$extract_path" -mindepth 1 -maxdepth 1 -type d | head -n 1
}

install_skill() {
  local source_dir="$1"
  local skill_name="$2"
  local dest="$skills_dir/$skill_name"

  if [ -z "$source_dir" ] || [ ! -f "$source_dir/SKILL.md" ]; then
    echo "Could not find $skill_name skill in downloaded repository." >&2
    exit 1
  fi

  rm -rf "$dest"
  cp -R "$source_dir" "$dest"
  echo "Installed $skill_name to $dest"
}

mkdir -p "$auto_card_news_extract_path" "$last30days_extract_path" "$skills_dir"

if command -v git >/dev/null 2>&1; then
  git clone --depth 1 "$auto_card_news_repo_url" "$auto_card_news_clone_path" >/dev/null
  git clone --depth 1 "$last30days_repo_url" "$last30days_clone_path" >/dev/null

  auto_card_news_source_dir="$auto_card_news_clone_path/skills/auto-card-news"
  auto_motion_news_source_dir="$auto_card_news_clone_path/skills/auto-motion-news"
  last30days_source_dir="$last30days_clone_path/$last30days_skill_path"
else
  auto_card_news_repo_root="$(extract_zip_root "$auto_card_news_repo_zip" "$auto_card_news_zip_path" "$auto_card_news_extract_path")"
  last30days_repo_root="$(extract_zip_root "$last30days_repo_zip" "$last30days_zip_path" "$last30days_extract_path")"

  auto_card_news_source_dir="$auto_card_news_repo_root/skills/auto-card-news"
  auto_motion_news_source_dir="$auto_card_news_repo_root/skills/auto-motion-news"
  last30days_source_dir="$last30days_repo_root/$last30days_skill_path"
fi

install_skill "$auto_card_news_source_dir" "auto-card-news"
install_skill "$auto_motion_news_source_dir" "auto-motion-news"
install_skill "$last30days_source_dir" "last30days"

echo "Restart Codex to pick up new skills."
