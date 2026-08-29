# AXIOM Scanner Backend — VM Setup Guide

## Your Lab Setup
- **Kali Linux 2025.3** → Scanner (ZAP daemon)
- **OWASP Broken Web Apps v1.2** OR **Metasploitable2** → Target
- **Windows Host** → AXIOM Backend + Frontend

---

## Step 1 — Boot Your VMs

In VMware Workstation, power on:
1. **OWASP Broken Web Apps v1.2** (or Metasploitable2)
2. **Kali Linux 2025.3**

---

## Step 2 — Get Target VM IP

On OWASP BWA or Metasploitable2 console, run:
```bash
ip addr show eth0   # or ifconfig eth0
```
Note the IP — e.g., `192.168.80.131`

---

## Step 3 — Start ZAP on Kali Linux

Open terminal on Kali and run:
```bash
zap.sh -daemon \
  -host 0.0.0.0 \
  -port 8090 \
  -config api.key=axiom-zap-key \
  -config api.addrs.addr.name=.* \
  -config api.addrs.addr.regex=true \
  -config connection.timeoutInSecs=120
```

Wait for: `ZAP is now listening on 0.0.0.0:8090`

Note Kali's IP: `ip addr show eth0` → e.g., `192.168.80.130`

---

## Step 4 — Update config.json

Edit `config.json` with your actual IPs:
```json
{
  "zap": {
    "host": "192.168.80.130",   ← Kali Linux IP
    "port": 8090,
    "apiKey": "axiom-zap-key"
  },
  "target": {
    "url": "http://192.168.80.131",   ← OWASP BWA IP
    "name": "OWASP Broken Web Apps v1.2",
    "profile": "Standard"
  }
}
```

---

## Step 5 — Start AXIOM Backend

```powershell
cd d:\Anti-gravity\expedite-consults\axiom-scanner-backend
node server.js
```

---

## Step 6 — Verify Connection

Open browser or PowerShell:
```powershell
# Check backend is running
Invoke-RestMethod http://localhost:3001/api/health

# Check ZAP connection
Invoke-RestMethod http://localhost:3001/api/zap/status
```

Expected: `connected: true`

---

## Step 7 — Start Real Scan from AXIOM

In AXIOM Engine Brain (`/engine`), click **"Start Real Scan"** — results will flow live into AXIOM.

Or via API:
```powershell
$body = @{ target = "http://192.168.80.131" } | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri "http://localhost:3001/api/scan/start" -Body $body -ContentType "application/json"
```

---

## OWASP BWA — Available Targets

Once scanned, AXIOM will find vulnerabilities in:
| App | URL | Vulns |
|-----|-----|-------|
| DVWA | /dvwa | SQLi, XSS, CSRF, File Upload, IDOR |
| Mutillidae | /mutillidae | 40+ OWASP Top 10 |
| WebGoat | /WebGoat | Java-based vulns |
| WebScarab-NG | /webscarab-ng | Various |
| HackaJax | /hackajax | AJAX vulns |
| Peruggia | /peruggia | IDOR, Auth |

---

## Metasploitable2 — Available Services

| Service | Port | Vulns |
|---------|------|-------|
| DVWA (Apache) | 80 | SQLi, XSS, RCE |
| Samba | 445 | MS08-067 |
| vsftpd | 21 | Backdoor |
| Tomcat | 8080 | RCE |
| PostgreSQL | 5432 | Weak creds |
