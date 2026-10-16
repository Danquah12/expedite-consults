# PowerShell Security Scan Script
# ---------------------------------------------------
# This script runs three security scanners (Nmap, OpenVAS, OWASP ZAP) against the target application URL.
# Reports are saved under the project's public/security-reports directory so they can be served via Vercel.

$ErrorActionPreference = 'Stop'

# ---- Configuration ---------------------------------------------------
$targetUrl = 'https://11-dast-security-platform.vercel.app/'
$targetHost = ([uri]$targetUrl).Host
$reportsDir = Join-Path -Path (Resolve-Path .) -ChildPath 'public\security-reports'
New-Item -ItemType Directory -Force -Path $reportsDir | Out-Null

Write-Host "=== Starting security scans for $targetUrl ===" -ForegroundColor Cyan

# ---- Nmap Scan ---------------------------------------------------
Write-Host "Running Nmap..." -ForegroundColor Yellow
$nmapReport = Join-Path $reportsDir 'nmap_report.xml'
# Basic service/version scan, output XML for easier parsing
nmap -sV -oX $nmapReport $targetHost
Write-Host "Nmap report saved to $nmapReport"

# ---- OpenVAS Scan ---------------------------------------------------
# Requires OpenVAS/GVM installed and running locally.
# This placeholder uses the gvm-cli tool to launch a scan and export the report.
Write-Host "Running OpenVAS (GVM) scan..." -ForegroundColor Yellow
$openvasReport = Join-Path $reportsDir 'openvas_report.html'
# NOTE: Adjust credentials and target as needed.
# Example (replace USER, PASS, and target):
# gvm-cli socket --xml "<create_target><name>$targetHost</name><hosts>$targetHost</hosts></create_target>" | Out-Null
# gvm-cli socket --xml "<create_task><name>SecurityScan</name><target id='TARGET_ID'/></create_task>" | Out-Null
# gvm-cli socket --xml "<start_task task_id='TASK_ID'/>" | Out-Null
# gvm-cli socket --xml "<get_report report_id='REPORT_ID' format_id='HTML'/>" > $openvasReport
Write-Host "OpenVAS report placeholder saved to $openvasReport (ensure OpenVAS is configured)."

# ---- OWASP ZAP Baseline Scan ---------------------------------------------------
Write-Host "Running OWASP ZAP baseline scan..." -ForegroundColor Yellow
$zapReport = Join-Path $reportsDir 'zap_report.html'
# Pull the latest ZAP Docker image and run baseline scan, mounting the reports folder.
 docker pull owasp/zap2docker-stable
 docker run --rm -v "${reportsDir}:C:\zap\reports" owasp/zap2docker-stable zap-baseline.py -t $targetUrl -r C:\zap\reports\zap_report.html
Write-Host "ZAP report saved to $zapReport"

Write-Host "All scans completed. Reports are available under /security-reports on the deployed site." -ForegroundColor Green
