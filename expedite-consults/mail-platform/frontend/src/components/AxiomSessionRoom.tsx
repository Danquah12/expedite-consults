'use client';

import React, { useState } from 'react';
import {
  Mic, MicOff, Video, VideoOff, Monitor, Hand, MessageSquare,
  Users, PhoneOff, Sparkles, CheckSquare, ListChecks, ShieldCheck,
  Send, Radio
} from 'lucide-react';
import { SessionParticipant, SessionDecision, SessionActionItem } from '../types/connect';

interface AxiomSessionRoomProps {
  sessionId: string;
  title: string;
  onLeaveSession: () => void;
}

const INITIAL_PARTICIPANTS: SessionParticipant[] = [
  { id: 'p-1', name: 'Dr. Danquah', email: 'dr.danquah@university.edu', isMuted: false, isVideoOff: false, isScreenSharing: false, isSpeaking: true, role: 'host' },
  { id: 'p-2', name: 'David Asiedu (You)', email: 'd.asiedu@axiomconnect.com', isMuted: false, isVideoOff: false, isScreenSharing: false, isSpeaking: false, role: 'presenter' },
  { id: 'p-3', name: 'Sarah Chen', email: 'sarah.c@cloudsecurity.io', isMuted: false, isVideoOff: false, isScreenSharing: false, isSpeaking: false, role: 'attendee' },
  { id: 'p-4', name: 'Mike Ross', email: 'm.ross@expediteconsults.com', isMuted: true, isVideoOff: true, isScreenSharing: false, isSpeaking: false, role: 'attendee' },
];

export const AxiomSessionRoom: React.FC<AxiomSessionRoomProps> = ({
  sessionId,
  title,
  onLeaveSession
}) => {
  const [participants, setParticipants] = useState<SessionParticipant[]>(INITIAL_PARTICIPANTS);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pulse_ai' | 'chat' | 'people'>('pulse_ai');
  const [handRaised, setHandRaised] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [sessionChat, setSessionChat] = useState([
    { sender: 'Dr. Danquah', text: 'Section 4 diagrams look ready for presentation.', time: '10:31 AM' },
    { sender: 'Sarah Chen', text: 'I am verifying the packet captures now.', time: '10:33 AM' }
  ]);

  const [decisions, setDecisions] = useState<SessionDecision[]>([
    { id: 'd-1', text: 'Approved Section 4 Multi-Agent RL mitigation loop architecture for dissertation committee submission.' },
    { id: 'd-2', text: 'Agreed to conduct mock committee defense session on Thursday at 2:00 PM.' }
  ]);

  const [actionItems, setActionItems] = useState<SessionActionItem[]>([
    { id: 'a-1', assignee: 'David Asiedu', task: 'Finalize latency benchmark graphs and attach to PhD proposal draft', is_done: true },
    { id: 'a-2', assignee: 'Sarah Chen', task: 'Upload PCAP packet traces to Axiom Vault folder', is_done: false },
    { id: 'a-3', assignee: 'Dr. Danquah', task: 'Send formal invitation to external dissertation committee reviewers', is_done: false },
  ]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setParticipants((prev) =>
      prev.map((p) => (p.id === 'p-2' ? { ...p, isMuted: !isMuted } : p))
    );
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    setParticipants((prev) =>
      prev.map((p) => (p.id === 'p-2' ? { ...p, isVideoOff: !isVideoOff } : p))
    );
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    setParticipants((prev) =>
      prev.map((p) => (p.id === 'p-2' ? { ...p, isScreenSharing: !isScreenSharing } : p))
    );
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setSessionChat((prev) => [
      ...prev,
      {
        sender: 'David Asiedu',
        text: chatInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatInput('');
  };

  return (
    <div className="flex-1 bg-slate-950 text-white flex flex-col h-[calc(100vh-4rem)] overflow-hidden select-none">
      {/* Top Header */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-purple-600/20 text-purple-400 px-2.5 py-1 rounded-lg border border-purple-500/30 text-xs font-bold font-mono">
            <Radio className="w-3.5 h-3.5 animate-pulse text-purple-400" />
            <span>{sessionId}</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100">{title}</h1>
            <p className="text-[11px] text-slate-400">Axiom Encrypted Telepresence • 4 Participants</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Trust Encrypted</span>
          </div>

          <button
            onClick={() => setActiveTab(activeTab === 'pulse_ai' ? 'chat' : 'pulse_ai')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'pulse_ai'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-300" />
            <span>Pulse AI Live Synthesis</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Canvas */}
        <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
            {participants.map((p) => (
              <div
                key={p.id}
                className={`relative bg-slate-900 rounded-2xl border overflow-hidden flex flex-col items-center justify-center transition shadow-md ${
                  p.isSpeaking
                    ? 'border-purple-500 ring-2 ring-purple-500/50'
                    : 'border-slate-800'
                }`}
              >
                {p.isSpeaking && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-purple-600/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>Speaking</span>
                  </div>
                )}

                {!p.isVideoOff ? (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex flex-col items-center justify-center relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white font-bold text-2xl flex items-center justify-center shadow-xl">
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    {p.isScreenSharing && (
                      <div className="absolute inset-4 bg-slate-900/90 rounded-xl border border-slate-700 flex flex-col items-center justify-center p-4 text-center">
                        <Monitor className="w-8 h-8 text-blue-400 mb-2" />
                        <p className="text-xs font-bold text-slate-200">Screen Telepresence: Defense_Loops_Benchmarks.pdf</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-800 text-slate-400 font-bold text-2xl flex items-center justify-center">
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs">
                  <span className="font-semibold text-slate-200">{p.name}</span>
                  <div className="flex items-center gap-1.5">
                    {p.isMuted ? (
                      <MicOff className="w-3.5 h-3.5 text-red-400" />
                    ) : (
                      <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Floating Control Bar */}
          <div className="h-16 flex items-center justify-center shrink-0 mt-3">
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 px-5 py-2 rounded-2xl flex items-center gap-3 shadow-2xl">
              <button
                onClick={toggleMute}
                className={`p-3 rounded-xl transition ${
                  isMuted ? 'bg-red-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleVideo}
                className={`p-3 rounded-xl transition ${
                  isVideoOff ? 'bg-red-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleScreenShare}
                className={`p-3 rounded-xl transition ${
                  isScreenSharing ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <Monitor className="w-5 h-5" />
              </button>

              <button
                onClick={() => setHandRaised(!handRaised)}
                className={`p-3 rounded-xl transition ${
                  handRaised ? 'bg-amber-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <Hand className="w-5 h-5" />
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`p-3 rounded-xl transition ${
                  activeTab === 'chat' ? 'bg-purple-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              <button
                onClick={() => setActiveTab('people')}
                className={`p-3 rounded-xl transition ${
                  activeTab === 'people' ? 'bg-purple-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <Users className="w-5 h-5" />
              </button>

              <div className="h-6 w-px bg-slate-700 mx-1" />

              <button
                onClick={onLeaveSession}
                className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Exit Session</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Drawer */}
        <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-hidden">
          <div className="h-12 border-b border-slate-800 flex text-xs font-bold">
            <button
              onClick={() => setActiveTab('pulse_ai')}
              className={`flex-1 flex items-center justify-center gap-1.5 transition ${
                activeTab === 'pulse_ai'
                  ? 'border-b-2 border-violet-500 text-violet-400 bg-slate-800/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pulse AI Minutes</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex items-center justify-center gap-1.5 transition ${
                activeTab === 'chat'
                  ? 'border-b-2 border-blue-500 text-blue-400 bg-slate-800/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('people')}
              className={`flex-1 flex items-center justify-center gap-1.5 transition ${
                activeTab === 'people'
                  ? 'border-b-2 border-blue-500 text-blue-400 bg-slate-800/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>People ({participants.length})</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {activeTab === 'pulse_ai' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-violet-950/40 border border-violet-800/40 space-y-2">
                  <div className="flex items-center gap-1.5 text-violet-400 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Real-Time Telepresence Synthesis</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-normal">
                    Dr. Danquah reviewed the reinforcement learning mitigation loop response curve. Consensus reached on submitting the PhD proposal with Section 4 benchmarks.
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4 text-violet-400" />
                    <span>Recorded Decisions ({decisions.length})</span>
                  </p>
                  <div className="space-y-2">
                    {decisions.map((dec) => (
                      <div key={dec.id} className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 leading-snug">
                        ✓ {dec.text}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    <span>Assigned Action Items ({actionItems.length})</span>
                  </p>
                  <div className="space-y-2">
                    {actionItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 flex items-start gap-2"
                      >
                        <input
                          type="checkbox"
                          checked={item.is_done}
                          onChange={() => {
                            setActionItems(actionItems.map(a => a.id === item.id ? { ...a, is_done: !a.is_done } : a));
                          }}
                          className="mt-0.5 rounded text-violet-600 focus:ring-0"
                        />
                        <div>
                          <p className="font-semibold text-slate-200">{item.task}</p>
                          <span className="text-[10px] text-violet-400 font-medium">Assignee: {item.assignee}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col justify-between h-full">
                <div className="space-y-3 overflow-y-auto">
                  {sessionChat.map((m, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-purple-400">{m.sender}</span>
                        <span className="text-[10px] text-slate-500">{m.time}</span>
                      </div>
                      <p className="text-slate-300 leading-normal">{m.text}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 mt-auto">
                  <div className="flex items-center gap-1 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                      placeholder="Message session..."
                      className="w-full bg-transparent px-2 py-1 text-xs text-slate-200 outline-none"
                    />
                    <button onClick={handleSendChat} className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'people' && (
              <div className="space-y-2">
                {participants.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center">
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">{p.name}</p>
                        <span className="text-[10px] text-slate-400 uppercase">{p.role}</span>
                      </div>
                    </div>
                    {p.isMuted ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
