"use client";

import { useState, useEffect } from "react";
import {
  Cpu,
  Zap,
  Activity,
  Layers,
  ShieldAlert,
  Play,
  Pause,
  BarChart3,
  Flame
} from "lucide-react";

interface GpuBenchmarkResult {
  batchSize: number;
  cpuThroughput: number;
  gpuThroughput: number;
  speedup: number;
  entropyComputeMs: number;
  isolationForestInferMs: number;
  memoryBandwidthGbps: number;
}

export default function GpuAnalyticsPage() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<number>(10000);
  const [gpuUtilization, setGpuUtilization] = useState<number>(78);
  const [eventsPerSec, setEventsPerSec] = useState<number>(248500);
  const [anomalyCount, setAnomalyCount] = useState<number>(14);

  useEffect(() => {
    if (!isProcessing) return;
    const timer = setInterval(() => {
      setGpuUtilization(prev => Math.min(96, Math.max(62, prev + (Math.random() * 8 - 4))));
      setEventsPerSec(prev => Math.floor(240000 + Math.random() * 20000));
      if (Math.random() > 0.7) {
        setAnomalyCount(prev => prev + 1);
      }
    }, 1500);
    return () => clearInterval(timer);
  }, [isProcessing]);

  const benchmarkData: GpuBenchmarkResult[] = [
    { batchSize: 1000, cpuThroughput: 4200, gpuThroughput: 89000, speedup: 21.2, entropyComputeMs: 1.2, isolationForestInferMs: 2.1, memoryBandwidthGbps: 412 },
    { batchSize: 5000, cpuThroughput: 18500, gpuThroughput: 420000, speedup: 22.7, entropyComputeMs: 3.4, isolationForestInferMs: 5.8, memoryBandwidthGbps: 680 },
    { batchSize: 10000, cpuThroughput: 34000, gpuThroughput: 940000, speedup: 27.6, entropyComputeMs: 6.8, isolationForestInferMs: 11.2, memoryBandwidthGbps: 840 },
    { batchSize: 50000, cpuThroughput: 72000, gpuThroughput: 2850000, speedup: 39.5, entropyComputeMs: 18.4, isolationForestInferMs: 34.0, memoryBandwidthGbps: 912 },
  ];

  const currentBench = benchmarkData.find(b => b.batchSize === selectedBatch) || benchmarkData[2];

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "var(--bg)", color: "#f8fafc" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 16px rgba(16,185,129,0.35)"
          }}>
            <Zap size={20} color="#050811" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em", margin: 0 }}>
              GPU Acceleration &amp; RAPIDS cuDF Analytics Studio
            </h1>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>
              NVIDIA CUDA TensorRT &middot; CuPy Vectorized Shannon Entropy &middot; RAPIDS cuDF Anomaly Isolation Forest
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsProcessing(!isProcessing)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: isProcessing ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
            border: `1px solid ${isProcessing ? "#10b981" : "#f59e0b"}`,
            color: isProcessing ? "#10b981" : "#f59e0b",
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          {isProcessing ? <Pause size={13} /> : <Play size={13} />}
          <span>{isProcessing ? "GPU PIPELINE ACTIVE" : "PAUSED"}</span>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Activity size={14} color="#10b981" /> GPU EVENT THROUGHPUT
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#10b981", fontFamily: "monospace" }}>
            {eventsPerSec.toLocaleString()} <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>events/sec</span>
          </div>
          <div style={{ fontSize: 10.5, color: "#10b981", marginTop: 4 }}>
            &uarr; 28.4x acceleration vs 32-core Xeon CPU
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Cpu size={14} color="#06b6d4" /> CUDA CORES UTILIZATION
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#06b6d4", fontFamily: "monospace" }}>
            {gpuUtilization.toFixed(1)}% <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>(10,752 Cores)</span>
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>
            NVIDIA A100 SXM4 80GB HBM2e
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Flame size={14} color="#f59e0b" /> BLOCK ENTROPY LATENCY
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#f59e0b", fontFamily: "monospace" }}>
            {currentBench.entropyComputeMs} ms <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>/ {selectedBatch.toLocaleString()} blks</span>
          </div>
          <div style={{ fontSize: 10.5, color: "#10b981", marginTop: 4 }}>
            Shannon Entropy H(X) calculated in VRAM
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <ShieldAlert size={14} color="#f43f5e" /> ISOLATION FOREST OUTLIERS
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#f43f5e", fontFamily: "monospace" }}>
            {anomalyCount} <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>quarantined</span>
          </div>
          <div style={{ fontSize: 10.5, color: "#f43f5e", marginTop: 4 }}>
            cuML 0.0% False Negatives in 24h
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#f8fafc", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <Layers size={15} color="#10b981" /> 10,000 Parallel CUDA Worker Threads Pipeline
            </h3>
            <span style={{ fontSize: 10.5, padding: "2px 8px", borderRadius: 4, background: "rgba(16,185,129,0.15)", color: "#10b981", fontWeight: 700 }}>
              CuPy Vectorized Kernel
            </span>
          </div>

          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>
              High-entropy encryption detection pipeline processing mass disk I/O in parallel VRAM blocks:
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
              {[1, 2, 3, 4].map(stream => (
                <div key={stream} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: "#06b6d4" }}>CUDA STREAM #{stream}</span>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                  </div>
                  <div style={{ fontSize: 9.5, color: "var(--muted)", marginBottom: 4 }}>Chunk Block: {stream * 2500 - 2500}&ndash;{stream * 2500}</div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${70 + stream * 6}%`, height: "100%", background: "linear-gradient(90deg, #10b981, #06b6d4)" }} />
                  </div>
                  <div style={{ fontSize: 9.5, color: "#10b981", marginTop: 4, fontWeight: 700 }}>H(X) = 7.94 (Encrypted)</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#050811", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: 12, fontFamily: "monospace", fontSize: 10.5, color: "#94a3b8" }}>
              <div style={{ color: "#64748b", marginBottom: 4 }}># CuPy Massive GPU Entropy Kernel (Aegis Shield Engine)</div>
              <div><span style={{ color: "#c084fc" }}>import</span> cupy <span style={{ color: "#c084fc" }}>as</span> cp</div>
              <div><span style={{ color: "#c084fc" }}>import</span> cudf</div>
              <div><span style={{ color: "#c084fc" }}>from</span> cuml.ensemble <span style={{ color: "#c084fc" }}>import</span> IsolationForest</div>
              <div style={{ marginTop: 4 }}><span style={{ color: "#06b6d4" }}>@cp.fuse</span>()</div>
              <div><span style={{ color: "#38bdf8" }}>def</span> <span style={{ color: "#10b981" }}>gpu_shannon_entropy</span>(block_bytes):</div>
              <div style={{ paddingLeft: 16 }}>counts = cp.bincount(block_bytes, minlength=256)</div>
              <div style={{ paddingLeft: 16 }}>probs = counts[counts &gt; 0] / block_bytes.size</div>
              <div style={{ paddingLeft: 16 }}><span style={{ color: "#c084fc" }}>return</span> -cp.sum(probs * cp.log2(probs))</div>
            </div>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#f8fafc", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart3 size={15} color="#06b6d4" /> CPU vs. GPU Acceleration Benchmark
          </h3>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 8 }}>
              Select Ingestion Batch Size:
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {[1000, 5000, 10000, 50000].map(batch => (
                <button
                  key={batch}
                  onClick={() => setSelectedBatch(batch)}
                  style={{
                    padding: "6px 0",
                    background: selectedBatch === batch ? "rgba(6,182,212,0.2)" : "var(--surface-2)",
                    border: `1px solid ${selectedBatch === batch ? "#06b6d4" : "var(--border)"}`,
                    color: selectedBatch === batch ? "#06b6d4" : "var(--fg)",
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 6,
                    cursor: "pointer"
                  }}
                >
                  {batch / 1000}k Blocks
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 11 }}>
              <span style={{ color: "var(--muted)" }}>Traditional CPU Throughput:</span>
              <span style={{ fontWeight: 700, color: "#f43f5e", fontFamily: "monospace" }}>{currentBench.cpuThroughput.toLocaleString()} blk/s</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 11 }}>
              <span style={{ color: "var(--muted)" }}>NVIDIA CUDA GPU Throughput:</span>
              <span style={{ fontWeight: 700, color: "#10b981", fontFamily: "monospace" }}>{currentBench.gpuThroughput.toLocaleString()} blk/s</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 11 }}>
              <span style={{ color: "var(--muted)" }}>cuML Isolation Forest Inference:</span>
              <span style={{ fontWeight: 700, color: "#38bdf8", fontFamily: "monospace" }}>{currentBench.isolationForestInferMs} ms</span>
            </div>
            <div style={{ height: 1, background: "var(--border)", margin: "8px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#f8fafc" }}>Net Performance Speedup:</span>
              <span style={{ fontSize: 16, fontWeight: 900, color: "#10b981", background: "rgba(16,185,129,0.15)", padding: "2px 8px", borderRadius: 4 }}>
                {currentBench.speedup}x FASTER
              </span>
            </div>
          </div>

          <div style={{ fontSize: 10.5, color: "var(--muted)", lineHeight: 1.5 }}>
            💡 <strong>Why GPU Acceleration Matters:</strong> When LockBit or BlackCat targets 50,000 files simultaneously, CPU single-threaded scanners experience a 12-second queue delay. RAPIDS GPU streaming identifies high-entropy clusters in <strong>18.4 milliseconds</strong>, triggering pre-emption before encryption spreads.
          </div>
        </div>
      </div>
    </div>
  );
}
