@echo off
echo Starting AutoInfra Platform...
echo.

echo Starting API Server in background...
start /min "AutoInfra API" cmd /c "cd server && npm run dev"

timeout /t 5 /nobreak >nul

echo Starting Frontend...
cd client && npm run dev