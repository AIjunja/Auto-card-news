param(
  [Parameter(Mandatory = $true)]
  [string]$Url,
  [string]$Title = "",
  [string]$Summary = "",
  [string]$Angle = "",
  [string]$Workspace = "C:\Users\letgo\Documents\New project 2",
  [string]$Node = "node"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

chcp 65001 | Out-Null
[Console]::InputEncoding = [System.Text.UTF8Encoding]::new()
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [System.Text.UTF8Encoding]::new()

Set-Location -LiteralPath $Workspace

$orchestrator = "tools\automation\hermes-content-orchestrator.mjs"
$args = @(
  $orchestrator,
  "--add-source-url", $Url,
  "--source-send"
)

if (![string]::IsNullOrWhiteSpace($Title)) {
  $args += @("--title", $Title)
}
if (![string]::IsNullOrWhiteSpace($Summary)) {
  $args += @("--summary", $Summary)
}
if (![string]::IsNullOrWhiteSpace($Angle)) {
  $args += @("--angle", $Angle)
}

& $Node @args
if ($LASTEXITCODE -ne 0) {
  throw "Hermes manual source intake failed with exit code $LASTEXITCODE."
}
