'use client';

import React, { useState } from 'react';
import { Property, getEnrichedInspectionRisk, InspectionDefectItem } from '../mockData';
import {
  Scan,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  Camera,
  Layers,
  FileSpreadsheet,
  Calendar,
  ExternalLink,
} from 'lucide-react';

interface AIPropertyInspectorProps {
  property: Property;
}

export const AIPropertyInspector: React.FC<AIPropertyInspectorProps> = ({ property }) => {
  const inspection = getEnrichedInspectionRisk(property);
  const [selectedDefect, setSelectedDefect] = useState<InspectionDefectItem>(
    inspection.defects[0] || null
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#0C382E] flex items-center space-x-1.5">
            <Scan className="w-3.5 h-3.5 text-emerald-600" />
            <span>Computer Vision Diagnostics</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight mt-0.5">
            AI Property Inspector™
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Automated image segmentation and defect detection scanning roof, foundation, grading, and major mechanicals.
          </p>
        </div>

        {/* Risk Score Pill */}
        <div
          className={`rounded-xl p-3 flex items-center space-x-3 self-start sm:self-auto border ${
            inspection.riskScore === 'Low'
              ? 'bg-emerald-50 border-emerald-300'
              : inspection.riskScore === 'Moderate'
              ? 'bg-amber-50 border-amber-300'
              : 'bg-rose-50 border-rose-300'
          }`}
        >
          <div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider block ${
                inspection.riskScore === 'Low'
                  ? 'text-emerald-800'
                  : inspection.riskScore === 'Moderate'
                  ? 'text-amber-800'
                  : 'text-rose-800'
              }`}
            >
              Inspection Risk Score
            </span>
            <span
              className={`text-base font-black ${
                inspection.riskScore === 'Low'
                  ? 'text-emerald-950'
                  : inspection.riskScore === 'Moderate'
                  ? 'text-amber-950'
                  : 'text-rose-950'
              }`}
            >
              {inspection.riskScore.toUpperCase()} RISK ({inspection.defects.length} Diagnostic Flags)
            </span>
          </div>
        </div>
      </div>

      {/* Legal & Regulatory Notice */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 flex items-start space-x-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          <strong>Algorithmic Preliminary Risk Screening (APRS):</strong> Visual defect scans are performed using automated computer vision on MLS imagery. This screening does not replace an in-person, ASHI/InterNACHI-certified physical inspection for concealed plumbing or wiring.
        </span>
      </div>

      {/* Main Diagnostic Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Defect Scanner Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
            Select Detected Diagnostic Flag
          </span>

          <div className="space-y-2.5">
            {inspection.defects.map((defect) => (
              <div
                key={defect.id}
                onClick={() => setSelectedDefect(defect)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedDefect?.id === defect.id
                    ? 'border-[#0C382E] bg-emerald-50/40 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      defect.severity === 'high'
                        ? 'bg-rose-500 ring-2 ring-rose-300'
                        : defect.severity === 'medium'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">{defect.target}</span>
                    <span className="text-[10px] text-gray-500">{defect.estimatedRepairCost}</span>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    defect.severity === 'high'
                      ? 'bg-rose-100 text-rose-800'
                      : defect.severity === 'medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {defect.severity}
                </span>
              </div>
            ))}
          </div>

          {/* Action to Request Professional Inspection */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-2">
            <span className="font-bold text-gray-900 block">Need On-Site Certification?</span>
            <p className="text-[11px] text-gray-600">
              One-click export of this preliminary defect report to licensed Virginia home inspectors.
            </p>
            <button className="w-full py-2 bg-[#0C382E] text-white rounded-lg font-bold text-xs hover:bg-[#08261F] transition-colors cursor-pointer">
              Book Verified NoVA Inspector ($450)
            </button>
          </div>
        </div>

        {/* Right Column: Defect Deep-Dive Viewer & Bounding Box (7 cols) */}
        {selectedDefect && (
          <div className="lg:col-span-7 bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Defect Inspection Focus
                </span>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                  {selectedDefect.target}
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-gray-700 bg-white px-2 py-1 rounded border border-gray-200">
                Confidence: {inspection.overallConfidence}%
              </span>
            </div>

            {/* Photo with Bounding Box Overlay Simulation */}
            <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-black/5 border border-gray-300">
              <img
                src={selectedDefect.imageUrl}
                alt={selectedDefect.target}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Simulated Computer Vision Bounding Box */}
              <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-emerald-400 bg-emerald-500/10 rounded-xs animate-pulse pointer-events-none flex items-start justify-start p-1.5">
                <span className="bg-emerald-600 text-white text-[9px] font-bold font-mono px-1 rounded">
                  FLAG: {selectedDefect.target.toUpperCase()}
                </span>
              </div>

              <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white text-xs">
                <span className="text-[10px] uppercase font-bold text-emerald-300 block">
                  Detected Condition
                </span>
                <span>{selectedDefect.detectedIssue}</span>
              </div>
            </div>

            {/* Cost & TrueValue Impact Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <span className="text-[10px] text-gray-500 font-medium block">
                  Estimated Repair Cost
                </span>
                <span className="text-sm sm:text-base font-black text-gray-900">
                  {selectedDefect.estimatedRepairCost}
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <span className="text-[10px] text-gray-500 font-medium block">
                  TrueValue Impact
                </span>
                <span className="text-sm sm:text-base font-black text-rose-700">
                  {selectedDefect.trueValueImpact < 0
                    ? `-$${Math.abs(selectedDefect.trueValueImpact).toLocaleString()}`
                    : '$0 (Minor Cosmetic)'}
                </span>
              </div>
            </div>

            {/* Inspector Recommendation */}
            <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <span className="font-bold block flex items-center space-x-1.5 text-[#0C382E]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Actionable Contingency Language</span>
              </span>
              <p className="text-[11px] leading-relaxed">{selectedDefect.inspectorRecommendation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPropertyInspector;
