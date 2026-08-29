"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Eye,
  Layers,
  Sparkles,
  Activity,
  Binary,
  Radio,
  FileCode,
  CheckCircle,
  AlertTriangle,
  Download,
  Copy,
  Zap,
  Cpu,
  RefreshCw,
  Box,
  Compass
} from "lucide-react";
import { MALWARE_SAMPLES } from "@/data/samples";

// Byte Chunk Definition for Spatial Waterfall & Audio Synthesizer
interface ByteChunk {
  offset: number;
  offsetHex: string;
  size: number;
  section: string;
  entropy: number;
  chiSquare: number;
  dominantByte: string;
  byteProfile: "Zero-Padded Cave" | "ASCII Text / Strings" | "Structured x86 Machine Code" | "Encrypted AES Payload" | "UPX Compressed Block";
  color: string;
  histogram: number[]; // 16 sample bins from 0x00 to 0xFF
}

// Generate realistic synthetic chunks for a given sample
function generateChunksForSample(sampleId: string): ByteChunk[] {
  const chunks: ByteChunk[] = [];
  const baseSize = 4096; // 4KB per chunk
  const totalChunks = 32; // 128KB represented

  for (let i = 0; i < totalChunks; i++) {
    const offset = i * baseSize;
    const offsetHex = "0x" + offset.toString(16).padStart(6, "0").toUpperCase();
    
    let section = ".text";
    let entropy = 6.2;
    let byteProfile: ByteChunk["byteProfile"] = "Structured x86 Machine Code";
    let color = "#38bdf8";
    let chiSquare = 120.4;
    let dominantByte = "0x55 (push ebp)";
    
    if (i < 2) {
      // PE / ELF Header
      section = "HEADER";
      entropy = 4.15;
      byteProfile = "ASCII Text / Strings";
      color = "#10b981";
      chiSquare = 840.2;
      dominantByte = "0x00 (Null)";
    } else if (i >= 2 && i < 12) {
      // .text code section
      section = ".text";
      entropy = 6.35 + Math.sin(i) * 0.4;
      byteProfile = "Structured x86 Machine Code";
      color = "#38bdf8";
      chiSquare = 340.5;
      dominantByte = "0x89 (mov)";
    } else if (i >= 12 && i < 16) {
      // Code cave / Zero padding
      section = ".text (Code Cave)";
      entropy = 0.85;
      byteProfile = "Zero-Padded Cave";
      color = "#64748b";
      chiSquare = 2450.0;
      dominantByte = "0x00 (NOP / Zero)";
    } else if (i >= 16 && i < 22) {
      // .rdata / strings
      section = ".rdata";
      entropy = 5.12 + Math.cos(i) * 0.3;
      byteProfile = "ASCII Text / Strings";
      color = "#a855f7";
      chiSquare = 620.0;
      dominantByte = "0x20 (Space)";
    } else if (i >= 22 && i < 30) {
      // .rsrc / Encrypted Payload
      section = sampleId === "SAMPLE-001" ? ".rsrc (WNCRY ZIP)" : sampleId === "SAMPLE-005" ? ".beacon (Encrypted)" : ".payload (Packed)";
      entropy = 7.94 + (Math.random() * 0.05 - 0.02);
      byteProfile = "Encrypted AES Payload";
      color = "#ef4444";
      chiSquare = 18.2; // Very uniform distribution = high encryption
      dominantByte = "0xD4 (Random)";
    } else {
      // Overlay / Padding
      section = "OVERLAY";
      entropy = 1.2;
      byteProfile = "Zero-Padded Cave";
      color = "#64748b";
      chiSquare = 1980.0;
      dominantByte = "0x00 (Null)";
    }

    // Generate 16-bin histogram
    const histogram = Array.from({ length: 16 }, (_, bIdx) => {
      if (byteProfile === "Encrypted AES Payload") {
        return 60 + Math.floor(Math.random() * 20); // Uniform flat distribution
      } else if (byteProfile === "Zero-Padded Cave") {
        return bIdx === 0 ? 95 : Math.floor(Math.random() * 4); // Peak at 0x00
      } else if (byteProfile === "ASCII Text / Strings") {
        return (bIdx >= 2 && bIdx <= 7) ? 80 + Math.floor(Math.random() * 20) : Math.floor(Math.random() * 15);
      } else {
        return 20 + Math.floor(Math.random() * 50); // Structured code
      }
    });

    chunks.push({
      offset,
      offsetHex,
      size: baseSize,
      section,
      entropy: Math.min(8.0, Math.max(0.1, entropy)),
      chiSquare,
      dominantByte,
      byteProfile,
      color,
      histogram
    });
  }

  return chunks;
}

export default function EntropySonificationPage() {
  const [selectedSample, setSelectedSample] = useState(MALWARE_SAMPLES[0]); // WannaCry by default
  const [chunks, setChunks] = useState<ByteChunk[]>(() => generateChunksForSample("SAMPLE-001"));
  const [currentChunkIdx, setCurrentChunkIdx] = useState<number>(24); // Start at encrypted payload chunk
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [basePitch, setBasePitch] = useState<number>(220); // Base Hz
  const [noiseResonance, setNoiseResonance] = useState<number>(0.75);
  const [masterVolume, setMasterVolume] = useState<number>(0.5);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"3D_WATERFALL" | "2D_HEATMAP" | "HISTOGRAM">("3D_WATERFALL");
  const [colorPalette, setColorPalette] = useState<"CYBERPUNK" | "PLASMA" | "MATRIX" | "THERMAL">("CYBERPUNK");
  const [cameraRotation, setCameraRotation] = useState<number>(35); // Degrees
  const [cameraTilt, setCameraTilt] = useState<number>(45); // Degrees

  // Canvas refs
  const waterfallCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioVisualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Web Audio API refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscNodeRef = useRef<OscillatorNode | null>(null);
  const harmonicOscRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize when sample changes
  const handleSampleChange = (sampleId: string) => {
    const s = MALWARE_SAMPLES.find(x => x.id === sampleId) || MALWARE_SAMPLES[0];
    setSelectedSample(s);
    const newChunks = generateChunksForSample(s.id);
    setChunks(newChunks);
    setCurrentChunkIdx(s.entropy > 7.5 ? 24 : 6);
  };

  // Initialize Web Audio Engine
  const initAudio = () => {
    if (audioCtxRef.current) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : masterVolume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Analyser for real-time oscilloscope
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.connect(masterGain);
      analyserRef.current = analyser;

      // Tone Oscillator (Sine / Triangle for fundamental entropy frequency)
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(basePitch, ctx.currentTime);
      osc.start();

      // Harmonic Oscillator (Square / Saw for code structure)
      const harmonicOsc = ctx.createOscillator();
      harmonicOsc.type = "sawtooth";
      harmonicOsc.frequency.setValueAtTime(basePitch * 1.5, ctx.currentTime);
      harmonicOsc.start();

      // Filter Node
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.Q.setValueAtTime(4.0, ctx.currentTime);

      osc.connect(filter);
      harmonicOsc.connect(filter);
      filter.connect(analyser);

      oscNodeRef.current = osc;
      harmonicOscRef.current = harmonicOsc;
      filterNodeRef.current = filter;

      // White Noise Generator for High Entropy (AES / Packed Blocks)
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;
      whiteNoise.start();

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0, ctx.currentTime);

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(2400, ctx.currentTime);
      noiseFilter.Q.setValueAtTime(5.0, ctx.currentTime);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(analyser);

      noiseNodeRef.current = whiteNoise;
      noiseGainRef.current = noiseGain;
    } catch (err) {
      console.warn("Web Audio API not supported or user gesture required", err);
    }
  };

  // Update Synth parameters based on current chunk entropy
  const updateSynthesizerPitch = (chunk: ByteChunk) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const entropy = chunk.entropy; // 0.0 to 8.0
    // Frequency mapping: 0.0 -> 120Hz, 8.0 -> 1200Hz
    const targetFreq = basePitch + (entropy / 8.0) * 800;
    
    if (oscNodeRef.current) {
      oscNodeRef.current.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.05);
    }
    if (harmonicOscRef.current) {
      harmonicOscRef.current.frequency.setTargetAtTime(targetFreq * 1.5, ctx.currentTime, 0.05);
    }

    // Adjust Noise Gain: If entropy > 7.0, ramp up white noise dramatically!
    if (noiseGainRef.current) {
      if (entropy > 7.2) {
        const noiseVol = ((entropy - 7.2) / 0.8) * noiseResonance * 0.6;
        noiseGainRef.current.gain.setTargetAtTime(noiseVol, ctx.currentTime, 0.05);
      } else {
        noiseGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
      }
    }

    // Adjust Filter Cutoff based on byte profile
    if (filterNodeRef.current) {
      if (chunk.byteProfile === "Zero-Padded Cave") {
        filterNodeRef.current.frequency.setTargetAtTime(300, ctx.currentTime, 0.05);
      } else if (chunk.byteProfile === "ASCII Text / Strings") {
        filterNodeRef.current.frequency.setTargetAtTime(800, ctx.currentTime, 0.05);
      } else if (chunk.byteProfile === "Structured x86 Machine Code") {
        filterNodeRef.current.frequency.setTargetAtTime(2000, ctx.currentTime, 0.05);
      } else {
        filterNodeRef.current.frequency.setTargetAtTime(5000, ctx.currentTime, 0.05);
      }
    }
  };

  // Play / Pause loop
  const togglePlay = () => {
    if (!isPlaying) {
      initAudio();
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }
  };

  // Sequential chunk scrubber timer
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentChunkIdx((prev) => (prev + 1) % chunks.length);
      }, 400 / playbackSpeed);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, playbackSpeed, chunks.length]);

  // When currentChunkIdx changes, update the synth sound
  useEffect(() => {
    const chunk = chunks[currentChunkIdx];
    if (chunk) {
      updateSynthesizerPitch(chunk);
    }
  }, [currentChunkIdx, chunks, basePitch, noiseResonance]);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(
        isMuted ? 0 : masterVolume,
        audioCtxRef.current.currentTime,
        0.05
      );
    }
  }, [masterVolume, isMuted]);

  // Draw Live Waveform / Spectrum in Oscilloscope Canvas
  useEffect(() => {
    const canvas = audioVisualizerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const renderScope = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = "#020408";
      ctx.fillRect(0, 0, width, height);

      // Grid Lines
      ctx.strokeStyle = "#141c2e";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (analyserRef.current && isPlaying) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const timeData = new Uint8Array(bufferLength);
        analyserRef.current.getByteTimeDomainData(timeData);

        // Draw Oscilloscope Waveform
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#06b6d4";
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Frequency Bars in background
        const freqData = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(freqData);

        const barWidth = (width / bufferLength) * 2.5;
        let barX = 0;

        for (let i = 0; i < bufferLength / 2; i++) {
          const barHeight = (freqData[i] / 255) * (height / 2);
          ctx.fillStyle = `rgba(168, 85, 247, ${0.15 + (freqData[i] / 255) * 0.4})`;
          ctx.fillRect(barX, height - barHeight, barWidth - 1, barHeight);
          barX += barWidth;
        }
      } else {
        // Idle flat line
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#334155";
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }

      animId = requestAnimationFrame(renderScope);
    };

    renderScope();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  // Draw 3D Spatial Waterfall Map
  useEffect(() => {
    const canvas = waterfallCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = "#020408";
    ctx.fillRect(0, 0, width, height);

    // Perspective / Isometric Projection constants
    const radRot = (cameraRotation * Math.PI) / 180;
    const radTilt = (cameraTilt * Math.PI) / 180;

    const cosRot = Math.cos(radRot);
    const sinRot = Math.sin(radRot);
    const sinTilt = Math.sin(radTilt);

    const originX = width / 2;
    const originY = height / 2 + 60;

    // Draw 3D Waterfall Grid Ribbons
    const totalSlices = chunks.length;
    const sliceWidth = 14;
    const binCount = 16;
    const binStep = 18;

    for (let sliceIdx = totalSlices - 1; sliceIdx >= 0; sliceIdx--) {
      const chunk = chunks[sliceIdx];
      const isSelected = sliceIdx === currentChunkIdx;

      // Calculate 3D projected coordinates for this slice
      const zOffset = (sliceIdx - totalSlices / 2) * sliceWidth;

      for (let binIdx = 0; binIdx < binCount; binIdx++) {
        const xOffset = (binIdx - binCount / 2) * binStep;
        const binVal = chunk.histogram[binIdx]; // 0 to 100
        const barHeight = (binVal / 100) * 80 * (chunk.entropy / 8.0);

        // Project 3D (xOffset, -barHeight, zOffset) to 2D (px, py)
        const rotX = xOffset * cosRot - zOffset * sinRot;
        const rotZ = xOffset * sinRot + zOffset * cosRot;

        const px = originX + rotX;
        const py = originY + rotZ * sinTilt - barHeight;
        const basePy = originY + rotZ * sinTilt;

        // Color based on entropy & palette
        let barColor = "#38bdf8";
        if (colorPalette === "CYBERPUNK") {
          barColor = chunk.entropy > 7.0 ? "#ef4444" : chunk.entropy > 5.0 ? "#06b6d4" : chunk.entropy > 3.0 ? "#a855f7" : "#10b981";
        } else if (colorPalette === "PLASMA") {
          barColor = chunk.entropy > 7.0 ? "#f43f5e" : chunk.entropy > 5.0 ? "#fb923c" : "#eab308";
        } else if (colorPalette === "MATRIX") {
          barColor = chunk.entropy > 7.0 ? "#86efac" : chunk.entropy > 5.0 ? "#22c55e" : "#15803d";
        } else {
          barColor = chunk.entropy > 7.0 ? "#ffffff" : chunk.entropy > 5.0 ? "#f87171" : "#38bdf8";
        }

        // Draw 3D Voxel Pillar
        ctx.fillStyle = isSelected ? "#ffffff" : barColor;
        ctx.globalAlpha = isSelected ? 1.0 : 0.75 + (binVal / 100) * 0.25;
        
        ctx.fillRect(px - 4, py, 8, basePy - py);

        // Top Voxel Face
        ctx.fillStyle = isSelected ? "#22d3ee" : barColor;
        ctx.fillRect(px - 4, py - 2, 8, 3);
      }

      // Highlight active scanning plane
      if (isSelected) {
        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.9;
        
        const p1x = originX + (-binCount / 2 * binStep) * cosRot - zOffset * sinRot;
        const p1y = originY + (-binCount / 2 * binStep) * sinRot * sinTilt + zOffset * cosRot * sinTilt;
        const p2x = originX + (binCount / 2 * binStep) * cosRot - zOffset * sinRot;
        const p2y = originY + (binCount / 2 * binStep) * sinRot * sinTilt + zOffset * cosRot * sinTilt;

        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1.0;
  }, [chunks, currentChunkIdx, cameraRotation, cameraTilt, colorPalette]);

  const activeChunk = chunks[currentChunkIdx] || chunks[0];

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(14,20,34,0.98) 100%)",
          border: "1px solid rgba(168,85,247,0.3)",
          borderRadius: 10,
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                background: "rgba(168,85,247,0.2)",
                color: "#c084fc",
                padding: "2px 8px",
                borderRadius: 4,
                fontFamily: "monospace"
              }}
            >
              STAGE 2.5: 3D SPATIAL DENSITY &amp; SONIFICATION
            </span>
            <span style={{ fontSize: 10, color: "var(--muted)" }}>WEB AUDIO API REAL-TIME SYNTHESIZER</span>
            <span className="badge-critical">SHANNON ENTROPY 0.00 - 8.00</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
            3D Byte-Density Spatial Waterfall &amp; Entropy Sonification Studio
          </h1>
          <p style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 4, maxWidth: 840 }}>
            Visualizes 256-byte frequency distribution across binary offsets in an interactive 3D spatial waterfall. Translates Shannon entropy scores into real-time multi-frequency acoustic soundscapes (low harmonic drone for code $\to$ high-frequency white noise for AES/ChaCha20 encrypted payloads).
          </p>
        </div>

        {/* Sample Synchronizer */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 280 }}>
          <label style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
            Select Target Binary:
          </label>
          <select
            className="tool-select"
            value={selectedSample.id}
            onChange={(e) => handleSampleChange(e.target.value)}
            style={{ width: "100%", background: "var(--surface-2)", borderColor: "rgba(168,85,247,0.4)" }}
          >
            {MALWARE_SAMPLES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (Entropy: {s.entropy.toFixed(2)} - {s.family})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 12
      }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Overall Shannon Entropy</div>
          <div style={{ fontSize: 17, fontWeight: 900, color: selectedSample.entropy > 7.0 ? "#ef4444" : "#10b981", marginTop: 4 }}>
            {selectedSample.entropy.toFixed(2)} <span style={{ fontSize: 12, color: "var(--muted)" }}>/ 8.00</span>
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
            {selectedSample.entropy > 7.5 ? "High-Probability Encryption / Compression" : "Standard Compiled PE / ELF"}
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Scrubbing Offset Chunk</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#38bdf8", marginTop: 4, fontFamily: "monospace" }}>
            {activeChunk.offsetHex}
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
            Section: <strong style={{ color: "#f1f5f9" }}>{activeChunk.section}</strong> ({activeChunk.size} Bytes)
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Acoustic Synthesizer Tone</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#c084fc", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <Volume2 size={16} />
            {(basePitch + (activeChunk.entropy / 8.0) * 800).toFixed(0)} Hz
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
            {activeChunk.entropy > 7.2 ? "Noise & Jitter Resonance Active" : "Polyphonic Fundamental Sine"}
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Packing &amp; Crypto Verdict</div>
          <div style={{ fontSize: 13, fontWeight: 900, color: activeChunk.color, marginTop: 4 }}>
            {activeChunk.byteProfile}
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
            Chi-Square &chi;&sup2;: {activeChunk.chiSquare.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Main Studio View: 3D Spatial Canvas + Audio Oscilloscope Synthesizer */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16 }}>
        {/* 3D Spatial Waterfall Visualizer */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Canvas Toolbar */}
          <div style={{
            padding: "10px 14px",
            background: "var(--surface-2)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Palette:</span>
              <select
                className="tool-select"
                value={colorPalette}
                onChange={(e) => setColorPalette(e.target.value as any)}
                style={{ padding: "4px 8px", fontSize: 11 }}
              >
                <option value="CYBERPUNK">Cyberpunk Cyan</option>
                <option value="PLASMA">Plasma Heatmap</option>
                <option value="MATRIX">Matrix Green</option>
                <option value="THERMAL">Thermal Infrared</option>
              </select>
            </div>

            {/* Camera Rotation & Tilt Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>ROT:</span>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={cameraRotation}
                  onChange={(e) => setCameraRotation(Number(e.target.value))}
                  style={{ width: 70 }}
                />
                <span style={{ fontSize: 10, fontFamily: "monospace", color: "#38bdf8" }}>{cameraRotation}&deg;</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>TILT:</span>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={cameraTilt}
                  onChange={(e) => setCameraTilt(Number(e.target.value))}
                  style={{ width: 70 }}
                />
                <span style={{ fontSize: 10, fontFamily: "monospace", color: "#38bdf8" }}>{cameraTilt}&deg;</span>
              </div>

              <button
                onClick={() => { setCameraRotation(35); setCameraTilt(45); }}
                className="btn-secondary"
                style={{ padding: "3px 8px", fontSize: 10 }}
              >
                <RefreshCw size={11} />
                Reset 3D
              </button>
            </div>
          </div>

          {/* 3D Waterfall Canvas */}
          <div style={{ position: "relative", background: "#020408", height: 420 }}>
            <canvas
              ref={waterfallCanvasRef}
              width={720}
              height={420}
              style={{ width: "100%", height: "100%", display: "block" }}
            />

            {/* In-Canvas Overlay HUD */}
            <div style={{
              position: "absolute",
              bottom: 12,
              left: 12,
              background: "rgba(14,20,34,0.85)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "8px 12px",
              fontFamily: "monospace",
              fontSize: 11,
              display: "flex",
              gap: 16
            }}>
              <div><span style={{ color: "var(--muted)" }}>Axis X:</span> <span style={{ color: "#38bdf8" }}>Byte 0x00 &rarr; 0xFF</span></div>
              <div><span style={{ color: "var(--muted)" }}>Axis Y:</span> <span style={{ color: "#f59e0b" }}>Density Amplitude</span></div>
              <div><span style={{ color: "var(--muted)" }}>Axis Z:</span> <span style={{ color: "#a855f7" }}>File Offsets</span></div>
            </div>
          </div>

          {/* File Offset Scrubber Timeline */}
          <div style={{ padding: "10px 14px", background: "var(--surface-2)", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span style={{ color: "var(--muted)" }}>Offset Scrubber: <strong style={{ color: "#06b6d4" }}>{activeChunk.offsetHex}</strong> ({activeChunk.section})</span>
              <span style={{ color: activeChunk.color, fontWeight: 700 }}>Entropy: {activeChunk.entropy.toFixed(2)} / 8.00</span>
            </div>

            <input
              type="range"
              min="0"
              max={chunks.length - 1}
              value={currentChunkIdx}
              onChange={(e) => setCurrentChunkIdx(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#06b6d4", cursor: "pointer" }}
            />
          </div>
        </div>

        {/* Web Audio API Sound Synthesizer & Oscilloscope */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Audio Synthesizer Control Console */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 6 }}>
                <Volume2 size={15} color="#c084fc" />
                Web Audio Synthesizer Engine
              </span>
              <span style={{ fontSize: 9.5, padding: "2px 6px", borderRadius: 4, background: isPlaying ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)", color: isPlaying ? "#10b981" : "var(--muted)", fontFamily: "monospace" }}>
                {isPlaying ? "SYNTH ACTIVE" : "PAUSED"}
              </span>
            </div>

            {/* Real-Time Audio Oscilloscope Canvas */}
            <div style={{ background: "#020408", border: "1px solid var(--border)", borderRadius: 6, height: 110, overflow: "hidden" }}>
              <canvas
                ref={audioVisualizerCanvasRef}
                width={350}
                height={110}
                style={{ width: "100%", height: "100%", display: "block" }}
              />
            </div>

            {/* Master Transport Controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button
                onClick={togglePlay}
                className="btn-primary"
                style={{ padding: "8px 18px", fontSize: 12, background: isPlaying ? "#ef4444" : "#06b6d4", color: "#04060a" }}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                {isPlaying ? "Pause Audio" : "Play Sonification"}
              </button>

              <button
                onClick={() => setCurrentChunkIdx(0)}
                className="btn-secondary"
                style={{ padding: "8px 12px" }}
                title="Restart from file start"
              >
                <RotateCcw size={13} />
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="btn-secondary"
                style={{ padding: "8px 12px", color: isMuted ? "#ef4444" : "var(--fg)" }}
              >
                {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              </button>
            </div>

            {/* Synthesizer Modulation Sliders */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "var(--surface-2)", padding: "10px", borderRadius: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>Base Pitch (Hz):</span>
                <input
                  type="range"
                  min="100"
                  max="440"
                  value={basePitch}
                  onChange={(e) => setBasePitch(Number(e.target.value))}
                  style={{ width: 140 }}
                />
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "#38bdf8", minWidth: 40, textAlign: "right" }}>
                  {basePitch}Hz
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>Noise Resonance:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={noiseResonance}
                  onChange={(e) => setNoiseResonance(Number(e.target.value))}
                  style={{ width: 140 }}
                />
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "#ef4444", minWidth: 40, textAlign: "right" }}>
                  {(noiseResonance * 100).toFixed(0)}%
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>Scan Tempo:</span>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0.5, 1, 2, 4].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      style={{
                        fontSize: 10,
                        padding: "2px 6px",
                        borderRadius: 3,
                        background: playbackSpeed === speed ? "rgba(6,182,212,0.25)" : "var(--surface)",
                        color: playbackSpeed === speed ? "#06b6d4" : "var(--muted)",
                        border: "1px solid var(--border)",
                        cursor: "pointer"
                      }}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>Master Volume:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={masterVolume}
                  onChange={(e) => setMasterVolume(Number(e.target.value))}
                  style={{ width: 140 }}
                />
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "#10b981", minWidth: 40, textAlign: "right" }}>
                  {(masterVolume * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Current Chunk Detailed Profiler */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#f1f5f9", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <Sparkles size={14} color="#06b6d4" />
              Chunk Inspector: <span style={{ fontFamily: "monospace", color: "#06b6d4" }}>{activeChunk.offsetHex}</span>
            </div>

            <div style={{
              background: "#020408",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "10px",
              fontFamily: "monospace",
              fontSize: 11,
              display: "flex",
              flexDirection: "column",
              gap: 5
            }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Section:</span>
                <span style={{ color: "#f1f5f9" }}>{activeChunk.section}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Shannon Entropy:</span>
                <span style={{ color: activeChunk.color, fontWeight: 700 }}>{activeChunk.entropy.toFixed(3)} bits/byte</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Chi-Square (&chi;&sup2;):</span>
                <span style={{ color: "#f59e0b" }}>{activeChunk.chiSquare.toFixed(1)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Dominant Byte:</span>
                <span style={{ color: "#38bdf8" }}>{activeChunk.dominantByte}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Acoustic Signature:</span>
                <span style={{ color: "#c084fc" }}>
                  {activeChunk.entropy > 7.2 ? "High White Noise (AES)" : activeChunk.entropy > 5.0 ? "Harmonic Buzz (x86 Code)" : "Low Sine Drone (Padding)"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Entropy Breakdown & Jump Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <Layers size={15} color="#06b6d4" />
          Binary Sections &amp; Acoustic Profile Index
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="cerberus-table">
            <thead>
              <tr>
                <th>Offset Range</th>
                <th>Section Tag</th>
                <th>Entropy Score</th>
                <th>Byte Profile</th>
                <th>Sound Frequency</th>
                <th>Acoustic Character</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { offset: "0x000000 - 0x000800", name: "DOS / NT HEADER", entropy: 4.15, profile: "ASCII Text / Strings", hz: "320 Hz", character: "Mellow chime with low harmonics", idx: 0 },
                { offset: "0x000800 - 0x00C000", name: ".text", entropy: 6.42, profile: "Structured x86 Machine Code", hz: "680 Hz", character: "Resonant square wave (x86 instructions)", idx: 6 },
                { offset: "0x00C000 - 0x010000", name: ".text (Code Cave)", entropy: 0.85, profile: "Zero-Padded Cave", hz: "180 Hz", character: "Low sub-bass drone (0x00 NULL runs)", idx: 14 },
                { offset: "0x010000 - 0x018000", name: ".rdata", entropy: 5.12, profile: "ASCII Text / Strings", hz: "440 Hz", character: "Harmonic string chime", idx: 18 },
                { offset: "0x018000 - 0x028000", name: selectedSample.id === "SAMPLE-001" ? ".rsrc (Encrypted ZIP)" : ".beacon (Encrypted)", entropy: 7.98, profile: "Encrypted AES Payload", hz: "1,180 Hz + Noise", character: "Harsh white noise + high frequency static", idx: 24 }
              ].map((row, rIdx) => (
                <tr key={rIdx}>
                  <td style={{ fontFamily: "monospace", color: "#38bdf8", fontWeight: 700 }}>{row.offset}</td>
                  <td style={{ fontWeight: 800, color: "#f1f5f9" }}>{row.name}</td>
                  <td>
                    <span style={{
                      fontWeight: 800,
                      color: row.entropy > 7.0 ? "#ef4444" : row.entropy > 5.0 ? "#06b6d4" : "#10b981",
                      background: row.entropy > 7.0 ? "rgba(239,68,68,0.15)" : "rgba(6,182,212,0.15)",
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontFamily: "monospace"
                    }}>
                      {row.entropy.toFixed(2)}
                    </span>
                  </td>
                  <td style={{ color: "var(--fg-2)" }}>{row.profile}</td>
                  <td style={{ fontFamily: "monospace", color: "#c084fc" }}>{row.hz}</td>
                  <td style={{ fontSize: 11, color: "var(--muted)" }}>{row.character}</td>
                  <td>
                    <button
                      onClick={() => {
                        setCurrentChunkIdx(row.idx);
                        if (!isPlaying) togglePlay();
                      }}
                      style={{
                        fontSize: 10.5,
                        padding: "3px 10px",
                        borderRadius: 4,
                        background: "rgba(6,182,212,0.2)",
                        color: "#06b6d4",
                        border: "1px solid rgba(6,182,212,0.4)",
                        cursor: "pointer",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      <Play size={10} />
                      Jump &amp; Play
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
