'use client';

import React from 'react';
import { Property } from '../mockData';
import { ShieldCheck, HelpCircle, ArrowUpRight, Wrench, Sparkles, CheckCircle } from 'lucide-react';

interface TrueValueCardProps {
  property: Property;
  onViewExplainability: () => void;
  onLaunchWhatIf: () => void;
}

export const TrueValueCard: React.FC<TrueValueCardProps> = ({
  property,
  onViewExplainability,
  onLaunchWhatIf,
}) => {
  const formattedEstimate = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.trueValue);

  const formattedLow = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.rangeLow);

  const formattedHigh = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.rangeHigh);

  // Difference vs neighborhood base
  const delta = property.trueValue - property.baseValue;
  const formattedDelta = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.abs(delta));

  return (
    <div className="bg-[#F5EDE1] border border-[#D5C7B2] rounded-xl p-5 shadow-sm text-gray-900 transition-all hover:shadow-md">
      {/* Top Header & Verification Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E3D7C5]">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#004D40] bg-[#004D40]/10 px-2 py-0.5 rounded">
            TrueValue™ Engine
          </span>
          <span className="flex items-center space-x-1 text-xs text-emerald-700 bg-emerald-100 font-semibold px-2 py-0.5 rounded">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Verified Active ({property.lastVerifiedHoursAgo}h)</span>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200">
            MLS: {property.mlsId}
          </span>
          <span className="text-xs font-bold text-[#004D40] bg-[#004D40]/15 px-2 py-0.5 rounded border border-[#004D40]/20 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#004D40]" />
            <span>Truth Score: {property.truthScore}/100</span>
          </span>
        </div>
      </div>

      {/* Main Valuation Display */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4 items-center">
        {/* Price & Range Column */}
        <div className="md:col-span-7">
          <div className="text-xs font-medium text-gray-600 uppercase tracking-wider">
            Official TrueValue™ Benchmark
          </div>
          <div className="flex items-baseline space-x-3 mt-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#004D40] tracking-tight font-sans">
              {formattedEstimate}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
              +{formattedDelta} vs Comps
            </span>
          </div>
          
          <div className="text-xs text-gray-600 mt-2 flex items-center space-x-2">
            <span>Estimated Range:</span>
            <strong className="text-gray-900 font-semibold">{formattedLow} – {formattedHigh}</strong>
            <span className="text-gray-400">|</span>
            <span>List: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(property.listPrice)}</span>
          </div>

          {/* Confidence Meter */}
          <div className="mt-4 bg-white/70 p-3 rounded-lg border border-[#E3D7C5]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-gray-700 flex items-center space-x-1">
                <span>Model Confidence</span>
                <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
              </span>
              <span className="font-bold text-[#004D40]">
                {property.confidence}% (Very High)
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#2A9D8F] h-full rounded-full transition-all duration-700"
                style={{ width: `${property.confidence}%` }}
              />
            </div>
            <div className="text-[11px] text-gray-500 mt-1.5 flex justify-between">
              <span>Backed by 14 recent micro-comps</span>
              <span>MAPE: 3.4% (Certified)</span>
            </div>
          </div>
        </div>

        {/* Mini Donut Chart & Category Breakdown Column */}
        <div className="md:col-span-5 bg-white p-3.5 rounded-lg border border-[#E3D7C5] flex flex-col justify-between h-full">
          <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Value Composition (SHAP)</span>
            <span className="text-[10px] text-gray-500 font-normal">Layer 7</span>
          </div>

          {/* Mini Donut Representation */}
          <div className="flex items-center space-x-3 my-1">
            <svg className="w-18 h-18 shrink-0 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="4" />
              {/* Comps 42% */}
              <circle
                cx="18" cy="18" r="14" fill="none" stroke="#004D40" strokeWidth="4"
                strokeDasharray="36.9 88" strokeDashoffset="0"
              />
              {/* Specs 23% */}
              <circle
                cx="18" cy="18" r="14" fill="none" stroke="#1D3557" strokeWidth="4"
                strokeDasharray="20.2 88" strokeDashoffset="-36.9"
              />
              {/* Reno 15% */}
              <circle
                cx="18" cy="18" r="14" fill="none" stroke="#E07A5F" strokeWidth="4"
                strokeDasharray="13.2 88" strokeDashoffset="-57.1"
              />
              {/* Trends 9% */}
              <circle
                cx="18" cy="18" r="14" fill="none" stroke="#2A9D8F" strokeWidth="4"
                strokeDasharray="7.9 88" strokeDashoffset="-70.3"
              />
              {/* Market 6% */}
              <circle
                cx="18" cy="18" r="14" fill="none" stroke="#6A4C93" strokeWidth="4"
                strokeDasharray="5.3 88" strokeDashoffset="-78.2"
              />
              {/* Risk 5% */}
              <circle
                cx="18" cy="18" r="14" fill="none" stroke="#E76F51" strokeWidth="4"
                strokeDasharray="4.4 88" strokeDashoffset="-83.5"
              />
            </svg>

            <div className="text-[11px] space-y-0.5 text-gray-700 leading-tight w-full">
              <div className="flex justify-between items-center">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-[#004D40]"></span>
                  <span>Comps</span>
                </span>
                <strong className="text-gray-900">42%</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-[#1D3557]"></span>
                  <span>Specs</span>
                </span>
                <strong className="text-gray-900">23%</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-[#E07A5F]"></span>
                  <span>Reno & Condition</span>
                </span>
                <strong className="text-gray-900">15%</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-[#2A9D8F]"></span>
                  <span>Neighborhood</span>
                </span>
                <strong className="text-gray-900">9%</strong>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-gray-500 pt-2 border-t border-gray-100 italic">
            Exact additive decomposition guaranteed by cooperative game theory.
          </div>
        </div>
      </div>

      {/* Key Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-3 mt-4 pt-3 border-t border-[#E3D7C5]">
        <button
          onClick={onLaunchWhatIf}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-white border border-[#004D40]/30 text-[#004D40] text-xs font-semibold hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
        >
          <Wrench className="w-3.5 h-3.5 text-[#E07A5F]" />
          <span>Launch What-If Simulator</span>
        </button>
        <button
          onClick={onViewExplainability}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#004D40] text-white text-xs font-semibold hover:bg-[#00382E] transition-colors shadow-xs cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E07A5F]" />
          <span>See Full Mathematical Explanation</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-gray-300" />
        </button>
      </div>
    </div>
  );
};
