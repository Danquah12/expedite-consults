from app.engines.risk import calculate_risk_priority

def test_risk_is_bounded_and_not_cvss():
    assert 0 <= calculate_risk_priority("critical") <= 10
    assert calculate_risk_priority("high", confidence=1.0) > calculate_risk_priority("low", confidence=1.0)

def test_unknown_severity_is_safe():
    assert calculate_risk_priority("unknown") >= 0
