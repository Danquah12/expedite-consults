'use client';

import React, { useState, useEffect } from 'react';
import { 
  KafkaTopicMessage, 
  DLQRecord 
} from '@/lib/veritaslens/types';
import { 
  Layers, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap, 
  ArrowRight, 
  Cpu, 
  Database,
  RefreshCw,
  Search,
  Code,
  ShieldCheck,
  Scissors,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';

interface KafkaPipelineSimulatorProps {
  initialMessages: KafkaTopicMessage[];
  initialDlq: DLQRecord[];
  onDlqResolved?: (resolvedId: string) => void;
}

export const KafkaPipelineSimulator: React.FC<KafkaPipelineSimulatorProps> = ({
  initialMessages,
  initialDlq,
  onDlqResolved
}) => {
  const [messages, setMessages] = useState<KafkaTopicMessage[]>(initialMessages);
  const [dlqRecords, setDlqRecords] = useState<DLQRecord[]>(initialDlq);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [selectedMessage, setSelectedMessage] = useState<KafkaTopicMessage | DLQRecord | null>(null);
  const [batchSize, setBatchSize] = useState<number>(100);
  const [replayingId, setReplayingId] = useState<string | null>(null);
  const [replaySuccessAlert, setReplaySuccessAlert] = useState<string | null>(null);

  const TOPIC_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'articles.raw': { bg: 'bg-slate-800', text: 'text-slate-200', border: 'border-slate-700' },
    'articles.cleaned': { bg: 'bg-cyan-950', text: 'text-cyan-300', border: 'border-cyan-800' },
    'claims.classified': { bg: 'bg-purple-950', text: 'text-purple-300', border: 'border-purple-800' },
    'claims.extracted': { bg: 'bg-indigo-950', text: 'text-indigo-300', border: 'border-indigo-800' },
    'entities.resolved': { bg: 'bg-blue-950', text: 'text-blue-300', border: 'border-blue-800' },
    'evidence.discovered': { bg: 'bg-emerald-950', text: 'text-emerald-300', border: 'border-emerald-800' },
    'claims.scored': { bg: 'bg-teal-950', text: 'text-teal-300', border: 'border-teal-800' },
    'deadletter.llm': { bg: 'bg-rose-950', text: 'text-rose-300', border: 'border-rose-800' },
    'claims.replay': { bg: 'bg-amber-950', text: 'text-amber-300', border: 'border-amber-800' }
  };

  // Simulate periodic incoming messages when stream is active
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const topics: KafkaTopicMessage['topic'][] = [
        'articles.raw', 
        'claims.classified', 
        'claims.extracted', 
        'entities.resolved', 
        'evidence.discovered',
        'claims.scored'
      ];
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      const randomId = 'kfk-msg-' + Math.floor(1000 + Math.random() * 9000);
      const newMsg: KafkaTopicMessage = {
        id: randomId,
        topic: randomTopic,
        timestamp: new Date().toISOString(),
        partition: Math.floor(Math.random() * 3),
        offset: Math.floor(1000 + Math.random() * 9000),
        key: `key-${Math.floor(100 + Math.random() * 900)}`,
        payload: {
          event: `Streamed event on ${randomTopic}`,
          source: 'VeritasStreamIngestWorker',
          throughputMsgs: batchSize,
          processedInMs: Math.floor(25 + Math.random() * 40)
        },
        status: 'PROCESSED'
      };

      setMessages(prev => [newMsg, ...prev.slice(0, 49)]);
    }, 3500);

    return () => clearInterval(interval);
  }, [isStreaming, batchSize]);

  // Handle 1-click DLQ Replay with Intelligent Semantic Chunking & Schema Sanitization
  const handleReplayDLQ = (rec: DLQRecord) => {
    setReplayingId(rec.id);
    setTimeout(() => {
      const isTokenOverflow = rec.errorCategory === 'TOKEN_LIMIT_EXCEEDED' || rec.error.toLowerCase().includes('token');
      const isJsonError = rec.errorCategory === 'JSON_PARSE_ERROR' || rec.error.toLowerCase().includes('json');

      // Create replay event
      const replayMsg: KafkaTopicMessage = {
        id: 'kfk-replay-' + Math.floor(1000 + Math.random() * 9000),
        topic: 'claims.replay',
        timestamp: new Date().toISOString(),
        partition: 1,
        offset: Math.floor(1000 + Math.random() * 500),
        key: `replay-${rec.messageId}`,
        payload: {
          originalTopic: rec.originalTopic,
          replayedRecordId: rec.id,
          resolutionStrategy: isTokenOverflow 
            ? 'RecursiveSemanticCharacterSplitter(chunk_size=1500, overlap=150)' 
            : isJsonError 
              ? 'Regex Markdown Fence Stripper + Pydantic JSON Schema Validation' 
              : 'Exponential Backoff Retry with Throughput Throttling',
          chunksProcessed: isTokenOverflow ? 8 : 1,
          extractedTriplets: isTokenOverflow ? 18 : 6,
          tokenReduction: isTokenOverflow ? '18,450 tokens -> 8x 2,300 token windows' : 'N/A',
          status: 'RESOLVED_AND_REPLAYED'
        },
        status: 'REPLAYED'
      };

      setMessages(prev => [replayMsg, ...prev]);
      setDlqRecords(prev => prev.map(d => d.id === rec.id ? { ...d, resolved: true, replayedAt: new Date().toISOString() } : d));
      setReplayingId(null);
      
      let successText = `✅ Message ${rec.messageId} successfully sanitized and replayed into claims.replay!`;
      if (isTokenOverflow) {
        successText = `✅ TOKEN OVERFLOW RESOLVED: Message ${rec.messageId} (35-page PDF) partitioned into 8 semantic chunks (1,500 tokens/chunk). 18 claims extracted and replayed into claims.replay!`;
      } else if (isJsonError) {
        successText = `✅ JSON PARSE ERROR RESOLVED: Message ${rec.messageId} markdown code blocks stripped, validated against ClaimExtractionSchema, and successfully replayed into claims.replay!`;
      }
      
      setReplaySuccessAlert(successText);
      if (onDlqResolved) onDlqResolved(rec.id);
      setTimeout(() => setReplaySuccessAlert(null), 6000);
    }, 800);
  };

  // 1-Click Auto-Resolve All Unresolved DLQs
  const handleReplayAllDLQ = () => {
    const unresolved = dlqRecords.filter(d => !d.resolved);
    if (unresolved.length === 0) return;

    unresolved.forEach(rec => handleReplayDLQ(rec));
  };

  const filteredMessages = messages.filter(m => selectedTopic === 'ALL' || m.topic === selectedTopic);
  const activeDlqCount = dlqRecords.filter(d => !d.resolved).length;

  return (
    <div className="space-y-6">
      {/* Stream Control & Architecture Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">
                Kafka Event-Driven Stream Architecture (Batch & Ingestion)
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Never call LLMs directly from crawlers. Event topics decouple scrapers, BERT workers, LLM extractors, and Neo4j graph writers.
            </p>
          </div>

          {/* Stream Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400 font-mono">LLM Batch Size:</span>
              <span className="font-mono font-bold text-cyan-400">{batchSize} msgs/call</span>
            </div>

            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                isStreaming 
                  ? 'bg-amber-600/20 border border-amber-500/40 text-amber-300 hover:bg-amber-600/30' 
                  : 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30'
              }`}
            >
              {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isStreaming ? 'Pause Event Stream' : 'Resume Live Stream'}</span>
            </button>
          </div>
        </div>

        {/* Live Kafka Pipeline Flow Diagram */}
        <div className="mt-6 overflow-x-auto pb-2">
          <div className="flex items-center justify-between min-w-[760px] gap-2">
            {[
              { name: 'articles.raw', desc: 'RSS & Crawler Stream', icon: Database, color: 'border-slate-700 bg-slate-800/80 text-slate-300' },
              { name: 'claims.classified', desc: 'BERT Classifier', icon: Cpu, color: 'border-purple-800 bg-purple-950/80 text-purple-300' },
              { name: 'claims.extracted', desc: 'LLM Triplet Extractor', icon: Zap, color: 'border-indigo-800 bg-indigo-950/80 text-indigo-300' },
              { name: 'entities.resolved', desc: 'Entity Matcher', icon: Search, color: 'border-blue-800 bg-blue-950/80 text-blue-300' },
              { name: 'evidence.discovered', desc: 'Gov/Wire Citation', icon: ShieldCheck, color: 'border-emerald-800 bg-emerald-950/80 text-emerald-300' },
              { name: 'claims.scored', desc: 'Confidence Engine', icon: CheckCircle, color: 'border-teal-800 bg-teal-950/80 text-teal-300' }
            ].map((step, idx, arr) => (
              <React.Fragment key={step.name}>
                <div className={`p-3 rounded-xl border ${step.color} flex-1 text-center relative shadow-md`}>
                  <step.icon className="w-4 h-4 mx-auto mb-1 opacity-80" />
                  <div className="font-mono text-xs font-bold truncate">{step.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{step.desc}</div>
                </div>
                {idx < arr.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Batch Pattern Callout */}
        <div className="mt-4 p-3.5 bg-slate-950 rounded-lg border border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-800">
              BATCH PROCESSING RULE
            </span>
            <span className="text-slate-300">
              Avoid: <code className="text-rose-400 font-mono">1 msg = 1 LLM call</code> (high cost & latency) $\to$ Use: <code className="text-emerald-400 font-mono">100 msgs = 1 LLM batch poll</code>
            </span>
          </div>
          <span className="text-slate-500 font-mono text-[11px]">
            Average Ingestion Latency: <strong className="text-emerald-400">42ms</strong>
          </span>
        </div>
      </div>

      {/* Dead Letter Queue (DLQ) & Replay Engine */}
      <div className="bg-slate-900 border border-rose-900/60 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-950 border border-rose-800 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Dead Letter Queue (DLQ) & Replay Service</h3>
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-mono font-bold">
                  {activeDlqCount} Active Failures
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Guarantees zero message loss. Failed LLM timeouts, token overflows, and schema mismatches are quarantined and auditable.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeDlqCount > 0 && (
              <button
                onClick={handleReplayAllDLQ}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>⚡ Replay & Resolve All ({activeDlqCount})</span>
              </button>
            )}

            <button
              onClick={() => {
                const tokenOverflowRec = dlqRecords.find(d => !d.resolved && (d.errorCategory === 'TOKEN_LIMIT_EXCEEDED' || d.error.toLowerCase().includes('token')));
                if (tokenOverflowRec) {
                  handleReplayDLQ(tokenOverflowRec);
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Auto-Chunk Token Limit</span>
            </button>

            <div className="text-xs text-slate-400 font-mono hidden md:block">
              Replay Target: <code className="text-amber-400 font-bold">claims.replay</code>
            </div>
          </div>
        </div>

        {replaySuccessAlert && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-600 rounded-lg text-xs text-emerald-200 flex items-center gap-2 font-mono">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{replaySuccessAlert}</span>
          </div>
        )}

        {/* DLQ Records Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-2.5 px-3">Message ID</th>
                <th className="py-2.5 px-3">Original Topic</th>
                <th className="py-2.5 px-3">Error Classification</th>
                <th className="py-2.5 px-3">Retries</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Operational Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {dlqRecords.map(rec => (
                <tr key={rec.id} className="hover:bg-slate-950/40 transition">
                  <td className="py-3 px-3 font-mono font-bold text-rose-300">
                    {rec.messageId}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    {rec.originalTopic}
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-slate-200 font-semibold">{rec.errorCategory.replace(/_/g, ' ')}</div>
                    <div className="text-[11px] text-rose-400 font-mono leading-relaxed mt-0.5">{rec.error}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    {rec.retryCount} / 3
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                    {rec.timestamp.slice(11, 19)} UTC
                  </td>
                  <td className="py-3 px-3">
                    {rec.resolved ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold">
                        REPLAYED & RESOLVED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-mono font-bold">
                        QUARANTINED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      onClick={() => setSelectedMessage(rec)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono cursor-pointer"
                    >
                      Inspect
                    </button>
                    {!rec.resolved && (
                      <button
                        onClick={() => handleReplayDLQ(rec)}
                        disabled={replayingId === rec.id}
                        className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold font-mono transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        {replayingId === rec.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3 h-3" />
                        )}
                        <span>1-Click Replay</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Topic Stream Inspector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              Live Topic Event Stream Inspector
            </h3>
            <p className="text-xs text-slate-400">
              Viewing active partitions and committed offsets across consumer groups.
            </p>
          </div>

          {/* Topic Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Topic Filter:</span>
            <select
              value={selectedTopic}
              onChange={e => setSelectedTopic(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="ALL">All Topics</option>
              <option value="articles.raw">articles.raw</option>
              <option value="claims.classified">claims.classified</option>
              <option value="claims.extracted">claims.extracted</option>
              <option value="entities.resolved">entities.resolved</option>
              <option value="evidence.discovered">evidence.discovered</option>
              <option value="claims.scored">claims.scored</option>
              <option value="deadletter.llm">deadletter.llm</option>
              <option value="claims.replay">claims.replay</option>
            </select>
          </div>
        </div>

        {/* Message Stream Table */}
        <div className="overflow-x-auto mt-4 max-h-96 scrollbar-thin">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Topic</th>
                <th className="py-2.5 px-3">Partition:Offset</th>
                <th className="py-2.5 px-3">Key / ID</th>
                <th className="py-2.5 px-3">Payload Summary</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredMessages.map(msg => {
                const color = TOPIC_COLORS[msg.topic] || { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' };
                return (
                  <tr key={msg.id} className="hover:bg-slate-950/40 transition">
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${color.bg} ${color.text} ${color.border}`}>
                        {msg.topic}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                      P{msg.partition}:{msg.offset}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-200">
                      {msg.key}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px] max-w-sm break-all leading-snug">
                      {JSON.stringify(msg.payload)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                      {msg.timestamp.slice(11, 19)} UTC
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedMessage(msg)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message JSON Inspector Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-mono">
                  Kafka Message Inspector: {('messageId' in selectedMessage) ? selectedMessage.messageId : selectedMessage.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-slate-400 hover:text-white font-mono text-sm px-2 py-1 bg-slate-800 rounded cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Token Limit Remediation Blueprint Card (if token overflow) */}
            {('errorCategory' in selectedMessage) && (selectedMessage.errorCategory === 'TOKEN_LIMIT_EXCEEDED' || selectedMessage.error.toLowerCase().includes('token')) && (
              <div className="bg-slate-950 border border-indigo-900/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-mono font-bold uppercase text-indigo-300">
                      Token Limit Remediation Architecture
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                    Recursive Semantic Slicer Active
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-500">Raw Input</div>
                    <div className="font-bold text-rose-400">18,450 Tokens</div>
                    <div className="text-[9px] text-slate-500">35-page PDF</div>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-500">Target Chunk</div>
                    <div className="font-bold text-cyan-300">1,500 Tokens</div>
                    <div className="text-[9px] text-slate-500">150 overlap</div>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-500">Sub-Workers</div>
                    <div className="font-bold text-purple-300">8 Parallel</div>
                    <div className="text-[9px] text-slate-500">Map-Reduce</div>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-500">Extracted Triples</div>
                    <div className="font-bold text-emerald-400">18 Claims</div>
                    <div className="text-[9px] text-slate-500">0 Tokens Lost</div>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-900 p-3 rounded border border-slate-800 leading-relaxed font-sans">
                  <strong>Automated Fix:</strong> Instead of sending the full 35-page document in a single prompt, the ingest pipeline applies a sliding window with boundary detection at statutory headings (<code>§ 101</code>, <code>§ 102</code>). Each chunk is extracted concurrently and deduplicated in the reduce phase.
                </div>

                {!selectedMessage.resolved && (
                  <button
                    onClick={() => {
                      handleReplayDLQ(selectedMessage as DLQRecord);
                      setSelectedMessage(null);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg transition font-mono flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Execute Semantic Chunking & Replay to Kafka</span>
                  </button>
                )}
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Raw Event Payload:</span>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 max-h-60 overflow-y-auto scrollbar-thin">
                <pre>{JSON.stringify(selectedMessage, null, 2)}</pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
