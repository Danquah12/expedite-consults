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
  ShieldCheck
} from "lucide-react"
import { compensationCitiesData, CompensationCity } from "@/lib/nextgen-data"

export function CompensationCalculator() {
  const [baseSalary, setBaseSalary] = useState(210000)
  const [equityAnnual, setEquityAnnual] = useState(65000)
  const [bonusPercentage, setBonusPercentage] = useState(15)
  const [selectedHomeCity, setSelectedHomeCity] = useState<string>("New York")

  const bonusAmount = Math.round(baseSalary * (bonusPercentage / 100))
  const totalComp = baseSalary + equityAnnual + bonusAmount

  const homeCityData = compensationCitiesData.find(c => c.city === selectedHomeCity) || compensationCitiesData[0]
  const afterTaxEstimated = Math.round(totalComp * (1 - homeCityData.taxRateEstimated))

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-400/40">
              💰 ConnectIn Compensation Intelligence
            </span>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight">
              Total Compensation (TC) & Purchasing Power Simulator
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-teal-200 max-w-xl">
              Model base, equity grants, bonuses, and real take-home purchasing power across global tech hubs.
            </p>
          </div>

          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-xs text-center border border-white/10 min-w-[170px]">
            <p className="text-[11px] text-teal-200 font-semibold uppercase tracking-wider">
              Total Annual TC
            </p>
            <p className="text-3xl font-black text-emerald-300">
              ${totalComp.toLocaleString()}
            </p>
            <p className="text-[11px] text-teal-300 mt-0.5">
              ~${afterTaxEstimated.toLocaleString()} Take-Home
            </p>
          </div>
        </div>
      </div>

      {/* Sliders Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Base Salary Slider */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">Base Salary</span>
            <span className="font-mono text-base font-bold text-[#0A66C2]">
              ${baseSalary.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={90000}
            max={350000}
            step={5000}
            value={baseSalary}
            onChange={(e) => setBaseSalary(Number(e.target.value))}
            className="w-full accent-[#0A66C2]"
          />
          <div className="flex justify-between text-[10px] text-zinc-400">
            <span>$90k</span>
            <span>$350k</span>
          </div>
        </div>

        {/* Equity / RSUs Slider */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">Annual Equity / RSUs</span>
            <span className="font-mono text-base font-bold text-purple-600">
              ${equityAnnual.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={250000}
            step={5000}
            value={equityAnnual}
            onChange={(e) => setEquityAnnual(Number(e.target.value))}
            className="w-full accent-purple-600"
          />
          <div className="flex justify-between text-[10px] text-zinc-400">
            <span>$0</span>
            <span>$250k/yr</span>
          </div>
        </div>

        {/* Target Bonus Slider */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">Target Bonus ({bonusPercentage}%)</span>
            <span className="font-mono text-base font-bold text-emerald-600">
              +${bonusAmount.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={40}
            step={1}
            value={bonusPercentage}
            onChange={(e) => setBonusPercentage(Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
          <div className="flex justify-between text-[10px] text-zinc-400">
            <span>0%</span>
            <span>40%</span>
          </div>
        </div>
      </div>

      {/* Multi-City Purchasing Power Comparison Table */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-600" />
              Real Purchasing Power by City
            </h3>
            <p className="text-xs text-zinc-500">
              Normalized equivalent lifestyle value relative to New York baseline ($210k).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Tech Hub / Location</th>
                <th className="py-2.5 px-3">Est. Tax Rate</th>
                <th className="py-2.5 px-3">Take-Home Pay</th>
                <th className="py-2.5 px-3">Cost of Living</th>
                <th className="py-2.5 px-3 font-bold text-[#0A66C2]">Effective Purchasing Power</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {compensationCitiesData.map((city) => {
                const cityTakeHome = Math.round(totalComp * (1 - city.taxRateEstimated))
                const effectiveValue = Math.round(cityTakeHome * city.purchasingPowerFactor)

                return (
                  <tr key={city.city} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">{city.city}</p>
                      <p className="text-[10px] text-zinc-400">{city.stateOrCountry}</p>
                    </td>
                    <td className="py-3 px-3 text-zinc-600 dark:text-zinc-300">
                      {Math.round(city.taxRateEstimated * 100)}%
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                      ${cityTakeHome.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-zinc-600 dark:text-zinc-300">
                      {city.costOfLivingIndex}%
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        ${effectiveValue.toLocaleString()} / yr eq.
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
