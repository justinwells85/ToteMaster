# ToteMaster Deployment Guide

This guide walks you through deploying ToteMaster on a Windows machine for access over your home network.

## Prerequisites

- Windows 10/11 or Windows Server
- .NET 10.0 SDK installed
- Node.js 18+ installed
- Administrator access for firewall configuration

## Step-by-Step Deployment

### 1. Prepare the Application

Clone or download the repository to your Windows machine:

```powershell
git clone https://github.com/justinwells85/ToteMaster.git
cd ToteMaster
```

### 2. Build the Frontend

```powershell
cd frontend
npm install
npm run build
cd ..
```

The production build will be in `frontend/dist/`

### 3. Configure the Backend

You can serve the frontend static files directly from the backend.

**Option A: Serve Static Files (Recommended)**

1. Copy the built frontend to a public folder:
```powershell
New-Item -ItemType Directory -Force -Path ToteMasterAPI\wwwroot
Copy-Item -Recurse -Force frontend\dist\* ToteMasterAPI\wwwroot\
```

2. Update `ToteMasterAPI/Program.cs` to serve static files:
```csharp
app.UseStaticFiles();
app.UseDefaultFiles();
```

**Option B: Use a Reverse Proxy (Advanced)**

Configure IIS or Nginx to serve the frontend and proxy API requests.

### 4. Configure Network Access

#### Find Your IP Address

```powershell
ipconfig
```

Look for your IPv4 address (e.g., `192.168.1.100`)

#### Configure Application

Update `ToteMasterAPI/appsettings.json`:

```json
{
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=totemaster.db"
  },
  "Urls": "http://0.0.0.0:5000"
}
```

#### Configure Windows Firewall

Open PowerShell as Administrator and run:

```powershell
# Allow incoming connections on port 5000
New-NetFirewallRule -DisplayName "ToteMaster API" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
```

### 5. Run as Windows Service (Production)

For production use, configure ToteMaster to run as a Windows Service.

#### Install as Service

1. Publish the application:
```powershell
cd ToteMasterAPI
dotnet publish -c Release -o C:\ToteMaster
```

2. Install as Windows Service using `sc.exe`:
```powershell
sc.exe create ToteMaster binPath="C:\ToteMaster\ToteMasterAPI.exe" start=auto
```

3. Start the service:
```powershell
sc.exe start ToteMaster
```

#### Alternative: Use NSSM (Non-Sucking Service Manager)

Download NSSM from https://nssm.cc/

```powershell
# Install service
nssm install ToteMaster "C:\ToteMaster\ToteMasterAPI.exe"

# Set startup directory
nssm set ToteMaster AppDirectory "C:\ToteMaster"

# Set to start automatically
nssm set ToteMaster Start SERVICE_AUTO_START

# Start the service
nssm start ToteMaster
```

### 6. Access the Application

From any device on your home network:

```
http://[YOUR_IP_ADDRESS]:5000
```

For example: `http://192.168.1.100:5000`

### 7. Optional: Set Up a Custom Domain

#### Using Windows Hosts File (Local Only)

Edit `C:\Windows\System32\drivers\etc\hosts`:
```
192.168.1.100  totemaster.local
```

Access via: `http://totemaster.local:5000`

#### Using Your Router's DNS (Network-wide)

Configure DNS settings in your router to point `totemaster.local` to your server's IP.

## Maintenance

### Backup Database

The SQLite database is stored as `totemaster.db` in the application directory.

```powershell
# Create backup
Copy-Item totemaster.db "backups\totemaster-$(Get-Date -Format 'yyyyMMdd-HHmmss').db"
```

### Update Application

1. Stop the service
2. Pull latest changes or download new version
3. Rebuild and publish
4. Restart the service

### View Logs

If running as a service, logs are in the Windows Event Viewer:
- Open Event Viewer
- Navigate to Windows Logs → Application
- Filter for source: ToteMaster

## Troubleshooting

### Service Won't Start

Check Event Viewer for errors. Common issues:
- Missing .NET runtime
- Port already in use
- Insufficient permissions
- Database file locked

### Can't Access from Other Devices

1. Verify firewall rules are active:
```powershell
Get-NetFirewallRule -DisplayName "ToteMaster*"
```

2. Test port is listening:
```powershell
netstat -an | findstr :5000
```

3. Verify service is running:
```powershell
Get-Service ToteMaster
```

### Database Issues

If database gets corrupted:
1. Stop the service
2. Delete `totemaster.db`
3. Restore from backup or let application create new database
4. Start the service

## Security Considerations

- This setup is designed for home network use only
- Do NOT expose directly to the internet without proper security measures
- For internet access, use a VPN or properly secured reverse proxy
- Consider enabling HTTPS for production use
- Implement authentication if multiple users will access the system

## Advanced Configuration

### Enable HTTPS

1. Generate or obtain SSL certificate
2. Update `appsettings.json`:
```json
{
  "Kestrel": {
    "Endpoints": {
      "Https": {
        "Url": "https://0.0.0.0:5001",
        "Certificate": {
          "Path": "certificate.pfx",
          "Password": "your-password"
        }
      }
    }
  }
}
```

### Performance Tuning

For better performance:
- Use SSD for database storage
- Increase connection pool size in connection string
- Configure Kestrel limits in `appsettings.json`

### Monitoring

Set up monitoring using:
- Windows Performance Monitor
- Application Insights (optional)
- Custom logging to file

## Support

For issues or questions, please open an issue on GitHub.
