#!/bin/bash

# Start both Node.js backend and Python YOLO service
# Usage: ./start-with-ai.sh

echo "🚀 Starting Tote Master with AI features..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ to use AI features."
    exit 1
fi

# Check if virtual environment exists for YOLO service
if [ ! -d "python-yolo-service/venv" ]; then
    echo "📦 Creating Python virtual environment..."
    cd python-yolo-service
    python3 -m venv venv
    source venv/bin/activate
    echo "📥 Installing Python dependencies..."
    pip install -r requirements.txt
    deactivate
    cd ..
    echo "✅ Python environment setup complete"
    echo ""
fi

# Start YOLO service in background
echo "🤖 Starting YOLO service on port 8001..."
cd python-yolo-service
source venv/bin/activate
python main.py &
YOLO_PID=$!
deactivate
cd ..

# Wait for YOLO service to start
echo "⏳ Waiting for YOLO service to initialize..."
sleep 3

# Check if YOLO service is running
if curl -s http://localhost:8001/ > /dev/null 2>&1; then
    echo "✅ YOLO service is running (PID: $YOLO_PID)"
else
    echo "⚠️  YOLO service may not be ready yet, but continuing..."
fi

echo ""
echo "🌐 Starting Node.js backend on port 3000..."

# Start Node.js backend (this will run in foreground)
npm run dev

# Cleanup: Kill YOLO service when Node.js exits
echo ""
echo "🛑 Shutting down services..."
kill $YOLO_PID 2>/dev/null
echo "✅ Services stopped"
