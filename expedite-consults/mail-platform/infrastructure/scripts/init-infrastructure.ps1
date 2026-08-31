# ==============================================================================
# One-Click Stack Initialization for Windows (PowerShell)
# ==============================================================================

Write-Host "==> [1/3] Starting containerized email infrastructure..." -ForegroundColor Cyan
docker compose -f docker-compose.yml up -d postgres redis minio mailpit

Write-Host "==> [2/3] Waiting for PostgreSQL readiness..." -ForegroundColor Cyan
Start-Sleep -Seconds 4

Write-Host "==> [3/3] Infrastructure is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Access Points:" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------"
Write-Host "  • PostgreSQL:    localhost:5432 (Database: mailserver, User: mailuser)"
Write-Host "  • Redis:         localhost:6379"
Write-Host "  • MinIO Console: http://localhost:9001 (User: minioadmin / Pass: minioadminpassword123)"
Write-Host "  • Mailpit UI:    http://localhost:8025 (Mock SMTP Web Inbox)"
Write-Host "  • SMTP Ingress:  localhost:1025"
Write-Host "--------------------------------------------------------"
