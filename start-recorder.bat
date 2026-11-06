@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Voice recorder for the Patience challenge. Recordings are saved to assets\voices
rem Keep this window open while recording. Close it when you're done.
start "" powershell -NoProfile -WindowStyle Hidden -Command ^
  "for ($i = 0; $i -lt 40; $i++) { try { Invoke-WebRequest 'http://127.0.0.1:8099/tools/recorder.html' -UseBasicParsing -TimeoutSec 2 | Out-Null; break } catch { Start-Sleep -Milliseconds 500 } }; Start-Process chrome 'http://127.0.0.1:8099/tools/recorder.html'"
node tools\voice-server.js
pause
