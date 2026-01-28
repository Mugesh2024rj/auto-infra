@echo off
echo Starting AutoInfra Platform...
echo.

echo Starting API Server...
cd server
start /min cmd /c \"npm run dev\"
cd ..

echo Waiting for server to start...
timeout /t 5 /nobreak >nul

echo Starting Frontend...
cd client
npm run dev