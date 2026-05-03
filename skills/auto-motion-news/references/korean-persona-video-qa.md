# Korean Persona Video QA

Use this reference when a short-form script, hook, overlay, or caption sounds like translated English, a product announcement, or a lecture script.

The goal is to use real Korean synthetic persona samples as a viewer panel before scene approval and again before final MP4 render.

## Source

Primary dataset: `nvidia/Nemotron-Personas-Korea` on Hugging Face.

- License: `CC BY 4.0`
- Dataset focus: synthetic Korean personas grounded in real Korean demographic, geographic, and social distributions.
- Use: first-2-second hook QA, spoken Korean QA, viewer-retention simulation, and caption rewrite.
- Do not present sampled personas as real people. They are synthetic.

## Sampling

When network and dependencies are available, run:

```powershell
python skills\auto-motion-news\scripts\sample_korean_personas.py --count 7 --topic "릴스 주제"
```

If `datasets` is missing, install only after approval:

```powershell
python -m pip install datasets
```

The script streams a small sample instead of downloading the whole dataset and caches sampled rows in `.cache/nemotron-personas-korea/`. If the network fails, rerun with `--offline` after at least one successful sample.

## Viewer Panel

Before scene approval, choose 5-7 sampled personas and write notes:

- Would this person understand the first 2 seconds without context?
- Which spoken line sounds translated or too corporate?
- Which scene needs a more familiar Korean example?
- Which visual proof would make the idea feel real?
- Would they keep watching, save, share, comment, or leave?

## Rewrite Rules

For every weak line or scene:

1. Start from the viewer's situation, not the company announcement.
2. Say the annoying part, surprise, or useful change in spoken Korean.
3. Put source facts behind the hook as proof.
4. Replace vague words like "혁신", "생산성", "워크플로우" with what the viewer actually sees or does.
5. If a line cannot be said naturally out loud, rewrite it before motion work.

Examples:

| Weak | Better |
| --- | --- |
| "한국형 합성 데이터셋이 공개됐습니다" | "엔비디아가 한국 사람 700만 명을 가짜로 만들었대요" |
| "에이전트의 문화적 정합성을 개선합니다" | "AI가 한국 사람 상황을 좀 덜 어색하게 알아듣게 만드는 거예요" |
| "개발 생산성을 극대화합니다" | "반복으로 날리던 시간을 줄여주는 쪽에 가까워요" |
| "사용자 경험을 개인화합니다" | "사람마다 다른 말투와 상황을 더 잘 맞춰보려는 거예요" |

## Pass Criteria

The script passes only when:

- At least one real Nemotron sample panel was used, or the reason it could not be used is recorded.
- The first 2 seconds are understandable to a non-expert Korean viewer.
- Spoken lines sound natural when read out loud.
- Every scene has a visual reason and a viewer reason.
- The caption stays short, human, and source-backed.
