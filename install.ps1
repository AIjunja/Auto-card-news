$ErrorActionPreference = "Stop"

$autoCardNewsRepoUrl = "https://github.com/AIjunja/Auto-card-news.git"
$autoCardNewsRepoZip = "https://github.com/AIjunja/Auto-card-news/archive/refs/heads/master.zip"
$last30DaysRepoUrl = "https://github.com/mvanhorn/last30days-skill.git"
$last30DaysRepoZip = "https://github.com/mvanhorn/last30days-skill/archive/refs/heads/main.zip"
$last30DaysSkillPath = "skills/last30days"

$tempRoot = Join-Path $env:TEMP ("auto-card-news-" + [System.Guid]::NewGuid().ToString("N"))
$autoCardNewsZipPath = Join-Path $tempRoot "auto-card-news.zip"
$last30DaysZipPath = Join-Path $tempRoot "last30days-skill.zip"
$autoCardNewsExtractPath = Join-Path $tempRoot "auto-card-news-repo"
$last30DaysExtractPath = Join-Path $tempRoot "last30days-repo"
$autoCardNewsClonePath = Join-Path $tempRoot "auto-card-news"
$last30DaysClonePath = Join-Path $tempRoot "last30days-skill"

if ($env:CODEX_HOME) {
    $codexHome = $env:CODEX_HOME
} else {
    $codexHome = Join-Path $env:USERPROFILE ".codex"
}

$skillsDir = Join-Path $codexHome "skills"

function Get-ZipRoot {
    param (
        [string]$Uri,
        [string]$ZipPath,
        [string]$ExtractPath
    )

    Invoke-WebRequest -Uri $Uri -OutFile $ZipPath
    Expand-Archive -LiteralPath $ZipPath -DestinationPath $ExtractPath -Force

    return Get-ChildItem -Path $ExtractPath -Directory |
        Select-Object -First 1 |
        ForEach-Object { $_.FullName }
}

function Install-SkillFromPath {
    param (
        [string]$Source,
        [string]$SkillName
    )

    $dest = Join-Path $skillsDir $SkillName

    if (-not (Test-Path (Join-Path $Source "SKILL.md"))) {
        throw "Could not find $SkillName skill in downloaded repository."
    }

    if (Test-Path $dest) {
        Remove-Item -Recurse -Force -LiteralPath $dest
    }

    Copy-Item -Recurse -Force -LiteralPath $Source -Destination $dest
    Write-Host "Installed $SkillName to $dest"
}

New-Item -ItemType Directory -Force $tempRoot | Out-Null
New-Item -ItemType Directory -Force $skillsDir | Out-Null

try {
    $git = Get-Command git -ErrorAction SilentlyContinue
    if ($git) {
        git clone --depth 1 $autoCardNewsRepoUrl $autoCardNewsClonePath | Out-Null
        git clone --depth 1 $last30DaysRepoUrl $last30DaysClonePath | Out-Null

        $autoCardNewsSkillsRoot = Join-Path $autoCardNewsClonePath "skills"
        $autoCardNewsSkillSource = Join-Path $autoCardNewsSkillsRoot "auto-card-news"
        $autoMotionNewsSkillSource = Join-Path $autoCardNewsSkillsRoot "auto-motion-news"
        $aiJjuunContentEngineSkillSource = Join-Path $autoCardNewsSkillsRoot "ai-jjuun-content-engine"
        $last30DaysSkillSource = Join-Path $last30DaysClonePath $last30DaysSkillPath
    } else {
        $autoCardNewsRepoRoot = Get-ZipRoot -Uri $autoCardNewsRepoZip -ZipPath $autoCardNewsZipPath -ExtractPath $autoCardNewsExtractPath
        $last30DaysRepoRoot = Get-ZipRoot -Uri $last30DaysRepoZip -ZipPath $last30DaysZipPath -ExtractPath $last30DaysExtractPath

        $autoCardNewsSkillsRoot = Join-Path $autoCardNewsRepoRoot "skills"
        $autoCardNewsSkillSource = Join-Path $autoCardNewsSkillsRoot "auto-card-news"
        $autoMotionNewsSkillSource = Join-Path $autoCardNewsSkillsRoot "auto-motion-news"
        $aiJjuunContentEngineSkillSource = Join-Path $autoCardNewsSkillsRoot "ai-jjuun-content-engine"
        $last30DaysSkillSource = Join-Path $last30DaysRepoRoot $last30DaysSkillPath
    }

    Install-SkillFromPath -Source $autoCardNewsSkillSource -SkillName "auto-card-news"
    Install-SkillFromPath -Source $autoMotionNewsSkillSource -SkillName "auto-motion-news"
    Install-SkillFromPath -Source $aiJjuunContentEngineSkillSource -SkillName "ai-jjuun-content-engine"
    Install-SkillFromPath -Source $last30DaysSkillSource -SkillName "last30days"

    Write-Host "Restart Codex to pick up new skills."
}
finally {
    if (Test-Path $tempRoot) {
        Remove-Item -Recurse -Force -LiteralPath $tempRoot
    }
}
