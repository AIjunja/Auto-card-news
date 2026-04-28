# Project Workflow

Use this reference when converting source material into a carousel project.

## Source Intake

Accepted inputs include URLs, reports, memos, drafts, pasted GPT conversations, screenshots, captions, and raw notes. Save the original material to `source.md`.

If the user has no source, asks for source discovery, or needs current AI information, use the installed `last30days` skill from https://github.com/mvanhorn/last30days-skill before writing carousel copy. Treat `last30days` as the fresh source discovery step, then convert its output into `source-pack.md` containing source candidates, source quality notes, freshness checks, and a recommended angle for `auto-card-news`.

When the source is a URL, fetch the accessible content. If access is blocked, ask the user to paste the relevant parts or provide screenshots. State the limitation clearly in `brief.md`.

## Source Summary

Summarize:

- Core message
- Main claims
- Useful facts or quotes
- Audience relevance
- Missing context
- Risky assumptions

## Angle Options

Always propose two or three angles, even when the user gives a direction. Keep each angle at medium depth:

- Angle name
- Hook example
- Who it works best for
- Expected 3-5 card flow

Let the user choose, reject, or combine angles. When the user already has a direction, treat it as the boundary for the options rather than something to ignore. For example, "PitchCheck attendance feature" can become problem-empathy, feature-demo, or manager-benefit angles.

## Copy Draft

After the angle is chosen, write full card copy in one pass. Number every card. This is first-pass copy approval, not final approval.

Good user edits should be easy to make by card number:

- "Make card 1 hook stronger."
- "Shorten card 3."
- "Make card 2 motion instead of static."
- "Make the CTA less salesy."

## Review Stages

Use these stages in order:

1. Copy review for message and flow
2. Text wireframe review for hierarchy
3. HTML/CSS preview review for actual layout
4. Final render approval for PNG and MP4

Do not render final assets before HTML/CSS preview approval.
