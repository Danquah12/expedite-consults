# Security Scan Automation

This project now includes a PowerShell script (`scripts/security_scan.ps1`) that runs three security scanners against the deployed Vercel application:

1. **Nmap** – performs a service/version scan and outputs `nmap_report.xml`.
2. **OpenVAS** – placeholder commands are provided. Install and configure OpenVAS/GVM locally and replace the `gvm-cli` calls in the script with your own credentials and target IDs.
3. **OWASP ZAP** – runs a baseline scan inside a Docker container and stores the HTML report `zap_report.html`.

The script stores all generated reports under `public/security-reports/` so they are served automatically by Vercel after deployment.

## Running the Scan Locally

```powershell
# Ensure Docker Desktop is running (required for ZAP)
# Install Docker Desktop if not present: https://www.docker.com/products/docker-desktop/

# Optional: Install Nmap (Windows)
# choco install nmap   # or download from https://nmap.org/download.html

# Run the scan via npm (adds the script to your PATH)
npm run scan
# or invoke directly
powershell -ExecutionPolicy Bypass -File scripts/security_scan.ps1
```

## Docker Requirements for ZAP

- Docker Desktop must be installed **and the Docker daemon must be running**. On Windows it uses a WSL 2 backend; ensure WSL 2 is enabled (`wsl --install`).
- Verify Docker is active with:
  ```powershell
  docker version --format '{{.Server.Version}}'
  ```
- If you encounter the error `failed to connect to the docker API…`, start Docker Desktop from the Start menu and wait until the status shows *Docker is running*.

## OpenVAS Setup (Optional)

OpenVAS/GVM is not bundled with this repository. To enable the OpenVAS scan:
1. Install the OpenVAS scanner on your machine (Linux is recommended; on Windows you can run it inside WSL2). See the official guide: https://www.openvas.org/
2. Start the OpenVAS services (`gvm‑setup`, `gvmd`, `gsad`).
3. Replace the placeholder section in `security_scan.ps1` with actual `gvm-cli` commands, for example:
   ```powershell
   $targetId = (gvm-cli socket --xml "<create_target><name>$targetHost</name><hosts>$targetHost</hosts></create_target>" | Select-String -Pattern 'id="(\d+)' -AllMatches).Matches[0].Groups[1].Value
   $taskId   = (gvm-cli socket --xml "<create_task><name>SecurityScan</name><target id='$targetId'/></create_task>" | ... )
   gvm-cli socket --xml "<start_task task_id='$taskId'/>"
   $reportId = (gvm-cli socket --xml "<get_report task_id='$taskId' format_id='HTML'/>" | ... )
   gvm-cli socket --xml "<get_report report_id='$reportId' format_id='HTML'/>" > $openvasReport
   ```
4. After a successful run, the HTML report will appear in `public/security-reports/openvas_report.html`.

## Deploying Reports with Vercel

Because Vercel automatically serves everything inside the `public/` directory, once you push the generated reports (or run the script on a CI runner that writes to `public/`) they become accessible at:

```
https://11-dast-security-platform.vercel.app/security-reports/nmap_report.xml
https://11-dast-security-platform.vercel.app/security-reports/openvas_report.html
https://11-dast-security-platform.vercel.app/security-reports/zap_report.html
```

## Troubleshooting

- **Docker not starting**: Ensure WSL 2 is installed (`wsl --install`) and that the Docker Desktop service is running. Re‑launch Docker Desktop if needed.
- **Nmap command not found**: Install via Chocolatey (`choco install nmap`) or add its binary directory to `PATH`.
- **OpenVAS placeholder**: The script currently only creates an empty placeholder file. Replace the commented section with real `gvm-cli` calls as described above.
- **Permissions**: Run PowerShell with **Administrator** rights if you encounter access errors when creating directories or pulling Docker images.

---

After completing the setup, you can simply run `npm run scan` whenever you need a fresh security assessment of the deployed app.
