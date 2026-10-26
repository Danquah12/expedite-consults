# PowerShell wrapper to run a DAST scanner and automatically process its report
# ---------------------------------------------------------------
# 1️⃣  Configure the scanner command (replace with your real scanner)
# ---------------------------------------------------------------
$scannerCmd = "# TODO: replace with actual scanner command that writes JSON report"
# Example placeholder that just writes our test report file:
#   echo '[{"scanner":"ZAP","finding":"Clickjacking","targetUrl":"http://localhost:8000/clickjacking-lab-01.html"}]' > $reportPath

# ---------------------------------------------------------------
# 2️⃣  Define where the report will be saved
# ---------------------------------------------------------------
$reportPath = "${PSScriptRoot}\src\notes\auto_scan_report.json"

# ---------------------------------------------------------------
# 3️⃣  Run the scanner (simulated here)
# ---------------------------------------------------------------
Write-Host "Running DAST scanner..."
# Simulate scanner by writing the test JSON (replace with real scanner execution)
$testJson = @"
[
  {
    \"scanner\": \"ZAP\",
    \"finding\": \"Clickjacking\",
    \"targetUrl\": \"http://localhost:8000/clickjacking-lab-01.html\"
  },
  {
    \"scanner\": \"ZAP\",
    \"finding\": \"JWT\",
    \"targetUrl\": \"http://localhost:8000/jwt-attacks-lab-01.py\"
  }
]
"@
Set-Content -Path $reportPath -Value $testJson -Encoding UTF8
Write-Host "Scanner report written to $reportPath"

# ---------------------------------------------------------------
# 4️⃣  Invoke the hook script to process the report
# ---------------------------------------------------------------
# Ensure the AGY CLI can be found – adjust the path if needed
$agyPath = "C:\Users\asied\AppData\Local\agy\bin\agy.exe"
if (!(Test-Path $agyPath)) {
    Write-Error "AGY CLI not found at $agyPath – please install or adjust the path."
    exit 1
}

# Export the env var for the Node hook script
$env:REPORT_PATH = $reportPath

# Call the run_report.js script (Node) – it will invoke the applyVulnScript skill via agy
node "${PSScriptRoot}\run_report.js"
