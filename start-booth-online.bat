@echo off
rem Opens the booth from Netlify in Chrome kiosk mode. No local server needed.
rem Open it once with internet first: after that it works offline too.
rem To exit the full-screen kiosk: Alt+F4

set "BOOTH_URL=https://codeher-booth.netlify.app/"
set "BOOTH_PROFILE=%LOCALAPPDATA%\CodeHerBooth\chrome-online"

start "" chrome --kiosk --user-data-dir="%BOOTH_PROFILE%" --no-first-run --no-default-browser-check --disable-translate --disable-pinch --overscroll-history-navigation=0 "%BOOTH_URL%"
