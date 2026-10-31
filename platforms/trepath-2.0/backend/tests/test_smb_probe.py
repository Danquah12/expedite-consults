import asyncio
import json
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import models
from app.testing.adapters.smb_share_probe import run_smb_share_probe
from app.testing.adapters.phpinfo_probe import run_phpinfo_probe
from app.testing.adapters.tomcat_manager_probe import run_tomcat_manager_probe
from app.validation.proof_validator import validate_finding_proof


def test_smb_share_probe_success():
    mock_result = MagicMock()
    mock_result.stdout = """
    Share1               Disk    Disk Share
    IPC$                 IPC     IPC Share
    """
    mock_result.returncode = 0

    with patch("subprocess.run", return_value=mock_result):
        endpoint = MagicMock()
        endpoint.surface_type = "smb"
        endpoint.port = 445
        endpoint.host = "10.0.0.5"
        endpoint.endpoint_key = "ep1"
        endpoint.url = "smb://10.0.0.5"

        findings = asyncio.run(
            run_smb_share_probe(
                asset=MagicMock(),
                endpoints=[endpoint],
                technologies=[],
                intelligence_matches=[],
            )
        )
        assert len(findings) == 1
        f = findings[0]
        assert f.get("test_id", "SMB-LIST-001") == "SMB-LIST-001"
        assert f["proof_state"] == models.ProofState.IMPACT_VERIFIED
        assert "Share1" in f["description"]
        evidence = json.loads(f["evidence"])
        assert evidence["shares"] == ["Share1", "IPC$"]

        # Verify PentestValidator approves IMPACT_VERIFIED
        ev_bytes = f["evidence"].encode("utf-8")
        res = validate_finding_proof(models.ProofState.IMPACT_VERIFIED, ev_bytes, "a" * 64)
        assert res.approved_proof_state == models.ProofState.IMPACT_VERIFIED
        assert not res.was_downgraded


def test_phpinfo_and_tomcat_probes_fallback():
    asset = MagicMock()
    asset.asset_key = "ASSET-00001"
    asset.hostname = "192.168.195.139"
    asset.target_url = "http://192.168.195.139/"
    asset.open_ports = [80, 445, 8080]

    php_findings = asyncio.run(run_phpinfo_probe(asset, [], [], []))
    assert len(php_findings) == 1
    assert php_findings[0]["proof_state"] == models.ProofState.IMPACT_VERIFIED

    tomcat_findings = asyncio.run(run_tomcat_manager_probe(asset, [], [], []))
    assert len(tomcat_findings) == 1
    assert tomcat_findings[0]["proof_state"] == models.ProofState.IMPACT_VERIFIED
