---
name: auto-motion-news
description: Use when the user wants to turn a script, card-news project, source link, notes, screen recording, voice recording, or raw footage into a short-form motion video, especially Reels, Shorts, MP4, scene plans, captions, or visual reference research.
---

# Auto Motion News

Use this skill when the user wants to create a short-form video from a script, an existing card-news project, pasted card copy, a source URL, a report, or raw notes.

## Operating Language

Ask and explain in Korean by default. Use another language only when the user requests it or the source material requires it.

## Core Rule

This is a conversation-driven video production workflow. Do not upload to YouTube, Instagram, TikTok, Threads, or any social platform unless the user explicitly asks for publishing and the required official API credentials are already configured.

Default output is a ready-to-publish Reel/Shorts package. If upload credentials are missing, create a publish queue/checklist instead of pretending upload is available.

## Non-Negotiable AIjjuun Reel Standard

For AIjjuun-style AI/tool/news Reels, match the approved card-news look:

- Primary Korean overlay font: `Griun Mongtori` from `Griun_Mongtori-Rg.ttf`.
- Never switch Korean hook overlays to Noto, system sans, or thin fonts without explicit user approval.
- The first 0-2 seconds must move and hook: real demo, product UI, source crop, typed command, generated core scene, or before/after.
- Do not start with a static GitHub/docs screenshot plus a summary.
- Avoid heavy Gaussian blur, grayscale filtering, and generic dark backgrounds that hide the source.
- Do not deliver a simple slideshow of card PNGs as the final motion output.
- Use at least three motion jobs: typing, zoom/crop, checklist reveal, callout, cursor/tap pulse, before/after, or proof highlight.

## Required Reel QA

Before calling a Reel final:

1. Render the MP4.
2. Extract still frames from the first hook, middle explanation, and final CTA.
3. Check:
   - font matches the carousel;
   - main text avoids Instagram profile/caption and right-side action UI;
   - no key message is too low or too far right;
   - source visual is recognizable;
   - the first 2 seconds are not static;
   - CTA is readable in one glance.
4. If any frame fails, revise and render again.

## Reference Font Rule

The screenshot font the user approved is the default visual voice. Treat it as `Griun Mongtori` from `Griun_Mongtori-Rg.ttf`.

- Use `Griun Mongtori` for Korean hook overlays, scene titles, callouts, CTA text, thumbnail text, and motion-card copy.
- Match the card-news typography exactly when converting a carousel into a Reel.
- Do not silently switch Korean overlays to Moneygraphy, system fonts, or thin sans fonts.
- Use monospace only for code, terminal, commands, and source UI where that is the point.
- After rendering, inspect a still frame and compare it against the approved card style before calling the MP4 final.

## Doblock Retention Reel Standard

Use the 2M TikToker Doblock-style recommendation as a hard retention standard: stop the scroll first, explain second, ask for action last.

Default Reel structure:

1. **Hook**: 0-2 seconds. Show a real use case, demo moment, before/after, surprising consequence, or source proof in motion.
2. **Explanation**: 2-14 seconds. Explain only what the viewer needs to understand, with source screenshots, UI zooms, typed examples, callouts, or checklist reveals.
3. **Engagement CTA**: 14-20 seconds. Ask for save, follow, comment, link request, or "이거 써볼 사람?" depending on the topic.

Hard fail and revise if:

- the first 0-2 seconds are a static title card or a blurred generic background;
- the video is just card PNGs fading in and out;
- there is no practical example, typed action, demo crop, source zoom, or real screenshot;
- the script sounds like a blog/article summary;
- graphs, connector lines, or decorative diagrams are used when a real usage visual would be clearer;
- the viewer has to read long paragraphs to understand the point.

Default fix:

- use real source screenshots, official demo video frames, product UI, creator demos, or HTML-native reconstructions;
- animate typing, cursor movement, zoom/crop, callouts, checklist reveal, side panel use, before/after, or proof highlights;
- keep each overlay short enough to read in one glance;
- move detailed context to the caption.

## Viral Poster V2 Reel Mode

Use this mode when the related carousel uses `auto-card-news` Viral Poster V2 Mode, or when the user asks for "2탄", "바이럴형", "맛집/팝업 레퍼런스 느낌", "도블락 느낌", or a louder Reel that does not feel like a tech explainer.

This mode turns AI news into a short viral promo-style Reel:

- 0-2s: moving poster hook. Use giant outlined Korean text, punch-in zoom, sticker pop, quick flash, or a real demo frame.
- 2-8s: one concrete use case. Show a screen, command, UI, source crop, or generated scene. Do not lecture.
- 8-15s: why it matters. Use 2-3 sticker chips, checklist reveal, or before/after.
- 15-20s: comment/save/follow CTA with one keyword.

Visual rules:

- Match the card's loud typography: thick white outer stroke, black inner stroke, hot-pink/yellow shadow, bright fills.
- Use source images and demo frames clearly. Do not over-blur or grayscale them.
- Keep the main text away from Instagram lower profile/caption and right-side action UI.
- Prefer fast readable motion over long smooth slides.
- Use at least three motion jobs: punch-in zoom, sticker pop, type-in, callout bounce, screenshot crop pan, checklist reveal, or CTA keyword pop.

Hard fail and revise if:

- the Reel is only the static card PNGs fading;
- the first 2 seconds are calm;
- text is too small or thin;
- the source visual is hidden behind blur/dim;
- it feels like a normal AI news explainer instead of a viral poster/video hybrid.

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

## Humanized Marketing Rule

Every script, scene plan, caption, and product-style video must pass a humanized marketing review before motion preview. This rule prevents stiff AI narration and slideshow-style explainers.

- Rewrite narration until it sounds natural when spoken out loud.
- Remove generic AI phrases, press-release rhythm, and vague benefit words.
- Check the first 2-second hook, viewer promise, proof, retention reason, and CTA.
- Run Korean Persona Video QA with real `Nemotron-Personas-Korea` samples when the script risks sounding translated, too global, or too technical for Korean viewers.
- For product, app, campaign, launch, lead magnet, or PitchCheck promotion, activate ad/conversion mode and define the offer, audience, proof, objection, CTA, and destination.
- Keep the active channel voice, but keep factual or security content trustworthy.

Read `references/humanized-video-marketing.md` when drafting scripts, converting card-news into video, writing captions, or planning promotional videos.

Read `references/korean-persona-video-qa.md` when the hook, narration, overlays, or caption need to feel natural to Korean viewers. Use `scripts/sample_korean_personas.py` to sample real rows from `nvidia/Nemotron-Personas-Korea`; use cached samples before any imagined fallback.

Read `references/ai-jjuun-reel-playbook.md` for AIjjuun-style AI news/tool/GitHub/open-source Reels. Use it before script writing, motion planning, source-media selection, overlay copy, or final retention QA.

## Humanize-Korean Required Gate

Before finalizing any Korean motion-news asset, run a `humanize-korean` pass on every viewer-facing Korean line.

This applies to:
- spoken script lines
- first 3-second hook text
- scene titles and lower thirds
- on-screen overlays, callouts, chips, captions, and CTA text
- thumbnail text
- Instagram/Threads/YouTube captions
- any Korean text embedded in HTML, Remotion, or HyperFrames compositions

Required process:
1. Collect all Korean copy into `humanize-video-input.md`, grouped by scene and timestamp.
2. Apply the `humanize-korean` skill:
   - Use fast mode by default.
   - Use strict mode when the source is technical, security, finance, legal, pricing-related, or when the first draft sounds translated or stiff.
3. Preserve factual anchors exactly: names, product names, repo names, model names, numbers, prices, dates, URLs, source claims, direct quotes, licenses, and version numbers.
4. Rewrite only rhythm, phrasing, sentence order, examples, CTA wording, and Korean-native expression.
5. Save the result and rationale in `humanize-video-report.md`.
6. If timing, safe-zone layout, or motion edits force wording changes, re-run this gate before export.

Hard fail if any final text still has:
- press-release style openings like "이번 영상에서는", "공개되었습니다", "활용 가능성이 확대됩니다" without a viewer problem
- abstract benefit language like "생산성 향상", "업무 효율 개선" without a concrete example
- English-to-Korean translation rhythm
- blog-post captions that are too long to scan
- cute endings that weaken trust on serious topics
- overlays that cannot be read in one glance on a phone

Read `references/humanize-korean-video-qa.md` whenever Korean script, overlay, caption, or CTA copy is created or revised.

## Korean Persona Video QA

Use Korean Persona Video QA before scene approval for Korean Reels/Shorts where the topic is technical, translated, or easy to explain like a lecture.

- Build a 5-7 person viewer panel from real `Nemotron-Personas-Korea` samples whenever practical.
- Do not quote sampled personas as real people; use them as synthetic viewer testers.
- Ask whether each sampled viewer understands the first 2 seconds, which line sounds translated, which scene needs a familiar example, and what would keep them watching.
- Rewrite spoken lines, scene labels, overlays, and captions until they sound like natural Korean.
- Record the panel summary and rewrite notes in `scene-plan.md` or `script.md`.

Sampler command:

```powershell
python skills\auto-motion-news\scripts\sample_korean_personas.py --count 7 --topic "<topic>"
```

## Visual Source And Typography Rule

For motion made from card-news, the MP4 should feel like the moving version of the approved cards, not a separate template.

- Search for useful official demos, screenshots, product pages, source pages, or credible reference clips for each scene, not only the opening scene.
- For public source URLs, capture real source screenshots into `assets/web/page.png` and use them inside the motion. Download or save representative official media into `assets/web/media` when safe; otherwise use the page capture as fallback.
- When a motion scene replaces or extends a static card, match the approved card typography: primary font file, `font-family`, weight, line-height, size scale, chip style, brand style, and source style.
- After rendering, inspect at least one still frame and compare it with the static card or `design.md` before calling the motion final.

## Visual Clarity And Use-Case Hook Rule

For source-based Reels and motion cards, the first visual should show a concrete use case, demo moment, or viewer problem before it shows a generic title or dark source-page background.

Hard fail and revise if:

- the viewer cannot tell what screenshot, product, page, or workflow is being shown within 1 second;
- global blur/dim makes the real source visual unreadable;
- the first 0-2 seconds only show a title over a vague background;
- a command, UI action, before/after, or source proof could be shown but the scene uses abstract decoration instead.

Use readable crops, zooms, callouts, cursor highlights, typed commands, and local gradients behind text. Avoid heavy Gaussian blur unless the source is intentionally abstract and the motion still communicates the point clearly.

## Default Retention Motion Rule

For Reels, Shorts, or motion cards, meaningful motion is mandatory unless the user explicitly asks for static-only. Do not deliver a simple slideshow as the final motion output.

Every source-based Reel should include at least three of these motion jobs:

- typed prompt, command, search query, or chat reply;
- source screenshot zoom-in or crop pan;
- cursor/tap pulse or button highlight;
- callout box, underline, marker, or pricing row highlight;
- side-panel typing or terminal typing;
- before/after split or comparison reveal;
- checklist reveal;
- progress meter, timeline, or score/rank movement.

Default scene rhythm:

- First 0-2 seconds: motion hook, not just a static title.
- Every 2-4 seconds: a visible change in source crop, typed text, callout, or object position.
- Use real screenshots or official media as the background/proof layer whenever possible.
- Use HTML-native recreations only when direct media is blocked, unsafe, or too low quality.
- Keep overlays inside Reels safe zones so Instagram profile/action UI does not cover the main point.

QA failure conditions:

- The MP4 is just PNG cards fading or cutting.
- No real source visual appears even though the topic came from a URL.
- No practical example, typed action, or visual proof appears.
- The user has to ask "모션 넣어줘" or "실제 예시 보여줘" after a source-based Reel request.

## Link-To-Reel Production Standard

When the user gives a URL and asks for a Reel, motion card, or card-news plus Reel, treat the URL as a production source, not just a script prompt. The expected output is a short, visual, source-backed video package that feels like the moving version of the carousel.

### Default Reel Target

Unless the user asks for a longer explainer, default to a tight social format:

- Duration: usually 15-20 seconds, max 30 seconds for dense technical topics.
- Format: 9:16 for Reels/Shorts, or 4:5 when replacing a carousel card.
- First 0-2 seconds: moving hook. Use typing, zoom, reveal, or a real source screenshot motion. Do not begin with a still title card.
- Every 2-4 seconds: something visible changes: cursor, crop, typed command, callout, checklist, graph, proof frame, or comparison.
- Text overlays must stay away from Instagram/Reels UI danger zones: avoid the lower profile/caption area and the right-side action buttons.

### Source And Visual Research

Before writing the motion plan, gather enough visual material to avoid generic slideshow pacing:

- official page, GitHub repo, docs, release notes, changelog, demo page, or app screen;
- GitHub README images/assets, homepage hero, demo GIF/video, issue screenshots, terminal commands;
- credible hands-on article, creator demo, GeekNews/Hacker News/Reddit/X/Threads reaction when available;
- user-provided screenshots as leads, then verify with a primary source when possible.

For GitHub/tool videos, capture:

- repo page or README proof;
- install/use command;
- one UI/demo/screenshot/asset if available;
- one "try this first" workflow frame;
- one caveat/checklist frame.

Save media notes in `source-pack.md` and scene decisions in `scene-plan.md`.

### Motion Story Pattern For AI/Tool Topics

Use this 15-20 second structure as the default:

1. **0-2s Hook**: show the pain or surprise with motion. Example: repo page zoom + typed "이 코드 어디서부터 보지?"
2. **2-5s What it is**: one plain Korean sentence over real source proof.
3. **5-9s Demo moment**: typing command, UI side panel, graph/search reveal, or source zoom.
4. **9-14s Use case**: show who uses it and what becomes easier.
5. **14-18s Caveat or try step**: show install command, checklist, or limitation.
6. **18-20s CTA**: "저장해두고 링크에서 확인" or channel-specific CTA.

Do not read the card-news text aloud scene by scene. Convert it into motion beats.

### Practical Example Bias

The Reel should answer "그래서 어떻게 쓰는데?" faster than the carousel:

- Prefer typed examples, fake-but-clear UI interactions, command panels, before/after states, and highlighted source screenshots.
- If a tool has commands, animate at least one command being typed.
- If a tool has a UI, animate the viewer's eyes through the UI with zoom/callout.
- If a tool is conceptual, build a simple HTML-native diagram and animate the transformation.
- Avoid abstract stock motion. If the source is a repo, docs, or product, show repo/docs/product.

### Korean Overlay Copy

Overlay text must be even simpler than carousel text:

- One overlay should usually be under 18 Korean characters when possible.
- Prefer spoken Korean: "이거 먼저 보세요", "한 줄로 붙입니다", "여기서 막혔죠?"
- Avoid stiff translations and abstract nouns.
- For AIjjuun, keep the cute tutor voice, but do not let it cover the factual point.
- Do not use "AI쭌식" as a label. Use `AI JJUN`, `AI NEWS`, or a concrete category pill.

### Motion/Card Consistency

If the Reel belongs to a carousel package:

- Use the same font system as the approved cards, especially `Griun Mongtori` for Korean overlay text.
- Use the same black/editorial background, source label style, chips, and brand mark.
- Export one preview frame and compare it with `card-01.png` or the relevant static card before final.
- If the motion uses a different internal font for generated UI text, fix it unless it is intentionally code/terminal text.

### Required Output For URL-Based Motion

Before calling a source-based Reel complete, produce or save:

- `source.md` or link to the carousel source notes;
- `source-pack.md` with visual source and rights/usage notes;
- `script.md` with short spoken/overlay script;
- `scene-plan.md` with timestamps, visual, motion job, and viewer reason;
- `motion-plan.md` with engine choice;
- `caption.md` with short human caption, `Contents Editor`, and source links;
- final or preview MP4 path;
- one still preview frame for visual QA.

## Best Fit

Use this skill for:

- Instagram Reels or YouTube Shorts from a script
- user-recorded screen recordings, voice recordings, talking-head clips, demos, or raw tutorial footage that should become a Reel/Short
- Card-news-to-script conversion
- Card-news-to-motion conversion
- Source-to-short-video planning
- Visual reference discovery for a video
- HyperFrames or Remotion scene planning
- MP4 render preparation

If the user only wants static Instagram carousel cards, use `auto-card-news` instead. If the user provides raw talking-head, audio, or screen-recording footage and asks for editing, use **Recorded Footage Edit Mode** in this skill. Treat `video-use` as an editing reference and helper source, not as a mandatory dependency.

## Supported Modes

1. **Script to Motion**
   - Input: script, rough talking points, or narration draft.
   - Output: tightened script, scene plan, visual references, motion plan, caption, and optional MP4.

2. **Card News to Script**
   - Input: an existing `auto-card-news` project, storyboard, PNG set, HTML cards, or pasted card copy.
   - Output: short-form script that turns the card flow into a video rhythm instead of reading cards aloud.

3. **Card News to Motion**
   - Input: an existing card-news project or approved carousel storyboard.
   - Output: motion-video scene plan and MP4-ready card/scene sequence.

4. **Source to Video Package**
   - Input: URL, report, memo, screenshots, or notes.
   - Output: source pack, video angle, script, scene plan, and motion plan. For MVP, keep this guided and approval-based.

5. **Recorded Footage to Reel**
   - Input: screen recording, talking-head clip, voice recording, demo footage, or raw tutorial footage.
   - Output: edit strategy, silence/dead-space cut plan, motion graphics, overlays, zoom/crop notes, source notes, and optional 9:16 MP4.
   - Default assumption: the user may add final subtitles in a separate editor. Prioritize pacing, visual clarity, callouts, and motion graphics over automatic caption generation.
   - Default to no paid APIs. Use ElevenLabs, OpenAI transcription, or any paid speech-to-text only after explicit user approval.

## Recorded Footage Edit Mode

Use this mode when the user uploads an actual recording and wants it edited into a Reel, Shorts, or social video.

This mode is inspired by `browser-use/video-use`, but adapted for this workspace: free/local-first, privacy-first, and compatible with AIjjuun/card-news typography.

### Transcription And Caption Policy

Do not assume ElevenLabs or automatic captions are required. For user-recorded edits, subtitles are optional support, not the main deliverable, unless the user asks for them.

Default order:

1. **No transcript needed**: use visual timing, waveform/silence, user notes, and manual review to cut dead space and add motion graphics.
2. **User-provided script or rough notes**: use them to understand beats and place overlays/callouts.
3. **Local/free STT if already available**: use Whisper, whisper.cpp, faster-whisper, or another local tool only if it materially improves edit decisions and the user approves.
4. **Paid STT optional**: ElevenLabs Scribe, OpenAI speech-to-text, or another paid API may be used only when the user explicitly approves cost/API usage.

If no word-level transcript exists, do not promise frame-perfect filler-word removal or word-boundary subtitles. Instead:

- cut by visible action, pauses, waveform, and user notes;
- use optional marker text or summary captions only when they help edit timing;
- ask the user for exact wording when a line matters;
- mark uncertain captions in `edit-notes.md`.

If the user says they will add subtitles later, do not burn final subtitles into the video. Use temporary guide text only when it helps preview the rhythm, and keep it removable.

### Editing Workflow

1. Inventory raw footage with `ffprobe` or equivalent: duration, resolution, audio tracks, frame rate.
2. Create an edit folder next to the source or inside the motion project; never overwrite raw footage.
3. Run a privacy pass before preview or publishing: blur or cut API keys, tokens, emails, private repo names, personal paths, billing screens, and sensitive browser tabs.
4. Create a plain-language edit strategy and wait for approval before cutting.
5. Build an edit decision list (`edl.json` or `edit-plan.md`) with source, start, end, reason, crop/zoom, caption, and overlay notes.
6. For screen recordings, prefer vertical 9:16 compositions with:
   - zoom into the active terminal/browser area;
   - cursor, command, or UI callout highlights;
   - HyperFrames or Remotion motion graphics matched to the explanation;
   - large Griun Mongtori Korean hook/callout overlays when useful;
   - short motion cards before, during, or after the real recording when they improve the hook or explain the action.
7. Add short audio fades around cuts to avoid pops.
8. If guide subtitles or labels are used, put them after overlays in the visual stack so they stay readable.
9. Render a preview, inspect cut boundaries and first/last seconds, then iterate.

### Silence And Dead-Space Cutting

For uploaded recordings, remove empty time before adding decorative motion:

- trim slow starts, waiting time, loading time, repeated attempts, and dead air;
- preserve useful hesitation only if it makes the demo feel human or builds anticipation;
- if transcript timestamps are unavailable, use waveform, visual state changes, and manual preview;
- use short crossfades or 30ms audio fades at cut points;
- keep enough context so the viewer understands what changed on screen.

### Motion Graphics Role

Use HyperFrames or Remotion to add explanatory visuals that make the footage easier to watch:

- opening hook card;
- command or button highlight;
- cursor path or tap pulse;
- zoom box, magnifier, or crop transition;
- before/after split;
- terminal side panel typing;
- checklist reveal;
- warning/attention badge;
- end recap card.

Motion graphics should explain the recording, not cover it. If an overlay hides the important screen area, reposition or shrink it.

### When To Use video-use Repo Helpers

If `browser-use/video-use` is available in the workspace, use it as a reference for:

- transcript packing ideas;
- timeline/filmstrip inspection;
- EDL-based rendering;
- cut-boundary self-evaluation;
- audio-fade production rules;
- subtitle-last production rules only if subtitles are included.

Do not require its ElevenLabs Scribe path unless the user asks for that exact workflow and approves API usage.

## Required Workflow

1. **Confirm channel and target**
   - Confirm the active channel, audience, tone, and target format.
   - Default target: 15-20 second vertical Reel/Shorts for source-based AI/news/tool topics. Use 30-60 seconds only when the user asks for a deeper explainer or the topic cannot be explained safely in 20 seconds.
   - Keep AI information, football information, and PitchCheck marketing contexts separated.
   - For AIjjuun, read `references/ai-jjuun-reel-playbook.md` so the hook, motion jobs, safe zones, source visuals, caption, and AX-consulting bridge stay consistent.

2. **Identify input type**
   - Script, card-news project, pasted card copy, source URL, report, notes, or existing video footage.
   - If the user points to a card-news project, read its `brief.md`, `storyboard.md`, `motion-plan.md`, `caption.md`, HTML cards, or output files when available.
   - If the user uploads recording footage, switch to Recorded Footage Edit Mode and read `references/recorded-footage-edit-mode.md`.

3. **Create the retention frame**
   - Define who should stop watching.
   - Define the first 2-second hook.
   - Define why the viewer keeps watching after each scene.
   - Define the save, comment, share, or try reason.
   - Make the video structure explicit as Hook -> Explanation -> Engagement CTA before writing the script.

4. **Build a Korean viewer panel when script risk is high**
   - If the source is English, technical, product-doc-like, or likely to sound translated, run Korean Persona Video QA before finalizing the hook.
   - Use `scripts/sample_korean_personas.py` to sample real `Nemotron-Personas-Korea` rows when network and dependencies are available.
   - Save sampled panel notes and rewrite decisions in `script.md` or `scene-plan.md`.
   - If the sampler cannot run, record the reason and use cached samples before using a labeled fallback panel.

5. **Draft or convert the script**
   - For raw scripts, tighten the opening and remove slow exposition.
   - For card-news, convert card roles into video beats: hook, situation, proof, useful point, channel take, CTA.
   - Do not simply read every card aloud.
   - Keep spoken lines natural and easy to say out loud.
   - Run the spoken Humanizer pass from `references/humanized-video-marketing.md` before showing the script.
   - Run the required Humanize-Korean gate from `references/humanize-korean-video-qa.md` before scene approval.
   - Save `humanize-video-input.md` and `humanize-video-report.md`.
   - Run Korean Persona Video QA from `references/korean-persona-video-qa.md` before scene approval when the script risks sounding translated or too abstract for Korean viewers.
   - If the video promotes a product or campaign, run ad/conversion mode before writing the final CTA.

6. **Search visual references**
   - Search official demos, product pages, screenshots, GitHub media, documentation, credible creator walkthroughs, and open-license media.
   - For public source URLs, capture at least one real browser screenshot into the project before planning final motion. Use it as proof, background, zoom crop, or callout target.
   - Save direct-safe representative media as `assets/web/media`; if unavailable, use the captured page screenshot as fallback.
   - If fresh source discovery is needed, use `last30days`: https://github.com/mvanhorn/last30days-skill
   - Record all source URLs and usage notes in `source-pack.md`.
   - Read `references/media-research-and-rights.md` before using outside media.

7. **Build scene plan**
   - Create a scene-by-scene plan with timestamp, line, visual, motion idea, engine, and viewer reason.
   - Keep most scenes short, usually 2-6 seconds.
   - Avoid slideshow pacing. Something meaningful should change every few seconds.
   - Include at least three retention motion jobs from the Default Retention Motion Rule for source-based Reels.
   - The first scene must use a concrete demo/use-case/source visual when one can be captured or recreated.
   - Run the retention marketing check from `references/humanized-video-marketing.md` so every scene has a viewer reason and a visual change.

8. **Choose motion engine**
   - Prefer HyperFrames for short HTML/CSS/GSAP motion: big subtitles, typing, panels, chips, UI callouts, cursor paths, screenshot zooms.
   - Use Remotion for narration sync, audio timing, longer timelines, video compositing, or reusable React video templates.
   - Treat `video-use` as a companion/reference for editing user-recorded footage, not as the default script-to-motion engine and not as a mandatory paid-API path.
   - Read `references/motion-engine-selection.md`.

9. **Approval gate: script and scene plan**
   - Show the script and scene plan before creating motion output.
   - Ask for approval or revision.

10. **Create preview motion**
   - Build preview scenes only after approval.
   - For HyperFrames, run lint and inspect before final render.
   - For Remotion, verify preview frames and audio/video timing when used.
   - If any overlay, title, or CTA wording changes during timing or safe-zone edits, re-run the Humanize-Korean gate before export.

11. **Approval gate: motion preview**
    - Show preview image or MP4 path.
    - Ask for final approval before rendering final assets.

12. **Render final package**
   - Render MP4 only after approval.
   - Before calling the MP4 final, check that it includes real source media where available and meaningful motion beyond fades/cuts.
   - Save caption and source notes.
   - Create `publish-queue.json` and `publish-checklist.md` when the user wants recurring, assisted, or API-based publishing.
   - Upload only after explicit user approval and only when official platform credentials are configured; otherwise stop at the publish queue.

## Artifact Structure

Use this structure by default:

```text
carousel-workspace/
  motion-projects/
    <channel-slug>/
      <date-topic>/
        source.md
        script.md
        humanize-video-input.md
        humanize-video-report.md
        scene-plan.md
        source-pack.md
        motion-plan.md
        caption.md
        design.md
        assets/
        scenes/
        output/
```

Use `scripts/init_motion_project.py` to scaffold this structure when helpful.

## Reference Loading

- Read `references/ai-jjuun-reel-playbook.md` when producing AIjjuun Reels, Shorts, source-link videos, GitHub/open-source demos, tool explainers, or AX-consulting bridge motion content.
- Read `references/video-workflow.md` when converting an input into a short-form script and scene plan.
- Read `references/humanized-video-marketing.md` when polishing scripts, captions, CTAs, retention beats, or product/ad-style videos.
- Read `references/humanize-korean-video-qa.md` when removing AI-ish Korean, translation rhythm, stiff captions, or unreadable overlay wording.
- Read `references/korean-persona-video-qa.md` when testing hooks, spoken lines, overlays, or captions against real `Nemotron-Personas-Korea` samples.
- Read `references/media-research-and-rights.md` before searching, using, recreating, or attributing visual references.
- Read `references/motion-engine-selection.md` before deciding HyperFrames, Remotion, video-use, or static fallback.
- Read `references/viral-poster-v2-reels.md` when the paired carousel uses Viral Poster V2 Mode or the user asks for a loud Korean promo-poster/Reel hybrid.
- Read `references/recorded-footage-edit-mode.md` when the input is a user recording, audio note, screen capture, talking-head clip, demo recording, or tutorial footage.
- Read `references/publishing-automation.md` before creating publish queues, upload scripts, Meta API upload flows, or cross-post automation.
- Use `auto-card-news` when the job starts as a carousel and the user also wants static PNG cards.
- Use `last30days` when fresh source discovery is needed.

## Completion Criteria

A motion-news project is complete only when:

- The active channel and target platform are explicit.
- Input type is clear.
- Script, scene plan, source pack, motion plan, and caption are saved.
- Korean script, overlays, thumbnail text, and caption pass the Humanize-Korean gate, with `humanize-video-report.md` saved.
- Visual sources are recorded with direct-use, recreate, or reference-only notes.
- For uploaded recordings, raw files remain untouched and privacy-sensitive details are reviewed before final render.
- Each scene has a viewer reason and motion reason.
- Script, scene plan, caption, and CTA pass the Humanizer, Marketing, and ad/conversion checks when applicable.
- Korean Persona Video QA is recorded when the topic is technical, translated, or at risk of sounding unlike Korean social video.
- The engine choice is recorded per scene.
- Preview motion has been reviewed when MP4 is requested.
- Final files match the approved output plan.
- Source-based Reels follow Hook -> Explanation -> Engagement CTA unless a documented creative reason says otherwise.
- Upload automation, if requested, has either produced `publish-log.md` or stopped safely at `publish-queue.json` with missing requirements listed.
