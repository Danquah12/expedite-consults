"use client";

import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  NkontompoNode,
  NkontompoEdge,
  BloodHoundAttackPath,
  NKONTOMPO_GRAPH_NODES,
  NKONTOMPO_GRAPH_EDGES,
  NKONTOMPO_BLOODHOUND_PATHS,
  NKONTOMPO_PREDICTIVE_SCENARIOS,
  NkontompoNodeType
} from '@/lib/truth-platform/ghana-mahama-2024-tracker-data';
import { HumanVoicePlayer } from '@/components/truth-platform/HumanVoicePlayer';
import {
  Network,
  ShieldAlert,
  Zap,
  Play,
  RotateCcw,
  Terminal,
  ShieldCheck,
  Compass,
  Cpu,
  Search,
  Filter,
  X,
  Copy,
  Check,
  ExternalLink,
  Info,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingDown,
  AlertOctagon,
  Scale,
  Users,
  Building2,
  DollarSign,
  HeartCrack,
  FileCheck2,
  Share2,
  Maximize2
} from 'lucide-react';

type StudioMode = 'bloodhound-paths' | 'neo4j-graph' | 'llm-predictor';
type ModalTab = 'overview' | 'hardship' | 'statutory' | 'financial' | 'remediation' | 'timeline' | 'neighbors';

export function NkontompoGraphStudio() {
  const [mode, setMode] = useState<StudioMode>('bloodhound-paths');
  const [selectedNode, setSelectedNode] = useState<NkontompoNode | null>(NKONTOMPO_GRAPH_NODES[0]);
  const [modalNode, setModalNode] = useState<NkontompoNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<ModalTab>('overview');
  const [copiedState, setCopiedState] = useState<boolean>(false);

  const [selectedPath, setSelectedPath] = useState<BloodHoundAttackPath>(NKONTOMPO_BLOODHOUND_PATHS[0]);
  const [remediatedChokePoints, setRemediatedChokePoints] = useState<Record<string, boolean>>({});
  const [cypherQuery, setCypherQuery] = useState<string>('MATCH (p:Promise)-[:CAUSES_FAMILY_HARDSHIP]->(f:Household) RETURN p, f');
  const [simulatedYear, setSimulatedYear] = useState<'2026' | '2028' | '2030'>('2026');
  
  // Canvas zoom & pan
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Filter & Search state for graph
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Node position state for manual dragging
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    NKONTOMPO_GRAPH_NODES.forEach(n => {
      pos[n.id] = { x: n.x, y: n.y };
    });
    return pos;
  });

  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Open deep context modal for any node
  const handleOpenNodeModal = (node: NkontompoNode, initialTab: ModalTab = 'overview') => {
    setSelectedNode(node);
    setModalNode(node);
    setModalTab(initialTab);
    setIsModalOpen(true);
    setCopiedState(false);
  };

  // Toggle Choke Point Remediation
  const toggleRemediation = (chokePointId: string) => {
    setRemediatedChokePoints(prev => ({
      ...prev,
      [chokePointId]: !prev[chokePointId]
    }));
  };

  // Pre-set Cypher Queries
  const PRESET_QUERIES = [
    {
      label: 'Family Medical Insolvency',
      query: 'MATCH (p:Promise {category: "Healthcare"})-[:FORCES_CATASTROPHIC_MEDICAL_EXPENSES]->(f) RETURN p, f'
    },
    {
      label: 'Northern Agricultural Collapse',
      query: 'MATCH (p:Promise {region: "Upper East"})-[:INFLICTS_AGRICULTURAL_BANKRUPTCY]->(f) RETURN p, f'
    },
    {
      label: 'Rural Teacher Wage Hardship',
      query: 'MATCH (p:Promise)-[:STALLS_PAYROLL_ACTIVATION]->(cp)-[:ERODES_EDUCATOR_PURCHASING_POWER]->(t) RETURN p, t'
    },
    {
      label: 'SOE Quasi-Fiscal Deficit Drain',
      query: 'MATCH (p:Promise)-[:DRIVES_SUGAR_IMPORT_BLEED]->(cj:CrownJewel {id: "cj-sovereign-fiscal"}) RETURN p, cj'
    },
    {
      label: 'Complete National Blast Radius',
      query: 'MATCH (v:BreachVector)-[*1..3]->(cj:CrownJewel) RETURN v, cj'
    }
  ];

  // Dragging Node Logic
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - panOffset.x) / zoomLevel;
      const y = (e.clientY - rect.top - panOffset.y) / zoomLevel;
      setNodePositions(prev => ({
        ...prev,
        [draggingNodeId]: { x: Math.max(30, Math.min(950, x)), y: Math.max(30, Math.min(900, y)) }
      }));
    } else if (isDraggingCanvas) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setIsDraggingCanvas(false);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsDraggingCanvas(true);
      setDragStart({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y
      });
    }
  };

  // Node Color Helper
  const getNodeColor = (type: NkontompoNodeType, isRemediated = false) => {
    if (isRemediated) return { bg: 'fill-emerald-950/90', border: 'stroke-emerald-400', text: 'text-emerald-300', glow: '#10b981', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    switch (type) {
      case 'CROWN_JEWEL':
        return { bg: 'fill-amber-950/90', border: 'stroke-amber-400', text: 'text-amber-300', glow: '#f59e0b', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'PROMISE':
        return { bg: 'fill-rose-950/90', border: 'stroke-rose-500', text: 'text-rose-300', glow: '#f43f5e', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'CHOKE_POINT':
        return { bg: 'fill-orange-950/90', border: 'stroke-orange-400', text: 'text-orange-300', glow: '#fb923c', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40' };
      case 'DEMOGRAPHIC':
        return { bg: 'fill-cyan-950/90', border: 'stroke-cyan-400', text: 'text-cyan-300', glow: '#06b6d4', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
      case 'FAMILY_IMPACT':
        return { bg: 'fill-purple-950/90', border: 'stroke-purple-400', text: 'text-purple-300', glow: '#c084fc', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      default:
        return { bg: 'fill-slate-900/90', border: 'stroke-slate-500', text: 'text-slate-300', glow: '#94a3b8', badge: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  // Check if edge is active in currently selected BloodHound path
  const isEdgeInSelectedPath = (edge: NkontompoEdge) => {
    if (mode !== 'bloodhound-paths' || !selectedPath) return false;
    const { hops } = selectedPath;
    for (let i = 0; i < hops.length - 1; i++) {
      if (edge.source === hops[i] && edge.target === hops[i + 1]) {
        return true;
      }
    }
    return false;
  };

  // Check if edge is severed by choke point remediation
  const isEdgeSevered = (edge: NkontompoEdge) => {
    return !!remediatedChokePoints[edge.source] || !!remediatedChokePoints[edge.target];
  };

  // Crown Jewel Vulnerability Score
  const crownJewelHealthScore = useMemo(() => {
    const isMitigated = !!remediatedChokePoints[selectedPath.chokePointNodeId];
    return isMitigated ? 94 : Math.max(15, 100 - selectedPath.blastRadiusScore);
  }, [remediatedChokePoints, selectedPath]);

  // Categories list
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    NKONTOMPO_GRAPH_NODES.forEach(n => {
      if (n.category) cats.add(n.category);
    });
    return ['ALL', ...Array.from(cats)];
  }, []);

  // Filtered nodes
  const visibleNodes = useMemo(() => {
    return NKONTOMPO_GRAPH_NODES.filter(node => {
      const matchCat = categoryFilter === 'ALL' || node.category === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || (
        node.label.toLowerCase().includes(q) ||
        (node.details && node.details.toLowerCase().includes(q)) ||
        (node.region && node.region.toLowerCase().includes(q)) ||
        (node.metricValue && node.metricValue.toLowerCase().includes(q))
      );
      return matchCat && matchSearch;
    });
  }, [categoryFilter, searchQuery]);

  // Copy Markdown Dossier to Clipboard
  const handleCopyDossier = (node: NkontompoNode) => {
    const markdown = `# Forensic Node Dossier: ${node.label}
**Type:** ${node.type} | **Category:** ${node.category} | **Severity:** ${node.severity}
${node.region ? `**Region:** ${node.region}\n` : ''}
${node.metricValue ? `**Key Metric (${node.metricLabel || 'Value'}):** ${node.metricValue}\n` : ''}

## Executive Summary
${node.details}

${node.familyHardshipNarrative ? `## Ordinary Ghanaian Family & Citizen Hardship Impact\n${node.familyHardshipNarrative}\n` : ''}
${node.financialImpactBreakdown ? `## Financial & Economic Loss Breakdown\n${node.financialImpactBreakdown}\n` : ''}
${node.statutoryAuditDocket ? `## Statutory Audit Docket & Parliamentary Citations\n${node.statutoryAuditDocket}\n` : ''}
${node.remediationActionDetail ? `## Actionable Choke Point Remediation Runbook\n${node.remediationActionDetail}\n` : ''}
${node.sourceCitation ? `## Primary Source Citation\n${node.sourceCitation}\n` : ''}

*Generated via VeritasLens & Ghana Nkontompo Knowledge Graph Platform*
`;
    navigator.clipboard.writeText(markdown);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* ── Studio Master Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                NEO4J NKONTOMPO GRAPH &amp; BLOODHOUND SUITE
              </span>
              <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono">
                Transitive Impact Traversal
              </span>
              <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono">
                LLM Predictive Engine
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Socio-Economic Attack Path &amp; Choke Point Analytics
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Synthesizing <strong className="text-rose-300">Neo4j graph relationship math</strong> with the <strong className="text-amber-300">BloodHound cybersecurity paradigm</strong>. We model political falsehoods (<em>&ldquo;Nkontompo&rdquo;</em>) as compromised vectors that propagate across institutional choke points to compromise Ghana&apos;s <strong>Crown Jewel Assets</strong> (Household Solvency, Health Survival, Youth Prosperity, and Sovereign Fiscal Stability).
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 shadow-inner gap-1">
            <button
              onClick={() => setMode('bloodhound-paths')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'bloodhound-paths'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 border border-rose-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4 text-rose-300" />
              <span>BloodHound Paths</span>
            </button>
            <button
              onClick={() => setMode('neo4j-graph')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'neo4j-graph'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Network className="w-4 h-4 text-indigo-300" />
              <span>Neo4j Cypher Graph</span>
            </button>
            <button
              onClick={() => setMode('llm-predictor')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'llm-predictor'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 border border-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-4 h-4 text-amber-300" />
              <span>LLM 2026–2030 Forecaster</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mode 1 & 2: Interactive Graph / BloodHound Canvas ── */}
      {(mode === 'bloodhound-paths' || mode === 'neo4j-graph') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main SVG Graph Canvas (8 cols) */}
          <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col shadow-2xl relative">
            
            {/* Top Interactive Banner / Click Hint */}
            <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-xl px-3.5 py-2 mb-3 flex flex-wrap items-center justify-between gap-2 shadow-inner">
              <div className="flex items-center gap-2 text-xs text-indigo-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>💡 <strong>Click any node</strong> on the graph below to inspect full socio-economic forensic context, family hardship impact, statutory citations &amp; OpenAI HD audio briefing!</span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 font-bold">
                {visibleNodes.length} Interactive Nodes Active
              </span>
            </div>

            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2">
                {mode === 'bloodhound-paths' ? (
                  <span className="flex items-center gap-1.5 text-xs font-mono text-rose-400 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    Active Threat Path: {selectedPath.title.split(':')[0]}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-mono text-indigo-400 font-bold">
                    <Network className="w-4 h-4" />
                    Knowledge Graph Explorer ({NKONTOMPO_GRAPH_NODES.length} Nodes • {NKONTOMPO_GRAPH_EDGES.length} Relationships)
                  </span>
                )}
              </div>

              {/* Canvas Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel(z => Math.max(0.6, z - 0.15))}
                  className="p-1.5 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs"
                  title="Zoom Out"
                >
                  -
                </button>
                <span className="text-[11px] font-mono text-slate-400 w-12 text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel(z => Math.min(1.8, z + 0.15))}
                  className="p-1.5 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  onClick={() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }}
                  className="p-1.5 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs flex items-center gap-1 font-mono"
                  title="Reset View"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search nodes by name, metric, region, or keyword..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
                {allCategories.slice(0, 5).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono whitespace-nowrap transition ${
                      categoryFilter === cat
                        ? 'bg-indigo-600 text-white font-bold shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Cypher Query Bar in Neo4j Mode */}
            {mode === 'neo4j-graph' && (
              <div className="space-y-2 mb-3 bg-slate-900/90 p-3 rounded-xl border border-indigo-900/40">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-mono text-indigo-300 font-bold">Cypher Query Terminal:</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={cypherQuery}
                    onChange={e => setCypherQuery(e.target.value)}
                    className="flex-1 bg-slate-950 border border-indigo-900/60 rounded-lg px-3 py-1.5 text-xs font-mono text-indigo-200 focus:outline-none focus:border-indigo-500"
                    placeholder="MATCH (n) RETURN n..."
                  />
                  <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1 shadow">
                    <Play className="w-3 h-3" /> Execute
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-mono">Presets:</span>
                  {PRESET_QUERIES.map((pq, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCypherQuery(pq.query)}
                      className="px-2 py-0.5 rounded bg-slate-950 hover:bg-indigo-950 text-slate-300 hover:text-indigo-200 border border-slate-800 text-[10px] font-mono transition"
                    >
                      {pq.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SVG Interactive Canvas */}
            <div
              className="relative w-full h-[580px] bg-slate-950 rounded-xl border border-slate-900 overflow-hidden cursor-crosshair select-none"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseDown={handleCanvasMouseDown}
            >
              <svg
                ref={svgRef}
                className="w-full h-full"
                viewBox="0 0 1000 950"
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                  transformOrigin: 'top left',
                  transition: draggingNodeId ? 'none' : 'transform 0.1s ease-out'
                }}
              >
                <defs>
                  {/* Grid Pattern */}
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.4" />
                  </pattern>

                  {/* Marker Arrow Heads */}
                  <marker id="arrow-threat" markerWidth="10" markerHeight="10" refX="22" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#f43f5e" />
                  </marker>
                  <marker id="arrow-severed" markerWidth="10" markerHeight="10" refX="22" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                  </marker>
                  <marker id="arrow-default" markerWidth="10" markerHeight="10" refX="22" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                  </marker>
                </defs>

                {/* Background Grid */}
                <rect width="1000" height="950" fill="url(#grid)" />

                {/* Edges / Relationship Links */}
                {NKONTOMPO_GRAPH_EDGES.map(edge => {
                  const srcPos = nodePositions[edge.source] || { x: 100, y: 100 };
                  const tgtPos = nodePositions[edge.target] || { x: 500, y: 500 };
                  const isHighlighted = isEdgeInSelectedPath(edge);
                  const isSevered = isEdgeSevered(edge);

                  return (
                    <g key={edge.id} className="transition-all duration-300">
                      <line
                        x1={srcPos.x}
                        y1={srcPos.y}
                        x2={tgtPos.x}
                        y2={tgtPos.y}
                        stroke={
                          isSevered
                            ? '#10b981'
                            : isHighlighted
                            ? '#f43f5e'
                            : '#334155'
                        }
                        strokeWidth={isHighlighted || isSevered ? (isSevered ? 3 : 3.5) : 1.5}
                        strokeDasharray={isSevered ? '6,6' : isHighlighted ? '8,4' : 'none'}
                        markerEnd={
                          isSevered
                            ? 'url(#arrow-severed)'
                            : isHighlighted
                            ? 'url(#arrow-threat)'
                            : 'url(#arrow-default)'
                        }
                        className={isHighlighted && !isSevered ? 'animate-pulse' : ''}
                      />
                      {/* Edge Label */}
                      {(isHighlighted || mode === 'neo4j-graph') && (
                        <text
                          x={(srcPos.x + tgtPos.x) / 2}
                          y={(srcPos.y + tgtPos.y) / 2 - 6}
                          fill={isSevered ? '#34d399' : isHighlighted ? '#fda4af' : '#94a3b8'}
                          fontSize="9"
                          fontFamily="monospace"
                          textAnchor="middle"
                          className="font-bold pointer-events-none"
                        >
                          {isSevered ? '⚡ [SEVERED / REMEDIATED]' : `:${edge.relationship}`}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Nodes */}
                {visibleNodes.map(node => {
                  const pos = nodePositions[node.id] || { x: node.x, y: node.y };
                  const isRemediated = !!remediatedChokePoints[node.id];
                  const colors = getNodeColor(node.type, isRemediated);
                  const isSelected = selectedNode?.id === node.id;
                  const isInActivePath = mode === 'bloodhound-paths' && selectedPath.hops.includes(node.id);
                  const isHovered = hoveredNodeId === node.id;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      onMouseDown={e => handleNodeMouseDown(e, node.id)}
                      onClick={() => handleOpenNodeModal(node)}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      className="cursor-pointer group"
                    >
                      {/* Outer Glow on Selected / Active Path Node / Hovered */}
                      {(isSelected || isInActivePath || isHovered) && (
                        <circle
                          r={node.type === 'CROWN_JEWEL' ? '36' : '30'}
                          fill="none"
                          stroke={isRemediated ? '#10b981' : colors.glow}
                          strokeWidth="2.5"
                          strokeDasharray="4,4"
                          className="animate-spin"
                          style={{ transformOrigin: 'center' }}
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        r={node.type === 'CROWN_JEWEL' ? 26 : node.type === 'CHOKE_POINT' ? 22 : 18}
                        className={`${colors.bg} ${colors.border} transition-all group-hover:brightness-125 group-hover:stroke-white`}
                        strokeWidth={isSelected || isHovered ? 3 : 2}
                      />

                      {/* Icon / Glyph inside Node */}
                      <text
                        y="4"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize={node.type === 'CROWN_JEWEL' ? '14' : '11'}
                        className="font-black pointer-events-none select-none"
                      >
                        {node.type === 'CROWN_JEWEL'
                          ? '👑'
                          : node.type === 'CHOKE_POINT'
                          ? isRemediated
                            ? '🛡️'
                            : '⚡'
                          : node.type === 'PROMISE'
                          ? '🔴'
                          : node.type === 'DEMOGRAPHIC'
                          ? '👥'
                          : '🟣'}
                      </text>

                      {/* Node Label Below */}
                      <text
                        y={node.type === 'CROWN_JEWEL' ? 40 : 34}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="10"
                        fontFamily="sans-serif"
                        className="font-bold pointer-events-none drop-shadow-md"
                      >
                        {node.label.length > 28 ? node.label.substring(0, 26) + '...' : node.label}
                      </text>
                      {node.metricValue && (
                        <text
                          y={node.type === 'CROWN_JEWEL' ? 52 : 46}
                          textAnchor="middle"
                          fill={isRemediated ? '#34d399' : '#fcd34d'}
                          fontSize="9"
                          fontFamily="monospace"
                          className="font-mono font-bold pointer-events-none"
                        >
                          {isRemediated ? 'SECURED' : node.metricValue}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Canvas Legend */}
              <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 flex flex-wrap items-center gap-3 text-[10.5px] font-mono text-slate-300 backdrop-blur shadow-md">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Vector (Unkept Promise)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-400" /> Choke Point</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Demographic</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Crown Jewel</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Remediated</span>
              </div>

              {/* Interactive Help Pill */}
              <div className="absolute top-3 right-3 bg-slate-950/90 border border-slate-800/90 rounded-lg px-3 py-1.5 text-[11px] font-mono text-cyan-300 flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Click node for Deep Dossier</span>
              </div>
            </div>
          </div>

          {/* Right Column: BloodHound Path Selector & Forensic Drawer (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* BloodHound Threat Path Selector */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Compass className="w-4 h-4 text-rose-400" />
                  BloodHound Attack Paths
                </h4>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono text-[10.5px] font-bold">
                  {NKONTOMPO_BLOODHOUND_PATHS.length} Mapped
                </span>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {NKONTOMPO_BLOODHOUND_PATHS.map(path => {
                  const isSelected = selectedPath.id === path.id;
                  const isMitigated = !!remediatedChokePoints[path.chokePointNodeId];

                  return (
                    <button
                      key={path.id}
                      onClick={() => setSelectedPath(path)}
                      className={`w-full text-left p-3 rounded-xl border transition-all space-y-1.5 ${
                        isSelected
                          ? 'bg-rose-950/40 border-rose-500 text-white shadow-lg'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-100">{path.title.split(':')[0]}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isMitigated
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {isMitigated ? 'MITIGATED' : `BLAST ${path.blastRadiusScore}%`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{path.title.split(':')[1]}</p>
                    </button>
                  );
                })}
              </div>

              {/* Crown Jewel Status Gauge */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400">Target Crown Jewel Health:</span>
                  <span className={`font-mono font-bold ${
                    crownJewelHealthScore > 80 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {crownJewelHealthScore}% {crownJewelHealthScore > 80 ? '(SECURED)' : '(COMPROMISED)'}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      crownJewelHealthScore > 80 ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${crownJewelHealthScore}%` }}
                  />
                </div>
                <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Exposure: {selectedPath.estimatedCitizenExposure}</span>
                </div>
              </div>

              {/* Hop Breakdown: Clickable Hops */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10.5px] font-mono text-slate-400 uppercase tracking-wider block">
                  Path Hop Traversal (Click Hop to Inspect):
                </span>
                <div className="space-y-1">
                  {selectedPath.hops.map((hopId, hIdx) => {
                    const hopNode = NKONTOMPO_GRAPH_NODES.find(n => n.id === hopId);
                    if (!hopNode) return null;
                    const hopColors = getNodeColor(hopNode.type, !!remediatedChokePoints[hopNode.id]);

                    return (
                      <button
                        key={hopId}
                        onClick={() => handleOpenNodeModal(hopNode)}
                        className="w-full text-left p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 hover:border-indigo-500/60 transition flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-[11px]">{hIdx + 1}.</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${hopColors.badge}`}>
                            {hopNode.type}
                          </span>
                          <span className="text-slate-200 truncate">{hopNode.label}</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Choke Point Interceptor & Action Button */}
              <div className="bg-gradient-to-br from-orange-950/30 via-slate-900 to-slate-900 p-4 rounded-xl border border-orange-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-orange-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-orange-400" />
                    Choke Point Remediation
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Remediation Action</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedPath.chokePointRemedy}
                </p>
                <button
                  onClick={() => toggleRemediation(selectedPath.chokePointNodeId)}
                  className={`w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                    remediatedChokePoints[selectedPath.chokePointNodeId]
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 border border-emerald-400'
                      : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/30 border border-orange-400'
                  }`}
                >
                  {remediatedChokePoints[selectedPath.chokePointNodeId] ? (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Attack Path Severed (Undo Remediation)</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Deploy Choke Point Remediation</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Selected Node Quick Preview Inspector */}
            {selectedNode && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
                    Node Forensic Inspector
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                    {selectedNode.type}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{selectedNode.label}</h4>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{selectedNode.details}</p>
                
                {selectedNode.metricValue && (
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">{selectedNode.metricLabel || 'Impact Metric'}:</span>
                    <span className="text-xs font-mono font-bold text-amber-300">{selectedNode.metricValue}</span>
                  </div>
                )}

                {/* Open Full Dossier Button */}
                <button
                  onClick={() => handleOpenNodeModal(selectedNode)}
                  className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Inspect Full Forensic Dossier &amp; Audio</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Mode 3: LLM Big Data Predictive Simulation Studio ── */}
      {mode === 'llm-predictor' && (
        <div className="space-y-6">
          {/* Predictive Control Bar */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-amber-400" />
                  LLM Big Data Predictive Horizon Forecaster
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Simulating the compounding socio-economic consequences of unfulfilled commitments across 1-year, 3-year, and 5-year horizons.
                </p>
              </div>

              {/* Timeline Horizon Buttons */}
              <div className="flex items-center bg-slate-900 p-1.5 rounded-xl border border-slate-800 gap-1 self-start">
                <button
                  onClick={() => setSimulatedYear('2026')}
                  className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold transition ${
                    simulatedYear === '2026'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2026 Baseline
                </button>
                <button
                  onClick={() => setSimulatedYear('2028')}
                  className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold transition ${
                    simulatedYear === '2028'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2028 (+2 Years)
                </button>
                <button
                  onClick={() => setSimulatedYear('2030')}
                  className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold transition ${
                    simulatedYear === '2030'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2030 (+4 Years)
                </button>
              </div>
            </div>

            {/* Live Macro Impact Tickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
                <span className="text-[11px] font-mono text-slate-400">Total Citizen Exposure</span>
                <div className="text-xl font-black text-rose-400 font-mono">
                  {simulatedYear === '2026' ? '1.85 Million' : simulatedYear === '2028' ? '2.40 Million' : '3.10 Million'}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Compounding across 16 regions</span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
                <span className="text-[11px] font-mono text-slate-400">Cumulative Family Out-of-Pocket Debt</span>
                <div className="text-xl font-black text-amber-400 font-mono">
                  {simulatedYear === '2026' ? 'GH₵ 4.8 Billion' : simulatedYear === '2028' ? 'GH₵ 7.2 Billion' : 'GH₵ 11.4 Billion'}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Medical, agro &amp; schooling costs</span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
                <span className="text-[11px] font-mono text-slate-400">Projected GDP Growth Drag</span>
                <div className="text-xl font-black text-orange-400 font-mono">
                  {simulatedYear === '2026' ? '-0.35%' : simulatedYear === '2028' ? '-0.68%' : '-1.15%'}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">SOE losses &amp; import reliance</span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
                <span className="text-[11px] font-mono text-slate-400">Youth Opportunity Deficit</span>
                <div className="text-xl font-black text-purple-400 font-mono">
                  {simulatedYear === '2026' ? '320,000 Jobs' : simulatedYear === '2028' ? '480,000 Jobs' : '650,000 Jobs'}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Stalled industrialisation gap</span>
              </div>
            </div>
          </div>

          {/* Predictive Simulation Scenario Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {NKONTOMPO_PREDICTIVE_SCENARIOS.map(sim => (
              <div
                key={sim.id}
                className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 shadow-xl space-y-4 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10.5px] font-mono font-bold">
                    {sim.sector}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    AI Confidence: {sim.aiConfidence}%
                  </span>
                </div>

                <h4 className="font-bold text-white text-base leading-snug">{sim.title}</h4>

                {/* Trajectory Comparison Box */}
                <div className="space-y-2.5">
                  <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-3.5 space-y-1">
                    <span className="text-[11px] font-mono font-bold text-rose-300">
                      {simulatedYear === '2026' ? 'September 2026 Baseline' : `${simulatedYear} Status Quo Trajectory`}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {simulatedYear === '2026'
                        ? sim.baseline2026
                        : simulatedYear === '2028'
                        ? sim.projection2028
                        : sim.projection2030}
                    </p>
                  </div>

                  <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-3.5 space-y-1">
                    <span className="text-[11px] font-mono font-bold text-emerald-300">
                      Counterfactual Policy Recovery Roadmap
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {sim.correctiveInterventionTrajectory}
                    </p>
                  </div>
                </div>

                {/* Compounding Footers */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                  <span><strong>Household Bleed:</strong> {sim.householdBurdenCompounding}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          FULL FORENSIC NODE DOSSIER & DEEP CONTEXT MODAL
      ════════════════════════════════════════════════════════════════════════ */}
      {isModalOpen && modalNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            className="bg-slate-950 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 md:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/50 flex flex-col gap-3 shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${getNodeColor(modalNode.type, !!remediatedChokePoints[modalNode.id]).badge}`}>
                      {modalNode.type === 'PROMISE' ? '🔴 COMPROMISED VECTOR' : modalNode.type === 'CHOKE_POINT' ? '⚡ INSTITUTIONAL CHOKE POINT' : modalNode.type === 'DEMOGRAPHIC' ? '👥 IMPACTED DEMOGRAPHIC' : '👑 CROWN JEWEL ASSET'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono">
                      {modalNode.category}
                    </span>
                    {modalNode.region && (
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono">
                        📍 {modalNode.region}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                      modalNode.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {modalNode.severity} SEVERITY
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                    {modalNode.label}
                  </h3>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* OpenAI HD Voice Audio Player */}
              <div className="pt-2">
                <HumanVoicePlayer
                  textToRead={modalNode.audioBriefingScript || `${modalNode.label}. ${modalNode.details}. ${modalNode.familyHardshipNarrative || ''}`}
                  label={`Listen to ${modalNode.label} Briefing`}
                  sublabel="Authoritative OpenAI HD Neural Audio Synthesis"
                  compact={false}
                />
              </div>

              {/* Modal Navigation Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => setModalTab('overview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    modalTab === 'overview'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Overview &amp; Metrics</span>
                </button>
                <button
                  onClick={() => setModalTab('hardship')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    modalTab === 'hardship'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <HeartCrack className="w-3.5 h-3.5" />
                  <span>Family &amp; Citizen Hardship</span>
                </button>
                <button
                  onClick={() => setModalTab('statutory')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    modalTab === 'statutory'
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Statutory Audit Docket</span>
                </button>
                <button
                  onClick={() => setModalTab('financial')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    modalTab === 'financial'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Financial Loss Model</span>
                </button>
                <button
                  onClick={() => setModalTab('remediation')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    modalTab === 'remediation'
                      ? 'bg-orange-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Choke Point Remediation</span>
                </button>
                <button
                  onClick={() => setModalTab('timeline')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    modalTab === 'timeline'
                      ? 'bg-cyan-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Milestone Timeline</span>
                </button>
                <button
                  onClick={() => setModalTab('neighbors')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    modalTab === 'neighbors'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Connected Attack Hops</span>
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-200 flex-1">
              
              {/* TAB 1: OVERVIEW */}
              {modalTab === 'overview' && (
                <div className="space-y-5">
                  {/* Metric Summary Card */}
                  {modalNode.metricValue && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
                        <span className="text-xs font-mono text-slate-400">{modalNode.metricLabel || 'Impact Metric'}</span>
                        <div className="text-2xl font-black text-amber-400 font-mono">{modalNode.metricValue}</div>
                        <span className="text-[10.5px] text-slate-500 font-mono">Quantified Vulnerability</span>
                      </div>
                      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
                        <span className="text-xs font-mono text-slate-400">Node Classification</span>
                        <div className="text-lg font-bold text-indigo-300 font-mono">{modalNode.type}</div>
                        <span className="text-[10.5px] text-slate-500 font-mono">{modalNode.category}</span>
                      </div>
                      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
                        <span className="text-xs font-mono text-slate-400">Defense &amp; Attack Status</span>
                        <div className={`text-lg font-bold font-mono ${remediatedChokePoints[modalNode.id] ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {remediatedChokePoints[modalNode.id] ? '🛡️ REMEDIATED' : '🔴 ACTIVE EXPOSURE'}
                        </div>
                        <span className="text-[10.5px] text-slate-500 font-mono">Real-time graph state</span>
                      </div>
                    </div>
                  )}

                  {/* Executive Overview Narrative */}
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4" />
                      Executive Forensic Summary
                    </h4>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {modalNode.details}
                    </p>
                  </div>

                  {/* Key Stakeholders */}
                  {modalNode.keyStakeholders && modalNode.keyStakeholders.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                        Key Institutional Stakeholders &amp; Actors:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {modalNode.keyStakeholders.map((sh, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono"
                          >
                            🏛️ {sh}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Primary Source Citation */}
                  {modalNode.sourceCitation && (
                    <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-xl p-3.5 text-xs font-mono text-slate-300 flex items-center justify-between">
                      <span><strong>Primary Statutory Source:</strong> {modalNode.sourceCitation}</span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CITIZEN & FAMILY HARDSHIP */}
              {modalTab === 'hardship' && (
                <div className="space-y-5">
                  <div className="bg-rose-950/30 border border-rose-900/50 rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <HeartCrack className="w-5 h-5 text-rose-400" />
                      <h4 className="text-sm font-bold text-rose-200 uppercase tracking-wide">
                        Human-Centred Family &amp; Household Hardship Narrative
                      </h4>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {modalNode.familyHardshipNarrative || "Detailed family hardship dynamics are documented across regional household surveys and local community stakeholder interviews."}
                    </p>
                  </div>

                  {modalNode.affectedPopulationDetail && (
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-xs font-mono text-slate-400 uppercase">Affected Population Footprint:</span>
                      <p className="text-sm text-amber-300 font-mono font-bold">
                        👥 {modalNode.affectedPopulationDetail}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: STATUTORY AUDIT DOCKET */}
              {modalTab === 'statutory' && (
                <div className="space-y-5">
                  <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Scale className="w-5 h-5 text-amber-400" />
                      <h4 className="text-sm font-bold text-amber-200 uppercase tracking-wide">
                        Statutory Evidence &amp; Oversight Citations
                      </h4>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed font-mono">
                      {modalNode.statutoryAuditDocket || modalNode.sourceCitation || "Verified against Auditor-General reports, Parliamentary Hansard, and Ministry of Finance disclosures."}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: FINANCIAL LOSS MODEL */}
              {modalTab === 'financial' && (
                <div className="space-y-5">
                  <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                      <h4 className="text-sm font-bold text-emerald-200 uppercase tracking-wide">
                        Macro &amp; Micro Financial Impact Breakdown
                      </h4>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {modalNode.financialImpactBreakdown || "Economic loss modeling synthesizes out-of-pocket household expenditures with state enterprise quasi-fiscal losses."}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 5: ACTIONABLE REMEDIATION RUNBOOK */}
              {modalTab === 'remediation' && (
                <div className="space-y-5">
                  <div className="bg-orange-950/30 border border-orange-900/50 rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-400" />
                      <h4 className="text-sm font-bold text-orange-200 uppercase tracking-wide">
                        Policy &amp; Statutory Remediation Runbook
                      </h4>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {modalNode.remediationActionDetail || "Definitive statutory and budgetary intervention required to sever the socio-economic attack path and protect national assets."}
                    </p>
                  </div>

                  {/* Choke Point Defense Toggle */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h5 className="text-sm font-bold text-white">Live Choke Point Defense Control</h5>
                      <p className="text-xs text-slate-400">Sever the attack path across the BloodHound graph engine.</p>
                    </div>
                    <button
                      onClick={() => toggleRemediation(modalNode.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 shadow-lg ${
                        remediatedChokePoints[modalNode.id]
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400'
                          : 'bg-orange-600 hover:bg-orange-500 text-white border border-orange-400'
                      }`}
                    >
                      {remediatedChokePoints[modalNode.id] ? (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Path Severed (Active Defense)</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>Deploy Remediation Action</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 6: HISTORICAL TIMELINE */}
              {modalTab === 'timeline' && (
                <div className="space-y-4">
                  {modalNode.historicalTimeline && modalNode.historicalTimeline.length > 0 ? (
                    <div className="relative border-l-2 border-slate-800 ml-4 pl-4 space-y-6">
                      {modalNode.historicalTimeline.map((item, idx) => (
                        <div key={idx} className="relative">
                          <span className={`absolute -left-[25px] top-1 w-4 h-4 rounded-full border-2 border-slate-950 ${
                            item.status === 'PROMISED' ? 'bg-rose-500' : item.status === 'STALLED' ? 'bg-amber-500' : item.status === 'REMEDIATED' ? 'bg-emerald-500' : 'bg-cyan-500'
                          }`} />
                          <div className="space-y-1">
                            <span className="text-xs font-mono font-bold text-slate-400">{item.date}</span>
                            <p className="text-sm text-slate-200">{item.event}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 font-mono">No historical timeline milestones registered for this node.</p>
                  )}
                </div>
              )}

              {/* TAB 7: CONNECTED ATTACK HOPS */}
              {modalTab === 'neighbors' && (
                <div className="space-y-4">
                  <span className="text-xs font-mono text-slate-400 uppercase block">
                    Connected Upstream &amp; Downstream Graph Neighbors (Click to Switch):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {NKONTOMPO_GRAPH_NODES.filter(n => n.id !== modalNode.id && (
                      NKONTOMPO_GRAPH_EDGES.some(e => (e.source === modalNode.id && e.target === n.id) || (e.target === modalNode.id && e.source === n.id))
                    )).map(neighbor => {
                      const nColors = getNodeColor(neighbor.type, !!remediatedChokePoints[neighbor.id]);
                      return (
                        <button
                          key={neighbor.id}
                          onClick={() => handleOpenNodeModal(neighbor, 'overview')}
                          className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 text-left transition space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${nColors.badge}`}>
                              {neighbor.type}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <div className="text-xs font-bold text-white truncate">{neighbor.label}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{neighbor.details}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => handleCopyDossier(modalNode)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-mono flex items-center gap-1.5 transition"
              >
                {copiedState ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Dossier Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Full Markdown Dossier</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
