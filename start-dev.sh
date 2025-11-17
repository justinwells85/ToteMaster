#!/bin/bash

# ToteMaster Development Server Startup Script
# This script starts both the backend API and frontend development servers

echo "🏠 Starting ToteMaster Development Servers..."
echo ""

# Check if .NET is installed
if ! command -v dotnet &> /dev/null; then
    echo "❌ .NET SDK not found. Please install .NET 10.0 SDK first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Prerequisites found"
echo ""

# Start the backend API in background
echo "🚀 Starting Backend API..."
cd ToteMasterAPI
dotnet run --urls "http://0.0.0.0:5000" &
API_PID=$!
cd ..

# Wait for API to start
sleep 5

# Start the frontend dev server
echo "🚀 Starting Frontend Dev Server..."
cd frontend
npm run dev -- --host 0.0.0.0 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✨ ToteMaster is running!"
echo ""
echo "   Backend API:  http://localhost:5000"
echo "   Frontend:     http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $API_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap SIGINT (Ctrl+C) and cleanup
trap cleanup SIGINT

# Wait for both processes
wait
