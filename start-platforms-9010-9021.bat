@echo off
title Expedite Security Platforms Launcher (Ports 9010-9021)
echo ========================================================
echo   Launching Expedite Security Platforms (Ports 9010-9021)
echo ========================================================

set ROOT=d:\Anti-gravity\expedite-consults\platforms

echo Starting Platform 10 (IaC Security) on http://localhost:9010 ...
start "Platform 10 [9010]" /D "%ROOT%\10-iac-security-platform" cmd /k "npm run dev"

echo Starting Platform 11 (AXIOM DAST) on http://localhost:9011 ...
start "Platform 11 [9011]" /D "%ROOT%\11-dast-security-platform" cmd /k "npm run dev"

echo Starting Platform 12 (API Security) on http://localhost:9012 ...
start "Platform 12 [9012]" /D "%ROOT%\12-api-security-platform" cmd /k "npm run dev"

echo Starting Platform 13 (Mobile Security) on http://localhost:9013 ...
start "Platform 13 [9013]" /D "%ROOT%\13-mobile-security-platform" cmd /k "npm run dev"

echo Starting Platform 14 (Exploitability) on http://localhost:9014 ...
start "Platform 14 [9014]" /D "%ROOT%\14-exploitability-platform" cmd /k "npm run dev"

echo Starting Platform 15 (Threat Modeling) on http://localhost:9015 ...
start "Platform 15 [9015]" /D "%ROOT%\15-threat-modeling-platform" cmd /k "npm run dev"

echo Starting Platform 16 (CERBERUS-RE) on http://localhost:9016 ...
start "Platform 16 [9016]" /D "%ROOT%\16-malware-analysis-platform" cmd /k "npm run dev"

echo Starting Platform 17 (Aegis Recovery) on http://localhost:9017 ...
start "Platform 17 [9017]" /D "%ROOT%\17-ransomware-recovery-platform" cmd /k "npm run dev"

echo Starting Platform 18 (Unified Integration) on http://localhost:9018 ...
start "Platform 18 [9018]" /D "%ROOT%\18-unified-integration-layer" cmd /k "npm run dev"

echo Starting Platform 19 (Cloud Security) on http://localhost:9019 ...
start "Platform 19 [9019]" /D "%ROOT%\19-cloud-security-platform" cmd /k "npm run dev"

echo.
echo ========================================================
echo   All platforms (9010-9019) have been launched!
echo   Main App is available on http://localhost:3000
echo ========================================================
pause
