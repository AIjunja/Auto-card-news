param(
  [switch]$NoCodex,
  [switch]$RefreshSources,
  [switch]$PublishApproved,
  [switch]$PublishExecute,
  [switch]$SkipFinalReview,
  [string]$PublishPlatform = "all",
  [string]$Workspace = "C:\Users\letgo\Documents\New project 2",
  [string]$Node = "node",
  [int]$IntervalMinutes = 60,
  [int]$PollIntervalSeconds = 15
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"

chcp 65001 | Out-Null
[Console]::InputEncoding = [System.Text.UTF8Encoding]::new()
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [System.Text.UTF8Encoding]::new()

Set-Location -LiteralPath $Workspace

$logDir = Join-Path $Workspace "carousel-workspace"
$logPath = Join-Path $logDir "hermes-hourly-loop.log"
$runner = Join-Path $Workspace "tools\automation\hermes-local-run.ps1"
$orchestrator = Join-Path $Workspace "tools\automation\hermes-content-orchestrator.mjs"

if (!(Test-Path -LiteralPath $logDir)) {
  New-Item -ItemType Directory -Force -Path $logDir | Out-Null
}

function Write-HermesLog {
  param([string]$Message)
  $line = "[{0}] {1}" -f (Get-Date).ToString("yyyy-MM-dd HH:mm:ss"), $Message
  Add-Content -LiteralPath $logPath -Value $line -Encoding UTF8
  Write-Host $line
}

function Invoke-HermesCommand {
  param(
    [string]$FilePath,
    [string[]]$Arguments
  )

  & $FilePath @Arguments 2>&1 | ForEach-Object {
    Add-Content -LiteralPath $logPath -Value ([string]$_) -Encoding UTF8
  }
  return $LASTEXITCODE
}

Write-HermesLog "AIJJUN Hermes hourly loop started. Workspace=$Workspace NoCodex=$NoCodex RefreshSources=$RefreshSources PublishApproved=$PublishApproved PublishExecute=$PublishExecute PublishPlatform=$PublishPlatform IntervalMinutes=$IntervalMinutes"

while ($true) {
  try {
    $args = @(
      "-NoProfile",
      "-ExecutionPolicy", "Bypass",
      "-File", $runner,
      "-Workspace", $Workspace,
      "-Node", $Node
    )

    if ($NoCodex) {
      $args += "-NoCodex"
    }
    if ($RefreshSources) {
      $args += "-RefreshSources"
    }
    if ($PublishApproved) {
      $args += "-PublishApproved"
      $args += "-PublishPlatform"
      $args += $PublishPlatform
    }
    if ($PublishExecute) {
      $args += "-PublishExecute"
    }
    if ($SkipFinalReview) {
      $args += "-SkipFinalReview"
    }

    Write-HermesLog "Running Hermes local pass..."
    $exitCode = Invoke-HermesCommand -FilePath "powershell.exe" -Arguments $args
    if ($exitCode -ne 0) {
      Write-HermesLog "Hermes local pass failed with exit code $exitCode."
    } else {
      Write-HermesLog "Hermes local pass completed."
    }
  } catch {
    Write-HermesLog "Hermes loop error: $($_.Exception.Message)"
  }

  Write-HermesLog "Sleeping for $IntervalMinutes minute(s), polling Telegram every $PollIntervalSeconds second(s)."
  $nextRunAt = (Get-Date).AddMinutes($IntervalMinutes)
  while ((Get-Date) -lt $nextRunAt) {
    try {
      $exitCode = Invoke-HermesCommand -FilePath $Node -Arguments @($orchestrator, "--telegram-poll")
      if ($exitCode -ne 0) {
        Write-HermesLog "Telegram poll failed with exit code $exitCode."
      }
    } catch {
      Write-HermesLog "Telegram poll error: $($_.Exception.Message)"
    }

    $remainingSeconds = [int]([Math]::Max(1, ($nextRunAt - (Get-Date)).TotalSeconds))
    Start-Sleep -Seconds ([Math]::Min($PollIntervalSeconds, $remainingSeconds))
  }
}
