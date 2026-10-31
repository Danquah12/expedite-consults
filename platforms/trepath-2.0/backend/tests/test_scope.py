import pytest
from fastapi import HTTPException
from app.scope import validate_target

def test_origin_allowlist_required():
    with pytest.raises(HTTPException):
        validate_target("https://example.com", ["https://other.example"], False)

def test_credentials_rejected():
    with pytest.raises(HTTPException):
        validate_target("https://user:pass@example.com", ["https://example.com"], False)
