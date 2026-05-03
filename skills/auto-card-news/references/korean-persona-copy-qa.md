# Korean Persona Copy QA

Use this reference when carousel copy, captions, hooks, or CTAs sound translated, corporate, too technical, or generally "not how Koreans would say it."

The goal is not to quote the personas. The goal is to use real Korean synthetic persona samples as a reader panel before finalizing the copy.

## Source

Primary dataset: `nvidia/Nemotron-Personas-Korea` on Hugging Face.

- License: `CC BY 4.0`
- Dataset focus: synthetic Korean personas grounded in real Korean demographic, geographic, and social distributions.
- Use: copy QA, reader simulation, audience variety, and Korean phrasing checks.
- Do not present sampled personas as real people. They are synthetic.

## Sampling

When network and dependencies are available, run:

```powershell
python skills\auto-card-news\scripts\sample_korean_personas.py --count 7 --topic "카드뉴스 주제"
```

If `datasets` is missing, install only after approval:

```powershell
python -m pip install datasets
```

The script streams a small sample instead of downloading the whole dataset and caches sampled rows in `.cache/nemotron-personas-korea/`. If the network fails, rerun with `--offline` after at least one successful sample.

## Reader Panel

Before HTML preview, choose 5-7 sampled personas and write short notes:

- Who are they in plain language? Example: `경기 안양 40대 사무 보조원`, `부산 기장 50대 부동산 실무자`.
- Would they understand the hook in 2 seconds?
- Which word feels like translated product copy?
- Which line sounds like a company announcement instead of a social post?
- What everyday Korean phrase would make the point click?
- Would they save, comment, share, or swipe away?

## Rewrite Rules

For every weak line, rewrite in this order:

1. Name the viewer's situation.
2. Say the annoying part or curiosity in normal Korean.
3. Use the source as proof, not as the opening.
4. Replace abstract benefit words with the thing that changes in the viewer's day.
5. Keep one thought per card.

Examples:

| Weak | Better |
| --- | --- |
| "소버린 AI를 위한 한국형 합성 페르소나 데이터셋" | "엔비디아가 한국 사람 700만 명을 가짜로 만들었다고?" |
| "모델 응답 다양성과 편향 완화에 활용됩니다" | "AI가 맨날 어색한 한국말 하는 이유, 데이터 때문일 수도 있어요" |
| "워크플로우 자동화가 강화됩니다" | "이제 귀찮은 반복 클릭을 AI가 옆에서 줄여줘요" |
| "사용자 맥락을 반영한 개인화 경험" | "사람마다 다른 상황을 AI가 좀 더 알아듣게 만드는 거예요" |

## Pass Criteria

The copy passes only when:

- At least one real Nemotron sample panel was used, or the reason it could not be used is recorded.
- The hook can be understood by a non-expert Korean reader without reading the source.
- Product-doc words were replaced with spoken Korean.
- Each card has a viewer reason, not just a fact.
- The caption includes source attribution when the dataset or source is mentioned.
