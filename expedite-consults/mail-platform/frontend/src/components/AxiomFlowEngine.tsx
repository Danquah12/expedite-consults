'use client';

import React, { useState } from 'react';
import {
  Zap, Play, Plus, ArrowDown, Mail, MessageSquare, Video,
  HardDrive, CheckCircle2, AlertCircle, Sparkles, X, SlidersHorizontal,
  Clock, ShieldCheck
} from 'lucide-react';
import { AutomatedPipeline } from '../types/connect';

export const MOCK_PIPELINES: AutomatedPipeline[] = [
  {
    id: 'fl-1',
    name: 'Auto-Escalate Critical Incident Emails to Nexus',
    description: 'When an email marked Urgent or Security Alert arrives in Dispatch, parse the threat indicators and post an approval card into Nexus.',
    isActive: true,
    triggerApp: 'Axiom Dispatch',
    actionSummary: 'Nexus Channel Post → Axiom Session Telepresence → Vault Archive',
    totalRuns: 342,
    lastRunStatus: 'success',
    lastRunTime: '4 mins ago',
    steps: [
      {
        id: 's-1',
        type: 'trigger',
        title: 'When a new dispatch arrives (Axiom Dispatch)',
        description: 'Filter: Category is "Urgent" OR Subject contains "Security Alert"',
        app: 'dispatch',
        icon: 'Mail'
      },
      {
        id: 's-2',
        type: 'condition',
        title: 'Condition: Risk Score >= 85 (Pulse AI Analysis)',
        description: 'Verify if sender domain is untrusted or contains malware signatures',
        app: 'intelligence',
        icon: 'Sparkles'
      },
      {
        id: 's-3',
        type: 'action',
        title: 'Action 1: Post Action Card to Nexus',
        description: 'Target: Workspace #cyber-defense-loops with 1-click [Quarantine] and [Approve] triggers',
        app: 'nexus',
        icon: 'MessageSquare'
      },
      {
        id: 's-4',
        type: 'action',
        title: 'Action 2: Provision Instant Axiom Session War Room',
        description: 'Generate Telepresence room AXM-492-831 and alert on-call SREs',
        app: 'dispatch',
        icon: 'Video'
      },
      {
        id: 's-5',
        type: 'action',
        title: 'Action 3: Store Evidence in Axiom Vault',
        description: 'Target Folder: /Security_Audits/2026/Incident_Captures',
        app: 'vault',
        icon: 'HardDrive'
      }
    ]
  },
  {
    id: 'fl-2',
    name: 'Automated Change Request Approval Pipeline',
    description: 'When a Change Request form is submitted in Forge, request review via Nexus and schedule deployment in Schedule.',
    isActive: true,
    triggerApp: 'Axiom Forge Form',
    actionSummary: 'Peer Review in Nexus → Schedule Event Allocation',
    totalRuns: 128,
    lastRunStatus: 'success',
    lastRunTime: '2 hours ago',
    steps: [
      {
        id: 's-21',
        type: 'trigger',
        title: 'When a Change Request is submitted (Forge)',
        description: 'Trigger on new record in entity: custom_table_records',
        app: 'relay',
        icon: 'SlidersHorizontal'
      },
      {
        id: 's-22',
        type: 'action',
        title: 'Send Approval Card to Direct Sync',
        description: 'Send direct review prompt to Dr. Danquah with approve/reject actions',
        app: 'nexus',
        icon: 'MessageSquare'
      },
      {
        id: 's-23',
        type: 'action',
        title: 'Schedule Maintenance Window',
        description: 'Block deployment slot on Saturday 2:00 AM in Schedule',
        app: 'schedule',
        icon: 'Clock'
      }
    ]
  }
];

export const AxiomFlowEngine: React.FC = () => {
  const [pipelines, setPipelines] = useState<AutomatedPipeline[]>(MOCK_PIPELINES);
  const [selectedPipeline, setSelectedPipeline] = useState<AutomatedPipeline>(MOCK_PIPELINES[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);

  const handleRunSimulator = () => {
    setIsSimulating(true);
    setSimulationLog(['[00:00.010] Trigger fired: Urgent Security Dispatch received from SOC gateway...']);

    setTimeout(() => {
      setSimulationLog((prev) => [...prev, '[00:00.240] Condition matched: Pulse AI Risk Score 92/100']);
    }, 400);

    setTimeout(() => {
      setSimulationLog((prev) => [...prev, '[00:00.580] Action 1: Dispatched Action Card to Nexus #cyber-defense-loops']);
    }, 800);

    setTimeout(() => {
      setSimulationLog((prev) => [...prev, '[00:00.910] Action 2: Generated Axiom Session Room AXM-492-831']);
    }, 1200);

    setTimeout(() => {
      setSimulationLog((prev) => [
        ...prev,
        '[00:01.200] Action 3: Evidence payload archived to Axiom Vault S3 bucket: axiom-attachments',
        '✓ Pipeline execution completed with status 200 OK (Total latency: 1200ms)'
      ]);
      setIsSimulating(false);
    }, 1600);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-50">
      {/* Top Header */}
      <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm text-slate-900">Axiom Flow Pipeline Studio</h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                Logic Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Cross-application visual automation connecting Dispatch, Nexus, Relay, Schedule, and Session</p>
          </div>
        </div>

        <button
          onClick={handleRunSimulator}
          disabled={isSimulating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>{isSimulating ? 'Executing Pipeline...' : 'Test & Run Flow'}</span>
        </button>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pipeline List */}
        <div className="w-80 bg-white border-r border-slate-200 p-4 shrink-0 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Automated Pipelines</p>
            {pipelines.map((fl) => {
              const isSelected = selectedPipeline.id === fl.id;
              return (
                <div
                  key={fl.id}
                  onClick={() => {
                    setSelectedPipeline(fl);
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
            <span className="font-bold text-purple-950 block mb-1">Axiom Event Stream</span>
            <p className="text-[11px] text-purple-800">
              Redis PubSub event engine coordinates real-time triggers across Dispatch, Nexus, and Telepresence.
            </p>
          </div>
        </div>

        {/* Right Canvas */}
        <div className="flex-1 p-8 overflow-y-auto flex flex-col items-center">
          <div className="w-full max-w-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">{selectedPipeline.name}</h2>
                <p className="text-xs text-slate-500">{selectedPipeline.description}</p>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-200/80 px-2.5 py-1 rounded-lg">
                {selectedPipeline.steps.length} Nodes
              </span>
            </div>

            {/* Pipeline Step Cards */}
            <div className="flex flex-col items-center space-y-3 py-4">
              {selectedPipeline.steps.map((step, idx) => {
                const isLast = idx === selectedPipeline.steps.length - 1;
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
                        {step.app === 'dispatch' && <Mail className="w-5 h-5" />}
                        {step.app === 'intelligence' && <Sparkles className="w-5 h-5" />}
                        {step.app === 'nexus' && <MessageSquare className="w-5 h-5" />}
                        {step.app === 'vault' && <HardDrive className="w-5 h-5" />}
                        {step.app === 'schedule' && <Clock className="w-5 h-5" />}
                        {step.app === 'relay' && <SlidersHorizontal className="w-5 h-5" />}
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
                  <span>Pipeline Execution Telemetry</span>
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
