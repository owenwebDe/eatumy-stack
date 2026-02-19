$ErrorActionPreference = "Stop"

$VPS_USER = "admins"
$VPS_IP = "192.210.239.211"
$REMOTE_DIR = "/home/admins/backend"

Write-Host "Deploying Backend to VPS ($VPS_IP)..." -ForegroundColor Cyan

# 1. Create Remote Directory
Write-Host "Creating remote directory..."
ssh $VPS_USER@$VPS_IP "mkdir -p $REMOTE_DIR"

# 2. Upload Files
Write-Host "Uploading source code..."
tar -czf deployment.tar.gz --exclude=node_modules --exclude=.git --exclude=dist .
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to create tar."; exit 1 }

scp deployment.tar.gz "${VPS_USER}@${VPS_IP}:${REMOTE_DIR}/deployment.tar.gz"
if ($LASTEXITCODE -ne 0) { Write-Error "SCP upload failed."; exit 1 }

Remove-Item deployment.tar.gz

# 3. Build & Deploy
Write-Host "Building and Running Docker on VPS..."
$DEPLOY_CMD = "cd $REMOTE_DIR && tar -xzf deployment.tar.gz && rm deployment.tar.gz && docker-compose down && docker-compose up -d --build"

ssh $VPS_USER@$VPS_IP $DEPLOY_CMD

Write-Host "🌐 Backend API live at http://$VPS_IP:5000" -ForegroundColor Green
