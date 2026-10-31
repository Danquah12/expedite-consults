import ipaddress, socket
from urllib.parse import urlparse
from fastapi import HTTPException

def normalize_origin(value: str) -> str:
    p = urlparse(value)
    if p.scheme not in ("http", "https") or not p.hostname:
        raise HTTPException(400, "Only explicit HTTP(S) origins are allowed")
    if p.username or p.password:
        raise HTTPException(400, "Credentials in target URLs are prohibited")
    port = p.port or (443 if p.scheme == "https" else 80)
    return f"{p.scheme}://{p.hostname.lower()}:{port}"

def validate_target(target: str, allowed_origins: list[str], allow_private: bool = False) -> str:
    origin = normalize_origin(target)
    allowed = {normalize_origin(x) for x in allowed_origins}
    if origin not in allowed:
        raise HTTPException(403, "Target origin is not present in approved ROE allowlist")
    host = urlparse(target).hostname
    try:
        addresses = {ipaddress.ip_address(host)}
    except ValueError:
        try:
            addresses = {ipaddress.ip_address(x[4][0]) for x in socket.getaddrinfo(host, None)}
        except socket.gaierror:
            raise HTTPException(400, "Target hostname did not resolve")
    for ip in addresses:
        if not allow_private and (not ip.is_global or ip.is_loopback or ip.is_link_local or ip.is_reserved):
            raise HTTPException(403, f"Target resolves to prohibited address space: {ip}")
    return origin
