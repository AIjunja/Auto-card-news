# Scrapling Source Collection

Use Scrapling as a URL-level source-pack helper, not as a broad trend scanner.

## When To Use

- The user gives official docs, GitHub repos, product pages, announcements, articles, or landing pages.
- A carousel or reel needs real screenshots, media candidates, headings, and source snippets.
- `last30days` already found a topic and you need to read the best source URLs more deeply.

## When Not To Use

- Mass scraping, account-gated pages, private data, or sites that forbid automated access.
- Social posts where screenshots were user-provided and the underlying claim can be verified from official sources.
- Anything that needs anti-bot bypass. Ask for user-provided text, screenshots, or permission first.

## Command

```bash
python C:/Users/letgo/.codex/skills/auto-card-news/scripts/scrapling_source_pack.py \
  https://example.com/source \
  --limit-images 12 \
  --limit-links 15 \
  -o carousel-workspace/projects/<channel>/<project>/source-pack.md
```

## Output Review

After running the helper:

- Keep only high-signal claims and source URLs.
- Mark every image or video as `direct use`, `reference only`, or `recreate`.
- Rewrite extracted text into plain Korean before storyboard writing.
- Do not paste long source paragraphs into cards.
- Use media candidates as visual proof anchors, not decoration.

## Tool Pairing

- `last30days`: find current topics and what people are saying.
- `Scrapling`: read chosen URLs and collect source/media candidates.
- Browser screenshots or generated visuals: use when direct media is unavailable or unsafe.
