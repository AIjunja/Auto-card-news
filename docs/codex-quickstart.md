# Codex Quickstart

Use this guide when you want to install the AIjjuun Auto Card News skills in Codex.

## Install

Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -Command "iwr -useb https://raw.githubusercontent.com/AIjunja/Auto-card-news/master/install.ps1 | iex"
```

macOS / Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/AIjunja/Auto-card-news/master/install.sh | bash
```

Restart Codex after installation.

## Prompt

```text
$ai-jjuun-content-engine
https://github.com/microsoft/markitdown

AI쭌 카드뉴스 자동화로 만들어줘.
카드뉴스 7장, 릴스 플랜, 캡션, 출처 링크까지.
첫 장은 실제 사용 장면이나 제품 이미지 중심으로 후킹되게 잡아줘.
```

## Expected Output

The agent should prepare:

- `source.md`
- `source-pack.md`
- `brief.md`
- `storyboard.md`
- `motion-plan.md`
- `caption.md`
- card HTML files
- PNG export plan
- Reel or motion preview plan

If image, video, browser, HyperFrames, or Remotion tools are available, the agent should use them to create the actual visual package.
