"use client";

import { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type NodeType =
  | "application"
  | "api"
  | "finding"
  | "ticket"
  | "team"
  | "evidence"
  | "risk"
  | "verification";

type GraphNode = {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
  subLabel?: string;
  metadata?: Record<string, string>;
};

type GraphEdge = {
  from: string;
  to: string;
  label?: string;
};

type ViewId = 1 | 2 | 3 | 4 | 5;

// ─── Node Colors ──────────────────────────────────────────────────────────────

const NODE_COLORS: Record<NodeType, string> = {
  application: "#4fc3f7",
  api: "#60a5fa",
  finding: "#ef5350",
  ticket: "#ff8a65",
  team: "#ce93d8",
  evidence: "#a5d6a7",
  risk: "#ffcc80",
  verification: "#80deea",
};

const NODE_RADIUS: Record<NodeType, number> = {
  application: 36,
  api: 28,
  finding: 28,
  ticket: 28,
  team: 28,
  evidence: 28,
  risk: 28,
  verification: 28,
};

// ─── View Data ────────────────────────────────────────────────────────────────

const VIEWS: Record<
  ViewId,
  { title: string; nodes: GraphNode[]; edges: GraphEdge[] }
> = {
  1: {
    title: "Application-Centric",
    nodes: [
      { id: "cp", label: "Customer Portal", type: "application", x: 400, y: 80, metadata: { Type: "Application", "Asset ID": "APP-001", Owner: "Team A", Risk: "HIGH" } },
      { id: "la", label: "Login API", type: "api", x: 150, y: 200, metadata: { Type: "API", Version: "v2.1", Findings: "2", Risk: "HIGH" } },
      { id: "pa", label: "Payment API", type: "api", x: 400, y: 200, metadata: { Type: "API", Version: "v3.0", Findings: "3", Risk: "CRITICAL" } },
      { id: "pra", label: "Profile API", type: "api", x: 650, y: 200, metadata: { Type: "API", Version: "v1.8", Findings: "1", Risk: "MEDIUM" } },
      { id: "xss", label: "XSS Finding", type: "finding", x: 150, y: 340, metadata: { ID: "F-002", Severity: "High", Status: "Open", CVSS: "7.4" } },
      { id: "sqli", label: "SQL Injection", type: "finding", x: 400, y: 340, metadata: { ID: "F-001", Severity: "Critical", Status: "Open", CVSS: "9.8" } },
      { id: "auth", label: "Auth Bypass", type: "finding", x: 650, y: 340, metadata: { ID: "F-003", Severity: "Critical", Status: "In Review", CVSS: "9.1" } },
      { id: "t100", label: "Ticket-100", type: "ticket", x: 150, y: 460, metadata: { ID: "JRA-100", Status: "Open", Priority: "High", Assignee: "team-a" } },
      { id: "t200", label: "Ticket-200", type: "ticket", x: 400, y: 460, metadata: { ID: "JRA-200", Status: "Open", Priority: "Critical", Assignee: "team-b" } },
      { id: "t300", label: "Ticket-300", type: "ticket", x: 650, y: 460, metadata: { ID: "JRA-300", Status: "In Review", Priority: "Critical", Assignee: "team-c" } },
      { id: "ta", label: "Team A", type: "team", x: 150, y: 580, metadata: { Members: "8", Findings: "15", MTTR: "6d", Risk: "210" } },
      { id: "tb", label: "Team B", type: "team", x: 400, y: 580, metadata: { Members: "12", Findings: "42", MTTR: "14d", Risk: "820" } },
      { id: "tc", label: "Team C", type: "team", x: 650, y: 580, metadata: { Members: "5", Findings: "8", MTTR: "4d", Risk: "91" } },
    ],
    edges: [
      { from: "cp", to: "la" },
      { from: "cp", to: "pa" },
      { from: "cp", to: "pra" },
      { from: "la", to: "xss" },
      { from: "pa", to: "sqli" },
      { from: "pra", to: "auth" },
      { from: "xss", to: "t100" },
      { from: "sqli", to: "t200" },
      { from: "auth", to: "t300" },
      { from: "t100", to: "ta" },
      { from: "t200", to: "tb" },
      { from: "t300", to: "tc" },
    ],
  },
  2: {
    title: "Risk Propagation",
    nodes: [
      { id: "pa2", label: "Payment API", type: "api", x: 400, y: 80, metadata: { Type: "API", Risk: "CRITICAL", Exposure: "Public" } },
      { id: "sqli2", label: "SQL Injection", type: "finding", x: 400, y: 200, metadata: { ID: "F-001", CVSS: "9.8", Exploitable: "Yes" } },
      { id: "rs94", label: "Risk Score 94", type: "risk", x: 400, y: 320, metadata: { Score: "94/100", Level: "CRITICAL", Updated: "Aug 21" } },
      { id: "cdata", label: "Customer Data", type: "application", x: 200, y: 440, metadata: { Records: "1.2M", Classification: "PII", Impact: "HIGH" } },
      { id: "billing", label: "Billing System", type: "application", x: 600, y: 440, metadata: { System: "Stripe", Transactions: "12k/day", Impact: "HIGH" } },
      { id: "hi", label: "High Impact", type: "risk", x: 200, y: 560, metadata: { Level: "HIGH", Likelihood: "Probable" } },
      { id: "mi", label: "Medium Impact", type: "risk", x: 600, y: 560, metadata: { Level: "MEDIUM", Likelihood: "Possible" } },
    ],
    edges: [
      { from: "pa2", to: "sqli2", label: "exposes" },
      { from: "sqli2", to: "rs94", label: "scores" },
      { from: "rs94", to: "cdata", label: "impacts" },
      { from: "rs94", to: "billing", label: "impacts" },
      { from: "cdata", to: "hi", label: "risk" },
      { from: "billing", to: "mi", label: "risk" },
    ],
  },
  3: {
    title: "Team Ownership",
    nodes: [
      { id: "sr", label: "Security Risk", type: "risk", x: 400, y: 60, metadata: { Total: "1121", Level: "HIGH", Trend: "↑" } },
      { id: "ta3", label: "Team A", type: "team", x: 150, y: 200, subLabel: "15 findings · MTTR 6d · Risk 210", metadata: { Findings: "15", MTTR: "6d", Risk: "210", Members: "8" } },
      { id: "tb3", label: "Team B", type: "team", x: 400, y: 200, subLabel: "42 findings · MTTR 14d · Risk 820", metadata: { Findings: "42", MTTR: "14d", Risk: "820", Members: "12" } },
      { id: "tc3", label: "Team C", type: "team", x: 650, y: 200, subLabel: "8 findings · MTTR 4d · Risk 91", metadata: { Findings: "8", MTTR: "4d", Risk: "91", Members: "5" } },
    ],
    edges: [
      { from: "sr", to: "ta3" },
      { from: "sr", to: "tb3" },
      { from: "sr", to: "tc3" },
    ],
  },
  4: {
    title: "Verification Flow",
    nodes: [
      { id: "sqli4", label: "SQL Injection", type: "finding", x: 400, y: 60, metadata: { ID: "F-001", Status: "In Verification", CVSS: "9.8" } },
      { id: "tkt4", label: "Ticket", type: "ticket", x: 400, y: 180, metadata: { ID: "JRA-200", Status: "In Progress" } },
      { id: "rem", label: "Remediation", type: "verification", x: 400, y: 300, metadata: { Action: "Code Fix", PR: "#4421", Date: "Aug 18" } },
      { id: "ver", label: "Verification", type: "verification", x: 400, y: 420, metadata: { Method: "DAST Re-scan", Date: "Aug 20", Attempts: "3" } },
      { id: "passed", label: "PASSED", type: "application", x: 220, y: 540, metadata: { Result: "Clean", Date: "Aug 21", Verifier: "AXIOM" } },
      { id: "failed", label: "FAILED", type: "finding", x: 580, y: 540, metadata: { Result: "Still Vulnerable", Date: "Aug 20", Attempts: "3" } },
      { id: "closed", label: "CLOSED", type: "application", x: 220, y: 640, metadata: { Status: "Resolved", Date: "Aug 21" } },
      { id: "reopened", label: "REOPENED", type: "finding", x: 580, y: 640, metadata: { Status: "Reopened", Date: "Aug 20", Escalation: "Required" } },
    ],
    edges: [
      { from: "sqli4", to: "tkt4" },
      { from: "tkt4", to: "rem" },
      { from: "rem", to: "ver" },
      { from: "ver", to: "passed" },
      { from: "ver", to: "failed" },
      { from: "passed", to: "closed" },
      { from: "failed", to: "reopened" },
    ],
  },
  5: {
    title: "Evidence Chain",
    nodes: [
      { id: "f001", label: "Finding F-001", type: "finding", x: 400, y: 60, metadata: { ID: "F-001", Severity: "Critical", Evidence: "3 artifacts" } },
      { id: "req", label: "Request", type: "evidence", x: 180, y: 200, metadata: { Type: "HTTP Request", Size: "2.4 KB", Format: "raw" } },
      { id: "resp", label: "Response", type: "evidence", x: 400, y: 200, metadata: { Type: "HTTP Response", Size: "18.7 KB", Status: "500" } },
      { id: "scrn", label: "Screenshot", type: "evidence", x: 620, y: 200, metadata: { Type: "PNG", Size: "340 KB", Tool: "AXIOM" } },
      { id: "sha1", label: "SHA256-1", type: "verification", x: 180, y: 340, metadata: { Hash: "3a4f...e8b1", Verified: "Yes", Date: "Aug 20" } },
      { id: "sha2", label: "SHA256-2", type: "verification", x: 400, y: 340, metadata: { Hash: "9c2d...a471", Verified: "Yes", Date: "Aug 20" } },
      { id: "sha3", label: "SHA256-3", type: "verification", x: 620, y: 340, metadata: { Hash: "1b7e...f903", Verified: "Yes", Date: "Aug 20" } },
      { id: "sig", label: "Signature", type: "application", x: 400, y: 460, metadata: { Key: "AXIOM-KEY-2026", Valid: "Yes", Chain: "Complete" } },
    ],
    edges: [
      { from: "f001", to: "req" },
      { from: "f001", to: "resp" },
      { from: "f001", to: "scrn" },
      { from: "req", to: "sha1" },
      { from: "resp", to: "sha2" },
      { from: "scrn", to: "sha3" },
      { from: "sha1", to: "sig" },
      { from: "sha2", to: "sig" },
      { from: "sha3", to: "sig" },
    ],
  },
};

const VIEW_TABS: { id: ViewId; label: string }[] = [
  { id: 1, label: "Application-Centric" },
  { id: 2, label: "Risk Propagation" },
  { id: 3, label: "Team Ownership" },
  { id: 4, label: "Verification Flow" },
  { id: 5, label: "Evidence Chain" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function KnowledgeGraphPage() {
  const [activeView, setActiveView] = useState<ViewId>(1);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [search, setSearch] = useState("");
  const [zoom, setZoom] = useState(1);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const { nodes, edges } = VIEWS[activeView];

  // Filter nodes by search
  const visibleNodeIds = useMemo(() => {
    if (!search.trim()) return new Set(nodes.map((n) => n.id));
    const q = search.toLowerCase();
    return new Set(
      nodes
        .filter(
          (n) =>
            n.label.toLowerCase().includes(q) ||
            n.type.toLowerCase().includes(q)
        )
        .map((n) => n.id)
    );
  }, [search, nodes]);

  const visibleNodes = nodes.filter((n) => visibleNodeIds.has(n.id));
  const visibleEdges = edges.filter(
    (e) => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to)
  );

  // Related nodes for detail panel
  const relatedNodes = useMemo(() => {
    if (!selectedNode) return [];
    const related = new Set<string>();
    edges.forEach((e) => {
      if (e.from === selectedNode.id) related.add(e.to);
      if (e.to === selectedNode.id) related.add(e.from);
    });
    return nodes.filter((n) => related.has(n.id));
  }, [selectedNode, edges, nodes]);

  const svgWidth = 850;
  const svgHeight = 700;

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.15, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.4));
  const handleZoomReset = () => setZoom(1);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          padding: "0 16px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
          height: 48,
          flexShrink: 0,
        }}
      >
        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 20 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              color: "#fff",
              fontWeight: 700,
            }}
          >
            ◈
          </div>
          <span
            style={{
              color: "var(--fg)",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "0.06em",
            }}
          >
            Knowledge Graph
          </span>
        </div>

        {/* View Tabs */}
        <div style={{ display: "flex", gap: 2, flex: 1 }}>
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveView(tab.id);
                setSelectedNode(null);
                setSearch("");
              }}
              style={{
                padding: "5px 14px",
                fontSize: 12,
                fontWeight: activeView === tab.id ? 700 : 400,
                background:
                  activeView === tab.id
                    ? "rgba(232,145,45,0.15)"
                    : "transparent",
                color:
                  activeView === tab.id ? "var(--primary)" : "var(--fg-2)",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            className="tool-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter nodes..."
            style={{ width: 160, fontSize: 12, padding: "5px 10px" }}
          />

          {/* Zoom controls */}
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <button
              onClick={handleZoomOut}
              className="btn-secondary"
              style={{ padding: "4px 10px", fontSize: 14, lineHeight: 1 }}
              title="Zoom out"
            >
              −
            </button>
            <span
              style={{
                color: "var(--fg-2)",
                fontSize: 11,
                minWidth: 40,
                textAlign: "center",
              }}
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="btn-secondary"
              style={{ padding: "4px 10px", fontSize: 14, lineHeight: 1 }}
              title="Zoom in"
            >
              +
            </button>
            <button
              onClick={handleZoomReset}
              className="btn-secondary"
              style={{ padding: "4px 8px", fontSize: 11 }}
              title="Reset zoom"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* SVG Canvas */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            position: "relative",
            background: "var(--bg)",
          }}
          onClick={() => setSelectedNode(null)}
        >
          {/* Legend */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "10px 12px",
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                color: "var(--muted)",
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 7,
              }}
            >
              Node Types
            </div>
            {(
              [
                "application",
                "api",
                "finding",
                "ticket",
                "team",
                "evidence",
                "risk",
                "verification",
              ] as NodeType[]
            ).map((t) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: NODE_COLORS[t],
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    color: "var(--fg-2)",
                    fontSize: 10,
                    textTransform: "capitalize",
                  }}
                >
                  {t}
                </span>
              </div>
            ))}
          </div>

          {/* View label */}
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 16,
              color: "var(--muted)",
              fontSize: 11,
              pointerEvents: "none",
            }}
          >
            View {activeView}/5 — {VIEWS[activeView].title}
          </div>

          <svg
            width="100%"
            height="100%"
            viewBox={`${-svgWidth * (zoom - 1) * 0.5} ${-svgHeight * (zoom - 1) * 0.5} ${svgWidth / zoom} ${svgHeight / zoom}`}
            style={{ display: "block" }}
          >
            <defs>
              {/* Arrow marker */}
              <marker
                id="arrow"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L0,6 L8,3 z" fill="#2d3748" />
              </marker>
              {/* Glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Edges */}
            {visibleEdges.map((edge, idx) => {
              const fromNode = nodes.find((n) => n.id === edge.from);
              const toNode = nodes.find((n) => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const isHighlighted =
                selectedNode &&
                (selectedNode.id === edge.from ||
                  selectedNode.id === edge.to);

              // Compute endpoint on circle circumference
              const fr = NODE_RADIUS[fromNode.type];
              const tr = NODE_RADIUS[toNode.type];
              const dx = toNode.x - fromNode.x;
              const dy = toNode.y - fromNode.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const x1 = fromNode.x + (dx / dist) * fr;
              const y1 = fromNode.y + (dy / dist) * fr;
              const x2 = toNode.x - (dx / dist) * (tr + 8);
              const y2 = toNode.y - (dy / dist) * (tr + 8);
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2;

              return (
                <g key={idx}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isHighlighted ? "var(--primary)" : "#2d3748"}
                    strokeWidth={isHighlighted ? 2 : 1.5}
                    markerEnd="url(#arrow)"
                    opacity={
                      selectedNode && !isHighlighted ? 0.25 : 1
                    }
                  />
                  {edge.label && (
                    <text
                      x={mx}
                      y={my - 4}
                      textAnchor="middle"
                      fontSize={9}
                      fill="var(--muted)"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {visibleNodes.map((node) => {
              const r = NODE_RADIUS[node.type];
              const color = NODE_COLORS[node.type];
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNode === node.id;
              const isDimmed =
                selectedNode &&
                !isSelected &&
                !relatedNodes.find((rn) => rn.id === node.id);

              return (
                <g
                  key={node.id}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(
                      isSelected ? null : node
                    );
                  }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  opacity={isDimmed ? 0.3 : 1}
                >
                  {/* Glow ring for selected */}
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={r + 8}
                      fill="none"
                      stroke={color}
                      strokeWidth={2}
                      opacity={0.4}
                      filter="url(#glow)"
                    />
                  )}

                  {/* Main circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isHovered || isSelected ? r + 3 : r}
                    fill={color}
                    stroke={isSelected ? "#fff" : color}
                    strokeWidth={isSelected ? 2.5 : 1}
                    opacity={0.9}
                    style={{ transition: "r 0.15s ease" }}
                  />

                  {/* Node icon / first letter */}
                  <text
                    x={node.x}
                    y={node.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={node.type === "application" ? 14 : 11}
                    fontWeight={700}
                    fill="#111"
                    opacity={0.8}
                  >
                    {node.type === "finding"
                      ? "!"
                      : node.type === "risk"
                      ? "⚠"
                      : node.type === "ticket"
                      ? "T"
                      : node.type === "team"
                      ? "👥"
                      : node.type === "evidence"
                      ? "E"
                      : node.type === "verification"
                      ? "✓"
                      : node.label.charAt(0).toUpperCase()}
                  </text>

                  {/* Label */}
                  <text
                    x={node.x}
                    y={node.y + r + 14}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={isSelected ? 700 : 500}
                    fill={isSelected ? color : "var(--fg)"}
                  >
                    {node.label}
                  </text>

                  {/* Sub-label */}
                  {node.subLabel && (
                    <text
                      x={node.x}
                      y={node.y + r + 26}
                      textAnchor="middle"
                      fontSize={8}
                      fill="var(--muted)"
                    >
                      {node.subLabel}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* ── Detail Panel ─────────────────────────────────────────────────── */}
        {selectedNode && (
          <div
            style={{
              width: 300,
              flexShrink: 0,
              background: "var(--surface)",
              borderLeft: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "14px 16px 12px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: NODE_COLORS[selectedNode.type],
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      color: "var(--fg)",
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {selectedNode.label}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 4,
                    background: `${NODE_COLORS[selectedNode.type]}22`,
                    color: NODE_COLORS[selectedNode.type],
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {selectedNode.type}
                </span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--muted)",
                  cursor: "pointer",
                  fontSize: 16,
                  lineHeight: 1,
                  padding: "2px 4px",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
              {/* Metadata */}
              {selectedNode.metadata &&
                Object.keys(selectedNode.metadata).length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        color: "var(--muted)",
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 8,
                      }}
                    >
                      Properties
                    </div>
                    <div
                      style={{
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        overflow: "hidden",
                      }}
                    >
                      {Object.entries(selectedNode.metadata).map(
                        ([k, v], i) => (
                          <div
                            key={k}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "6px 10px",
                              borderBottom:
                                i <
                                Object.keys(selectedNode.metadata!).length - 1
                                  ? "1px solid var(--border)"
                                  : "none",
                            }}
                          >
                            <span
                              style={{
                                color: "var(--muted)",
                                fontSize: 11,
                              }}
                            >
                              {k}
                            </span>
                            <span
                              style={{
                                color: "var(--fg)",
                                fontSize: 11,
                                fontWeight: 600,
                                textAlign: "right",
                                maxWidth: 120,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {v}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Related Nodes */}
              {relatedNodes.length > 0 && (
                <div>
                  <div
                    style={{
                      color: "var(--muted)",
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: 8,
                    }}
                  >
                    Connected Nodes ({relatedNodes.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {relatedNodes.map((rn) => (
                      <div
                        key={rn.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNode(rn);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "7px 10px",
                          background: "var(--bg)",
                          border: "1px solid var(--border)",
                          borderRadius: 6,
                          cursor: "pointer",
                          transition: "border-color 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLDivElement).style.borderColor =
                            NODE_COLORS[rn.type])
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLDivElement).style.borderColor =
                            "var(--border)")
                        }
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: NODE_COLORS[rn.type],
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div
                            style={{
                              color: "var(--fg)",
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {rn.label}
                          </div>
                          <div
                            style={{
                              color: "var(--muted)",
                              fontSize: 10,
                              textTransform: "capitalize",
                            }}
                          >
                            {rn.type}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div
              style={{
                padding: "10px 16px",
                borderTop: "1px solid var(--border)",
                display: "flex",
                gap: 8,
              }}
            >
              <button className="btn-secondary" style={{ flex: 1, fontSize: 11 }}>
                Expand Neighbors
              </button>
              <button className="btn-primary" style={{ flex: 1, fontSize: 11 }}>
                View Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
