"""
API Security Claims, Z3 Symbolic Counterexamples, Executable Security Contracts,
and Risk-Ranked Test Selection Optimizer.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional


@dataclass(frozen=True)
class ApiSecurityClaim:
    claim_id: str
    title: str
    formal_invariant: str
    scope: str
    status: str  # VERIFIED | COUNTEREXAMPLE_FOUND
    counterexample_witness: Optional[Dict[str, str]]
    executable_contract_code: str


@dataclass(frozen=True)
class ApiMutationRecord:
    mutant_id: str
    target_endpoint: str
    controller_file: str
    injected_defect: str
    owasp_category: str
    detected: bool
    catching_validator: str


def get_default_api_security_claims() -> List[ApiSecurityClaim]:
    return [
        ApiSecurityClaim(
            claim_id="CLAIM-API-01",
            title="Tenant-Scoped Object Ownership on All /api/v2/users/{id} Routes",
            formal_invariant="ForAll(req, resource): route(req) == '/api/v2/users/{id}' => Implies(http_status == 200, resource.owner_id == req.jwt.sub Or req.jwt.role == 'ADMIN')",
            scope="controllers/users_controller.py · 6 endpoints",
            status="COUNTEREXAMPLE_FOUND",
            counterexample_witness={
                "req.jwt.sub": "1000 (Tenant A · standard_user)",
                "req.path.id": "1001 (Tenant B · Jane Smith)",
                "orm_predicate": "SELECT * FROM users WHERE id = 1001 (missing AND tenant_id = jwt.tenant_id)",
                "observed_status": "HTTP 200 OK (leaks ssn_last4, salary)",
            },
            executable_contract_code=(
                "def test_bola_tenant_isolation(api_client, token_user_1000):\n"
                "    resp = api_client.get('/api/v2/users/1001', headers={'Authorization': f'Bearer {token_user_1000}'})\n"
                "    assert resp.status_code == 403, 'Cross-tenant object access must be denied'"
            ),
        ),
        ApiSecurityClaim(
            claim_id="CLAIM-API-02",
            title="Cryptographic Algorithm Pinning on JWT Verification Middleware",
            formal_invariant="ForAll(token): jwt_verify(token) => token.header.alg In {'RS256', 'ES256'} And token.header.alg != 'none'",
            scope="middleware/jwt_auth.py · All authenticated routes",
            status="COUNTEREXAMPLE_FOUND",
            counterexample_witness={
                "token.header.alg": "none",
                "token.payload.role": "admin",
                "verifier_config": "jwt.decode(token, options={'verify_signature': False})",
                "observed_status": "HTTP 200 OK on GET /api/v2/admin/users",
            },
            executable_contract_code=(
                "def test_jwt_rejects_alg_none(api_client, unsigned_admin_jwt):\n"
                "    resp = api_client.get('/api/v2/admin/users', headers={'Authorization': f'Bearer {unsigned_admin_jwt}'})\n"
                "    assert resp.status_code == 401"
            ),
        ),
        ApiSecurityClaim(
            claim_id="CLAIM-API-03",
            title="DTO Write-Field Allowlist Prevents Privilege Mass Assignment",
            formal_invariant="ForAll(req): route(req) == 'PUT /api/v2/users/{id}' => Disjoint(keys(req.bound_model), {'is_admin', 'role', 'tenant_id'})",
            scope="controllers/users_controller.py :: update_user",
            status="COUNTEREXAMPLE_FOUND",
            counterexample_witness={
                "req.body": '{"displayName": "test", "is_admin": true, "role": "admin"}',
                "orm_binding": "User.update(**request.json) # unbounded kwargs",
                "observed_state": "user.is_admin == True",
            },
            executable_contract_code=(
                "def test_mass_assignment_blocked(api_client, token_user_1000):\n"
                "    resp = api_client.put('/api/v2/users/1000', json={'displayName': 'ok', 'is_admin': True}, headers={'Authorization': f'Bearer {token_user_1000}'})\n"
                "    assert resp.json().get('is_admin') is not True"
            ),
        ),
        ApiSecurityClaim(
            claim_id="CLAIM-API-04",
            title="Admin Namespace /api/v2/admin/* Enforces Role == ADMIN Across All HTTP Verbs",
            formal_invariant="ForAll(req): startswith(req.path, '/api/v2/admin/') => Implies(req.jwt.role != 'ADMIN', http_status In {401, 403})",
            scope="routers/admin_router.py · GET/POST/PUT/DELETE",
            status="VERIFIED",
            counterexample_witness=None,
            executable_contract_code=(
                "@pytest.mark.parametrize('method', ['GET', 'POST', 'PUT', 'DELETE'])\n"
                "def test_admin_bfla_guard(api_client, member_token, method):\n"
                "    resp = api_client.request(method, '/api/v2/admin/users', headers={'Authorization': f'Bearer {member_token}'})\n"
                "    assert resp.status_code in (401, 403)"
            ),
        ),
        ApiSecurityClaim(
            claim_id="CLAIM-API-05",
            title="Payment Webhook Consumer Verifies HMAC-SHA256 & Timestamp Replay Window",
            formal_invariant="ForAll(webhook): process_webhook(webhook) => hmac_valid(webhook.sig) And abs(now() - webhook.ts) <= 300",
            scope="webhooks/stripe_handler.py",
            status="VERIFIED",
            counterexample_witness=None,
            executable_contract_code=(
                "def test_webhook_replay_window(api_client, stale_signed_webhook):\n"
                "    resp = api_client.post('/api/v2/webhooks/payout', content=stale_signed_webhook.body, headers=stale_signed_webhook.headers)\n"
                "    assert resp.status_code == 400"
            ),
        ),
    ]
