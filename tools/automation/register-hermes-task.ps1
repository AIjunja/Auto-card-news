param(
  [string]$TaskName = "AIJJUN Hermes Content Loop",
  [int]$RepeatMinutes = 60,
  [switch]$NoCodex,
  [switch]$RefreshSources,
  [switch]$PublishApproved,
  [switch]$PublishExecute,
  [switch]$SkipFinalReview,
  [string]$PublishPlatform = "both",
  [string]$Workspace = "C:\Users\letgo\Documents\New project 2"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$runner = Join-Path $Workspace "tools\automation\hermes-local-run.ps1"
if (!(Test-Path -LiteralPath $runner)) {
  throw "Runner not found: $runner"
}

$argumentParts = @(
  "-NoProfile",
  "-ExecutionPolicy", "Bypass",
  "-File", "`"$runner`"",
  "-Workspace", "`"$Workspace`""
)

if ($NoCodex) {
  $argumentParts += "-NoCodex"
}
if ($RefreshSources) {
  $argumentParts += "-RefreshSources"
}
if ($PublishApproved) {
  $argumentParts += "-PublishApproved"
  $argumentParts += "-PublishPlatform"
  $argumentParts += "`"$PublishPlatform`""
}
if ($PublishExecute) {
  $argumentParts += "-PublishExecute"
}
if ($SkipFinalReview) {
  $argumentParts += "-SkipFinalReview"
}

$action = New-ScheduledTaskAction `
  -Execute "powershell.exe" `
  -Argument ($argumentParts -join " ")

$logonTrigger = New-ScheduledTaskTrigger -AtLogOn
$repeatTrigger = New-ScheduledTaskTrigger `
  -Once `
  -At (Get-Date).AddMinutes(2) `
  -RepetitionInterval (New-TimeSpan -Minutes $RepeatMinutes) `
  -RepetitionDuration (New-TimeSpan -Days 3650)

$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -MultipleInstances IgnoreNew

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger @($logonTrigger, $repeatTrigger) `
  -Settings $settings `
  -Description "AI JJUN Hermes source review, Codex content generation, Telegram approval loop." `
  -Force | Out-Null

Write-Host "Registered scheduled task: $TaskName" -ForegroundColor Green
Write-Host "Runner: $runner" -ForegroundColor Cyan
Write-Host "Repeat: every $RepeatMinutes minute(s), plus at logon." -ForegroundColor Cyan
Write-Host "RefreshSources: $RefreshSources / PublishApproved dry-run: $PublishApproved / PublishExecute: $PublishExecute / PublishPlatform: $PublishPlatform / SkipFinalReview: $SkipFinalReview / NoCodex: $NoCodex" -ForegroundColor Cyan
