# Skill: startEngagement
# ---------------------------------------------------------------
# This skill boots the full DAST workflow for a new engagement.
# It runs the PowerShell wrapper `start_dast.ps1` which:
#   1️⃣ Executes the configured scanner (replace placeholder).
#   2️⃣ Writes a JSON report.
#   3️⃣ Calls `run_report.js` → `applyVulnScript` for each finding.
# ---------------------------------------------------------------

import subprocess
import os
import sys

# Resolve the path to the wrapper script (relative to this skill file)
skill_dir = os.path.dirname(__file__)
wrapper_path = os.path.join(skill_dir, "..", "..", "..", "plugins", "dast-brain", "start_dast.ps1")

if not os.path.isfile(wrapper_path):
    print(f"[startEngagement] ERROR – wrapper not found at {wrapper_path}", file=sys.stderr)
    sys.exit(1)

# Build the PowerShell command (ensure ExecutionPolicy bypass for this run)
ps_cmd = ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", wrapper_path]

print(f"[startEngagement] Running wrapper: {wrapper_path}")
try:
    subprocess.check_call(ps_cmd)
    print("[startEngagement] DAST workflow completed successfully")
except subprocess.CalledProcessError as e:
    print(f"[startEngagement] Wrapper exited with code {e.returncode}", file=sys.stderr)
    sys.exit(e.returncode)
