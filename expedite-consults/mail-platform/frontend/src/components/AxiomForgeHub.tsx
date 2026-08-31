'use client';

import React, { useState } from 'react';
import {
  LayoutGrid, Plus, Play, ShieldAlert, GitPullRequest, Laptop, Users,
  Database, FormInput, Sparkles, CheckCircle2, ArrowRight, X, Layers
} from 'lucide-react';
import { ForgeApp } from '../types/connect';

export const MOCK_FORGE_APPS: ForgeApp[] = [
  {
    id: 'app-1',
    name: 'Cyber Incident Response Triage',
    description: 'Real-time security incident intake form with automated severity scoring and SOC escalation.',
    category: 'Security & SOC',
    icon: 'ShieldAlert',
    color: '#EF4444',
    recordsCount: 24,
    lastUpdated: '10 mins ago',
    fields: [
      { name: 'incident_title', label: 'Incident Title', type: 'text', required: true },
      { name: 'severity', label: 'Severity Level', type: 'select', options: ['Critical (P1)', 'High (P2)', 'Medium (P3)', 'Low (P4)'], required: true },
      { name: 'affected_system', label: 'Affected Host / Subnet', type: 'text', required: true },
      { name: 'attack_vector', label: 'Detected Threat Vector', type: 'select', options: ['Autonomous DDoS', 'Privilege Escalation', 'Ransomware', 'Phishing C2'] },
      { name: 'incident_notes', label: 'Technical Observations', type: 'textarea' }
    ]
  },
  {
    id: 'app-2',
    name: 'Change Request (CR) ServiceNow Flow',
    description: 'Submit, review, and approve infrastructure change requests directly integrated with Nexus.',
    category: 'IT & DevOps',
    icon: 'GitPullRequest',
    color: '#8B5CF6',
    recordsCount: 58,
    lastUpdated: '1 hour ago',
    fields: [
      { name: 'cr_number', label: 'Change Request ID', type: 'text', required: true },
      { name: 'target_environment', label: 'Target Environment', type: 'select', options: ['Production', 'Staging', 'DR Vault'], required: true },
      { name: 'risk_level', label: 'Risk Rating', type: 'select', options: ['Emergency (Executive Approval)', 'High Risk', 'Standard'] },
      { name: 'rollback_plan', label: 'Rollback Procedure', type: 'textarea', required: true }
    ]
  },
  {
    id: 'app-3',
    name: 'Cloud SRE & Compute Provisioning',
    description: 'Self-service portal for engineers to request cloud GPU clusters and Kubernetes namespaces.',
    category: 'Cloud Engineering',
    icon: 'Laptop',
    color: '#3B82F6',
    recordsCount: 12,
    lastUpdated: '3 hours ago',
    fields: [
      { name: 'cluster_name', label: 'Cluster / Namespace Name', type: 'text', required: true },
      { name: 'compute_tier', label: 'Compute Specification', type: 'select', options: ['8x NVIDIA H100 GPU', '32 Core CPU / 128GB RAM', 'General Compute'] },
      { name: 'cost_center', label: 'Department Cost Center', type: 'text', required: true }
    ]
  }
];

export const AxiomForgeHub: React.FC = () => {
  const [apps, setApps] = useState<ForgeApp[]>(MOCK_FORGE_APPS);
  const [selectedApp, setSelectedApp] = useState<ForgeApp | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submittedAlert, setSubmittedAlert] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  const handleLaunchApp = (app: ForgeApp) => {
    setSelectedApp(app);
    setFormData({});
    setSubmittedAlert(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedAlert(true);
    setTimeout(() => {
      setSubmittedAlert(false);
      setSelectedApp(null);
    }, 1800);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-50">
      {/* Top Header */}
      <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm text-slate-900">Axiom Forge Studio</h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                Low-Code Custom Apps
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Build and deploy enterprise business applications connected to Dispatch, Nexus & Data Repositories</p>
          </div>
        </div>

        <button
          onClick={() => setIsBuilderOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Forge App</span>
        </button>
      </div>

      {/* Main Apps Grid */}
      <div className="flex-1 p-8 overflow-y-auto max-w-6xl mx-auto w-full space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">Enterprise Applications Gallery</h2>
          <p className="text-xs text-slate-500">Custom business tools built on the Axiom low-code engine</p>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {apps.map((app) => (
            <div
              key={app.id}
              className="p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-xl transition-all flex flex-col justify-between h-56 group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
                    style={{ backgroundColor: app.color }}
                  >
                    {app.icon === 'ShieldAlert' && <ShieldAlert className="w-5 h-5" />}
                    {app.icon === 'GitPullRequest' && <GitPullRequest className="w-5 h-5" />}
                    {app.icon === 'Laptop' && <Laptop className="w-5 h-5" />}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {app.category}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition">{app.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{app.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">{app.recordsCount} records • {app.lastUpdated}</span>
                <button
                  onClick={() => handleLaunchApp(app)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 group-hover:bg-purple-600 text-purple-700 group-hover:text-white text-xs font-bold transition shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Launch App</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Form Runner Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-[540px] max-h-[90vh] flex flex-col overflow-hidden text-slate-900">
            <div className="h-14 bg-slate-900 text-white px-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: selectedApp.color }}>
                  ✓
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-100">{selectedApp.name}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Axiom Forge Dynamic Form</span>
                </div>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {submittedAlert ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Record Successfully Processed</h4>
                <p className="text-xs text-slate-500">
                  Data stored in custom repository and automated Axiom Flow pipeline dispatched to Nexus #cyber-defense-loops.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
                {selectedApp.fields.map((field) => (
                  <div key={field.name} className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>

                    {field.type === 'text' && (
                      <input
                        type="text"
                        required={field.required}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                      />
                    )}

                    {field.type === 'select' && (
                      <select
                        required={field.required}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-purple-600 bg-white"
                      >
                        <option value="">Select an option...</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {field.type === 'textarea' && (
                      <textarea
                        rows={3}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-purple-600"
                      />
                    )}
                  </div>
                ))}

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedApp(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition"
                  >
                    Submit Record
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* New Forge App Modal */}
      {isBuilderOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-[500px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">Create New Forge App</span>
              <button onClick={() => setIsBuilderOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">App Name</label>
                <input
                  type="text"
                  placeholder="e.g. SOC Threat Quarantine Portal"
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <select className="w-full p-2.5 border border-slate-300 rounded-xl outline-none bg-white">
                  <option>Security & Defense</option>
                  <option>Cloud Engineering & SRE</option>
                  <option>Compliance & Audit</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button onClick={() => setIsBuilderOpen(false)} className="px-3.5 py-1.5 text-xs font-semibold text-slate-600">Cancel</button>
              <button
                onClick={() => {
                  alert('New Forge App created in Axiom repository!');
                  setIsBuilderOpen(false);
                }}
                className="px-4 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Create App
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
