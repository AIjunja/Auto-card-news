param(
  [switch]$NoCodex,
  [switch]$RefreshSources,
  [switch]$PublishApproved,
  [switch]$PublishExecute,
  [switch]$SkipFinalReview,
  [string]$PublishPlatform = "all",
  [string]$Node = "node",
  [string]$Workspace = "C:\Users\letgo\Documents\New project 2"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

chcp 65001 | Out-Null
[Console]::InputEncoding = [System.Text.UTF8Encoding]::new()
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [System.Text.UTF8Encoding]::new()

Set-Location -LiteralPath $Workspace

$orchestrator = "tools\automation\hermes-content-orchestrator.mjs"
$envFile = "carousel-workspace\hermes-content.env"

function Invoke-HermesNode {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments
  )

  & $Node @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed with exit code ${LASTEXITCODE}: $Node $($Arguments -join ' ')"
  }
}

if (!(Test-Path -LiteralPath $envFile)) {
  Invoke-HermesNode @($orchestrator, "--init")
  Write-Host "Created $envFile. Fill TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID, then rerun." -ForegroundColor Yellow
  exit 1
}

$envText = Get-Content -Raw -LiteralPath $envFile
$telegramToken = [regex]::Match($envText, "(?m)^TELEGRAM_BOT_TOKEN=(.+)$").Groups[1].Value.Trim()
$telegramChatId = [regex]::Match($envText, "(?m)^TELEGRAM_CHAT_ID=(.+)$").Groups[1].Value.Trim()
$sourceOnlyAutopilot = [regex]::IsMatch($envText, "(?mi)^HERMES_SOURCE_ONLY_AUTOPILOT=(1|true|yes|on)$")

if ([string]::IsNullOrWhiteSpace($telegramToken)) {
  Write-Host "Missing TELEGRAM_BOT_TOKEN in $envFile." -ForegroundColor Yellow
  Write-Host "Create a bot with @BotFather, put the token in the env file, then run:" -ForegroundColor Yellow
  Write-Host "node tools\automation\hermes-telegram-check.mjs" -ForegroundColor Cyan
  exit 1
}

if ([string]::IsNullOrWhiteSpace($telegramChatId)) {
  Write-Host "Missing TELEGRAM_CHAT_ID in $envFile." -ForegroundColor Yellow
  Write-Host "Send any message to your Telegram bot, then run:" -ForegroundColor Yellow
  Write-Host "node tools\automation\hermes-telegram-check.mjs" -ForegroundColor Cyan
  Write-Host "node tools\automation\hermes-telegram-check.mjs --write-chat-id <chat-id>" -ForegroundColor Cyan
  exit 1
}

Write-Host "[Hermes] Poll Telegram commands..." -ForegroundColor Cyan
Invoke-HermesNode @($orchestrator, "--telegram-poll")

if ($NoCodex) {
  Write-Host "[Hermes] Run safe hourly pass without Codex execution..." -ForegroundColor Cyan
  $hourlyArgs = @($orchestrator, "--hourly-once", "--skip-queue-validation")
  if ($SkipFinalReview) {
    $hourlyArgs += "--skip-final-review"
  }
  Invoke-HermesNode $hourlyArgs
} else {
  if ($sourceOnlyAutopilot) {
    Write-Host "[Hermes] Run hourly pass with Codex final execution only. Source-only autopilot is enabled." -ForegroundColor Cyan
    $hourlyArgs = @($orchestrator, "--hourly-once", "--run-codex", "--skip-queue-validation")
  } else {
    Write-Host "[Hermes] Run hourly pass with Codex draft/final execution..." -ForegroundColor Cyan
    $hourlyArgs = @($orchestrator, "--hourly-once", "--run-draft-codex", "--run-codex", "--skip-queue-validation")
  }
  if ($RefreshSources) {
    $hourlyArgs += "--refresh-sources"
  }
  if ($SkipFinalReview) {
    $hourlyArgs += "--skip-final-review"
  }
  Invoke-HermesNode $hourlyArgs
}

if ($PublishApproved) {
  if ($PublishExecute) {
    Write-Host "[Hermes] Publish upload-approved items. Platform=$PublishPlatform" -ForegroundColor Cyan
    Invoke-HermesNode @($orchestrator, "--publish-approved", "--platform", $PublishPlatform, "--execute")
  } else {
    Write-Host "[Hermes] Build dry-run publish plan for upload-approved items. Platform=$PublishPlatform" -ForegroundColor Cyan
    Invoke-HermesNode @($orchestrator, "--publish-approved", "--platform", $PublishPlatform)
  }
}

Write-Host "[Hermes] Poll Telegram commands again..." -ForegroundColor Cyan
Invoke-HermesNode @($orchestrator, "--telegram-poll")

Write-Host "[Hermes] Done." -ForegroundColor Green
