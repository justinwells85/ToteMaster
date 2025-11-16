@echo off
REM ToteMaster Development Server Startup Script for Windows
REM This script starts both the backend API and frontend development servers

echo.
echo Starting ToteMaster Development Servers...
echo.

REM Check if .NET is installed
where dotnet >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] .NET SDK not found. Please install .NET 10.0 SDK first.
    pause
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo [OK] Prerequisites found
echo.

REM Start the backend API in new window
echo Starting Backend API...
start "ToteMaster API" cmd /k "cd ToteMasterAPI && dotnet run --urls http://0.0.0.0:5000"

REM Wait for API to start
timeout /t 5 /nobreak >nul

REM Start the frontend dev server in new window
echo Starting Frontend Dev Server...
start "ToteMaster Frontend" cmd /k "cd frontend && npm run dev -- --host 0.0.0.0"

echo.
echo ToteMaster is starting!
echo.
echo   Backend API:  http://localhost:5000
echo   Frontend:     http://localhost:5173
echo.
echo Two new windows have been opened for the servers.
echo Close those windows to stop the servers.
echo.
pause
