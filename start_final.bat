@echo off
echo ===================================================
echo   FINAL FIX: Starting from Safe Folder
echo ===================================================
echo.
echo 1. Moving to safe folder: C:\Users\HomePC\ncip-app-safe
cd /d "C:\Users\HomePC\ncip-app-safe"
echo.
echo 2. Installing dependencies (this happens once)...
call npm install
echo.
echo 3. Starting App...
npm run dev
pause
