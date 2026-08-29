'use client';

import React, { useState } from 'react';
import { 
  TVStationScorecard, 
  SpinComparisonCase 
} from '@/lib/veritaslens/types';
import { 
  calculateTVStationScore 
} from '@/lib/veritaslens/pipeline-engine';
import { 
  Tv, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Scale, 
  Layers, 
  Flame, 
  FileText, 
  Undo2,
  HelpCircle,
  TrendingDown
} from 'lucide-react';

interface TVScorecardStudioProps {
  scorecards: TVStationScorecard[];
  spinCases: SpinComparisonCase[];
}

export const TVScorecardStudio: React.FC<TVScorecardStudioProps> = ({
  scorecards,
  spinCases
}) => {
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>('sc-pbs');
  const [activeScorecard, setActiveScorecard] = useState<TVStationScorecard>(() => scorecards[0]);

  // Interactive deduction states
  const [omissionsCount, setOmissionsCount] = useState<number>(0);
  const [opinionPercentage, setOpinionPercentage] = useState<number>(14);
  const [persistentSpin, setPersistentSpin] = useState<boolean>(false);
  const [unretractedErrors, setUnretractedErrors] = useState<number>(0);

  // Spin Deconstruction active case
  const [selectedSpinCase, setSelectedSpinCase] = useState<SpinComparisonCase>(spinCases[0]);
  const [isStrippedOfSpin, setIsStrippedOfSpin] = useState<boolean>(false);

  // Load a preset network into interactive calculator
  const handleLoadNetwork = (sc: TVStationScorecard) => {
    setSelectedNetworkId(sc.id);
    setActiveScorecard(sc);
    setOmissionsCount(sc.deductions.storyOmissions.count);
    setOpinionPercentage(sc.deductions.factToOpinionRatio.opinionPercentage);
    setPersistentSpin(sc.deductions.linguisticLoad.persistentSpinDetected);
    setUnretractedErrors(sc.deductions.correctionTransparency.unretractedErrors);
  };

  // Recalculate dynamic grade
  const omissionsDeduction = omissionsCount * 5;
  const opinionDeduction = opinionPercentage > 40 ? 10 : 0;
  const spinDeduction = persistentSpin ? 10 : 0;
  const correctionDeduction = unretractedErrors * 25;
  const totalDeductions = omissionsDeduction + opinionDeduction + spinDeduction + correctionDeduction;
  const calculatedScore = Math.max(0, 100 - totalDeductions);

  let calculatedGrade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (calculatedScore >= 90) calculatedGrade = 'A';
  else if (calculatedScore >= 80) calculatedGrade = 'B';
  else if (calculatedScore >= 70) calculatedGrade = 'C';
  else if (calculatedScore >= 60) calculatedGrade = 'D';

  return (
    <div className="space-y-6">
      {/* 7-Day TV Station Scorecard Studio */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Tv className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">
                Your Personal 7-Day TV Station Credibility Scorecard
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Rate any television news broadcast (CNN, Fox News, MSNBC, PBS) with absolute confidence using a quantitative deduction model starting at Base 100.
            </p>
          </div>

          {/* Network Preset Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-mono">Load Network Benchmark:</span>
            <div className="flex flex-wrap gap-1.5">
              {scorecards.map(sc => (
                <button
                  key={sc.id}
                  onClick={() => handleLoadNetwork(sc)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition cursor-pointer ${
                    selectedNetworkId === sc.id
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {sc.networkName.split(' ')[0]} ({sc.grade})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scorecard Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Deductions Form */}
          <div className="lg:col-span-8 space-y-4">
            {/* Metric 1: Story Omissions */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-mono font-bold text-slate-300">
                    1. Story Omissions (Blindspots)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Deduct 5 points for every trending Ground News blindspot the network completely ignores on-air.
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-rose-400">
                    -{omissionsDeduction} pts
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={omissionsCount}
                  onChange={e => setOmissionsCount(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="font-mono text-xs font-bold text-white w-16 text-right">
                  {omissionsCount} Omitted
                </span>
              </div>
            </div>

            {/* Metric 2: Fact-to-Opinion Ratio */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-mono font-bold text-slate-300">
                    2. Fact-to-Opinion Ratio
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Deduct 10 points if guest panels, monologues, and commentary exceed 40% of the broadcast hour.
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-rose-400">
                    -{opinionDeduction} pts
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opinionPercentage}
                  onChange={e => setOpinionPercentage(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="font-mono text-xs font-bold text-white w-16 text-right">
                  {opinionPercentage}% Opinion
                </span>
              </div>
            </div>

            {/* Metric 3: Linguistic Load / Spin Words */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-mono font-bold text-slate-300">
                    3. Linguistic Load (Emotional Spin Words)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Deduct 10 points for persistent on-screen banner priming (e.g. "scheme", "dodge", "scathing", "assault").
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-rose-400">
                    -{spinDeduction} pts
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer font-mono">
                  <input
                    type="checkbox"
                    checked={persistentSpin}
                    onChange={e => setPersistentSpin(e.target.checked)}
                    className="rounded accent-amber-500 w-4 h-4"
                  />
                  <span>Persistent Emotive Spin Detected in Straight-News Banners (-10 pts)</span>
                </label>
              </div>
            </div>

            {/* Metric 4: Correction Transparency */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-mono font-bold text-slate-300">
                    4. Correction & Retraction Transparency
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Deduct 25 points if a major verified error is ignored, quietly deleted online, or uncorrected on-air.
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-rose-400">
                    -{correctionDeduction} pts
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min="0"
                  max="3"
                  value={unretractedErrors}
                  onChange={e => setUnretractedErrors(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="font-mono text-xs font-bold text-white w-16 text-right">
                  {unretractedErrors} Uncorrected
                </span>
              </div>
            </div>
          </div>

          {/* Final Score Card Summary */}
          <div className="lg:col-span-4 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-mono uppercase font-bold text-slate-400">Calculated Credibility</span>
                <span className="text-[10px] font-mono text-slate-500">Base 100 Model</span>
              </div>

              <div className="text-center py-4 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400 font-mono uppercase">Final Credibility Score</div>
                <div className="text-5xl font-black font-mono text-white mt-1">
                  {calculatedScore}
                  <span className="text-lg text-slate-500">/100</span>
                </div>
                <div className="mt-2">
                  <span className={`px-4 py-1 rounded-full text-sm font-black font-mono uppercase border ${
                    calculatedGrade === 'A'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : calculatedGrade === 'B'
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                      : calculatedGrade === 'C'
                      ? 'bg-amber-950 text-amber-300 border-amber-700'
                      : 'bg-rose-950 text-rose-300 border-rose-700'
                  }`}>
                    Grade: {calculatedGrade} ({calculatedScore >= 90 ? 'Elite' : calculatedScore >= 80 ? 'Reliable' : calculatedScore >= 70 ? 'Mixed' : 'Unreliable'})
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-mono text-slate-400 pt-2">
                <div className="flex justify-between">
                  <span>Base Score:</span>
                  <span className="text-emerald-400 font-bold">100 pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Deductions:</span>
                  <span className="text-rose-400 font-bold">-{totalDeductions} pts</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <strong className="text-slate-200 block font-mono">Analytical Summary:</strong>
              <p>{activeScorecard.keyAnalyticalFindings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Part 2: Headline & Narrative Spin Comparison Workbench */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">
                Headline Spin & Linguistic Load Deconstructor
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Observe how Left and Right editorial desks package identical factual occurrences to emotionally prime their audiences.
            </p>
          </div>

          {/* Spin Stripper Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStrippedOfSpin(!isStrippedOfSpin)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 ${
                isStrippedOfSpin
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>{isStrippedOfSpin ? 'Restore Editorial Spin' : 'Strip The Spin (Reveal Raw Facts)'}</span>
            </button>
          </div>
        </div>

        {/* Spin Case Selector */}
        <div className="flex flex-wrap gap-2">
          {spinCases.map(sc => (
            <button
              key={sc.id}
              onClick={() => setSelectedSpinCase(sc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                selectedSpinCase.id === sc.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {sc.topic}
            </button>
          ))}
        </div>

        {/* Ground Truth Bar */}
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-300 font-bold uppercase">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>The Objective Ground Truth (Unspun Predicate)</span>
          </div>
          <p className="text-sm text-emerald-100 font-sans leading-relaxed">
            "{selectedSpinCase.groundTruthText}"
          </p>
        </div>

        {/* Side-by-Side Left vs Right Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left-Leaning Editorial */}
          <div className="bg-slate-950 p-5 rounded-xl border border-blue-900/60 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-blue-400 uppercase">
                Left-Leaning Editorial Framing ({selectedSpinCase.leftOutlet})
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300">
                Center-Left Lens
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-slate-400 font-mono">Packaged Headline:</div>
              <h4 className="text-base font-bold text-slate-100 leading-snug">
                {isStrippedOfSpin ? (
                  <span className="text-emerald-300 font-mono italic">
                    [Neutralized]: "{selectedSpinCase.groundTruthText}"
                  </span>
                ) : (
                  `"${selectedSpinCase.leftHeadline}"`
                )}
              </h4>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-slate-400 font-mono">Linguistic Priming Analysis:</div>
              <p className="text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                {selectedSpinCase.leftFramingAnalysis}
              </p>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Loaded Emotive Adjectives / Verbs:</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedSpinCase.leftLoadedWords.map((w, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 font-mono text-[11px]">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right-Leaning Editorial */}
          <div className="bg-slate-950 p-5 rounded-xl border border-rose-900/60 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-rose-400 uppercase">
                Right-Leaning Editorial Framing ({selectedSpinCase.rightOutlet})
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300">
                Conservative Lens
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-slate-400 font-mono">Packaged Headline:</div>
              <h4 className="text-base font-bold text-slate-100 leading-snug">
                {isStrippedOfSpin ? (
                  <span className="text-emerald-300 font-mono italic">
                    [Neutralized]: "{selectedSpinCase.groundTruthText}"
                  </span>
                ) : (
                  `"${selectedSpinCase.rightHeadline}"`
                )}
              </h4>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-slate-400 font-mono">Linguistic Priming Analysis:</div>
              <p className="text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                {selectedSpinCase.rightFramingAnalysis}
              </p>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Loaded Emotive Adjectives / Verbs:</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedSpinCase.rightLoadedWords.map((w, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 font-mono text-[11px]">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Systemic Omission Contrast */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1 text-xs text-slate-300">
          <span className="font-mono text-amber-400 font-bold uppercase flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Systemic Narrative Omissions Between The Outlets:
          </span>
          <p className="text-slate-400 pt-1 leading-relaxed">
            {selectedSpinCase.omissionsAnalysis}
          </p>
        </div>
      </div>
    </div>
  );
};
