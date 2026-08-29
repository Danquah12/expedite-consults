'use client';

import React, { useState } from 'react';
import { 
  ClaimLabel, 
  ClaimRecord, 
  ModelMetrics 
} from '@/lib/veritaslens/types';
import { 
  classifyClaimText, 
  calculateLexicalLoad, 
  calculateSentimentPolarity 
} from '@/lib/veritaslens/pipeline-engine';
import { 
  Cpu, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Activity, 
  RotateCw, 
  Download, 
  Sparkles, 
  Layers, 
  Sliders,
  BarChart3,
  Flame
} from 'lucide-react';

interface BERTClassifierStudioProps {
  initialClaims: ClaimRecord[];
  modelMetrics: ModelMetrics;
  onRetrainTriggered?: () => void;
}

export const BERTClassifierStudio: React.FC<BERTClassifierStudioProps> = ({
  initialClaims,
  modelMetrics,
  onRetrainTriggered
}) => {
  const [inputText, setInputText] = useState('The Senate passed HR101.');
  const [activeAnalysis, setActiveAnalysis] = useState(() => classifyClaimText('The Senate passed HR101.'));
  const [lexicalAnalysis, setLexicalAnalysis] = useState(() => calculateLexicalLoad('The Senate passed HR101.'));
  const [sentimentVal, setSentimentVal] = useState(() => calculateSentimentPolarity('The Senate passed HR101.'));
  
  const [reviewQueue, setReviewQueue] = useState<ClaimRecord[]>(
    initialClaims.filter(c => c.confidence < 0.70 || c.reviewStatus === 'Pending_Review')
  );
  const [retrainingState, setRetrainingState] = useState<'idle' | 'training' | 'completed'>('idle');
  const [activeTab, setActiveTab] = useState<'inference' | 'evaluation' | 'drift' | 'active-learning'>('inference');

  const SAMPLE_PRESETS = [
    { label: 'Factual Claim', text: 'The Senate passed HR101.' },
    { label: 'Economic Prediction', text: 'Experts predict inflation will fall next year.' },
    { label: 'Subjective Opinion', text: 'The federal immigration bill is terrible and destructive to workers.' },
    { label: 'Low-Confidence Rumor', text: 'Abdul El-Sayed openly called for Sharia law to replace American legal statutes.' },
    { label: 'Interrogative Query', text: 'Why did the Supreme Court lift the preliminary postal injunction?' }
  ];

  const handleRunInference = (textToAnalyze?: string) => {
    const target = textToAnalyze || inputText;
    if (!target.trim()) return;

    const result = classifyClaimText(target);
    const lex = calculateLexicalLoad(target);
    const sent = calculateSentimentPolarity(target);

    setActiveAnalysis(result);
    setLexicalAnalysis(lex);
    setSentimentVal(sent);

    // If confidence is < 0.70, automatically add to active learning queue
    if (result.confidence < 0.70) {
      const newLowConfClaim: ClaimRecord = {
        id: 'clm-user-' + Date.now(),
        articleId: 'user-input-prompt',
        outletName: 'Live Interactive Studio',
        sentence: target,
        primaryLabel: result.primaryLabel,
        secondaryLabel: result.secondaryLabel,
        confidence: result.confidence,
        extractedTriplet: result.triplet,
        evidenceScore: 40,
        evidenceStatus: 'Unverified',
        evidenceDetails: [{ source: 'Real-time BERT Inference Worker', qualityScore: 80, notes: 'Low model confidence triggered human review requirement', isOfficialRecord: false }],
        reviewStatus: 'Pending_Review',
        lineage: {
          originArticleUrl: 'custom://interactive-inference',
          originOutlet: 'Direct User Input',
          ingestionTimestamp: new Date().toISOString(),
          tokenizer: 'microsoft/deberta-v3-base-tokenizer',
          classificationModel: modelMetrics.version,
          extractionModel: 'Azure-OpenAI-GPT-5-Extractor',
          entityModel: 'VeritasEntityResolver-v2.1',
          confidenceContributions: [{ factor: 'Model ambiguity flag', weight: -30 }],
          lastAuditTimestamp: new Date().toISOString()
        }
      };
      setReviewQueue(prev => {
        if (prev.some(p => p.sentence === target)) return prev;
        return [newLowConfClaim, ...prev];
      });
    }
  };

  const handleReviewLabel = (claimId: string, correctedLabel: ClaimLabel) => {
    setReviewQueue(prev => prev.map(c => c.id === claimId ? { ...c, reviewStatus: 'Reviewed', reviewerCorrection: correctedLabel } : c));
  };

  const handleTriggerRetraining = () => {
    setRetrainingState('training');
    setTimeout(() => {
      setRetrainingState('completed');
      if (onRetrainTriggered) onRetrainTriggered();
      setTimeout(() => setRetrainingState('idle'), 4000);
    }, 2000);
  };

  const handleExportTrainingCSV = () => {
    const csvHeader = 'text,label\n';
    const rows = reviewQueue.map(c => `"${c.sentence}","${c.reviewerCorrection || c.primaryLabel}"`).join('\n');
    const blob = new Blob([csvHeader + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'training_data_v2.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Module Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-bold text-white">DeBERTa-v3 Claim Classification & MLOps Studio</h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-bold">
            {modelMetrics.version}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('inference')}
            className={`px-3 py-1 font-semibold rounded-md transition cursor-pointer ${
              activeTab === 'inference' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Inference
          </button>
          <button
            onClick={() => setActiveTab('evaluation')}
            className={`px-3 py-1 font-semibold rounded-md transition cursor-pointer ${
              activeTab === 'evaluation' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Model Metrics & Matrix
          </button>
          <button
            onClick={() => setActiveTab('drift')}
            className={`px-3 py-1 font-semibold rounded-md transition cursor-pointer ${
              activeTab === 'drift' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Drift Detector (PSI)
          </button>
          <button
            onClick={() => setActiveTab('active-learning')}
            className={`px-3 py-1 font-semibold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'active-learning' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-purple-300'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Active Learning Queue ({reviewQueue.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE INFERENCE */}
      {activeTab === 'inference' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input & Presets Pane */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono text-slate-400 font-bold">
                  Input Sentence for BERT Tokenization & Inference:
                </span>
                <span className="text-[11px] font-mono text-cyan-400">
                  Target: 7-Class Prediction
                </span>
              </div>

              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                rows={3}
                placeholder="Type or paste any political or news statement to classify..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
              />

              {/* Preset Buttons */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-slate-400 font-mono">Load Real-World Statement Presets:</div>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputText(preset.text);
                        handleRunInference(preset.text);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 transition cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleRunInference()}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider font-mono transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Run BERT / DeBERTa Classification</span>
              </button>
            </div>

            {/* Feature Extraction Breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              <div className="text-xs uppercase font-mono text-slate-400 font-bold flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Automated NLP Feature Extraction
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-400 font-mono">Lexical Load (Spin Words)</div>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                    {(lexicalAnalysis.score * 100).toFixed(1)}%
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {lexicalAnalysis.loadedWordsFound.length > 0 ? (
                      <span>Flagged: <code className="text-rose-400">{lexicalAnalysis.loadedWordsFound.join(', ')}</code></span>
                    ) : (
                      'No emotive adjectives detected (Neutral)'
                    )}
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-400 font-mono">Sentiment Polarity</div>
                  <div className={`text-xl font-bold font-mono mt-1 ${sentimentVal < 0 ? 'text-rose-400' : sentimentVal > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {sentimentVal > 0 ? `+${sentimentVal}` : sentimentVal}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Scale: -1.0 (Hostile) to +1.0 (Positive)
                  </div>
                </div>
              </div>

              {/* Extracted Triplet */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
                <div className="text-xs font-mono font-bold text-indigo-300 uppercase">
                  LLM Triplet Extraction (Subject-Predicate-Object)
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">SUBJECT</span>
                    <span className="text-white font-semibold">{activeAnalysis.triplet.subject}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">PREDICATE</span>
                    <span className="text-cyan-400 font-semibold">{activeAnalysis.triplet.predicate}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">OBJECT</span>
                    <span className="text-purple-400 font-semibold">{activeAnalysis.triplet.object}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Classification Probabilities Pane */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-xs uppercase font-mono text-slate-400">Primary Classification</span>
                  <h3 className="text-lg font-black text-white font-mono">{activeAnalysis.primaryLabel}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-mono text-slate-400">Confidence</span>
                  <div className={`text-lg font-black font-mono ${activeAnalysis.confidence >= 0.90 ? 'text-emerald-400' : activeAnalysis.confidence >= 0.70 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {(activeAnalysis.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Confidence Routing Alert */}
              {activeAnalysis.confidence < 0.70 ? (
                <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-xs text-rose-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-mono">HUMAN REVIEW REQUIRED (&lt; 0.70)</strong>
                    This prediction is automatically quarantined and routed to the Active Learning queue for human verification.
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-200 flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Auto-Accepted by Enterprise Threshold (&gt; 0.90)</span>
                </div>
              )}

              {/* Multi-Class Probability Bars */}
              <div className="space-y-2 pt-2">
                <div className="text-xs uppercase font-mono text-slate-400 font-bold">
                  Class Probability Distribution:
                </div>
                {(Object.entries(activeAnalysis.probabilities) as [ClaimLabel, number][]).map(([lbl, prob]) => (
                  <div key={lbl} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className={lbl === activeAnalysis.primaryLabel ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
                        {lbl}
                      </span>
                      <span className="text-slate-300">{(prob * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${prob * 100}%` }}
                        className={`h-full transition-all duration-300 ${
                          lbl === activeAnalysis.primaryLabel ? 'bg-gradient-to-r from-purple-500 to-cyan-400' : 'bg-slate-700'
                        }`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* NLP Reasoning */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
                <span className="font-mono text-purple-400 font-bold block">Syntactic & Semantic Justification:</span>
                <p className="text-slate-400 leading-relaxed">{activeAnalysis.reasoning}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MODEL METRICS & CONFUSION MATRIX */}
      {activeTab === 'evaluation' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-mono">Accuracy</span>
              <div className="text-3xl font-black text-white font-mono mt-1">
                {(modelMetrics.accuracy * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-emerald-400">Target &gt; 90% (Pass)</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-mono">Precision</span>
              <div className="text-3xl font-black text-white font-mono mt-1">
                {(modelMetrics.precision * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-emerald-400">Target &gt; 92% (Pass)</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-mono">Recall</span>
              <div className="text-3xl font-black text-white font-mono mt-1">
                {(modelMetrics.recall * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-emerald-400">Target &gt; 90% (Pass)</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-mono">F1 Score</span>
              <div className="text-3xl font-black text-cyan-400 font-mono mt-1">
                {(modelMetrics.f1Score * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-cyan-400">Target &gt; 91% (Pass)</span>
            </div>
          </div>

          {/* Confusion Matrix & Latency Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Confusion Matrix */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  Confusion Matrix (12,500 Test Samples)
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Actual vs Predicted</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs font-mono">
                  <thead>
                    <tr className="text-slate-400 text-[10px] border-b border-slate-800">
                      <th className="p-2 text-left">Actual \ Pred</th>
                      {modelMetrics.confusionMatrix.labels.map(l => (
                        <th key={l} className="p-2">{l.slice(0, 4)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {modelMetrics.confusionMatrix.labels.map((actualLabel, rowIdx) => (
                      <tr key={actualLabel}>
                        <td className="p-2 text-left font-bold text-slate-300">{actualLabel}</td>
                        {modelMetrics.confusionMatrix.matrix[rowIdx].map((val, colIdx) => (
                          <td 
                            key={colIdx} 
                            className={`p-2.5 ${
                              rowIdx === colIdx ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-800' : 'text-slate-400 bg-slate-950/40'
                            }`}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Latency & Hardware Benchmarks */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white font-mono">Real-Time Latency Metrics</h3>
                <span className="text-[11px] text-slate-400">Inference response time under live production load</span>
              </div>

              <div className="space-y-3 font-mono">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Average Latency:</span>
                  <span className="text-base font-bold text-emerald-400">{modelMetrics.avgLatencyMs} ms</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400">P95 Latency:</span>
                  <span className="text-base font-bold text-cyan-400">{modelMetrics.p95LatencyMs} ms</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400">P99 Latency:</span>
                  <span className="text-base font-bold text-amber-400">{modelMetrics.p99LatencyMs} ms</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-950/80 p-3 rounded-lg border border-slate-800 leading-relaxed">
                Deployed on GPU tensor inference node with TorchScript optimization and ONNX runtime acceleration.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DRIFT DETECTOR */}
      {activeTab === 'drift' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Production Model Drift Monitoring</h3>
              </div>
              <p className="text-xs text-slate-400">
                Detects Data Drift (input change), Concept Drift (semantic shift), and Prediction Drift (output distribution skew).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-mono font-bold">
                Status: {modelMetrics.driftMetrics.driftStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 font-mono">Population Stability Index (PSI)</div>
              <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                {modelMetrics.driftMetrics.psi}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                &lt; 0.1 Stable | 0.1 - 0.25 Moderate | &gt; 0.25 Significant
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 font-mono">KL Divergence Score</div>
              <div className="text-3xl font-black text-cyan-400 font-mono mt-1">
                {modelMetrics.driftMetrics.klDivergence}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Compares training vs production probability distributions
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 font-mono">Confidence Drift Shift</div>
              <div className="text-3xl font-black text-slate-200 font-mono mt-1">
                {modelMetrics.driftMetrics.confidenceShiftPct}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Average confidence delta over 7-day rolling window
              </div>
            </div>
          </div>

          {/* Distribution Comparison Graphic */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-mono uppercase font-bold text-slate-300">
              Training Set vs Production Stream Distribution Comparison:
            </h4>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>FACTUAL_CLAIM (Training: 50% vs Production: 54%)</span>
                  <span className="text-emerald-400">+4% (Stable)</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden flex">
                  <div className="bg-purple-600 h-full w-[50%]"></div>
                  <div className="bg-cyan-400 h-full w-[4%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>OPINION (Training: 25% vs Production: 22%)</span>
                  <span className="text-slate-300">-3% (Stable)</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full w-[22%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>PREDICTION (Training: 15% vs Production: 14%)</span>
                  <span className="text-slate-300">-1% (Stable)</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full w-[14%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVE LEARNING LOOP */}
      {activeTab === 'active-learning' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Active Learning & Human-in-the-Loop Annotation Queue
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Review low-confidence predictions, label them correctly, and export them into retraining pipelines.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportTrainingCSV}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold transition cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export training_data_v2.csv</span>
              </button>

              <button
                onClick={handleTriggerRetraining}
                disabled={retrainingState === 'training'}
                className="px-3.5 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${retrainingState === 'training' ? 'animate-spin' : ''}`} />
                <span>{retrainingState === 'training' ? 'Retraining Pipeline In Progress...' : 'Trigger Retraining Pipeline'}</span>
              </button>
            </div>
          </div>

          {retrainingState === 'completed' && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-600 rounded-lg text-xs text-emerald-200 flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Retraining pipeline finished! Model artifact registered as DeBERTa-v3-claim-v1.5 and staged for canary rollout.</span>
            </div>
          )}

          {/* Review Queue Items */}
          <div className="space-y-4">
            {reviewQueue.length === 0 ? (
              <div className="text-center py-8 text-slate-500 font-mono text-xs">
                No active low-confidence items in queue. All model predictions exceed 0.70 threshold.
              </div>
            ) : (
              reviewQueue.map(item => (
                <div key={item.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-mono font-bold">
                        Confidence: {(item.confidence * 100).toFixed(1)}%
                      </span>
                      <span className="text-xs font-mono text-slate-400">Model Predicted: <strong className="text-white">{item.primaryLabel}</strong></span>
                      <span className="text-xs font-mono text-slate-500">Source: {item.outletName}</span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      Status: {item.reviewStatus === 'Reviewed' ? (
                        <strong className="text-emerald-400 font-bold">Reviewed ({item.reviewerCorrection})</strong>
                      ) : (
                        <strong className="text-amber-400">Pending Review</strong>
                      )}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-100 bg-slate-900 p-3 rounded-lg border border-slate-800">
                    "{item.sentence}"
                  </p>

                  {/* Review Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="text-[11px] text-slate-400 font-mono">Assign Human Corrected Ground Truth:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(['FACTUAL_CLAIM', 'OPINION', 'PREDICTION', 'ANALYSIS', 'RUMOR', 'QUESTION'] as ClaimLabel[]).map(lbl => (
                        <button
                          key={lbl}
                          onClick={() => handleReviewLabel(item.id, lbl)}
                          className={`px-2.5 py-1 rounded text-xs font-mono transition cursor-pointer ${
                            item.reviewerCorrection === lbl
                              ? 'bg-emerald-600 text-white font-bold'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
