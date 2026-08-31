'use client';

import React, { useState } from 'react';
import {
  Zap, Play, Plus, ArrowDown, Mail, MessageSquare, Video,
  HardDrive, CheckCircle2, AlertCircle, Sparkles, X, SlidersHorizontal,
  Clock, ShieldCheck
} from 'lucide-react';
import { AutomatedFlow } from '../types/connect';

export const MOCK_FLOWS: AutomatedFlow[] = [
  {
    id: 'fl-1',
    name: 'Auto-Escalate Critical Incident Emails to Teams',
    description: 'When an email marked Urgent or Security Alert arrives in Outlook, parse the threat indicators and post an approval card into Teams.',
    isActive: true,
    triggerApp: 'Outlook Mail',
    actionSummary: 'Teams Channel Post → Axiom Meet Video Room → MinIO Archive',
    totalRuns: 342,
    lastRunStatus: 'success',
    lastRunTime: '4 mins ago',
    steps: [
      {
        id: 's-1',
        type: 'trigger',
        title: 'When a new email arrives (Outlook)',
        description: 'Filter: Category is "Urgent" OR Subject contains "Security Alert"',
        app: 'outlook',
        icon: 'Mail'
      },
      {
        id: 's-2',
        type: 'condition',
        title: 'Condition: Risk Score >= 85 (AI DLP Analysis)',
        description: 'Verify if sender domain is untrusted or contains malware hashes',
        app: 'ai',
        icon: 'Sparkles'
      },
      {
        id: 's-3',
        type: 'action',
        title: 'Action 1: Post Adaptive Card to Teams',
        description: 'Target: Channel #cyber-defense-loops with 1-click [Quarantine] and [Approve] buttons',
        app: 'teams',
        icon: 'MessageSquare'
      },
      {
        id: 's-4',
        type: 'action',
        title: 'Action 2: Provision Instant Axiom Video War Room',
        description: 'Generate WebRTC meeting AXM-492-831 and notify on-call SREs',
        app: 'meetings',
        icon: 'Video'
      },
      {
        id: 's-5',
        type: 'action',
        title: 'Action 3: Save Attached Evidence to Axiom Drive',
        description: 'Target Folder: /Security_Audits/2026/Incident_Captures',
        app: 'drive',
        icon: 'HardDrive'
      }
    ]
  },
  {
    id: 'fl-2',
    name: 'Automated Change Request Approval Flow',
    description: 'When a Change Request form is submitted in Power Apps, request manager approval via Teams and schedule implementation in Calendar.',
    isActive: true,
    triggerApp: 'Power Apps Form',
    actionSummary: 'Manager Approval in Teams → Calendar Event Creation',
    totalRuns: 128,
    lastRunStatus: 'success',
    lastRunTime: '2 hours ago',
    steps: [
      {
        id: 's-21',
        type: 'trigger',
        title: 'When a Change Request record is created (Power Apps)',
        description: 'Trigger on new submission in table: custom_table_records',
        app: 'exchange',
        icon: 'SlidersHorizontal'
      },
      {
        id: 's-22',
        type: 'action',
        title: 'Send Approval Request to Teams DM',
        description: 'Send direct card to Dr. Danquah with approve/reject actions',
        app: 'teams',
        icon: 'MessageSquare'
      },
      {
        id: 's-23',
        type: 'action',
        title: 'Schedule Maintenance Window in Calendar',
        description: 'Block deployment slot on Saturday 2:00 AM',
        app: 'calendar',
        icon: 'Clock'
      }
    ]
  }
];

export const PowerAutomateFlowBuilder: React.FC = () => {
  const [flows, setFlows] = useState<AutomatedFlow[]>(MOCK_FLOWS);
  const [selectedFlow, setSelectedFlow] = useState<AutomatedFlow>(MOCK_FLOWS[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);

  const handleRunSimulator = () => {
    setIsSimulating(true);
    setSimulationLog(['[00:00.010] Trigger fired: Mock Urgent Security Email received from SOC...']);

    setTimeout(() => {
      setSimulationLog((prev) => [...prev, '[00:00.240] Condition matched: Risk Score 92/100']);
    }, 400);

    setTimeout(() => {
      setSimulationLog((prev) => [...prev, '[00:00.580] Action 1: Dispatched Adaptive Card to Teams #cyber-defense-loops']);
    }, 800);

    setTimeout(() => {
      setSimulationLog((prev) => [...prev, '[00:00.910] Action 2: Generated Axiom Video Room AXM-492-831']);
    }, 1200);

    setTimeout(() => {
      setSimulationLog((prev) => [
        ...prev,
        '[00:01.200] Action 3: Evidence payload archived to MinIO S3 bucket: axiom-attachments',
        '✓ Flow run completed with status 200 OK (Total latency: 1200ms)'
      ]);
      setIsSimulating(false);
    }, 1600);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-50">
      {/* Top Automate Header */}
      <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm text-slate-900">Axiom Power Automate Workflow Studio</h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                Logic Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Cross-app automation connecting Outlook, Teams, Exchange, Calendar, and WebRTC Meetings</p>
          </div>
        </div>

        <button
          onClick={handleRunSimulator}
          disabled={isSimulating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>{isSimulating ? 'Executing Workflow...' : 'Test & Run Flow'}</span>
        </button>
      </div>

      {/* Main 2-Pane Flow Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Flow List */}
        <div className="w-80 bg-white border-r border-slate-200 p-4 shrink-0 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Configured Cloud Flows</p>
            {flows.map((fl) => {
              const isSelected = selectedFlow.id === fl.id;
              return (
                <div
                  key={fl.id}
                  onClick={() => {
                    setSelectedFlow(fl);
                    setSimulationLog([]);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition select-none ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900 truncate">{fl.name}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{fl.description}</p>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>{fl.totalRuns} runs</span>
                    <span>{fl.lastRunTime}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs">
            <span className="font-bold text-purple-950 block mb-1">Axiom Event Bus</span>
            <p className="text-[11px] text-purple-800">
              Redis PubSub event dispatcher listens for Outlook emails, Teams messages, and WebRTC video triggers.
            </p>
          </div>
        </div>

        {/* Right Visual Flow Canvas */}
        <div className="flex-1 p-8 overflow-y-auto flex flex-col items-center">
          <div className="w-full max-w-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">{selectedFlow.name}</h2>
                <p className="text-xs text-slate-500">{selectedFlow.description}</p>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-200/80 px-2.5 py-1 rounded-lg">
                {selectedFlow.steps.length} Steps
              </span>
            </div>

            {/* Visual Steps Pipeline */}
            <div className="flex flex-col items-center space-y-3 py-4">
              {selectedFlow.steps.map((step, idx) => {
                const isLast = idx === selectedFlow.steps.length - 1;
                return (
                  <React.Fragment key={step.id}>
                    <div className="w-full p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-4 hover:border-blue-400 transition">
                      <div
                        className={`p-2.5 rounded-xl text-white font-bold shrink-0 ${
                          step.type === 'trigger'
                            ? 'bg-blue-600'
                            : step.type === 'condition'
                            ? 'bg-violet-600'
                            : 'bg-emerald-600'
                        }`}
                      >
                        {step.app === 'outlook' && <Mail className="w-5 h-5" />}
                        {step.app === 'ai' && <Sparkles className="w-5 h-5" />}
                        {step.app === 'teams' && <MessageSquare className="w-5 h-5" />}
                        {step.app === 'meetings' && <Video className="w-5 h-5" />}
                        {step.app === 'drive' && <HardDrive className="w-5 h-5" />}
                        {step.app === 'calendar' && <Clock className="w-5 h-5" />}
                        {step.app === 'exchange' && <SlidersHorizontal className="w-5 h-5" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{step.title}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {step.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.description}</p>
                      </div>
                    </div>

                    {!isLast && (
                      <div className="flex flex-col items-center text-slate-400">
                        <div className="w-0.5 h-4 bg-slate-300" />
                        <ArrowDown className="w-4 h-4 text-slate-400 -my-1" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Simulation Log Console */}
            {simulationLog.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs space-y-1.5 shadow-xl border border-slate-800 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] font-bold text-slate-400">
                  <span>Execution Output Console</span>
                  <span className="text-emerald-400">STATUS: 200 OK</span>
                </div>
                {simulationLog.map((log, i) => (
                  <p key={i} className={log.startsWith('✓') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                    {log}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
