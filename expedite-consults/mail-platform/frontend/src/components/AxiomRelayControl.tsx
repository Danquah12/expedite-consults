'use client';

import React, { useState } from 'react';
import {
  Server, Shield, Users, Mail, Building, Clock, FileText, CheckCircle2,
  Plus, Sliders, ToggleLeft, ToggleRight, ArrowRight, X, Layers
} from 'lucide-react';

interface AxiomRelayControlProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AxiomRelayControl: React.FC<AxiomRelayControlProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'team_gateways' | 'data_flow' | 'coverage' | 'facilities' | 'broadcast_lists'>('team_gateways');

  const [coverageEnabled, setCoverageEnabled] = useState(false);
  const [internalMsg, setInternalMsg] = useState('I am currently in coverage mode conducting dissertation research on Autonomous Cyber Defense Loops. Limited dispatch access.');
  const [externalMsg, setExternalMsg] = useState('Thank you for contacting Expedite Consults. I am currently away. For urgent escalations, please contact security-ops@axiomconnect.com.');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-6 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-[960px] max-h-[85vh] flex flex-col overflow-hidden text-slate-900">
        {/* Header */}
        <div className="h-14 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight">Axiom Relay & Infrastructure Control Console</span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-400/20 text-blue-300 border border-blue-400/30">
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Team Ingress Gateways, Data Flow DLP Rules, Facilities & Coverage Automation</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation with Proprietary Nomenclature */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 text-xs font-bold shrink-0">
          {[
            { id: 'team_gateways', label: 'Team Ingress Gateways', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'data_flow', label: 'Data Flow & DLP Policies', icon: <Shield className="w-3.5 h-3.5" /> },
            { id: 'coverage', label: 'Coverage & Away Responder', icon: <Clock className="w-3.5 h-3.5" /> },
            { id: 'facilities', label: 'Facilities & Labs Finder', icon: <Building className="w-3.5 h-3.5" /> },
            { id: 'broadcast_lists', label: 'Broadcast Lists', icon: <Users className="w-3.5 h-3.5" /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 flex items-center gap-2 border-b-2 transition ${
                  isActive
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-6 overflow-y-auto text-xs space-y-5">
          {/* TAB 1: TEAM INGRESS GATEWAYS */}
          {activeTab === 'team_gateways' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Axiom Team Ingress Gateways</h3>
                  <p className="text-slate-500 text-[11px]">Collaborative group mailboxes with multi-member delegation and send-as authorization.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold shadow-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Team Gateway</span>
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: 'Security Operations Center (SOC)',
                    email: 'security-ops@axiomconnect.com',
                    delegates: ['David Asiedu (Send As, Full Access)', 'Sarah Chen (Send As)'],
                    type: 'Ingress Gateway'
                  },
                  {
                    name: 'Expedite Consults Client Gateway',
                    email: 'support@expediteconsults.com',
                    delegates: ['David Asiedu (Full Access)', 'Mike Ross (Send on Behalf)'],
                    type: 'Ingress Gateway'
                  }
                ].map((box) => (
                  <div key={box.email} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{box.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                          {box.email}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">
                        <strong>Delegates:</strong> {box.delegates.join(' • ')}
                      </p>
                    </div>

                    <button className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-bold text-slate-700 transition">
                      Configure Permissions
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: DATA FLOW & DLP POLICIES */}
          {activeTab === 'data_flow' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Axiom Data Flow & DLP Transport Rules</h3>
                  <p className="text-slate-500 text-[11px]">Server-side rule pipeline executing zero-trust compliance, disclaimer stamping, and threat quarantine.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold shadow-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Data Flow Policy</span>
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: 'Policy 1: Enterprise Confidentiality Stamping',
                    status: 'Active (Priority 0)',
                    condition: 'All outbound dispatches to external networks',
                    action: 'Append cryptographic disclaimer: "Confidentiality Notice — Axiom Zero Trust Network..."',
                    color: 'emerald'
                  },
                  {
                    name: 'Policy 2: Zero-Trust Data Loss Prevention (DLP Guard)',
                    status: 'Active (Priority 1)',
                    condition: 'Message contains SSNs, Credit Cards, or API Private Keys',
                    action: 'Halt transmission, quarantine payload, and dispatch alert to SOC telemetry',
                    color: 'purple'
                  },
                  {
                    name: 'Policy 3: Executive Dissertation Audit Archiving',
                    status: 'Active (Priority 2)',
                    condition: 'Sender belongs to Executive Research Council',
                    action: 'Bcc immutable legal compliance store in Axiom Vault S3 repository',
                    color: 'blue'
                  }
                ].map((rule) => (
                  <div key={rule.name} className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{rule.name}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {rule.status}
                      </span>
                    </div>
                    <p className="text-slate-600"><strong>Trigger:</strong> {rule.condition}</p>
                    <p className="text-slate-600"><strong>Enforcement:</strong> {rule.action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: COVERAGE & AWAY RESPONDER */}
          {activeTab === 'coverage' && (
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Coverage Mode & Automated Responder</h4>
                  <p className="text-slate-500 text-[11px]">Deploy automatic coverage replies across internal and external dispatchers while away.</p>
                </div>
                <button
                  onClick={() => setCoverageEnabled(!coverageEnabled)}
                  className={`px-4 py-1.5 rounded-lg font-bold text-xs transition ${
                    coverageEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {coverageEnabled ? 'Coverage Active' : 'Coverage Inactive'}
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Internal Organization Response</label>
                  <textarea
                    rows={3}
                    value={internalMsg}
                    onChange={(e) => setInternalMsg(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">External Client Response</label>
                  <textarea
                    rows={3}
                    value={externalMsg}
                    onChange={(e) => setExternalMsg(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={() => alert('Coverage Responder settings saved to Axiom Relay!')}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition"
              >
                Save Coverage Settings
              </button>
            </div>
          )}

          {/* TAB 4: FACILITIES & LABS FINDER */}
          {activeTab === 'facilities' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Facilities & Research Labs Directory</h3>
                  <p className="text-slate-500 text-[11px]">Physical meeting rooms, research labs, and conference facilities with auto-booking conflict resolution.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold shadow-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Facility</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    name: 'Executive Boardroom (Room 402)',
                    email: 'conf-room-402@axiomconnect.com',
                    location: 'Building A, Floor 4',
                    capacity: 18,
                    features: '4K Display, Axiom WebRTC Bar, Whiteboard',
                    autoAccept: true
                  },
                  {
                    name: 'Cyber Defense Lab (Room 210)',
                    email: 'cyber-lab-210@axiomconnect.com',
                    location: 'Building B, Floor 2',
                    capacity: 12,
                    features: 'Dual Video Displays, Telemetry Monitor, Fiber Uplink',
                    autoAccept: true
                  }
                ].map((rm) => (
                  <div key={rm.email} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{rm.name}</span>
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                        Capacity: {rm.capacity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">{rm.email}</p>
                    <p className="text-slate-600"><strong>Location:</strong> {rm.location}</p>
                    <p className="text-slate-600"><strong>Equipped with:</strong> {rm.features}</p>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                      <span>✓ Auto-Accepts Non-Conflicting Slots</span>
                      <button className="text-blue-600 hover:underline">View Matrix</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: BROADCAST LISTS */}
          {activeTab === 'broadcast_lists' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Axiom Broadcast Lists & Working Groups</h3>
                  <p className="text-slate-500 text-[11px]">Organization distribution endpoints synchronized with directory hierarchy.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold shadow-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Broadcast List</span>
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'All Engineering & Systems Staff', email: 'all-engineers@axiomconnect.com', members: 42, authOnly: 'Internal Only' },
                  { name: 'Autonomous Cyber Defense Working Group', email: 'defense-council@axiomconnect.com', members: 8, authOnly: 'Internal Only' },
                  { name: 'Executive Research Board', email: 'exec-board@axiomconnect.com', members: 5, authOnly: 'Restricted' },
                ].map((grp) => (
                  <div key={grp.email} className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-xs">
                    <div>
                      <span className="font-bold text-sm text-slate-900">{grp.name}</span>
                      <p className="text-[11px] text-slate-500 font-mono">{grp.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600 font-medium">{grp.members} members</span>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {grp.authOnly}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
