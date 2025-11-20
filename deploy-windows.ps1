# ToteMaster Windows Deployment Script
# This script can be run manually on your Windows machine to deploy the application

param(
    [switch]$NoBuild,
    [switch]$ShowLogs,
    [string]$ComposeFile = "docker-compose.prod.yml"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ToteMaster Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if .env files exist
Write-Host "`nChecking environment files..." -ForegroundColor Yellow

if (-Not (Test-Path "backend\.env.production")) {
    Write-Host "! backend/.env.production not found" -ForegroundColor Yellow
    if (Test-Path "backend\.env.production.example") {
        Write-Host "  Creating from example..." -ForegroundColor Yellow
        Copy-Item "backend\.env.production.example" "backend\.env.production"
        Write-Host "  ⚠ IMPORTANT: Edit backend/.env.production and set:" -ForegroundColor Red
        Write-Host "    - DB_PASSWORD (secure password)" -ForegroundColor Red
        Write-Host "    - JWT_SECRET (long random string)" -ForegroundColor Red
        Write-Host ""
        $continue = Read-Host "Have you configured backend/.env.production? (y/n)"
        if ($continue -ne "y") {
            Write-Host "Deployment cancelled. Please configure backend/.env.production first." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✗ backend/.env.production.example not found!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ backend/.env.production exists" -ForegroundColor Green
}

if (-Not (Test-Path ".env")) {
    Write-Host "! .env not found in root" -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Write-Host "  Creating from example..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "✓ Created .env" -ForegroundColor Green
    }
} else {
    Write-Host "✓ .env exists" -ForegroundColor Green
}

# Stop existing containers
Write-Host "`nStopping existing containers..." -ForegroundColor Yellow
docker-compose -f $ComposeFile down
Write-Host "✓ Containers stopped" -ForegroundColor Green

# Build images
if (-Not $NoBuild) {
    Write-Host "`nBuilding Docker images..." -ForegroundColor Yellow
    docker-compose -f $ComposeFile build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Images built successfully" -ForegroundColor Green
} else {
    Write-Host "`nSkipping build (using existing images)..." -ForegroundColor Yellow
}

# Start containers
Write-Host "`nStarting containers..." -ForegroundColor Yellow
docker-compose -f $ComposeFile up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to start containers!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Containers started" -ForegroundColor Green

# Wait for services
Write-Host "`nWaiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check container status
Write-Host "`nContainer Status:" -ForegroundColor Yellow
docker-compose -f $ComposeFile ps

# Run migrations
Write-Host "`nRunning database migrations..." -ForegroundColor Yellow
docker-compose -f $ComposeFile exec -T backend npm run migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ Migrations may have failed (this might be OK if already run)" -ForegroundColor Yellow
} else {
    Write-Host "✓ Migrations completed" -ForegroundColor Green
}

# Deployment complete
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services are now running:" -ForegroundColor White
Write-Host "  Frontend: http://localhost" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Database: localhost:5432" -ForegroundColor Cyan
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  View logs:        docker-compose -f $ComposeFile logs -f" -ForegroundColor White
Write-Host "  Stop services:    docker-compose -f $ComposeFile down" -ForegroundColor White
Write-Host "  Restart services: docker-compose -f $ComposeFile restart" -ForegroundColor White
Write-Host "  View status:      docker-compose -f $ComposeFile ps" -ForegroundColor White
Write-Host ""

if ($ShowLogs) {
    Write-Host "Showing logs (press Ctrl+C to exit)..." -ForegroundColor Yellow
    docker-compose -f $ComposeFile logs -f
}
