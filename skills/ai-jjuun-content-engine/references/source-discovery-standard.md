# Source Discovery Standard

AI쭌 should beat generic AI news accounts by finding sources that are useful, timely, and a little more niche than official press releases.

## Source Mix

For each topic, try to gather four layers:

1. **Official baseline**
   - Official blog, docs, GitHub repo, release notes, paper, changelog, pricing page, product page.
2. **Proof of use**
   - Demo video, README images, usage commands, examples, issues, screenshots, codelabs, app pages.
3. **Hype or field signal**
   - GitHub stars/recent commits, GeekNews, Hacker News, Reddit, X/Threads posts, creator demos, comments, repost counts.
4. **Reality check**
   - License, pricing, limitations, setup friction, access restrictions, privacy/security/billing risks.

Do not rely only on official blogs unless the official source itself includes a strong demo or user impact.

## Places To Search

- Official company blogs: OpenAI, Anthropic, Google, GitHub, Microsoft, Figma, Adobe, Hugging Face.
- GitHub: trending, README media, releases, issues, discussions, stars, forks, recent commits.
- GeekNews: Korean developer-adjacent signals and comments.
- Hacker News: technical hype and criticism.
- Reddit: practical user reactions and caveats.
- X/Threads: fast-moving demos and creator interpretations. Use social posts as leads, then verify with primary sources.
- YouTube: official demos and short walkthroughs when allowed.
- Product docs and changelogs: often better than launch blogs for practical details.

## Candidate Scoring

Score each source 1-5:

- `usefulness`: can a viewer use it this week?
- `novelty`: is it fresh or under-covered?
- `visual`: can we show a real screen/demo/result?
- `reel`: can this become motion in 15-20 seconds?
- `trust`: is there a primary source or strong evidence?
- `AX bridge`: can it lead to consulting, workflow design, governance, or team enablement?

Default pick:

- choose the highest combined usefulness + visual + AX bridge, not just the biggest brand.

## Strong AI쭌 Source Angles

- "이거 회사/팀에서 바로 점검해야 함."
- "무료/오픈소스로 대체 가능한 도구."
- "AI 에이전트 쓰기 전에 권한/비용/보안부터 봐야 함."
- "이제 검색/SEO/업무 방식이 이렇게 바뀜."
- "공식 코스/쿡북/가이드로 공부 루트를 정리할 수 있음."
- "개발자만 알던 도구를 비개발자도 이해할 수 있게 풀기."

## Required Source-Pack Fields

For every final topic, save:

- source URL and title;
- what the source claims;
- what is verified;
- what is only a social claim;
- visual/media candidates;
- use-case angle;
- caveat;
- AX bridge;
- why this is worth posting now.

## Avoid

- "AI model got better" with no use case.
- "Top 10 tools" lists with no testing or proof.
- Reposting a Threads/X post without tracing the underlying source.
- Official announcement summaries that every other account can make.
- Claims like "무조건 노출", "돈 벌어줌", "완전 자동" without evidence.
