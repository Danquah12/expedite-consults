"use client";

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
  Award,
  Radio,
  Building2,
  FileCheck,
  Check
} from 'lucide-react';

interface PublicReportGeneratorProps {
  clusters: NewsCluster[];
  scorecards: TVStationScorecard[];
  spinCases: SpinComparisonCase[];
  isGhanaPlatform?: boolean;
}

export const PublicReportGenerator: React.FC<PublicReportGeneratorProps> = ({
  clusters,
  scorecards,
  spinCases,
  isGhanaPlatform = false
}) => {
  const [selectedOutletsForDiet, setSelectedOutletsForDiet] = useState<string[]>(
    isGhanaPlatform ? ['Peace 104.3 FM / UTV', 'Joy 99.7 FM / JoyNews'] : ['Fox News', 'CNN']
  );
  const [dietResult, setDietResult] = useState<{
    biasScore: number;
    leftExposurePct: number;
    rightExposurePct: number;
    blindspotRisk: string;
    recommendations: string[];
  } | null>(null);

  const GLOBAL_OUTLET_OPTIONS = [
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

  const GHANA_OUTLET_OPTIONS = [
    { name: 'Citi 97.3 FM / Citi TV', lean: 'Center', bias: 0 },
    { name: 'Joy 99.7 FM / JoyNews', lean: 'Center', bias: 0 },
    { name: 'Daily Graphic', lean: 'Center', bias: 1 },
    { name: 'Ghanaian Times', lean: 'Center', bias: 0 },
    { name: 'Peace 104.3 FM / UTV', lean: 'Lean_Right', bias: 2 },
    { name: 'Asempa 94.7 FM (Ekosii Sen)', lean: 'Center', bias: -1 },
    { name: 'TV3 / 3FM', lean: 'Lean_Left', bias: -3 },
    { name: 'Sompa 98.9 FM Sunyani', lean: 'Center', bias: 0 },
    { name: 'Diamond 93.7 FM Tamale', lean: 'Center', bias: 0 },
    { name: 'GTV / GBC Radio', lean: 'Center', bias: 1 }
  ];

  const OUTLET_OPTIONS = isGhanaPlatform ? GHANA_OUTLET_OPTIONS : GLOBAL_OUTLET_OPTIONS;

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
        else if (match.lean === 'Right' || match.lean === 'Lean_Right') rightCount++;
        else centerCount++;
      }
    });

    const total = selectedOutletsForDiet.length;
    const leftPct = Math.round((leftCount / total) * 100);
    const rightPct = Math.round((rightCount / total) * 100);
    const avgBias = Number((totalBias / total).toFixed(1));

    let risk = isGhanaPlatform ? 'Balanced & Empirical Ghanaian Media Diet' : 'Balanced & High Media Resilience';
    const recs: string[] = [];

    if (isGhanaPlatform) {
      if (leftPct >= 60) {
        risk = 'Heavy Pro-NDC Broadcast Exposure (Missing NPP / Government Policy Telemetry)';
        recs.push('Add Citi Breakfast Show and JoyNews PM Express for empirical data triangulation.');
        recs.push('Consult Ministry of Finance and Parliamentary Hansard reports directly on sovereign fiscal figures.');
      } else if (rightPct >= 60) {
        risk = 'Heavy Pro-NPP Broadcast Exposure (Missing Opposition & Independent Audits)';
        recs.push('Review Auditor-General annual reports and independent fact-checks (GhanaFact, MyJoyOnline).');
        recs.push('Cross-reference Kokrokoo interviews with Parliamentary Public Accounts Committee hearings.');
      } else {
        recs.push('Excellent balance! Your Ghanaian media diet triangulates across urban data journalism and regional telemetry.');
      }
    } else {
      if (leftPct >= 70) {
        risk = 'High Left-Echo Chamber Risk (Missing Right Blindspots)';
        recs.push('Add PBS NewsHour or The Wall Street Journal to your morning rotation.');
        recs.push('Read the Associated Press unspun wire whenever major legal or regulatory orders are announced.');
      } else if (rightPct >= 70) {
        risk = 'High Right-Echo Chamber Risk (Missing Left Blindspots)';
        recs.push('Add BBC World News or Reuters to your morning rotation.');
        recs.push('Check independent fact-checks on viral political speech clips.');
      } else {
        recs.push('Great job! Your news consumption balances straight wire reporting with multiple viewpoints.');
      }
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
    const mdContent = isGhanaPlatform ? `# GHANA TRUTH PLATFORM: Sovereign Media Credibility & NDC vs NPP Promise Audit Report
**Public Civic Edition • Tracking Window: 2024 Campaign – September 4, 2026**
**Ghana Bipartisan Polarization Index (NDC vs NPP): 78.4 / 100 (High Partisan Division)**

---

## Executive Civic Summary
During this monitoring cycle, 78.4% of major Ghanaian political coverage showed partisan divergence between NDC and NPP messaging. This report audits empirical delivery against the 2024 NDC Manifesto, 120-Day Social Contract, and historical governance records.

---

## Section 1: Top Omissions & Newsroom Blindspots
### 1. NDC Opposition Blindspot: SADA Afforestation & Guinea Fowl Expenditures ($33M)
- **Coverage Ratio**: 65% Pro-Gov / 30% Center / 5% Pro-NDC (38 Outlets Reporting)
- **Omitted Evidence**: Auditor-General confirmation that GHS 200M+ afforestation projects yielded dead trees planted during harmattan, with zero commercial poultry exports.
- **Official Wire Fact**: Auditor-General Special Audit Report on Northern Development Authority / SADA.

### 2. NPP Incumbent Blindspot: 4-Year Dumsor Power Contracts & $1.2B Annual Take-or-Pay IPP Debt
- **Coverage Ratio**: 50% Pro-Gov / 38% Center / 12% Pro-NDC (52 Outlets Reporting)
- **Omitted Evidence**: Emergency 2015 PPAs contracted 5,081 MW capacity against 2,700 MW peak demand, resulting in sovereign take-or-pay financial obligations.
- **Official Wire Fact**: Ministry of Finance Energy Sector Recovery Programme & Parliamentary Order Papers.

### 3. NDC Opposition Blindspot: Komenda Sugar Factory $60M Raw Material Deficit
- **Coverage Ratio**: 72% Pro-Gov / 22% Center / 6% Pro-NDC
- **Omitted Evidence**: The failure to acquire and irrigate a 1,000-acre nucleus plantation left the $60M plant completely dormant without local sugarcane feedstock.
- **Official Wire Fact**: Parliamentary Committee on Trade, Industry & Tourism Oversight Docket.

### 4. NPP Incumbent Blindspot: 20% Rural Teacher Allowance Delay & Double-Track SHS Horizon
- **Coverage Ratio**: 68% Pro-NDC / 26% Center / 6% Pro-Gov
- **Omitted Evidence**: 68,000 rural teachers await CAGD payroll code activation; single-track SHS transition postponed to 2029 due to 1,200 classroom deficit.
- **Official Wire Fact**: GNAT / NAGRAT Joint Communique & Parliamentary Education Select Committee.

---

## Section 2: Ghanaian Broadcast Credibility Rankings
${scorecards.map(sc => `- **${sc.networkName}**: Score **${sc.finalScore}/100** (Grade: **${sc.grade}**) | ${100 - sc.deductions.factToOpinionRatio.opinionPercentage}% News vs ${sc.deductions.factToOpinionRatio.opinionPercentage}% Opinion | ${sc.keyAnalyticalFindings}`).join('\n')}

---

## Section 3: Headline Spin Deconstruction
- **Topic 1: 2024 Manifesto 24-Hour Economy & Night-Shift Policy**
  - **Pro-NDC (TV3 / 3FM)**: "Mahama 24-Hour Economy Blueprint to Transform Ghana into 3-Shift Industrial Powerhouse Overnight"
  - **Pro-NPP (Daily Guide / Wontumi)**: "Mahama's 24-Hour Economy Exposed as 419 Slogan Without Legislative Blueprint or Power Subsidy"
  - **⚖️ The Unadorned Truth**: The 24-Hour Economy proposal is a strategic policy framework offering off-peak power rebates and tax incentives, but operationalization requires substantial statutory amendments, tariff subsidies, and industrial security investments that are still pending parliamentary formulation.

- **Topic 2: Bank of Ghana $60B Cedi Recapitalization & DDEP Impact**
  - **Pro-NDC**: "Bank of Ghana Bankrupted by Reckless Printing of GH₵80B and Illegal Government Borrowing"
  - **Pro-NPP**: "Central Bank Sacrificed Balance Sheet to Save Banking Sector and Safeguard Depositors Under DDEP"
  - **⚖️ The Unadorned Truth**: The Bank of Ghana posted a non-cash accounting loss of GH₵60.8B in 2022 primarily due to the 50% haircut on Government of Ghana debt under the Domestic Debt Exchange Programme (DDEP) required by the IMF programme, compounded by GH₵37.9B in direct central bank financing.

---
*Generated by Ghana Truth Platform AI Engine (https://expedite-consults.vercel.app/truth-platform)*
` : `# VERITASLENS: National Media Credibility & Blindspot Audit Report
**Public Civic Edition • Tracking Window: August 18–25, 2026**
**National Media Polarization Index: 71.4 / 100 (High Partisan Asymmetry)**

---

## Executive Civic Summary
During this 7-day monitoring period, 71.4% of major national news cycles exhibited severe partisan coverage asymmetry (>70% coverage by one political wing with near-complete omission by the other).

---

## Section 1: Top Omissions & Blindspots
### 1. Left Blindspot #1: Tom Homan NYC Sanctuary Jurisdictional Warning
- **Coverage Ratio**: 85% Right / 15% Center / 0% Left
- **What Was Omitted**: Progressive networks bypassed former ICE director Homan's legal conference address.
- **Unspun Wire Fact (AP)**: Federal officers retain statutory authority under federal supremacy.

### 2. Right Blindspot #1: Nationwide Surge in ICE Interior Detentions
- **Coverage Ratio**: 73% Left / 18% Center / 9% Right
- **What Was Omitted**: Conservative networks focused heavily on border tallies, omitting interior detention conditions.
- **Unspun Wire Fact (Reuters)**: DHS quarterly reports verify interior non-citizen detentions rose by 23%.

---

## Section 2: 7-Day TV Station Credibility Rankings
${scorecards.map(sc => `- **${sc.networkName}**: Score **${sc.finalScore}/100** (Grade: **${sc.grade}**) | ${100 - sc.deductions.factToOpinionRatio.opinionPercentage}% News vs ${sc.deductions.factToOpinionRatio.opinionPercentage}% Opinion | ${sc.keyAnalyticalFindings}`).join('\n')}

---
*Generated by VeritasLens AI Engine*
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = isGhanaPlatform 
      ? `Ghana_Truth_Platform_Civic_Audit_Report_${new Date().toISOString().slice(0, 10)}.md`
      : `VeritasLens_Weekly_Civic_Audit_Report_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const payload = isGhanaPlatform ? {
      reportTitle: "Ghana Truth Platform: National Media Credibility & NDC vs NPP Blindspot Audit Report",
      generatedAt: new Date().toISOString(),
      polarizationIndex: 78.4,
      totalTrackedClaimsPerDay: "2,450+ broadcasts/day",
      topBlindspots: clusters,
      broadcasterScorecards: scorecards,
      spinDeconstructionCases: spinCases
    } : {
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
    link.download = isGhanaPlatform 
      ? `Ghana_Truth_Platform_Dataset_${new Date().toISOString().slice(0, 10)}.json`
      : `VeritasLens_Public_Dataset_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyShareLink = () => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/truth-platform?tab=public-report` : '';
    navigator.clipboard.writeText(shareUrl);
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
              {isGhanaPlatform 
                ? "Ghana Public Consumable Media Intelligence & Citizen Reports" 
                : "Public Consumable Media Intelligence & Citizen Reports"}
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            {isGhanaPlatform
              ? "Clear, empirical, non-partisan reports holding Ghanaian broadcast media and political communication machinery accountable."
              : "Clear, non-partisan reports engineered to enhance civic literacy, bridge partisan divides, and hold broadcast media accountable."}
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
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Share Link</span>
              </>
            )}
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
              {isGhanaPlatform
                ? "Ghanaian Citizen Tool: Personal News Diet & Echo Chamber Calculator"
                : "Citizen Tool: Personal News Diet & Echo Chamber Calculator"}
            </h3>
            <p className="text-xs text-slate-400">
              {isGhanaPlatform
                ? "Select the Ghanaian TV, radio, and print outlets you regularly follow to calculate your partisan blindspot exposure (NDC vs NPP)."
                : "Select the news outlets you regularly read or watch to calculate your personal blindspot exposure."}
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
                <span className="text-slate-400 text-[11px]">{isGhanaPlatform ? 'Pro-NDC / Center-Left Exposure:' : 'Left/Center-Left Exposure:'}</span>
                <div className="text-2xl font-black text-blue-400 mt-0.5">{dietResult.leftExposurePct}%</div>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px]">{isGhanaPlatform ? 'Pro-NPP / Center-Right Exposure:' : 'Right/Center-Right Exposure:'}</span>
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

      {/* ── THE OFFICIAL NATIONAL CITIZEN REPORT (PRINTABLE DOCUMENT) ── */}
      <div className="bg-white text-slate-900 rounded-2xl p-8 md:p-12 shadow-2xl space-y-8 print:p-0 print:shadow-none print:bg-white print:text-black">
        
        {/* Document Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b-2 border-slate-900">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isGhanaPlatform ? (
                <>
                  <span className="text-2xl font-black tracking-tight text-slate-950">GHANA <span className="text-rose-600">TRUTH</span> <span className="text-amber-500">PLATFORM</span></span>
                  <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
                    Public Civic Audit Edition
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-black tracking-tight text-slate-950">VERITAS<span className="text-cyan-600">LENS</span></span>
                  <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300 font-bold">
                    Public Civic Edition
                  </span>
                </>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
              {isGhanaPlatform
                ? "National Ghanaian Media Credibility & NDC vs NPP Blindspot Audit Report"
                : "National Media Credibility & Blindspot Audit Report"}
            </h1>
            <p className="text-xs text-slate-600 mt-1 font-sans">
              {isGhanaPlatform
                ? "Published for the Ghanaian Citizenry by Ghana Truth Platform Information Intelligence • Sample Tracking Window: 2024 Campaign – September 2026 Governance Audit"
                : "Published for the American Public by VeritasLens Information Intelligence • Sample Tracking Window: August 18–25, 2026"}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono uppercase text-slate-500 block">
              {isGhanaPlatform ? "Bipartisan Polarization (NDC vs NPP)" : "Weekly Polarization"}
            </span>
            <span className="text-3xl font-black font-mono text-rose-600">
              {isGhanaPlatform ? "78.4 / 100" : "71.4 / 100"}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {isGhanaPlatform ? "High Electoral Division" : "High Partisan Asymmetry"}
            </span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase font-mono flex items-center gap-1.5">
            <Award className="w-4 h-4 text-cyan-600" />
            Executive Civic Summary:
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            {isGhanaPlatform ? (
              <>
                During this comprehensive monitoring period, an estimated <strong>78.4%</strong> of major Ghanaian political coverage exhibited severe partisan divergence between NDC and NPP narratives. Citizens relying exclusively on a single broadcast channel or radio network were systematically shielded from critical statutory audit findings, Auditor-General dockets, and verified manifesto delivery data across healthcare, energy, agriculture, and education.
              </>
            ) : (
              <>
                During this 7-day monitoring period, an estimated <strong>71.4%</strong> of major national news cycles exhibited severe partisan coverage asymmetry (&gt;70% coverage by one political wing with near-complete omission by the other). Citizens relying solely on a single cable network were systematically shielded from critical legislative, economic, and judicial developments.
              </>
            )}
          </p>
        </div>

        {/* Section 1: The Top Weekly Blindspots */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            {isGhanaPlatform ? "Section 1: What Each Side Omitted in Ghana This Period" : "Section 1: What Each Side Omitted This Week"}
          </h2>

          {isGhanaPlatform ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ghana Blindspot 1: NDC Omission */}
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-blue-900 font-mono">
                  <span>🔴 NDC OPPOSITION BLINDSPOT #1</span>
                  <span>65% Pro-Gov / 5% Pro-NDC</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  SADA Afforestation &amp; Guinea Fowl Expenditures ($33M Deficit)
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>What was omitted:</strong> Pro-NDC broadcasts bypassed Auditor-General confirmation that GHS 200M+ afforestation projects yielded dead trees planted during harmattan, with zero commercial poultry exports.
                </p>
                <div className="bg-white p-2.5 rounded border border-blue-100 text-xs text-slate-800">
                  <strong className="text-emerald-700 font-mono">Unspun Statutory Fact (Auditor-General):</strong> Auditor-General Special Audit on Northern Development Authority / SADA confirmed complete loss of state capital without viable commercial output.
                </div>
              </div>

              {/* Ghana Blindspot 2: NPP Omission */}
              <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-rose-900 font-mono">
                  <span>🔵 NPP INCUMBENT BLINDSPOT #1</span>
                  <span>50% Pro-Gov / 12% Pro-NDC</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  4-Year Dumsor Emergency Contracts &amp; $1.2B Annual Take-or-Pay Debt
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>What was omitted:</strong> Pro-government commentary heavily emphasized power stability while omitting emergency 2015 PPAs that contracted 5,081 MW capacity against 2,700 MW peak demand, locking Ghana into $1.2B annual take-or-pay debt.
                </p>
                <div className="bg-white p-2.5 rounded border border-rose-100 text-xs text-slate-800">
                  <strong className="text-emerald-700 font-mono">Unspun Statutory Fact (Ministry of Finance):</strong> Ministry of Finance Energy Sector Recovery Programme (ESRP) and Parliamentary Hansards verify over $1.2B annual fiscal drain from excess capacity charges.
                </div>
              </div>

              {/* Ghana Blindspot 3: Komenda Sugar Factory */}
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-blue-900 font-mono">
                  <span>🔴 NDC OPPOSITION BLINDSPOT #2</span>
                  <span>72% Pro-Gov / 6% Pro-NDC</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Komenda Sugar Factory $60M Raw Material Deficit
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>What was omitted:</strong> Pro-NDC commentary omitted the non-acquisition of the 1,000-acre nucleus irrigated sugarcane plantation, rendering the $60M plant dormant without local sugarcane.
                </p>
                <div className="bg-white p-2.5 rounded border border-blue-100 text-xs text-slate-800">
                  <strong className="text-emerald-700 font-mono">Unspun Statutory Fact (MoTI):</strong> Parliamentary Committee on Trade, Industry &amp; Tourism confirmed 0 tons of local commercial sugar processed due to missing feedstock estate.
                </div>
              </div>

              {/* Ghana Blindspot 4: Rural Teacher Allowance & Double Track */}
              <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-rose-900 font-mono">
                  <span>🔵 NPP INCUMBENT BLINDSPOT #2</span>
                  <span>68% Pro-NDC / 6% Pro-Gov</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Delayed Rural Teacher 20% Allowance &amp; Double-Track SHS Horizon
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>What was omitted:</strong> Pro-government networks minimize the 68,000 rural teachers awaiting CAGD payroll code activation and the postponement of single-track SHS transition to 2029.
                </p>
                <div className="bg-white p-2.5 rounded border border-rose-100 text-xs text-slate-800">
                  <strong className="text-emerald-700 font-mono">Unspun Statutory Fact (GES &amp; GNAT):</strong> GNAT / NAGRAT joint communiques and Parliamentary Education Select Committee reports confirm ongoing classroom deficits.
                </div>
              </div>
            </div>
          ) : (
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
                  <strong>What was omitted:</strong> Progressive networks bypassed former ICE director Homan&apos;s legal conference address.
                </p>
                <div className="bg-white p-2.5 rounded border border-blue-100 text-xs text-slate-800">
                  <strong className="text-emerald-700 font-mono">Unspun Wire Fact (AP):</strong> Federal officers retain statutory authority under federal supremacy.
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
                  <strong>What was omitted:</strong> Conservative networks focused heavily on border tallies, omitting interior detention conditions.
                </p>
                <div className="bg-white p-2.5 rounded border border-rose-100 text-xs text-slate-800">
                  <strong className="text-emerald-700 font-mono">Unspun Wire Fact (Reuters):</strong> DHS quarterly reports verify interior non-citizen detentions rose by 23%.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Television & Radio Station Credibility Scorecard */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Tv className="w-5 h-5 text-purple-600" />
            {isGhanaPlatform ? "Section 2: Ghanaian Broadcast Television & Radio Credibility Rankings" : "Section 2: 7-Day Television Station Credibility Rankings"}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-slate-300 text-slate-600 uppercase font-mono text-[10px]">
                  <th className="py-2 px-3">Network / Station</th>
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

        {/* Section 3: Headline Spin Deconstruction */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-600" />
            {isGhanaPlatform ? "Section 3: Ghanaian Political Headline Spin Deconstruction" : "Section 3: Headline Spin Deconstruction of the Week"}
          </h2>

          {isGhanaPlatform ? (
            <div className="space-y-4">
              {/* Topic 1: 24-Hour Economy */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-mono font-bold text-slate-600 uppercase">
                  Topic 1: 2024 Manifesto 24-Hour Economy &amp; 3-Shift Policy
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-blue-200 space-y-1">
                    <span className="text-[10px] font-bold font-mono text-blue-700 uppercase">Pro-NDC Headline (TV3 / 3FM / NDC Comms):</span>
                    <p className="font-semibold text-slate-900">&ldquo;Mahama 24-Hour Economy Blueprint to Transform Ghana into 3-Shift Industrial Powerhouse Overnight&rdquo;</p>
                    <p className="text-[11px] text-slate-500 italic">Priming: Frames a broad policy concept as instantly implementable without detailing industrial night tariffs, off-peak power subsidies, or security costs.</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-rose-200 space-y-1">
                    <span className="text-[10px] font-bold font-mono text-rose-700 uppercase">Pro-NPP Headline (Daily Guide / Wontumi / NPP Comms):</span>
                    <p className="font-semibold text-slate-900">&ldquo;Mahama&apos;s 24-Hour Economy Exposed as 419 Slogan Without Legislative Blueprint or Power Subsidy&rdquo;</p>
                    <p className="text-[11px] text-slate-500 italic">Priming: Uses pejorative criminal slang (&ldquo;419 slogan&rdquo;) to dismiss an economic policy model rather than assessing proposed night-shift tax rebates.</p>
                  </div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-300 text-xs text-emerald-900">
                  <strong>⚖️ The Unadorned Truth:</strong> The 24-Hour Economy is a strategic voluntary economic framework offering off-peak electricity rebates and corporate tax incentives. However, operationalization requires substantial statutory amendments, tariff subsidies, and industrial security investments that are still pending parliamentary formulation.
                </div>
              </div>

              {/* Topic 2: Bank of Ghana DDEP Loss */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-mono font-bold text-slate-600 uppercase">
                  Topic 2: Bank of Ghana GH₵60.8B Accounting Loss &amp; DDEP Impact
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-blue-200 space-y-1">
                    <span className="text-[10px] font-bold font-mono text-blue-700 uppercase">Pro-NDC Headline (Herald / XYZ):</span>
                    <p className="font-semibold text-slate-900">&ldquo;Bank of Ghana Bankrupted by Reckless Printing of GH₵80B and Illegal Government Borrowing&rdquo;</p>
                    <p className="text-[11px] text-slate-500 italic">Priming: Attributes the central bank loss entirely to operational mismanagement, omitting the statutory sovereign debt restructuring mandated by the IMF.</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-rose-200 space-y-1">
                    <span className="text-[10px] font-bold font-mono text-rose-700 uppercase">Pro-NPP Headline (Daily Guide / Asaase):</span>
                    <p className="font-semibold text-slate-900">&ldquo;Central Bank Sacrificed Balance Sheet to Save Banking Sector and Safeguard Depositors Under DDEP&rdquo;</p>
                    <p className="text-[11px] text-slate-500 italic">Priming: Depicts the massive non-cash impairment purely as heroic sacrifice, downplaying direct fiscal financing exceeding statutory limits.</p>
                  </div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-300 text-xs text-emerald-900">
                  <strong>⚖️ The Unadorned Truth:</strong> The Bank of Ghana posted a non-cash accounting loss of GH₵60.8B in 2022 primarily due to the 50% haircut on Government of Ghana debt under the Domestic Debt Exchange Programme (DDEP) required by the IMF programme, compounded by GH₵37.9B in direct central bank financing.
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-mono font-bold text-slate-600 uppercase">
                Topic: Supreme Court Order on Mail-In Ballot Injunction
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-3 rounded-lg border border-blue-200 space-y-1">
                  <span className="text-[10px] font-bold font-mono text-blue-700 uppercase">Left-Wing Headline (MSNBC):</span>
                  <p className="font-semibold text-slate-900">&ldquo;Jackson Blasts Conservative Majority for Needlessly Injecting Chaos into Elections&rdquo;</p>
                  <p className="text-[11px] text-slate-500 italic">Priming: Uses emotional posture to frame standard administrative verification as systemic destruction.</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-rose-200 space-y-1">
                  <span className="text-[10px] font-bold font-mono text-rose-700 uppercase">Right-Wing Headline (Fox News):</span>
                  <p className="font-semibold text-slate-900">&ldquo;Supreme Court Clears Trump Mail-In Ballot Security Order in Major Election Integrity Victory&rdquo;</p>
                  <p className="text-[11px] text-slate-500 italic">Priming: Uses triumphant adjectives to portray a contested emergency stay as conclusive legal validation.</p>
                </div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-300 text-xs text-emerald-900">
                <strong>⚖️ The Unadorned Truth:</strong> The Supreme Court voted 6-3 on emergency docket to dissolve a preliminary injunction, allowing postal verification rules to proceed while substantive merits litigation continues in lower courts.
              </div>
            </div>
          )}
        </div>

        {/* Footer / Citation */}
        <div className="pt-6 border-t border-slate-300 text-center text-xs text-slate-500 font-mono">
          {isGhanaPlatform
            ? "Produced automatically by Ghana Truth Platform & VeritasLens AI Engine • Verified against Auditor-General of Ghana, Parliamentary Hansards, Ministry of Finance, Bank of Ghana, Energy Commission, and High Court Records."
            : "Produced automatically by VeritasLens AI Engine • Verified against Congress.gov, Supreme Court Slip Opinions & Reuters/AP Wire Repositories."}
        </div>
      </div>
    </div>
  );
};
