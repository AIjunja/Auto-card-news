# AI쭌 카드뉴스 자동화

링크 하나를 넣으면 AI 뉴스 카드뉴스, 릴스 플랜, 캡션, 출처 정리까지 만드는 Agent Skill 샘플입니다.

## 설치

Codex:

```powershell
powershell -ExecutionPolicy Bypass -Command "iwr -useb https://raw.githubusercontent.com/AIjunja/Auto-card-news/master/install.ps1 | iex"
```

Claude Code:

```powershell
powershell -ExecutionPolicy Bypass -Command "iwr -useb https://raw.githubusercontent.com/AIjunja/Auto-card-news/master/install-claude.ps1 | iex"
```

## 사용 예시

```text
$ai-jjuun-content-engine
<SOURCE_URL>

AI쭌 카드뉴스 자동화로 만들어줘.
카드뉴스 7장, 릴스 플랜, 캡션, 출처 링크까지.
첫 장은 실제 사용 장면이나 제품 이미지 중심으로 후킹되게 잡아줘.
```

## 핵심

- 공식 블로그 요약에서 멈추지 않기
- 실제 화면, 데모, GitHub, 커뮤니티 반응까지 확인하기
- 번역투 말고 한국 사람이 읽기 쉬운 카피로 쓰기
- 카드뉴스와 릴스를 같이 설계하기
- 마지막에는 저장/댓글/팔로우 이유를 만들기
