'use client';

import React from 'react';
import { Property } from '../mockData';
import { X, Printer, Download, ShieldCheck, CheckCircle, Landmark, QrCode } from 'lucide-react';

interface TruthReportModalProps {
  property: Property;
  onClose: () => void;
}

export const TruthReportModal: React.FC<TruthReportModalProps> = ({ property, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-gray-300">
        {/* Modal Top Bar */}
        <div className="bg-[#004D40] text-white p-4 flex items-center justify-between rounded-t-xl shrink-0">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-[#E07A5F]" />
            <div>
              <h3 className="text-sm font-bold tracking-tight">Official TruePlace Truth Report™ (PDF/A Preview)</h3>
              <p className="text-[11px] text-gray-300">Certified Real Estate Valuation Audit Document</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-white/15 hover:bg-white/25 text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 6-Page Document Preview Content (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-8 bg-gray-50 text-gray-900 font-sans text-xs leading-relaxed">
          {/* PAGE 1: EXECUTIVE COVER & VALUATION SUMMARY */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 space-y-6">
            <div className="flex justify-between items-start border-b-2 border-[#004D40] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#E07A5F] block">
                  TruePlace Certified Valuation Standard
                </span>
                <h1 className="text-2xl font-black text-[#004D40] font-sans">
                  TrueValue™ Official Truth Report
                </h1>
                <p className="text-gray-500 text-xs mt-0.5">
                  Report ID: TR-2026-{property.id.toUpperCase()} | Generated: September 21, 2026
                </p>
              </div>
              <div className="w-14 h-14 bg-[#004D40] text-white rounded-lg flex flex-col items-center justify-center font-bold text-lg">
                <span>TP</span>
                <span className="text-[8px] text-[#E07A5F] -mt-1 font-mono">AI</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <img
                  src={property.photoUrl}
                  alt={property.address}
                  className="w-full h-44 object-cover rounded-lg border border-gray-200"
                />
                <div className="mt-2 text-[11px] text-gray-600 font-semibold">{property.address}, {property.city}, {property.state} {property.zip}</div>
              </div>

              <div className="bg-[#F5EDE1] p-5 rounded-lg border border-[#D5C7B2] space-y-3">
                <div>
                  <span className="text-[10px] text-gray-600 uppercase font-bold tracking-wider">Certified TrueValue Estimate</span>
                  <div className="text-3xl font-black text-[#004D40]">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(property.trueValue)}
                  </div>
                  <div className="text-xs text-gray-600">
                    Range: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(property.rangeLow)} – {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(property.rangeHigh)}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E3D7C5] flex justify-between items-center text-xs">
                  <span>Confidence Score:</span>
                  <strong className="text-[#004D40] font-bold">{property.confidence}% (Very High)</strong>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span>Truth Score:</span>
                  <strong className="text-emerald-800 font-bold">{property.truthScore}/100</strong>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span>MLS Synchronization:</span>
                  <span className="text-gray-700">{property.lastVerifiedHoursAgo} hours ago (Active)</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-100 rounded text-[11px] text-gray-600">
              <strong>Executive Summary:</strong> TruePlace certifies this valuation based on an ensemble of LightGBM regression, TreeSHAP mathematical feature attribution, verified county tax records, and 14 arms-length comparable sales within 0.50 miles.
            </div>
          </div>

          {/* PAGE 2: VALUE DRIVERS & DONUT BREAKDOWN */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#004D40] border-b pb-2">
              Page 2: Value Drivers & Factor Waterfall
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
                <h4 className="font-bold text-emerald-900 text-xs mb-2">Key Value Drivers (+)</h4>
                {property.shapDrivers.filter((d) => d.impact > 0).map((d, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-emerald-100 text-[11px]">
                    <span>{d.driver}</span>
                    <strong className="text-emerald-800">+{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(d.impact)}</strong>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-rose-50 rounded border border-rose-200">
                <h4 className="font-bold text-rose-900 text-xs mb-2">Offsetting Factors (-)</h4>
                {property.shapDrivers.filter((d) => d.impact < 0).map((d, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-rose-100 text-[11px]">
                    <span>{d.driver}</span>
                    <strong className="text-rose-800">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(d.impact)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PAGE 3: METHODOLOGY & SIGN-OFF */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#004D40] border-b pb-2">
              Page 3: Mathematical Methodology & Appraiser Sign-Off
            </h3>
            <p className="text-[11px] text-gray-700 leading-relaxed">
              Every TrueValue estimate satisfies the exact additivity formula: $f(x) = E[f(X)] + \sum \phi_i(x)$. Every dollar above or below neighborhood baseline has been mathematically attributed using TreeSHAP polynomial tree traversal.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Model Version</span>
                <span className="font-mono text-xs text-gray-800">LGBM-2026-v2.4-PROD</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Appraiser Audit Hash</span>
                <span className="font-mono text-xs text-gray-800">SHA-256: e3b0c44298fc1c149afb</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
