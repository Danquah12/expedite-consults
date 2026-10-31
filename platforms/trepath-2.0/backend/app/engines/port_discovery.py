import asyncio
import socket
from urllib.parse import urlparse
from ..models import ProofState
from .risk import calculate_risk_priority

# Well-known service name mapping for the top 1024 system/registered ports
WELL_KNOWN_PORTS: dict[int, tuple[str, str, str, str]] = {
    20: ("FTP-Data", "low", "CWE-319", "Cleartext FTP active data channel."),
    21: ("FTP-Control", "low", "CWE-319", "Cleartext file transfer protocol. Migrate to SFTP or FTPS."),
    22: ("SSH", "info", "CWE-200", "Secure Shell remote management. Disable root password login and enforce SSH keys."),
    23: ("Telnet", "high", "CWE-319", "Unencrypted remote terminal daemon. Disable Telnet daemon and replace with SSH."),
    25: ("SMTP", "info", "CWE-200", "Simple Mail Transfer Protocol. Enforce TLS (STARTTLS) and disable open relays."),
    43: ("WHOIS", "info", "CWE-200", "WHOIS directory service."),
    53: ("DNS", "info", "CWE-200", "Domain Name System. Restrict zone transfers (AXFR) to authorized nameservers."),
    67: ("DHCP-Server", "info", "CWE-200", "DHCP server allocation daemon."),
    68: ("DHCP-Client", "info", "CWE-200", "DHCP client listener."),
    69: ("TFTP", "high", "CWE-319", "Trivial File Transfer Protocol without authentication. Restrict or disable."),
    70: ("Gopher", "info", "CWE-200", "Legacy Gopher protocol."),
    79: ("Finger", "medium", "CWE-200", "Finger user information service. Leaks local username accounts."),
    80: ("HTTP", "info", "CWE-319", "Standard web server port. Enforce permanent HTTP-to-HTTPS redirect."),
    88: ("Kerberos", "info", "CWE-287", "Active Directory Kerberos authentication service."),
    110: ("POP3", "low", "CWE-319", "Post Office Protocol. Upgrade to POP3S over TLS (port 995)."),
    111: ("RPCBind/NFS", "medium", "CWE-284", "RPC port mapper. Restrict from untrusted networks."),
    119: ("NNTP", "info", "CWE-200", "Network News Transfer Protocol."),
    123: ("NTP", "info", "CWE-200", "Network Time Protocol."),
    135: ("MS-RPC", "medium", "CWE-284", "Microsoft RPC Endpoint Mapper. Restrict port 135 to internal domain controllers."),
    137: ("NetBIOS-NS", "medium", "CWE-200", "NetBIOS Name Service. Disable NetBIOS over TCP/IP where unnecessary."),
    138: ("NetBIOS-DGM", "medium", "CWE-200", "NetBIOS Datagram Service."),
    139: ("NetBIOS-SSN", "medium", "CWE-200", "NetBIOS Session Service. Restrict SMB/NetBIOS access to isolated management subnets."),
    143: ("IMAP", "low", "CWE-319", "Internet Message Access Protocol. Enforce IMAPS over TLS (port 993)."),
    161: ("SNMP", "medium", "CWE-200", "Simple Network Management Protocol. Replace default community strings with SNMPv3."),
    162: ("SNMP-Trap", "medium", "CWE-200", "SNMP Trap reception service."),
    179: ("BGP", "info", "CWE-200", "Border Gateway Protocol routing service."),
    389: ("LDAP", "low", "CWE-319", "Lightweight Directory Access Protocol. Migrate to LDAPS over TLS (port 636)."),
    443: ("HTTPS", "info", "CWE-200", "Standard encrypted web transport port."),
    445: ("SMB/CIFS", "medium", "CWE-284", "Microsoft Server Message Block. Disable SMBv1; isolate SMB from untrusted networks."),
    465: ("SMTPS", "info", "CWE-200", "Secure SMTP over SSL/TLS."),
    512: ("Rexec", "high", "CWE-319", "Legacy cleartext remote execution. Disable rexec."),
    513: ("Rlogin", "high", "CWE-319", "Legacy cleartext remote login. Disable rlogin."),
    514: ("Rsh/Syslog", "medium", "CWE-319", "Legacy remote shell daemon. Disable rsh."),
    515: ("LPD/Printer", "low", "CWE-200", "Line Printer Daemon."),
    520: ("RIP", "low", "CWE-200", "Routing Information Protocol."),
    548: ("AFP", "medium", "CWE-284", "Apple Filing Protocol network file sharing."),
    554: ("RTSP", "info", "CWE-200", "Real Time Streaming Protocol."),
    587: ("SMTP-Submission", "info", "CWE-200", "Mail submission port. Enforce STARTTLS and authentication."),
    631: ("CUPS", "info", "CWE-200", "Common Unix Printing System web interface."),
    636: ("LDAPS", "info", "CWE-200", "Encrypted LDAP directory service."),
    873: ("Rsync", "medium", "CWE-284", "Rsync file synchronization daemon. Require authentication."),
    990: ("FTPS", "info", "CWE-200", "File Transfer Protocol over TLS."),
    993: ("IMAPS", "info", "CWE-200", "Encrypted IMAP mail service."),
    995: ("POP3S", "info", "CWE-200", "Encrypted POP3 mail service."),
    1080: ("SOCKS-Proxy", "medium", "CWE-284", "SOCKS proxy service. Ensure proxy authentication is enforced.")
}

# High-profile database/application services above port 1000 included in the 1-1000 sweep
ADDITIONAL_TARGET_PORTS: dict[int, tuple[str, str, str, str]] = {
    1433: ("MSSQL", "high", "CWE-200", "Microsoft SQL Server database listener."),
    1521: ("Oracle-TNS", "high", "CWE-200", "Oracle Database listener."),
    2049: ("NFS", "high", "CWE-284", "Network File System daemon."),
    2375: ("Docker-API", "critical", "CWE-284", "Unauthenticated Docker daemon API. Enforce TLS mutual auth."),
    3306: ("MySQL", "high", "CWE-200", "MySQL database listener. Restrict to localhost or private app tier."),
    3389: ("RDP", "medium", "CWE-284", "Remote Desktop Protocol. Enforce NLA and MFA."),
    5432: ("PostgreSQL", "high", "CWE-200", "PostgreSQL database listener. Restrict from direct client subnets."),
    6379: ("Redis", "high", "CWE-284", "Redis In-Memory Data Store. Require authentication and bind to localhost."),
    8000: ("HTTP-Alt", "info", "CWE-200", "Alternative HTTP service / Dev server."),
    8080: ("Tomcat/HTTP-Proxy", "info", "CWE-200", "Apache Tomcat or proxy web service."),
    8443: ("HTTPS-Alt", "info", "CWE-200", "Alternative HTTPS service.")
}

def grab_service_banner(host: str, port: int, timeout: float = 0.5) -> str:
    """Safely extracts raw daemon banner on connection without aggressive payloads."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(timeout)
        s.connect((host, port))
        
        # Ports that send banners immediately on connect (SSH, FTP, SMTP, Telnet, MySQL)
        if port in (21, 22, 23, 25, 110, 143, 3306):
            banner_bytes = s.recv(512)
            s.close()
            return banner_bytes.decode("latin1", errors="ignore").strip()
            
        # HTTP-based ports: send minimal HTTP/1.0 request to read Server header
        if port in (80, 443, 8000, 8008, 8080, 8443):
            s.sendall(b"HEAD / HTTP/1.0\r\nHost: " + host.encode() + b"\r\n\r\n")
            res_bytes = s.recv(1024)
            s.close()
            text = res_bytes.decode("latin1", errors="ignore")
            for line in text.split("\r\n"):
                if line.lower().startswith("server:"):
                    return line.strip()
                    
        s.close()
    except Exception:
        pass
    return ""

def check_single_port(host: str, port: int, timeout: float) -> int | None:
    """Synchronous connect test executed in a worker thread."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(timeout)
        res = s.connect_ex((host, port))
        s.close()
        if res == 0:
            return port
    except Exception:
        pass
    return None

async def run_port_discovery(target_url: str, timeout: float = 0.2, max_concurrency: int = 150) -> list[dict]:
    """
    High-speed, asynchronous 1,000-port scan (Ports 1 through 1000 + critical database/web ports).
    Uses non-blocking worker pools capable of scanning all 1,000 ports in ~1.5 - 3 seconds.
    """
    findings = []
    host = urlparse(target_url).hostname
    if not host:
        return findings

    # Build target port list: Ports 1..1000 plus key common high ports
    target_ports = list(range(1, 1001))
    for p in ADDITIONAL_TARGET_PORTS:
        if p not in target_ports:
            target_ports.append(p)

    loop = asyncio.get_running_loop()
    semaphore = asyncio.Semaphore(max_concurrency)

    async def scan_port(p: int) -> int | None:
        async with semaphore:
            return await loop.run_in_executor(None, check_single_port, host, p, timeout)

    tasks = [scan_port(p) for p in target_ports]
    results = await asyncio.gather(*tasks)

    open_ports = [p for p in results if p is not None]
    open_ports.sort()

    for port in open_ports:
        # Resolve service metadata
        if port in WELL_KNOWN_PORTS:
            service_name, severity, cwe_id, remediation = WELL_KNOWN_PORTS[port]
        elif port in ADDITIONAL_TARGET_PORTS:
            service_name, severity, cwe_id, remediation = ADDITIONAL_TARGET_PORTS[port]
        else:
            service_name = f"Unknown-Service-{port}"
            severity = "info"
            cwe_id = "CWE-200"
            remediation = f"Audit daemon listening on port {port}/TCP and verify whether it should be exposed."

        is_sensitive = port in (23, 69, 512, 513, 2375, 3306, 5432, 6379)
        proof = ProofState.CONTROL_GAP_CONFIRMED if is_sensitive else ProofState.OBSERVATION_CONFIRMED
        
        banner = grab_service_banner(host, port)
        banner_info = f"\nCaptured Daemon Banner: {banner}" if banner else ""

        findings.append({
            "finding_key": f"PORT-OPEN-{port}-{service_name.upper().replace('-', '_')}",
            "title": f"Service Port Open: {port}/TCP ({service_name}) on {host}",
            "description": f"A live TCP handshake succeeded on port {port}/TCP ({service_name}) on target {host}.{banner_info} {remediation}",
            "severity": severity,
            "proof_state": proof,
            "cvss_score": None,
            "cve_id": None,
            "cwe_id": cwe_id,
            "remediation": remediation,
            "risk_priority": calculate_risk_priority(severity, exposure=0.7, exploitability=0.3, confidence=1.0),
            "evidence": f"TCP Connect Probe to {host}:{port}\nStatus: OPEN (SYN-ACK Established)\nService Identity: {service_name}{banner_info}"
        })

    return findings
