# Quick Start: Windows Deployment

This is a condensed guide to get you up and running quickly. For detailed instructions, see [WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md).

## Prerequisites

✅ Docker Desktop installed
✅ Git for Windows installed

## Step 1: Configure Environment (5 minutes)

```powershell
# Copy environment files
copy backend\.env.production.example backend\.env.production
copy .env.example .env

# ⚠️ IMPORTANT: Edit backend/.env.production
# Set DB_PASSWORD and JWT_SECRET to secure random values
notepad backend\.env.production
```

## Step 2: Test Manual Deployment (5 minutes)

```powershell
# Run deployment script
.\deploy-windows.ps1

# Access your app
# Frontend: http://localhost
# Backend: http://localhost:3000
```

## Step 3: Set Up GitHub Actions Runner (10 minutes)

### 3.1 Get Runner Token

1. Go to https://github.com/justinwells85/ToteMaster
2. Settings → Actions → Runners → New self-hosted runner
3. Select Windows x64

### 3.2 Install Runner

```powershell
# Create folder
mkdir C:\actions-runner
cd C:\actions-runner

# Download (use URL from GitHub)
Invoke-WebRequest -Uri <GITHUB_PROVIDED_URL> -OutFile actions-runner.zip
Expand-Archive -Path actions-runner.zip -DestinationPath .

# Configure (use token from GitHub)
.\config.cmd --url https://github.com/justinwells85/ToteMaster --token <YOUR_TOKEN>

# Install as service
.\svc.sh install
.\svc.sh start
```

### 3.3 Verify

Go to GitHub → Settings → Actions → Runners
✅ You should see your runner with green "Idle" status

## Step 4: Deploy from GitHub (2 minutes)

1. Go to your repo → Actions tab
2. Click "Deploy to Windows"
3. Click "Run workflow"
4. Watch it deploy!

## Done! 🎉

Your app is now running at:
- Frontend: http://localhost
- Backend: http://localhost:3000

## Common Commands

```powershell
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Stop services
docker-compose -f docker-compose.prod.yml down

# Manual deployment
.\deploy-windows.ps1
```

## Access from Other Devices

1. Find your Windows IP:
   ```powershell
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   ```

2. Update `.env`:
   ```env
   VITE_API_URL=http://192.168.1.100:3000/api
   ```

3. Allow firewall:
   ```powershell
   New-NetFirewallRule -DisplayName "ToteMaster" -Direction Inbound -LocalPort 80,3000 -Protocol TCP -Action Allow
   ```

4. Access from any device on your network:
   - http://192.168.1.100

## Troubleshooting

**Docker not running?**
```powershell
# Start Docker Desktop
```

**Runner not working?**
```powershell
cd C:\actions-runner
.\svc.sh status
.\svc.sh start
```

**Can't access app?**
```powershell
# Check containers
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs
```

## Next Steps

- ✅ Deploy from GitHub Actions
- 📱 Access from other devices on your network
- 📖 Read [WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md) for advanced features
- 🔒 Set up regular backups (see full guide)

---

**Total Setup Time: ~20 minutes**

Need help? See [WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md) for detailed troubleshooting.
