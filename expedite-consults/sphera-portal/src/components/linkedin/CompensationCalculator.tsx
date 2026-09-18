"use client"

import React, { useState } from "react"
import {
  DollarSign,
  TrendingUp,
  MapPin,
  Building,
  Sliders,
  Calculator,
  Percent,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Layers,
  ChevronRight,
  Search,
  Award,
  Filter,
  CheckCircle2,
  FileText,
  Landmark,
  BadgePercent,
  PieChart,
  Scale,
  Users
} from "lucide-react"
import {
  SalaryInsightRole,
  LocalityComparison,
  SALARY_INSIGHTS_ROLES_DATA,
  LOCALITY_COMPARISONS_DATA
} from "@/lib/salary-insights-data"

interface CompensationCalculatorProps {
  onNavigateJobs?: (searchKeyword?: string) => void
}

export function CompensationCalculator({ onNavigateJobs }: CompensationCalculatorProps) {
  // Master Mode: Roles Intelligence vs Interactive Simulator vs Locality Comparison
  const [viewMode, setViewMode] = useState<'roles' | 'calculator' | 'locality'>('roles')

  // Roles Filter
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<SalaryInsightRole | null>(SALARY_INSIGHTS_ROLES_DATA[0])

  // Custom Simulator State
  const [customBase, setCustomBase] = useState<number>(185000)
  const [customBonusPercent, setCustomBonusPercent] = useState<number>(15)
  const [customEquity, setCustomEquity] = useState<number>(45000)
  const [customHasClearance, setCustomHasClearance] = useState<boolean>(true)
  const [selectedCityName, setSelectedCityName] = useState<string>('Washington, DC')

  const clearanceBonus = customHasClearance ? 25000 : 0
  const bonusDollar = Math.round(customBase * (customBonusPercent / 100))
  const totalComp = customBase + bonusDollar + customEquity + clearanceBonus

  const activeCity = LOCALITY_COMPARISONS_DATA.find(c => c.city === selectedCityName) || LOCALITY_COMPARISONS_DATA[0]
  const estimatedAfterTax = Math.round(totalComp * (1 - activeCity.taxRateEstimated))

  // Filter Roles
  const filteredRoles = SALARY_INSIGHTS_ROLES_DATA.filter(r => {
    const matchCategory = selectedCategory === 'All' || r.category === selectedCategory
    const matchSearch = !searchQuery || (
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.skillsDemand.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    return matchCategory && matchSearch
  })

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20">
      {/* 1. TOP HERO BANNER */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-slate-900 via-emerald-950 to-indigo-950 p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-amber-300" />
                ConnectIn Salary Insights & Compensation Intelligence
              </span>
              <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-xs font-bold text-sky-300 border border-sky-500/40">
                Base · Total Comp · Bonuses · Equity · GS Pay · C2C · W2
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Real-Time Compensation, C2C Rates & Locality Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Explore verified market salary medians, contractor Corp-to-Corp rates, W2 consulting bands, government General Schedule (GS) scales, and security clearance premiums.
            </p>
          </div>

          {/* Quick TC Metric & Flywheel CTA */}
          <div className="rounded-2xl bg-black/40 border border-white/15 p-4 text-center min-w-[200px] shrink-0">
            <span className="text-[10px] uppercase font-mono text-emerald-300">Market Top Percentile (90th)</span>
            <p className="text-2xl sm:text-3xl font-black text-white">$385K+ <span className="text-xs text-emerald-400 font-normal">TC</span></p>
            <p className="text-[11px] text-zinc-400 mt-0.5">ISSE & Principal Cloud Defense</p>
          </div>
        </div>

        {/* 3 Master Modes Switcher */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setViewMode('roles')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                viewMode === 'roles'
                  ? "bg-white text-zinc-950 shadow-md font-extrabold"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5 text-[#0A66C2]" />
              <span>Job Title Insights & Pay Bands ({SALARY_INSIGHTS_ROLES_DATA.length})</span>
            </button>

            <button
              onClick={() => setViewMode('calculator')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                viewMode === 'calculator'
                  ? "bg-white text-zinc-950 shadow-md font-extrabold"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              <Calculator className="h-3.5 w-3.5 text-emerald-600" />
              <span>Interactive TC Simulator</span>
            </button>

            <button
              onClick={() => setViewMode('locality')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                viewMode === 'locality'
                  ? "bg-white text-zinc-950 shadow-md font-extrabold"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              <MapPin className="h-3.5 w-3.5 text-purple-500" />
              <span>Locality & Purchasing Power</span>
            </button>
          </div>
        </div>

        {/* Categories Ribbon (Visible in Roles Mode) */}
        {viewMode === 'roles' && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 shrink-0 mr-1">
              Filter Track:
            </span>
            {['All', 'GovTech & Defense', 'Cybersecurity', 'Cloud & DevOps', 'Executive & Leadership'].map((cat) => {
              const isSelected = selectedCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all shrink-0 ${
                    isSelected
                      ? "bg-emerald-400 text-zinc-950 font-bold shadow-xs"
                      : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: SALARY INSIGHTS BY JOB TITLE & COMPENSATION MATRIX */}
      {/* ========================================================================= */}
      {viewMode === 'roles' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between gap-3">
            <div className="relative flex-1 flex items-center rounded-lg bg-zinc-50 px-3 py-2 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800/80">
              <Search className="h-4 w-4 text-zinc-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search ISSE, Cloud Security Architect, DevSecOps, CISO, C2C contractor rates, GS pay..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100"
              />
            </div>
            <span className="text-xs text-zinc-500 font-semibold shrink-0">
              {filteredRoles.length} compensation profiles
            </span>
          </div>

          {/* Role Compensation Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRoles.map((role) => (
              <div
                key={role.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-emerald-500 hover:shadow-lg transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Role Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                        {role.category}
                      </span>
                      <h3 className="font-black text-base sm:text-lg text-zinc-900 dark:text-zinc-100 leading-snug mt-1">
                        {role.title}
                      </h3>
                      <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        <span>{role.location}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-zinc-400 uppercase font-mono block">Median Base</span>
                      <span className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                        ${(role.medianBase / 1000).toFixed(0)}K
                      </span>
                      <span className="text-[11px] text-zinc-500 block">
                        Range: ${(role.rangeBase.min / 1000).toFixed(0)}K–${(role.rangeBase.max / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>

                  {/* 4-Column Compensation Breakdown Box */}
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold">Total Comp</span>
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        ${(role.medianTotalComp / 1000).toFixed(0)}K
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold">C2C Rate</span>
                      <p className="text-sm font-black text-purple-600 dark:text-purple-400">
                        ${role.c2cRateHourly.median}/hr
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold">W2 Rate</span>
                      <p className="text-sm font-black text-sky-600 dark:text-sky-400">
                        ${role.w2RateHourly.median}/hr
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold">Clearance Bonus</span>
                      <p className="text-sm font-black text-amber-600 dark:text-amber-400">
                        +${(role.clearancePremiumBonus / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>

                  {/* Government GS Grade Equivalent */}
                  <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-xs dark:bg-blue-950/20 dark:border-blue-900/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                        <Landmark className="h-3.5 w-3.5" />
                        Federal Gov GS Equivalent: {role.governmentGSEquivalent.grade} ({role.governmentGSEquivalent.step})
                      </span>
                      <span className="font-mono font-bold text-blue-800 dark:text-blue-300">
                        ${role.governmentGSEquivalent.totalFederalPay.toLocaleString()} / yr
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-700/80 dark:text-blue-400">
                      Locality: {role.governmentGSEquivalent.localityAdjustment}
                    </p>
                  </div>

                  {/* Top Paying Companies */}
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-bold uppercase text-zinc-400">Top Paying Companies:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {role.topPayingCompanies.map((comp) => (
                        <span
                          key={comp.name}
                          className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
                        >
                          {comp.name}: <strong>{comp.avgTC}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Direct Strategic Flywheel back to Jobs */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-semibold">
                    {role.matchingJobsCount} verified open roles
                  </span>

                  <button
                    onClick={() => onNavigateJobs && onNavigateJobs(role.title)}
                    className="rounded-full bg-[#0A66C2] hover:bg-[#004182] px-4 py-1.5 font-bold text-white transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <span>View Jobs Matching This Pay</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: INTERACTIVE TC & TAKE-HOME SIMULATOR */}
      {/* ========================================================================= */}
      {viewMode === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sliders className="h-5 w-5 text-[#0A66C2]" />
              <span>Configure Your Package Variables</span>
            </h3>

            {/* Base Salary Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold">Annual Base Salary</span>
                <span className="font-mono text-base font-black text-[#0A66C2]">
                  ${customBase.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={100000}
                max={400000}
                step={5000}
                value={customBase}
                onChange={(e) => setCustomBase(Number(e.target.value))}
                className="w-full accent-[#0A66C2]"
              />
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>$100k</span>
                <span>$400k</span>
              </div>
            </div>

            {/* Annual Bonus Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold">Annual Performance / Sign-On Bonus</span>
                <span className="font-mono text-base font-black text-amber-600">
                  {customBonusPercent}% (${bonusDollar.toLocaleString()})
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={2}
                value={customBonusPercent}
                onChange={(e) => setCustomBonusPercent(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Annual Equity Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold">Annual Equity / RSUs Grant Value</span>
                <span className="font-mono text-base font-black text-purple-600">
                  ${customEquity.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={250000}
                step={5000}
                value={customEquity}
                onChange={(e) => setCustomEquity(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>

            {/* Security Clearance Toggle & City Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold">Active Security Clearance</p>
                  <p className="text-[11px] text-zinc-500">TS/SCI Poly Premium (+$25k)</p>
                </div>
                <input
                  type="checkbox"
                  checked={customHasClearance}
                  onChange={(e) => setCustomHasClearance(e.target.checked)}
                  className="h-4 w-4 accent-emerald-600 rounded"
                />
              </div>

              <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800 space-y-1 text-xs">
                <label className="font-bold">Metro Tax Hub</label>
                <select
                  value={selectedCityName}
                  onChange={(e) => setSelectedCityName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-1.5 dark:bg-zinc-800 dark:border-zinc-700 text-xs font-semibold"
                >
                  {LOCALITY_COMPARISONS_DATA.map(c => (
                    <option key={c.city} value={c.city}>{c.city}, {c.state}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="lg:col-span-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 to-emerald-950 p-6 text-white shadow-xl flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <span className="rounded-full bg-emerald-500/30 px-3 py-0.5 text-xs font-bold text-emerald-200 border border-emerald-400/40">
                Calculated Total Compensation (TC)
              </span>

              <div>
                <p className="text-4xl font-black text-emerald-300">${totalComp.toLocaleString()}</p>
                <p className="text-xs text-zinc-300 mt-1">
                  Estimated Take-Home (After ~{Math.round(activeCity.taxRateEstimated * 100)}% Tax in {activeCity.city}):
                </p>
                <p className="text-2xl font-bold text-white mt-0.5">
                  ~${estimatedAfterTax.toLocaleString()} / yr
                  <span className="text-xs text-zinc-400 font-normal ml-2">
                    (${Math.round(estimatedAfterTax / 12).toLocaleString()} / mo)
                  </span>
                </p>
              </div>

              <div className="rounded-xl bg-black/40 border border-white/10 p-3 text-xs space-y-2">
                <div className="flex justify-between">
                  <span>Base Salary:</span>
                  <span className="font-bold font-mono">${customBase.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bonus:</span>
                  <span className="font-bold font-mono text-amber-300">${bonusDollar.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Equity (RSUs):</span>
                  <span className="font-bold font-mono text-purple-300">${customEquity.toLocaleString()}</span>
                </div>
                {customHasClearance && (
                  <div className="flex justify-between text-emerald-300">
                    <span>Clearance Bonus:</span>
                    <span className="font-bold font-mono">+$25,000</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => onNavigateJobs && onNavigateJobs('Security Architect')}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 py-3 text-xs sm:text-sm font-extrabold text-white shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Explore High-Paying Jobs (${totalComp.toLocaleString()}+ TC)</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: LOCALITY & PURCHASING POWER BENCHMARK */}
      {/* ========================================================================= */}
      {viewMode === 'locality' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 p-6 text-white shadow-xl space-y-2">
            <span className="rounded-full bg-purple-500/30 px-3 py-0.5 text-xs font-bold text-purple-200 border border-purple-400/40">
              Metro Locality & Purchasing Power Benchmark
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Cost of Living Multipliers & Locality Adjustments
            </h2>
            <p className="text-xs sm:text-sm text-purple-100 max-w-2xl leading-relaxed">
              Compare how the same nominal salary translates across major tech & defense hubs based on local tax rates, rent indices, and federal locality scales.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {LOCALITY_COMPARISONS_DATA.map((loc) => (
              <div
                key={loc.city}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-purple-600" />
                    {loc.city}
                  </h3>
                  <span className="text-xs text-zinc-400 font-medium">{loc.state}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-500">Median Tech Salary:</span>
                    <strong className="text-zinc-900 dark:text-zinc-100">${loc.medianTechSalary.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-500">Cost of Living Index:</span>
                    <strong>{loc.costOfLivingIndex} (US Avg: 100)</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-500">Federal Locality Add-On:</span>
                    <strong className="text-emerald-600">+{loc.localityAdjustmentPercent}%</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500">Effective Tax Rate:</span>
                    <strong className="text-amber-600">~{Math.round(loc.taxRateEstimated * 100)}%</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
