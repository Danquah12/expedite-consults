"use client";

import React, { useState } from "react";
import { DollarSign, Clock, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

interface RoiCalculatorProps {
  defaults?: {
    agents: number;
    avgTransactions: number;
    complianceSavings: number;
  };
}

export const RoiCalculator: React.FC<RoiCalculatorProps> = ({ defaults }) => {
  const [agents, setAgents] = useState<number>(defaults?.agents || 45);
  const [avgDeals, setAvgDeals] = useState<number>(defaults?.avgTransactions || 12);
  const [hourlyRate, setHourlyRate] = useState<number>(65);

  // Derived Calculations
  const totalDeals = agents * avgDeals;
  const hoursSavedPerDeal = 3.5; // Hours saved by Standard Forms 2.0 & AI copilot
  const totalHoursSaved = Math.round(totalDeals * hoursSavedPerDeal);
  const directFinancialSavings = Math.round(totalHoursSaved * hourlyRate);
  const complianceRiskAvoidance = Math.round(totalDeals * 180); // Average error/omission dispute mitigation value
  const totalEconomicBenefit = directFinancialSavings + complianceRiskAvoidance;

  return (
    <div className="my-4 p-4 rounded-xl bg-slate-900/70 border border-slate-700/80 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <div className="text-[11px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Brokerage & Member Impact Modeling
          </div>
          <h4 className="text-sm font-semibold text-white mt-0.5">
            Adjust brokerage scale to project annual efficiency & compliance dividends
          </h4>
        </div>
        <div className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
          Ontario Standard Benchmark
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
          <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
            <span>Roster Agents:</span>
            <span className="font-bold text-emerald-400 font-mono">{agents} Realtors</span>
          </div>
          <input
            type="range"
            min="5"
            max="250"
            step="5"
            value={agents}
            onChange={(e) => setAgents(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Boutique (5)</span>
            <span>Mega (250)</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
          <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
            <span>Avg Deals / Agent:</span>
            <span className="font-bold text-blue-400 font-mono">{avgDeals} Deals</span>
          </div>
          <input
            type="range"
            min="4"
            max="35"
            step="1"
            value={avgDeals}
            onChange={(e) => setAvgDeals(Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Part-time (4)</span>
            <span>Top Producer (35)</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
          <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
            <span>Admin Cost / Hr:</span>
            <span className="font-bold text-purple-400 font-mono">${hourlyRate} / hr</span>
          </div>
          <input
            type="range"
            min="40"
            max="120"
            step="5"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Standard ($40)</span>
            <span>Senior Counsel ($120)</span>
          </div>
        </div>
      </div>

      {/* Output Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1 mb-1">
            <DollarSign className="w-3.5 h-3.5" />
            Total Value Created
          </div>
          <div className="text-xl font-extrabold text-white">
            ${totalEconomicBenefit.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-300/80 mt-0.5">Annualized ROI / Brokerage</div>
        </div>

        <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/30">
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1 mb-1">
            <Clock className="w-3.5 h-3.5" />
            Broker Hours Saved
          </div>
          <div className="text-xl font-extrabold text-white">
            {totalHoursSaved.toLocaleString()} hrs
          </div>
          <div className="text-[10px] text-blue-300/80 mt-0.5">{hoursSavedPerDeal} hrs saved per contract</div>
        </div>

        <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/30">
          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            TRESA Audit Peace
          </div>
          <div className="text-xl font-extrabold text-white">
            ${complianceRiskAvoidance.toLocaleString()}
          </div>
          <div className="text-[10px] text-purple-300/80 mt-0.5">Error & omission shield</div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Annual Deal Throughput
          </div>
          <div className="text-xl font-extrabold text-white">
            {totalDeals.toLocaleString()} deals
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Seamless standard transactions</div>
        </div>
      </div>
    </div>
  );
};
