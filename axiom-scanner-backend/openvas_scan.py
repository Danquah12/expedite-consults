#!/usr/bin/env python3
"""
AXIOM OpenVAS Scanner Script
Connects to local OpenVAS via GMP, creates a scan against target, polls until done,
outputs normalized findings as JSON.
Usage: python openvas_scan.py --host 127.0.0.1 --port 9390 --user admin --pass admin --target 192.168.195.140
"""

import sys, json, time, argparse
from gvm.connections import TLSConnection, UnixSocketConnection
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeCheckCommandTransform

def cvss_to_severity(cvss):
    c = float(cvss or 0)
    if c >= 9.0: return "Critical"
    if c >= 7.0: return "High"
    if c >= 4.0: return "Medium"
    if c > 0.0:  return "Low"
    return "Info"

def map_plugin(name):
    n = (name or "").lower()
    if "sql" in n:           return "SQLi"
    if "xss" in n:           return "XSS"
    if "ftp" in n:           return "FTP"
    if "ssh" in n:           return "SSH"
    if "smb" in n:           return "SMB"
    if "ssl" in n or "tls" in n: return "SSL/TLS"
    if "backdoor" in n:      return "Backdoor"
    if "rce" in n or "remote code" in n: return "RCE"
    if "default" in n:       return "DefaultCreds"
    return "Misc"

def run_scan(host, port, user, password, target_ip, scan_name="AXIOM Scan"):
    print(f"[AXIOM OpenVAS] Connecting to {host}:{port}...", file=sys.stderr)
    
    connection = TLSConnection(hostname=host, port=port)
    transform  = EtreeCheckCommandTransform()
    
    with Gmp(connection, transform=transform) as gmp:
        # Authenticate
        gmp.authenticate(user, password)
        print(f"[AXIOM OpenVAS] Authenticated as {user}", file=sys.stderr)

        # Get available port lists
        port_lists = gmp.get_port_lists()
        # Use "All IANA assigned TCP and UDP" or first available
        port_list_id = None
        for pl in port_lists.findall("port_list"):
            name = pl.find("name")
            if name is not None and "all iana" in name.text.lower():
                port_list_id = pl.get("id")
                break
        if not port_list_id:
            port_lists_all = port_lists.findall("port_list")
            if port_lists_all:
                port_list_id = port_lists_all[0].get("id")
        print(f"[AXIOM OpenVAS] Port list: {port_list_id}", file=sys.stderr)

        # Create scan target
        target_name = f"AXIOM-{target_ip}-{int(time.time())}"
        target_resp = gmp.create_target(
            name=target_name,
            hosts=[target_ip],
            port_list_id=port_list_id
        )
        target_id = target_resp.get("id")
        print(f"[AXIOM OpenVAS] Target created: {target_id}", file=sys.stderr)

        # Get scan configs — use "Full and fast"
        configs   = gmp.get_scan_configs()
        config_id = None
        for c in configs.findall("config"):
            name = c.find("name")
            if name is not None and "full and fast" in name.text.lower():
                config_id = c.get("id")
                break
        if not config_id:
            cfgs = configs.findall("config")
            if cfgs:
                config_id = cfgs[0].get("id")
        print(f"[AXIOM OpenVAS] Scan config: {config_id}", file=sys.stderr)

        # Get scanner
        scanners  = gmp.get_scanners()
        scanner_id = None
        for s in scanners.findall("scanner"):
            name = s.find("name")
            if name is not None and "openvas" in name.text.lower():
                scanner_id = s.get("id")
                break
        if not scanner_id:
            slist = scanners.findall("scanner")
            if len(slist) > 1:
                scanner_id = slist[1].get("id")  # skip first (CVE scanner)
        print(f"[AXIOM OpenVAS] Scanner: {scanner_id}", file=sys.stderr)

        # Create task
        task_resp = gmp.create_task(
            name=scan_name,
            config_id=config_id,
            target_id=target_id,
            scanner_id=scanner_id
        )
        task_id = task_resp.get("id")
        print(f"[AXIOM OpenVAS] Task created: {task_id}", file=sys.stderr)

        # Start task
        gmp.start_task(task_id)
        print(f"[AXIOM OpenVAS] Task started. Polling...", file=sys.stderr)

        # Poll until complete
        max_wait = 3600  # 1 hour max
        elapsed  = 0
        while elapsed < max_wait:
            time.sleep(15)
            elapsed += 15
            tasks = gmp.get_task(task_id)
            task  = tasks.find("task")
            if task is None:
                continue
            status   = task.find("status")
            progress = task.find("progress")
            st  = status.text  if status  is not None else "Unknown"
            pct = progress.text if progress is not None else "0"
            print(f"[AXIOM OpenVAS] Status: {st} | Progress: {pct}% | Elapsed: {elapsed}s", file=sys.stderr)
            if st in ("Done", "Stopped", "Failed"):
                break

        # Get results
        print(f"[AXIOM OpenVAS] Collecting results...", file=sys.stderr)
        results_resp = gmp.get_results(task_id=task_id, details=True)
        findings     = []

        for i, result in enumerate(results_resp.findall("result")):
            name_el  = result.find("name")
            sev_el   = result.find("severity")
            host_el  = result.find("host")
            port_el  = result.find("port")
            desc_el  = result.find("description")
            sol_el   = result.find(".//solution")
            nvt_el   = result.find("nvt")

            name     = name_el.text  if name_el  is not None else "Unknown"
            severity = sev_el.text   if sev_el   is not None else "0"
            host     = host_el.text  if host_el  is not None else target_ip
            port     = port_el.text  if port_el  is not None else ""
            desc     = desc_el.text  if desc_el  is not None else ""
            solution = sol_el.text   if sol_el   is not None else ""
            oid      = nvt_el.get("oid") if nvt_el is not None else ""
            cvss     = float(severity) if severity else 0.0

            port_num = port.replace("/tcp","").replace("/udp","").strip()
            url = f"http://{host}:{port_num}" if port_num and port_num.isdigit() else f"http://{host}"

            findings.append({
                "id":          f"GVM-F{str(i+1).zfill(3)}",
                "title":       name,
                "severity":    cvss_to_severity(cvss),
                "confidence":  "HIGH",
                "status":      "VERIFIED",
                "source":      "OpenVAS/GVM",
                "plugin":      map_plugin(name),
                "method":      "GET",
                "url":         url,
                "parameter":   port,
                "description": (desc or "")[:500],
                "solution":    (solution or "")[:300],
                "cvss":        cvss,
                "nvtOid":      oid,
                "remediation": (solution or "Apply vendor patch.")[:300],
                "normalizedAt":time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            })

        # Sort by severity
        order = {"Critical":0,"High":1,"Medium":2,"Low":3,"Info":4}
        findings.sort(key=lambda f: order.get(f["severity"], 9))

        print(f"[AXIOM OpenVAS] Found {len(findings)} findings", file=sys.stderr)
        print(json.dumps({"findings": findings, "count": len(findings), "source": "openvas", "target": target_ip}))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AXIOM OpenVAS Scanner")
    parser.add_argument("--host",   default="127.0.0.1")
    parser.add_argument("--port",   default=9390, type=int)
    parser.add_argument("--user",   default="admin")
    parser.add_argument("--passwd", default="admin")
    parser.add_argument("--target", required=True, help="Target IP to scan")
    parser.add_argument("--name",   default="AXIOM Scan")
    args = parser.parse_args()

    try:
        run_scan(args.host, args.port, args.user, args.passwd, args.target, args.name)
    except Exception as e:
        print(json.dumps({"error": str(e), "findings": []}))
        sys.exit(1)
