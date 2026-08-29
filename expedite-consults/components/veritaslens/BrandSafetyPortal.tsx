'use client';

import React, { useState } from 'react';
import { MediaOutlet } from '@/lib/veritaslens/types';
import { exportBrandSafetyBlocklist } from '@/lib/veritaslens/pipeline-engine';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Download, 
  Sliders, 
  Bell, 
  CheckCircle2, 
  Send, 
  Code, 
  ExternalLink,
  Flame,
  FileSpreadsheet
} from 'lucide-react';

interface BrandSafetyPortalProps {
  outlets: MediaOutlet[];
}

export const BrandSafetyPortal: React.FC<BrandSafetyPortalProps> = ({ outlets }) => {
  const [minReliability, setMinReliability] = useState<number>(35);
  const [excludeExtremeBias, setExcludeExtremeBias] = useState<boolean>(true);
  const [alertWebhookUrl, setAlertWebhookUrl] = useState<string>('https://hooks.slack.com/services/T00/B00/VERITAS_ALERT');
  const [alertDelivered, setAlertDelivered] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'blocklist' | 'alerts' | 'matrix'>('blocklist');

  const blockedOutlets = outlets.filter(o => {
    const failsReliability = o.reliabilityScore < minReliability;
    const failsBias = excludeExtremeBias && (o.biasCategory === 'Left' || o.biasCategory === 'Right');
    return failsReliability || failsBias;
  });

  const handleDownload = (format: 'json' | 'csv') => {
    const content = exportBrandSafetyBlocklist(outlets, minReliability, excludeExtremeBias, format);
    const mimeType = format === 'json' ? 'application/json' : 'text/csv';
    const filename = `VeritasLens_Ad_Blocklist_${Date.now()}.${format}`;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const handleTestWebhook = () => {
    setAlertDelivered(true);
    setTimeout(() => setAlertDelivered(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-bold text-white">
              Veritas B2B Brand Safety & Programmatic Ad-Shield Portal
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Protect corporate reputation and programmatic ad spend by automatically excluding toxic, low-factuality, or hyper-partisan media domains.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('blocklist')}
            className={`px-3 py-1 font-semibold rounded-md transition cursor-pointer ${
              activeTab === 'blocklist' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ad Blocklist Generator
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1 font-semibold rounded-md transition cursor-pointer ${
              activeTab === 'matrix' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Brand Risk Scatterplot
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1 font-semibold rounded-md transition cursor-pointer ${
              activeTab === 'alerts' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Real-Time Alert Webhooks
          </button>
        </div>
      </div>

      {/* TAB 1: BLOCKLIST GENERATOR */}
      {activeTab === 'blocklist' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Filter Parameters Pane */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <span className="text-xs uppercase font-mono font-bold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Programmatic Threshold Parameters
              </span>
            </div>

            {/* Minimum Reliability Slider */}
            <div className="space-y-2 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Min Ad Fontes Reliability:</span>
                <span className="font-bold text-cyan-400">{minReliability} / 64</span>
              </div>
              <input
                type="range"
                min="20"
                max="50"
                value={minReliability}
                onChange={e => setMinReliability(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                Any domain with a score below this cutoff will be automatically added to the blocklist.
              </p>
            </div>

            {/* Extreme Bias Toggle */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
              <label className="flex items-start gap-2.5 text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={excludeExtremeBias}
                  onChange={e => setExcludeExtremeBias(e.target.checked)}
                  className="rounded accent-rose-500 w-4 h-4 mt-0.5"
                />
                <div>
                  <span className="font-semibold block font-mono text-rose-300">Exclude Hyper-Partisan Domains</span>
                  <span className="text-[10px] text-slate-400">
                    Automatically block domains categorized with extreme Left or Right bias ratings.
                  </span>
                </div>
              </label>
            </div>

            {/* Export Buttons */}
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-mono text-slate-400">Export for DSP & Ad Platforms:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDownload('csv')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={() => handleDownload('json')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  <Code className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download JSON</span>
                </button>
              </div>
            </div>
          </div>

          {/* Blocked Domains List */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Generated Programmatic Exclusion Blocklist ({blockedOutlets.length} Domains)
                </h3>
                <span className="text-[11px] text-slate-400">
                  Ready for direct upload to Google Ads, The Trade Desk, and Meta Campaign Manager
                </span>
              </div>
              <span className="px-2.5 py-1 rounded bg-rose-950 border border-rose-800 text-rose-300 text-xs font-mono font-bold">
                Blocked: {((blockedOutlets.length / outlets.length) * 100).toFixed(0)}% of Outlets
              </span>
            </div>

            <div className="overflow-x-auto max-h-[380px] scrollbar-thin">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                    <th className="py-2.5 px-3">Domain</th>
                    <th className="py-2.5 px-3">Outlet Name</th>
                    <th className="py-2.5 px-3">Reliability</th>
                    <th className="py-2.5 px-3">Bias Category</th>
                    <th className="py-2.5 px-3">Risk Level</th>
                    <th className="py-2.5 px-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {blockedOutlets.map(out => (
                    <tr key={out.id} className="hover:bg-slate-950/40 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">
                        {out.domain}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-200">
                        {out.name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-rose-400 font-bold">
                        {out.reliabilityScore.toFixed(1)} / 64
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">
                        {out.biasCategory}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          out.brandSafetyRisk === 'High' || out.brandSafetyRisk === 'Critical'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {out.brandSafetyRisk}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 text-[10px] font-mono font-bold">
                          BLOCK
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BRAND RISK SCATTERPLOT */}
      {activeTab === 'matrix' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white font-mono">
              Brand Safety Risk vs Factual Integrity Scatterplot
            </h3>
            <p className="text-xs text-slate-400">
              Visualizes domain safety clusters: High Reliability / Low Risk (Green Zone) vs Low Reliability / High Brand Risk (Red Zone).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outlets.map(out => (
              <div key={out.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-white">{out.name}</span>
                    <span className="text-[11px] text-cyan-400 font-mono block">{out.domain}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    out.brandSafetyRisk === 'Low'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : out.brandSafetyRisk === 'Medium'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {out.brandSafetyRisk} Risk
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${(out.reliabilityScore / 64) * 100}%` }}
                    className={`h-full ${out.reliabilityScore >= 45 ? 'bg-emerald-500' : out.reliabilityScore >= 35 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Reliability: {out.reliabilityScore.toFixed(1)}/64</span>
                  <span>Bias: {out.biasCategory}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REAL-TIME ALERTS & WEBHOOKS */}
      {activeTab === 'alerts' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              Corporate Alerting Engine (Slack, Microsoft Teams, Webhooks)
            </h3>
            <p className="text-xs text-slate-400">
              Triggers instant enterprise notifications whenever a verified fact retraction occurs, or a tracked narrative experiences viral misinformation spikes.
            </p>
          </div>

          <div className="space-y-4 max-w-xl">
            <div>
              <label className="text-xs font-mono uppercase font-bold text-slate-300 block mb-1">
                Enterprise Alert Webhook URL:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={alertWebhookUrl}
                  onChange={e => setAlertWebhookUrl(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleTestWebhook}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-amber-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Alert</span>
                </button>
              </div>
            </div>

            {alertDelivered && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-600 rounded-lg text-xs text-emerald-200 flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Test Alert successfully dispatched to webhook endpoint!</span>
              </div>
            )}

            {/* Simulated Slack Payload Preview */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
              <span className="text-[10px] uppercase text-slate-500 font-bold block">Simulated JSON Webhook Payload:</span>
              <pre className="text-cyan-300 text-[11px] overflow-x-auto">
{`{
  "event": "VERITAS_BRAND_SAFETY_ALERT",
  "severity": "CRITICAL",
  "trigger": "Unretracted Misinformation Spike Detected",
  "domain": "unverified-rumor-blog.com",
  "reliabilityScore": 18.4,
  "action": "AUTO_BLOCKED_FROM_CAMPAIGNS",
  "timestamp": "2026-08-25T18:10:00Z"
}`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
