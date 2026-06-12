---
name: auto-card-news
description: Use when the user wants to create, design, preview, or render carousel/card-news content, especially channel-aware Instagram carousels with static cards, motion cards, HTML/CSS, PNG, or MP4.
---

# Auto Card News

Use this skill when the user wants to create a carousel, card-news post, Instagram carousel, mixed image/video carousel, or channel-specific content package.

## Operating Language

Ask and explain in Korean by default. Use another language only when the user requests it or the source material requires it.

## Core Rule

This is a conversation-driven production workflow, not a SaaS app. Do not upload to Instagram, Threads, YouTube, TikTok, or any social platform unless the user explicitly asks for publishing and the required official API credentials are already configured.

Default output is a ready-to-publish package. If upload credentials are missing, create a publish queue/checklist instead of pretending upload is available.

## Non-Negotiable AIjjuun Visual Standard

For AIjjuun-style AI/tool/news card-news, treat the approved `google-surf-mcp` visual as the baseline:

- Primary Korean display font: `Griun Mongtori` from `Griun_Mongtori-Rg.ttf`.
- Use the font for big hooks, body copy, CTA, chips, thumbnail text, and motion overlays.
- Never replace the main Korean font with Noto, system sans, Moneygraphy, or a thin font unless the user explicitly asks.
- If text looks like a PPT slide, blog paragraph, or translated explainer, rewrite before designing.
- If the first card is only a GitHub/code/docs screenshot, revise. The first card needs a hook-worthy visual: real demo, product UI, source proof crop, or GPT Image-generated core scene.
- Do not over-blur or black-and-white real source images. The viewer must understand what the image/video is within 1 second.
- Avoid decorative connector lines, weak graphs, and abstract diagrams unless they are the clearest way to explain the point.

## Required Layout QA

Before calling a carousel final:

1. Render all cards to PNG.
2. Create or inspect a contact sheet.
3. Also create or inspect an Instagram grid thumbnail crop sheet, usually a centered 1:1 crop from each 4:5 card. Many overlap problems only appear after Instagram crops the post in profile/grid previews.
4. Check for:
   - awkward Korean line breaks;
   - orphan words on a line;
   - number badges overlapping headlines;
   - text touching the brand, footer, source, or page number;
   - chips, labels, stickers, or badges visually colliding with the first line of the headline in full card or 1:1 crop previews;
   - Korean words splitting unnaturally across lines, such as a final particle or syllable being pushed alone;
   - repeated visuals with only different text;
   - heavy blur hiding the actual source visual.
5. If any card fails, edit the HTML/CSS and render again.

Do not report completion if the cards were not visually inspected after rendering.

## Reels Must Ship

For Instagram-first content, a static carousel alone is not enough unless the user explicitly opts out. Produce a Reel output or a documented blocker.

Default Reel structure:

- 0-2s: moving hook with a concrete use case or visual proof.
- 2-14s: simple explanation with typing, zoom, callout, checklist reveal, or source crop.
- 14-20s: comment/save/follow CTA.

The Reel must use the same font and visual language as the carousel.

## Reference Font Rule

The screenshot font the user approved is the default visual voice. Treat it as `Griun Mongtori` from `Griun_Mongtori-Rg.ttf`.

- Use `Griun Mongtori` for Korean hooks, big headlines, body copy, chips, CTA cards, thumbnail text, motion overlays, and Reels captions.
- Do not silently switch Korean social copy to Moneygraphy, system fonts, or thin sans fonts.
- Use monospace only for code, terminal, commands, and source UI where that is the point.
- After any font change, re-render and check line breaks, clipped glyphs, number badges, and Instagram thumbnail readability.

## Doblock Retention Standard

Use the 2M TikToker Doblock-style recommendation as a hard retention standard: stop the scroll first, explain second.

Hard fail and revise if:

- the first card starts with a plain GitHub/docs screenshot and a summary instead of a human hook;
- the card reads like a PPT slide, blog paragraph, or press release;
- code blocks, repo file lists, or abstract diagrams appear before the viewer understands why they matter;
- the carousel relies on amateur graph lines, connector arrows, or decorative charts that do not make the point clearer;
- the same screenshot appears repeatedly with only different text;
- the viewer must read a paragraph to understand the value.

Default fix:

- lead with a real use case, demo moment, before/after, surprising consequence, or visual proof;
- use actual source screenshots, official/demo video frames, product UI, creator demos, or HTML-native reconstructions;
- keep copy short enough to read while swiping;
- move detail to `caption.md` or `source.md`;
- make every card answer one of: "why care?", "what is it?", "how do I try it?", "what should I watch out for?"

## Viral Poster V2 Mode

Use this mode when the user asks for "2탄", "바이럴형", "맛집/팝업 레퍼런스 느낌", "도블락 느낌", "전단지형", or says the current card-news feels too calm, PPT-like, or unlike the uploaded viral references.

This is not the default clean AI news layout. It is a deliberate scroll-stopping poster style adapted from Korean restaurant, popup-store, and local event promo cards.

Core rules:

- Make the first card feel closer to a viral restaurant/event poster than a tech briefing.
- Use a real or generated hook visual as the full background, then place huge Korean type on top.
- Use thick layered typography: white outer stroke, black inner stroke, bright fill colors, and a hot-pink or yellow shadow.
- Prefer short emotional Korean phrases over explanations. The cover should be readable in 1 second.
- Use loud color accents such as hot pink, red, yellow, mint, and white. Do not make a quiet monochrome tech card.
- Use stickers, fireworks, arrows, badges, dots, price-tag shapes, speech bubbles, and ">> <<" style emphasis only when they help the hook.
- Keep body cards photo-first: one big real/demo/source image, one short headline, one practical takeaway.
- Avoid line charts, thin connector diagrams, muted gradients, and text-heavy panels unless the source itself requires them.
- Do not reuse the same screenshot on every card with only different text.
- Keep detail in `caption.md`, `source-pack.md`, or `storyboard.md`; keep cards snackable.

Hard fail and revise if:

- The result looks like the normal AIjjuun dark tech template with only louder colors.
- The cover could be mistaken for a GitHub repo screenshot thumbnail.
- The body cards look like presentation slides.
- Background media is blurred so heavily that viewers cannot tell what it shows.
- More than one line of body copy is needed to understand the card.
- The typography creates awkward orphan words, clipped Korean glyphs, or overlaps with page numbers and source text.

Read `references/viral-poster-v2-style.md` before producing this style.

## Reels-First Package Rule

For Instagram-first or Threads-first source packages, create both a carousel and a Reel plan/output by default unless the user explicitly says static-only.

The default story rhythm for both carousel and Reel is:

1. Hook: stop the scroll with a concrete viewer pain, surprise, or demo moment.
2. Explanation: show what it is and why it matters with short copy plus visual proof.
3. Engagement CTA: ask for save, comment, follow, or "댓글 남기면 링크/체크리스트" when appropriate.

For Reels, the default target is 15-20 seconds:

- 0-2s: moving hook with real/demo/source visual, not a static title.
- 2-14s: concise explanation with typed action, zoom, callout, side panel, before/after, or checklist reveal.
- 14-20s: comment/follow/save CTA.

If a final package has only static PNGs, document the user opt-out or production blocker in `motion-plan.md`.

## Publishing Automation Rule

Publishing automation is allowed only when the user explicitly requests it and local credentials are configured. Never ask the user to paste access tokens directly into chat.

Default publishing artifacts:

- `publish-queue.json`: platform, asset paths, caption path, source links, status, and intended publish time.
- `publish-checklist.md`: ratio, file size, duration, caption length, source links, rights notes, and platform readiness.
- `publish-log.md`: API result, post URL, errors, retries, and skipped reason.

Safe behavior:

- If Meta API credentials, app permissions, account IDs, or media hosting are missing, stop at `publish-queue.json` and tell the user what is missing.
- Instagram and Threads uploads must use official Meta APIs and the user's configured professional/business account access.
- Before actual upload, check file paths, aspect ratio, duration, caption, source links, and whether the user approved this exact final package.
- Do not post private drafts, local-only media URLs, unverified claims, or source screenshots with unclear rights.

## Caption Attribution Rule

When writing Instagram or social captions for external sources, use `Contents Editor · <channel/person>` for the channel's curation/editing credit. Do not use `Editor · ...` because that can imply the channel created the original tool, repo, video, or source.

Keep source attribution separate as `Source · <original owner/source>`.

Also include direct links that help viewers verify or use the source. If the post introduces a GitHub repo, tool, app, paper, official announcement, demo video, guide, or downloadable resource, add a plain CTA link line in the caption, such as:

`써보시려면 여기 GitHub 링크 참고해보세욤: <url>`

Prefer one or two high-signal links over a long source dump.

## Humanized Marketing Rule

Every carousel must pass a humanized marketing review before HTML/CSS preview and again before final caption approval. Use this as a quality gate, not an optional polish step.

- Remove AI-sounding filler, stiff summaries, and vague benefit words.
- Translate jargon into viewer language before it reaches the card.
- Check the hook, promise, proof, save/comment/share reason, and CTA.
- Run Korean Persona Copy QA with real `Nemotron-Personas-Korea` samples when the copy risks sounding translated, too global, too technical, or weak for Korean viewers.
- For product, app, campaign, launch, lead magnet, or PitchCheck promotion, activate ad/conversion mode and define the offer, audience, proof, objection, CTA, and destination.
- Keep channel personality, such as a friendly tutor voice for AIjjuun, but do not let cuteness weaken clarity or trust.

Read `references/humanized-marketing-copy.md` when drafting or revising copy, captions, CTAs, promotional angles, or any post that feels too PPT-like or AI-written.

Read `references/korean-persona-copy-qa.md` when the source is translated from English, the first hook feels generic, the topic is technical, or the user asks for more Korean-native copy. Use `scripts/sample_korean_personas.py` to sample real rows from `nvidia/Nemotron-Personas-Korea` before relying on imagined personas. If network or dependencies are unavailable, use cached samples first and only use a clearly labeled fallback panel when no real sample is available.

Read `references/ai-jjuun-production-playbook.md` for AIjjuun-style AI news/tool/GitHub/open-source content. Use it before source selection, storyboard writing, captioning, visual direction, or final QA.

Read `references/scrapling-source-collection.md` when a chosen source URL needs deeper extraction of headings, links, media candidates, screenshots, and source-pack material.

## Humanize-Korean QA Gate

Use the local `humanize-korean` skill as a required **QA layer**, not as a blind final writer, for Korean text that appears in a carousel package. This includes card headlines, body copy, chips, section labels, CTA cards, captions, motion-card overlays, thread mockups, checklist text, and any Korean text inside HTML-native visuals.

Run this gate before HTML/CSS preview and again after layout changes, because line breaks and card spacing can make otherwise-natural copy feel stiff.

Important: the goal is to remove AI-ish Korean while preserving the channel voice. Do not paste the `humanize-korean` output into cards if it becomes more formal, more generic, less funny, less direct, or unlike the user's established AIjjuun voice. In that case, reject the rewrite, keep the original intent, and manually fix only the specific awkward phrase.

For AIjjuun/default AI news:

- Preserve the friendly tutor voice: casual, cute when useful, sharp, and easy.
- Keep natural endings such as `~요`, occasional `~욤`, `이거 꽤 큽니다`, `먼저 이것만 보세요`, `써보려면 여기부터` when they fit.
- Do not convert social copy into blog/article/report style.
- Do not over-polish into corporate Korean.
- Do not add random cute endings to serious claims, but also do not strip warmth from normal tool/news posts.
- If the copy already sounds like a Korean creator talking to viewers, mark it as `no rewrite needed` or `minor fix only`.
- Keep the humanized report short and practical: what felt translated, what was fixed, and what was intentionally preserved.

Default process:

1. Collect all viewer-facing Korean copy into `humanize-input.md`.
2. Apply `humanize-korean` fast mode by default as a detector/rewrite suggestion layer. Use strict mode only when the copy is long, highly technical, translated from English, security/finance/legal-sensitive, or still sounds AI-written after one pass.
3. Save the results to `humanize-report.md` with before/after notes, unchanged factual terms, rejected suggestions, and any deliberate exceptions.
4. Preserve source facts, numbers, product names, repo names, dates, URLs, direct quotes, licenses, and pricing.
5. Rewrite only the rhythm, phrasing, order, and social-native wording.

Hard fail conditions:

- The hook sounds like a press release or generic AI news summary.
- The humanized rewrite sounds less like the channel than the original draft.
- The rewrite makes the copy more abstract, more formal, or harder for Korean viewers to understand.
- A card uses abstract benefit words without a concrete example, such as "productivity improvement", "workflow innovation", "experience benefit", or "utilization value".
- The Korean sounds translated from English: noun chains, passive voice, stiff connective rhythm, or awkward English-in-parentheses.
- The card would not be said naturally by a Korean creator/developer/marketer in a DM.
- The caption is useful but reads like a blog article instead of an Instagram/Threads caption.
- Cute AIjjuun tone hides the factual point or weakens trust.

Read `references/humanize-korean-card-qa.md` when drafting, revising, or final-checking carousel copy and captions.

## Korean Persona Copy QA

Use Korean Persona Copy QA as the default rewrite layer for Korean Instagram-first posts where audience fit matters.

- Build a 5-7 person reader panel from real `Nemotron-Personas-Korea` samples whenever practical.
- Do not quote sampled personas as real people; use them as synthetic reader testers.
- Ask what each sampled reader understands in 2 seconds, what feels translated, and what phrase would make the point feel closer to daily life.
- Rewrite hooks, card headlines, body copy, captions, and CTA until the meaning is clear to a non-expert Korean reader.
- Record the panel summary and rewrite notes in `storyboard.md`.
- If the dataset cannot be accessed, write why and use cached samples or a labeled fallback panel.

Sampler command:

```powershell
python skills\auto-card-news\scripts\sample_korean_personas.py --count 7 --topic "<topic>"
```

## Engagement-First Rule

Do not make PPT-like briefing slides. A carousel must start from the viewer's concrete situation, pain, desire, or curiosity. The source is supporting evidence, not the opening frame.

Before writing copy, define:

- Who will stop scrolling for this?
- What are they already frustrated by, curious about, or trying to do?
- What becomes easier, faster, clearer, or less annoying after knowing this?
- Why would they save, comment, share, or swipe to the next card?

If those answers are vague, fix the angle before designing.

## Link-To-Carousel Production Standard

When the user gives a GitHub repo, product page, official blog, article, X/Threads post, YouTube link, or a short note with a URL and asks for a card-news package, treat it as a full production request. Do not stop at summarizing the link. The expected output is a ready-to-review carousel project with researched source notes, distinct visual assets, short Korean copy, captions, and at least one motion idea or motion output when relevant.

### Default Research Pass

For every URL-based topic, build a small source pack before writing the storyboard:

- **Official baseline**: official docs, repo README, release notes, blog post, paper, pricing page, or product page.
- **Use-case proof**: demo page, screenshots, install commands, examples, issues, changelog, API docs, app screen, or benchmark pages.
- **Hype and field signal**: GitHub stars/forks/recent commits, Hacker News/GeekNews, Reddit, X, Threads, creator posts, Discord/community notes, or credible hands-on articles when available.
- **Reality check**: limitations, pricing, license, access limits, security concerns, setup friction, or whether a claim is only a social post claim.

For GitHub repositories, always try to collect:

- repo name, owner, URL, description, stars, forks, license, primary language, latest release or recent activity;
- README headline, install command, usage command, screenshots/assets, homepage/demo link;
- what problem the repo solves in plain Korean;
- who should care and what they can do with it today;
- one practical workflow example;
- one caveat or "before you try" note.

Do not rely only on official company blogs when the user's channel is trying to beat generic AI news accounts. Search for more minor but useful sources too: GitHub trending repos, niche open-source tools, issue threads, creator demos, GeekNews, Hacker News, Reddit, X/Threads screenshots provided by the user, and Korean/English hands-on posts. Official sources are for verification; the content angle should come from usefulness, surprise, and practical workflow.

### Source Verification Tone

Separate facts from interpretation:

- Use "confirmed" only for official pages, repo metadata, docs, or release notes.
- Use "reported", "claimed", or "community reaction" for social posts, Reddit, screenshots, or secondhand articles.
- If the user provides a screenshot from X/Threads, use it as a lead. Verify the underlying repo, docs, blog, or issue before making the final claim.
- If a source is blocked, unavailable, or cannot be verified, say so in `source-pack.md` and build the card around what can be verified.

### AIjjuun Default Editorial Lens

For the AIjjuun channel, the default positioning is not "AI news summary." It is a friendly tutor who finds useful, slightly niche AI tools and explains how a Korean viewer can actually use them.

Use this lens unless the user gives a different channel:

- viewer: developers, creators, marketers, students, founders, and AI-curious workers who want practical tools without reading long English docs;
- promise: "I found what is useful, checked the source, and translated it into a workflow you can try";
- tone: cute, casual, sharp, but not childish; easy Korean first, jargon second;
- avoid: "AIjjuun-style", stiff translation, press-release rhythm, generic AI hype, long paragraphs, and abstract phrases like "experience benefit" without examples.

For non-AIjjuun channels, keep the same production quality but adapt the lens to the channel profile.

### Carousel Structure Default

For URL-based AI/tool/developer topics, start with this 7-card pattern unless the source calls for a different structure:

1. **Hook cover**: one concrete viewer situation or surprising claim, supported by a real screenshot or strong generated/editorial visual.
2. **Problem**: the pain before the tool/news exists. Make the viewer feel "this is me."
3. **What it is**: explain the tool/news in one plain Korean sentence.
4. **How it works**: show a command, UI, workflow, graph, before/after, or short demo.
5. **Why use it**: practical use cases, not vague benefits.
6. **Caveat/checklist**: what to check before using, who it is not for, cost/license/security/setup note.
7. **CTA/save card**: what to try first, where to go, why to save, and the source link cue.

Each card must have one job and one visual job. If two cards use the same screenshot, each must crop, call out, zoom, or explain a different part of the source.

### Copy Density Standard

Write for a phone screen and a distracted viewer:

- Card headline: usually 1-3 lines.
- Body: usually 1-3 short lines.
- Avoid long paragraphs on cards. Put detailed context in the caption or `source.md`.
- If a sentence sounds translated, rewrite it into how a Korean creator/developer would say it in a DM.
- Prefer concrete phrasing: "레포 열고 멍해지는 사람" over "코드베이스 이해 효율을 개선합니다."
- Prefer "이걸로 뭘 할 수 있냐면" over "활용 가능성."
- Avoid opening with the wrong target. For a designer tool, target designers. For a dev repo, target devs or vibe coders.

### Required Visual And Motion Output

For URL-based carousel packages, the default is not text-only:

- Capture or download at least 3 distinct visual anchors when possible: cover/source page, proof/demo, practical example/checklist.
- Include at least one motion card or motion plan by default. Good defaults: typing a command, search query, side panel, source zoom, cursor highlight, graph reveal, checklist reveal, or before/after.
- Use official screenshots, GitHub assets, docs pages, product UI, live demo captures, or HTML-native reconstructions before generic abstract graphics.
- If the source has no good visuals, create a minimal HTML-native scene that explains the workflow instead of repeating the same screenshot.

### Output Package Checklist

Before telling the user the package is ready, check that the project includes:

- `source.md` with source summary and links;
- `source-pack.md` with official, community/hype, media, and verification notes when research was needed;
- `storyboard.md` with card copy plus visual job per card;
- `humanize-input.md` and `humanize-report.md` when Korean viewer-facing copy was drafted or revised;
- `caption.md` with short human caption, `Contents Editor`, and useful source links;
- `output/card-01.png` through the planned final card;
- `output/reel.mp4` or `output/reel-preview.mp4` for Instagram-first/Threads-first packages unless the user explicitly requested static-only;
- `reel-script.md` or `scene-plan.md` with Hook -> Explanation -> Engagement CTA beats;
- at least one MP4 or a documented motion blocker/user opt-out when the package is source-based;
- `publish-queue.json` and `publish-checklist.md` when the user wants recurring, assisted, or API-based publishing;
- rendered visual QA: no tiny text, no orphaned Korean word, no repeated meaningless screenshot, no broken font.
- layout relationship QA: number badges must not touch or overlap headlines, brand/logo safe zones must stay clear, top visuals should be large enough to explain the card at a glance, and source/footer text must not collide with body copy.

## Line Break QA

Treat line breaks as part of the copy, not decoration. Do not leave an orphaned word, particle, or short ending alone on its own line unless the card is intentionally designed around that emphasis.

- Keep meaning chunks together: `AI 따로 쓰는 분들`, not `AI 따로 쓰는 / 분들`.
- Add manual `<br>` only after deciding the spoken phrase grouping.
- When a font changes, render again and re-check all headings because glyph width can change the line breaks.

## Media Bottom Labels

For cards with a large screenshot, demo video, or tool UI plus small label chips, place the chips in the lower safe zone of the media frame, over the dark gradient area near the bottom. Do not cover the main subject, cursor, UI state, or proof area with label chips.

- Keep the category badge such as `Blender 예시` or `Adobe 예시` near the copy block if that card uses it as the section label.
- Put supporting chips such as `장면 확인`, `스크립트 생성`, `반복 수정`, `사진 보정`, or `SNS 이미지` near the media-frame bottom.
- Use this as the default for similar media-led cards unless the visual needs a different callout position.

## Spacing Relationship QA

Do not copy a saved position blindly. After applying a reusable layout rule, check the spacing relationship between chips, section badges, and the first headline line.

- If chips feel crowded against a section badge such as `Adobe 예시` or `Blender 예시`, move the chips slightly within the media gradient or move the badge into the copy block.
- If the headline is tall or three lines, leave more breathing room between the badge and chips.
- Prefer a visually balanced relationship over identical pixel positions across different cards.

## Instagram Typography Baseline

Design for phone readability after Instagram upload, not desktop preview comfort. For the default 4:5 output size (`1080x1350`), start with this larger typography scale and only reduce it when the rendered card proves it still reads clearly on mobile.

- Default Korean headline and main body font: `Griun Mongtori` from `Griun_Mongtori-Rg.ttf`.
- Use `Moneygraphy Rounded` only as a fallback, for small UI labels, or when the user explicitly asks for a different visual voice.
- For AIjjuun-style and default card-news output, headline, hook, body copy, thread mockup copy, checklist copy, and HTML-native visual text should use `Griun Mongtori`.
- Keep code, command, and tool names in a monospace font such as `Consolas` only when they are intentionally shown as code.
- When copying an older project or script, check that the generated CSS does not set `html, body`, `.title`, `.body`, `.cover-title`, or motion-card text to `Moneygraphy Rounded` as the primary font.

Default CSS pattern:

```css
@font-face {
  font-family: "Griun Mongtori";
  src: url("../assets/fonts/Griun_Mongtori-Rg.ttf") format("truetype");
  font-weight: 400;
}

@font-face {
  font-family: "Moneygraphy Rounded";
  src: url("../assets/fonts/Moneygraphy-Rounded.woff2") format("woff2");
  font-weight: 700;
}

body {
  font-family: "Moneygraphy Rounded", system-ui, sans-serif;
}

.cover-title,
.cover-sub,
.title,
.body,
.thread-text,
.checklist,
.visual-copy {
  font-family: "Griun Mongtori", "Moneygraphy Rounded", system-ui, sans-serif;
  font-weight: 400;
  letter-spacing: 0;
}
```

- Cover or hook headline: `88-104px`, line-height `1.02-1.08`.
- Normal card headline: `76-94px`, line-height `1.04-1.12`.
- Support copy: `34-42px`, line-height `1.28-1.38`.
- Prompt/code/example text that must be read: `32-38px`.
- Chips, badges, and labels: `28-34px`.
- Page numbers and source text: page `26-30px`, source `22-24px`.

Do not use small body text as the main message. Anything under `30px` should be metadata, attribution, or decorative UI only.

When using chunky Korean display fonts such as Griun Mongtori or Moneygraphy-style rounded fonts, check the rendered line breaks after increasing size. Larger is usually better for Instagram, but it must not create orphaned words, clipped text, or chip overlap.

## Static And Motion Typography Consistency

Static PNG cards and motion MP4 cards in the same carousel must feel like one design system. Before rendering a motion card, compare its CSS against the approved static card CSS or `design.md`.

- Use the same primary font file, `font-family`, weight, size scale, line-height, and letter spacing unless the storyboard explicitly calls for a different voice.
- If a motion card replaces a PNG card in the carousel, copy the matching static card's headline, body, chip, page, brand, and source typography rules first, then add animation.
- After any font change, render a still frame from the MP4 and compare it with the PNG card before final export.

## Editorial Visual Cover Rule

For the first card of news, tool, launch, or trend carousels, consider an editorial cover before using a plain graphic layout. A strong cover can use a full-bleed photo, generated visual, official screenshot, product UI, or demo frame as the main background, with the text anchored over a dark bottom gradient.

### Use-Case-First Cover Rule

For tool, GitHub repo, MCP, developer, workflow, AI automation, prompt, or productivity topics, the first card must sell the **use case**, not merely show the source page.

Before choosing the cover visual, identify the most concrete viewer action:

- What file, screen, prompt, repo, API, dashboard, or workflow will the viewer touch?
- What annoying before-state does the tool remove?
- What output does the viewer get after using it?

Then make Card 01 show that action as clearly as possible. Good cover visuals include:

- before/after workflow scene, e.g. messy PDF/Excel/YouTube source → Markdown → AI answer;
- real product UI or docs screenshot with a callout on the exact feature being discussed;
- terminal command or side-panel action paired with the resulting output;
- official demo frame or recreated HTML-native demo when direct media is unavailable.

Do not use a generic GitHub repo screenshot as the cover when a practical use-case visual can be built. GitHub/repo screenshots are better as proof cards unless the repo page itself is the news.

Use this cover pattern when the topic needs a fast stop-scroll signal:

- Full-bleed visual fills the card and carries the topic mood.
- Top or center brand mark stays small and clean.
- Category pill sits above the headline, e.g. `AI NEWS | PROMPT`.
- Main headline is very large, usually `88-104px`, and placed in the lower third.
- A black gradient or dim overlay protects text readability.
- Source attribution remains small but readable near the bottom.

### Visual Clarity Hard Rule

Overlay treatment must never hide the main subject. Do not use heavy Gaussian blur, excessive dimming, or low-contrast overlays that make the viewer unable to recognize the photo, product UI, screenshot, or demo frame.

### Original Media Fidelity Rule

When a public source image, official screenshot, product UI, demo frame, video still, or user-provided image is used as evidence, preserve the original visual information by default.

Default media treatment:

- keep original color, contrast, and recognizability;
- do not grayscale, monochrome-tint, heavily desaturate, over-darken, or over-blur source media;
- do not turn a readable screenshot into a background texture;
- crop, zoom, call out, mask, or place text beside/under the media before applying destructive filters;
- protect text with a local bottom gradient, local dim rectangle, text shadow, or small backdrop behind the copy, not a global filter over the whole image;
- if a mood treatment is intentionally used, document it in `design.md` or `storyboard.md` and make sure the original subject still reads in 1 second.

Hard fail and revise if the user says or could reasonably say: "원본 이미지 그냥 그대로 박으면 되는데 왜 색을 죽였어?", "이거 뭔 사진인지 안 보여", or "블러가 너무 세서 근거가 안 보여."

### Source-Led Color Rule

Do not invent a strong global color theme that fights the source image. Let the source media carry the color mood.

- Use neutral black/white/dark editorial surfaces plus one or two accent colors sampled from the source, product brand, or channel design system.
- Do not wash every card into the same teal, purple, grayscale, or monochrome look unless the user explicitly chose that direction.
- If the original screenshot is colorful, keep it colorful.
- If the official page is already dark, do not add another heavy dark overlay that makes it look like a black-and-white texture.
- Record project palette choices in `design.md` when the palette changes from the channel default.

Hard fail and revise if:

- the user cannot tell what the background image is within 1 second;
- the screenshot is only decorative and the important UI/detail is unreadable;
- the same source page appears as a dark texture behind text instead of proof;
- a practical example could be shown, but the card only shows a vague background.

Use blur only when it is the design concept or when the image is intentionally abstract. For news/tool/source proof cards, prefer readable crops, callout boxes, zoomed regions, dark bottom gradients, and local dim layers behind text instead of global blur.

Do not copy another creator's cover image as the final asset. Use user-provided examples as composition references, then use safe media: official screenshots, generated visuals, licensed media, or recreated HTML-native scenes.

This rule is channel-agnostic. Apply it beyond AIjjuun whenever the first card needs stronger feed impact:

- AI/news/tool channels: official UI screenshot, generated 3D object, product mockup, docs page, demo frame.
- Football channels: stadium photo, match moment, tactics board, player silhouette, app screen, fixture graphic.
- PitchCheck/app marketing: phone mockup, field/check-in scene, user workflow screenshot, before/after attendance state.
- General education or info channels: symbolic photo, generated editorial scene, diagram-as-background, creator-style thumbnail visual.

If the first card looks like a PPT title slide, redesign it as an editorial visual cover before final export unless the user explicitly wants a minimal text-only style.

When planning the storyboard, mark Card 01 as one of:

- `Editorial visual cover`
- `Motion hook cover`
- `Minimal text cover`

Default to `Editorial visual cover` or `Motion hook cover` for Instagram-first content.

## Media-Led Body Cards

Do not make only the first card visual. For cards after the cover, prefer a media-led editorial layout whenever there is useful visual proof, source material, screenshot, demo frame, generated scene, or simple diagram available.

Recommended body-card structure:

- Top half: large framed image, screenshot, video frame, UI mockup, generated visual, or HTML-native scene.
- Bottom half: black or dark copy area with a large card number, one clear headline, and 2-4 short lines of explanation.
- Keep the image or video large enough to explain the point before the viewer reads the text.
- Use the copy to translate the visual into plain language, not to repeat a long article summary.
- End with a small channel/source mark, not a large decorative footer.

AI Trend-style article cards are a default fallback for news/tool/explainer body cards:

- Use the upper `45-55%` of the card for the screenshot, demo frame, product UI, generated visual, or visual reconstruction.
- Use the lower area as a dark editorial text block with a visible card number, a big headline, and only the essential context.
- Prefer one strong visual plus one plain-language takeaway over several small decorative elements.
- If the source has a demo video, use a still frame or short motion crop for the relevant card.
- If safe direct media is unavailable, recreate the idea with HTML-native UI, prompt cards, code panels, checklists, or generated editorial visuals.

For Instagram-first carousels, cards 2-7 should usually alternate between proof image + explanation, before/after visual + takeaway, screenshot/callout + simple interpretation, checklist/diagram + save-worthy use, and motion/demo clip + one sentence result.

If a card looks like a dense slide, replace some text with a visual or split the idea into another card.

## HERMES Editorial Pattern

Use this as the default high-quality pattern for AI/news/tool/security/developer carousels unless the user asks for another style. This pattern was validated by the HERMES/Claude Code issue carousel.

- Card 01: full-bleed or near-full-bleed real source screenshot, product UI, official page, or strong generated editorial visual. Put a large human hook in the lower third over a black gradient, while preserving the original media color and recognizability.
- Cards 02-07: use an AI Trend-style editorial layout: upper `45-55%` = one strong visual/proof area; lower area = large card number, one big headline, and only the shortest useful explanation.
- Every card needs a different job. Do not repeat the same image with slightly different text for several cards. Rotate between proof screenshot, terminal/demo, before-after comparison, diagram, checklist, and source page.
- Prefer one large visual over many small ornaments. The viewer should understand the card faster from the visual than from the paragraph.
- Keep the copy concrete and spoken. Say "커밋 메시지에 이 문자가 있으면 요금 경로가 바뀌었다는 보고예요" instead of abstract phrases like "메타데이터 라우팅 이슈입니다."
- For developer/tool topics, terminal typing, side panel typing, diff reveal, issue page highlight, billing meter, checklist reveal, and cursor/callout motion are strong defaults.
- Motion should usually replace or enhance one important card, not every card. Pick the card where movement makes the explanation clearer or increases retention.
- Before final render, compare the motion preview with static PNGs and match the font, size scale, chip style, black background, and label placement.
- If a visual is generated as SVG, canvas, screenshot-style UI, or HTML-native mockup, use the same approved card font inside that visual too. A different internal font can make the whole carousel feel inconsistent even when the main headline CSS is correct.
- Rewrite translated source language into Korean social copy. Prefer "목표 하나 던지면 끝까지 물고 간다고?" or "커밋 한 줄 때문에 토큰 폭탄 맞았다고?" over direct translations like "persistent workflows were introduced."

Quality smell checks:

- If three cards could swap their images without changing meaning, the storyboard is too generic.
- If the card still works after deleting the visual, the visual is too decorative.
- If the body paragraph explains what the screenshot should have explained, strengthen the visual or simplify the claim.
- If the output feels like a product deck or PPT, rebuild it with the HERMES pattern.

## Default Source Media Requirement

For AI/news/tool/product/developer carousels, outside media is not an optional polish step. Treat useful public source visuals as a default production input.

- Before the first serious render, create or update `source-pack.md` and `assets/web/`.
- Capture at least one real source screenshot per topic when a public source URL exists: official docs, GitHub repo, product page, app store page, changelog, issue, pricing page, article, or demo page.
- Save browser captures as `assets/web/page.png` and direct-safe representative media as `assets/web/media` when available.
- If direct media cannot be downloaded safely, use `assets/web/page.png` as the visual fallback rather than leaving a generic graphic.
- Use captured screenshots and official media in their original color by default. Do not grayscale, monochrome-tint, or globally blur them unless the user explicitly asks for that art direction.
- Do not use the same captured image as the main visual for several cards unless each crop/callout highlights a different part of the source.
- Mark each card's visual as one of: `real screenshot`, `official media`, `demo frame`, `HTML-native reconstruction`, `generated editorial visual`, or `reference-only`.
- A final carousel should normally include at least three distinct visual jobs: cover proof, source/product proof, practical example/demo, checklist/summary, or before/after.

QA failure conditions:

- No `assets/web/page.png` or equivalent real/source visual for a public source topic.
- Cards 2-6 reuse nearly the same screenshot without new crop, zoom, callout, or explanatory purpose.
- The carousel could be understood just as well with all visuals removed.
- The user has to ask "사진 가져와줘" after giving a URL or source-based topic.

## Default Motion Requirement

For Instagram-first carousels, motion is a default retention layer, not a bonus add-on.

- Decide at least one motion card or short Reel for every source-based package unless the user explicitly asks for static-only.
- Motion must show an example, proof, or action: typing a prompt/command, zooming into a source page, highlighting a pricing row, revealing a checklist, moving a cursor, showing a before/after, or animating a workflow.
- Avoid simple slideshow exports where only text fades in and out.
- If no real demo video is safe to use, create HTML-native motion from the actual source screenshot: zoom, crop, callout, typed command, side panel, scan line, or checklist reveal.
- Match the static card font and style, especially `Griun Mongtori` for Korean headline/body text.

QA failure conditions:

- The MP4 is only a sequence of static cards with no meaningful movement.
- The motion does not help the viewer understand the example faster.
- The user has to ask "모션 넣어줘" after requesting a Reel or motion card.

## Required Workflow

1. **Confirm channel context**
   - Ask whether to use an existing channel profile or create a new one.
   - Reconfirm the active channel before working on the source.
   - Keep AI information, football information, and PitchCheck marketing contexts separated.

2. **Create or update the channel profile**
   - If no profile exists, collect the six profile fields one focused question at a time.
   - If the channel already exists, ask for the channel link and recommend at least three representative posts.
   - If posts are unavailable, create a tone-and-direction profile without making strong visual claims.
   - Read `references/channel-profiles.md` when creating or updating profiles.
   - For AIjjuun, read `references/ai-jjuun-production-playbook.md` so the source angle, copy, visual proof, caption, and AX-consulting bridge stay consistent.

3. **Intake source material**
   - Accept URLs, reports, memos, drafts, pasted GPT conversations, screenshots, captions, or raw notes.
   - If the user has no source, asks for source discovery, or needs current AI information, use the installed `last30days` skill first: https://github.com/mvanhorn/last30days-skill
   - Ask `last30days` for fresh source discovery, then convert its research output into `source-pack.md` with source candidates, verification notes, and recommended angles.
   - If a URL is blocked or incomplete, ask the user to paste the relevant text or provide screenshots.
   - Save source material to `source.md` in the project.

4. **Define the viewer frame**
   - Write a short audience-first frame before proposing angles.
   - Translate abstract claims into plain Korean. Example: "tool integration" becomes "내가 쓰는 프로그램 안에서 바로 시킬 수 있음."
   - Reject hooks aimed at the wrong audience. Example: if the content is for designers, do not open with a generic "AI 답변 복붙하던 사람들."
   - Save the frame in `brief.md`.

5. **Build a Korean reader panel when copy risk is high**
   - If the topic comes from English source material, AI docs, GitHub, technical news, or global product copy, run Korean Persona Copy QA before finalizing angles.
   - Use `scripts/sample_korean_personas.py` to sample real `Nemotron-Personas-Korea` rows when network and dependencies are available.
   - Save the sampled panel, translation-smell notes, and rewrite decisions in `storyboard.md`.
   - If the sampler cannot run, record the reason and use cached samples before using an imagined fallback panel.

6. **Search media references**
   - For tool, app, product, sports, or visual topics, search for images, screenshots, official demos, product pages, and video references before finalizing the storyboard. Do this aggressively enough that the final carousel does not feel text-only.
   - For source URLs and public product/docs/GitHub pages, capture real browser screenshots into `assets/web/page.png` before final render. Use `scrapling-source-research` or a browser capture script when appropriate.
   - Read `references/scrapling-source-collection.md` when using Scrapling or a URL extraction helper so extracted source text becomes source-pack evidence, not pasted card paragraphs.
   - Download or save one representative safe media candidate as `assets/web/media`; if unavailable, copy or crop the real page capture as fallback.
   - Prefer official demos, official product pages, GitHub issues/releases, docs pages, credible creator walkthroughs, and source videos when motion or product understanding matters.
   - For news/tool topics, aim to gather at least 3-5 usable visual candidates before designing: cover candidate, proof screenshot, motion/demo candidate, context page, and checklist/source candidate.
   - Do a per-card media pass, not only a cover search: for each card, try to find or create one visual anchor such as an official screenshot, demo frame, source page, product UI, user-provided file, generated editorial visual, or HTML-native reconstruction.
   - Record media source, URL, usage idea, rights/attribution notes, and whether it is for direct use or reference-only in `source-pack.md`.
   - For first-card covers, look for a strong full-bleed visual candidate or plan a generated/editorial visual before settling for a plain text card.
   - For body cards, also look for per-card visual proof or plan HTML-native media panels. Do not stop media planning after the cover.
   - If the user provides social screenshots, use them as leads or reference unless they explicitly approve direct reuse. Verify the underlying source with official pages, GitHub, docs, blogs, articles, or credible primary material when possible.
   - If no safe media is available, create HTML-native visuals, generated visuals, or screenshot-style recreations instead of using generic decoration.

7. **Propose carousel angles**
   - Summarize the source only after the viewer frame is clear.
   - Propose two or three angles even when the user gives a direction.
   - Each angle includes an angle name, target situation, hook example, why people keep swiping, and expected 5-8 card flow.
   - Prefer hooks that name the viewer or situation: "포토샵 켜놓고 AI 따로 쓰던 분들, 이거 꽤 큽니다."
   - For each angle, state what the first-card cover visual should be, not just the hook copy.

8. **Draft copy and storyboard**
   - After the user chooses or combines angles, write the full card copy draft in one pass.
   - Number every card.
   - Keep each card to one clear job: stop, identify, explain, prove, make useful, interpret, or prompt action.
   - For every card, write both the text copy and the visual/media idea. Body cards need a visual plan, not only a headline and paragraph.
   - Apply the HERMES Editorial Pattern for AI/news/tool/developer topics by default: each card must have a visual job and a copy job.
   - Use human, plain-language copy. Avoid vague phrases such as "체감 이득" unless immediately rewritten as "뭐가 덜 귀찮아지는지 / 뭐가 빨라지는지 / 뭐가 쉬워지는지."
   - Use channel viewpoint labels such as `<채널명> 관점` or `<채널명> 해석`. Avoid awkward labels like `<채널명>식 해석` unless the user prefers it.
   - Run the Humanizer and Marketing checks from `references/humanized-marketing-copy.md` before asking for copy approval.
   - Run the required Humanize-Korean gate from `references/humanize-korean-card-qa.md` before copy approval. Save `humanize-input.md` and `humanize-report.md`.
   - Run Korean Persona Copy QA from `references/korean-persona-copy-qa.md` before copy approval when the copy risks sounding translated or too abstract for Korean readers.
   - If the post is promotional, run ad/conversion mode before writing the CTA.
   - Treat this as first-pass approval, not final approval.
   - Create a text wireframe before HTML/CSS.

9. **Evaluate static vs motion by card and Reel**
   - For each card, decide whether static PNG or motion MP4 is more effective.
   - For every Instagram-first or Threads-first source package, produce a short Reel plan/output by default unless the user explicitly opts out. The Reel must follow Hook -> Explanation -> Engagement CTA.
   - For every source package, plan at least one meaningful motion output by default. The plan must include typing, zoom/crop, callout highlight, checklist reveal, cursor/tap pulse, before/after movement, or real demo footage.
   - Prefer motion when a first-card hook, product demo, before/after, timeline, or workflow will increase retention.
   - Use searched video references, official demos, screenshots, or HTML-native animation as the motion source.
   - For HTML/CSS-native card motion, prefer HyperFrames first because it matches the per-card HTML workflow and is easier to revise for copy, layout, typing, side-panel, chip, and UI callout motion.
   - Use Remotion as the backup or primary engine for complex timelines, React-heavy templates, audio, video compositing, advanced media control, or when HyperFrames cannot render reliably.
   - Record the chosen motion engine per card in `motion-plan.md`, including the reason for choosing HyperFrames, Remotion, or static PNG.
   - Explain motion recommendations briefly.
   - Ask for approval before creating motion output.
   - Read `references/rendering-and-motion.md` for decision rules.

10. **Create preview before final export**
   - Build one HTML file per card, plus an index preview when useful.
   - Review content, layout, spacing, rhythm, visual proof, and design with the user.
   - If using external images or video references, make them large enough to carry the card and protect text readability with local dimming, text backdrops, and gradient transitions. Do not globally blur, grayscale, or over-darken the source media.
   - For first-card editorial covers, check that the image reads immediately and the headline remains dominant over the visual.
   - For body cards, check that the visual explains the card before the paragraph does. If the viewer must read a long paragraph to understand the card, simplify the copy or strengthen the visual.
   - For media-led cards, place small label chips in the lower safe zone instead of over the important visual proof.
   - Apply the Instagram Typography Baseline before the first serious preview. If the preview looks fine on desktop but small on a phone-like viewport, increase font size before rendering final files.
   - Check spacing between chips, section badges, and headline; adjust per card instead of forcing one saved position everywhere.
   - Run line-break QA on rendered previews: no awkward wraps, no lonely short words, no clipped text, and no heading that reads unlike natural speech.
   - Run the humanized marketing review again after layout changes because a line that worked in text may sound stiff or cramped once placed on the card.
   - Re-run the Humanize-Korean gate after layout changes if manual line breaks, shortened labels, or motion overlays changed the wording.
   - Run the PPT smell check from `references/project-workflow.md` before final render.
   - Run the source-media QA and motion QA from this skill before final render. If real source media or meaningful motion is missing for a source-based topic, revise before telling the user it is final.
   - Render final files only after approval.

11. **Render final assets**
   - Static cards default to PNG.
   - Motion cards default to MP4.
   - Instagram-first/Threads-first packages default to both `output/card-01.png`... and `output/reel.mp4` or a clearly labeled Reel preview.
   - Motion-card engine default: HyperFrames for short HTML/CSS/GSAP card animations; Remotion for complex video work or as a reliable fallback.
   - JPEG and PDF are optional and only generated when requested.

12. **Prepare publishing**
   - Create or update `publish-queue.json` and `publish-checklist.md` when the user wants upload automation, recurring production, or cross-posting.
   - If official Meta API credentials are configured and the user explicitly approved upload, run the upload workflow and write `publish-log.md`.
   - If credentials are not configured, keep the assets ready and tell the user which account/API/token/media-hosting requirement is missing.

## Ratio Defaults

Use the active channel profile's default ratio when available. If absent, recommend Instagram 4:5. Also support 1:1, 9:16, and custom pixel sizes when requested.

## Artifact Structure

Use this structure for projects unless the user requests another location:

```text
carousel-workspace/
  profiles/<channel-slug>/
    profile.md
    design.md
    channel.css
  projects/<channel-slug>/<date-topic-slug>/
    source.md
    source-pack.md
    brief.md
    storyboard.md
    motion-plan.md
    index.html
    style.css
    cards/
    output/
```

Use `scripts/init_project.py` to scaffold this structure when helpful.

## References

- Read `references/channel-profiles.md` when creating, analyzing, or updating a channel profile.
- Read `references/ai-jjuun-production-playbook.md` when producing AIjjuun AI news, GitHub/open-source picks, tool explainers, source curation, or AX-consulting bridge content.
- Read `references/scrapling-source-collection.md` when a selected URL needs deeper source-pack extraction, media candidate review, or URL-level evidence collection.
- Read `references/project-workflow.md` when turning source material into viewer frames, angles, copy, and storyboard.
- Read `references/humanized-marketing-copy.md` when polishing card copy, captions, CTAs, ad/conversion angles, or AI-sounding drafts.
- Read `references/humanize-korean-card-qa.md` when using `humanize-korean` to remove translationese, AI-ish rhythm, stiff captions, awkward line-break wording, or abstract benefit language from carousel copy.
- Read `references/korean-persona-copy-qa.md` when testing Korean hooks, translated source copy, captions, or CTA against real `Nemotron-Personas-Korea` samples.
- Read `references/design-and-references.md` before writing `design.md`, `channel.css`, or card layouts.
- Read `references/rendering-and-motion.md` before deciding PNG vs MP4 or producing final exports.
- Read `references/publishing-automation.md` before creating publish queues, upload scripts, Meta API upload flows, or cross-post automation.
- Use `last30days` when fresh source discovery is needed before carousel production.

## Completion Criteria

A carousel project is complete only when:

- The active channel is explicit.
- Source, viewer frame, brief, storyboard, and motion plan are saved when applicable.
- Each card has a clear viewer reason to swipe, save, comment, or share.
- Copy, caption, and CTA pass the Humanizer, Marketing, and ad/conversion checks when applicable.
- Korean card copy, motion overlays, and caption pass the Humanize-Korean gate; `humanize-report.md` records what was changed or intentionally preserved.
- Korean Persona Copy QA is recorded when the topic is technical, translated, or at risk of sounding unlike Korean social copy.
- HTML/CSS preview has been reviewed.
- Rendered previews pass line-break QA with no orphaned words or awkward phrase splits.
- Main text follows the Instagram Typography Baseline and remains readable after phone-size review.
- Static PNG cards and motion MP4 cards share the same approved typography system unless a deliberate exception is documented in `design.md` or `motion-plan.md`.
- Card 01 has an explicit cover decision, and Instagram-first posts avoid PPT-like title covers unless intentionally chosen.
- Body cards have explicit visual/media direction and avoid dense PPT-like paragraph slides.
- Final output files match the approved card-level export plan.
- Instagram-first/Threads-first packages include a Reel output or a documented static-only opt-out/blocker.
- The user has a mixed output package such as `card-01.png`, `card-02.mp4`, `card-03.png`, plus `reel.mp4` when applicable.
- Upload automation, if requested, has either produced `publish-log.md` or stopped safely at `publish-queue.json` with missing requirements listed.
