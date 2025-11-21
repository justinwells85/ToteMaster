#!/bin/bash
# ToteMaster Update and Restart Script for Unix/Linux/Mac
# This script pulls latest code, installs dependencies, and restarts servers

echo "===================================="
echo "  ToteMaster Update & Restart"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to kill processes on a specific port
stop_port() {
    local port=$1
    echo -e "${YELLOW}Checking for processes on port $port...${NC}"

    local pid=$(lsof -ti:$port)

    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}Stopping process $pid on port $port...${NC}"
        kill -9 $pid 2>/dev/null
        sleep 1
        echo -e "${GREEN}Process stopped.${NC}"
    else
        echo "No process found on port $port"
    fi
}

# Step 1: Stop running servers
echo -e "\n${CYAN}-----------------------------------${NC}"
echo -e "${YELLOW}Step 1: Stopping servers...${NC}"
echo -e "${CYAN}-----------------------------------${NC}"
stop_port 3000
stop_port 5173
sleep 1

# Step 2: Git pull
echo -e "\n${CYAN}-----------------------------------${NC}"
echo -e "${YELLOW}Step 2: Pulling latest code...${NC}"
echo -e "${CYAN}-----------------------------------${NC}"

# Check current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "Current branch: ${CURRENT_BRANCH}"

# Fetch all changes
echo -e "Fetching from remote..."
git fetch --all

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Git fetch failed${NC}"
    exit 1
fi

# Pull latest changes
echo -e "Pulling latest changes..."
git pull origin $CURRENT_BRANCH

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Git pull failed. You may have uncommitted changes.${NC}"
    echo -e "${YELLOW}Run 'git status' to check your working directory.${NC}"
    exit 1
fi

echo -e "${GREEN}Code updated successfully!${NC}"

# Step 3: Check if npm install is needed
echo -e "\n${CYAN}-----------------------------------${NC}"
echo -e "${YELLOW}Step 3: Checking dependencies...${NC}"
echo -e "${CYAN}-----------------------------------${NC}"

# Check backend dependencies
echo -e "Checking backend dependencies..."
cd "$SCRIPT_DIR/backend"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Backend npm install failed${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}Backend dependencies OK${NC}"
fi

# Check frontend dependencies
echo -e "Checking frontend dependencies..."
cd "$SCRIPT_DIR/frontend"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Frontend npm install failed${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}Frontend dependencies OK${NC}"
fi

# Return to project root
cd "$SCRIPT_DIR"

# Step 4: Start servers
echo -e "\n${CYAN}-----------------------------------${NC}"
echo -e "${GREEN}Step 4: Starting servers...${NC}"
echo -e "${CYAN}-----------------------------------${NC}"

# Start backend server
echo -e "${YELLOW}Starting backend server...${NC}"

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e "tell app \"Terminal\" to do script \"cd '$SCRIPT_DIR/backend' && npm run dev\""
else
    # Linux
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
sleep 2

# Start frontend server
echo -e "${YELLOW}Starting frontend server...${NC}"

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
echo -e "${GREEN}  Update Complete!${NC}"
echo -e "${CYAN}====================================${NC}"
echo ""
echo -e "${GREEN}✓ Code updated from git${NC}"
echo -e "${GREEN}✓ Dependencies checked${NC}"
echo -e "${GREEN}✓ Servers restarted${NC}"
echo ""
echo -e "Backend:  ${NC}http://localhost:3000"
echo -e "Frontend: ${NC}http://localhost:5173"
echo ""
echo -e "Check the new terminal windows for server logs."
