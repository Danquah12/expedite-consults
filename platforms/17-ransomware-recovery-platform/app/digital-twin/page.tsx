"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GitGraph,
  Server,
  Database,
  HardDrive,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Play,
  RotateCcw,
  Zap,
  Layers,
  ArrowRight,
  Activity,
  Maximize2,
  Info
} from "lucide-react";
import { MOCK_DIGITAL_TWIN, MOCK_CASES } from "@/data/recoveryData";
import { DigitalTwinNode } from "@/types/recovery";

interface GraphPosition {
  x: number;
  y: number;
}

const NODE_COORDINATES: Record<string, GraphPosition> = {
  "dt-1": { x: 100, y: 150 }, // DC01
  "dt-2": { x: 100, y: 320 }, // DC02
  "dt-3": { x: 340, y: 120 }, // SQL-CLINICAL
  "dt-4": { x: 340, y: 260 }, // PACS SAN
  "dt-5": { x: 580, y: 80 },  // IIS PORTAL
  "dt-6": { x: 580, y: 220 }, // BILLING ENGINE
};

export default function DigitalTwinPage() {
  const [nodes, setNodes] = useState<DigitalTwinNode[]>(MOCK_DIGITAL_TWIN);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("dt-1");
  const [simScenario, setSimScenario] = useState<"NONE" | "DC01_DOWN" | "SQL_DOWN" | "SAN_DOWN">("NONE");
  const [simTimelineStep, setSimTimelineStep] = useState<number>(0);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const getDownstreamBlastRadius = (nodeId: string): string[] => {
    const directChildren = nodes.filter((n) => n.dependsOn.includes(nodeId)).map((n) => n.id);
    let allDescendants = [...directChildren];
    directChildren.forEach((cId) => {
      allDescendants = [...allDescendants, ...getDownstreamBlastRadius(cId)];
    });
    return Array.from(new Set(allDescendants));
  };

  const blastRadiusIds = getDownstreamBlastRadius(selectedNode.id);

  const runScenarioSimulation = (scenario: "DC01_DOWN" | "SQL_DOWN" | "SAN_DOWN") => {
    setSimScenario(scenario);
    setSimTimelineStep(1);

    if (scenario === "DC01_DOWN") {
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === "dt-1") return { ...n, status: "ENCRYPTED" };
          if (n.id === "dt-3" || n.id === "dt-4" || n.id === "dt-5" || n.id === "dt-6") {
            return { ...n, status: "ENCRYPTED" };
          }
          return n;
        })
      );
    } else if (scenario === "SQL_DOWN") {
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === "dt-3" || n.id === "dt-5" || n.id === "dt-6") {
            return { ...n, status: "ENCRYPTED" };
          }
          return n;
        })
      );
    }
  };

  const resetTopology = () => {
    setNodes(MOCK_DIGITAL_TWIN);
    setSimScenario("NONE");
    setSimTimelineStep(0);
  };

  const getNodeColor = (status: DigitalTwinNode["status"]) => {
    switch (status) {
      case "HEALTHY":
      case "RECOVERED":
        return "#10b981";
      case "ENCRYPTED":
        return "#f43f5e";
      case "STANDBY":
        return "#f59e0b";
      default:
        return "#06b6d4";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(14,21,38,0.95) 0%, rgba(22,32,56,0.95) 100%)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(6,182,212,0.15)",
              border: "1px solid rgba(6,182,212,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <GitGraph size={18} color="#06b6d4" />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.01em" }}>
              Digital Twin & Enterprise Dependency Modeler
            </h1>
            <span className="badge-sev badge-medium">Pillar 2: Analyze & Preserve</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 840, lineHeight: 1.5 }}>
            Interactive Directed Acyclic Graph (DAG) simulating cascading service failures when Tier-0 Active Directory or core DB clusters are knocked offline.
            Identifies chokepoints and minimal cut sets for zero-loss recovery.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={resetTopology} className="btn-secondary">
            <RotateCcw size={14} />
            Reset Topology
          </button>
        </div>
      </div>

      {/* Scenario Trigger Bar */}
      <div className="card-tactical" style={{ padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Zap size={16} color="#f59e0b" />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#f8fafc" }}>
            Cascade Failure Simulation Scenarios:
          </span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => runScenarioSimulation("DC01_DOWN")}
            style={{
              background: simScenario === "DC01_DOWN" ? "rgba(244,63,94,0.2)" : "var(--surface-2)",
              color: simScenario === "DC01_DOWN" ? "#f43f5e" : "var(--fg-2)",
              border: simScenario === "DC01_DOWN" ? "1px solid #f43f5e" : "1px solid var(--border)",
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 11.5,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Scenario 1: Primary DC01 Outage (Full Cascade)
          </button>

          <button
            onClick={() => runScenarioSimulation("SQL_DOWN")}
            style={{
              background: simScenario === "SQL_DOWN" ? "rgba(245,158,11,0.2)" : "var(--surface-2)",
              color: simScenario === "SQL_DOWN" ? "#f59e0b" : "var(--fg-2)",
              border: simScenario === "SQL_DOWN" ? "1px solid #f59e0b" : "1px solid var(--border)",
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 11.5,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Scenario 2: Epic SQL Failure (App Layer Blast)
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive SVG Topology DAG & Node Inspector */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.6fr", gap: 20 }}>
        {/* Left: SVG Graph Canvas */}
        <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14, minHeight: 460 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>
              Enterprise Service Dependency DAG
            </h3>

            <div style={{ display: "flex", gap: 12, fontSize: 11 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
                <span style={{ color: "var(--muted)" }}>Healthy / Recovered</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f43f5e" }} />
                <span style={{ color: "var(--muted)" }}>Encrypted / Down</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
                <span style={{ color: "var(--muted)" }}>Standby</span>
              </div>
            </div>
          </div>

          {/* Interactive SVG Diagram */}
          <div style={{
            background: "#050811",
            border: "1px solid var(--border)",
            borderRadius: 8,
            flex: 1,
            position: "relative",
            minHeight: 380,
            overflow: "hidden"
          }}>
            <svg style={{ width: "100%", height: "100%", minHeight: 380 }}>
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#1e2c4d" />
                </marker>
                <marker
                  id="arrow-active"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
                </marker>
              </defs>

              {/* Render Edges */}
              {nodes.map((node) => {
                const targetPos = NODE_COORDINATES[node.id];
                if (!targetPos) return null;

                return node.dependsOn.map((sourceId) => {
                  const sourcePos = NODE_COORDINATES[sourceId];
                  if (!sourcePos) return null;

                  const isCascadeActive =
                    node.status === "ENCRYPTED" &&
                    (nodes.find((n) => n.id === sourceId)?.status === "ENCRYPTED" || simScenario !== "NONE");

                  return (
                    <line
                      key={`${sourceId}->${node.id}`}
                      x1={sourcePos.x + 90}
                      y1={sourcePos.y + 25}
                      x2={targetPos.x}
                      y2={targetPos.y + 25}
                      stroke={isCascadeActive ? "#f43f5e" : "#1e2c4d"}
                      strokeWidth={isCascadeActive ? "2.5" : "1.5"}
                      strokeDasharray={isCascadeActive ? "4,4" : undefined}
                      markerEnd={isCascadeActive ? "url(#arrow-active)" : "url(#arrow)"}
                    />
                  );
                });
              })}

              {/* Render Nodes */}
              {nodes.map((node) => {
                const pos = NODE_COORDINATES[node.id];
                if (!pos) return null;
                const isSelected = selectedNodeId === node.id;
                const color = getNodeColor(node.status);

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={() => setSelectedNodeId(node.id)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Node Card Box */}
                    <rect
                      width="180"
                      height="50"
                      rx="6"
                      fill="#0e1526"
                      stroke={isSelected ? "#06b6d4" : color}
                      strokeWidth={isSelected ? "2" : "1"}
                    />

                    {/* Status Pip */}
                    <circle cx="15" cy="25" r="5" fill={color} />

                    {/* Node Text Label */}
                    <text
                      x="30"
                      y="20"
                      fill="#f8fafc"
                      fontSize="10.5"
                      fontWeight="700"
                      fontFamily="sans-serif"
                    >
                      {node.name.length > 20 ? node.name.slice(0, 18) + "..." : node.name}
                    </text>

                    <text
                      x="30"
                      y="36"
                      fill="#8493a8"
                      fontSize="9.5"
                      fontFamily="sans-serif"
                    >
                      {node.tier} · ${(node.financialHourlyImpactUSD / 1000).toFixed(0)}k/hr
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right: Selected Node Detail & Blast Radius Inspector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <div>
                <span className="badge-sev badge-medium">
                  {selectedNode.type}
                </span>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "#f8fafc", marginTop: 4 }}>
                  {selectedNode.name}
                </h3>
              </div>
              <span style={{
                fontSize: 10.5,
                fontWeight: 800,
                color: getNodeColor(selectedNode.status),
                background: "rgba(255,255,255,0.05)",
                padding: "2px 8px",
                borderRadius: 4
              }}>
                {selectedNode.status}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                    Criticality Tier
                  </span>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc", marginTop: 2 }}>
                    {selectedNode.tier}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                    Hourly Loss Run-Rate
                  </span>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#f43f5e", marginTop: 2 }}>
                    ${selectedNode.financialHourlyImpactUSD.toLocaleString()} / hr
                  </div>
                </div>
              </div>

              {/* Upstream Parents */}
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                  Direct Upstream Prerequisites ({selectedNode.dependsOn.length})
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                  {selectedNode.dependsOn.length === 0 ? (
                    <span style={{ fontSize: 11, color: "#10b981" }}>Root Node (No prerequisites)</span>
                  ) : (
                    selectedNode.dependsOn.map((id) => {
                      const parent = nodes.find((n) => n.id === id);
                      return (
                        <span key={id} className="badge-sev badge-medium">
                          {parent?.name || id}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Downstream Blast Radius */}
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                  Downstream Blast Radius ({blastRadiusIds.length} Nodes Impacted)
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
                  {blastRadiusIds.length === 0 ? (
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>No downstream dependent services</span>
                  ) : (
                    blastRadiusIds.map((id) => {
                      const child = nodes.find((n) => n.id === id);
                      return (
                        <div
                          key={id}
                          style={{
                            background: "var(--surface-2)",
                            borderLeft: "2px solid #f43f5e",
                            padding: "4px 8px",
                            fontSize: 11,
                            color: "#f8fafc"
                          }}
                        >
                          {child?.name} ({child?.tier})
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
