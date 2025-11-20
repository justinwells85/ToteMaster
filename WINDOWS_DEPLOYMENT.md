# Windows Deployment Setup Guide

This guide will help you set up automatic deployments from GitHub to your Windows machine on your home network.

## Prerequisites

✅ You have already installed:
- **Docker Desktop** for Windows
- **Git** for Windows

You will need to install:
- **GitHub Actions Self-Hosted Runner**

## Overview

The deployment system works like this:

1. You push code to GitHub
2. GitHub Actions triggers the deployment workflow
3. The workflow runs on a self-hosted runner on your Windows machine
4. The runner pulls the latest code and deploys using Docker Compose
5. Your application is now running at `http://localhost`

## Step 1: Configure Environment Variables

### 1.1 Backend Production Environment

Copy the example file and configure it:

```powershell
cd backend
copy .env.production.example .env.production
```

Edit `backend/.env.production` and set secure values:

```env
NODE_ENV=production
PORT=3000
LOG_LEVEL=INFO

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=totemaster
DB_USER=totemaster
DB_PASSWORD=YOUR_SECURE_PASSWORD_HERE  # ⚠️ CHANGE THIS!

# Authentication Configuration
JWT_SECRET=YOUR_LONG_RANDOM_STRING_HERE  # ⚠️ CHANGE THIS!
JWT_EXPIRES_IN=7d
```

**Security Tips:**
- Use a strong database password (at least 16 characters, random)
- Generate a random JWT secret (at least 32 characters)
- Never commit `.env.production` to git (it's already in `.gitignore`)

### 1.2 Root Environment File

Copy the example file:

```powershell
copy .env.example .env
```

The default values should work fine:

```env
VITE_API_URL=http://localhost:3000/api
NODE_ENV=production
PORT=3000
LOG_LEVEL=INFO
```

If your Windows machine has a specific IP on your network and you want to access it from other devices, change `localhost` to your machine's IP address.

## Step 2: Test Manual Deployment

Before setting up GitHub Actions, test that deployment works manually.

### 2.1 Open PowerShell as Administrator

Right-click PowerShell and select "Run as Administrator"

### 2.2 Navigate to Your Project

```powershell
cd C:\path\to\ToteMaster
```

### 2.3 Run the Deployment Script

```powershell
.\deploy-windows.ps1
```

This script will:
1. Check if Docker is running
2. Stop any existing containers
3. Build the Docker images
4. Start the containers
5. Run database migrations

### 2.4 Verify Deployment

Open your browser and go to:
- Frontend: http://localhost
- Backend API: http://localhost:3000/

If everything works, you're ready to set up automated deployments!

## Step 3: Set Up GitHub Actions Self-Hosted Runner

A self-hosted runner allows GitHub Actions to run jobs directly on your Windows machine.

### 3.1 Navigate to Your GitHub Repository

1. Go to https://github.com/justinwells85/ToteMaster
2. Click **Settings** (top right)
3. In the left sidebar, click **Actions** → **Runners**
4. Click **New self-hosted runner**
5. Select **Windows** as the operating system
6. Select **x64** as the architecture

### 3.2 Download and Extract the Runner

GitHub will show you commands to run. Follow them in PowerShell (as Administrator):

```powershell
# Create a folder for the runner
mkdir C:\actions-runner
cd C:\actions-runner

# Download the runner (GitHub provides the exact download link)
Invoke-WebRequest -Uri https://github.com/actions/runner/releases/download/vX.XXX.X/actions-runner-win-x64-X.XXX.X.zip -OutFile actions-runner-win-x64-X.XXX.X.zip

# Extract the installer
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory("$PWD\actions-runner-win-x64-X.XXX.X.zip", "$PWD")
```

### 3.3 Configure the Runner

Run the configuration script (GitHub provides a token-specific URL):

```powershell
.\config.cmd --url https://github.com/justinwells85/ToteMaster --token YOUR_TOKEN_HERE
```

When prompted:
- **Runner name**: Press Enter (default: your computer name)
- **Runner group**: Press Enter (default)
- **Labels**: Press Enter (default: self-hosted,Windows,X64)
- **Work folder**: Press Enter (default: _work)

### 3.4 Install and Start the Runner as a Service

This ensures the runner starts automatically when Windows boots:

```powershell
# Install as a Windows service
.\svc.sh install

# Start the service
.\svc.sh start

# Check status
.\svc.sh status
```

**Alternative: Run Interactively** (not recommended for always-on deployments)

If you prefer to run the runner only when needed:

```powershell
.\run.cmd
```

Keep this window open. Press Ctrl+C to stop.

### 3.5 Verify Runner is Connected

1. Go back to GitHub → Settings → Actions → Runners
2. You should see your runner listed with a green "Idle" status
3. ✅ Success! Your runner is ready

## Step 4: Deploy from GitHub Actions

### 4.1 Manual Deployment (Recommended First Time)

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Click **Deploy to Windows** workflow
4. Click **Run workflow** button
5. Select branch (usually `main`)
6. Select environment (`production`)
7. Click **Run workflow**

### 4.2 Monitor the Deployment

1. Click on the running workflow
2. Click on the job to see live logs
3. Watch as it builds and deploys your application

### 4.3 Verify Deployment

Once complete, check:
- Frontend: http://localhost (or your Windows machine IP)
- Backend: http://localhost:3000

## Step 5: Enable Automatic Deployments (Optional)

To deploy automatically on every push to `main`:

Edit `.github/workflows/deploy-windows.yml` and uncomment these lines:

```yaml
on:
  workflow_dispatch:
    # ... existing config ...

  # Uncomment these lines:
  push:
    branches:
      - main
```

Commit and push this change. Now every push to `main` will automatically deploy!

## Useful Commands

### Docker Management

```powershell
# View running containers
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Stop services
docker-compose -f docker-compose.prod.yml down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose -f docker-compose.prod.yml down -v

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

### Runner Management

```powershell
# Check runner status
cd C:\actions-runner
.\svc.sh status

# Stop runner service
.\svc.sh stop

# Start runner service
.\svc.sh start

# Restart runner service
.\svc.sh stop
.\svc.sh start

# Uninstall runner service
.\svc.sh uninstall
```

### Manual Deployment

```powershell
# Full deployment (rebuild images)
.\deploy-windows.ps1

# Quick deployment (use existing images)
.\deploy-windows.ps1 -NoBuild

# Deploy and show logs
.\deploy-windows.ps1 -ShowLogs
```

## Accessing from Other Devices

To access your application from other devices on your home network:

### 1. Find Your Windows Machine IP

```powershell
ipconfig
```

Look for "IPv4 Address" under your active network adapter (usually something like 192.168.1.X)

### 2. Update Environment Variables

Edit `.env` in the root directory:

```env
VITE_API_URL=http://192.168.1.X:3000/api
```

Replace `192.168.1.X` with your actual IP address.

### 3. Configure Windows Firewall

Allow incoming connections on ports 80 and 3000:

```powershell
# Allow port 80 (Frontend)
New-NetFirewallRule -DisplayName "ToteMaster Frontend" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# Allow port 3000 (Backend)
New-NetFirewallRule -DisplayName "ToteMaster Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### 4. Access from Other Devices

From any device on your home network:
- Frontend: http://192.168.1.X
- Backend: http://192.168.1.X:3000

## Troubleshooting

### Runner Not Showing Up in GitHub

1. Check if the service is running:
   ```powershell
   cd C:\actions-runner
   .\svc.sh status
   ```

2. If not running, start it:
   ```powershell
   .\svc.sh start
   ```

3. Check the runner logs:
   ```powershell
   cd C:\actions-runner
   Get-Content _diag\Runner_*.log -Tail 50
   ```

### Deployment Fails

1. Check Docker is running:
   ```powershell
   docker info
   ```

2. Check container logs:
   ```powershell
   docker-compose -f docker-compose.prod.yml logs
   ```

3. Try manual deployment to see detailed errors:
   ```powershell
   .\deploy-windows.ps1
   ```

### Cannot Access from Browser

1. Check containers are running:
   ```powershell
   docker-compose -f docker-compose.prod.yml ps
   ```

2. Check if ports are accessible:
   ```powershell
   Test-NetConnection -ComputerName localhost -Port 80
   Test-NetConnection -ComputerName localhost -Port 3000
   ```

3. Check Windows Firewall rules

### Database Connection Issues

1. Check PostgreSQL container is running:
   ```powershell
   docker-compose -f docker-compose.prod.yml ps postgres
   ```

2. Check database logs:
   ```powershell
   docker-compose -f docker-compose.prod.yml logs postgres
   ```

3. Verify credentials in `backend/.env.production` match those in `docker-compose.prod.yml`

## Security Considerations

### For Home Network Only

If you're only accessing from your home network:
- ✅ You're good! No additional security needed
- Your Windows machine is behind your router's NAT
- Not accessible from the internet

### For Internet Access (Advanced)

If you want to access from outside your home network:

⚠️ **Not recommended without proper security setup:**

1. Set up HTTPS with Let's Encrypt/Certbot
2. Use a reverse proxy (nginx/Caddy)
3. Implement rate limiting
4. Keep all software updated
5. Use strong passwords
6. Consider using Cloudflare Tunnel or Tailscale instead

## Backup and Restore

### Backup Database

```powershell
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U totemaster totemaster > backup.sql

# Or with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U totemaster totemaster > backup_$timestamp.sql
```

### Restore Database

```powershell
# Stop backend to prevent conflicts
docker-compose -f docker-compose.prod.yml stop backend

# Restore from backup
Get-Content backup.sql | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U totemaster totemaster

# Restart backend
docker-compose -f docker-compose.prod.yml start backend
```

## Next Steps

1. ✅ Set up your first deployment
2. ✅ Test accessing from other devices on your network
3. 📱 Consider building the mobile app (React Native)
4. 📸 Add photo upload functionality
5. 🏷️ Implement barcode/QR code scanning

## Getting Help

If you run into issues:

1. Check the logs using commands above
2. Review the GitHub Actions workflow logs
3. Check Docker Desktop for container status
4. Open an issue on GitHub with error details

---

**Congratulations!** You now have a fully automated deployment pipeline to your Windows machine! 🎉
