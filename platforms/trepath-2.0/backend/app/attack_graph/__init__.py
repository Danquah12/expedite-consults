"""AttackGraph — Correlates individual findings into multi-step attack paths with Chokepoint & Blast Radius analysis."""

from __future__ import annotations

from sqlalchemy.orm import Session
from .. import models


def _proof_str(f: models.Finding) -> str:
    return f.proof_state.value if hasattr(f.proof_state, "value") else str(f.proof_state)


def build_attack_paths(
    db: Session,
    engagement_id: int,
    scan_id: int,
    asset: models.Asset,
    findings: list[models.Finding],
) -> list[models.AttackPath]:
    """
    Correlate reconnaissance, service/version exposure, transport posture, and application weaknesses
    into multi-step AttackPath records across 3 distinct attack chain families.
    """
    paths: list[models.AttackPath] = []
    if not findings:
        return paths

    port_findings = [
        f for f in findings
        if f.finding_key.startswith(("PORT-", "NMAP-PORT-", "ENUM-PROTO-"))
    ]
    version_or_cve = [
        f for f in findings
        if f.cve_id
        or f.finding_key.startswith(("DAST-VER-INTEL-", "NUCLEI-", "NMAP-"))
        or "version" in f.title.lower()
        or "outdated" in f.title.lower()
    ]
    admin_or_web = [
        f for f in findings
        if f.finding_key.startswith(("WEB-EXPOSED-", "DAST-ADMIN-ACCESS-", "ZAP-"))
        or "admin" in f.title.lower()
    ]
    transport_findings = [
        f for f in findings
        if f.finding_key.startswith(("HTTP-NO-HTTPS", "HTTP-HSTS", "TLS-", "PORT-OPEN-80"))
    ]
    auth_or_session = [
        f for f in findings
        if "10105" in f.finding_key
        or f.finding_key.startswith(("ENUM-AUTH-REALM-", "DAST-AUTH-", "ENUM-FORM-"))
        or "auth" in f.title.lower()
        or "cookie" in f.title.lower()
        or "csrf" in f.title.lower()
    ]
    header_or_cookie_gaps = [
        f for f in findings
        if f.finding_key.startswith("HTTP-") or "cookie" in f.title.lower() or "header" in f.title.lower()
    ]
    api_or_input = [
        f for f in findings
        if f.finding_key.startswith(("DAST-API-AUTHZ-", "DAST-BOLA-IDOR-", "APP-ACTIVE-", "ENUM-HTTP-METHODS-", "WEB-CORS-"))
    ]
    high_sev = [f for f in findings if (f.severity or "").lower() in ("critical", "high")]

    base_count = db.query(models.AttackPath).count()
    seq = 0

    # -------------------------------------------------------------------------
    # Chain 1: External Network Service Exposure -> Version/CVE Intelligence -> Application/Admin Control Gap
    # -------------------------------------------------------------------------
    if port_findings and (version_or_cve or admin_or_web or high_sev):
        seq += 1
        entry = port_findings[0]
        pivot = (version_or_cve or high_sev or admin_or_web)[0]
        objective = (admin_or_web or high_sev or [pivot])[0]

        chain_nodes: list[models.Finding] = [entry]
        if pivot.id != entry.id:
            chain_nodes.append(pivot)
        if objective.id not in {n.id for n in chain_nodes}:
            chain_nodes.append(objective)

        steps = []
        phases = [
            ("Initial Network Reconnaissance", "entry_point"),
            ("Version / CVE Weaponization", "pivot"),
            ("Privilege / Administrative Boundary Gap", "objective"),
        ]
        for idx, node in enumerate(chain_nodes):
            ph_label, node_type = phases[min(idx, len(phases) - 1)]
            steps.append({
                "step": idx + 1,
                "phase": ph_label,
                "node_type": node_type,
                "finding_id": node.id,
                "finding_key": node.finding_key,
                "summary": node.title,
                "severity": node.severity,
                "proof_state": _proof_str(node),
                "mitigation_chokepoint": node.remediation,
                "blast_radius": f"Host {asset.hostname} ({asset.asset_key})",
            })

        max_prio = max(float(n.risk_priority or 55.0) for n in chain_nodes)
        has_high = any((n.severity or "").lower() in ("critical", "high") for n in chain_nodes)
        rec = models.AttackPath(
            path_key=f"PATH-{base_count + seq:05d}",
            engagement_id=engagement_id,
            scan_id=scan_id,
            asset_id=asset.id,
            title=f"External Service Exposure to Version/Application Control Gap on {asset.hostname}",
            severity="critical" if max_prio >= 85.0 else ("high" if has_high else "medium"),
            composite_risk_score=round(min(100.0, max_prio * 1.05), 1),
            proof_state=models.ProofState.ATTACK_PATH_VALIDATED if len(chain_nodes) >= 2 else models.ProofState.OBSERVATION_CONFIRMED,
            finding_ids=[n.id for n in chain_nodes],
            steps_json=steps,
            narrative=(
                f"Adversary discovers reachable network service ({entry.finding_key}) on {asset.hostname}, "
                f"correlates service/version telemetry ({pivot.finding_key}), and targets application/administrative "
                f"control surface ({objective.finding_key}: {objective.title}). "
                f"Primary Chokepoint: {objective.remediation}"
            ),
        )
        db.add(rec)
        db.flush()
        paths.append(rec)

    # -------------------------------------------------------------------------
    # Chain 2: Unencrypted HTTP Transport -> Authentication / Session Surface -> Session Hardening Gap
    # -------------------------------------------------------------------------
    if (transport_findings or port_findings) and (auth_or_session or header_or_cookie_gaps):
        seq += 1
        t_node = (transport_findings or port_findings)[0]
        a_node = (auth_or_session or header_or_cookie_gaps)[0]
        s_node = (header_or_cookie_gaps or [a_node])[-1]

        chain_nodes_2: list[models.Finding] = [t_node]
        if a_node.id != t_node.id:
            chain_nodes_2.append(a_node)
        if s_node.id not in {n.id for n in chain_nodes_2}:
            chain_nodes_2.append(s_node)

        if len(chain_nodes_2) >= 2:
            steps_2 = []
            phases_2 = [
                ("Cleartext Transport Exposure", "entry_point"),
                ("Authentication / Credential Challenge Exposure", "pivot"),
                ("Session Token / Browser Policy Hardening Gap", "objective"),
            ]
            for idx, node in enumerate(chain_nodes_2):
                ph_label, node_type = phases_2[min(idx, len(phases_2) - 1)]
                steps_2.append({
                    "step": idx + 1,
                    "phase": ph_label,
                    "node_type": node_type,
                    "finding_id": node.id,
                    "finding_key": node.finding_key,
                    "summary": node.title,
                    "severity": node.severity,
                    "proof_state": _proof_str(node),
                    "mitigation_chokepoint": node.remediation,
                    "blast_radius": "Authenticated User Sessions & Credentials in Transit",
                })

            max_prio_2 = max(float(n.risk_priority or 45.0) for n in chain_nodes_2)
            rec_2 = models.AttackPath(
                path_key=f"PATH-{base_count + seq:05d}",
                engagement_id=engagement_id,
                scan_id=scan_id,
                asset_id=asset.id,
                title=f"Unencrypted Transport & Authentication/Session Control Chain on {asset.hostname}",
                severity="high" if any((n.severity or "").lower() in ("critical", "high") for n in chain_nodes_2) else "medium",
                composite_risk_score=round(min(100.0, max_prio_2 * 1.04), 1),
                proof_state=models.ProofState.CONTROL_GAP_CONFIRMED,
                finding_ids=[n.id for n in chain_nodes_2],
                steps_json=steps_2,
                narrative=(
                    f"Traffic served over unencrypted or non-redirecting transport ({t_node.finding_key}) exposes "
                    f"authentication or session handling ({a_node.finding_key}: {a_node.title}) and compounds "
                    f"browser/cookie policy gaps ({s_node.finding_key}). Enforcing HTTPS/HSTS breaks the chain at Step 1."
                ),
            )
            db.add(rec_2)
            db.flush()
            paths.append(rec_2)

    # -------------------------------------------------------------------------
    # Chain 3: API / Route Surface Enumeration -> Object-Level Authorization / Input Boundary
    # -------------------------------------------------------------------------
    if len(api_or_input) >= 2:
        seq += 1
        entry_api = api_or_input[0]
        pivot_api = api_or_input[1]
        chain_nodes_3 = [entry_api, pivot_api]
        steps_3 = [
            {
                "step": 1,
                "phase": "API / HTTP Verb Surface Discovery",
                "node_type": "entry_point",
                "finding_id": entry_api.id,
                "finding_key": entry_api.finding_key,
                "summary": entry_api.title,
                "severity": entry_api.severity,
                "proof_state": _proof_str(entry_api),
                "mitigation_chokepoint": entry_api.remediation,
                "blast_radius": "API & Parameterized Application Routes",
            },
            {
                "step": 2,
                "phase": "Object Authorization / Input Boundary Probe",
                "node_type": "objective",
                "finding_id": pivot_api.id,
                "finding_key": pivot_api.finding_key,
                "summary": pivot_api.title,
                "severity": pivot_api.severity,
                "proof_state": _proof_str(pivot_api),
                "mitigation_chokepoint": pivot_api.remediation,
                "blast_radius": "Application Data & Input Handling Layer",
            },
        ]
        max_prio_3 = max(float(n.risk_priority or 50.0) for n in chain_nodes_3)
        rec_3 = models.AttackPath(
            path_key=f"PATH-{base_count + seq:05d}",
            engagement_id=engagement_id,
            scan_id=scan_id,
            asset_id=asset.id,
            title=f"API Surface & Parameter Boundary Chain on {asset.hostname}",
            severity="high" if max_prio_3 >= 65.0 else "medium",
            composite_risk_score=round(min(100.0, max_prio_3 * 1.05), 1),
            proof_state=models.ProofState.CONTROL_GAP_CONFIRMED,
            finding_ids=[n.id for n in chain_nodes_3],
            steps_json=steps_3,
            narrative=(
                f"Reachable API or HTTP method surface ({entry_api.finding_key}) chains with parameter/boundary "
                f"observation ({pivot_api.finding_key}: {pivot_api.title})."
            ),
        )
        db.add(rec_3)
        db.flush()
        paths.append(rec_3)

    return paths


__all__ = ["build_attack_paths"]
