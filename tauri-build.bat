@echo off
set PATH=%PATH%;%USERPROFILE%\.cargo\bin
call npm run build
call npx tauri build

