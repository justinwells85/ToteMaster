#!/bin/bash
# ToteMaster Restart Script for Unix/Linux/Mac
# This script stops and restarts both backend and frontend servers

echo "===================================="
echo "  ToteMaster Server Restart Script"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to kill processes on a specific port
stop_port() {
    local port=$1
    echo -e "${YELLOW}Checking for processes on port $port...${NC}"

    # Find and kill process on the port
    local pid=$(lsof -ti:$port)

    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}Stopping process $pid on port $port...${NC}"
        kill -9 $pid 2>/dev/null
        sleep 1
        echo -e "${GREEN}Process stopped.${NC}"
    else
        echo -e "No process found on port $port"
    fi
}

# Stop backend (port 3000) and frontend (port 5173)
echo -e "\n${YELLOW}Stopping existing servers...${NC}"
stop_port 3000
stop_port 5173

# Wait a moment for ports to be released
sleep 2

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Start backend server
echo -e "\n${CYAN}-----------------------------------${NC}"
echo -e "${GREEN}Starting Backend Server (port 3000)...${NC}"
echo -e "${CYAN}-----------------------------------${NC}"

cd "$SCRIPT_DIR/backend"

# Check if we're on macOS or Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e "tell app \"Terminal\" to do script \"cd '$SCRIPT_DIR/backend' && npm run dev\""
else
    # Linux - try different terminal emulators
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd '$SCRIPT_DIR/backend' && npm run dev; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "cd '$SCRIPT_DIR/backend' && npm run dev" &
    else
        echo -e "${RED}Could not find a terminal emulator. Running in background...${NC}"
        npm run dev > backend.log 2>&1 &
    fi
fi

echo -e "${GREEN}Backend server starting...${NC}"

# Wait a moment before starting frontend
sleep 2

# Start frontend server
echo -e "\n${CYAN}-----------------------------------${NC}"
echo -e "${GREEN}Starting Frontend Server (port 5173)...${NC}"
echo -e "${CYAN}-----------------------------------${NC}"

cd "$SCRIPT_DIR/frontend"

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e "tell app \"Terminal\" to do script \"cd '$SCRIPT_DIR/frontend' && npm run dev\""
else
    # Linux
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd '$SCRIPT_DIR/frontend' && npm run dev; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "cd '$SCRIPT_DIR/frontend' && npm run dev" &
    else
        npm run dev > frontend.log 2>&1 &
    fi
fi

echo -e "${GREEN}Frontend server starting...${NC}"

# Summary
echo -e "\n${CYAN}====================================${NC}"
echo -e "${GREEN}  Servers Started Successfully!${NC}"
echo -e "${CYAN}====================================${NC}"
echo ""
echo -e "Backend:  ${NC}http://localhost:3000"
echo -e "Frontend: ${NC}http://localhost:5173"
echo ""
echo -e "Check the new terminal windows for server logs."
