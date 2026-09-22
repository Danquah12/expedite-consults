'use client';

import React from 'react';
import { Property } from '../mockData';
import {
  ShieldAlert,
  Activity,
  HeartPulse,
  Flame,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface PropertyHealthCardProps {
  property: Property;
}

export const PropertyHealthCard: React.FC<PropertyHealthCardProps> = ({ property }) => {
  const hs = property.healthScores;

  const categories = [
    {
      name: 'Structural Health',
      score: hs.structural,
      weight: '25%',
      desc: 'Foundation settlement, load-bearing framing, masonry repointing, and exterior envelope.',
    },
    {
      name: 'Mechanical & Systems Health',
      score: hs.systems,
      weight: '25%',
      desc: 'HVAC age, electrical service amperage, copper/PEX plumbing, and water heater lifecycle.',
    },
    {
      name: 'Energy Efficiency',
      score: hs.energy,
      weight: '20%',
      desc: 'Attic insulation R-value, low-E triple pane glazing, heat pump efficiency, and solar readiness.',
    },
    {
      name: 'Physical & Climate Risk',
      score: hs.risk,
      weight: '15%',
      desc: '100-year flood zone elevation, storm surge resilience, and drainage slope grading.',
    },
    {
      name: 'Maintenance Diligence',
      score: hs.maintenance,
      weight: '15%',
      desc: 'Permitted vs unpermitted renovation history, preventative maintenance compliance.',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#0C382E] flex items-center space-x-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
            <span>Comprehensive Asset Diagnostics</span>
          </span>
          <h2 className="text-xl font-black text-gray-950 tracking-tight mt-0.5">
            Property Health Score™ (0–100 Index)
          </h2>
          <p className="text-xs text-gray-500 max-w-xl mt-0.5">
            Unlike superficial listing descriptions, the Property Health Score audits structural, mechanical, energy, and risk factors using municipal permits and engineering age-depreciation curves.
          </p>
        </div>

        {/* Big Overall Composite Score Ring */}
        <div className="flex items-center space-x-4 bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl shrink-0">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#E2E8F0"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#0C382E"
                strokeWidth="5"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - hs.overall / 100)}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xl font-black text-[#0C382E]">
              {hs.overall}
            </span>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">
              Overall Health Index
            </div>
            <div className="text-sm font-black text-emerald-800">Certified Pristine</div>
            <div className="text-[10px] text-emerald-700">Top 5% of Northern Virginia</div>
          </div>
        </div>
      </div>

      {/* 5 Dimensional Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-900">{cat.name}</span>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-gray-500 font-semibold">Weight: {cat.weight}</span>
                <span className="font-black text-[#0C382E] text-sm">{cat.score}/100</span>
              </div>
            </div>

            {/* Score Progress Bar */}
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#0C382E] h-full rounded-full transition-all duration-500"
                style={{ width: `${cat.score}%` }}
              />
            </div>

            <p className="text-[11px] text-gray-500 leading-normal">{cat.desc}</p>
          </div>
        ))}
      </div>

      {/* Buyer Risk Radar™ (Feature 36) */}
      <div className="pt-4 border-t border-gray-150 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
              <span>Buyer Risk Radar™</span>
            </span>
            <h3 className="text-base font-bold text-gray-900">
              Downside & Environmental Risk Exposure
            </h3>
          </div>

          <div className="bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl flex items-center space-x-2 self-start sm:self-auto">
            <span className="text-[10px] uppercase font-bold text-emerald-800">Overall Risk Index:</span>
            <span className="text-sm font-black text-[#0C382E]">22 / 100</span>
            <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-mono font-bold">
              LOW RISK
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 space-y-1">
            <span className="text-[10px] text-gray-500 font-bold block uppercase">Flood Risk</span>
            <span className="font-black text-gray-900 text-sm">12 / 100</span>
            <span className="text-[10px] text-emerald-700 block font-medium">Zone X Minimal</span>
          </div>

          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 space-y-1">
            <span className="text-[10px] text-gray-500 font-bold block uppercase">Foundation Risk</span>
            <span className="font-black text-gray-900 text-sm">18 / 100</span>
            <span className="text-[10px] text-emerald-700 block font-medium">Stable Sub-Slab</span>
          </div>

          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 space-y-1">
            <span className="text-[10px] text-gray-500 font-bold block uppercase">Insurance Risk</span>
            <span className="font-black text-gray-900 text-sm">24 / 100</span>
            <span className="text-[10px] text-emerald-700 block font-medium">Standard Hazard</span>
          </div>

          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 space-y-1">
            <span className="text-[10px] text-gray-500 font-bold block uppercase">Traffic Risk</span>
            <span className="font-black text-gray-900 text-sm">19 / 100</span>
            <span className="text-[10px] text-emerald-700 block font-medium">Low Cut-Through</span>
          </div>

          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 space-y-1">
            <span className="text-[10px] text-gray-500 font-bold block uppercase">School Stability</span>
            <span className="font-black text-gray-900 text-sm">14 / 100</span>
            <span className="text-[10px] text-emerald-700 block font-medium">FCPS Boundary Safe</span>
          </div>

          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 space-y-1">
            <span className="text-[10px] text-gray-500 font-bold block uppercase">Market Downside</span>
            <span className="font-black text-gray-900 text-sm">20 / 100</span>
            <span className="text-[10px] text-emerald-700 block font-medium">Tech & Gov Buffer</span>
          </div>
        </div>
      </div>
    </div>
  );
};
