@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo   CodeHer booth: http://localhost:8080
echo   Keep this window open while the booth is running.
echo   To exit the full-screen kiosk: Alt+F4
echo.

rem Chrome profile just for the booth, so kiosk mode works even if normal Chrome is open,
rem and the microphone permission is remembered between runs.
set "BOOTH_PROFILE=%LOCALAPPDATA%\CodeHerBooth\chrome"

rem Wait until the server answers, then open Chrome in kiosk mode.
start "" powershell -NoProfile -WindowStyle Hidden -Command ^
  "for ($i = 0; $i -lt 60; $i++) { try { Invoke-WebRequest 'http://localhost:8080' -UseBasicParsing -TimeoutSec 2 | Out-Null; break } catch { Start-Sleep -Milliseconds 500 } };" ^
  "Start-Process chrome -ArgumentList '--kiosk','--user-data-dir=\"%BOOTH_PROFILE%\"','--no-first-run','--no-default-browser-check','--disable-translate','--disable-pinch','--overscroll-history-navigation=0','http://localhost:8080'"

call npx.cmd -y serve -l 8080 .
pause
