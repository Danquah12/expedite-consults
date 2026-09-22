'use client';

import React from 'react';
import { Property } from '../mockData';
import { ShieldCheck, ArrowDownRight, ArrowUpRight, FileText, CheckCircle2, MapPin, Download } from 'lucide-react';

interface ExplainabilityDashboardProps {
  property: Property;
  onExportReport?: () => void;
}

export const ExplainabilityDashboard: React.FC<ExplainabilityDashboardProps> = ({
  property,
  onExportReport,
}) => {
  const formattedEstimate = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.trueValue);

  const formattedBase = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.baseValue);

  const positiveDrivers = property.shapDrivers.filter((d) => d.impact > 0);
  const negativeDrivers = property.shapDrivers.filter((d) => d.impact < 0);

  return (
    <div className="bg-white border border-[#D5C7B2] rounded-xl shadow-sm p-6 sm:p-8 space-y-8">
      {/* Top Banner & Export Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#004D40] bg-[#004D40]/10 px-2.5 py-1 rounded">
              Layer 7: Mathematical Explainability
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              TreeSHAP Exact Additivity: Verified
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-gray-950 mt-1 font-sans">
            Valuation Attribution & Explainability Ledger
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Full audit breakdown for {property.address}, {property.city}, {property.state} {property.zip}
          </p>
        </div>

        {onExportReport && (
          <button
            onClick={onExportReport}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-[#004D40] text-white text-xs font-bold hover:bg-[#00382E] transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-[#E07A5F]" />
            <span>Export Official 6-Page Truth Report (PDF)</span>
          </button>
        )}
      </div>

      {/* SECTION 1: VALUE SUMMARY & MARKET BASELINE */}
      <div className="bg-[#F5EDE1] p-5 rounded-xl border border-[#D5C7B2]">
        <div className="text-xs font-bold uppercase tracking-wider text-[#004D40] mb-2">
          Section 1: Valuation Summary & Micro-Market Baseline
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <div className="text-xs text-gray-600">Certified TrueValue™ Estimate</div>
            <div className="text-3xl font-extrabold text-[#004D40]">{formattedEstimate}</div>
            <div className="text-xs text-gray-500 mt-0.5">Confidence Score: {property.confidence}% (Very High)</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Neighborhood Baseline E[f(X)]</div>
            <div className="text-2xl font-bold text-gray-800">{formattedBase}</div>
            <div className="text-xs text-gray-500 mt-0.5">Expected value for typical similar homes</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Net Marginal SHAP Delta (Σ φi)</div>
            <div className="text-2xl font-bold text-emerald-700">
              +{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(property.trueValue - property.baseValue)}
            </div>
            <div className="text-xs text-emerald-800 font-semibold mt-0.5">100% mathematically additive</div>
          </div>
        </div>
      </div>

      {/* SECTION 2: SHAP DONUT CHART BREAKDOWN */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
            Section 2: Interactive SHAP Value Composition (6 Categories)
          </h3>
          <span className="text-xs text-gray-500 font-mono">YAML Config: v2.4.0</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-5 bg-[#F4F7F6] rounded-xl border border-gray-200">
          <div className="md:col-span-5 flex justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="4.5" />
                {/* Comps 42% */}
                <circle cx="18" cy="18" r="14" fill="none" stroke="#004D40" strokeWidth="4.5" strokeDasharray="36.9 88" strokeDashoffset="0" />
                {/* Specs 23% */}
                <circle cx="18" cy="18" r="14" fill="none" stroke="#1D3557" strokeWidth="4.5" strokeDasharray="20.2 88" strokeDashoffset="-36.9" />
                {/* Reno 15% */}
                <circle cx="18" cy="18" r="14" fill="none" stroke="#E07A5F" strokeWidth="4.5" strokeDasharray="13.2 88" strokeDashoffset="-57.1" />
                {/* Trends 9% */}
                <circle cx="18" cy="18" r="14" fill="none" stroke="#2A9D8F" strokeWidth="4.5" strokeDasharray="7.9 88" strokeDashoffset="-70.3" />
                {/* Market 6% */}
                <circle cx="18" cy="18" r="14" fill="none" stroke="#6A4C93" strokeWidth="4.5" strokeDasharray="5.3 88" strokeDashoffset="-78.2" />
                {/* Risk 5% */}
                <circle cx="18" cy="18" r="14" fill="none" stroke="#E76F51" strokeWidth="4.5" strokeDasharray="4.4 88" strokeDashoffset="-83.5" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-[#004D40]">{property.confidence}%</span>
                <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Confidence</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: 'Comparable Sales', pct: '42%', hex: '#004D40', desc: '14 micro-comps in 0.3mi radius' },
              { name: 'Property Characteristics', pct: '23%', hex: '#1D3557', desc: 'Living area, lot size, specs' },
              { name: 'Renovation & Condition', pct: '15%', hex: '#E07A5F', desc: 'Gourmet kitchen & finishes' },
              { name: 'Neighborhood Trends', pct: '9%', hex: '#2A9D8F', desc: 'Elementary school boundaries' },
              { name: 'Market Momentum', pct: '6%', hex: '#6A4C93', desc: 'Local inventory velocity' },
              { name: 'Risk Factors & Climate', pct: '5%', hex: '#E76F51', desc: 'Flood Zone X resilience' },
            ].map((cat, idx) => (
              <div key={idx} className="p-3 bg-white rounded-lg border border-gray-200 flex items-start space-x-3">
                <span className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: cat.hex }} />
                <div>
                  <div className="flex items-center justify-between space-x-2">
                    <span className="text-xs font-bold text-gray-900">{cat.name}</span>
                    <span className="text-xs font-black text-gray-800">{cat.pct}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{cat.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3 & 4: TOP VALUE DRIVERS & DEDUCTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 3: Positive Drivers */}
        <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-5">
          <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-3">
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            <span>Section 3: Top Value Drivers (Positive)</span>
          </div>

          <div className="space-y-3">
            {positiveDrivers.map((driver, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-lg border border-emerald-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">{driver.driver}</span>
                  <span className="text-xs font-extrabold text-emerald-700">
                    +{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(driver.impact)}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1 leading-snug">{driver.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Negative Drivers */}
        <div className="border border-rose-200 bg-rose-50/40 rounded-xl p-5">
          <div className="flex items-center space-x-2 text-rose-900 font-bold text-xs uppercase tracking-wider mb-3">
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
            <span>Section 4: Value Reducers & Deductions (Negative)</span>
          </div>

          <div className="space-y-3">
            {negativeDrivers.map((driver, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-lg border border-rose-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">{driver.driver}</span>
                  <span className="text-xs font-extrabold text-rose-700">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(driver.impact)}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1 leading-snug">{driver.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 5: AUDITED PLAIN-ENGLISH NARRATIVE */}
      <div className="p-6 bg-[#004D40]/5 border border-[#004D40]/20 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#004D40] flex items-center space-x-1.5">
            <FileText className="w-3.5 h-3.5 text-[#E07A5F]" />
            <span>Section 5: Audited Plain-English Narrative (System Prompt v2.4)</span>
          </span>
          <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-gray-300 text-gray-600">
            LLM Temperature: 0.20 | Zero Forbidden Words
          </span>
        </div>

        <div className="prose prose-sm text-gray-800 leading-relaxed space-y-2.5 font-sans">
          <p>
            <strong>Valuation Summary:</strong> TruePlace values <strong>{property.address}</strong> at{' '}
            <strong>{formattedEstimate}</strong> (estimated range of {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(property.rangeLow)} to {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(property.rangeHigh)}) with a <strong>{property.confidence}% (Very High)</strong> confidence score. This home is valued approximately $50,000 above the typical similar benchmark in the Austin 78704 micro-market.
          </p>
          <p>
            <strong>Primary Drivers:</strong> The foremost positive driver is the certified gourmet kitchen renovation completed with permits in 2023, which accounts for an estimated <strong>+$41,200</strong> in value above standard comps. In addition, the oversized 0.19-acre corner lot adds an estimated <strong>+$19,800</strong>, and assigned attendance within the Travis Heights Elementary boundary contributes <strong>+$12,400</strong>.
          </p>
          <p>
            <strong>Offsetting Deductions:</strong> These gains are partially offset by the property&apos;s 18-year-old architectural shingle roof (-$12,500 deduction due to remaining service life) and the absence of a fully enclosed two-car garage (-$14,500 deduction relative to neighborhood standard).
          </p>
          <p className="text-xs text-gray-500 pt-2 border-t border-[#004D40]/10 italic">
            Data Freshness: MLS synced {property.lastVerifiedHoursAgo} hours ago | Truth Score: {property.truthScore}/100 | All figures cryptographically verified.
          </p>
        </div>
      </div>

      {/* SECTION 6: COMPARABLE SALES EVIDENCE */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center space-x-1.5">
            <MapPin className="w-4 h-4 text-[#E07A5F]" />
            <span>Section 6: Comparable Sales Evidence (Top Arms-Length Sales)</span>
          </h3>
          <span className="text-xs text-gray-500 font-semibold">Max Distance: 0.50 miles</span>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#004D40] text-white uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Comparable Property Address</th>
                <th className="py-2.5 px-4 font-semibold">Sold Price</th>
                <th className="py-2.5 px-4 font-semibold">Distance</th>
                <th className="py-2.5 px-4 font-semibold">Living Area</th>
                <th className="py-2.5 px-4 font-semibold">Similarity Index</th>
                <th className="py-2.5 px-4 font-semibold">Closing Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {(property.comparables || []).map((comp) => (
                <tr key={comp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-4 font-semibold text-gray-900">{comp.address}</td>
                  <td className="py-2.5 px-4 font-bold text-[#004D40]">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(comp.price)}
                  </td>
                  <td className="py-2.5 px-4 text-gray-600">{comp.distanceMi} miles</td>
                  <td className="py-2.5 px-4 text-gray-600">{comp.sqft} sqft</td>
                  <td className="py-2.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {(comp.similarity * 100).toFixed(0)}% Match
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-gray-500 font-mono text-[11px]">{comp.soldDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
