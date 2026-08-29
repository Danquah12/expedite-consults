'use client';

import React, { useState } from 'react';
import { 
  CopilotMessage, 
  ClaimRecord, 
  NewsCluster 
} from '@/lib/veritaslens/types';
import { 
  Search, 
  Sparkles, 
  Send, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Bookmark, 
  Download, 
  Layers, 
  Cpu, 
  FileImage, 
  FileCode, 
  Mic, 
  Bot,
  User,
  ArrowRight
} from 'lucide-react';

interface InvestigationWorkspaceProps {
  claims: ClaimRecord[];
  clusters: NewsCluster[];
}

export const InvestigationWorkspace: React.FC<InvestigationWorkspaceProps> = ({
  claims,
  clusters
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'msg-1',
      sender: 'user',
      content: 'Did the Senate pass HR 101? How confident are we and what evidence supports it?',
      timestamp: '2026-08-25T18:05:00Z'
    },
    {
      id: 'msg-2',
      sender: 'copilot',
      content: 'I have executed a GraphRAG multi-agent verification query across Congress.gov legislative tracking, historical public law indices, and wire reporting.',
      timestamp: '2026-08-25T18:05:02Z',
      structuredOutput: {
        confidence: 96.5,
        verdict: 'CONTEXT_DEPENDENT',
        evidenceCitations: [
          {
            source: 'Congress.gov (118th US Congress 2023-2024)',
            title: 'H.R. 101: Return to Work Act',
            weight: 100,
            finding: 'Contradicted: Referred to House Committee on Oversight & Accountability; it never passed the Senate or House.'
          },
          {
            source: 'U.S. Senate Historical Archives (111th Congress 2010)',
            title: 'Public Law 111-290: Continuing Appropriations Resolution',
            weight: 100,
            finding: 'Supported: Passed the Senate on Dec 18, 2010, and was signed into law.'
          },
          {
            source: 'State Legislative Journals (KY / IL)',
            title: 'House Resolution 101 (State Commendations)',
            weight: 80,
            finding: 'Irrelevant: Single-chamber resolutions that never proceed to any Senate.'
          }
        ],
        propagationSummary: 'The statement is often erroneously asserted by cable segments without specifying congressional session dates, causing confusion between the active 118th bill and the historical 111th enactment.'
      }
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeTab, setActiveTab] = useState<'copilot' | 'dossier' | 'multimodal'>('copilot');
  const [savedDossierItems, setSavedDossierItems] = useState<string[]>([
    'H.R. 101 Legislative Audit - Session Ambiguity',
    'Tom Homan NYC Sanctuary Jurisdictional Claim'
  ]);

  const PRESET_QUERIES = [
    'Did the Senate pass HR 101? How confident are we?',
    'What is the most trustworthy view of the ICE detention surge?',
    'Analyze the credibility of Fox News video on Abdul El-Sayed.',
    'How did the Tom Homan sanctuary speech spread across media?'
  ];

  const handleSendQuery = (customPrompt?: string) => {
    const q = customPrompt || inputQuery;
    if (!q.trim()) return;

    const userMsg: CopilotMessage = {
      id: 'msg-user-' + Date.now(),
      sender: 'user',
      content: q,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    setTimeout(() => {
      let botResponse: CopilotMessage;
      const lower = q.toLowerCase();

      if (lower.includes('ice') || lower.includes('arrests')) {
        botResponse = {
          id: 'msg-bot-' + Date.now(),
          sender: 'copilot',
          content: 'Here is the multi-source evidence synthesis for the ICE interior apprehensions surge.',
          timestamp: new Date().toISOString(),
          structuredOutput: {
            confidence: 94.0,
            verdict: 'VERIFIED',
            evidenceCitations: [
              {
                source: 'Department of Homeland Security Quarterly Statistical Release',
                title: 'Interior Apprehensions FY2026 Q3',
                weight: 100,
                finding: 'Confirmed: 23% increase in interior non-citizen detentions (41,200 individuals).'
              },
              {
                source: 'Reuters / Associated Press Neutral Wire',
                title: 'US Immigration Processing Report',
                weight: 95,
                finding: 'Corroborated: Straight factual tallies verify court docket delays.'
              }
            ],
            propagationSummary: 'Progressive outlets framed the data around civil liberties and humanitarian concerns; conservative outlets framed the exact same numbers as law-and-order successes.'
          }
        };
      } else if (lower.includes('el-sayed') || lower.includes('sharia')) {
        botResponse = {
          id: 'msg-bot-' + Date.now(),
          sender: 'copilot',
          content: 'Cross-referencing verified primary video transcripts and independent fact-checker databases regarding Abdul El-Sayed remarks.',
          timestamp: new Date().toISOString(),
          structuredOutput: {
            confidence: 97.2,
            verdict: 'CONTRADICTED',
            evidenceCitations: [
              {
                source: 'PolitiFact Independent Fact-Check Archive',
                title: 'Abdul El-Sayed Sharia Law Video Fact-Check',
                weight: 98,
                finding: 'Rated "Pants on Fire!": 2022 speech defended separation of church/state and US Constitution.'
              },
              {
                source: 'CAIR 2022 Verified Keynote Audio Transcript',
                title: 'Primary Source Recording',
                weight: 100,
                finding: 'Confirmed: Criticized anti-sharia ballot measure roots, made no call for Sharia law in America.'
              }
            ],
            propagationSummary: 'Fox News broadcast utilized ad hominem framing ("It\'s another dodge!") to prime audience sentiment before transcript evaluation.'
          }
        };
      } else {
        botResponse = {
          id: 'msg-bot-' + Date.now(),
          sender: 'copilot',
          content: `Multi-agent reasoning complete for query: "${q}". Grounded against VeritasGraph knowledge triples and Qdrant semantic embeddings.`,
          timestamp: new Date().toISOString(),
          structuredOutput: {
            confidence: 92.0,
            verdict: 'VERIFIED',
            evidenceCitations: [
              {
                source: 'VeritasGraph Verified Triplets Store',
                title: 'Cross-Outlet Fact Resolution',
                weight: 90,
                finding: 'Evidence substantiated across 3 independent wire and primary government registries.'
              }
            ],
            propagationSummary: 'No critical contradictions or retractions detected across verified primary records.'
          }
        };
      }

      setMessages(prev => [...prev, botResponse]);
      setIsThinking(false);
    }, 1200);
  };

  const handleBookmarkDossier = (title: string) => {
    if (!savedDossierItems.includes(title)) {
      setSavedDossierItems(prev => [...prev, title]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">
              GraphRAG Copilot & Analyst Investigation Workspace
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            A "Bloomberg Terminal for Information" — Multi-agent reasoning with verifiable citations, dossiers, and multimodal checks.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('copilot')}
            className={`px-3 py-1 font-semibold rounded-md transition cursor-pointer ${
              activeTab === 'copilot' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            GraphRAG Copilot
          </button>
          <button
            onClick={() => setActiveTab('dossier')}
            className={`px-3 py-1 font-semibold rounded-md transition cursor-pointer ${
              activeTab === 'dossier' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Investigation Dossier ({savedDossierItems.length})
          </button>
          <button
            onClick={() => setActiveTab('multimodal')}
            className={`px-3 py-1 font-semibold rounded-md transition cursor-pointer ${
              activeTab === 'multimodal' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Multimodal Studio
          </button>
        </div>
      </div>

      {/* TAB 1: GRAPHRAG COPILOT */}
      {activeTab === 'copilot' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Chat Stream */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between min-h-[560px]">
            {/* Messages Scroll Area */}
            <div className="space-y-4 overflow-y-auto max-h-[460px] pr-2 scrollbar-thin">
              {messages.map(msg => (
                <div 
                  key={msg.id}
                  className={`flex gap-3 text-xs ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'copilot' && (
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-2xl rounded-xl p-4 space-y-3 ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white font-medium'
                      : 'bg-slate-950 border border-slate-800 text-slate-200'
                  }`}>
                    <p className="leading-relaxed">{msg.content}</p>

                    {/* Structured GraphRAG Output Card */}
                    {msg.structuredOutput && (
                      <div className="bg-slate-900/90 rounded-lg p-3.5 border border-slate-800 space-y-3 text-xs font-sans">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-400 uppercase font-bold">Veritas Verdict:</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              msg.structuredOutput.verdict === 'VERIFIED'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : msg.structuredOutput.verdict === 'CONTRADICTED'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              {msg.structuredOutput.verdict.replace('_', ' ')}
                            </span>
                          </div>

                          <span className="text-cyan-400 font-bold">
                            Confidence: {msg.structuredOutput.confidence}%
                          </span>
                        </div>

                        {/* Evidence Citations */}
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                            Audited Primary Evidence Citations:
                          </span>
                          {msg.structuredOutput.evidenceCitations.map((ev, idx) => (
                            <div key={idx} className="bg-slate-950 p-2.5 rounded border border-slate-800/80 space-y-1">
                              <div className="flex justify-between items-center text-[11px] font-mono">
                                <span className="font-bold text-slate-200">{ev.source}</span>
                                <span className="text-emerald-400">Weight: +{ev.weight}</span>
                              </div>
                              <div className="text-[11px] text-cyan-300 font-semibold">{ev.title}</div>
                              <p className="text-[11px] text-slate-400 leading-snug">{ev.finding}</p>
                            </div>
                          ))}
                        </div>

                        {/* Propagation Summary */}
                        {msg.structuredOutput.propagationSummary && (
                          <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80 text-[11px] text-slate-300">
                            <strong className="text-purple-400 font-mono block">Propagation Analysis:</strong>
                            {msg.structuredOutput.propagationSummary}
                          </div>
                        )}

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleBookmarkDossier(msg.structuredOutput?.evidenceCitations[0]?.title || 'Investigation Record')}
                            className="text-[11px] text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1 cursor-pointer"
                          >
                            <Bookmark className="w-3 h-3" />
                            <span>Save to Investigation Dossier</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-slate-950 p-3 rounded-lg border border-slate-800 w-fit">
                  <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Multi-Agent System Reasoning (Planner $\to$ Extractor $\to$ Reflection Agent)...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask any verification query (e.g., 'Did the Senate pass HR 101?')..."
                  value={inputQuery}
                  onChange={e => setInputQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendQuery()}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
                <button
                  onClick={() => handleSendQuery()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Query</span>
                </button>
              </div>

              {/* Preset Shortcuts */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 font-mono">Suggested Inquiries:</span>
                {PRESET_QUERIES.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendQuery(q)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  >
                    "{q.slice(0, 32)}..."
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Multi-Agent Architecture Sidebar */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="text-xs uppercase font-mono font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Multi-Agent Reasoning Pipeline
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                VeritasLens employs specialized agents rather than a single monolithic prompt.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { name: '1. Supervisor & Planner', role: 'Deconstructs user inquiry into sub-claims and dates.', status: 'Ready' },
                { name: '2. Claim Extractor', role: 'Generates structured Subject-Predicate-Object triplets.', status: 'Ready' },
                { name: '3. Entity Resolver', role: 'Maps ambiguous aliases (e.g. "HR101") to canonical bills.', status: 'Ready' },
                { name: '4. Evidence Retriever', role: 'Queries Neo4j knowledge graph and Qdrant vector space.', status: 'Ready' },
                { name: '5. Reflection Agent', role: 'Audits independent confirmations and contradiction counts.', status: 'Ready' }
              ].map((ag, idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-bold text-slate-200">{ag.name}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">{ag.status}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{ag.role}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
              <span className="text-cyan-400 font-bold block">Why Multi-Agent Reflection Matters:</span>
              <p>When an LLM proposes 95% confidence, the Reflection Agent asks: <em>"Were contradictory state resolutions checked? Were primary government sources separated from opinion blogs?"</em></p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVESTIGATION DOSSIER */}
      {activeTab === 'dossier' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-blue-400" />
                Saved Investigation Cases & Dossiers
              </h3>
              <p className="text-xs text-slate-400">
                Institutional research records, verified evidence bookmarks, and downloadable compliance packages.
              </p>
            </div>

            <button
              onClick={() => alert('Investigation Dossier exported to Veritas_Audit_Dossier_2026.pdf')}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Dossier (PDF/JSON)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedDossierItems.map((item, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-100">{item}</span>
                  <span className="text-emerald-400 text-[10px] font-bold">VERIFIED DOSSIER</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Contains multi-source cross-validation, entity disambiguation logs, and primary source transcript citations.
                </p>
                <div className="flex justify-between items-center pt-2 text-[11px] font-mono text-slate-500">
                  <span>Last Updated: 2026-08-25 UTC</span>
                  <button className="text-blue-400 hover:underline cursor-pointer">Open Full Case Record</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MULTIMODAL STUDIO */}
      {activeTab === 'multimodal' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              Multimodal Verification Studio
            </h3>
            <p className="text-xs text-slate-400">
              Future-proof information intelligence across PDFs, image OCR, reverse photo lookups, and audio/video transcripts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Image / OCR Verification */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
                <FileImage className="w-4 h-4" />
                <span>Image & OCR Verification</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Extracts text from protest crowd photos, cross-references geolocation metadata, and executes reverse image matching.
              </p>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
                Models: GPT-4o Vision, Florence-2, CLIP
              </div>
            </div>

            {/* PDF / SEC / Court Filings */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                <FileCode className="w-4 h-4" />
                <span>PDF & Government Records</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Parses 100+ page Congressional bills, Supreme Court slip opinions, and SEC 10-K filings into chunked claim embeddings.
              </p>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
                Tools: PyMuPDF, Document Intelligence
              </div>
            </div>

            {/* Audio / Video Transcripts */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
                <Mic className="w-4 h-4" />
                <span>Broadcast Audio & Video</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time speech-to-text transcription of television debates, press conferences, and podcast interviews.
              </p>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
                Tools: OpenAI Whisper-v3, Azure Speech
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
