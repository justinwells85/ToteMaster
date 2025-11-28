@echo off
REM Start both Node.js backend and Python YOLO service on Windows
REM Usage: start-with-ai.bat

echo Starting Tote Master with AI features...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed. Please install Python 3.8+ to use AI features.
    exit /b 1
)

REM Check if virtual environment exists
if not exist "python-yolo-service\venv" (
    echo Creating Python virtual environment...
    cd python-yolo-service
    python -m venv venv
    call venv\Scripts\activate.bat
    echo Installing Python dependencies...
    pip install -r requirements.txt
    deactivate
    cd ..
    echo Python environment setup complete
    echo.
)

REM Start YOLO service in background
echo Starting YOLO service on port 8001...
cd python-yolo-service
start /B cmd /c "venv\Scripts\activate.bat && python main.py"
cd ..

REM Wait for YOLO service to start
echo Waiting for YOLO service to initialize...
timeout /t 5 /nobreak >nul

REM Check if YOLO service is running
curl -s http://localhost:8001/ >nul 2>&1
if errorlevel 1 (
    echo YOLO service may not be ready yet, but continuing...
) else (
    echo YOLO service is running
)

echo.
echo Starting Node.js backend on port 3000...

REM Start Node.js backend
npm run dev

echo.
echo Services stopped
