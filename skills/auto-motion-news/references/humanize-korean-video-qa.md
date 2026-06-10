# Humanize-Korean Video QA

Use this reference with the `humanize-korean` skill whenever `auto-motion-news` creates Korean script, overlays, thumbnail text, captions, or CTA copy.

The goal is simple: the motion video should sound like a Korean creator explaining something useful, not like a translated product announcement.

## Required Input

Create `humanize-video-input.md` before final scene approval.

Group copy like this:

```md
# Humanize Video Input

## Source Terms To Preserve
- Product/repo/model names:
- Dates/prices/versions/star counts:
- Direct quotes:
- Source URLs:

## Scene 01 / 00:00-00:02
- Spoken:
- Overlay:
- Thumbnail candidate:
- CTA or chip:

## Scene 02 / 00:02-00:05
- Spoken:
- Overlay:
- CTA or chip:

## Caption Draft
...
```

## Mode

Use fast mode by default.

Use strict mode when:

- the source is English, technical, security, finance, legal, pricing, or policy-related;
- the first draft sounds like a press release;
- the caption reads like a blog post;
- the hook explains the product before the viewer problem;
- the video is for AI JJUN and should feel like a helpful Korean tutor.

## Preserve Exactly

Do not change:

- person, company, product, repo, model, and org names;
- dates, prices, versions, star counts, limits, commands, filenames, and URLs;
- license names and security severity;
- direct quotes or legally sensitive claims;
- source attribution.

If a fact feels suspicious, mark it in the report instead of rewriting it as true.

## Rewrite Aggressively

Rewrite:

- Korean sentence rhythm;
- word order;
- hook angle;
- spoken phrasing;
- overlay length;
- CTA wording;
- example choice;
- caption scanability.

The result should be easy to say out loud.

## Video AI-Smell Checklist

Fail the copy if it has any of these:

- "이번 영상에서는", "오늘은 ~에 대해 알아보겠습니다" as the opening.
- "공개되었습니다", "활용 가능성이 높아집니다", "생산성을 향상합니다" without a concrete viewer payoff.
- Long noun chains like "업무 자동화 효율 개선 기능".
- More than one abstract word in the same overlay.
- Overlay text that cannot be read in one glance.
- First 2 seconds without a clear problem, surprise, or demo action.
- Captions that feel like a Medium article.
- Cute endings on serious security, money, legal, pricing, or data-loss topics.
- Lines that nobody would naturally say in conversation.

## Better Rewrite Examples

Weak:
> 이 도구는 워크플로우 자동화를 지원합니다.

Better:
> 반복 클릭, 이제 AI한테 맡길 수 있어요.

Weak:
> 사용자는 고급 기능을 사용할 수 있습니다.

Better:
> 버튼 찾느라 헤매는 시간을 줄여줘요.

Weak:
> AI 에이전트 활용 여부를 알아보겠습니다.

Better:
> AI한테 내 회사 일 맡기기 전에, 이거 먼저 보세요.

Weak:
> 해당 업데이트는 개발 생산성을 향상시킵니다.

Better:
> 출근길에도 PR 확인하고 승인할 수 있게 된 거예요.

## Overlay Rules

- One overlay should usually carry one idea.
- Prefer 7-18 Korean characters per beat.
- If the word is technical, pair it with a concrete example.
- If a line needs two breaths, split it into two scenes.
- Avoid lonely one-word line breaks unless used intentionally for punch.

## Required Report

Save `humanize-video-report.md`.

```md
# Humanize-Korean Video Report

## Mode
- fast / strict / manual-fallback:
- Reason:

## Preserved Facts
- ...

## Scene Rewrites
| Scene | Before | After | Reason |
|---|---|---|---|
| 01 |  |  |  |

## Caption Rewrite
- Before:
- After:

## Rejected Suggestions
- ...

## Final Risk
- none / needs source check / needs timing check:
```
