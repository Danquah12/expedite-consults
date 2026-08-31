'use client';

import React, { useState } from 'react';
import {
  Server, Shield, Users, Mail, Building, Clock, FileText, CheckCircle2,
  AlertTriangle, Plus, Sliders, ToggleLeft, ToggleRight, ArrowRight, X
} from 'lucide-react';

interface ExchangeAdminProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExchangeAdminCenter: React.FC<ExchangeAdminProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'shared_mailboxes' | 'mail_flow' | 'oof' | 'rooms' | 'groups'>('shared_mailboxes');

  // Out of Office State
  const [oofEnabled, setOofEnabled] = useState(false);
  const [internalMsg, setInternalMsg] = useState('I am currently out of the office attending the Cyber Defense Loops PhD dissertation review. I will have limited email access.');
  const [externalMsg, setExternalMsg] = useState('Thank you for contacting Expedite Consults. I am currently out of the office. For urgent inquiries, please contact security-ops@axiomconnect.com.');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-6 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-[960px] max-h-[85vh] flex flex-col overflow-hidden text-slate-900">
        {/* Exchange Admin Center Header */}
        <div className="h-14 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight">Axiom Exchange Admin Center (EAC)</span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-400/20 text-blue-300 border border-blue-400/30">
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Mail Flow Rules, Shared Mailboxes, Room Finder & OOF Automation</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 text-xs font-bold shrink-0">
          {[
            { id: 'shared_mailboxes', label: 'Shared Mailboxes & Delegation', icon: <Mail className="w-3.5 h-3.5" /> },
            { id: 'mail_flow', label: 'Mail Flow & DLP Rules', icon: <Shield className="w-3.5 h-3.5" /> },
            { id: 'oof', label: 'Out of Office (OOF)', icon: <Clock className="w-3.5 h-3.5" /> },
            { id: 'rooms', label: 'Room & Resource Finder', icon: <Building className="w-3.5 h-3.5" /> },
            { id: 'groups', label: 'Distribution Groups', icon: <Users className="w-3.5 h-3.5" /> },
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
          {/* TAB 1: SHARED MAILBOXES & DELEGATION */}
          {activeTab === 'shared_mailboxes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Exchange Shared Mailboxes</h3>
                  <p className="text-slate-500 text-[11px]">Allow multiple users to read and send email from central team addresses without extra licenses.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold shadow-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Shared Mailbox</span>
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: 'Security Operations Center (SOC)',
                    email: 'security-ops@axiomconnect.com',
                    delegates: ['David Asiedu (Send As, Full Access)', 'Sarah Chen (Send As)'],
                    type: 'Shared Mailbox'
                  },
                  {
                    name: 'Expedite Consults Support & Inquiries',
                    email: 'support@expediteconsults.com',
                    delegates: ['David Asiedu (Full Access)', 'Mike Ross (Send on Behalf)'],
                    type: 'Shared Mailbox'
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
                      Edit Permissions
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: MAIL FLOW & TRANSPORT RULES (DLP) */}
          {activeTab === 'mail_flow' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Exchange Mail Flow & Transport Rules</h3>
                  <p className="text-slate-500 text-[11px]">Server-side rule execution for disclaimers, DLP security, and quarantine routing.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold shadow-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Rule</span>
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: 'Rule 1: Enterprise Legal Disclaimer',
                    status: 'Enabled (Priority 0)',
                    condition: 'Apply to all outbound external emails',
                    action: 'Append disclaimer: "This email and attachments are confidential and intended solely for..."',
                    color: 'emerald'
                  },
                  {
                    name: 'Rule 2: Zero-Trust Data Loss Prevention (DLP)',
                    status: 'Enabled (Priority 1)',
                    condition: 'Message contains SSNs, Credit Cards, or Private API Keys',
                    action: 'Block delivery and send real-time alert to SOC security dashboard',
                    color: 'purple'
                  },
                  {
                    name: 'Rule 3: Executive Legal Hold & Compliance Archiving',
                    status: 'Enabled (Priority 2)',
                    condition: 'Sender is in Executive Committee or Legal Officers',
                    action: 'Silently Bcc immutable compliance archive in MinIO S3 bucket',
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
                    <p className="text-slate-600"><strong>If:</strong> {rule.condition}</p>
                    <p className="text-slate-600"><strong>Do:</strong> {rule.action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: OUT OF OFFICE (OOF) */}
          {activeTab === 'oof' && (
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Automatic Replies (Out of Office)</h4>
                  <p className="text-slate-500 text-[11px]">Send automatic replies to people who email you while away.</p>
                </div>
                <button
                  onClick={() => setOofEnabled(!oofEnabled)}
                  className={`px-4 py-1.5 rounded-lg font-bold text-xs transition ${
                    oofEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {oofEnabled ? 'Turned ON' : 'Turned OFF'}
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Inside My Organization</label>
                  <textarea
                    rows={3}
                    value={internalMsg}
                    onChange={(e) => setInternalMsg(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Outside My Organization</label>
                  <textarea
                    rows={3}
                    value={externalMsg}
                    onChange={(e) => setExternalMsg(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={() => alert('Out of Office rules saved to Exchange server!')}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition"
              >
                Save Automatic Replies
              </button>
            </div>
          )}

          {/* TAB 4: ROOM & RESOURCE FINDER */}
          {activeTab === 'rooms' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Exchange Room & Equipment Mailboxes</h3>
                  <p className="text-slate-500 text-[11px]">Resource mailboxes with automated booking conflict resolution.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold shadow-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Room Resource</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    name: 'Executive Boardroom (Room 402)',
                    email: 'conf-room-402@axiomconnect.com',
                    location: 'Building A, Floor 4',
                    capacity: 18,
                    features: '4K Display, Polycom WebRTC Bar, Whiteboard',
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
                        Cap: {rm.capacity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">{rm.email}</p>
                    <p className="text-slate-600"><strong>Location:</strong> {rm.location}</p>
                    <p className="text-slate-600"><strong>Equipped with:</strong> {rm.features}</p>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                      <span>✓ Auto-Accepts Non-Conflicting Invites</span>
                      <button className="text-blue-600 hover:underline">View Calendar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DISTRIBUTION GROUPS */}
          {activeTab === 'groups' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Global Address List (GAL) & Distribution Lists</h3>
                  <p className="text-slate-500 text-[11px]">Email broadcast groups synced with company directory.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold shadow-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Group</span>
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'All Engineering & Research Staff', email: 'all-engineers@axiomconnect.com', members: 42, authOnly: 'Internal Only' },
                  { name: 'Autonomous Cyber Defense Working Group', email: 'defense-council@axiomconnect.com', members: 8, authOnly: 'Internal Only' },
                  { name: 'Executive Leadership Committee', email: 'exec-board@axiomconnect.com', members: 5, authOnly: 'Restricted' },
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
