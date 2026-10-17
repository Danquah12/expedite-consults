"""
Pluggable Validator Interfaces & 10 Specialized API Security Analyzers.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, List
from .models import CanonicalApiFinding


@dataclass(frozen=True)
class StaticRouteVerdict:
    reachable: bool
    missing_ownership_filter: bool
    missing_role_middleware: bool
    unpinned_jwt_algorithm: bool
    unfiltered_dto_binding: bool
    notes: List[str]


@dataclass(frozen=True)
class ModuleFindingSummary:
    module_id: str
    module_name: str
    owasp_mapping: str
    status: str
    invariant_checked: str
    findings_count: int


class StaticApiValidator(ABC):
    @abstractmethod
    def analyze_route_controller(self, finding: CanonicalApiFinding) -> StaticRouteVerdict:
        """Inspect route AST, middleware chain, ORM query predicates, and DTO schemas."""


class SpecializedApiSecurityModule(ABC):
    @property
    @abstractmethod
    def module_id(self) -> str:
        ...

    @property
    @abstractmethod
    def module_name(self) -> str:
        ...

    @abstractmethod
    def evaluate(self, context: Dict[str, str]) -> ModuleFindingSummary:
        """Execute defensive configuration/state analysis for this domain."""
