# ToteMaster Update and Restart Script for Windows
# This script pulls latest code, installs dependencies, and restarts servers

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  ToteMaster Update & Restart" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path

# Change to project directory
Set-Location $SCRIPT_DIR

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

# Step 1: Stop running servers
Write-Host "`n-----------------------------------" -ForegroundColor Cyan
Write-Host "Step 1: Stopping servers..." -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Cyan
Stop-ProcessOnPort -Port 3000
Stop-ProcessOnPort -Port 5173
Start-Sleep -Seconds 1

# Step 2: Git pull
Write-Host "`n-----------------------------------" -ForegroundColor Cyan
Write-Host "Step 2: Pulling latest code..." -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Cyan

# Check current branch
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $currentBranch" -ForegroundColor Gray

# Fetch all changes
Write-Host "Fetching from remote..." -ForegroundColor Gray
git fetch --all

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Git fetch failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    Read-Host
    exit 1
}

# Pull latest changes
Write-Host "Pulling latest changes..." -ForegroundColor Gray
git pull origin $currentBranch

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Git pull failed. You may have uncommitted changes." -ForegroundColor Red
    Write-Host "Run 'git status' to check your working directory." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    Read-Host
    exit 1
}

Write-Host "Code updated successfully!" -ForegroundColor Green

# Step 3: Check if npm install is needed
Write-Host "`n-----------------------------------" -ForegroundColor Cyan
Write-Host "Step 3: Checking dependencies..." -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Cyan

# Check backend dependencies
Write-Host "Checking backend dependencies..." -ForegroundColor Gray
Set-Location "$SCRIPT_DIR\backend"

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Backend npm install failed" -ForegroundColor Red
        Write-Host ""
        Write-Host "Press any key to exit..." -ForegroundColor Yellow
        Read-Host
        exit 1
    }
} else {
    Write-Host "Backend dependencies OK" -ForegroundColor Green
}

# Check frontend dependencies
Write-Host "Checking frontend dependencies..." -ForegroundColor Gray
Set-Location "$SCRIPT_DIR\frontend"

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Frontend npm install failed" -ForegroundColor Red
        Write-Host ""
        Write-Host "Press any key to exit..." -ForegroundColor Yellow
        Read-Host
        exit 1
    }
} else {
    Write-Host "Frontend dependencies OK" -ForegroundColor Green
}

# Return to project root
Set-Location $SCRIPT_DIR

# Step 4: Start servers
Write-Host "`n-----------------------------------" -ForegroundColor Cyan
Write-Host "Step 4: Starting servers..." -ForegroundColor Green
Write-Host "-----------------------------------" -ForegroundColor Cyan

# Start backend server
Write-Host "Starting backend server..." -ForegroundColor Yellow
try {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$SCRIPT_DIR\backend'; npm run dev" -WindowStyle Normal
    Write-Host "Backend server starting in new window..." -ForegroundColor Green
} catch {
    Write-Host "Error starting backend: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    Read-Host
    exit 1
}

Start-Sleep -Seconds 2

# Start frontend server
Write-Host "Starting frontend server..." -ForegroundColor Yellow
try {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$SCRIPT_DIR\frontend'; npm run dev" -WindowStyle Normal
    Write-Host "Frontend server starting in new window..." -ForegroundColor Green
} catch {
    Write-Host "Error starting frontend: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    Read-Host
    exit 1
}

# Summary
Write-Host "`n====================================" -ForegroundColor Cyan
Write-Host "  Update Complete!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Code updated from git" -ForegroundColor Green
Write-Host "✓ Dependencies checked" -ForegroundColor Green
Write-Host "✓ Servers restarted" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Check the new PowerShell windows for server logs." -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Yellow
Read-Host
