"""Test-Selection Intelligence Engine — Selects relevant security tests based on 8 contextual dimensions."""

from __future__ import annotations

from dataclasses import dataclass
from sqlalchemy.orm import Session

from .. import models
from .policy_engine import evaluate_test_policy
from .test_registry import sync_test_registry


FEATURE_DISPLAY_LABELS: dict[str, str] = {
    "login_page": "Login page",
    "api_endpoint": "API endpoint",
    "user_id_parameter": "User ID parameter",
    "search_parameter": "Search parameter",
    "file_upload": "File upload",
    "admin_interface": "Administrative interface",
    "https_service": "HTTPS service",
    "outdated_software_banner": "Outdated software banner",
    "web_root": "Web application root",
    "network_host": "Network host and TCP services",
}


@dataclass
class SelectedTestPlanItem:
    test_id: str
    test_family: str
    discovered_feature: str
    selection_status: models.SelectionStatus
    rationale: str
    priority: int
    endpoint_id: int | None = None
    technology_id: int | None = None


def select_tests_for_asset(
    db: Session,
    asset: models.Asset,
    endpoints: list[models.Endpoint],
    technologies: list[models.Technology],
    intelligence_matches: list[models.IntelligenceMatch],
    roe: models.RulesOfEngagement | None,
    already_executed_test_ids: set[str] | None = None,
    target_url_override: str | None = None,
) -> list[SelectedTestPlanItem]:
    """
    Evaluate all registered tests against:
      1. Asset type
      2. Technology
      3. Endpoint functionality
      4. Authentication requirements
      5. Parameters and input types
      6. Existing vulnerability intelligence
      7. Rules of Engagement (ROE)
      8. Test risk classification
    Distinguishes: ELIGIBLE, BLOCKED_BY_SCOPE, UNSUPPORTED, ALREADY_EXECUTED, NOT_APPLICABLE.
    """
    catalog = sync_test_registry(db)
    executed = already_executed_test_ids or set()
    effective_target_url = target_url_override or asset.target_url

    # Index discovered features across endpoints, technologies, and services
    feature_to_endpoint: dict[str, models.Endpoint] = {}
    for ep in endpoints:
        if ep.is_duplicate:
            continue
        if ep.surface_type in ("login_page", "api_endpoint", "admin_interface", "file_upload", "web_root"):
            feature_to_endpoint.setdefault(ep.surface_type, ep)
        for in_type in (ep.input_types or []):
            feature_to_endpoint.setdefault(in_type, ep)
        if ep.functionality == "search":
            feature_to_endpoint.setdefault("search_parameter", ep)
        elif ep.functionality == "object_lookup":
            feature_to_endpoint.setdefault("user_id_parameter", ep)

    outdated_tech = next((t for t in technologies if t.is_outdated), None)
    if not outdated_tech and intelligence_matches:
        outdated_tech = technologies[0] if technologies else None

    has_https = (
        asset.scheme == "https"
        or asset.primary_port in (443, 8443)
        or any(p in (443, 8443) for p in (asset.open_ports or []))
    )

    plan_items: list[SelectedTestPlanItem] = []

    for test_def in catalog:
        feat = test_def.target_feature
        feat_label = FEATURE_DISPLAY_LABELS.get(feat, feat)
        matched_ep: models.Endpoint | None = None
        matched_tech: models.Technology | None = None
        applicable = False
        context_note = ""

        # Check applicability based on discovered features, parameters, tech, and asset type
        if feat in ("web_root", "network_host"):
            applicable = True
            matched_ep = feature_to_endpoint.get("web_root")
            context_note = f"Asset '{asset.hostname}' ({asset.asset_type}) exposes {len(asset.open_ports or [])} open ports."
        elif feat == "https_service":
            applicable = has_https
            context_note = "HTTPS/TLS listener detected on asset." if has_https else "No HTTPS/TLS listener detected on target."
        elif feat == "outdated_software_banner":
            if outdated_tech is not None or len(technologies) > 0:
                applicable = True
                matched_tech = outdated_tech or technologies[0]
                cve_count = len(intelligence_matches)
                context_note = (
                    f"Fingerprinted '{matched_tech.name} {matched_tech.version or ''}' "
                    f"(outdated={matched_tech.is_outdated}, ENUMCORE intelligence matches={cve_count})."
                )
            else:
                applicable = False
                context_note = "No software version banners fingerprinted yet."
        else:
            matched_ep = feature_to_endpoint.get(feat)
            if matched_ep is not None:
                applicable = True
                context_note = (
                    f"Matched endpoint '{matched_ep.path}' (functionality={matched_ep.functionality}, "
                    f"params={matched_ep.parameters}, auth_required={matched_ep.auth_required})."
                )
            else:
                applicable = False
                context_note = f"No endpoint with feature '{feat_label}' discovered on asset."

        # Evaluate Policy & Unsupported state first for explicit governance visibility
        policy = evaluate_test_policy(test_def, roe, effective_target_url)

        if not test_def.supported:
            status = models.SelectionStatus.UNSUPPORTED
            rationale = policy.reason
            priority = 0
        elif not policy.allowed:
            status = models.SelectionStatus.BLOCKED_BY_SCOPE
            rationale = policy.reason
            priority = 0
        elif not applicable:
            status = models.SelectionStatus.NOT_APPLICABLE
            rationale = context_note
            priority = 10
        elif test_def.test_id in executed:
            status = models.SelectionStatus.ALREADY_EXECUTED
            rationale = f"Test '{test_def.test_id}' was already executed for asset {asset.asset_key}."
            priority = 20
        else:
            status = models.SelectionStatus.ELIGIBLE
            intel_boost = 25 if intelligence_matches and feat == "outdated_software_banner" else 0
            priority = min(100, 75 + intel_boost)
            rationale = f"{context_note} {policy.reason}"

        plan_items.append(
            SelectedTestPlanItem(
                test_id=test_def.test_id,
                test_family=test_def.family,
                discovered_feature=feat_label,
                selection_status=status,
                rationale=rationale,
                priority=priority,
                endpoint_id=matched_ep.id if matched_ep else None,
                technology_id=matched_tech.id if matched_tech else None,
            )
        )

    return plan_items


def persist_assessment_plan(
    db: Session,
    engagement_id: int,
    scan_id: int,
    asset_id: int,
    items: list[SelectedTestPlanItem],
) -> list[models.AssessmentPlan]:
    """Persist AssessmentPlan records in the database."""
    persisted: list[models.AssessmentPlan] = []
    base_count = db.query(models.AssessmentPlan).count()

    for idx, item in enumerate(items, start=1):
        rec = models.AssessmentPlan(
            plan_key=f"PLAN-{base_count + idx:05d}",
            engagement_id=engagement_id,
            scan_id=scan_id,
            asset_id=asset_id,
            endpoint_id=item.endpoint_id,
            technology_id=item.technology_id,
            test_id=item.test_id,
            test_family=item.test_family,
            discovered_feature=item.discovered_feature,
            selection_status=item.selection_status,
            rationale=item.rationale,
            priority=item.priority,
        )
        db.add(rec)
        db.flush()
        persisted.append(rec)

    return persisted
