$ErrorActionPreference = "Stop"

$repoUrl = "https://github.com/AIjunja/Auto-card-news.git"
$repoZip = "https://github.com/AIjunja/Auto-card-news/archive/refs/heads/master.zip"
$tempRoot = Join-Path $env:TEMP ("auto-card-news-" + [System.Guid]::NewGuid().ToString("N"))
$zipPath = Join-Path $tempRoot "auto-card-news.zip"
$extractPath = Join-Path $tempRoot "repo"
$clonePath = Join-Path $tempRoot "clone"

if ($env:CODEX_HOME) {
    $codexHome = $env:CODEX_HOME
} else {
    $codexHome = Join-Path $env:USERPROFILE ".codex"
}

$skillsDir = Join-Path $codexHome "skills"
$skillNames = @("auto-card-news")

New-Item -ItemType Directory -Force $tempRoot | Out-Null
New-Item -ItemType Directory -Force $skillsDir | Out-Null

try {
    $git = Get-Command git -ErrorAction SilentlyContinue
    if ($git) {
        git clone --depth 1 $repoUrl $clonePath | Out-Null
        $skillsSourceRoot = Join-Path $clonePath "skills"
    } else {
        Invoke-WebRequest -Uri $repoZip -OutFile $zipPath
        Expand-Archive -LiteralPath $zipPath -DestinationPath $extractPath -Force

        $repoRoot = Get-ChildItem -Path $extractPath -Directory |
            Select-Object -First 1 |
            ForEach-Object { $_.FullName }
        $skillsSourceRoot = Join-Path $repoRoot "skills"
    }

    foreach ($skillName in $skillNames) {
        $source = Join-Path $skillsSourceRoot $skillName
        $dest = Join-Path $skillsDir $skillName

        if (-not (Test-Path (Join-Path $source "SKILL.md"))) {
            throw "Could not find $skillName skill in downloaded repository."
        }

        if (Test-Path $dest) {
            Remove-Item -Recurse -Force -LiteralPath $dest
        }

        Copy-Item -Recurse -Force -LiteralPath $source -Destination $dest
        Write-Host "Installed $skillName to $dest"
    }
    Write-Host "Restart Codex to pick up new skills."
}
finally {
    if (Test-Path $tempRoot) {
        Remove-Item -Recurse -Force -LiteralPath $tempRoot
    }
}
