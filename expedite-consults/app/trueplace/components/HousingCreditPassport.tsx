'use client';

import React, { useState, useMemo } from 'react';
import { Property } from '../mockData';
import { REAL_DMV_INVENTORY } from '../realDataService';
import {
  HousingProfile,
  HousingScores,
  PropertyAffordabilityAnalysis,
  WhatIfSimulationResult,
  AdverseActionNotice,
  calculateHousingScores,
  evaluatePropertyAffordability,
  simulateHousingWhatIf,
  generateFCRAAdverseActionNotice,
  SEED_HOUSING_PROFILE,
  DEMO_PERSONAS
} from '../housingCreditEngine';
import {
  ShieldCheck,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Lock,
  FileText,
  SlidersHorizontal,
  Home,
  DollarSign,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Info,
  Clock,
  Building,
  UserCheck,
  Scale,
  Send,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Building2,
  Calendar,
  AlertTriangle,
  FileCheck2,
  Printer
} from 'lucide-react';

interface HousingCreditPassportProps {
  onSelectProperty?: (prop: Property) => void;
  onNavigateTab?: (tab: string) => void;
}

export const HousingCreditPassport: React.FC<HousingCreditPassportProps> = ({
  onSelectProperty,
  onNavigateTab
}) => {
  const [selectedPersonaKey, setSelectedPersonaKey] = useState<string>('dualIncome');
  const [profile, setProfile] = useState<HousingProfile>(SEED_HOUSING_PROFILE);
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'matcher' | 'simulator' | 'consent' | 'compliance'>('dashboard');

  const handleSelectPersona = (key: string) => {
    setSelectedPersonaKey(key);
    if (DEMO_PERSONAS[key]) {
      setProfile(DEMO_PERSONAS[key].profile);
      setPayoffAmount(0);
      setDownPaymentBoost(0);
      setMonthlySavingsBoost(0);
    }
  };

  // Matcher filters
  const [compatibilityFilter, setCompatibilityFilter] = useState<'all' | 'Comfortable' | 'Modeled Stretch' | 'Incompatible'>('all');
  const [selectedSubmarket, setSelectedSubmarket] = useState<string>('All');
  const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(null);

  // What-If Simulator state
  const [payoffAmount, setPayoffAmount] = useState<number>(0);
  const [downPaymentBoost, setDownPaymentBoost] = useState<number>(0);
  const [monthlySavingsBoost, setMonthlySavingsBoost] = useState<number>(0);

  // Dispute & Adverse Action State
  const [disputes, setDisputes] = useState<Array<{
    id: string;
    tradelineCreditor: string;
    reason: string;
    submittedDate: string;
    resolutionDeadline: string;
    status: 'In Investigation' | 'Bureau Notified' | 'Resolved';
    daysRemaining: number;
  }>>([
    {
      id: 'DISP-2026-081',
      tradelineCreditor: 'Navy Federal Credit Union',
      reason: 'Balance reported $1,650; actual paid statement balance $1,200',
      submittedDate: '2026-03-05',
      resolutionDeadline: '2026-04-04',
      status: 'Bureau Notified',
      daysRemaining: 19
    }
  ]);
  const [selectedDisputeTradeline, setSelectedDisputeTradeline] = useState<string>('TL-01');
  const [disputeReason, setDisputeReason] = useState<string>('Inaccurate balance reported');
  const [disputeExplanation, setDisputeExplanation] = useState<string>('');
  const [showDisputeModal, setShowDisputeModal] = useState<boolean>(false);

  // Adverse Action State
  const [adverseNotice, setAdverseNotice] = useState<AdverseActionNotice | null>(null);
  const [showNoticeModal, setShowNoticeModal] = useState<boolean>(false);

  // Consent Toggles
  const [fcra604Consent, setFcra604Consent] = useState<boolean>(true);
  const [esignConsent, setEsignConsent] = useState<boolean>(true);
  const [plaidSyncActive, setPlaidSyncActive] = useState<boolean>(true);

  // Calculate live scores
  const scores: HousingScores = useMemo(() => {
    return calculateHousingScores(profile);
  }, [profile]);

  // Evaluated properties across all 25 real DMV homes
  const evaluatedProperties: Array<{ property: Property; analysis: PropertyAffordabilityAnalysis }> = useMemo(() => {
    return REAL_DMV_INVENTORY.map((prop) => ({
      property: prop,
      analysis: evaluatePropertyAffordability(profile, prop)
    }));
  }, [profile]);

  // Dynamic compatibility counts
  const compatCounts = useMemo(() => {
    const counts = { all: evaluatedProperties.length, Comfortable: 0, 'Modeled Stretch': 0, Incompatible: 0 };
    evaluatedProperties.forEach(({ analysis }) => {
      counts[analysis.affordabilityStatus]++;
    });
    return counts;
  }, [evaluatedProperties]);

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return evaluatedProperties.filter(({ property, analysis }) => {
      const matchesCompat = compatibilityFilter === 'all' || analysis.affordabilityStatus === compatibilityFilter;
      const matchesSubmarket = selectedSubmarket === 'All' || property.city.toLowerCase().includes(selectedSubmarket.toLowerCase()) || property.state.toLowerCase() === selectedSubmarket.toLowerCase();
      return matchesCompat && matchesSubmarket;
    });
  }, [evaluatedProperties, compatibilityFilter, selectedSubmarket]);

  // Live What-If Simulation
  const whatIfResult: WhatIfSimulationResult = useMemo(() => {
    return simulateHousingWhatIf(
      profile,
      {
        debtPayoffAmount: payoffAmount,
        downPaymentIncrease: downPaymentBoost,
        monthlySavingsBoost: monthlySavingsBoost
      },
      REAL_DMV_INVENTORY
    );
  }, [profile, payoffAmount, downPaymentBoost, monthlySavingsBoost]);

  // Unlocked properties in simulation
  const unlockedProperties = useMemo(() => {
    if (whatIfResult.scoreDifference <= 0 && payoffAmount === 0 && downPaymentBoost === 0) return [];
    const simulatedProfile: HousingProfile = JSON.parse(JSON.stringify(profile));
    simulatedProfile.totalRevolvingBalance = Math.max(0, simulatedProfile.totalRevolvingBalance - payoffAmount);
    simulatedProfile.downPaymentAvailable += downPaymentBoost;
    simulatedProfile.monthlyDebtObligations = Math.max(200, simulatedProfile.monthlyDebtObligations - Math.round(payoffAmount * 0.025));

    return REAL_DMV_INVENTORY.filter((prop) => {
      const orig = evaluatePropertyAffordability(profile, prop);
      const sim = evaluatePropertyAffordability(simulatedProfile, prop);
      return orig.affordabilityStatus !== 'Comfortable' && sim.affordabilityStatus === 'Comfortable';
    });
  }, [profile, whatIfResult, payoffAmount, downPaymentBoost]);

  // Handle Dispute Submission
  const handleCreateDispute = (e: React.FormEvent) => {
    e.preventDefault();
    const tl = profile.tradelines.find((t) => t.id === selectedDisputeTradeline);
    const newDispute = {
      id: `DISP-2026-${Math.floor(100 + Math.random() * 900)}`,
      tradelineCreditor: tl ? tl.creditor : 'General File Item',
      reason: disputeReason + (disputeExplanation ? `: ${disputeExplanation}` : ''),
      submittedDate: new Date().toISOString().split('T')[0],
      resolutionDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'In Investigation' as const,
      daysRemaining: 30
    };
    setDisputes([newDispute, ...disputes]);
    setShowDisputeModal(false);
    setDisputeExplanation('');
  };

  // Generate Adverse Action
  const handleGenerateAdverseNotice = (prop: Property) => {
    const notice = generateFCRAAdverseActionNotice(
      profile,
      'Capital Residential Asset Management LLC',
      `${prop.address}, ${prop.city}, ${prop.state} ${prop.zip}`,
      'Denial of Tenancy'
    );
    setAdverseNotice(notice);
    setShowNoticeModal(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner / Persona Card */}
      <div className="bg-gradient-to-r from-[#0C382E] via-[#114E40] to-[#0A2F27] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-emerald-500/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold tracking-wide uppercase flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Housing Passport™ Verified File</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-gray-200 text-xs font-medium">
                FCRA § 604(a)(2) Authorized
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-medium flex items-center space-x-1">
                <UserCheck className="w-3 h-3 text-blue-300" />
                <span>ID.me Level 2 (IAL2)</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-sans">
              Housing Credit & Readiness Intelligence
            </h1>
            <p className="text-sm text-gray-200 font-light max-w-2xl">
              Deterministic, explainable consumer-reporting engine combining traditional bureau tradelines, verified rental ledger history, and post-close liquid reserves. Fully compliant with FCRA § 604, § 611, § 615 and HUD Fair Housing mandates.
            </p>

            {/* Persona Quick Stats Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-gray-300">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Applicant: <strong className="text-white">{profile.fullName}</strong></span>
              </div>
              <div className="hidden sm:inline text-gray-500">•</div>
              <div>Role: <strong className="text-white">{profile.jobTitle}</strong></div>
              <div className="hidden sm:inline text-gray-500">•</div>
              <div>Gross Income: <strong className="text-white">${profile.grossAnnualIncome.toLocaleString()}/yr</strong> (Verified W2)</div>
              <div className="hidden sm:inline text-gray-500">•</div>
              <div>Traditional Bureau: <strong className="text-white">{profile.traditionalCreditScore}</strong> (TU / EX)</div>
            </div>

            {/* Persona Selector Toggle Pills */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold">Applicant Persona:</span>
              {Object.entries(DEMO_PERSONAS).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => handleSelectPersona(key)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    selectedPersonaKey === key
                      ? 'bg-emerald-400 text-black font-bold shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-gray-200'
                  }`}
                  title={item.description}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Score Badge & Key Pillar Indicator */}
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center space-x-5 shrink-0">
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-emerald-400 flex flex-col items-center justify-center bg-emerald-950/70 shadow-inner">
                <span className="text-2xl font-black text-white">{scores.housingCreditScore}</span>
                <span className="text-[9px] font-bold uppercase text-emerald-300 tracking-tighter">Housing Score</span>
              </div>
              <div className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wider">
                {scores.scoreBand}
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="text-gray-300">
                Payment Reliability: <strong className="text-emerald-300">{scores.paymentReliabilityIndex}/100</strong>
              </div>
              <div className="text-gray-300">
                Rental Readiness: <strong className="text-emerald-300">{scores.rentalReadinessScore}/100</strong>
              </div>
              <div className="text-gray-300">
                Homebuyer Readiness: <strong className="text-emerald-300">{scores.homebuyerReadinessScore}/100</strong>
              </div>
              <div className="text-gray-300">
                Back-End DTI: <strong className="text-white">{scores.backEndDTI}%</strong> (Guide &le; 36%)
              </div>
            </div>
          </div>
        </div>

        {/* Ambient background accent */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-400/10 pointer-events-none blur-2xl" />
      </div>

      {/* Main Tab Navigation */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-1 flex items-center space-x-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'dashboard', label: '1. Passport Dashboard', icon: Award },
          { id: 'matcher', label: '2. DMV Property Matcher (25)', icon: Home },
          { id: 'simulator', label: '3. What-If Simulator', icon: SlidersHorizontal },
          { id: 'consent', label: '4. Consent & Vault', icon: Lock },
          { id: 'compliance', label: '5. FCRA Disputes & Legal Notice', icon: Scale },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#0C382E] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#34D399]' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PASSPORT DASHBOARD */}
      {/* ========================================================================= */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top Score Matrix Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Housing Credit Score Tile */}
            <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Housing Credit Score™</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Range 300–850
                  </span>
                </div>
                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="text-4xl font-black text-gray-950 font-sans">{scores.housingCreditScore}</span>
                  <span className="text-xs font-bold text-emerald-600">+{scores.housingCreditScore - profile.traditionalCreditScore} vs FICO</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Tier: <strong className="text-emerald-900">{scores.scoreBand}</strong>. Prime housing applicant status based on verified on-time rent, low DTI, and verified reserves.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
                <span>Traditional Bureau: <strong>{profile.traditionalCreditScore}</strong></span>
                <span>Model: <strong>v2.4 Deterministic</strong></span>
              </div>
            </div>

            {/* Rental Readiness Score Tile */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                    Rental Readiness
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                    Tier 1 Tenant
                  </span>
                </div>
                <div className="mt-3 flex items-baseline space-x-1">
                  <span className="text-4xl font-black text-gray-950 font-sans">{scores.rentalReadinessScore}</span>
                  <span className="text-xs text-gray-400">/ 100</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${scores.rentalReadinessScore}%` }} />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  0 late payments in 36 months. Rent-to-income is 24.1%, well below the 33% standard rent ceiling.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
                Max Monthly Rent: <strong className="text-gray-900">${scores.maxAffordableRent.toLocaleString()}/mo</strong>
              </div>
            </div>

            {/* Homebuyer Readiness Score Tile */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                    Homebuyer Readiness
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Conventional Ready
                  </span>
                </div>
                <div className="mt-3 flex items-baseline space-x-1">
                  <span className="text-4xl font-black text-gray-950 font-sans">{scores.homebuyerReadinessScore}</span>
                  <span className="text-xs text-gray-400">/ 100</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${scores.homebuyerReadinessScore}%` }} />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  $65,000 available down payment covers 10%–20% on median Northern Virginia / Maryland townhouses and starter homes.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
                Max Home Price: <strong className="text-gray-900">${scores.maxAffordableHomePrice.toLocaleString()}</strong>
              </div>
            </div>

            {/* Payment Reliability Index Tile */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                    Payment Reliability
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                    Pristine Ledger
                  </span>
                </div>
                <div className="mt-3 flex items-baseline space-x-1">
                  <span className="text-4xl font-black text-gray-950 font-sans">{scores.paymentReliabilityIndex}</span>
                  <span className="text-xs text-gray-400">/ 100</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: `${scores.paymentReliabilityIndex}%` }} />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  100% on-time payments across 4 bureau tradelines (auto, student, revolving) + 12 monthly rent ledger cycles.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
                Collections / Charge-Offs: <strong className="text-emerald-700">0</strong>
              </div>
            </div>
          </div>

          {/* Underwriting Vitals Matrix */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                  <span>Institutional Underwriting Vitals & Cash-Flow Architecture</span>
                  <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Plaid + The Work Number Synced
                  </span>
                </h3>
                <p className="text-xs text-gray-500">
                  Real-time liquidity and debt-service ratios tested against Fannie Mae, Freddie Mac, and FHA conforming standards.
                </p>
              </div>
              <span className="text-xs text-gray-400">Updated: Today, 30m Real Sync</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Back-End DTI</span>
                <div className="text-2xl font-black text-gray-900 mt-1">{scores.backEndDTI}%</div>
                <span className="text-[11px] text-emerald-700 font-medium">Standard Limit: 36%–43%</span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Emergency Reserves</span>
                <div className="text-2xl font-black text-gray-900 mt-1">{scores.emergencyReservesMonths} mos</div>
                <span className="text-[11px] text-emerald-700 font-medium">${profile.liquidCashReserves.toLocaleString()} liquid cash</span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Credit Card Utilization</span>
                <div className="text-2xl font-black text-gray-900 mt-1">{profile.revolvingUtilizationPct}%</div>
                <span className="text-[11px] text-emerald-700 font-medium">${profile.totalRevolvingBalance.toLocaleString()} of ${profile.totalRevolvingLimit.toLocaleString()} limit</span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Max Monthly Housing</span>
                <div className="text-2xl font-black text-gray-900 mt-1">${scores.maxAffordableMonthlyPayment.toLocaleString()}</div>
                <span className="text-[11px] text-emerald-700 font-medium">At 36% back-end budget</span>
              </div>
            </div>
          </div>

          {/* Tradelines & Rental Ledger Double Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tradelines Panel */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    <span>Verified Credit Tradelines ({profile.tradelines.length})</span>
                  </h3>
                  <p className="text-xs text-gray-500">TransUnion & Experian consumer file sync</p>
                </div>
                <button
                  onClick={() => setShowDisputeModal(true)}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                >
                  Dispute Tradeline
                </button>
              </div>

              <div className="space-y-2.5">
                {profile.tradelines.map((tl) => (
                  <div key={tl.id} className="p-3 rounded-xl bg-gray-50 border border-gray-150 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-gray-900 flex items-center space-x-1.5">
                        <span>{tl.creditor}</span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                          {tl.status}
                        </span>
                      </div>
                      <div className="text-gray-500 text-[11px]">
                        Type: <span className="capitalize">{tl.type}</span> • Source: {tl.verifiedSource}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-gray-900">${tl.balance.toLocaleString()}</div>
                      <div className="text-gray-500 text-[11px]">${tl.monthlyPayment}/mo</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rental Ledger Verification Panel */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                    <span>12-Month Verified Housing Ledger</span>
                  </h3>
                  <p className="text-xs text-gray-500">Direct landlord automated bank ACH verification</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  100% On-Time
                </span>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-6 gap-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider pb-1">
                  <div className="col-span-2">Month</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-2 text-right">Status</div>
                </div>
                {profile.rentalLedger.slice(0, 6).map((rec, i) => (
                  <div key={i} className="grid grid-cols-6 gap-1 p-2 rounded-lg bg-gray-50 border border-gray-100 items-center text-xs">
                    <div className="col-span-2 font-medium text-gray-800 flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>{rec.monthYear}</span>
                    </div>
                    <div className="col-span-2 font-bold text-gray-900">${rec.amountDue.toLocaleString()}</div>
                    <div className="col-span-2 text-right">
                      <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>On-Time</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Improvement Roadmap */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Tailored Score Improvement & Homebuyer Unlocking Roadmap</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <h4 className="font-bold text-xs text-emerald-950">Pay Down $2,200 Revolving Balance</h4>
                </div>
                <p className="text-xs text-gray-600">
                  Reducing Chase balance to $0 drops aggregate utilization from 15.2% to 5.1%, adding an estimated <strong>+14 points</strong> to your Housing Score.
                </p>
                <button
                  onClick={() => {
                    setPayoffAmount(2200);
                    setActiveSubTab('simulator');
                  }}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>Simulate in What-If</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <h4 className="font-bold text-xs text-blue-950">Boost Down Payment to $85,000</h4>
                </div>
                <p className="text-xs text-gray-600">
                  Allocating an additional $20,000 from high-yield savings eliminates Private Mortgage Insurance (PMI) on homes up to $425,000, saving $212/month.
                </p>
                <button
                  onClick={() => {
                    setDownPaymentBoost(20000);
                    setActiveSubTab('simulator');
                  }}
                  className="text-xs font-bold text-blue-800 hover:text-blue-950 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>Simulate in What-If</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <h4 className="font-bold text-xs text-purple-950">Lock 6-Month Liquid Reserve Buffer</h4>
                </div>
                <p className="text-xs text-gray-600">
                  Retaining at least $24,000 post-closing protects your Tier 1 Prime status and guarantees institutional lender automated underwriting approvals.
                </p>
                <div className="text-xs font-bold text-purple-800 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-purple-600" />
                  <span>Currently Meeting Guideline (5.1 mo)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DMV PROPERTY MATCHER */}
      {/* ========================================================================= */}
      {activeSubTab === 'matcher' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                <span>Personalized DMV Property Affordability Matcher</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {filteredProperties.length} Properties
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                Calculates real P&I, county property tax, insurance, and post-close reserve runway specifically for Jordan S. Miller ($11k/mo gross).
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: `All (${compatCounts.all})` },
                { id: 'Comfortable', label: `🟢 Comfortable (${compatCounts.Comfortable})` },
                { id: 'Modeled Stretch', label: `🟡 Modeled Stretch (${compatCounts['Modeled Stretch']})` },
                { id: 'Incompatible', label: `🔴 Incompatible (${compatCounts.Incompatible})` }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setCompatibilityFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    compatibilityFilter === f.id
                      ? 'bg-[#0C382E] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Property Match Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProperties.map(({ property, analysis }) => {
              const isComfortable = analysis.affordabilityStatus === 'Comfortable';
              const isStretch = analysis.affordabilityStatus === 'Modeled Stretch';
              const isExpanded = expandedPropertyId === property.id;

              return (
                <div
                  key={property.id}
                  className={`bg-white rounded-2xl border transition-all shadow-sm overflow-hidden flex flex-col justify-between ${
                    isComfortable
                      ? 'border-emerald-200 hover:border-emerald-400'
                      : isStretch
                      ? 'border-amber-200 hover:border-amber-400'
                      : 'border-rose-200 hover:border-rose-300'
                  }`}
                >
                  <div>
                    {/* Image & Badges */}
                    <div className="relative aspect-video w-full bg-gray-100 overflow-hidden">
                      <img
                        src={property.photoUrl}
                        alt={property.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-md ${
                            isComfortable
                              ? 'bg-emerald-600 text-white'
                              : isStretch
                              ? 'bg-amber-500 text-white'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          {isComfortable ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : isStretch ? (
                            <AlertCircle className="w-3.5 h-3.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          <span>{analysis.affordabilityStatus}</span>
                        </span>
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded">
                        {property.city}, {property.state}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl font-black text-gray-950 font-sans">
                            ${property.listPrice.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-emerald-800">
                            ${analysis.estimatedMonthlyHousingCost.totalMonthly.toLocaleString()}/mo total
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 mt-1 line-clamp-1">{property.title}</h4>
                        <p className="text-xs text-gray-500">{property.address}, {property.zip}</p>
                      </div>

                      {/* Financial Match Metrics */}
                      <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-gray-50 border border-gray-100 text-center text-xs">
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase font-bold">Front DTI</div>
                          <div className={`font-black ${analysis.frontEndDTI <= 28 ? 'text-emerald-700' : analysis.frontEndDTI <= 36 ? 'text-amber-700' : 'text-rose-700'}`}>
                            {analysis.frontEndDTI}%
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase font-bold">Back DTI</div>
                          <div className={`font-black ${analysis.backEndDTI <= 36 ? 'text-emerald-700' : analysis.backEndDTI <= 43 ? 'text-amber-700' : 'text-rose-700'}`}>
                            {analysis.backEndDTI}%
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase font-bold">Reserves</div>
                          <div className={`font-black ${analysis.reserveRunwayMonths >= 3 ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {analysis.reserveRunwayMonths} mos
                          </div>
                        </div>
                      </div>

                      {/* Explanation Snippet */}
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {analysis.summaryExplanation}
                      </p>

                      {/* Expanded Breakdown */}
                      {isExpanded && (
                        <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600 bg-gray-50/50 p-2.5 rounded-lg">
                          <div className="flex justify-between">
                            <span>Principal & Interest (6.625%):</span>
                            <span className="font-bold text-gray-900">${analysis.estimatedMonthlyHousingCost.principalAndInterest.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Property Tax (County rate):</span>
                            <span className="font-bold text-gray-900">${analysis.estimatedMonthlyHousingCost.propertyTax.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Hazard & Flood Insurance:</span>
                            <span className="font-bold text-gray-900">${analysis.estimatedMonthlyHousingCost.hazardInsurance.toLocaleString()}</span>
                          </div>
                          {analysis.estimatedMonthlyHousingCost.pmi > 0 && (
                            <div className="flex justify-between text-amber-700 font-semibold">
                              <span>Private Mortgage Insurance (PMI):</span>
                              <span>+${analysis.estimatedMonthlyHousingCost.pmi.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Maintenance Reserve:</span>
                            <span className="font-bold text-gray-900">${analysis.estimatedMonthlyHousingCost.maintenanceReserve.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-gray-200">
                            <span>Cash to Close (Down + Escrow):</span>
                            <span className="font-bold text-gray-900">${analysis.cashRequiredAtClosing.toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setExpandedPropertyId(isExpanded ? null : property.id)}
                      className="text-xs font-semibold text-gray-700 hover:text-gray-950 flex items-center space-x-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Cost Breakdown'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {!isComfortable ? (
                      <button
                        onClick={() => handleGenerateAdverseNotice(property)}
                        className="px-2.5 py-1 rounded bg-rose-100 text-rose-800 hover:bg-rose-200 text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                        title="Generate compliant FCRA § 615(a) adverse action notice for this incompatible listing"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Adverse Notice</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (onSelectProperty) onSelectProperty(property);
                          if (onNavigateTab) onNavigateTab('search');
                        }}
                        className="px-3 py-1 rounded bg-[#0C382E] text-white hover:bg-[#07251E] text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        <span>Inspect Home</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: WHAT-IF SIMULATOR */}
      {/* ========================================================================= */}
      {activeSubTab === 'simulator' && (
        <div className="space-y-6">
          {/* Header & Reset */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 flex items-center space-x-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                <span>Deterministic What-If Simulator</span>
              </span>
              <h2 className="text-xl font-black text-gray-950 mt-1 font-sans">
                Real-Time Credit Payoff & Purchasing Power Uplift
              </h2>
              <p className="text-xs text-gray-500">
                Adjust debt payoff, down payment, and monthly savings to immediately model score increases and newly qualified homes.
              </p>
            </div>
            <button
              onClick={() => {
                setPayoffAmount(0);
                setDownPaymentBoost(0);
                setMonthlySavingsBoost(0);
              }}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Baseline</span>
            </button>
          </div>

          {/* Interactive Sliders & Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sliders Panel */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
                Financial Levers & Interventions
              </h3>

              {/* Slider 1: Debt Payoff */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-700">Revolving Debt Payoff</span>
                  <span className="font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ${payoffAmount.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={profile.totalRevolvingBalance}
                  step={250}
                  value={payoffAmount}
                  onChange={(e) => setPayoffAmount(Number(e.target.value))}
                  className="w-full accent-[#0C382E] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>$0 (Current)</span>
                  <span>Pay Off All (${profile.totalRevolvingBalance.toLocaleString()})</span>
                </div>
              </div>

              {/* Slider 2: Down Payment Boost */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-700">Down Payment Capital Boost</span>
                  <span className="font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    +${downPaymentBoost.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50000}
                  step={2500}
                  value={downPaymentBoost}
                  onChange={(e) => setDownPaymentBoost(Number(e.target.value))}
                  className="w-full accent-[#0C382E] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>+$0</span>
                  <span>+$50,000</span>
                </div>
              </div>

              {/* Slider 3: Monthly Savings Boost */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-700">Monthly Savings Acceleration</span>
                  <span className="font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    +${monthlySavingsBoost.toLocaleString()}/mo
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={2000}
                  step={100}
                  value={monthlySavingsBoost}
                  onChange={(e) => setMonthlySavingsBoost(Number(e.target.value))}
                  className="w-full accent-[#0C382E] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>+$0/mo</span>
                  <span>+$2,000/mo</span>
                </div>
              </div>

              {/* Summary Impact Narrative */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-150 text-xs text-gray-700 space-y-1">
                <div className="font-bold text-gray-900 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Model Simulation Insight</span>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {whatIfResult.simulationNarrative}
                </p>
              </div>
            </div>

            {/* Results Comparison Panel */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900">
                  Simulated Impact vs. Current Baseline
                </h3>
                {whatIfResult.scoreDifference > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center space-x-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+{whatIfResult.scoreDifference} Score Uplift</span>
                  </span>
                )}
              </div>

              {/* KPI Comparison Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-800">Housing Score</span>
                  <div className="text-2xl font-black text-gray-950 mt-1">
                    {whatIfResult.projectedScore}
                  </div>
                  <div className="text-xs text-emerald-700 font-semibold mt-0.5">
                    Baseline: {whatIfResult.originalScore} (+{whatIfResult.scoreDifference} pts)
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200">
                  <span className="text-[10px] uppercase font-bold text-blue-800">Back-End DTI</span>
                  <div className="text-2xl font-black text-gray-950 mt-1">
                    {whatIfResult.projectedDTI}%
                  </div>
                  <div className="text-xs text-blue-700 font-semibold mt-0.5">
                    Baseline: {whatIfResult.originalDTI}% ({(whatIfResult.projectedDTI - whatIfResult.originalDTI).toFixed(1)}%)
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200">
                  <span className="text-[10px] uppercase font-bold text-purple-800">Credit Utilization</span>
                  <div className="text-2xl font-black text-gray-950 mt-1">
                    {whatIfResult.projectedUtilization}%
                  </div>
                  <div className="text-xs text-purple-700 font-semibold mt-0.5">
                    Baseline: {whatIfResult.originalUtilization}%
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[10px] uppercase font-bold text-gray-600">Max Purchase Price</span>
                  <div className="text-2xl font-black text-gray-950 mt-1">
                    ${(whatIfResult.projectedMaxPrice / 1000).toFixed(0)}k
                  </div>
                  <div className="text-xs text-gray-600 font-semibold mt-0.5">
                    +${((whatIfResult.projectedMaxPrice - whatIfResult.originalMaxPrice) / 1000).toFixed(0)}k buying power
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[10px] uppercase font-bold text-gray-600">Cash Reserves Left</span>
                  <div className="text-2xl font-black text-gray-950 mt-1">
                    ${(whatIfResult.projectedCashRemaining / 1000).toFixed(0)}k
                  </div>
                  <div className="text-xs text-gray-600 font-semibold mt-0.5">
                    Post-closing buffer
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-amber-800">Newly Unlocked Homes</span>
                  <div className="text-2xl font-black text-amber-950 mt-1">
                    {whatIfResult.newlyUnlockedHomesCount}
                  </div>
                  <div className="text-xs text-amber-700 font-semibold mt-0.5">
                    Turned into "Comfortable"
                  </div>
                </div>
              </div>

              {/* Newly Unlocked Homes List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Newly Unlocked DMV Inventory Under This Scenario ({unlockedProperties.length})</span>
                </h4>

                {unlockedProperties.length === 0 ? (
                  <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center text-xs text-gray-500">
                    Adjust the sliders above (e.g. pay off $3,000+ debt or add $15,000 down payment) to unlock homes previously classified as "Modeled Stretch" or "Incompatible".
                  </div>
                ) : (
                  <div className="space-y-2">
                    {unlockedProperties.map((prop) => (
                      <div key={prop.id} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          <img src={prop.photoUrl} alt={prop.title} className="w-12 h-10 object-cover rounded-md" />
                          <div>
                            <div className="font-bold text-gray-900">{prop.address}</div>
                            <div className="text-gray-500 text-[11px]">{prop.city}, {prop.state} • ${prop.listPrice.toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            🟢 Now Comfortable
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CONSENT & VERIFICATION VAULT */}
      {/* ========================================================================= */}
      {activeSubTab === 'consent' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Two-Sided Authorization & Provenance Architecture</span>
            </span>
            <h2 className="text-xl font-black text-gray-950 font-sans">
              Consent Vault & Regulatory Architecture (Model A vs B vs C)
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              TruePlace Housing Intelligence implements strict separation of consumer personal planning (Model A), marketplace pre-qualification (Model B), and formal tenant screening CRA decisioning (Model C) under the Fair Credit Reporting Act (15 U.S.C. § 1681 et seq.).
            </p>
          </div>

          {/* Model Architecture Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Active (Current Mode)
                </span>
                <span className="text-xs text-gray-400">Soft Inquiry</span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Model A: Personal Housing Planning</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Direct-to-consumer educational and financial readiness tool. Authorized solely by the applicant. Zero impact on credit score; invisible to external lenders or landlords.
              </p>
              <div className="pt-2 border-t border-gray-100 text-[11px] text-emerald-800 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Private to Jordan S. Miller</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  Pre-Qualification
                </span>
                <span className="text-xs text-gray-400">Marketplace</span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Model B: Marketplace Matcher</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Applicant chooses specific properties or institutional property managers with whom to share an anonymized pre-qualification passport prior to formal application fees.
              </p>
              <div className="pt-2 border-t border-gray-100 text-[11px] text-blue-800 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Zero Lead Auctioning (Ghost Mode)</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-purple-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                  Tenant Screening CRA
                </span>
                <span className="text-xs text-gray-400">§ 604 Compliant</span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Model C: Full CRA Tenant Screening</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                When a housing provider uses the report for leasing or underwriting decisions. Requires E-SIGN consent, FCRA § 604 written instructions, § 611 disputes, and § 615 notices.
              </p>
              <div className="pt-2 border-t border-gray-100 text-[11px] text-purple-800 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Full Statutory Safeguards Active</span>
              </div>
            </div>
          </div>

          {/* Active Consent Management Box */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
              Consumer Authorization Registry (E-SIGN & Written Instructions)
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-gray-900">FCRA § 604(a)(2) "Written Instructions of the Consumer"</span>
                    <span className="px-2 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {fcra604Consent ? 'Active & Signed' : 'Revoked'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    "I, Jordan S. Miller, hereby provide my written instructions pursuant to Section 604(a)(2) of the Fair Credit Reporting Act to TruePlace Intelligence CRA Inc. to access my consumer reporting files, tradelines, and banking records solely for evaluating housing qualification."
                  </p>
                  <div className="text-[11px] text-gray-400">
                    Consent Hash: <code>0x98f2...a1b4</code> • Signed: March 12, 2026, 14:22:01 EST
                  </div>
                </div>
                <button
                  onClick={() => setFcra604Consent(!fcra604Consent)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                    fcra604Consent ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {fcra604Consent ? 'Authorized' : 'Authorize'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-gray-900">E-SIGN Act Electronic Signature & Notice Disclosure</span>
                    <span className="px-2 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {esignConsent ? 'Consented' : 'Revoked'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Applicant agreed to receive all adverse action notices, dispute findings, and annual CRA disclosures electronically via encrypted PDF delivery.
                  </p>
                  <div className="text-[11px] text-gray-400">
                    Audit Token: <code>ESIGN-2026-JM-771</code> • IP: 198.51.100.44 (McLean, VA)
                  </div>
                </div>
                <button
                  onClick={() => setEsignConsent(!esignConsent)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                    esignConsent ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {esignConsent ? 'Consented' : 'Revoke'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-gray-900">Plaid Real-Time Asset & Cash Flow Token</span>
                    <span className="px-2 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {plaidSyncActive ? 'Connected (Navy Federal & Chase)' : 'Disconnected'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Read-only token enabling verification of liquid cash reserves ($69,250), average monthly cash deposits ($9,850), and 0 overdrafts over 12 months.
                  </p>
                </div>
                <button
                  onClick={() => setPlaidSyncActive(!plaidSyncActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                    plaidSyncActive ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {plaidSyncActive ? 'Synced' : 'Connect'}
                </button>
              </div>
            </div>
          </div>

          {/* Data Provenance Badges */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900">
              Verified Data Provenance & Cryptographic Attestation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-150 space-y-1">
                <span className="font-bold text-gray-800">TransUnion Soft File</span>
                <div className="text-[11px] text-gray-500">ID: TU-SP-991204</div>
                <div className="text-emerald-700 font-medium">Synced: 24h freshness</div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-150 space-y-1">
                <span className="font-bold text-gray-800">The Work Number (Equifax)</span>
                <div className="text-[11px] text-gray-500">W2 Gross: $132,000/yr</div>
                <div className="text-emerald-700 font-medium">Employer: Booz Allen / Systems</div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-150 space-y-1">
                <span className="font-bold text-gray-800">Maryland SDAT & Fairfax PLUS</span>
                <div className="text-[11px] text-gray-500">Deed & Tax Assessment</div>
                <div className="text-emerald-700 font-medium">30-Min Real Heartbeat</div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-150 space-y-1">
                <span className="font-bold text-gray-800">ID.me National Identity</span>
                <div className="text-[11px] text-gray-500">NIST SP 800-63-3 IAL2</div>
                <div className="text-emerald-700 font-medium">Biometric FaceMatch Pass</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: FCRA COMPLIANCE & DISPUTE CENTER */}
      {/* ========================================================================= */}
      {activeSubTab === 'compliance' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 flex items-center space-x-1.5">
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              <span>Statutory Consumer Protections & Governance</span>
            </span>
            <h2 className="text-xl font-black text-gray-950 font-sans">
              FCRA Dispute Resolution Center & § 615(a) Adverse Action Generator
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Full compliance with the Fair Credit Reporting Act (15 U.S.C. § 1681), the Equal Credit Opportunity Act (ECOA, 15 U.S.C. § 1691), and the Fair Housing Act. Every applicant possesses statutory rights to inspect files, dispute inaccurate data within 30 days, and receive formal written adverse action notices.
            </p>
          </div>

          {/* 30-Day Dispute Tracking Center */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  <span>FCRA § 611 Statutory 30-Day Dispute Resolution Tracker</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Consumer Reporting Agencies are mandated by federal law to reinvestigate disputed items within 30 calendar days.
                </p>
              </div>
              <button
                onClick={() => setShowDisputeModal(true)}
                className="px-3 py-1.5 rounded-lg bg-[#0C382E] text-white hover:bg-[#07251E] text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 shrink-0"
              >
                <span>+ File New Dispute</span>
              </button>
            </div>

            {disputes.length === 0 ? (
              <div className="p-6 rounded-xl bg-gray-50 text-center text-xs text-gray-500">
                No active disputes on file. All tradelines currently verified.
              </div>
            ) : (
              <div className="space-y-3">
                {disputes.map((disp) => (
                  <div key={disp.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900">{disp.tradelineCreditor}</span>
                        <span className="px-2 py-0.2 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                          {disp.status}
                        </span>
                        <span className="text-gray-400 text-[11px]">Ticket #{disp.id}</span>
                      </div>
                      <p className="text-gray-600">{disp.reason}</p>
                      <div className="text-[11px] text-gray-400">
                        Filed: {disp.submittedDate} • Statutory Resolution Due: {disp.resolutionDeadline}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-2xl font-black text-amber-600 font-sans">{disp.daysRemaining}</div>
                      <div className="text-[10px] text-gray-500 uppercase font-bold">Days Remaining in SLA</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Adverse Action Notice Generator Preview Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-rose-700" />
                  <span>FCRA § 615(a) Adverse Action Notice Engine</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Required when a landlord or housing provider takes adverse action based on consumer credit scoring.
                </p>
              </div>
              <button
                onClick={() => handleGenerateAdverseNotice(REAL_DMV_INVENTORY[7] || REAL_DMV_INVENTORY[0])}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 shrink-0"
              >
                <span>Demo Sample Adverse Notice</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 text-xs text-gray-700 space-y-2">
              <h4 className="font-bold text-rose-950 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Statutorily Mandated Disclosures Included in Generated Notices:</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 pl-1">
                <li>Identification of CRA (TruePlace Intelligence CRA Inc., phone, address, website).</li>
                <li>Affirmative statement that CRA did not make the decision and cannot explain landlord reasons.</li>
                <li>Right to request a free copy of the consumer report within 60 days (15 U.S.C. § 1681m).</li>
                <li>Right to dispute the accuracy or completeness of any information with the CRA (15 U.S.C. § 1681i).</li>
                <li>Key 4 principal factors that adversely affected the credit score.</li>
              </ul>
            </div>
          </div>

          {/* Fair Housing & Algorithmic Governance Log */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
              <Scale className="w-4 h-4 text-emerald-700" />
              <span>Fair Housing Act & Algorithmic Non-Discrimination Governance</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <h4 className="font-bold text-gray-900">Protected Class Exclusion Audit</h4>
                <p className="text-gray-600 leading-relaxed">
                  TruePlace's deterministic scoring engine strictly excludes race, color, religion, national origin, sex, disability, familial status, age, marital status, or receipt of public assistance (Housing Choice Vouchers / Section 8) as required under 42 U.S.C. § 3604 and 15 U.S.C. § 1691.
                </p>
                <div className="text-[11px] text-emerald-800 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Annual Disparate Impact Audit: Passed (Variance &lt; 0.02)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <h4 className="font-bold text-gray-900">100% Deterministic Mathematical Formulation</h4>
                <p className="text-gray-600 leading-relaxed">
                  To eliminate "black box" machine-learning drift and unexplainable denials, every point awarded or deducted is mapped directly to verifiable cash flow metrics, DTI ratios, on-time rent receipts, and public record filings.
                </p>
                <div className="text-[11px] text-emerald-800 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Explainability Guarantee: 100% SHAP Feature Transparency</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FILE DISPUTE */}
      {/* ========================================================================= */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">File FCRA § 611 Tradeline Dispute</h3>
                <p className="text-xs text-gray-500">Statutory 30-day reinvestigation workflow</p>
              </div>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDispute} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Select Disputed Account / Tradeline</label>
                <select
                  value={selectedDisputeTradeline}
                  onChange={(e) => setSelectedDisputeTradeline(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#0C382E]"
                >
                  {profile.tradelines.map((tl) => (
                    <option key={tl.id} value={tl.id}>
                      {tl.creditor} ({tl.type.toUpperCase()}) — Balance: ${tl.balance.toLocaleString()}
                    </option>
                  ))}
                  <option value="rental-ledger">Verified Rental Ledger (Landlord Reporting)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Dispute Reason</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#0C382E]"
                >
                  <option value="Inaccurate balance reported">Inaccurate balance reported</option>
                  <option value="Account paid in full / Closed">Account paid in full / Closed</option>
                  <option value="Late payment reported in error">Late payment reported in error</option>
                  <option value="Account does not belong to me (Identity verification)">Account does not belong to me (Identity verification)</option>
                  <option value="Duplicate reporting">Duplicate reporting</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Detailed Statement of Inaccuracy</label>
                <textarea
                  rows={3}
                  value={disputeExplanation}
                  onChange={(e) => setDisputeExplanation(e.target.value)}
                  placeholder="Provide supporting statement, statement date, or bank confirmation number..."
                  className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#0C382E]"
                  required
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 text-[11px] text-emerald-900 border border-emerald-200">
                Notice: TruePlace CRA will notify the furnishing creditor within 5 business days and resolve the dispute within 30 calendar days pursuant to 15 U.S.C. § 1681i.
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0C382E] hover:bg-[#07251E] text-white font-bold cursor-pointer"
                >
                  Submit Statutory Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADVERSE ACTION NOTICE PREVIEW */}
      {/* ========================================================================= */}
      {showNoticeModal && adverseNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-300 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Official Federal Notice</span>
                <h3 className="text-lg font-black text-gray-950">FCRA § 615(a) Statement of Adverse Action</h3>
                <p className="text-xs text-gray-500">Notice ID: {adverseNotice.noticeId}</p>
              </div>
              <button
                onClick={() => setShowNoticeModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-gray-800 leading-relaxed font-serif">
              <div className="grid grid-cols-2 gap-2 text-xs font-sans pb-3 border-b border-gray-100">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Applicant</span>
                  <span className="font-bold text-gray-900">{adverseNotice.applicantName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Date of Notice</span>
                  <span className="font-bold text-gray-900">{adverseNotice.dateGenerated}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Property Evaluated</span>
                  <span className="font-bold text-gray-900">{adverseNotice.propertyAddress}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Decision Maker</span>
                  <span className="font-bold text-gray-900">{adverseNotice.decisionMaker}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-1 font-sans">
                <span className="font-bold text-rose-900 uppercase text-[11px]">Action Taken:</span>
                <div className="font-bold text-sm text-rose-700">{adverseNotice.adverseActionTaken}</div>
              </div>

              <div>
                <h4 className="font-bold font-sans text-xs text-gray-900 mb-1.5">Key Principal Factors Affecting Credit Evaluation:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 pl-1 font-sans text-xs">
                  {adverseNotice.keyPrincipalFactors.map((factor, i) => (
                    <li key={i}>{factor}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-gray-100/70 border border-gray-200 space-y-2 font-sans text-[11px] text-gray-600">
                <h5 className="font-bold text-gray-800">Consumer Reporting Agency Disclosure:</h5>
                <p>{adverseNotice.fcraDisclosureText}</p>
                <div className="pt-2 border-t border-gray-200 space-y-0.5 text-gray-700 font-semibold">
                  <div>Agency: {adverseNotice.craIdentity.name}</div>
                  <div>Address: {adverseNotice.craIdentity.address}</div>
                  <div>Toll-Free Phone: {adverseNotice.craIdentity.tollFreePhone}</div>
                  <div>Online Dispute Portal: {adverseNotice.craIdentity.website}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Notice</span>
              </button>
              <button
                onClick={() => setShowNoticeModal(false)}
                className="px-5 py-2 rounded-lg bg-[#0C382E] hover:bg-[#07251E] text-white text-xs font-bold cursor-pointer"
              >
                Close Disclosure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
