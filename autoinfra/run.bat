@echo off
echo 🚀 Starting AutoInfra Development Mode...

echo 🔧 Starting API Server...
start "AutoInfra API" cmd /k "cd server && npm run dev"

echo ⏳ Waiting for API to start...
timeout /t 5 /nobreak >nul

echo 🎨 Starting Frontend...
start "AutoInfra Frontend" cmd /k "cd client && npm run dev"

echo.
echo 🎉 AutoInfra is starting!
echo.
echo 📱 Access:
echo    Frontend: http://localhost:3000
echo    API:      http://localhost:5000
echo.
echo 🔑 Login:
echo    Email:    admin@autoinfra.com
echo    Password: admin123
echo.

timeout /t 3 /nobreak >nul
start http://localhost:3000

echo Press any key to exit...
pause >nul