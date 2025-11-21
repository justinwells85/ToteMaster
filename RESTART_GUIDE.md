# ToteMaster Server Restart Guide

Quick reference for restarting your ToteMaster development servers.

## Windows

### Option 1: Double-click (Easiest)
Simply double-click **`restart.bat`** in File Explorer

### Option 2: Run from PowerShell
Open PowerShell in the ToteMaster directory and run:

```powershell
.\restart.ps1
```

### Option 3: Right-click context menu
Right-click `restart.ps1` → **Run with PowerShell**

All options will:
- Stop any processes on ports 3000 (backend) and 5173 (frontend)
- Start backend server in a new PowerShell window
- Start frontend server in a new PowerShell window
- Keep the main window open so you can see the status

## Mac/Linux

Run the restart script:

```bash
./restart.sh
```

This will:
- Stop any processes on ports 3000 (backend) and 5173 (frontend)
- Start backend server in a new terminal window
- Start frontend server in a new terminal window

## Manual Restart

If you prefer manual control:

### Backend
```bash
cd backend
npm run dev
```

### Frontend (in a separate terminal)
```bash
cd frontend
npm run dev
```

## After Pulling Code Changes

Always restart both servers after:
- Pulling new code from git
- Switching branches
- Installing new dependencies
- Changing environment variables

The restart scripts will ensure clean server starts with the latest code.

## Troubleshooting

**Port already in use:**
- The restart scripts automatically kill processes on the required ports
- If you still have issues, manually check for processes:
  - Windows: `netstat -ano | findstr :3000`
  - Mac/Linux: `lsof -i :3000`

**Servers won't start:**
- Make sure you've run `npm install` in both backend and frontend directories
- Check that your `.env` file exists in the backend directory
- Check the terminal windows for error messages
