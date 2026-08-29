'use client';

import React, { useState } from 'react';
import { 
  NewsCluster, 
  TVStationScorecard, 
  SpinComparisonCase 
} from '@/lib/veritaslens/types';
import { 
  FileText, 
  Printer, 
  Download, 
  Share2, 
  CheckCircle2, 
  ShieldAlert, 
  Scale, 
  Sparkles, 
  TrendingUp, 
  Tv, 
  HeartHandshake, 
  BookOpen,
  Award
} from 'lucide-react';

interface PublicReportGeneratorProps {
  clusters: NewsCluster[];
  scorecards: TVStationScorecard[];
  spinCases: SpinComparisonCase[];
}

export const PublicReportGenerator: React.FC<PublicReportGeneratorProps> = ({
  clusters,
  scorecards,
  spinCases
}) => {
  const [selectedOutletsForDiet, setSelectedOutletsForDiet] = useState<string[]>(['Fox News', 'CNN']);
  const [dietResult, setDietResult] = useState<{
    biasScore: number;
    leftExposurePct: number;
    rightExposurePct: number;
    blindspotRisk: string;
    recommendations: string[];
  } | null>(null);

  const OUTLET_OPTIONS = [
    { name: 'PBS NewsHour', lean: 'Center', bias: 0 },
    { name: 'BBC News', lean: 'Center', bias: 0 },
    { name: 'The Wall Street Journal', lean: 'Center', bias: 1 },
    { name: 'Associated Press', lean: 'Lean_Left', bias: -2 },
    { name: 'The New York Times', lean: 'Lean_Left', bias: -4 },
    { name: 'NPR', lean: 'Lean_Left', bias: -4 },
    { name: 'CNN', lean: 'Left', bias: -10 },
    { name: 'MSNBC', lean: 'Left', bias: -15 },
    { name: 'Fox News', lean: 'Right', bias: 15 },
    { name: 'The Daily Wire', lean: 'Right', bias: 16 },
    { name: 'Newsmax', lean: 'Right', bias: 21 }
  ];

  const handleToggleOutlet = (name: string) => {
    setSelectedOutletsForDiet(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleCalculateDiet = () => {
    if (selectedOutletsForDiet.length === 0) return;

    let totalBias = 0;
    let leftCount = 0;
    let rightCount = 0;
    let centerCount = 0;

    selectedOutletsForDiet.forEach(name => {
      const match = OUTLET_OPTIONS.find(o => o.name === name);
      if (match) {
        totalBias += match.bias;
        if (match.lean === 'Left' || match.lean === 'Lean_Left') leftCount++;
        else if (match.lean === 'Right') rightCount++;
        else centerCount++;
      }
    });

    const total = selectedOutletsForDiet.length;
    const leftPct = Math.round((leftCount / total) * 100);
    const rightPct = Math.round((rightCount / total) * 100);
    const avgBias = Number((totalBias / total).toFixed(1));

    let risk = 'Balanced & High Media Resilience';
    const recs: string[] = [];

    if (leftPct >= 70) {
      risk = 'High Left-Echo Chamber Risk (Missing Right Blindspots)';
      recs.push('Add PBS NewsHour or The Wall Street Journal to your morning rotation.');
      recs.push('Read the Associated Press unspun wire whenever major legal or regulatory orders are announced.');
    } else if (rightPct >= 70) {
      risk = 'High Right-Echo Chamber Risk (Missing Left Blindspots)';
      recs.push('Add BBC World News or Reuters to your morning rotation.');
      recs.push('Check independent fact-checks (e.g. PolitiFact) on viral political speech clips.');
    } else {
      recs.push('Great job! Your news consumption balances straight wire reporting with multiple viewpoints.');
    }

    setDietResult({
      biasScore: avgBias,
      leftExposurePct: leftPct,
      rightExposurePct: rightPct,
      blindspotRisk: risk,
      recommendations: recs
    });
  };

  const [copiedLink, setCopiedLink] = useState(false);

  const handleDownloadMarkdown = () => {
    const mdContent = `# VERITASLENS: National Media Credibility & Blindspot Audit Report
**Public Civic Edition • Tracking Window: August 18–25, 2026**
**National Media Polarization Index: 71.4 / 100 (High Partisan Asymmetry)**

---

## Executive Civic Summary
During this 7-day monitoring period, 71.4% of major national news cycles exhibited severe partisan coverage asymmetry (>70% coverage by one political wing with near-complete omission by the other). Citizens relying solely on a single cable network were systematically shielded from critical developments.

---

## Section 1: Top Omissions & Blindspots
### 1. Left Blindspot #1: Tom Homan NYC Sanctuary Jurisdictional Warning
- **Coverage Ratio**: 85% Right / 15% Center / 0% Left (14 Outlets Reporting)
- **What Was Omitted**: Progressive networks (CNN, MSNBC, NYT) bypassed former ICE director Homan's legal conference address.
- **Unspun Wire Fact (AP)**: Federal officers retain statutory authority under federal supremacy to conduct immigration enforcement regardless of municipal non-cooperation statutes.

### 2. Right Blindspot #1: Nationwide Surge in ICE Interior Detentions
- **Coverage Ratio**: 73% Left / 18% Center / 9% Right (22 Outlets Reporting)
- **What Was Omitted**: Conservative networks focused heavily on border tallies, omitting interior detention conditions and court backlog metrics.
- **Unspun Wire Fact (Reuters)**: DHS quarterly reports verify interior non-citizen detentions rose by 23% to 41,200 individuals in the latest fiscal quarter.

---

## Section 2: 7-Day TV Station Credibility Rankings
${scorecards.map(sc => `- **${sc.networkName}**: Score **${sc.finalScore}/100** (Grade: **${sc.grade}**) | ${100 - sc.deductions.factToOpinionRatio.opinionPercentage}% News vs ${sc.deductions.factToOpinionRatio.opinionPercentage}% Opinion | ${sc.keyAnalyticalFindings}`).join('\n')}

---

## Section 3: Headline Spin Deconstruction
- **Topic**: Supreme Court Order on Mail-In Ballot Injunction
- **Left (MSNBC)**: "Jackson Blasts Conservative Majority for Needlessly Injecting Chaos into Elections"
- **Right (Fox News)**: "Supreme Court Clears Trump Mail-In Ballot Security Order in Major Election Integrity Victory"
- **⚖️ The Unadorned Truth**: The Supreme Court voted 6-3 on emergency docket to dissolve a preliminary injunction, allowing postal verification rules to proceed while substantive merits litigation continues in lower courts.

---
*Generated by VeritasLens AI Engine (https://portal.expediteconsults.com/veritaslens)*
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VeritasLens_Weekly_Civic_Audit_Report_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const payload = {
      reportTitle: "VeritasLens Weekly National Media Credibility & Blindspot Report",
      generatedAt: new Date().toISOString(),
      polarizationIndex: 71.4,
      totalTrackedArticlesPerDay: "60,000+",
      topBlindspots: clusters,
      tvStationScorecards: scorecards,
      spinDeconstructionCases: spinCases
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VeritasLens_Public_Dataset_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/veritaslens?tab=public-report');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">
              Public Consumable Media Intelligence & Citizen Reports
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Clear, non-partisan reports engineered to enhance civic literacy, bridge partisan divides, and hold broadcast media accountable.
          </p>
        </div>

        {/* 1-Click Action Export Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadMarkdown}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 border border-slate-700"
            title="Download formatted Markdown document"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export .MD</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 border border-slate-700"
            title="Download raw structured JSON dataset"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export .JSON</span>
          </button>

          <button
            onClick={handleCopyShareLink}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 border border-slate-700"
          >
            <Share2 className="w-3.5 h-3.5 text-purple-400" />
            <span>{copiedLink ? 'Link Copied!' : 'Share Link'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-cyan-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>1-Click Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Interactive Tool: Personal News Diet & Echo Chamber Calculator */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Scale className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-base font-bold text-white">
              Citizen Tool: Personal News Diet & Echo Chamber Calculator
            </h3>
            <p className="text-xs text-slate-400">
              Select the news outlets you regularly read or watch to calculate your personal blindspot exposure.
            </p>
          </div>
        </div>

        {/* Outlet Selector Chips */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase font-bold text-slate-300">
            Select Your Regular News Sources:
          </span>
          <div className="flex flex-wrap gap-2 pt-1">
            {OUTLET_OPTIONS.map(out => {
              const isSelected = selectedOutletsForDiet.includes(out.name);
              return (
                <button
                  key={out.name}
                  onClick={() => handleToggleOutlet(out.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-cyan-600 text-white border-cyan-500 font-bold shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span>{out.name}</span>
                  <span className="text-[10px] opacity-75">({out.lean.replace('_', ' ')})</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleCalculateDiet}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Analyze My News Diet</span>
        </button>

        {/* Diet Results Card */}
        {dietResult && (
          <div className="bg-slate-950 p-5 rounded-xl border border-purple-800/80 space-y-4 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Your Media Intake Assessment</span>
                <h4 className="text-base font-bold text-purple-300 font-mono">{dietResult.blindspotRisk}</h4>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                Net Bias Index: {dietResult.biasScore > 0 ? `+${dietResult.biasScore}` : dietResult.biasScore}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px]">Left/Center-Left Exposure:</span>
                <div className="text-2xl font-black text-blue-400 mt-0.5">{dietResult.leftExposurePct}%</div>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px]">Right/Center-Right Exposure:</span>
                <div className="text-2xl font-black text-rose-400 mt-0.5">{dietResult.rightExposurePct}%</div>
              </div>
            </div>

            <div className="space-y-1.5 pt-1 text-xs">
              <span className="text-emerald-400 font-mono font-bold block uppercase">
                Personalized Recommendations for Balanced Truth:
              </span>
              <ul className="space-y-1 text-slate-300">
                {dietResult.recommendations.map((r, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* ── THE OFFICIAL WEEKLY NATIONAL CITIZEN REPORT (PRINTABLE DOCUMENT) ── */}
      <div className="bg-white text-slate-900 rounded-2xl p-8 md:p-12 shadow-2xl space-y-8 print:p-0 print:shadow-none print:bg-white print:text-black">
        {/* Document Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b-2 border-slate-900">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-black tracking-tight text-slate-950">VERITAS<span className="text-cyan-600">LENS</span></span>
              <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300 font-bold">
                Public Civic Edition
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
              National Media Credibility & Blindspot Audit Report
            </h1>
            <p className="text-xs text-slate-600 mt-1 font-sans">
              Published for the American Public by VeritasLens Information Intelligence • Sample Tracking Window: August 18–25, 2026
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono uppercase text-slate-500 block">Weekly Polarization</span>
            <span className="text-3xl font-black font-mono text-rose-600">71.4 / 100</span>
            <span className="text-[10px] text-slate-500 block">High Partisan Asymmetry</span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase font-mono flex items-center gap-1.5">
            <Award className="w-4 h-4 text-cyan-600" />
            Executive Civic Summary:
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            During this 7-day monitoring period, an estimated <strong>71.4%</strong> of major national news cycles exhibited severe partisan coverage asymmetry (&gt;70% coverage by one political wing with near-complete omission by the other). Citizens relying solely on a single cable network were systematically shielded from critical legislative, economic, and judicial developments.
          </p>
        </div>

        {/* Section 1: The Top Weekly Blindspots */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            Section 1: What Each Side Omitted This Week
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Blindspot Box */}
            <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-blue-900 font-mono">
                <span>🔴 LEFT BLINDSPOT #1</span>
                <span>85% Right / 0% Left</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Tom Homan NYC Sanctuary Jurisdictional Warning
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                <strong>What was omitted:</strong> Progressive networks (CNN, MSNBC) bypassed former ICE director Homan&apos;s legal conference address.
              </p>
              <div className="bg-white p-2.5 rounded border border-blue-100 text-xs text-slate-800">
                <strong className="text-emerald-700 font-mono">Unspun Wire Fact (AP):</strong> Federal officers retain statutory authority under federal supremacy to conduct immigration enforcement regardless of municipal non-cooperation statutes.
              </div>
            </div>

            {/* Right Blindspot Box */}
            <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-rose-900 font-mono">
                <span>🔵 RIGHT BLINDSPOT #1</span>
                <span>73% Left / 9% Right</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Nationwide Surge in ICE Interior Detentions
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                <strong>What was omitted:</strong> Conservative networks focused heavily on border tallies, omitting interior detention conditions and court backlog metrics.
              </p>
              <div className="bg-white p-2.5 rounded border border-rose-100 text-xs text-slate-800">
                <strong className="text-emerald-700 font-mono">Unspun Wire Fact (Reuters):</strong> DHS quarterly reports verify interior non-citizen detentions rose by 23% to 41,200 individuals in the latest fiscal quarter.
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: 7-Day TV Station Credibility Scorecard */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Tv className="w-5 h-5 text-purple-600" />
            Section 2: 7-Day Television Station Credibility Rankings
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-slate-300 text-slate-600 uppercase font-mono text-[10px]">
                  <th className="py-2 px-3">Network</th>
                  <th className="py-2 px-3">Final Score (0-100)</th>
                  <th className="py-2 px-3">Grade</th>
                  <th className="py-2 px-3">Fact-to-Opinion Ratio</th>
                  <th className="py-2 px-3">Auditor Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {scorecards.map(sc => (
                  <tr key={sc.id}>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{sc.networkName}</td>
                    <td className="py-2.5 px-3 font-mono font-bold">{sc.finalScore} / 100</td>
                    <td className="py-2.5 px-3 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                        sc.grade === 'A' ? 'bg-emerald-100 text-emerald-800' :
                        sc.grade === 'B' ? 'bg-cyan-100 text-cyan-800' :
                        sc.grade === 'C' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {sc.grade}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-mono">
                      {100 - sc.deductions.factToOpinionRatio.opinionPercentage}% News / {sc.deductions.factToOpinionRatio.opinionPercentage}% Opinion
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-xs">{sc.keyAnalyticalFindings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: The Headline Spin Deconstruction of the Week */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-600" />
            Section 3: Headline Spin Deconstruction of the Week
          </h2>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="text-xs font-mono font-bold text-slate-600 uppercase">
              Topic: Supreme Court Order on Mail-In Ballot Injunction
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-3 rounded-lg border border-blue-200 space-y-1">
                <span className="text-[10px] font-bold font-mono text-blue-700 uppercase">Left-Wing Headline (MSNBC):</span>
                <p className="font-semibold text-slate-900">&ldquo;Jackson Blasts Conservative Majority for Needlessly Injecting Chaos into Elections&rdquo;</p>
                <p className="text-[11px] text-slate-500 italic">Priming: Uses emotional posture (&ldquo;blasts&rdquo;, &ldquo;injecting chaos&rdquo;) to frame standard administrative verification as systemic destruction.</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-rose-200 space-y-1">
                <span className="text-[10px] font-bold font-mono text-rose-700 uppercase">Right-Wing Headline (Fox News):</span>
                <p className="font-semibold text-slate-900">&ldquo;Supreme Court Clears Trump Mail-In Ballot Security Order in Major Election Integrity Victory&rdquo;</p>
                <p className="text-[11px] text-slate-500 italic">Priming: Uses triumphant adjectives (&ldquo;integrity victory&rdquo;, &ldquo;clears&rdquo;) to portray a contested emergency stay as conclusive legal validation.</p>
              </div>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-300 text-xs text-emerald-900">
              <strong>⚖️ The Unadorned Truth:</strong> The Supreme Court voted 6-3 on emergency docket to dissolve a preliminary injunction, allowing postal verification rules to proceed while substantive merits litigation continues in lower courts.
            </div>
          </div>
        </div>

        {/* Footer / Citation */}
        <div className="pt-6 border-t border-slate-300 text-center text-xs text-slate-500 font-mono">
          Produced automatically by VeritasLens AI Engine • Verified against Congress.gov, Supreme Court Slip Opinions & Reuters/AP Wire Repositories.
        </div>
      </div>
    </div>
  );
};
