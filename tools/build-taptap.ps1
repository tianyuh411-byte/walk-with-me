$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$releaseRoot = Join-Path $projectRoot 'release/taptap'
$stageRoot = Join-Path $releaseRoot 'h5-stage'
$gameRoot = Join-Path $stageRoot 'game'
New-Item -ItemType Directory -Path $gameRoot -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $projectRoot 'index.html') -Destination $gameRoot -Force
foreach ($folder in @('js','css')) { Copy-Item -LiteralPath (Join-Path $projectRoot $folder) -Destination $gameRoot -Recurse -Force }
New-Item -ItemType Directory -Path (Join-Path $gameRoot 'assets') -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $projectRoot 'assets/icon.svg') -Destination (Join-Path $gameRoot 'assets') -Force
$zip = Join-Path $releaseRoot 'walk-with-me-h5-1.0.0.zip'
Compress-Archive -LiteralPath $gameRoot -DestinationPath $zip -Force
Get-FileHash -LiteralPath $zip -Algorithm SHA256 | Select-Object Hash,Path
