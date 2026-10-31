import hashlib, json
from pathlib import Path
from datetime import datetime, timezone
from . import __name__ as engine_name

def store_evidence(root: str, scan_id: int, artifact_type: str, payload: bytes) -> tuple[str, str, dict]:
    digest = hashlib.sha256(payload).hexdigest()
    directory = Path(root) / str(scan_id)
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / f"{digest}.bin"
    if not path.exists():
        path.write_bytes(payload)
    metadata = {
        "sha256": digest,
        "bytes": len(payload),
        "artifact_type": artifact_type,
        "collected_at": datetime.now(timezone.utc).isoformat(),
        "integrity_note": "Hash verifies byte integrity; it does not independently prove source authenticity."
    }
    return str(path), digest, metadata
