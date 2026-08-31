'use client';

import React, { useState } from 'react';
import { NavigationRail } from './NavigationRail';
import { AxiomDispatchView } from './AxiomDispatchView';
import { AxiomScheduleView } from './AxiomScheduleView';
import { AxiomNexusView } from './AxiomNexusView';
import { AxiomSessionRoom } from './AxiomSessionRoom';
import { AxiomForgeHub } from './AxiomForgeHub';
import { AxiomFlowEngine } from './AxiomFlowEngine';
import { AxiomVaultView } from './AxiomVaultView';
import { AxiomRelayControl } from './AxiomRelayControl';
import {
  MOCK_THREADS,
  MOCK_THREAD_DETAIL
} from '../services/api';
import { AppModule, PresenceStatus } from '../types/connect';
import { Thread, ThreadDetail } from '../types/mail';
import { Server, Zap, LayoutGrid } from 'lucide-react';

export const AxiomConnectApp: React.FC = () => {
  const [activeModule, setActiveModule] = useState<AppModule>('dispatch');
  const [presence, setPresence] = useState<PresenceStatus>('available');
  const [isRelayControlOpen, setIsRelayControlOpen] = useState(false);

  // Dispatch State
  const [threads, setThreads] = useState<Thread[]>(MOCK_THREADS);
  const [selectedThread, setSelectedThread] = useState<ThreadDetail | null>(MOCK_THREAD_DETAIL);

  // Active Session State
  const [activeSession, setActiveSession] = useState<{ id: string; title: string } | null>(null);

  const handleLaunchSession = (sessionId: string, title: string) => {
    setActiveSession({ id: sessionId, title });
    setActiveModule('session');
    setPresence('in_meeting');
  };

  const handleLeaveSession = () => {
    setActiveSession(null);
    setActiveModule('schedule');
    setPresence('available');
  };

  const handleSelectThread = (id: string) => {
    const matched = threads.find((t) => t.id === id);
    if (matched) {
      setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, is_read: true } : t)));
      if (id === 't-101') {
        setSelectedThread(MOCK_THREAD_DETAIL);
      } else {
        setSelectedThread({
          ...matched,
          is_read: true,
          messages: [
            {
              id: `msg-${id}`,
              thread_id: id,
              message_id: `<${id}@axiomconnect.com>`,
              from_address: 'alex.chen@cloudsystems.io',
              from_name: 'Alex Chen',
              to_addresses: ['d.asiedu@axiomconnect.com'],
              subject: matched.subject,
              body_plain: matched.snippet || '',
              body_html: `<p>${matched.snippet}</p>`,
              is_read: true,
              is_starred: matched.is_starred,
              is_draft: false,
              has_attachments: matched.has_attachments,
              received_at: matched.last_message_at
            }
          ]
        });
      }
    }
  };

  const handleToggleStar = (id: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_starred: !t.is_starred } : t))
    );
    if (selectedThread && selectedThread.id === id) {
      setSelectedThread({ ...selectedThread, is_starred: !selectedThread.is_starred });
    }
  };

  const handleDeleteThread = (id: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== id));
    setSelectedThread(null);
  };

  const handleSendEmail = (data: { to: string; subject: string; body: string; fromAddress?: string; sessionLink?: string }) => {
    const newId = `t-${Date.now()}`;
    const newThread: Thread = {
      id: newId,
      subject: data.subject,
      snippet: data.body.slice(0, 100),
      last_message_at: new Date().toISOString(),
      message_count: 1,
      is_read: true,
      is_starred: false,
      has_attachments: !!data.sessionLink,
      ai_category: 'primary',
      created_at: new Date().toISOString()
    };
    setThreads([newThread, ...threads]);
    handleSelectThread(newId);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans antialiased text-slate-900">
      {/* Top Global Bar */}
      <header className="h-14 bg-slate-900 text-white border-b border-slate-800 px-4 flex items-center justify-between shrink-0 select-none z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center font-black text-white shadow-md">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 tracking-tight text-sm">Axiom Connect</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Enterprise Suite
              </span>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="w-96">
          <input
            type="text"
            placeholder="Search across Dispatch, Nexus, Forge Apps, Flows, and Vault..."
            className="w-full bg-slate-800/80 hover:bg-slate-800 text-xs text-slate-200 placeholder-slate-400 px-3.5 py-2 rounded-xl border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
          />
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveModule('forge')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 text-purple-300 text-xs font-semibold border border-purple-500/30 transition"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Forge Studio</span>
          </button>

          <button
            onClick={() => setActiveModule('flow')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900 text-amber-300 text-xs font-semibold border border-amber-500/30 transition"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Flow Engine</span>
          </button>

          <button
            onClick={() => setIsRelayControlOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Server className="w-3.5 h-3.5 text-blue-400" />
            <span>Relay Control</span>
          </button>

          {activeSession && (
            <button
              onClick={() => setActiveModule('session')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold animate-pulse shadow-md"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>In Session ({activeSession.id})</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Rail */}
        <NavigationRail
          activeModule={activeModule}
          onSelectModule={(mod) => {
            if (mod === 'session' && !activeSession) {
              handleLaunchSession('AXM-492-831', 'Axiom Telepresence Session');
            } else {
              setActiveModule(mod);
            }
          }}
          unreadMailCount={3}
          unreadChatCount={2}
          presence={presence}
          onChangePresence={setPresence}
        />

        {/* Active Module Canvas */}
        <main className="flex-1 flex overflow-hidden bg-white">
          {activeModule === 'dispatch' && (
            <AxiomDispatchView
              threads={threads}
              selectedThread={selectedThread}
              onSelectThread={handleSelectThread}
              onToggleStar={handleToggleStar}
              onDeleteThread={handleDeleteThread}
              onLaunchSession={handleLaunchSession}
              onSendEmail={handleSendEmail}
              onOpenRelayControl={() => setIsRelayControlOpen(true)}
            />
          )}

          {activeModule === 'schedule' && (
            <AxiomScheduleView onJoinSession={handleLaunchSession} />
          )}

          {activeModule === 'nexus' && (
            <AxiomNexusView onLaunchSession={handleLaunchSession} />
          )}

          {activeModule === 'session' && (
            <AxiomSessionRoom
              sessionId={activeSession?.id || 'AXM-492-831'}
              title={activeSession?.title || 'Axiom Telepresence Room'}
              onLeaveSession={handleLeaveSession}
            />
          )}

          {activeModule === 'forge' && <AxiomForgeHub />}

          {activeModule === 'flow' && <AxiomFlowEngine />}

          {activeModule === 'vault' && <AxiomVaultView />}

          {activeModule === 'directory' && (
            <div className="flex-1 p-8 bg-slate-50 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-base font-bold text-slate-900">Axiom Organization Directory</h1>
                  <p className="text-xs text-slate-500">Corporate directory with department hierarchy & real-time presence</p>
                </div>
                <button
                  onClick={() => setIsRelayControlOpen(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold"
                >
                  Manage Directory
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: 'Dr. Danquah', title: 'Principal Investigator', dept: 'Cyber Defense Research', email: 'dr.danquah@university.edu', presence: 'in_meeting' },
                  { name: 'David Asiedu', title: 'Cybersecurity Systems Architect', dept: 'Autonomous Defense & Systems', email: 'd.asiedu@axiomconnect.com', presence: 'available' },
                  { name: 'Sarah Chen', title: 'Lead Security Engineer', dept: 'Cloud SecOps & Zero Trust', email: 'sarah.c@cloudsecurity.io', presence: 'available' },
                  { name: 'Mike Ross', title: 'SRE Specialist', dept: 'Relay Transport & Reliability', email: 'm.ross@expediteconsults.com', presence: 'busy' },
                  { name: 'Security Operations (SOC)', title: 'Team Ingress Gateway', dept: 'Security Incident Response', email: 'security-ops@axiomconnect.com', presence: 'available' },
                  { name: 'Executive Boardroom 402', title: 'Facility Resource', dept: 'East Wing (Cap: 18)', email: 'conf-room-402@axiomconnect.com', presence: 'available' },
                ].map((c) => (
                  <div key={c.email} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-600 font-medium">{c.title}</p>
                      <p className="text-[11px] text-slate-400">{c.dept}</p>
                      <p className="text-xs text-blue-600 font-mono mt-1">{c.email}</p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => setActiveModule('dispatch')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md"
                      >
                        Dispatch
                      </button>
                      <button
                        onClick={() => handleLaunchSession('AXM-492-831', `Session with ${c.name}`)}
                        className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-semibold rounded-md"
                      >
                        Start Session
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeModule === 'intelligence' && (
            <div className="flex-1 p-8 bg-slate-50 max-w-3xl mx-auto overflow-y-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold">
                  AI
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">Axiom Pulse AI Intelligence Engine</h1>
                  <p className="text-xs text-slate-500">Cross-app assistant analyzing Dispatches, Nexus threads, Sessions, Forge Apps, and Flow Pipelines</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <span className="font-bold text-violet-700 uppercase tracking-wider text-[10px]">Active Synthesis & Pipeline Status</span>
                  <p className="text-slate-800 text-sm font-semibold">
                    1. PhD Proposal Committee review session scheduled for Thursday 2:00 PM with Dr. Danquah.
                  </p>
                  <p className="text-slate-600">
                    2. Axiom Flow active: Auto-escalating incident emails to Nexus #cyber-defense-loops.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Relay Control Console Modal */}
      <AxiomRelayControl
        isOpen={isRelayControlOpen}
        onClose={() => setIsRelayControlOpen(false)}
      />
    </div>
  );
};
