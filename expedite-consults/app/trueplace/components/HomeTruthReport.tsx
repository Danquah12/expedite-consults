'use client';

import React from 'react';
import { Property } from '../mockData';
import {
  FileCheck2,
  ShieldCheck,
  Printer,
  X,
  AlertTriangle,
  Calendar,
  Wrench,
  Zap,
  Droplets,
  DollarSign,
  Landmark,
  CheckCircle2,
} from 'lucide-react';

interface HomeTruthReportProps {
  property: Property;
  onClose: () => void;
}

export const HomeTruthReport: React.FC<HomeTruthReportProps> = ({ property, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const ht = property.homeTruthData;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col border border-gray-300 overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-[#0C382E] text-white p-3 sm:p-4.5 flex items-center justify-between shrink-0 border-b border-[#07251E] gap-2">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#34D399]" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-2">
                <h3 className="text-xs sm:text-base font-bold tracking-tight truncate">HomeTruth™ Certified Audit</h3>
                <span className="text-[9px] sm:text-[10px] bg-emerald-500/20 text-[#34D399] border border-emerald-400/40 px-1.5 py-0.2 rounded-full font-mono font-bold hidden sm:inline">
                  CARFAX FOR HOMES™
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-300 truncate hidden xs:block">
                Municipal Permit, Title, Mechanical & Environmental Certificate
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Save PDF</span>
              <span className="sm:hidden text-[11px]">PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Content */}
        <div className="p-3 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 bg-[#F8FAF9] text-gray-900 text-xs leading-relaxed">
          {/* Executive Certificate Header */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0C382E]">
                  Northern Virginia Municipal Audit Record • {property.county}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-gray-950">{property.address}</h1>
                <p className="text-gray-500 text-xs">
                  {property.city}, {property.state} {property.zip} • MLS #{property.mlsId}
                </p>
              </div>

              <div className="flex items-center space-x-3 bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-[10px] font-bold text-emerald-900 uppercase">HomeTruth Status</div>
                  <div className="text-sm font-black text-emerald-800">100% Certified Clean</div>
                  <div className="text-[10px] text-emerald-700">Zero Unpermitted Additions</div>
                </div>
              </div>
            </div>

            {/* Core Diagnostics 4-Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Title & Liens</span>
                <span className="text-xs font-bold text-gray-900 block mt-0.5">Clean Title Chain</span>
                <span className="text-[10px] text-emerald-600 font-semibold">0 Open Liens</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Permitted Investment</span>
                <span className="text-xs font-bold text-gray-900 block mt-0.5">
                  ${ht.permittedRepairsCost.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">County Finaled</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Roof Remaining Life</span>
                <span className="text-xs font-bold text-gray-900 block mt-0.5">
                  {ht.roofRemainingYears} Years Est.
                </span>
                <span className="text-[10px] text-gray-500">Architectural Shingle</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-500 uppercase font-bold block">HVAC Mechanical Age</span>
                <span className="text-xs font-bold text-gray-900 block mt-0.5">
                  {ht.hvacAgeYears} Years Old
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">High Efficiency</span>
              </div>
            </div>
          </div>

          {/* Section 1: Municipal Building Permit History */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-[#0C382E]" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900">
                  Municipal Building, Electrical & Mechanical Permit Log
                </h4>
              </div>
              <span className="text-[10px] text-gray-500">Sourced from County Land Development Records</span>
            </div>

            <div className="divide-y divide-gray-100">
              {property.permits.map((p) => (
                <div key={p.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-gray-900 flex items-center space-x-2">
                      <span>{p.type}</span>
                      <span className="text-[10px] font-mono bg-gray-100 px-1.5 py-0.2 rounded text-gray-600">
                        {p.id}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      Year Completed: <strong>{p.year}</strong> • Certified by County Inspector
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-right">
                    <div>
                      <div className="font-black text-gray-900">${p.cost.toLocaleString()}</div>
                      <div className="text-[10px] text-emerald-700 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{p.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Ownership History & Deed Transfers */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center space-x-2">
                <Landmark className="w-4 h-4 text-[#0C382E]" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900">
                  Title Chain & Deed Transfer Record
                </h4>
              </div>
              <span className="text-[10px] text-gray-500">Recorded in Circuit Court Land Records</span>
            </div>

            <div className="space-y-2.5">
              {property.timeline.filter((t) => t.type === 'sale' || t.type === 'built').map((t, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900">{t.title} ({t.year})</div>
                    <div className="text-[11px] text-gray-600 mt-0.5">{t.description}</div>
                  </div>
                  {t.cost && (
                    <div className="text-right">
                      <span className="text-xs font-black text-gray-900">
                        ${t.cost.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-500 block">Arm's Length Transfer</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Environmental & Flood Hazard Certification */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2 border-b pb-2">
              <Droplets className="w-4 h-4 text-sky-600" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900">
                Environmental Resilience & Flood Plain Certification
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-sky-50/60 border border-sky-200">
                <span className="text-[10px] text-sky-900 font-bold uppercase block">FEMA Flood Zone</span>
                <span className="font-bold text-sky-950 text-sm block mt-0.5">{property.femaFloodZone}</span>
                <p className="text-[11px] text-sky-800 mt-1">
                  Minimal flood hazard elevation; home is positioned safely above regional watershed flow.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
                <span className="text-[10px] text-emerald-900 font-bold uppercase block">Insurance Mandate</span>
                <span className="font-bold text-emerald-950 text-sm block mt-0.5">Zero Flood Insurance Mandate</span>
                <p className="text-[11px] text-emerald-800 mt-1">
                  Standard homeowner policy compliant; saves estimated $1,400/yr in NFIP flood premiums.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
