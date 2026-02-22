Write-Host "Starting AutoInfra Platform..." -ForegroundColor Green
Write-Host ""

Write-Host "Starting API Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\server'; npm run dev" -WindowStyle Minimized

Start-Sleep -Seconds 3

Write-Host "Starting Frontend..." -ForegroundColor Yellow
Set-Location "client"
npm run dev