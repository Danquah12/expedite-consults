import pytest
from fastapi import HTTPException
from app.scope import validate_target, expand_target_specification, MAX_FLEET_TARGETS

def test_origin_allowlist_required():
    with pytest.raises(HTTPException):
        validate_target("https://example.com", ["https://other.example"], False)

def test_credentials_rejected():
    with pytest.raises(HTTPException):
        validate_target("https://user:pass@example.com", ["https://example.com"], False)

def test_expand_10000_ips_and_urls():
    # Mix of explicit URLs, single IPs, CIDR, and IP range totaling 10,000 targets
    raw_input = """
    192.168.195.139
    http://192.168.195.139:8080/manager/html
    https://192.168.195.139:8443/admin
    192.168.195.0/24
    10.20.0.1-10.20.38.13
    """
    result = expand_target_specification(raw_text=raw_input, max_targets=MAX_FLEET_TARGETS)
    assert result["url_count"] == 2
    assert result["cidr_count"] == 1
    assert result["range_count"] == 1
    assert result["total_expanded_targets"] <= MAX_FLEET_TARGETS
    assert result["total_expanded_targets"] >= 9990
    assert "http://192.168.195.139:8080/manager/html" in result["target_urls"]
    assert "https://192.168.195.139:8443/admin" in result["target_urls"]
    assert "http://192.168.195.139:8080" in result["allowed_origins"]
    assert "https://192.168.195.139:8443" in result["allowed_origins"]

def test_expand_csv_and_json_uploaded_files():
    csv_content = "target,url,notes\n192.168.195.139,http://192.168.195.139/phpMyAdmin/,lab\n192.168.195.140,http://192.168.195.140:8080/manager/html,vm2\n"
    res_csv = expand_target_specification(raw_text=csv_content, filename="targets.csv")
    assert res_csv["ip_count"] == 2
    assert res_csv["url_count"] == 2
    assert res_csv["total_expanded_targets"] == 4

    json_content = '[{"ip": "192.168.195.139", "url": "http://192.168.195.139/phpinfo.php"}, "192.168.195.130"]'
    res_json = expand_target_specification(raw_text=json_content, filename="targets.json")
    assert res_json["ip_count"] == 2
    assert res_json["url_count"] == 1
    assert res_json["total_expanded_targets"] == 3

def test_reject_over_10000_targets():
    with pytest.raises(HTTPException) as exc:
        expand_target_specification(raw_text="10.0.0.0/16", max_targets=MAX_FLEET_TARGETS)
    assert exc.value.status_code == 400
    assert "10,000" in str(exc.value.detail)


def test_expand_owasp_46_benchmark_urls():
    from app.scope import OWASP_TESTING_BENCHMARK_URLS

    assert len(OWASP_TESTING_BENCHMARK_URLS) == 46
    res = expand_target_specification(raw_text="\n".join(OWASP_TESTING_BENCHMARK_URLS))
    assert res["url_count"] == 46
    assert res["total_expanded_targets"] == 46
    assert res["primary_target_url"] == "https://owasp.org/projects/juice-shop"
    assert "https://vwad.owasp.org/" in res["target_urls"]
    assert "https://owasp.org:443" in res["allowed_origins"]
    assert "https://github.com:443" in res["allowed_origins"]
    assert validate_target(res["primary_target_url"], res["allowed_origins"], allow_private=True) == "https://owasp.org:443"
    assert validate_target(res["target_urls"][-1], res["allowed_origins"], allow_private=True) == "https://vwad.owasp.org:443"


def test_mixed_ip_url_and_api_multi_target_scoping_and_grouping():
    from app.engines.fleet_scanner import _is_ip_host_target, _is_api_target, _scope_finding_to_target
    from app.finding_normalizer import compute_root_cause_group_key

    assert _is_ip_host_target("http://192.168.195.139/") is True
    assert _is_ip_host_target("https://owasp.org/projects/juice-shop") is False
    assert _is_api_target("https://github.com/OWASP/crAPI") is True
    assert _is_api_target("http://192.168.195.139/api/v1/users") is True
    assert _is_api_target("http://192.168.195.139/graphql") is True

    f1 = _scope_finding_to_target(
        {"finding_key": "HTTP-HEADER-CONTENT_SECURITY_POLICY", "title": "Missing Content-Security-Policy", "description": "Missing CSP", "evidence": "GET /"},
        "http://192.168.195.139/",
        0,
        3,
    )
    f2 = _scope_finding_to_target(
        {"finding_key": "HTTP-HEADER-CONTENT_SECURITY_POLICY", "title": "Missing Content-Security-Policy", "description": "Missing CSP", "evidence": "GET /"},
        "https://owasp.org/projects/juice-shop",
        1,
        3,
    )
    f3 = _scope_finding_to_target(
        {"finding_key": "API-RATE-LIMIT-HEADERS-MISSING", "title": "API Endpoint Missing Rate-Limiting Telemetry Headers", "description": "Missing RateLimit", "evidence": "GET /api/v1/users"},
        "http://192.168.195.139/api/v1/users",
        2,
        3,
    )

    assert f1["finding_key"] != f2["finding_key"]
    assert "::T2_" in f2["finding_key"]
    assert "::T3_" in f3["finding_key"]
    assert "[owasp.org/projects/juice-shop]" in f2["title"]
    assert "[192.168.195.139/api/v1/users]" in f3["title"]

    g1 = compute_root_cause_group_key(f1)
    g2 = compute_root_cause_group_key(f2)
    g3 = compute_root_cause_group_key(f3)
    assert g1 != g2
    assert g3.startswith("80:api-security:missing-rate-limit-headers:")

    # Verify end-to-end sealing with target_url metadata in raw finding dict
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.database import Base
    from app import models
    from app.evidence import seal_finding_with_evidence
    import tempfile

    eng_db = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=eng_db)
    db = sessionmaker(bind=eng_db)()
    u = models.User(email="fleet@trepath.local", password_hash="x", role=models.Role.ADMIN)
    db.add(u); db.flush()
    e = models.Engagement(name="Fleet", client_name="Lab", owner_id=u.id, status="authorized")
    db.add(e); db.flush()
    s = models.Scan(engagement_id=e.id, target_url="https://owasp.org/projects/juice-shop", status=models.ScanStatus.RUNNING, profile="authorized_pentest", created_by=u.id)
    db.add(s); db.flush()

    with tempfile.TemporaryDirectory() as tmpdir:
        persisted_f, persisted_art = seal_finding_with_evidence(db, tmpdir, s.id, f2)
        assert persisted_f.id is not None
        assert persisted_art.metadata_json.get("target_url") == "https://owasp.org/projects/juice-shop"




