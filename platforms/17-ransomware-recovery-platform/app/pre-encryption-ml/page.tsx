"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Activity,
  Cpu,
  Layers,
  Terminal,
  Binary,
  TrendingUp,
  Search,
  Lock,
  Unlock,
  Check,
  X,
  RefreshCw,
  Power
} from "lucide-react";
import {
  MLProgressionSample,
  MLModelMetric
} from "@/types/recovery";

const MOCK_MODEL_METRIC: MLModelMetric = {
  precisionPct: 99.4,
  recallPct: 98.9,
  f1Score: 0.991,
  aucRoc: 0.998,
  falsePositiveRatePct: 0.06,
  inferenceLatencyMs: 4.8,
  trainingSamplesCount: 2450000
};

const SAMPLE_MALICIOUS: MLProgressionSample = {
  id: "ml-sample-malicious",
  processName: "vss_purge_stager.exe -> cmd.exe /c vssadmin.exe delete shadows /all /quiet",
  processId: 6412,
  parentProcess: "powershell.exe (PID 3190)",
  userAccount: "NT AUTHORITY\\SYSTEM",
  hostName: "FIN-WS-09.mercy.local",
  timestamp: "2026-08-24T00:28:10Z",
  classification: "MALICIOUS_STAGER",
  overallConfidencePct: 99.4,
  currentProgressionPhase: "PRE_ENCRYPTION_BURST",
  progressionScore: 94,
  featureAttributions: [
    { featureName: "Shadow Copy Purge (vssadmin / bcdedit)", weightPct: 34, value: "delete shadows /all /quiet & bcdedit /set {default} bootstatuspolicy ignoreallfailures", description: "Extreme correlation with ransomware pre-destruction", isAnomalous: true },
    { featureName: "EDR Service Stop & Driver Tamper", weightPct: 26, value: "sc stop WinDefend / fltmc unload sysmon", description: "Direct attempt to disarm endpoint monitoring hooks", isAnomalous: true },
    { featureName: "Rapid File Handle Enumeration", weightPct: 18, value: "12,480 file handles/sec across 14 network shares", description: "Mass enumeration of target document and database extensions", isAnomalous: true },
    { featureName: "Privilege Escalation KL-Divergence", weightPct: 14, value: "KL score 8.74 (Standard User -> SYSTEM in 4.2s)", description: "Abnormal privilege transition entropy compared to baseline", isAnomalous: true },
    { featureName: "Canary Honeypot File Touch", weightPct: 8, value: "Modified C:\\canary\\$vault_passwords.xlsx", description: "Tripwire decoy access detected", isAnomalous: true }
  ],
  commandLine: "cmd.exe /c vssadmin delete shadows /all /quiet & bcdedit /set {default} recoveryenabled No & wbadmin delete catalog -quiet",
  fileOperationsPerSec: 1420,
  entropyJump: 4.2,
  vssDeleteAttempted: true,
  edrTamperingDetected: true
};

const SAMPLE_BENIGN: MLProgressionSample = {
  id: "ml-sample-benign",
  processName: "SCCM_Weekly_Patch_Job.ps1",
  processId: 8120,
  parentProcess: "CcmExec.exe (PID 1424)",
  userAccount: "mercy\\svc_sccm_deploy",
  hostName: "APP-SRV-02.mercy.local",
  timestamp: "2026-08-24T00:25:00Z",
  classification: "BENIGN_SYSADMIN",
  overallConfidencePct: 98.7,
  currentProgressionPhase: "RECON",
  progressionScore: 8,
  featureAttributions: [
    { featureName: "Known Code Signing Certificate", weightPct: 40, value: "Valid Microsoft Enterprise PKI Signature", description: "Binary signed by trusted internal certificate authority", isAnomalous: false },
    { featureName: "Process Parentage Lineage", weightPct: 30, value: "Spawned by CcmExec.exe service", description: "Expected orchestration lineage for patch management", isAnomalous: false },
    { featureName: "Shadow Copy Purge", weightPct: 15, value: "None (0 VSS calls)", description: "Zero destructive storage commands executed", isAnomalous: false },
    { featureName: "File Renaming / Entropy Rate", weightPct: 15, value: "0.02 entropy delta (normal PE writing)", description: "Standard update file writes with valid headers", isAnomalous: false }
  ],
  commandLine: "powershell.exe -ExecutionPolicy Bypass -NoProfile -File C:\\Windows\\CCM\\ScriptStore\\Install-SecurityRollup-KB88921.ps1",
  fileOperationsPerSec: 32,
  entropyJump: 0.1,
  vssDeleteAttempted: false,
  edrTamperingDetected: false
};

export default function PreEncryptionMLPage() {
  const [selectedSample, setSelectedSample] = useState<MLProgressionSample>(SAMPLE_MALICIOUS);
  const [isQuarantining, setIsQuarantining] = useState(false);
  const [quarantined, setQuarantined] = useState(false);
  const [simulatingLiveML, setSimulatingLiveML] = useState(false);
  const [liveConfidenceScore, setLiveConfidenceScore] = useState(selectedSample.overallConfidencePct);

  const switchSample = (sample: MLProgressionSample) => {
    setSelectedSample(sample);
    setLiveConfidenceScore(sample.overallConfidencePct);
    setQuarantined(false);
  };

  const handleQuarantine = () => {
    setIsQuarantining(true);
    setTimeout(() => {
      setIsQuarantining(false);
      setQuarantined(true);
    }, 800);
  };

  const runLiveInferenceStream = () => {
    setSimulatingLiveML(true);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (selectedSample.classification === "MALICIOUS_STAGER") {
        setLiveConfidenceScore((prev) => Math.min(99.9, prev + 0.1));
      } else {
        setLiveConfidenceScore((prev) => Math.max(98.0, prev - 0.1));
      }

      if (step > 6) {
        clearInterval(interval);
        setSimulatingLiveML(false);
      }
    }, 200);
  };

  const isMalicious = selectedSample.classification === "MALICIOUS_STAGER";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1440, margin: "0 auto" }}>
      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(244,63,94,0.05) 50%, rgba(14,21,38,0.9) 100%)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "rgba(168,85,247,0.15)",
            border: "1px solid rgba(168,85,247,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Sparkles size={24} color="var(--purple)" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--fg)", letterSpacing: "-0.02em" }}>
                Pre-Encryption ML Progression Predictor
              </h1>
              <span className="badge-sev badge-critical" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <ShieldAlert size={11} /> STAGE 3: CONTAIN
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
              Machine learning classification model: Distinguishes normal IT admin batch scripts from malicious pre-encryption staging activity with 99.4% precision.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", background: "var(--surface-2)", padding: 3, borderRadius: 6, border: "1px solid var(--border)" }}>
            <button
              onClick={() => switchSample(SAMPLE_MALICIOUS)}
              style={{
                padding: "6px 12px",
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                background: selectedSample.id === SAMPLE_MALICIOUS.id ? "var(--rose)" : "transparent",
                color: selectedSample.id === SAMPLE_MALICIOUS.id ? "#fff" : "var(--muted)"
              }}
            >
              ⚠️ Ransomware Pre-Encryption Stager
            </button>
            <button
              onClick={() => switchSample(SAMPLE_BENIGN)}
              style={{
                padding: "6px 12px",
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                background: selectedSample.id === SAMPLE_BENIGN.id ? "var(--primary)" : "transparent",
                color: selectedSample.id === SAMPLE_BENIGN.id ? "#04100c" : "var(--muted)"
              }}
            >
              ✓ Benign Sysadmin Patch Job (SCCM)
            </button>
          </div>

          <button
            className="btn-primary"
            onClick={runLiveInferenceStream}
            disabled={simulatingLiveML}
            style={{ fontSize: 12 }}
          >
            <Play size={13} className={simulatingLiveML ? "animate-spin" : ""} />
            {simulatingLiveML ? "Streaming Inference..." : "Live ML Inference"}
          </button>
        </div>
      </div>

      {/* Model Benchmark Accuracy Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Model Precision</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--primary)", marginTop: 4 }}>
            {MOCK_MODEL_METRIC.precisionPct}%
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>Tested on 2.45M samples</div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Recall Rate</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--cyan)", marginTop: 4 }}>
            {MOCK_MODEL_METRIC.recallPct}%
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>Zero undetected encrypters</div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>AUC-ROC Score</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--purple)", marginTop: 4 }}>
            {MOCK_MODEL_METRIC.aucRoc}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>Near-perfect discrimination</div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>False Positive Rate</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--primary)", marginTop: 4 }}>
            {MOCK_MODEL_METRIC.falsePositiveRatePct}%
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>0.06% on admin batch jobs</div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Inference Latency</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--cyan)", marginTop: 4 }}>
            {MOCK_MODEL_METRIC.inferenceLatencyMs} ms
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>Sub-5ms kernel driver hook</div>
        </div>
      </div>

      {/* Active Process Telemetry & Classification Verdict */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18 }}>
        {/* Process Inspection & Command-Line Analysis */}
        <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Cpu size={16} color={isMalicious ? "var(--rose)" : "var(--primary)"} />
              <span style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>
                Active Telemetry & Process Tree Inspector
              </span>
            </div>
            <span className={`badge-sev ${isMalicious ? "badge-critical" : "badge-success"}`}>
              {selectedSample.classification} ({liveConfidenceScore.toFixed(1)}%)
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
            <div>
              <span style={{ color: "var(--muted)", fontSize: 11 }}>Process Command Line:</span>
              <div style={{
                marginTop: 4,
                padding: "8px 12px",
                background: "#040811",
                border: "1px solid var(--border)",
                borderRadius: 6,
                fontFamily: "monospace",
                color: isMalicious ? "#fca5a5" : "#6ee7b7",
                wordBreak: "break-all"
              }}>
                {selectedSample.commandLine}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
              <div>
                <span style={{ color: "var(--muted)", fontSize: 11 }}>PID:</span>
                <div style={{ fontWeight: 700, color: "var(--cyan)", fontFamily: "monospace" }}>{selectedSample.processId}</div>
              </div>
              <div>
                <span style={{ color: "var(--muted)", fontSize: 11 }}>Parent Process:</span>
                <div style={{ color: "var(--fg-2)" }}>{selectedSample.parentProcess}</div>
              </div>
              <div>
                <span style={{ color: "var(--muted)", fontSize: 11 }}>Security Principal:</span>
                <div style={{ color: "var(--fg-2)" }}>{selectedSample.userAccount}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
              <div>
                <span style={{ color: "var(--muted)", fontSize: 11 }}>File Ops/Sec:</span>
                <div style={{ fontWeight: 800, color: isMalicious ? "var(--rose)" : "var(--primary)" }}>
                  {selectedSample.fileOperationsPerSec} ops/s
                </div>
              </div>
              <div>
                <span style={{ color: "var(--muted)", fontSize: 11 }}>Shannon Entropy Delta:</span>
                <div style={{ fontWeight: 800, color: isMalicious ? "var(--rose)" : "var(--primary)" }}>
                  +{selectedSample.entropyJump} Δ
                </div>
              </div>
              <div>
                <span style={{ color: "var(--muted)", fontSize: 11 }}>VSS Purge Attempt:</span>
                <div style={{ fontWeight: 800, color: selectedSample.vssDeleteAttempted ? "var(--rose)" : "var(--primary)" }}>
                  {selectedSample.vssDeleteAttempted ? "YES (BLOCKED)" : "NONE"}
                </div>
              </div>
            </div>

            {/* Stage Progression Status Bar */}
            <div style={{ marginTop: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: "var(--muted)" }}>Progression Phase: <strong>{selectedSample.currentProgressionPhase}</strong></span>
                <span style={{ color: isMalicious ? "var(--rose)" : "var(--primary)", fontWeight: 700 }}>
                  Confidence Score: {selectedSample.progressionScore}/100
                </span>
              </div>
              <div style={{ height: 8, background: "var(--surface-3)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${selectedSample.progressionScore}%`,
                  background: isMalicious ? "linear-gradient(90deg, #f59e0b, #f43f5e)" : "var(--primary)",
                  transition: "width 0.3s ease"
                }} />
              </div>
            </div>

            {/* Action Bar */}
            {isMalicious && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span style={{ fontSize: 11, color: "var(--rose)" }}>
                  ⚠️ Model recommends immediate process termination and host microsegmentation.
                </span>
                <button
                  onClick={handleQuarantine}
                  disabled={isQuarantining || quarantined}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: "pointer",
                    border: "none",
                    background: quarantined ? "var(--primary)" : "var(--rose)",
                    color: quarantined ? "#04100c" : "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  {isQuarantining ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" /> Freezing PID...
                    </>
                  ) : quarantined ? (
                    <>
                      <CheckCircle2 size={13} /> PID Terminated & Host Quarantined
                    </>
                  ) : (
                    <>
                      <Power size={13} /> 1-Click Terminate & Isolate Host
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Feature Attribution Weights (SHAP Waterfall) */}
        <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Layers size={16} color="var(--purple)" />
              <span style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)" }}>
                SHAP Feature Attribution Weights
              </span>
            </div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>Model Feature Contributions</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {selectedSample.featureAttributions.map((feat, idx) => (
              <div
                key={idx}
                style={{
                  padding: "10px 12px",
                  borderRadius: 6,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                  <span style={{ fontWeight: 700, color: feat.isAnomalous ? "var(--rose)" : "var(--primary)" }}>
                    {feat.featureName}
                  </span>
                  <span style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: feat.isAnomalous ? "var(--rose)" : "var(--primary)",
                    fontFamily: "monospace"
                  }}>
                    {feat.isAnomalous ? `+${feat.weightPct}% Impact` : `-${feat.weightPct}% Benign`}
                  </span>
                </div>

                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  Value: <span style={{ color: "var(--fg-2)", fontFamily: "monospace" }}>{feat.value}</span>
                </div>

                {/* Contribution Bar */}
                <div style={{ height: 4, background: "var(--surface-3)", borderRadius: 2, overflow: "hidden", marginTop: 2 }}>
                  <div style={{
                    height: "100%",
                    width: `${feat.weightPct * 2.5}%`,
                    background: feat.isAnomalous ? "var(--rose)" : "var(--primary)"
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
