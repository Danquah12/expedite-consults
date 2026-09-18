# Expedite Platforms Launcher
$root = "d:\Anti-gravity\expedite-consults\platforms"
$platforms = @(
    @{ name = "05-sast-platform"; port = 9005 },
    @{ name = "06-sca-platform"; port = 9006 },
    @{ name = "07-secrets-platform"; port = 9007 },
    @{ name = "08-container-security-platform"; port = 9008 },
    @{ name = "09-k8s-security-platform"; port = 9009 },
    @{ name = "10-iac-security-platform"; port = 9010 },
    @{ name = "11-dast-security-platform"; port = 9011 },
    @{ name = "12-api-security-platform"; port = 9012 },
    @{ name = "13-mobile-security-platform"; port = 9013 },
    @{ name = "14-exploitability-platform"; port = 9014 },
    @{ name = "15-threat-modeling-platform"; port = 9015 },
    @{ name = "16-malware-analysis-platform"; port = 9016 },
    @{ name = "17-ransomware-recovery-platform"; port = 9017 },
    @{ name = "18-unified-integration-layer"; port = 9018 },
    @{ name = "19-cloud-security-platform"; port = 9019 }
)

Write-Host "Select an option:" -ForegroundColor Cyan
Write-Host "1. Start Platforms 9010-9019"
Write-Host "2. Start All Platforms (9005-9019)"
Write-Host "3. Start Main Expedite App (3000)"
Write-Host "4. Stop All Running Servers"
$choice = Read-Host "Enter choice (1-4)"

if ($choice -eq "1") {
    $platforms | Where-Object { $_.port -ge 9010 -and $_.port -le 9019 } | ForEach-Object {
        $pPath = Join-Path $root $_.name
        Write-Host "Starting $($_.name) on http://localhost:$($_.port)..." -ForegroundColor Green
        Start-Process "cmd.exe" -ArgumentList "/k cd /d `"$pPath`" && npm run dev"
    }
} elseif ($choice -eq "2") {
    $platforms | ForEach-Object {
        $pPath = Join-Path $root $_.name
        Write-Host "Starting $($_.name) on http://localhost:$($_.port)..." -ForegroundColor Green
        Start-Process "cmd.exe" -ArgumentList "/k cd /d `"$pPath`" && npm run dev"
    }
} elseif ($choice -eq "3") {
    Start-Process "cmd.exe" -ArgumentList "/k cd /d `"d:\Anti-gravity\expedite-consults\expedite-consults`" && npm run dev"
} elseif ($choice -eq "4") {
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Write-Host "All Node processes stopped." -ForegroundColor Yellow
}
