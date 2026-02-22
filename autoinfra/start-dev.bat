@echo off
echo 🚀 Starting AutoInfra in Development Mode (No Docker)

echo 📦 Installing dependencies...

REM Install server dependencies
cd server
if not exist node_modules (
    echo Installing server dependencies...
    npm install
)

REM Install client dependencies  
cd ..\client
if not exist node_modules (
    echo Installing client dependencies...
    npm install
)

cd ..

echo 🗄️ Starting PostgreSQL (you need to install PostgreSQL locally)
echo    Download from: https://www.postgresql.org/download/windows/
echo    Create database: autoinfra
echo    User: postgres, Password: password

echo 🔧 Starting services...

REM Start API server
start "AutoInfra API" cmd /k "cd server && npm run dev"

REM Wait a bit
timeout /t 3 /nobreak >nul

REM Start frontend
start "AutoInfra Frontend" cmd /k "cd client && npm run dev"

echo.
echo 🎉 AutoInfra Development Mode Started!
echo.
echo 📱 Access:
echo    Frontend: http://localhost:3000
echo    API:      http://localhost:5000
echo.
echo 🔑 Default Login:
echo    Email:    admin@autoinfra.com  
echo    Password: admin123
echo.

timeout /t 5 /nobreak >nul
start http://localhost:3000

pause