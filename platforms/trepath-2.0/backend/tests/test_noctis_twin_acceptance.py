"""
Automated Acceptance Test Suite for NOCTIS-TWIN-001 v2.0 (AT-01 through AT-15)
and TrePath 2.7 Defensive Validation & Scan #47 Reporting Fixes (Section 9.1 A-E).
"""

from __future__ import annotations

from app.noctis_twin import (
    AssetImportRequest,
    FinancialAnalyzeRequest,
    SimulationRunRequest,
    analyze_twin_attack_paths,
    analyze_twin_financial_runway,
    build_twin_graph,
    evaluate_twin_mitigations,
    get_twin_attack_path,
    get_twin_graph_topology,
    get_twin_resilience_score,
    get_twin_simulation_endpoint,
    import_twin_assets,
    list_twin_assets,
    router as noctis_twin_router,
    run_twin_simulation_endpoint,
    verify_noctis_twin_acceptance_suite,
)
from app.finding_normalizer import (
    ASSESSMENT_TARGET_VALIDITY_STATES,
    OWNERSHIP_AND_RELEVANCE_CLASSIFICATIONS,
    build_consolidated_finding_intelligence,
    classify_submitted_target_type,
)
from app.version_manifest import get_version_manifest
from app.remediation import REMEDIATION_LIFECYCLE_STATES, RTEX_SEVEN_POINT_VERIFICATION_SPEC
from app.attack_graph import build_attack_graph_intelligence_summary
from app.trepath_2_9_architecture import (
    ARCHITECTURAL_DOCTRINE,
    EVE_3_0_COMPONENTS,
    EVE_3_0_OUTCOME_STATES,
    NOCTIS_SEVEN_RESPONSIBILITIES,
    THREE_PROOF_LEVELS,
    evaluate_noctis_twin_eight_enterprise_questions,
    evaluate_proof_level,
    get_trepath_2_9_architecture_blueprint,
    run_trepath_2_9_end_to_end_workflow,
)


def test_noctis_twin_all_12_apis_and_15_acceptance_gates():
    route_paths = {getattr(r, "path", "") for r in noctis_twin_router.routes}
    expected_paths = {
        "/api/v1/twin/assets/import",
        "/api/v1/twin/assets",
        "/api/v1/twin/graph/build",
        "/api/v1/twin/graph/topology",
        "/api/v1/twin/attack-paths/analyze",
        "/api/v1/twin/attack-paths/{path_id}",
        "/api/v1/twin/simulations/run",
        "/api/v1/twin/simulations/{sim_id}",
        "/api/v1/twin/mitigations/evaluate",
        "/api/v1/twin/resilience/score",
        "/api/v1/twin/financial/analyze",
        "/api/v1/twin/validation/verify",
    }
    assert expected_paths.issubset(route_paths)

    # 1. GET /api/v1/twin/assets
    data_assets = list_twin_assets()
    assert data_assets["total_archetype_assets"] == 6
    assert data_assets["total_enterprise_fleet_assets"] == 1420
    assert len(data_assets["entities_implemented"]) == 22

    # 2. POST /api/v1/twin/assets/import
    r_imp = import_twin_assets(AssetImportRequest(assets=[]))
    assert r_imp["status"] == "IMPORTED"

    # 3. POST /api/v1/twin/graph/build & 4. GET /api/v1/twin/graph/topology
    r_build = build_twin_graph()
    assert r_build["nodes_count"] == 6
    assert r_build["edges_count"] == 5

    r_topo = get_twin_graph_topology()
    assert r_topo["entity_types_count"] == 22

    # 5. POST /api/v1/twin/attack-paths/analyze & 6. GET /api/v1/twin/attack-paths/{id}
    r_ap = analyze_twin_attack_paths(SimulationRunRequest(threat_detonated=True))
    path_id = r_ap["attack_path_id"]
    assert r_ap["path_classification"] == "HYPOTHETICAL_SIMULATED_PATH"

    r_ap_get = get_twin_attack_path(path_id)
    assert r_ap_get["attack_path_id"] == path_id

    # 7. POST /api/v1/twin/simulations/run & 8. GET /api/v1/twin/simulations/{id}
    sim_data = run_twin_simulation_endpoint(
        SimulationRunRequest(
            threat_detonated=True,
            isolated_choke_point_ids=["edge-vpn-choke", "edge-smb-choke"],
            air_gap_backups_enforced=True,
        )
    )
    sim_id = sim_data["simulation_id"]
    assert sim_data["blast_radius"]["archetype_node_blast_radius_percent"] == 16.67
    assert sim_data["blast_radius"]["enterprise_fleet_blast_radius_percent"] == 0.07
    assert sim_data["financial_impact"]["post_incident_runway_months"] == 12.50

    r_sim_get = get_twin_simulation_endpoint(sim_id)
    assert r_sim_get["simulation_id"] == sim_id

    # 9. POST /api/v1/twin/mitigations/evaluate
    r_mit = evaluate_twin_mitigations()
    controls = r_mit["mitigation_controls"]
    assert [c["measured_blast_reduction_percent"] for c in controls] == [83, 67, 17]

    # 10. GET /api/v1/twin/resilience/score
    r_res = get_twin_resilience_score()
    assert r_res["composite_resilience_percent"] > 0

    # 11. POST /api/v1/twin/financial/analyze
    fin_data = analyze_twin_financial_runway(FinancialAnalyzeRequest())
    assert fin_data["baseline_runway_months"] == 13.18
    assert fin_data["direct_outage_loss_usd"] == 74800
    assert fin_data["post_incident_runway_months"] == 12.50

    # 12. POST /api/v1/twin/validation/verify (Runs AT-01 through AT-15)
    ver_data = verify_noctis_twin_acceptance_suite()
    assert ver_data["all_passed"] is True
    assert ver_data["passed_count"] == 15
    assert ver_data["total_tests"] == 15


def test_trepath_2_7_target_validity_and_score_normalization():
    assert len(OWNERSHIP_AND_RELEVANCE_CLASSIFICATIONS) == 6

    gh = classify_submitted_target_type("https://github.com/OWASP/crAPI")
    assert gh["assessment_target_validity"] == "REPOSITORY_SOURCE_AVAILABLE_FOR_SAST"
    assert gh["ownership_and_relevance_classification"] == "SOURCE_CODE_REPOSITORY"
    assert gh["enters_client_remediation_sla_by_default"] is False

    ow = classify_submitted_target_type("https://owasp.org/projects/juice-shop")
    assert ow["assessment_target_validity"] == "DOCUMENTATION_ONLY_RESOURCE"
    assert ow["ownership_and_relevance_classification"] == "DOCUMENTATION_RESOURCE"
    assert ow["enters_client_remediation_sla_by_default"] is False

    thm = classify_submitted_target_type("https://tryhackme.com")
    assert thm["assessment_target_validity"] == "TRAINING_PORTAL_WITHOUT_AUTHORIZED_LAB_INSTANCE"
    assert thm["ownership_and_relevance_classification"] == "TRAINING_ENVIRONMENT"
    assert thm["enters_client_remediation_sla_by_default"] is False

    lab = classify_submitted_target_type("http://192.168.195.139:8080/manager/html")
    assert lab["assessment_target_validity"] == "APPLICATION_INSTANCE_PROVISIONED_AND_ACCESSIBLE"
    assert lab["ownership_and_relevance_classification"] == "CLIENT_OWNED_ASSET"
    assert lab["enters_client_remediation_sla_by_default"] is True
    assert "LAB_INSTANCE_VERIFIED" in ASSESSMENT_TARGET_VALIDITY_STATES


def test_trepath_2_8_2_9_and_2_10_lab_e2e_verified_workflow():
    # 1. Version Manifest 2.11.0 & Architectural Doctrine
    vm = get_version_manifest()
    assert vm["release_version"] in ("2.10.0", "2.11.0", "2.12.0", "2.13.0", "2.14.0")
    assert vm["build_identifier"] in (
        "TP210-BUILD-20261103-LAB-E2E-VERIFIED",
        "TP211-BUILD-20261103-NOCTIS-REASONING-AND-VALIDATION",
        "TP212-BUILD-20261103-CANONICAL-STATE-AND-BENCHMARK",
        "TP213-BUILD-20261104-ENTERPRISE-ASSURANCE-PEVE",
        "TP214-BUILD-20261104-AUTONOMOUS-ASSURANCE-PLATFORM",
    )
    assert vm["architectural_doctrine"] == ARCHITECTURAL_DOCTRINE

    # 2. 10-State Remediation & 7-Point RTEX Verification Lifecycle
    assert len(REMEDIATION_LIFECYCLE_STATES) == 10
    assert "PARTIALLY_REMEDIATED" in REMEDIATION_LIFECYCLE_STATES
    assert "REOPENED" in REMEDIATION_LIFECYCLE_STATES
    assert len(RTEX_SEVEN_POINT_VERIFICATION_SPEC) == 7

    # 3. Consolidated Finding Risk Explainability, 8-Boolean Auth Provenance & TCP NOT_SCANNED Distinction
    intel = build_consolidated_finding_intelligence(findings=[], asset=None, endpoints=[], intel_matches=[], assets=[])
    assert intel["port_and_transport_reconciliation"]["tcp_scan_distinction"] == "NOT_SCANNED"

    # 4. AttackGraph 10-Capability Output
    ag = build_attack_graph_intelligence_summary(findings=[], attack_paths=[], retest_execs=[])
    caps = ag["attack_graph_2_8_capabilities"]
    assert "shortest_viable_path" in caps
    assert "privilege_escalation_path_analysis" in caps
    assert "blast_radius_calculation" in caps
    assert caps["attack_path_replay_and_reconstruction"]["deterministic_replay_ready"] is True

    # 5. TrePath 2.9/2.10 Blueprint, 7 Noctis Responsibilities, EVE 3.0 (7 Components & 10 States)
    bp = get_trepath_2_9_architecture_blueprint()
    assert bp["execution_separation_policy"]["ai_direct_exploit_execution_permitted"] is False
    assert len(NOCTIS_SEVEN_RESPONSIBILITIES) == 7
    assert len(EVE_3_0_COMPONENTS) == 7
    assert len(EVE_3_0_OUTCOME_STATES) == 10
    assert len(THREE_PROOF_LEVELS) == 3

    # 6. Anti-Hallucination Proof-Level Guardrail: High AI confidence (0.99) NEVER promotes to Level 3 without adapter execution
    blocked_eval = evaluate_proof_level(
        ai_plausibility_assessed=True,
        ai_confidence=0.99,
        independent_corroborating_evidence_count=2,
        authorized_deterministic_test_executed=False,
        deterministic_test_established_boundary_violation=False,
        evidencecore_sha256_ref=None,
    )
    assert blocked_eval["proof_level_id"] == "LEVEL_2_EVIDENCE_CORROBORATED"
    assert blocked_eval["ai_confidence_promotion_blocked"] is True

    # 7. Noctis Digital Twin Enterprise Scale (200 servers, 40 apps, 15 DBs, 3,000 identities, 12 segments, 80 controls) & 8 Q&A
    twin_qa = evaluate_noctis_twin_eight_enterprise_questions()
    assert twin_qa["environment_scale"]["servers"] == 200
    assert twin_qa["environment_scale"]["identities"] == 3000
    assert twin_qa["questions_evaluated"] == 8

    # 8. End-to-End 10-Stage Authorized Lab Release Acceptance Scenario (Scan #49 Section 10 & 11)
    e2e = run_trepath_2_9_end_to_end_workflow()
    assert e2e["build_identifier"] == "TP210-BUILD-20261103-LAB-E2E-VERIFIED"
    assert e2e["execution_separation_verified"] is True
    assert e2e["ai_executed_exploit_payload"] is False
    assert e2e["workflow_stages_completed"] == 10

    # Verify Stage 6 Approved + Denied Orchestrator Branches & Canonical Ledger Outcomes
    st6 = e2e["stages"][5]
    assert st6["canonical_ledger_outcome"] == "COMPLETED_CONFIRMED"
    assert st6["denied_branch_audit_proof"]["canonical_ledger_outcome"] == "AUTHORIZATION_BLOCKED"
    assert st6["denied_branch_audit_proof"]["enters_client_remediation_sla_by_default"] is False

    # Verify Stage 7 All 5 AttackGraph Stages (S1-S5) Proven in Lab
    st7 = e2e["stages"][6]
    assert st7["evidence_validated_attack_paths_count"] == 1
    assert all(s["status"] == "DEMONSTRATED" for s in st7["five_stage_attack_path_progression"])

    # Verify Stage 9 RTEX Negative-Control WAF/Anti-Bot Rejection + True Remediation Verification
    st9 = e2e["stages"][8]
    assert "REJECTED_CLOSURE" in st9["negative_control_waf_rejection_test"]["rtex_decision"]
    assert st9["true_remediation_retest"]["rtex_decision"] == "VERIFIED_CLOSED (REMEDIATION_VERIFIED)"

    # Verify Independent Offline EvidenceCore Ed25519 Verification
    off_ver = e2e["independent_offline_evidencecore_verification"]
    assert off_ver["verified_without_trepath_runtime"] is True
    assert off_ver["verification_status"] == "INDEPENDENTLY_VERIFIED_AUTHENTIC"

    conclusion = e2e["mandatory_security_conclusion"]
    assert len(conclusion) == 9
    assert conclusion["finding_identifier"] == "XTRIKE-SQLI-001"
