$src = "C:\Users\Ajay saini\.gemini\antigravity\scratch\librax\standalone\index.html"
$desktopDir = [Environment]::GetFolderPath('Desktop')
$downloadsDir = Join-Path $env:USERPROFILE "Downloads"

$desktopZip = Join-Path $desktopDir "librax-netlify.zip"
$downloadsZip = Join-Path $downloadsDir "librax-netlify.zip"
$scratchZip = "C:\Users\Ajay saini\.gemini\antigravity\scratch\librax\librax-netlify.zip"

$desktopFolder = Join-Path $desktopDir "librax-netlify"
if (-not (Test-Path $desktopFolder)) { New-Item -ItemType Directory -Path $desktopFolder -Force | Out-Null }
Copy-Item $src -Destination (Join-Path $desktopFolder "index.html") -Force

# Create Desktop index.html directly
Copy-Item $src -Destination (Join-Path $desktopDir "index.html") -Force

# Create ZIP with index.html at root
if (Test-Path $desktopZip) { Remove-Item $desktopZip -Force }
Compress-Archive -Path $src -DestinationPath $desktopZip -Force
Copy-Item $desktopZip -Destination $downloadsZip -Force
Copy-Item $desktopZip -Destination $scratchZip -Force

Write-Host "Netlify deployment files created successfully:"
Write-Host "1. Desktop ZIP: $desktopZip"
Write-Host "2. Desktop Folder: $desktopFolder (contains index.html)"
Write-Host "3. Downloads ZIP: $downloadsZip"
Write-Host "4. Desktop direct file: $(Join-Path $desktopDir 'index.html')"
Write-Host "ZIP Size: $((Get-Item $desktopZip).Length) bytes"

