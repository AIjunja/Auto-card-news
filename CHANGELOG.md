# Changelog

## 0.2.1

- Updated one-line installers to install both `auto-card-news` and `last30days`.
- Updated Codex and manual install docs to include the `last30days` companion skill.
- Kept `last30days` as an external dependency fetched from https://github.com/mvanhorn/last30days-skill.

## 0.2.0

- Updated `auto-card-news` to use the external `last30days` skill for fresh source discovery.
- Documented the recommended `last30days` install flow from https://github.com/mvanhorn/last30days-skill.
- Kept this repository focused on the card-news production skill while delegating research to `last30days`.
- Added distribution tests for README, install scripts, and version metadata.

## 0.1.0

- Added the initial `auto-card-news` skill for channel-aware card-news/carousel creation.
