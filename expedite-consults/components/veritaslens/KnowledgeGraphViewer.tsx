'use client';

import React, { useState } from 'react';
import { 
  KnowledgeGraphNode, 
  KnowledgeGraphEdge, 
  ClaimRecord 
} from '@/lib/veritaslens/types';
import { 
  Network, 
  Search, 
  FileText, 
  ShieldCheck, 
  Cpu, 
  UserCheck, 
  Share2, 
  Info, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  GitBranch,
  FileCheck
} from 'lucide-react';

interface KnowledgeGraphViewerProps {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  claims: ClaimRecord[];
}

export const KnowledgeGraphViewer: React.FC<KnowledgeGraphViewerProps> = ({
  nodes,
  edges,
  claims
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-clm-001');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];
  const associatedClaim = claims.find(c => c.id === 'clm-001'); // default to HR101 claim lineage

  const filteredNodes = nodes.filter(n => {
    const matchesFilter = filterType === 'ALL' || n.type === filterType;
    const matchesSearch = n.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const NODE_COLORS: Record<string, { fill: string; border: string; text: string; bg: string }> = {
    Article: { fill: '#1e293b', border: '#475569', text: '#cbd5e1', bg: 'bg-slate-800' },
    Claim: { fill: '#3b0764', border: '#a855f7', text: '#f3e8ff', bg: 'bg-purple-950' },
    Entity: { fill: '#082f49', border: '#0ea5e9', text: '#e0f2fe', bg: 'bg-sky-950' },
    Evidence: { fill: '#064e3b', border: '#10b981', text: '#d1fae5', bg: 'bg-emerald-950' },
    Model: { fill: '#312e81', border: '#6366f1', text: '#e0e7ff', bg: 'bg-indigo-950' },
    Reviewer: { fill: '#451a03', border: '#f59e0b', text: '#fef3c7', bg: 'bg-amber-950' }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">
                VeritasGraph: Knowledge Graph, Provenance & Data Lineage
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Neo4j-powered semantic graph connecting articles, extracted claims, resolved entities, evidence, and model audit records.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search graph nodes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs text-white pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 w-44"
              />
            </div>

            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="ALL">All Node Types</option>
              <option value="Article">Articles</option>
              <option value="Claim">Claims</option>
              <option value="Entity">Entities</option>
              <option value="Evidence">Evidence Citations</option>
              <option value="Model">ML Models</option>
              <option value="Reviewer">Human Reviewers</option>
            </select>
          </div>
        </div>

        {/* Graph Canvas & Inspector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Interactive Graph Canvas */}
          <div className="lg:col-span-8 bg-slate-950 rounded-xl border border-slate-800 p-4 relative min-h-[460px] flex flex-col justify-between overflow-hidden shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
              <span>Interactive Graph Space (Click any node to inspect lineage)</span>
              <span className="text-emerald-400 font-bold">{nodes.length} Nodes | {edges.length} Edges</span>
            </div>

            {/* SVG Visualizer */}
            <div className="w-full h-[400px] relative border border-slate-900 rounded-lg overflow-hidden bg-radial from-slate-900 to-slate-950">
              <svg className="w-full h-full">
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="8"
                    markerHeight="6"
                    refX="20"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#64748b" />
                  </marker>
                </defs>

                {/* Edges */}
                {edges.map(edge => {
                  const src = nodes.find(n => n.id === edge.source);
                  const tgt = nodes.find(n => n.id === edge.target);
                  if (!src || !tgt) return null;

                  return (
                    <g key={edge.id}>
                      <line
                        x1={src.x || 100}
                        y1={src.y || 100}
                        x2={tgt.x || 200}
                        y2={tgt.y || 200}
                        stroke={edge.relation.includes('CONTRADICT') ? '#f43f5e' : edge.relation.includes('SUPPORT') ? '#10b981' : '#475569'}
                        strokeWidth="1.5"
                        strokeDasharray={edge.relation.includes('EXTRACTED') ? '4 2' : 'none'}
                        markerEnd="url(#arrowhead)"
                      />
                      <text
                        x={((src.x || 100) + (tgt.x || 200)) / 2}
                        y={((src.y || 100) + (tgt.y || 200)) / 2 - 4}
                        fill="#94a3b8"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {edge.relation}
                      </text>
                    </g>
                  );
                })}

                {/* Nodes */}
                {filteredNodes.map(node => {
                  const style = NODE_COLORS[node.type] || NODE_COLORS.Article;
                  const isSelected = node.id === selectedNodeId;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x || 150}, ${node.y || 150})`}
                      onClick={() => setSelectedNodeId(node.id)}
                      className="cursor-pointer group"
                    >
                      <circle
                        r={isSelected ? 26 : 22}
                        fill={style.fill}
                        stroke={isSelected ? '#38bdf8' : style.border}
                        strokeWidth={isSelected ? 3 : 1.5}
                        className="transition-all duration-200"
                      />
                      <text
                        dy=".3em"
                        textAnchor="middle"
                        fill={style.text}
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                        className="pointer-events-none select-none"
                      >
                        {node.type.slice(0, 3)}
                      </text>
                      <text
                        y="34"
                        textAnchor="middle"
                        fill="#e2e8f0"
                        fontSize="10"
                        fontFamily="sans-serif"
                        className="pointer-events-none select-none drop-shadow"
                      >
                        {node.label.length > 20 ? node.label.slice(0, 18) + '...' : node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-900 text-[11px] font-mono">
              <span className="text-slate-500">Legend:</span>
              {Object.entries(NODE_COLORS).map(([type, c]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.border }}></span>
                  <span className="text-slate-300">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Node Lineage Inspector Drawer */}
          <div className="lg:col-span-4 bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Node Provenance Inspector</span>
                <h3 className="text-base font-bold text-white leading-tight">{selectedNode.label}</h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${NODE_COLORS[selectedNode.type]?.bg} ${NODE_COLORS[selectedNode.type]?.text}`}>
                {selectedNode.type}
              </span>
            </div>

            {/* Node Properties */}
            <div className="space-y-2">
              <div className="text-xs uppercase font-mono text-slate-400 font-bold">Metadata Properties:</div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
                {Object.entries(selectedNode.properties).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-slate-500">{k}:</span>
                    <span className="text-cyan-300 font-bold">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Explainable AI (XAI) Score Contributions */}
            {associatedClaim && (
              <div className="space-y-2">
                <div className="text-xs uppercase font-mono text-slate-400 font-bold flex items-center justify-between">
                  <span>Explainable AI (XAI) Weighting:</span>
                  <span className="text-emerald-400">Audit Ready</span>
                </div>
                <div className="space-y-1.5">
                  {associatedClaim.lineage.confidenceContributions.map((contrib, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-slate-900 p-2 rounded border border-slate-800 font-mono">
                      <span className="text-slate-300 text-[11px] truncate max-w-[180px]">{contrib.factor}</span>
                      <span className={`font-bold ${contrib.weight >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {contrib.weight > 0 ? `+${contrib.weight}` : contrib.weight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* OpenLineage Trace Summary */}
            <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800 text-xs space-y-2 font-mono">
              <div className="text-[11px] text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" />
                <span>OpenLineage Audit Trail</span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1">
                <div>Model: <strong className="text-slate-200">DeBERTa-v3-claim-v1.4</strong></div>
                <div>Tokenizer: <strong className="text-slate-200">microsoft/deberta-v3-base</strong></div>
                <div>Resolver: <strong className="text-slate-200">VeritasEntityResolver-v2.1</strong></div>
                <div>Verified by: <strong className="text-slate-200">Congress.gov 118th Official Track</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Digital Twin Information Ecosystem / Propagation Flow */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              Digital Twin of Information Ecosystem (Narrative Propagation Flow)
            </h3>
          </div>
          <span className="text-xs font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
            Temporal Analysis
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Allows investigators to answer: <em>How did this claim spread? Who originated it? Which cable networks amplified it? When was it corrected?</em>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {[
            { step: '1. Origin Event', title: 'Oklahoma CAIR Keynote', desc: 'Candidate remarks in 2022 on anti-sharia ballot language', time: 'T+0 hr', color: 'border-slate-700 bg-slate-950' },
            { step: '2. Wire / Primary Fact', title: 'PolitiFact Archive', desc: 'Recorded transcript confirms adherence to US Constitution', time: 'T+4 hr', color: 'border-emerald-800 bg-emerald-950/40' },
            { step: '3. Cable Primetime', title: 'Fox News Hannity Interview', desc: 'Framed as "Another Dodge!" with selective out-of-context video clip', time: 'T+24 hr', color: 'border-rose-800 bg-rose-950/40' },
            { step: '4. Digital Commentary', title: 'Daily Wire & Social Media', desc: 'Viral amplification with aggressive ad hominem headlines', time: 'T+36 hr', color: 'border-amber-800 bg-amber-950/40' },
            { step: '5. Retraction / Verification', title: 'Fact-Check Distribution', desc: 'Independent rating agencies assign "Pants on Fire" verdict', time: 'T+48 hr', color: 'border-cyan-800 bg-cyan-950/40' }
          ].map((flow, idx) => (
            <div key={idx} className={`p-3.5 rounded-xl border ${flow.color} space-y-1.5`}>
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span className="font-bold text-white">{flow.step}</span>
                <span className="text-cyan-400">{flow.time}</span>
              </div>
              <div className="text-xs font-bold text-slate-100">{flow.title}</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">{flow.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
