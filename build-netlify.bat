@echo off
chcp 65001 >nul
cd /d "%~dp0"

rem Builds a clean "netlify-site" folder with only the website files
rem (no README, notes, launcher or local settings), ready to drag onto Netlify.

set "OUT=netlify-site"
if exist "%OUT%" rmdir /s /q "%OUT%"
mkdir "%OUT%"

for %%F in (index.html sw.js manifest.webmanifest _headers) do copy /y "%%F" "%OUT%\" >nul
for %%D in (css js fonts assets tips) do robocopy "%%D" "%OUT%\%%D" /E /NFL /NDL /NJH /NJS /NP >nul

echo.
echo   Ready: the "%OUT%" folder.
echo   Drag it onto https://app.netlify.com/drop  (sign in first so the site is kept)
echo.
pause
