$ErrorActionPreference = "Stop"

$VPS_USER = "admins"
$VPS_IP = "192.210.239.211"
$REMOTE_DIR = "/home/admins/eatumy-stack"

Write-Host "🚀 Deploying Full Stack Eatumy to VPS ($VPS_IP)..." -ForegroundColor Cyan

# 1. Create Remote Directory
Write-Host "Creating remote directory..."
ssh $VPS_USER@$VPS_IP "mkdir -p $REMOTE_DIR"

# 2. Archive Project (excluding heavy folders)
Write-Host "Compressing source code..."
if (Test-Path deployment.tar.gz) { Remove-Item deployment.tar.gz }
# Use built-in tar on Windows
tar -czf deployment.tar.gz --exclude=node_modules --exclude=.git --exclude=.next --exclude=dist --exclude=.vscode --exclude=deployment.tar.gz .

if ($LASTEXITCODE -ne 0) { Write-Error "Failed to create archive."; exit 1 }

# 3. Upload Archive
Write-Host "Uploading archive to VPS..."
scp deployment.tar.gz "${VPS_USER}@${VPS_IP}:${REMOTE_DIR}/deployment.tar.gz"

if ($LASTEXITCODE -ne 0) { Write-Error "SCP upload failed."; exit 1 }

# Cleanup local archive
Remove-Item deployment.tar.gz

# 4. Deploy on VPS
Write-Host "Building and Running Docker on VPS..."
$DEPLOY_CMD = "cd $REMOTE_DIR && tar -xzf deployment.tar.gz && rm deployment.tar.gz && docker-compose down && docker-compose up -d --build --force-recreate"

ssh $VPS_USER@$VPS_IP $DEPLOY_CMD

Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "🌐 Backend API: http://192.210.239.211:5999" -ForegroundColor Green
Write-Host "🌐 Admin Panel: http://192.210.239.211:3998" -ForegroundColor Green
Write-Host "🌐 Shareholder App: http://192.210.239.211:3999" -ForegroundColor Green
