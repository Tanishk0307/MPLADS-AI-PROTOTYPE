@echo off
title Create Lightweight Shareable ZIP
echo ============================================================
echo   Creating Clean Shareable ZIP Package for Friends
echo   (Excluding heavy node_modules and cache directories)
echo ============================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$dest = 'MPLADS_AI_Portal.zip'; ^
   if (Test-Path $dest) { Remove-Item $dest -Force }; ^
   $files = Get-ChildItem -Path . -Exclude 'node_modules', '.git', 'dist', 'MPLADS_AI_Portal.zip', '.system_generated'; ^
   Compress-Archive -Path $files -DestinationPath $dest -CompressionLevel Optimal; ^
   $size = (Get-Item $dest).Length / 1MB; ^
   Write-Host ('[SUCCESS] Created: ' + $dest + ' (' + [math]::Round($size, 2) + ' MB)') -ForegroundColor Green; ^
   Write-Host 'You can now share MPLADS_AI_Portal.zip with your friends!' -ForegroundColor Cyan"

echo.
pause
