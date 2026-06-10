# Humanize-Korean Card QA

Use this reference whenever `auto-card-news` creates or revises Korean carousel copy. The goal is not to make the text prettier. The goal is to remove the parts that make viewers feel "this was translated by AI" or "this is a generic AI news account."

## Required Inputs

Create `humanize-input.md` with:

- card number;
- current card headline;
- current body copy;
- chips, badges, labels, CTA text;
- caption draft;
- source terms that must not change.

Do not send only the caption through the pass. Card text and caption must be checked together because the caption often repeats the same stiff phrasing.

## Use `humanize-korean`

Use the local `humanize-korean` skill as the rewrite/check layer, but do not blindly accept its rewrite. For card-news work, `humanize-korean` is mainly a detector and suggestion pass. The final writer must preserve the channel voice and choose only the changes that make the copy clearer, more Korean-native, and more scroll-stopping.

Default mode:

- Fast mode for normal card copy and short captions.
- Strict mode for long captions, English source translation, legal/security/finance claims, or copy that already failed once.

Preserve:

- product names, repo names, model names, people, organizations;
- dates, prices, license names, version numbers, star counts;
- direct source claims and URLs;
- the channel's factual position;
- the channel's human voice, including casual AIjjuun tutor phrasing when it helps clarity.

Rewrite:

- sentence rhythm;
- word order;
- Korean-native phrasing;
- hook sharpness;
- caption scanability;
- CTA wording;
- examples that make abstract claims concrete.

Reject the rewrite when:

- the original sounded more like the creator than the rewritten version;
- the rewritten line becomes formal, corporate, blog-like, or generic;
- cute but intentional channel warmth is removed without improving trust;
- the hook loses its bite;
- the copy becomes longer or harder to read on a phone.

## AI-Smell Checklist

Fail and rewrite if any of these appear:

- Source-first opening: "OpenAI가 발표했습니다", "GitHub 레포가 공개됐습니다" when the viewer problem should come first.
- Abstract payoff without a scene: "생산성이 향상됩니다", "워크플로우가 개선됩니다", "활용 가치가 높습니다".
- English structure translated into Korean: "X를 통해 Y를 가능하게 합니다", "사용자 경험을 개선합니다", "효율성을 제공합니다".
- Too many nouns in a row: "에이전트 워크플로우 자동화 최적화 구조".
- Same sentence ending repeated 3+ times.
- Bullets that feel like a report, not a social post.
- Cute endings that make security, money, or technical caution feel unserious.
- Card text that is correct but impossible to read quickly on a phone.

## Rewrite Direction

Prefer:

- "지금 겪는 상황" over product definition.
- "이거 어디에 쓰는지" over feature list.
- "먼저 확인할 것" over abstract caveat.
- "저장/댓글 남길 이유" over generic CTA.
- Short spoken Korean over polished corporate Korean.

Examples:

- Weak: "해당 도구는 업무 자동화 효율을 개선합니다."
- Better: "매번 복붙하던 작업이면, 이걸로 한 번에 묶을 수 있어요."

- Weak: "사용자는 고급 기능을 활용할 수 있습니다."
- Better: "버튼 찾느라 헤매는 시간을 줄여줘요."

- Weak: "AI 에이전트 활용 여부를 알아보겠습니다."
- Better: "AI한테 이 일 맡겨도 되는지, 먼저 이것부터 보세요."

## Required Report

Save `humanize-report.md`.

```md
# Humanize-Korean Card Report

## Mode
- fast / strict / manual-fallback:
- Reason:

## Preserved Facts
- ...

## Rewrites
| Card | Before | After | Reason |
|---|---|---|---|
| 01 |  |  |  |

## Rejected Suggestions
- ...

## Final Risk
- none / needs source check / needs user tone check:
```
