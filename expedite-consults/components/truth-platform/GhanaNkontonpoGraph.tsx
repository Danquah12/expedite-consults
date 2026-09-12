'use client';

import React, { useState, useMemo } from 'react';
import { 
  NKONTONPO_NODES, 
  NKONTONPO_EDGES, 
  NkontonpoNode 
} from '@/lib/truth-platform/ghana-nkontonpo-data';
import { 
  Network, 
  Search, 
  Filter, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  FileText, 
  Flame, 
  Scale, 
  Sparkles, 
  Layers, 
  Building, 
  Zap, 
  GraduationCap, 
  Activity, 
  ArrowRight,
  HelpCircle,
  ExternalLink,
  User,
  X,
  Copy,
  Check,
  Radio,
  Share2,
  Calendar,
  MapPin,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Globe,
  HeartCrack,
  AlertOctagon
} from 'lucide-react';

type PoliticianFilterKey = 'ALL' | 'mahama' | 'current2024' | 'terkper' | 'housing' | 'sada' | 'bawumia';
type LanguageKey = 'en' | 'tw' | 'ga' | 'ee' | 'ha' | 'dag';

export function GhanaNkontonpoGraph() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('prom-dumsor');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterSpeaker, setFilterSpeaker] = useState<PoliticianFilterKey>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal Popup State & Multi-Lingual Switcher
  const [modalNode, setModalNode] = useState<NkontonpoNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [copiedState, setCopiedState] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageKey>('en');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Filtered nodes logic
  const filteredNodes = useMemo(() => {
    return NKONTONPO_NODES.filter(n => {
      const matchCat = filterCategory === 'ALL' || n.category === filterCategory;
      const matchSpeaker = filterSpeaker === 'ALL' || n.politicianId === filterSpeaker;
      const q = (searchQuery || '').toLowerCase();
      const matchSearch = !q || (
        (n.label?.toLowerCase() || '').includes(q) ||
        (n.speaker?.toLowerCase() || '').includes(q) ||
        (n.statutoryOutcome?.toLowerCase() || '').includes(q) ||
        (n.verbatimQuote ? (n.verbatimQuote.toLowerCase() || '').includes(q) : false)
      );
      return matchCat && matchSpeaker && matchSearch;
    });
  }, [filterCategory, filterSpeaker, searchQuery]);

  // Selected node (fallback to first filtered node if currently selected is filtered out)
  const selectedNode = useMemo(() => {
    const found = NKONTONPO_NODES.find(n => n.id === selectedNodeId);
    if (found && filteredNodes.some(n => n.id === selectedNodeId)) {
      return found;
    }
    return filteredNodes[0] || NKONTONPO_NODES[0];
  }, [selectedNodeId, filteredNodes]);

  // Handle speaker filter change & auto-select top node
  const handleSpeakerFilterChange = (speakerKey: PoliticianFilterKey) => {
    setFilterSpeaker(speakerKey);
    const matching = NKONTONPO_NODES.filter(n => speakerKey === 'ALL' || n.politicianId === speakerKey);
    if (matching.length > 0) {
      setSelectedNodeId(matching[0].id);
    }
  };

  // Connected edges and neighbor nodes
  const connectedEdges = NKONTONPO_EDGES.filter(
    e => e.source === selectedNode?.id || e.target === selectedNode?.id
  );
  const neighborIds = connectedEdges.map(e => e.source === selectedNode?.id ? e.target : e.source);

  // Layout coordinates calculation (zero-overlap spacious layout)
  const renderedNodesWithCoords = useMemo(() => {
    if (filterSpeaker === 'ALL') {
      return filteredNodes;
    }

    const polNodes = filteredNodes.filter(n => n.category === 'POLITICIAN');
    const promiseNodes = filteredNodes.filter(n => n.category === 'DECEPTIVE_PROMISE');
    const realityNodes = filteredNodes.filter(n => n.category === 'STATUTORY_REALITY' || n.category === 'NPP_DELIVERY');

    const totalRows = Math.max(promiseNodes.length, realityNodes.length, 1);
    const polCenterY = 90 + ((totalRows - 1) * 145) / 2;

    return filteredNodes.map(node => {
      if (node.category === 'POLITICIAN') {
        return { ...node, x: 160, y: polCenterY };
      }
      if (node.category === 'DECEPTIVE_PROMISE') {
        const idx = promiseNodes.findIndex(p => p.id === node.id);
        return { ...node, x: 550, y: 90 + idx * 145 };
      }
      if (node.category === 'STATUTORY_REALITY' || node.category === 'NPP_DELIVERY') {
        const idx = realityNodes.findIndex(r => r.id === node.id);
        return { ...node, x: 940, y: 90 + idx * 145 };
      }
      return node;
    });
  }, [filteredNodes, filterSpeaker]);

  // Dynamic SVG canvas height based on visible rows
  const dynamicSvgHeight = useMemo(() => {
    if (filterSpeaker === 'ALL') {
      return 1480;
    }
    const maxNodesInCol = Math.max(
      renderedNodesWithCoords.filter(n => n.category === 'DECEPTIVE_PROMISE').length,
      renderedNodesWithCoords.filter(n => n.category === 'STATUTORY_REALITY' || n.category === 'NPP_DELIVERY').length,
      1
    );
    return Math.max(450, maxNodesInCol * 150 + 80);
  }, [filterSpeaker, renderedNodesWithCoords]);

  const openDossierModal = (node: NkontonpoNode) => {
    setSelectedNodeId(node.id);
    setModalNode(node);
    setIsModalOpen(true);
    setCopiedState(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalNode(null);
  };

  const handleCopyEvidence = (node: NkontonpoNode) => {
    const text = `
🏛️ GHANA NKONTONPO (LIE VS TRUTH) FORENSIC DOSSIER
==================================================
👤 SPEAKER / WHO SAID IT: ${node.speaker} (${node.speakerParty || 'GH'} - ${node.speakerRole})
📍 SPEECH VENUE & CONTEXT: ${node.venueContext}
📅 YEAR & TIMING: ${node.year}

🟡 THE DECEPTIVE PROMISE / QUOTE (${selectedLanguage.toUpperCase()}):
"${getLocalizedQuote(node, selectedLanguage)}"

🔴 STATUTORY GROUND TRUTH & OUTCOME:
${node.statutoryOutcome}

💔 IMPACT ON ORDINARY GHANAIANS:
${node.citizenHardshipImpact || 'Heavy economic hardship on families and small businesses.'}

💰 QUANTIFIED FINANCIAL LOSS / ARREARS:
${node.financialLoss || 'Substantial Unrecoverable Sovereign Public Funds'}

📜 OFFICIAL LEGAL & AUDIT CITATION:
${node.officialDocket}
==================================================
Verified by Ghana Truth Platform (truth-platform)
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 3000);
  };

  function getLocalizedQuote(node: NkontonpoNode, lang: LanguageKey): string {
    if (node.multiLingualQuote && node.multiLingualQuote[lang]) {
      return node.multiLingualQuote[lang] || node.verbatimQuote || '';
    }
    return node.verbatimQuote || 'No recorded verbatim quote.';
  }

  // Helper colors
  const getNodeColor = (cat: string) => {
    switch (cat) {
      case 'POLITICIAN':
        return {
          fill: '#0f172a',
          border: '#38bdf8',
          glow: 'rgba(56, 189, 248, 0.4)',
          text: '#38bdf8',
          badge: 'bg-sky-950 text-sky-300 border-sky-600'
        };
      case 'DECEPTIVE_PROMISE':
        return {
          fill: '#1c1917',
          border: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.4)',
          text: '#fbbf24',
          badge: 'bg-amber-950 text-amber-300 border-amber-600'
        };
      case 'STATUTORY_REALITY':
        return {
          fill: '#18060b',
          border: '#f43f5e',
          glow: 'rgba(244, 63, 94, 0.4)',
          text: '#fb7185',
          badge: 'bg-rose-950 text-rose-300 border-rose-600'
        };
      case 'NPP_DELIVERY':
        return {
          fill: '#022c22',
          border: '#10b981',
          glow: 'rgba(16, 185, 129, 0.4)',
          text: '#34d399',
          badge: 'bg-emerald-950 text-emerald-300 border-emerald-600'
        };
      default:
        return {
          fill: '#0f172a',
          border: '#64748b',
          glow: 'rgba(100, 116, 139, 0.4)',
          text: '#cbd5e1',
          badge: 'bg-slate-800 text-slate-300 border-slate-600'
        };
    }
  };

  const speakerFilters: { id: PoliticianFilterKey; label: string; count: number }[] = [
    { id: 'ALL', label: 'All Leaders & Events', count: NKONTONPO_NODES.length },
    { id: 'current2024', label: '⚡ 2024–2026 Actions Hurting Ghanaians (NDC)', count: NKONTONPO_NODES.filter(n => n.politicianId === 'current2024').length },
    { id: 'mahama', label: '👤 John Dramani Mahama (President, NDC)', count: NKONTONPO_NODES.filter(n => n.politicianId === 'mahama').length },
    { id: 'terkper', label: '👤 Seth Terkper (IMF & Finance)', count: NKONTONPO_NODES.filter(n => n.politicianId === 'terkper').length },
    { id: 'housing', label: '👤 Collins Dauda (Saglemi Housing)', count: NKONTONPO_NODES.filter(n => n.politicianId === 'housing').length },
    { id: 'sada', label: '👤 SADA Leadership (Guinea Fowl / Trees)', count: NKONTONPO_NODES.filter(n => n.politicianId === 'sada').length },
    { id: 'bawumia', label: '👤 Dr. Bawumia & Nana Addo (NPP Solutions)', count: NKONTONPO_NODES.filter(n => n.politicianId === 'bawumia').length }
  ];

  const languages: { code: LanguageKey; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'tw', label: 'Twi / Akan', flag: '🇬🇭' },
    { code: 'ga', label: 'Ga', flag: '🇬🇭' },
    { code: 'ee', label: 'Ewe', flag: '🇬🇭' },
    { code: 'ha', label: 'Hausa', flag: '🇬🇭' },
    { code: 'dag', label: 'Dagbani', flag: '🇬🇭' }
  ];

  return (
    <div className="space-y-6">
      {/* ── Top Header Banner ── */}
      <div className="bg-gradient-to-r from-slate-900 via-red-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-amber-400 animate-pulse" />
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                GHANA NKONTONPO KNOWLEDGE GRAPH & CITIZEN HARDSHIP ARCHIVE
              </h1>
            </div>
            <p className="text-xs md:text-sm text-slate-300 max-w-4xl leading-relaxed">
              Forensic cross-examination of political promises vs. documented statutory reality. Dig deep into verbatim statements in <span className="text-amber-300 font-bold">English, Twi, Ga, Ewe, Hausa, and Dagbani</span>, financial losses, and real-life impacts on ordinary Ghanaian families.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-center shadow-lg">
              <div className="text-[10px] uppercase font-mono text-slate-400 font-bold">Documented Nodes</div>
              <div className="text-xl font-black font-mono text-cyan-400">{NKONTONPO_NODES.length}</div>
            </div>
            <div className="bg-slate-950/80 border border-rose-900/60 rounded-xl px-4 py-2.5 text-center shadow-lg">
              <div className="text-[10px] uppercase font-mono text-rose-300 font-bold">Unfulfilled / Lies</div>
              <div className="text-xl font-black font-mono text-rose-400">
                {NKONTONPO_NODES.filter(n => n.category === 'DECEPTIVE_PROMISE' || n.category === 'STATUTORY_REALITY').length}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Speaker Filter Tabs */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5 mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter By Political Record:</span>
          </span>
          {speakerFilters.map(s => (
            <button
              key={s.id}
              onClick={() => handleSpeakerFilterChange(s.id)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                filterSpeaker === s.id
                  ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300 scale-105'
                  : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <span>{s.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${filterSpeaker === s.id ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                {s.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Canvas Layout: Interactive SVG Graph + Forensic Inspector ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive SVG Graph Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950/95 border border-slate-800 rounded-xl p-4 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[580px]">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5 gap-2 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-slate-200">
              <Network className="w-3.5 h-3.5 text-cyan-400" />
              <span>Interactive Graph Canvas: {filterSpeaker === 'ALL' ? 'All Political Records' : `Filtered to ${filterSpeaker.toUpperCase()}`}</span>
            </span>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 px-2 py-0.5 rounded-lg text-xs font-mono">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(0.65, Number((prev - 0.15).toFixed(2))))}
                  className="px-1.5 py-0.5 text-slate-300 hover:text-white font-bold cursor-pointer"
                  title="Zoom Out Canvas"
                >
                  −
                </button>
                <span className="text-[11px] text-cyan-300 font-bold px-1 min-w-[38px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(1.5, Number((prev + 0.15).toFixed(2))))}
                  className="px-1.5 py-0.5 text-slate-300 hover:text-white font-bold cursor-pointer"
                  title="Zoom In Canvas"
                >
                  +
                </button>
                <button
                  onClick={() => setZoomLevel(1.0)}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 ml-1 font-bold cursor-pointer"
                  title="Reset 100% Zoom"
                >
                  Reset
                </button>
              </div>

              <span className="text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded text-[10.5px] font-bold flex items-center gap-1">
                <Maximize2 className="w-3 h-3" />
                <span className="hidden sm:inline">Click Node for Dossier</span>
              </span>
            </div>
          </div>

          <div className="relative flex-1 w-full overflow-x-auto overflow-y-auto max-h-[720px] bg-slate-950/70 border border-slate-800/80 rounded-xl p-2 scrollbar-thin">
            <svg
              viewBox={`0 0 1180 ${dynamicSvgHeight}`}
              style={{
                width: `${1180 * zoomLevel}px`,
                height: `${dynamicSvgHeight * zoomLevel}px`,
                minWidth: '1060px'
              }}
              className="transition-all duration-200 block"
            >
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="16" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                </marker>
                <marker id="arrow-active" viewBox="0 0 10 10" refX="16" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
                </marker>
                <marker id="arrow-failure" viewBox="0 0 10 10" refX="16" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
                </marker>
                <marker id="arrow-resolution" viewBox="0 0 10 10" refX="16" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                </marker>
              </defs>

              {/* Draw Edges between Visible Nodes */}
              {NKONTONPO_EDGES.map(edge => {
                const sourceNode = renderedNodesWithCoords.find(n => n.id === edge.source);
                const targetNode = renderedNodesWithCoords.find(n => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                const isConnectedToSelected = edge.source === selectedNode?.id || edge.target === selectedNode?.id;

                const isLeftToRight = sourceNode.x < targetNode.x;
                const isRightToLeft = sourceNode.x > targetNode.x;
                const x1 = isLeftToRight ? sourceNode.x + 130 : isRightToLeft ? sourceNode.x - 130 : sourceNode.x;
                const x2 = isLeftToRight ? targetNode.x - 130 : isRightToLeft ? targetNode.x + 130 : targetNode.x;

                return (
                  <g key={edge.id}>
                    <line
                      x1={x1}
                      y1={sourceNode.y}
                      x2={x2}
                      y2={targetNode.y}
                      stroke={isConnectedToSelected ? '#38bdf8' : edge.type === 'FAILURE_LINK' ? '#f43f5e' : edge.type === 'RESOLUTION_LINK' ? '#10b981' : '#475569'}
                      strokeWidth={isConnectedToSelected ? 3.5 : 1.75}
                      strokeDasharray={edge.type === 'FAILURE_LINK' ? '6,4' : 'none'}
                      markerEnd={
                        isConnectedToSelected 
                          ? 'url(#arrow-active)' 
                          : edge.type === 'FAILURE_LINK' 
                            ? 'url(#arrow-failure)' 
                            : edge.type === 'RESOLUTION_LINK'
                              ? 'url(#arrow-resolution)'
                              : 'url(#arrow)'
                      }
                      opacity={isConnectedToSelected ? 1 : 0.65}
                    />
                    <text
                      x={(x1 + x2) / 2}
                      y={(sourceNode.y + targetNode.y) / 2 - 6}
                      fill={isConnectedToSelected ? '#38bdf8' : '#94a3b8'}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="select-none"
                    >
                      {edge.relationship.replace(/_/g, ' ')}
                    </text>
                  </g>
                );
              })}

              {/* Draw Nodes */}
              {renderedNodesWithCoords.map(node => {
                const isSelected = selectedNode?.id === node.id;
                const isNeighbor = neighborIds.includes(node.id);
                const colors = getNodeColor(node.category);

                return (
                  <g
                    key={node.id}
                    onClick={() => openDossierModal(node)}
                    className="cursor-pointer group"
                    style={{ opacity: isSelected || isNeighbor ? 1 : 0.85 }}
                  >
                    {/* Node Outer Glowing Ring if Selected */}
                    {isSelected && (
                      <rect
                        x={node.x - 134}
                        y={node.y - 32}
                        width={268}
                        height={64}
                        rx={12}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth={2.5}
                        strokeDasharray="4,4"
                        className="animate-pulse"
                      />
                    )}

                    {/* Node Background Box */}
                    <rect
                      x={node.x - 130}
                      y={node.y - 28}
                      width={260}
                      height={56}
                      rx={10}
                      fill={colors.fill}
                      stroke={isSelected ? '#38bdf8' : colors.border}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      className="transition-all duration-200 group-hover:brightness-125"
                      filter={isSelected ? `drop-shadow(0 0 12px ${colors.glow})` : 'none'}
                    />

                    {/* Top Row: Speaker / Party Tag & Year */}
                    <text
                      x={node.x - 118}
                      y={node.y - 12}
                      fill={node.speakerParty === 'NDC' ? '#f87171' : '#34d399'}
                      fontSize="9"
                      fontWeight="900"
                      fontFamily="monospace"
                      className="select-none uppercase"
                    >
                      [{node.speakerParty || 'GH'}] {node.speaker.length > 20 ? node.speaker.slice(0, 18) + '...' : node.speaker}
                    </text>

                    <text
                      x={node.x + 118}
                      y={node.y - 12}
                      fill="#94a3b8"
                      fontSize="8.5"
                      fontFamily="monospace"
                      textAnchor="end"
                      className="select-none"
                    >
                      {node.year}
                    </text>

                    {/* Node Main Title */}
                    <text
                      x={node.x - 118}
                      y={node.y + 6}
                      fill={colors.text}
                      fontSize="11.5"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                      className="select-none"
                    >
                      {node.label.length > 28 ? node.label.slice(0, 26) + '...' : node.label}
                    </text>

                    {/* Click indicator badge */}
                    <text
                      x={node.x - 118}
                      y={node.y + 20}
                      fill="#94a3b8"
                      fontSize="8"
                      fontFamily="monospace"
                      className="select-none uppercase"
                    >
                      [🔍 CLICK TO INSPECT DOSSIER]
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span> Politicians</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Deceptive Promises</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Statutory Failures</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> NPP Solutions</span>
            </div>
            <span className="text-slate-500">6 Local Languages Supported</span>
          </div>
        </div>

        {/* Right: Forensic Side Inspector Drawer (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono uppercase font-bold text-slate-300">Selected Node Inspector</span>
              </div>
              <button
                onClick={() => openDossierModal(selectedNode)}
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-mono font-bold rounded flex items-center gap-1 transition-colors cursor-pointer shadow-md"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Open Lie vs Truth Modal</span>
              </button>
            </div>

            {/* WHO SAID IT BADGE */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>WHO SAID IT / SPEAKER:</span>
              </div>
              <div className="text-sm font-black text-white flex items-center justify-between">
                <span>{selectedNode.speaker}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${selectedNode.speakerParty === 'NDC' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-green-950 text-green-300 border border-green-800'}`}>
                  {selectedNode.speakerParty || 'GH'}
                </span>
              </div>
              <div className="text-xs text-slate-400">{selectedNode.speakerRole}</div>
            </div>

            {/* Verbatim Quote in English & Local Languages */}
            <div className="bg-amber-950/20 border border-amber-500/40 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-mono font-bold uppercase text-amber-400 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  <span>Verbatim Quote / Political Claim:</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">{selectedNode.year}</span>
              </div>
              <div className="text-xs text-amber-200 italic font-serif leading-relaxed">
                "{getLocalizedQuote(selectedNode, selectedLanguage)}"
              </div>
            </div>

            {/* Citizen Hardship Impact */}
            {selectedNode.citizenHardshipImpact && (
              <div className="bg-rose-950/30 border border-rose-800/60 rounded-xl p-3 space-y-1">
                <div className="text-[10.5px] font-mono font-bold uppercase text-rose-400 flex items-center gap-1">
                  <HeartCrack className="w-3.5 h-3.5 text-rose-400" />
                  <span>Impact on Ordinary Ghanaians:</span>
                </div>
                <p className="text-xs text-rose-200/90 leading-relaxed">
                  {selectedNode.citizenHardshipImpact}
                </p>
              </div>
            )}

            {/* Statutory Reality & Court Docket */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="text-[10.5px] font-mono font-bold uppercase text-cyan-400 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-cyan-400" />
                <span>Statutory Reality & Outcome:</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {selectedNode.statutoryOutcome}
              </p>
              {selectedNode.financialLoss && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-rose-400 font-mono text-[11px] font-bold">
                  <span>Quantified Loss:</span>
                  <span>{selectedNode.financialLoss}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => openDossierModal(selectedNode)}
              className="w-full py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Inspect Full Multi-Lingual Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════════════
          ── BIG FORENSIC POPUP MODAL (SIDE-BY-SIDE LIE VS TRUTH IN 6 LANGUAGES) ──
      ════════════════════════════════════════════════════════════════════════════════ */}
      {isModalOpen && modalNode && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto flex flex-col justify-between my-auto">
            
            {/* Modal Top Header */}
            <div className="bg-gradient-to-r from-red-950 via-slate-900 to-indigo-950 p-5 border-b border-slate-700/80 sticky top-0 z-10 backdrop-blur-lg">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className={`text-[10.5px] font-mono font-black px-2.5 py-0.5 rounded border uppercase ${getNodeColor(modalNode.category).badge}`}>
                      {modalNode.category.replace(/_/g, ' ')}
                    </span>
                    <span className="bg-slate-950 text-cyan-400 text-[10.5px] font-mono font-bold px-2 py-0.5 rounded border border-cyan-500/40">
                      {modalNode.year}
                    </span>
                    <span className="bg-rose-500/20 text-rose-300 text-[10.5px] font-mono font-bold px-2 py-0.5 rounded border border-rose-500/40">
                      SEVERITY: {modalNode.impactScore}/100
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white tracking-tight">
                    {modalNode.label}
                  </h2>
                </div>

                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* WHO SAID THIS LIE / BANNER */}
              <div className="mt-3.5 bg-slate-950/90 border border-amber-500/50 rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm font-mono ${modalNode.speakerParty === 'NDC' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                    {modalNode.speakerParty || 'GH'}
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>WHO SAID IT / POLITICAL SPEAKER:</span>
                    </div>
                    <div className="text-sm font-black text-white">
                      {modalNode.speaker}
                    </div>
                    <div className="text-xs text-slate-400">
                      {modalNode.speakerRole}
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs font-mono">
                  <div className="text-slate-400 flex items-center md:justify-end gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>Venue: {modalNode.venueContext}</span>
                  </div>
                </div>
              </div>

              {/* Multi-Language Selector Tabs */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 font-bold">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Translate Quote into Ghanaian Languages:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        selectedLanguage === lang.code
                          ? 'bg-cyan-500 text-slate-950 font-black shadow-sm ring-1 ring-cyan-300'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Body: Side-by-Side 2-Column Split */}
            <div className="p-6 space-y-6 flex-1">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Column 1: The Lie / Deceptive Promise (Left Column) */}
                <div className="bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-950 border-2 border-amber-500/60 rounded-xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-500/30">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-amber-400" />
                      <h3 className="text-sm font-black font-mono uppercase tracking-wide text-amber-400">
                        The Deceptive Promise / Lie ({selectedLanguage.toUpperCase()})
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-700 text-amber-300 font-bold">
                      Claimed in {modalNode.year}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-mono text-slate-400 uppercase">
                      Verbatim Quote ({languages.find(l => l.code === selectedLanguage)?.label}):
                    </div>
                    <div className="bg-amber-950/50 border border-amber-600/40 rounded-lg p-3.5 text-amber-100 font-serif italic text-sm leading-relaxed">
                      "{getLocalizedQuote(modalNode, selectedLanguage)}"
                    </div>
                  </div>

                  {modalNode.electionContext && (
                    <div className="space-y-1 text-xs">
                      <span className="text-slate-400 font-mono text-[10.5px]">Political & Election Context:</span>
                      <p className="text-slate-300 bg-slate-900/60 p-2.5 rounded border border-slate-800 leading-relaxed">
                        {modalNode.electionContext}
                      </p>
                    </div>
                  )}

                  {modalNode.mediaOutlets && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <span className="text-[10.5px] font-mono text-slate-400 uppercase">Media & Broadcast Outlets:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {modalNode.mediaOutlets.map((outlet, i) => (
                          <span key={i} className="text-[10px] font-mono bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                            {outlet}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Column 2: The Truth / Statutory Reality (Right Column) */}
                <div className="bg-gradient-to-br from-rose-950/40 via-slate-950 to-slate-950 border-2 border-rose-500/60 rounded-xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between pb-2 border-b border-rose-500/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-rose-400" />
                      <h3 className="text-sm font-black font-mono uppercase tracking-wide text-rose-400">
                        Documented Statutory Reality
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 border border-rose-700 text-rose-300 font-bold">
                      Audit & Court Facts
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-mono text-slate-400 uppercase">Ground Truth Outcome:</div>
                    <div className="bg-rose-950/30 border border-rose-600/40 rounded-lg p-3.5 text-slate-200 text-xs leading-relaxed">
                      {modalNode.statutoryOutcome}
                    </div>
                  </div>

                  {modalNode.financialLoss && (
                    <div className="bg-rose-950/60 border border-rose-600/70 p-3 rounded-lg flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-rose-300 flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-rose-400" />
                        <span>Quantified State Financial Loss:</span>
                      </span>
                      <span className="text-sm font-black font-mono text-rose-200">
                        {modalNode.financialLoss}
                      </span>
                    </div>
                  )}

                  {modalNode.citizenHardshipImpact && (
                    <div className="bg-slate-950 p-3 rounded-lg border border-red-800/60 space-y-1">
                      <div className="text-[10px] font-mono uppercase font-bold text-red-400 flex items-center gap-1">
                        <HeartCrack className="w-3 h-3" />
                        <span>How This Hurts Ordinary Ghanaians:</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {modalNode.citizenHardshipImpact}
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* Verified Evidence Docket Checklist */}
              {modalNode.evidencePoints && modalNode.evidencePoints.length > 0 && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="text-xs font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>Verified Forensic Evidence Points:</span>
                  </div>
                  <div className="space-y-1.5">
                    {modalNode.evidencePoints.map((point, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-cyan-400 font-mono font-bold mt-0.5">[{index + 1}]</span>
                        <span className="leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Official Court, Parliamentary, and Auditor-General Citation */}
              <div className="bg-slate-950/90 border border-cyan-500/40 rounded-xl p-4 space-y-1.5">
                <div className="text-[10.5px] text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                  <Scale className="w-4 h-4" />
                  <span>Official Government, Court & Audit Citation:</span>
                </div>
                <div className="text-slate-200 text-xs bg-slate-900/80 p-3 rounded border border-slate-800 leading-relaxed">
                  {modalNode.officialDocket}
                </div>
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="bg-slate-950 p-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyEvidence(modalNode)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  {copiedState ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedState ? '✓ Dossier Copied!' : 'Copy Forensic Docket'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
