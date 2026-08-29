"use client";

import { useState } from "react";
import { MALWARE_SAMPLES } from "@/data/samples";
import { MalwareSample } from "@/types/malware";
import { downloadBlob } from "@/lib/utils";
import {
  UserCheck,
  Brain,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
  Database,
  Send,
  Zap,
  History,
  Tag,
  Check,
  RotateCcw,
  Cpu
} from "lucide-react";

interface FeedbackRecord {
  id: string;
  sampleId: string;
  sampleName: string;
  aiVerdict: "MALICIOUS" | "SUSPICIOUS" | "BENIGN";
  aiRiskScore: number;
  analystVerdict: "TRUE_POSITIVE" | "FALSE_POSITIVE" | "FALSE_NEGATIVE" | "TRUE_NEGATIVE" | "NEEDS_ESCALATION";
  correctedFamily: string;
  correctedMitre: string[];
  uncertaintyScore: number;
  analystNotes: string;
  analystId: string;
  timestamp: string;
  status: "Committed" | "Pending_Retrain" | "Retrained";
  signatureHash: string;
}

interface ActiveLearningQueueItem {
  id: string;
  sampleName: string;
  hash: string;
  family: string;
  entropy: number;
  modelScore: number;
  uncertainty: number;
  disagreement: string;
  dominantFactor: string;
  status: "Queued" | "Reviewing" | "Resolved";
}

const INITIAL_QUEUE: ActiveLearningQueueItem[] = [
  {
    id: "AL-8921",
    sampleName: "dropper_obfuscated_v3.bin",
    hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    family: "Dropper / Loader",
    entropy: 7.89,
    modelScore: 54.2,
    uncertainty: 0.92,
    disagreement: "RF (82%) vs XGB (39%) vs DL (51%)",
    dominantFactor: "High section entropy but benign import hash (kernel32 only)",
    status: "Queued"
  },
  {
    id: "AL-8922",
    sampleName: "installer_signed_revoked.msi",
    hash: "a4f8910b72c918349281a0293812039840192840918239018290381029381029",
    family: "Trojan / Adware",
    entropy: 6.42,
    modelScore: 48.7,
    uncertainty: 0.88,
    disagreement: "RF (41%) vs LLM ('Suspicious MSI Script')",
    dominantFactor: "Expired certificate + CustomAction powershell execution",
    status: "Queued"
  },
  {
    id: "AL-8923",
    sampleName: "rust_stealer_packed.exe",
    hash: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    family: "Stealer",
    entropy: 7.96,
    modelScore: 61.4,
    uncertainty: 0.79,
    disagreement: "YARA (No Match) vs Heuristic (LSASS Handle)",
    dominantFactor: "Novel Rust compiler runtime strings mimic legitimate utility",
    status: "Queued"
  },
  {
    id: "AL-8924",
    sampleName: "svchost_inject_test.dll",
    hash: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    family: "C2 Beacon",
    entropy: 7.15,
    modelScore: 52.0,
    uncertainty: 0.95,
    disagreement: "Random Forest (49%) vs Volatility (Hollowing)",
    dominantFactor: "Memory unhooking pattern matches known red team test harness",
    status: "Queued"
  }
];

const INITIAL_FEEDBACK_HISTORY: FeedbackRecord[] = [
  {
    id: "FB-1049",
    sampleId: "SAMPLE-002",
    sampleName: "SillyPutty.exe",
    aiVerdict: "MALICIOUS",
    aiRiskScore: 85,
    analystVerdict: "TRUE_POSITIVE",
    correctedFamily: "Backdoor",
    correctedMitre: ["T1059.001 (PowerShell)", "T1036 (Masquerading)", "T1095 (TCP Socket)"],
    uncertaintyScore: 0.12,
    analystNotes: "Confirmed trojanized PuTTY v0.70 entry point injecting PowerShell background thread.",
    analystId: "SOC-ANALYST-07 (J. Vance)",
    timestamp: "2026-08-23 14:12 UTC",
    status: "Pending_Retrain",
    signatureHash: "e4d909c290d0fb1ca068ffaddf22cbd0ffd82436"
  },
  {
    id: "FB-1048",
    sampleId: "SAMPLE-004",
    sampleName: "RedLineStealer.exe",
    aiVerdict: "MALICIOUS",
    aiRiskScore: 92,
    analystVerdict: "TRUE_POSITIVE",
    correctedFamily: "Stealer",
    correctedMitre: ["T1555.003 (Browser Passwords)", "T1005 (Local Data)", "T1571 (WCF Port)"],
    uncertaintyScore: 0.08,
    analystNotes: "Extracted ConfuserEx keys and confirmed DPAPI decryption loop targeting Chrome and Edge.",
    analystId: "RE-LEAD-02 (S. Chen)",
    timestamp: "2026-08-22 18:45 UTC",
    status: "Retrained",
    signatureHash: "9a01f82b0129a0f4819283019283019284910293"
  }
];

export default function AnalystFeedbackPage() {
  const [selectedSample, setSelectedSample] = useState<MalwareSample>(MALWARE_SAMPLES[0]);
  const [analystVerdict, setAnalystVerdict] = useState<"TRUE_POSITIVE" | "FALSE_POSITIVE" | "FALSE_NEGATIVE" | "TRUE_NEGATIVE" | "NEEDS_ESCALATION">("TRUE_POSITIVE");
  const [selectedFamily, setSelectedFamily] = useState<string>(MALWARE_SAMPLES[0].family);
  const [analystNotes, setAnalystNotes] = useState<string>("");
  const [analystId, setAnalystId] = useState<string>("SOC-ANALYST-42 (Senior Reverse Engineer)");
  const [selectedMitreTags, setSelectedMitreTags] = useState<string[]>(
    MALWARE_SAMPLES[0].mitreTechniques.map(m => `${m.techniqueId} - ${m.technique}`)
  );
  const [customMitreInput, setCustomMitreInput] = useState("");
  
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackRecord[]>(INITIAL_FEEDBACK_HISTORY);
  const [activeQueue, setActiveQueue] = useState<ActiveLearningQueueItem[]>(INITIAL_QUEUE);
  const [selectedQueueItem, setSelectedQueueItem] = useState<ActiveLearningQueueItem | null>(null);

  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainStep, setRetrainStep] = useState(0);
  const [retrainLogs, setRetrainLogs] = useState<string[]>([]);
  const [retrainMetrics, setRetrainMetrics] = useState<{
    samplesTrained: number;
    f1Delta: string;
    aucRoc: string;
    modelVersion: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"workbench" | "queue" | "drift" | "history">("workbench");

  const handleSampleChange = (s: MalwareSample) => {
    setSelectedSample(s);
    setSelectedFamily(s.family);
    setSelectedMitreTags(s.mitreTechniques.map(m => `${m.techniqueId} - ${m.technique}`));
    setAnalystVerdict("TRUE_POSITIVE");
    setAnalystNotes(`Analyst verification for sample ${s.name} (${s.id}). Verified risk score: ${s.riskScore}/100.`);
  };

  const handleAddMitreTag = () => {
    if (customMitreInput.trim() && !selectedMitreTags.includes(customMitreInput.trim())) {
      setSelectedMitreTags([...selectedMitreTags, customMitreInput.trim()]);
      setCustomMitreInput("");
    }
  };

  const handleRemoveMitreTag = (tag: string) => {
    setSelectedMitreTags(selectedMitreTags.filter(t => t !== tag));
  };

  const handleSubmitFeedback = () => {
    const newRecord: FeedbackRecord = {
      id: `FB-${Math.floor(1000 + Math.random() * 9000)}`,
      sampleId: selectedSample.id,
      sampleName: selectedSample.name,
      aiVerdict: selectedSample.verdict,
      aiRiskScore: selectedSample.riskScore,
      analystVerdict: analystVerdict,
      correctedFamily: selectedFamily,
      correctedMitre: selectedMitreTags,
      uncertaintyScore: Math.abs(50 - selectedSample.riskScore) < 15 ? 0.85 : 0.15,
      analystNotes: analystNotes || "Verified by analyst. Ground truth labels updated.",
      analystId: analystId,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16) + " UTC",
      status: "Pending_Retrain",
      signatureHash: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
    };

    setFeedbackHistory([newRecord, ...feedbackHistory]);
    
    if (selectedQueueItem) {
      setActiveQueue(prev => prev.map(q => q.id === selectedQueueItem.id ? { ...q, status: "Resolved" } : q));
      setSelectedQueueItem(null);
    }

    alert(`[SUCCESS] Feedback ${newRecord.id} committed to Ground Truth Store! Added to next fine-tuning cycle.`);
  };

  const runRetrainPipeline = async () => {
    setIsRetraining(true);
    setRetrainStep(1);
    setRetrainLogs(["[INITIALIZATION] Starting CERBERUS Active Learning Retraining Pipeline..."]);
    
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    await sleep(800);
    setRetrainStep(2);
    setRetrainLogs(prev => [
      "[STEP 1/6] Ingested 184 newly verified analyst ground-truth annotations from SQLite feedback store.",
      "[DATASET] Synthesizing hard negatives using SMOTE & PE structural perturbation...",
      ...prev
    ]);

    await sleep(900);
    setRetrainStep(3);
    setRetrainLogs(prev => [
      "[STEP 2/6] Feature Extractor Re-indexing: Calibrating 1,024 MalAPI vectors & opcode n-gram frequencies.",
      "[DRIFT CORRECTION] Population Stability Index (PSI) reduced from 0.28 to 0.04 (Drift eliminated).",
      ...prev
    ]);

    await sleep(900);
    setRetrainStep(4);
    setRetrainLogs(prev => [
      "[STEP 3/6] Fine-tuning XGBoost Gradient Boosted Trees (1,200 estimators, max_depth=8).",
      "[STEP 4/6] Fine-tuning Deep Transformer PE Sequence Classifier with AdamW (lr=2e-5, cosine scheduler).",
      ...prev
    ]);

    await sleep(1000);
    setRetrainStep(5);
    setRetrainLogs(prev => [
      "[STEP 5/6] Validation Holdout Evaluation: Running against 4,500 labeled enterprise zero-day challenge samples.",
      "[METRICS] True Positive Rate: 99.4% (+1.8%), False Positive Rate: 0.12% (-0.45%), F1-Score: 0.988 (+0.038).",
      ...prev
    ]);

    await sleep(800);
    setRetrainStep(6);
    setRetrainLogs(prev => [
      "[STEP 6/6] Packaging model artifact 'CERBERUS-v4.2.1-online.onnx'.",
      "[DEPLOY] Canary rolled out to Triton Inferencing Cluster. All nodes reporting healthy status.",
      "[SUCCESS] Pipeline complete! Online inferencing updated with analyst feedback.",
      ...prev
    ]);

    setRetrainMetrics({
      samplesTrained: 184 + feedbackHistory.length * 12,
      f1Delta: "+3.8%",
      aucRoc: "0.994",
      modelVersion: "v4.2.1-online"
    });

    setFeedbackHistory(prev => prev.map(f => ({ ...f, status: "Retrained" })));
    setIsRetraining(false);
  };

  const handleExportDataset = () => {
    const jsonStr = JSON.stringify(feedbackHistory, null, 2);
    downloadBlob(jsonStr, `cerberus_analyst_feedback_${Date.now()}.json`, "application/json");
  };

  return (
    <div style={{ padding: "20px 24px", minHeight: "100%", background: "var(--bg)" }}>
      {/* Header Banner */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border)",
        paddingBottom: 16,
        marginBottom: 20
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 8,
            background: "rgba(6, 182, 212, 0.12)",
            border: "1px solid rgba(6, 182, 212, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <UserCheck size={24} color="var(--primary)" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--fg)" }}>
                Analyst Feedback & Active Learning Studio
              </h1>
              <span className="badge-critical" style={{ background: "rgba(6,182,212,0.15)", color: "#22d3ee", borderColor: "rgba(6,182,212,0.3)" }}>
                Pillar 11 • HITL Engine
              </span>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Human-in-the-Loop verdict override workbench, uncertainty sampling queue, concept drift tracker, and 1-Click model fine-tuning pipeline.
            </p>
          </div>
        </div>

        {/* Top Action Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={handleExportDataset}
            className="btn-secondary"
            style={{ fontSize: 11.5 }}
          >
            <Database size={13} /> Export Labeled Corpus (.JSON)
          </button>

          <button
            onClick={runRetrainPipeline}
            disabled={isRetraining}
            className="btn-primary"
            style={{ fontSize: 11.5, background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}
          >
            {isRetraining ? (
              <>
                <RefreshCw size={13} className="animate-spin" /> Training in Progress...
              </>
            ) : (
              <>
                <Zap size={13} /> Trigger Dataset Fine-Tuning & Model Retrain
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
        marginBottom: 20
      }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>Total Analyst Overrides</span>
            <UserCheck size={16} color="var(--primary)" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", marginTop: 4 }}>
            {128 + feedbackHistory.length}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--green)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
            <TrendingUp size={11} /> 94.2% agreement with Tier-3 consensus
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>Active Learning Queue</span>
            <Sparkles size={16} color="var(--yellow)" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fbbf24", marginTop: 4 }}>
            {activeQueue.filter(q => q.status === "Queued").length} Borderline
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>
            Uncertainty threshold p in [0.45, 0.65]
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>Dataset Drift Index (PSI)</span>
            <Activity size={16} color="var(--green)" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#10b981", marginTop: 4 }}>
            0.042 <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)" }}>Stable</span>
          </div>
          <div style={{ fontSize: 10.5, color: "var(--green)", marginTop: 2 }}>
            No significant feature distribution shift
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>Fine-Tuning Readiness</span>
            <Brain size={16} color="var(--purple)" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#c084fc", marginTop: 4 }}>
            Ready (v4.2)
          </div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>
            {feedbackHistory.filter(f => f.status === "Pending_Retrain").length} pending annotations
          </div>
        </div>
      </div>

      {/* Retrain Execution Progress Banner */}
      {(isRetraining || retrainMetrics) && (
        <div style={{
          background: "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(168,85,247,0.1))",
          border: "1px solid rgba(6,182,212,0.4)",
          borderRadius: 8,
          padding: 16,
          marginBottom: 20
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Cpu size={18} color="var(--primary)" className={isRetraining ? "animate-pulse" : ""} />
              <span style={{ fontWeight: 800, fontSize: 13, color: "var(--fg)" }}>
                {isRetraining ? `Retraining Pipeline Stage ${retrainStep}/6: Executing GPU Fine-Tuning...` : "Model Retraining Completed Successfully!"}
              </span>
            </div>
            {retrainMetrics && (
              <span className="badge-low" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <CheckCircle2 size={12} /> Active Model: {retrainMetrics.modelVersion} ({retrainMetrics.f1Delta} F1 Gain)
              </span>
            )}
          </div>

          <div style={{ width: "100%", height: 6, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
            <div style={{
              width: `${(retrainStep / 6) * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg, #06b6d4, #10b981)",
              transition: "width 0.4s ease"
            }} />
          </div>

          <div className="terminal-box" style={{ maxHeight: 120, fontSize: 11 }}>
            {retrainLogs.map((log, idx) => (
              <div key={idx} style={{ color: log.includes("SUCCESS") || log.includes("METRICS") ? "#34d399" : log.includes("STEP") ? "#22d3ee" : "#cbd5e1" }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Studio Navigation Tabs */}
      <div style={{
        display: "flex",
        gap: 6,
        borderBottom: "1px solid var(--border)",
        marginBottom: 20
      }}>
        {[
          { id: "workbench", label: "Analyst Override Workbench", icon: UserCheck, count: null },
          { id: "queue", label: "Active Learning Uncertainty Queue", icon: Sparkles, count: activeQueue.filter(q => q.status === "Queued").length },
          { id: "drift", label: "Model & Concept Drift Monitor", icon: Activity, count: null },
          { id: "history", label: "Ground-Truth Feedback History", icon: History, count: feedbackHistory.length },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                background: isActive ? "var(--surface)" : "transparent",
                borderTop: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                borderLeft: isActive ? "1px solid var(--border)" : "1px solid transparent",
                borderRight: isActive ? "1px solid var(--border)" : "1px solid transparent",
                borderBottom: "none",
                borderRadius: "6px 6px 0 0",
                color: isActive ? "var(--primary)" : "var(--muted)",
                fontWeight: isActive ? 700 : 500,
                fontSize: 12.5,
                cursor: "pointer"
              }}
            >
              <Icon size={14} color={isActive ? "var(--primary)" : "var(--muted)"} />
              {tab.label}
              {tab.count !== null && (
                <span style={{
                  fontSize: 9.5,
                  padding: "1px 6px",
                  borderRadius: 10,
                  background: isActive ? "rgba(6,182,212,0.2)" : "var(--surface-2)",
                  color: isActive ? "var(--primary)" : "var(--muted)",
                  fontWeight: 700
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERRIDE WORKBENCH */}
      {activeTab === "workbench" && (
        <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 20 }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
                Select Target Corpus Sample
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {MALWARE_SAMPLES.map(sample => {
                  const isSel = selectedSample.id === sample.id;
                  return (
                    <div
                      key={sample.id}
                      onClick={() => handleSampleChange(sample)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 6,
                        background: isSel ? "rgba(6,182,212,0.12)" : "var(--surface-2)",
                        border: isSel ? "1px solid var(--primary)" : "1px solid var(--border)",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: isSel ? "var(--primary)" : "var(--fg)" }}>
                          {sample.name}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
                          {sample.id} • {sample.family}
                        </div>
                      </div>
                      <span className="badge-critical" style={{
                        background: sample.riskScore > 80 ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                        color: sample.riskScore > 80 ? "#f87171" : "#fbbf24",
                        borderColor: sample.riskScore > 80 ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"
                      }}>
                        Risk: {sample.riskScore}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                  Current Automated AI Inference
                </span>
                <Brain size={14} color="var(--primary)" />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11.5, color: "var(--fg-2)" }}>Model Verdict</span>
                  <span className="badge-critical" style={{ background: "rgba(239,68,68,0.2)", color: "#f87171" }}>
                    {selectedSample.verdict}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11.5, color: "var(--fg-2)" }}>Predicted Risk Score</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#f87171" }}>
                    {selectedSample.riskScore} / 100
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11.5, color: "var(--fg-2)" }}>Predicted Family</span>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--fg)" }}>
                    {selectedSample.family}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11.5, color: "var(--fg-2)" }}>Random Forest Confidence</span>
                  <span style={{ fontSize: 11.5, fontFamily: "monospace", color: "#34d399" }}>
                    {selectedSample.mlConfidence.randomForestScore}%
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11.5, color: "var(--fg-2)" }}>XGBoost Score</span>
                  <span style={{ fontSize: 11.5, fontFamily: "monospace", color: "#34d399" }}>
                    {selectedSample.mlConfidence.xgboostScore}%
                  </span>
                </div>

                <div style={{
                  padding: 8,
                  background: "var(--surface-2)",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  fontSize: 10.5,
                  color: "var(--fg-2)",
                  lineHeight: 1.4
                }}>
                  <strong style={{ color: "var(--primary)" }}>Dominant Feature:</strong> {selectedSample.mlConfidence.dominantFeature}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Override Inputs */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)" }}>
                  Ground Truth Annotation & Override Panel
                </h3>
                <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  Overriding model decisions directly updates the active learning training dataset with high-sample weight.
                </p>
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <UserCheck size={14} color="var(--primary)" />
                <span>Analyst ID: <strong>{analystId.split(" ")[0]}</strong></span>
              </div>
            </div>

            {/* 1. Ground Truth Verdict */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--fg-2)", marginBottom: 8 }}>
                1. HUMAN GROUND-TRUTH VERDICT OVERRIDE
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                {[
                  { value: "TRUE_POSITIVE", label: "True Positive", desc: "Malicious confirmed", color: "#ef4444" },
                  { value: "FALSE_POSITIVE", label: "False Positive", desc: "Benign / Whitelisted", color: "#10b981" },
                  { value: "FALSE_NEGATIVE", label: "False Negative", desc: "Missed zero-day malware", color: "#f59e0b" },
                  { value: "TRUE_NEGATIVE", label: "True Negative", desc: "Benign confirmed", color: "#3b82f6" },
                  { value: "NEEDS_ESCALATION", label: "Escalate (P1)", desc: "Requires Tier-3 / Lead", color: "#a855f7" }
                ].map(opt => {
                  const isSel = analystVerdict === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setAnalystVerdict(opt.value as any)}
                      style={{
                        padding: "10px 8px",
                        borderRadius: 6,
                        border: isSel ? `2px solid ${opt.color}` : "1px solid var(--border)",
                        background: isSel ? `${opt.color}18` : "var(--surface-2)",
                        color: isSel ? opt.color : "var(--fg-2)",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 800 }}>{opt.label}</div>
                      <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Family & Sign-off */}
            <div style={{ marginBottom: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--fg-2)", marginBottom: 6 }}>
                  2. CORRECTED MALWARE FAMILY
                </label>
                <select
                  value={selectedFamily}
                  onChange={(e) => setSelectedFamily(e.target.value)}
                  className="tool-select"
                  style={{ width: "100%", height: 38 }}
                >
                  {["Ransomware", "Trojan", "Stealer", "C2 Beacon", "Worm", "Backdoor", "Dropper", "Rootkit", "Downloader", "Spyware", "Adware / PUA"].map(fam => (
                    <option key={fam} value={fam}>{fam}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--fg-2)", marginBottom: 6 }}>
                  ANALYST OPERATOR SIGN-OFF
                </label>
                <input
                  type="text"
                  value={analystId}
                  onChange={(e) => setAnalystId(e.target.value)}
                  className="tool-input"
                  style={{ width: "100%", height: 38 }}
                />
              </div>
            </div>

            {/* 3. MITRE Technique Mappings */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--fg-2)" }}>
                  3. MITRE ATT&CK GROUND TRUTH MAPPINGS
                </label>
                <span style={{ fontSize: 10, color: "var(--muted)" }}>Click 'x' to prune incorrect mappings</span>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                {selectedMitreTags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(6, 182, 212, 0.12)",
                      border: "1px solid rgba(6, 182, 212, 0.35)",
                      color: "#22d3ee",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: 4
                    }}
                  >
                    <Tag size={10} />
                    {tag}
                    <button
                      onClick={() => handleRemoveMitreTag(tag)}
                      style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 12, padding: 0 }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder="Add MITRE technique (e.g. T1055.012 - Process Hollowing)"
                  value={customMitreInput}
                  onChange={(e) => setCustomMitreInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddMitreTag()}
                  className="tool-input"
                  style={{ flex: 1 }}
                />
                <button onClick={handleAddMitreTag} className="btn-secondary" style={{ fontSize: 11 }}>
                  + Add Technique
                </button>
              </div>
            </div>

            {/* 4. Disassembly Notes */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--fg-2)", marginBottom: 6 }}>
                4. REVERSE ENGINEERING RATIONALE & EVIDENCE AUDIT TRAIL
              </label>
              <textarea
                value={analystNotes}
                onChange={(e) => setAnalystNotes(e.target.value)}
                placeholder="Detail the disassembly findings, IDA/Ghidra offsets, API call chains, or unpacked memory dumps that substantiate this verdict override..."
                style={{
                  width: "100%",
                  height: 90,
                  background: "#04060a",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  color: "var(--fg)",
                  padding: 10,
                  fontSize: 11.5,
                  fontFamily: "monospace",
                  outline: "none",
                  resize: "vertical"
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => {
                  setAnalystNotes("");
                  setAnalystVerdict("TRUE_POSITIVE");
                }}
                className="btn-secondary"
              >
                <RotateCcw size={13} /> Reset Form
              </button>
              <button
                onClick={handleSubmitFeedback}
                className="btn-primary"
                style={{ padding: "8px 20px" }}
              >
                <Send size={13} /> Commit Feedback to Ground Truth Store
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE LEARNING UNCERTAINTY SAMPLING QUEUE */}
      {activeTab === "queue" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>
                  Active Learning Uncertainty Sampling Queue
                </h3>
                <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  Samples where ensemble ML classifiers exhibit maximum discordance or model entropy is closest to 0.50. Human labeling on these samples provides maximal gradient update efficiency.
                </p>
              </div>
              <span className="badge-high">
                {activeQueue.filter(q => q.status === "Queued").length} Unresolved Samples
              </span>
            </div>

            <table className="cerberus-table">
              <thead>
                <tr>
                  <th>Queue ID</th>
                  <th>Sample Binary</th>
                  <th>Entropy</th>
                  <th>Model Score</th>
                  <th>Uncertainty Index</th>
                  <th>Model Disagreement / Conflict</th>
                  <th>Dominant Discordance Factor</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeQueue.map((item) => (
                  <tr key={item.id} style={{ background: selectedQueueItem?.id === item.id ? "rgba(6,182,212,0.06)" : undefined }}>
                    <td style={{ fontFamily: "monospace", color: "var(--primary)", fontWeight: 700 }}>
                      {item.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--fg)" }}>{item.sampleName}</div>
                      <div style={{ fontSize: 9.5, color: "var(--muted)", fontFamily: "monospace" }}>{item.hash.substring(0, 20)}...</div>
                    </td>
                    <td style={{ fontFamily: "monospace" }}>{item.entropy}</td>
                    <td>
                      <span style={{
                        fontFamily: "monospace",
                        fontWeight: 700,
                        color: Math.abs(50 - item.modelScore) < 10 ? "#fbbf24" : "#f87171"
                      }}>
                        {item.modelScore}%
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 50, height: 5, background: "var(--surface-3)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${item.uncertainty * 100}%`, height: "100%", background: "#ef4444" }} />
                        </div>
                        <span style={{ fontSize: 10, fontFamily: "monospace", color: "#f87171", fontWeight: 700 }}>
                          {(item.uncertainty * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: 11, color: "var(--fg-2)" }}>{item.disagreement}</td>
                    <td style={{ fontSize: 10.5, color: "var(--muted)", maxWidth: 260 }}>{item.dominantFactor}</td>
                    <td>
                      {item.status === "Resolved" ? (
                        <span className="badge-low" style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                          <Check size={10} /> Resolved
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedQueueItem(item);
                            setActiveTab("workbench");
                            setAnalystNotes(`Active Learning resolution for ${item.sampleName} (${item.id}): Investigated discordance between models [${item.disagreement}].`);
                          }}
                          className="btn-primary"
                          style={{ padding: "4px 10px", fontSize: 10.5 }}
                        >
                          Review & Label
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MODEL & CONCEPT DRIFT MONITOR */}
      {activeTab === "drift" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>
                Statistical Feature Drift Analysis (PSI & KS-Test)
              </h3>
              <Activity size={16} color="var(--green)" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { feature: "PE Section Entropy Distribution", psi: "0.021", status: "Stable", pVal: "p = 0.48" },
                { feature: "Import Address Table (IAT) Function Density", psi: "0.038", status: "Stable", pVal: "p = 0.32" },
                { feature: "Dynamic Memory Injection API Chains", psi: "0.089", status: "Moderate Shift", pVal: "p = 0.08" },
                { feature: "Unusual Compiler Signatures (Rust/Nim/Go)", psi: "0.142", status: "Noticeable Drift", pVal: "p = 0.02" },
                { feature: "Obfuscated PowerShell & Script Blocks", psi: "0.015", status: "Stable", pVal: "p = 0.76" },
              ].map((row, idx) => (
                <div key={idx} style={{ padding: 10, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>{row.feature}</span>
                    <span className={row.status === "Stable" ? "badge-low" : row.status === "Moderate Shift" ? "badge-high" : "badge-critical"}>
                      {row.status}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10.5, color: "var(--muted)" }}>
                    <span>Population Stability Index (PSI): <strong style={{ color: "var(--fg)" }}>{row.psi}</strong></span>
                    <span>Kolmogorov-Smirnov: <strong style={{ color: "var(--fg)" }}>{row.pVal}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>
                Model F1-Score Degradation & Retraining Yield
              </h3>
              <TrendingUp size={16} color="var(--primary)" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ padding: 12, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}>
                  <span style={{ color: "var(--fg-2)" }}>Production Model (CERBERUS-v4.1)</span>
                  <span style={{ fontWeight: 800, color: "#f87171" }}>F1: 0.942</span>
                </div>
                <div style={{ width: "100%", height: 6, background: "var(--surface-3)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: "94.2%", height: "100%", background: "#f87171" }} />
                </div>
                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>Trained on 125,000 legacy binaries (Aug 2025)</div>
              </div>

              <div style={{ padding: 12, background: "rgba(6, 182, 212, 0.08)", borderRadius: 6, border: "1px solid rgba(6,182,212,0.3)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}>
                  <span style={{ color: "var(--fg)", fontWeight: 700 }}>Retrained Model (CERBERUS-v4.2.1-online)</span>
                  <span style={{ fontWeight: 800, color: "#22d3ee" }}>F1: 0.988 (+4.6%)</span>
                </div>
                <div style={{ width: "100%", height: 6, background: "var(--surface-3)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: "98.8%", height: "100%", background: "linear-gradient(90deg, #06b6d4, #10b981)" }} />
                </div>
                <div style={{ fontSize: 10, color: "var(--primary)", marginTop: 4 }}>Incorporates 184 active analyst feedback labels & SMOTE synthetic hard negatives</div>
              </div>

              <div style={{ padding: 10, background: "var(--surface-2)", borderRadius: 6, fontSize: 11, color: "var(--muted)" }}>
                <strong style={{ color: "var(--fg)" }}>Active Learning Efficiency:</strong> 1 human annotation in the uncertainty queue provides equal gradient correction to 42 randomly sampled benign/malicious instances.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GROUND-TRUTH FEEDBACK AUDIT LOG */}
      {activeTab === "history" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>
              Analyst Feedback Audit Trail & Ground-Truth Store
            </h3>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              {feedbackHistory.length} total records logged
            </span>
          </div>

          <table className="cerberus-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Sample</th>
                <th>AI Verdict</th>
                <th>Analyst Ground Truth</th>
                <th>Corrected Family</th>
                <th>Analyst Sign-Off</th>
                <th>Timestamp</th>
                <th>Retrain Status</th>
              </tr>
            </thead>
            <tbody>
              {feedbackHistory.map((rec) => (
                <tr key={rec.id}>
                  <td style={{ fontFamily: "monospace", color: "var(--primary)", fontWeight: 700 }}>
                    {rec.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--fg)" }}>{rec.sampleName}</div>
                    <div style={{ fontSize: 9.5, color: "var(--muted)", fontFamily: "monospace" }}>{rec.sampleId}</div>
                  </td>
                  <td>
                    <span className="badge-critical" style={{ fontSize: 9 }}>
                      {rec.aiVerdict} ({rec.aiRiskScore})
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontWeight: 800,
                      color: rec.analystVerdict === "TRUE_POSITIVE" ? "#ef4444" : rec.analystVerdict === "FALSE_POSITIVE" ? "#10b981" : "#f59e0b"
                    }}>
                      {rec.analystVerdict}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: "var(--fg)" }}>
                    {rec.correctedFamily}
                  </td>
                  <td style={{ fontSize: 10.5, color: "var(--fg-2)" }}>
                    {rec.analystId}
                  </td>
                  <td style={{ fontSize: 10, fontFamily: "monospace", color: "var(--muted)" }}>
                    {rec.timestamp}
                  </td>
                  <td>
                    <span className={rec.status === "Retrained" ? "badge-low" : "badge-high"}>
                      {rec.status === "Retrained" ? "In Model (v4.2)" : "Pending Cycle"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
