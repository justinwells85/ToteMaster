# ToteMaster Restart Script for Windows
# This script stops and restarts both backend and frontend servers

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  ToteMaster Server Restart Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Function to kill processes on a specific port
function Stop-ProcessOnPort {
    param($Port)

    Write-Host "Checking for processes on port $Port..." -ForegroundColor Yellow

    $connections = netstat -ano | Select-String ":$Port\s" | Select-String "LISTENING"

    if ($connections) {
        $connections | ForEach-Object {
            $line = $_.Line
            $pid = ($line -split '\s+')[-1]

            if ($pid -and $pid -ne "0") {
                try {
                    Write-Host "Stopping process $pid on port $Port..." -ForegroundColor Yellow
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    Start-Sleep -Milliseconds 500
                    Write-Host "Process stopped." -ForegroundColor Green
                } catch {
                    Write-Host "Could not stop process $pid" -ForegroundColor Red
                }
            }
        }
    } else {
        Write-Host "No process found on port $Port" -ForegroundColor Gray
    }
}

# Stop backend (port 3000) and frontend (port 5173)
Write-Host "`nStopping existing servers..." -ForegroundColor Yellow
Stop-ProcessOnPort -Port 3000
Stop-ProcessOnPort -Port 5173

# Wait a moment for ports to be released
Start-Sleep -Seconds 2

# Start backend server
Write-Host "`n-----------------------------------" -ForegroundColor Cyan
Write-Host "Starting Backend Server (port 3000)..." -ForegroundColor Green
Write-Host "-----------------------------------" -ForegroundColor Cyan

try {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev" -WindowStyle Normal
    Write-Host "Backend server starting in new window..." -ForegroundColor Green
} catch {
    Write-Host "Error starting backend: $_" -ForegroundColor Red
    exit 1
}

# Wait a moment before starting frontend
Start-Sleep -Seconds 2

# Start frontend server
Write-Host "`n-----------------------------------" -ForegroundColor Cyan
Write-Host "Starting Frontend Server (port 5173)..." -ForegroundColor Green
Write-Host "-----------------------------------" -ForegroundColor Cyan

try {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal
    Write-Host "Frontend server starting in new window..." -ForegroundColor Green
} catch {
    Write-Host "Error starting frontend: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n====================================" -ForegroundColor Cyan
Write-Host "  Servers Started Successfully!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Check the new PowerShell windows for server logs." -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Yellow
Read-Host
