# Add Rust to PATH and build Tauri exe
$env:Path += ";$env:USERPROFILE\.cargo\bin"
npm run build
npm run tauri:build

Write-Host "`n✅ Build complete! Your exe is in: src-tauri\target\release\billsub-timeline.exe" -ForegroundColor Green

