param([switch]$SkipCompile)
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$releaseRoot = Join-Path $projectRoot 'release'
$desktopRoot = Join-Path $releaseRoot 'Walk-With-Me-Windows-x64'
$gameRoot = Join-Path $desktopRoot 'game'
$sdkVersion = '1.0.4314.35'
$sdkRoot = Join-Path $PSScriptRoot "vendor/webview2-$sdkVersion"
$sdkZip = Join-Path $PSScriptRoot "vendor/webview2-$sdkVersion.zip"
if (!(Test-Path -LiteralPath $sdkRoot)) {
    New-Item -ItemType Directory -Path (Join-Path $PSScriptRoot 'vendor') -Force | Out-Null
    if (!(Test-Path -LiteralPath $sdkZip)) {
        Invoke-WebRequest -Uri "https://api.nuget.org/v3-flatcontainer/microsoft.web.webview2/$sdkVersion/microsoft.web.webview2.$sdkVersion.nupkg" -OutFile $sdkZip
    }
    Expand-Archive -LiteralPath $sdkZip -DestinationPath $sdkRoot -Force
}
New-Item -ItemType Directory -Path $gameRoot -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $projectRoot 'index.html') -Destination $gameRoot -Force
foreach ($folder in @('js','css','assets')) {
    Copy-Item -LiteralPath (Join-Path $projectRoot $folder) -Destination $gameRoot -Recurse -Force
}
$core = Join-Path $sdkRoot 'lib/net462/Microsoft.Web.WebView2.Core.dll'
$forms = Join-Path $sdkRoot 'lib/net462/Microsoft.Web.WebView2.WinForms.dll'
$compiler = Join-Path $env:WINDIR 'Microsoft.NET/Framework64/v4.0.30319/csc.exe'
$exe = Join-Path $desktopRoot 'Walk With Me.exe'
if (!$SkipCompile) {
    Copy-Item -LiteralPath $core,$forms -Destination $desktopRoot -Force
    Copy-Item -LiteralPath (Join-Path $sdkRoot 'runtimes/win-x64/native/WebView2Loader.dll') -Destination $desktopRoot -Force
    if (!(Test-Path -LiteralPath $compiler)) { throw '.NET Framework C# compiler not found. Build on Windows with .NET Framework 4.8 installed.' }
    & $compiler /nologo /target:winexe /platform:x64 /optimize+ /r:System.Windows.Forms.dll /r:System.Drawing.dll /r:$core /r:$forms "/win32icon:$(Join-Path $projectRoot 'assets/icon.ico')" "/out:$exe" (Join-Path $PSScriptRoot 'DesktopHost.cs')
    if ($LASTEXITCODE -ne 0) { throw 'Windows compilation failed' }
} elseif (!(Test-Path -LiteralPath $exe)) { throw '-SkipCompile needs an existing, already built desktop executable.' }
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'DesktopHost.exe.config') -Destination (Join-Path $desktopRoot 'Walk With Me.exe.config') -Force
foreach ($file in @('README-WINDOWS.txt','CREDITS.md')) { Copy-Item -LiteralPath (Join-Path $projectRoot $file) -Destination $desktopRoot -Force }
Copy-Item -LiteralPath (Join-Path $sdkRoot 'LICENSE.txt') -Destination (Join-Path $desktopRoot 'WEBVIEW2-LICENSE.txt') -Force
Copy-Item -LiteralPath (Join-Path $sdkRoot 'NOTICE.txt') -Destination (Join-Path $desktopRoot 'WEBVIEW2-NOTICE.txt') -Force
$desktopZip = Join-Path $releaseRoot 'Walk-With-Me-Windows-x64.zip'
Compress-Archive -LiteralPath $desktopRoot -DestinationPath $desktopZip -Force
# Browser ZIP has index.html at its root; it is supplementary to the actual Windows build.
$webZip = Join-Path $releaseRoot 'Walk-With-Me-Browser.zip'
Compress-Archive -Path (Join-Path $gameRoot '*') -DestinationPath $webZip -Force
$sourceZip = Join-Path $releaseRoot 'Walk-With-Me-Source.zip'
$sourceFiles = @('index.html','package.json','README.md','README-WINDOWS.txt','CREDITS.md','.gitignore','js','css','assets','tests','docs') | ForEach-Object { Join-Path $projectRoot $_ }
$sourceStage = Join-Path $releaseRoot 'source-package'
New-Item -ItemType Directory -Path $sourceStage -Force | Out-Null
foreach ($item in $sourceFiles) { Copy-Item -LiteralPath $item -Destination $sourceStage -Recurse -Force }
$sourceTools = Join-Path $sourceStage 'tools'
New-Item -ItemType Directory -Path $sourceTools -Force | Out-Null
Get-ChildItem -LiteralPath $PSScriptRoot -File | Copy-Item -Destination $sourceTools -Force
Compress-Archive -Path (Join-Path $sourceStage '*') -DestinationPath $sourceZip -Force
Get-FileHash -LiteralPath $desktopZip,$webZip,$sourceZip -Algorithm SHA256 | ForEach-Object { "$($_.Hash)  $([IO.Path]::GetFileName($_.Path))" } | Set-Content -LiteralPath (Join-Path $releaseRoot 'SHA256SUMS.txt') -Encoding ascii
Get-Item -LiteralPath $desktopZip,$webZip,$sourceZip | Select-Object Name,Length
