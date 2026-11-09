"""
TrePath 2.14 (`TP214-BUILD-20261104-AUTONOMOUS-ASSURANCE-PLATFORM`) —
Automated Acceptance Test Suite (`AT-01` through `AT-12` + `EMAT-60/150/300` + Scan #53 Remediation Verification).
"""

from __future__ import annotations

from app import models
from app.database import SessionLocal
from app.eve.services import ExploitOrchestrator
from app.reporting.pdf_generator import generate_pdf_assessment_report
from app.risk import compute_asset_risk_profile
from app.trepath_2_11_validation_harness import (
    evaluate_trepath_2_11_acceptance_tests,
    execute_trepath_2_11_controlled_lab_cycle_on_scan,
)
from app.version_manifest import TREPATH_VERSION_MANIFEST


def test_trepath_2_11_version_and_build_manifest():
    assert TREPATH_VERSION_MANIFEST["platform_version"] == "TrePath 2.14"
    assert TREPATH_VERSION_MANIFEST["release_version"] == "2.14.0"
    assert TREPATH_VERSION_MANIFEST["build_identifier"] == "TP214-BUILD-20261104-AUTONOMOUS-ASSURANCE-PLATFORM"
    assert len(TREPATH_VERSION_MANIFEST["six_interconnected_assurance_engines"]) == 6


def test_trepath_2_11_scan_50_end_to_end_reconciliation_and_twelve_acceptance_tests():
    db = SessionLocal()
    try:
        scan_ids = [50, 51, 52]
        for extra_id in (44, 53):
            if db.get(models.Scan, extra_id) is not None:
                scan_ids.append(extra_id)

        for scan_id in scan_ids:
            res = execute_trepath_2_11_controlled_lab_cycle_on_scan(db, scan_id)
            assert res["status"] == "LAB_E2E_VALIDATION_AND_RTEX_RECORDED"

            # Scan #53 Issue 3: Verify F-01 (`XTRIKE-DAST-SQLI-001`) has no synthetic CVE assigned
            f_sqli = db.query(models.Finding).filter_by(scan_id=scan_id, finding_key="XTRIKE-DAST-SQLI-001").first()
            assert f_sqli is not None
            assert f_sqli.cve_id is None
            assert f_sqli.cwe_id == "CWE-89"

            dossier = evaluate_trepath_2_11_acceptance_tests(db, scan_id)
            assert dossier["platform_version"] == "TrePath 2.14"
            assert dossier["passed_count"] == 12
            assert dossier["total_count"] == 12
            assert dossier["all_twelve_passed"] is True
            for at in dossier["acceptance_tests"]:
                assert at["passed"] is True, f"Scan #{scan_id} Acceptance test {at['test_id']} ({at['category']}) failed: {at}"

            emat_60 = dossier["emat_60_enterprise_maturity_suite"]
            assert emat_60["total_gates"] == 60
            assert emat_60["passed_gates"] == 60
            assert emat_60["all_sixty_passed"] is True
            assert len(emat_60["three_tier_emat_architecture"]) == 3

            peve = dossier["peve_2_13_post_exploitation_engine"]
            assert peve["modules_count"] == 7
            assert peve["simulation_promotion_guard_enforced"] is True
            assert len(peve["peve_controlled_lab_validation_suites"]) == 5

            edge_ledger = dossier["attack_graph_edge_evidence_ledger"]
            assert edge_ledger["total_edges_audited"] >= 8
            assert edge_ledger["all_edges_have_ten_mandatory_fields"] is True
            assert edge_ledger["distinct_causal_progression_verified"] is True
            assert len(edge_ledger["graph_replay_trace"]) == 5

            holdout = dossier["independent_noctis_holdout_benchmark_ood_60"]
            assert holdout["total_holdout_scenarios"] == 60
            assert holdout["holdout_scenarios_passed"] == 57
            assert len(holdout["ood_60_three_failures_post_mortem"]) == 3
            assert holdout["expanded_ood_500_benchmark"]["total_scenarios"] == 500
            assert holdout["expanded_ood_500_benchmark"]["scenarios_passed"] == 478
            assert holdout["data_leakage_and_independence_controls"]["exact_or_near_duplicate_overlap_count"] == 0

            forensic = dossier["evidencecore_forensic_verifier_package"]
            assert forensic["standalone_verifier_result"]["overall_verification_passed"] is True
            assert forensic["standalone_verifier_result"]["one_byte_artifact_mutation_rejected"] is True
            assert forensic["standalone_verifier_result"]["revoked_or_expired_key_rejected"] is True
            assert len(forensic["standalone_verifier_result"]["nine_step_verification_protocol"]) == 9
            assert len(forensic["eight_forensic_controls"]) == 8

            auth_rem = dossier["authorization_and_remediation_scope_separation"]
            assert (
                auth_rem["three_state_remediation_action_separation"]["state_2_configurations_or_code_modified"][
                    "external_third_party_origins_modified"
                ]
                == 0
            )
            assert "10_revocation_status" in auth_rem["ten_field_engagement_authorization_contract"]

            bench = dossier["noctis_reasoning_benchmark_100"]
            assert bench["total_controlled_scenarios"] == 100
            assert bench["scenarios_passed"] >= 95
            assert len(dossier["rtex_ten_field_preservation_ledger"]) >= 3

            eve_summary = ExploitOrchestrator.get_scan_eve_summary(db, scan_id)
            assert eve_summary["total_jobs"] == eve_summary["total_consolidated_findings"]
            assert eve_summary["three_dimension_summary"]["executed_active_adapters_count"] == 2
            assert eve_summary["three_dimension_summary"]["promoted_to_level_3_count"] == 2
            assert eve_summary["three_dimension_summary"]["impact_verified_count"] == 2
            assert eve_summary["three_dimension_summary"]["rtex_remediation_verified_count"] == 2
            assert eve_summary["three_dimension_summary"]["rtex_negative_control_rejected_count"] == 1

            risk_profile = compute_asset_risk_profile(db, scan_id)
            # Scan #53 Issue 1: `is_proof_of_compromise` on the composite risk index must be False
            attest = risk_profile["score_pillar_attribution"]["score_explainability_attestation"]
            assert attest["is_proof_of_compromise"] is False
            assert attest["confirmed_compromise_points"] > 0.0

            # Scan #53 Issue 2: Inherent Asset Criticality stays 7.0 -> 7.0 while Exploitable Exposure drops 7.0 -> 2.0
            canonical_calc = risk_profile["canonical_risk_calculation"]
            assert canonical_calc["arithmetic_consistency_verified"] is True
            assert canonical_calc["is_proof_of_compromise"] is False
            crit_split = canonical_calc["asset_criticality_three_metric_split"]
            assert crit_split["inherent_asset_criticality"]["t0_score"] == 7.0
            assert crit_split["inherent_asset_criticality"]["t1_score"] == 7.0
            assert crit_split["exploitable_asset_exposure"]["t0_score"] == 7.0
            assert crit_split["exploitable_asset_exposure"]["t1_score"] == 2.0

            # Scan #53 Issue 5: Evidence Quality metrics present
            sensor_rec = risk_profile["seven_state_sensor_reconciliation"]
            assert len(sensor_rec["state_counts"]) == 7
            assert "evidence_quality_metrics" in sensor_rec
            assert sensor_rec["evidence_quality_metrics"]["2_orphan_artifact_count"] == 0

            # Scan #44 Independent Technical Analysis Remediation & Governance Verification
            s44_gov = dossier["scan_44_to_2_14_remediation_and_governance"]
            assert s44_gov["all_ten_priorities_implemented"] is True
            assert len(s44_gov["eve_seven_state_outcome_taxonomy"]["states"]) == 7
            assert s44_gov["attack_path_six_condition_correlation_gate"]["legacy_path_00023_remediated"] is True
            assert len(s44_gov["attack_path_six_condition_correlation_gate"]["six_mandatory_correlation_conditions"]) == 6
            assert len(s44_gov["eight_point_post_exploitation_proof_matrix"]) == 8
            assert len(s44_gov["explicit_scheme_port_access_boundary_table"]) == 3
            assert s44_gov["overall_assessment_completeness"]["current_status"] in ("COMPLETE", "COMPLETE_WITH_LIMITATIONS")
            assert len(s44_gov["post_exploitation_terminology_classification"]["four_canonical_post_exploitation_states"]) == 4
            assert len(s44_gov["five_dimension_finding_severity_separation"]["five_dimensions_schema"]) == 5
            assert s44_gov["five_timestamp_chronology_validation"]["chronological_ordering_valid"] is True
            assert len(s44_gov["ten_priority_closure_ledger"]) == 10

            pdf_bytes = generate_pdf_assessment_report(db, scan_id)
            assert pdf_bytes.startswith(b"%PDF-1.4")
            assert b"TP214-BUILD-20261104-AUTONOMOUS-ASSURANCE-PLATFORM" in pdf_bytes
            assert b"Step 1 (None)" not in pdf_bytes
            assert b"NOCTIS-HOLDOUT-OOD-500" in pdf_bytes
            assert b"OOD-60-SCEN-024" in pdf_bytes
            assert b"PEVE 2.14" in pdf_bytes
            assert b"EMAT-60-150-300" in pdf_bytes or b"EMAT-150" in pdf_bytes
            assert b"PRECONDITION_NOT_MET" in pdf_bytes
            assert b"PATH-00023" in pdf_bytes and b"COND-01" in pdf_bytes
            assert b"COMPLETE_WITH_LIMITATIONS" in pdf_bytes
    finally:
        db.close()
