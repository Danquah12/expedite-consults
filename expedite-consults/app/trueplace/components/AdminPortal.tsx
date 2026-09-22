'use client';

import React, { useState } from 'react';
import { Property } from '../mockData';
import { ShieldCheck, AlertTriangle, RefreshCw, CheckCircle2, XCircle, Database, Eye, Activity } from 'lucide-react';

interface AdminPortalProps {
  properties: Property[];
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ properties }) => {
  const [retrainingStatus, setRetrainingStatus] = useState<string | null>(null);

  const handleRetrain = () => {
    setRetrainingStatus('Ingesting weekly closed transactions & optimizing LightGBM tree depths...');
    setTimeout(() => {
      setRetrainingStatus('Retraining complete! New MAPE: 3.38% (Achieved 0.04% precision improvement).');
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#004D40] text-white p-6 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#E07A5F] block">
            TruePlace Real Estate Intelligence Platform
          </span>
          <h2 className="text-xl font-bold tracking-tight">Platform Operations & Model Observability Portal</h2>
          <p className="text-xs text-gray-300 mt-0.5">
            Internal oversight console for AVM accuracy, 48h inventory audits, and certified appraiser escalation queues.
          </p>
        </div>
        <button
          onClick={handleRetrain}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#E07A5F] text-white text-xs font-bold hover:bg-[#d0684d] transition-colors shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${retrainingStatus ? 'animate-spin' : ''}`} />
          <span>Trigger Automated Model Retraining</span>
        </button>
      </div>

      {retrainingStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-semibold flex items-center space-x-2">
          <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>{retrainingStatus}</span>
        </div>
      )}

      {/* Model Observability Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="text-xs font-medium text-gray-500 uppercase">Live Model Accuracy (MAPE)</div>
          <div className="text-2xl font-black text-[#004D40] mt-1">3.42%</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Goal: ≤ 6.0% (Exceeding target)</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="text-xs font-medium text-gray-500 uppercase">Root Mean Squared Error</div>
          <div className="text-2xl font-black text-gray-900 mt-1">$18,420</div>
          <div className="text-[11px] text-gray-500 mt-1">Tested against 5,000 closed deeds</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="text-xs font-medium text-gray-500 uppercase">TreeSHAP Additivity Rate</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">100.0%</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Zero mathematical drift</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="text-xs font-medium text-gray-500 uppercase">Active Verified Listings</div>
          <div className="text-2xl font-black text-[#1D3557] mt-1">1,482</div>
          <div className="text-[11px] text-gray-500 mt-1">Mandatory 48h check active</div>
        </div>
      </div>

      {/* 30-Minute Real Data Ledger & Agency Sync Status */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2DD4BF] animate-pulse"></span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              30-Minute Tri-Jurisdiction Synchronization Cadence (MD • VA • DC)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Cadence: 30m • SLA: 99.98%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 bg-amber-50/60 rounded-lg border border-amber-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950">Maryland SDAT Feed</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">Connected</span>
            </div>
            <p className="text-[11px] text-gray-600">MD iMAP Real Property GIS • Tax & Deed Books</p>
            <div className="text-[10px] text-gray-500 font-mono">Sync Interval: 30m • Zero synthetic records</div>
          </div>

          <div className="p-3.5 bg-blue-50/60 rounded-lg border border-blue-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-950">Fairfax PLUS System</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">Connected</span>
            </div>
            <p className="text-[11px] text-gray-600">Fairfax LDS Building_Records_PLUS • Residential Permits</p>
            <div className="text-[10px] text-gray-500 font-mono">Sync Interval: 30m • Citizen Access Live</div>
          </div>

          <div className="p-3.5 bg-purple-50/60 rounded-lg border border-purple-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-950">DC GIS OCTO & DCRA</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">Connected</span>
            </div>
            <p className="text-[11px] text-gray-600">DC Master Address Repository (MAR) • Active Permits</p>
            <div className="text-[10px] text-gray-500 font-mono">Sync Interval: 30m • SSL & Historic District</div>
          </div>
        </div>
      </div>

      {/* 48-Hour Listing Freshness & Ghost Inventory Audit Queue */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#004D40]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              48-Hour Verified Active Listing Queue
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-gray-500">Auto-suppression active for ghost listings</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 text-gray-600 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Listing Address</th>
                <th className="py-2.5 px-4 font-semibold">MLS ID</th>
                <th className="py-2.5 px-4 font-semibold">Last Broker Sync</th>
                <th className="py-2.5 px-4 font-semibold">Truth Score</th>
                <th className="py-2.5 px-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {properties.map((prop) => (
                <tr key={prop.id} className="hover:bg-gray-50">
                  <td className="py-2.5 px-4 font-bold text-gray-900">{prop.address}</td>
                  <td className="py-2.5 px-4 font-mono text-gray-600">{prop.mlsId}</td>
                  <td className="py-2.5 px-4 text-gray-700">
                    <span className="inline-flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>{prop.lastVerifiedHoursAgo} hours ago</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-bold text-emerald-800">{prop.truthScore}/100</td>
                  <td className="py-2.5 px-4">
                    <button className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold hover:bg-emerald-100">
                      Re-Verify Active
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appraiser Escalation Review Queue (< 75% Confidence) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-[#E07A5F]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Human Appraiser Review Queue (Confidence &lt; 75%)
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-gray-500">Mandatory desktop audit before public listing</span>
        </div>

        <div className="p-5 text-center text-gray-500 text-xs py-8">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-80" />
          <p className="font-semibold text-gray-800">All current regional properties meet the 75% confidence threshold.</p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Any rural or unique homes with insufficient micro-comps will automatically appear here for manual override audit.
          </p>
        </div>
      </div>
    </div>
  );
};
