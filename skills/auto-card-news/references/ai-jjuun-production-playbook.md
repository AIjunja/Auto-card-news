# AIjjuun Production Playbook

Use this playbook whenever the active channel is AIjjuun, AI news, AI tool curation, developer AI, AX consulting, or a similar Korean AI education channel.

AIjjuun is not a press-release summary account. The channel should feel like a friendly Korean AI tutor who finds useful but slightly hidden AI tools/news, tests the practical angle, and explains why it matters without sounding like translated English.

## Positioning

- Channel role: friendly AI tutor + hands-on curator + future AX consultant.
- Viewer promise: "I found the useful AI thing, checked why it matters, and turned it into something you can try."
- Audience: Korean creators, developers, marketers, operators, students, solo founders, and small teams who want practical AI leverage without reading all the source material.
- Differentiator: not only official announcements. Find minor-but-useful signals from GitHub, GeekNews, X, Threads, Reddit, Hacker News, docs, changelogs, demos, and creator experiments.
- Long-term business path: every post should quietly build trust for AX consulting, AI workflow setup, team enablement, automation audits, prompt/workflow packages, and practical AI adoption.

## Source Selection

Do not rely only on official blogs. A strong AIjjuun topic usually has at least two of these:

- Official proof: docs, blog, changelog, GitHub repo, paper, release note, pricing page, demo page.
- Hype proof: GeekNews, Hacker News, Reddit, X, Threads, YouTube demo, creator walkthrough, GitHub star/release velocity.
- Practical proof: install command, product UI, example workflow, before/after, API call, screenshot, issue, benchmark, real limitation.
- Korean relevance: can a Korean viewer use it at work, content creation, coding, marketing, security, research, or small-business operations?
- AX angle: can this become a checklist, setup service, workshop, consulting package, policy pack, or workflow template?

Reject or deprioritize:

- Broad "AI news roundup" topics with no practical use.
- Pure benchmark/model ranking unless it changes a workflow decision.
- Tool lists without a single concrete use case.
- Official launch posts that cannot be shown visually.
- Topics where the claim is viral but not verifiable.

## AIjjuun Story Angle

Start from a viewer situation, not from the source title.

Good angles:

- "이거 쓰면 누가 덜 귀찮아지나요?"
- "어떤 반복 업무가 줄어드나요?"
- "개발자/마케터/크리에이터가 어디에 붙이면 바로 쓰나요?"
- "비용/권한/보안/락인 같은 리스크는 뭐예요?"
- "이걸 모르면 어떤 기회를 놓치나요?"
- "AX 컨설팅 관점에서 회사에 적용하면 뭐부터 점검하나요?"

Avoid vague or awkward phrasing:

- Do not say `AI쭌식 관점`. Use `AI JJUN`, `AI쭌 생각`, `제가 보기엔`, or just state the interpretation plainly.
- Avoid abstract phrases like `체감 이득`, `실무 도입성`, `워크플로우 혁신` unless immediately translated into everyday Korean.
- Avoid direct translation rhythm. Rewrite into Korean social copy.
- Avoid "기능 소개" only. Sell the situation and why the viewer should care.

## Card Structure

Default carousel length: 6-8 cards.

1. Hook cover: one strong viewer pain, surprise, or use case. Use a large recognizable visual.
2. Problem: what the viewer currently does manually or misunderstands.
3. What it is: one plain sentence, not a spec dump.
4. Real use case: show a screen, command, before/after, or example.
5. Why it matters: time, money, risk, quality, speed, or decision-making.
6. Caveat/check: limitation, pricing, security, quality warning, or setup requirement.
7. Try/save CTA: tell the viewer what to save, comment, or try next.

Every card needs:

- one card job;
- one visual job;
- one big line viewers can understand without reading the caption;
- no dense article paragraphs.

## Visual Standard

The visual must prove the topic. It should not be a generic AI illustration.

Preferred visual order:

1. Official UI, product page, docs, changelog, GitHub repo, issue, release, demo, video still.
2. Credible creator demo or community screenshot, used as reference or with attribution.
3. HTML-native reconstruction of the actual workflow.
4. Generated editorial image only when it is specific to the topic and passes QA.

Generated image rules:

- Write a fresh prompt for the exact topic and exact card. Do not reuse generic "AI robot workflow" prompts.
- Include concrete product/source anchors: product name, UI shape, logo-like color, repo screen, terminal command, document type, dashboard, or real workflow.
- If the topic is Claude, Figma, GitHub, OpenAI, Google, Canva, etc., prefer official/source screenshots or UI-like reconstructions. Do not hallucinate a fake logo as evidence.
- Reject the image if it could fit ten unrelated AI posts.
- Reject the image if it contains nonsense Korean/English text in a visible area.
- If the generated image is used only for mood, keep source proof on another card.

Do not:

- use the same screenshot on cards 1-5 with different text;
- hide the important screenshot under heavy blur, black-and-white, or global dimming;
- make tiny GitHub screenshots the only proof;
- use decorative connector lines, weak charts, or random icons when a real screen/action would explain faster.

## Copy Standard

Write like a Korean creator explaining it to a smart friend.

- Use short spoken Korean.
- Keep the main headline big.
- Keep support copy to 1-3 short lines when possible.
- Define hard terms with a plain example.
- Use cute tone lightly in captions and CTA, but keep technical/security/pricing claims trustworthy.
- The caption can use `~욤` lightly, but cards should prioritize clarity and punch.

Good copy patterns:

- "구글 상위노출만 챙기면 끝? 이제 AI 답변에도 걸려야 해요."
- "AI한테 prod 권한 주면, 프롬프트보다 권한이 먼저 터집니다."
- "코드 잘 짜는 AI보다, 안 망하게 굴리는 루프가 더 중요해졌어요."
- "이건 신기한 툴이 아니라, 팀 업무 방식이 바뀌는 신호예요."

Bad copy patterns:

- "본 솔루션은 업무 효율성을 극대화합니다."
- "사용자는 생산성 향상을 체감할 수 있습니다."
- "이 도구는 다양한 활용성을 제공합니다."
- "AI쭌식 해석"

## Caption Standard

Captions should be easy to skim.

Default shape:

1. one hook line;
2. 2-4 short paragraphs explaining what changed;
3. 3 bullet-style takeaways or checklist lines;
4. short caveat if needed;
5. comment/save/follow CTA;
6. `Contents Editor · AI JJUN`;
7. `Source · ...` with useful direct links.

Use `Contents Editor`, not `Editor`, so viewers do not think AIjjuun created the original repo/tool/news.

## QA Before Final

Fail and revise if:

- the first card looks like a PPT title slide;
- the viewer cannot tell what the image is within 1 second;
- the post is just "official blog summary";
- the copy sounds translated;
- there is no save/comment/share reason;
- card text overlaps number badges, brand, source, or page count;
- card 2-6 images could be swapped without changing meaning;
- the caption has no source links or useful next step;
- the Reel is missing for an Instagram-first package unless the user explicitly asked for static only.

