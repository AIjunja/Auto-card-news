param(
  [switch]$NoCodex,
  [switch]$RefreshSources,
  [switch]$PublishApproved,
  [string]$Workspace = "C:\Users\letgo\Documents\New project 2",
  [int]$IntervalMinutes = 60
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$startupDir = [Environment]::GetFolderPath("Startup")
if ([string]::IsNullOrWhiteSpace($startupDir)) {
  throw "Could not resolve Windows Startup folder."
}

$loopScript = Join-Path $Workspace "tools\automation\hermes-hourly-loop.ps1"
if (!(Test-Path -LiteralPath $loopScript)) {
  throw "Loop script not found: $loopScript"
}

$launcherPath = Join-Path $startupDir "AIJJUN-Hermes-Content-Loop.cmd"
$noCodexArg = if ($NoCodex) { " -NoCodex" } else { "" }
$refreshSourcesArg = if ($RefreshSources) { " -RefreshSources" } else { "" }
$publishApprovedArg = if ($PublishApproved) { " -PublishApproved" } else { "" }

$content = @"
@echo off
start "AIJJUN Hermes Content Loop" /min powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$loopScript" -Workspace "$Workspace" -IntervalMinutes $IntervalMinutes$noCodexArg$refreshSourcesArg$publishApprovedArg
"@

Set-Content -LiteralPath $launcherPath -Value $content -Encoding ASCII

Write-Host "Installed Startup launcher: $launcherPath" -ForegroundColor Green
Write-Host "Loop script: $loopScript" -ForegroundColor Cyan
Write-Host "Interval: every $IntervalMinutes minute(s)" -ForegroundColor Cyan
Write-Host "NoCodex: $NoCodex" -ForegroundColor Cyan
Write-Host "RefreshSources: $RefreshSources" -ForegroundColor Cyan
Write-Host "PublishApproved dry-run: $PublishApproved" -ForegroundColor Cyan
