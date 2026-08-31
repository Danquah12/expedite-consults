'use client';

import React, { useState } from 'react';
import {
  Hash, Lock, Video, Phone, Plus, Send, Smile, Paperclip,
  Sparkles, Users, Search, MoreVertical, MessageSquare, ShieldCheck
} from 'lucide-react';
import { TeamsChannel, ChatMessage, UserPresence } from '../types/connect';

interface TeamsChatViewProps {
  onLaunchMeeting: (meetingId: string, title: string) => void;
}

const MOCK_CHANNELS: TeamsChannel[] = [
  { id: 'ch-1', name: 'general', topic: 'Company-wide announcements & updates' },
  { id: 'ch-2', name: 'cyber-defense-loops', topic: 'PhD Research & Autonomous Loop Mitigation Benchmarks', unreadCount: 2 },
  { id: 'ch-3', name: 'engineering', topic: 'Platform SRE, Postfix MTA, & Dovecot LMTP' },
  { id: 'ch-4', name: 'security-audits', topic: 'Client compliance, SOC alerts, & Zero Trust' },
];

const MOCK_COLLEAGUES: UserPresence[] = [
  { id: 'u-1', name: 'Dr. Danquah', email: 'dr.danquah@university.edu', status: 'in_meeting', title: 'Principal Investigator' },
  { id: 'u-2', name: 'Sarah Chen', email: 'sarah.c@cloudsecurity.io', status: 'available', title: 'Lead Security Engineer' },
  { id: 'u-3', name: 'Mike Ross', email: 'm.ross@expediteconsults.com', status: 'busy', title: 'SRE Specialist' },
  { id: 'u-4', name: 'Alex Chen', email: 'alex@cloudsystems.io', status: 'away', title: 'DevOps Architect' },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'ch-2': [
    {
      id: 'm-1',
      sender: MOCK_COLLEAGUES[0],
      content: 'Good morning team. I reviewed the autonomous mitigation loop benchmarks in Section 4. The response latency drop under simulated DDoS is outstanding.',
      timestamp: '10:15 AM',
      reactions: { '👍': 4, '🚀': 3 }
    },
    {
      id: 'm-2',
      sender: { id: 'me', name: 'David Asiedu', email: 'd.asiedu@axiomconnect.com', status: 'available' },
      content: 'Thank you Dr. Danquah. We integrated the reinforcement learning feedback loops with our real-time telemetry agent.',
      timestamp: '10:18 AM'
    },
    {
      id: 'm-3',
      sender: MOCK_COLLEAGUES[1],
      content: 'I have attached the network packet traces and SIEM rule definitions to verify against the PhD proposal draft.',
      timestamp: '10:22 AM',
      attachments: [{ filename: 'Mitigation_Loop_Traces_v2.pcap', size: '4.2 MB', type: 'pcap' }]
    },
    {
      id: 'm-4',
      sender: MOCK_COLLEAGUES[0],
      content: 'Let’s sync live to finalize the committee presentation slide deck.',
      timestamp: '10:25 AM',
      meetingCard: {
        meetingId: 'AXM-492-831',
        title: 'Autonomous Cyber Defense Loops: Live Committee Sync',
        time: 'Live Now (3 Participants)',
        link: 'https://meet.axiom.com/AXM-492-831'
      }
    }
  ]
};

export const TeamsChatView: React.FC<TeamsChatViewProps> = ({ onLaunchMeeting }) => {
  const [activeChannelId, setActiveChannelId] = useState<string>('ch-2');
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');

  const currentChannel = MOCK_CHANNELS.find((c) => c.id === activeChannelId) || MOCK_CHANNELS[0];
  const channelMessages = messages[activeChannelId] || [];

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: { id: 'me', name: 'David Asiedu', email: 'd.asiedu@axiomconnect.com', status: 'available' },
      content: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMsg]
    }));
    setInputText('');
  };

  const handleStartInstantCall = () => {
    onLaunchMeeting('AXM-492-831', `#${currentChannel.name} Video Sync`);
  };

  return (
    <div className="flex-1 flex h-[calc(100vh-4rem)] overflow-hidden bg-white">
      {/* Teams Channel & DM Sidebar */}
      <div className="w-64 bg-slate-50 border-r border-slate-200 p-3 shrink-0 flex flex-col justify-between select-none">
        <div className="space-y-4">
          {/* Org Header */}
          <div className="px-2 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-900">Axiom Workspace</h2>
              <span className="text-[10px] text-slate-500 font-medium">Enterprise Teams</span>
            </div>
            <button className="p-1 text-slate-500 hover:text-slate-900 rounded-md">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Channels Section */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Channels</p>
            {MOCK_CHANNELS.map((ch) => {
              const isActive = activeChannelId === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannelId(ch.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-purple-100 text-purple-950 font-bold'
                      : 'text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{ch.name}</span>
                  </div>
                  {ch.unreadCount && ch.unreadCount > 0 ? (
                    <span className="bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {ch.unreadCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Direct Messages Section with Presence Dots */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Direct Messages</p>
            {MOCK_COLLEAGUES.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-200/50 cursor-pointer font-medium"
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-bold text-[10px] flex items-center justify-center">
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
                        user.status === 'available'
                          ? 'bg-emerald-500'
                          : user.status === 'in_meeting'
                          ? 'bg-purple-600'
                          : user.status === 'busy'
                          ? 'bg-red-500'
                          : 'bg-amber-500'
                      }`}
                    />
                  </div>
                  <span className="truncate">{user.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Quick Call Launcher */}
        <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-purple-950 mb-1">
            <Video className="w-3.5 h-3.5 text-purple-700" />
            <span>Axiom Meet Video Room</span>
          </div>
          <button
            onClick={handleStartInstantCall}
            className="mt-1.5 w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Launch #{currentChannel.name} Call</span>
          </button>
        </div>
      </div>

      {/* Main Chat Stream */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        {/* Channel Header */}
        <div className="h-14 border-b border-slate-200 px-5 flex items-center justify-between shrink-0 bg-white">
          <div>
            <div className="flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-slate-500" />
              <h1 className="text-sm font-bold text-slate-900">{currentChannel.name}</h1>
            </div>
            <p className="text-[11px] text-slate-500">{currentChannel.topic}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartInstantCall}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Meet in Channel</span>
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-700 rounded-lg">
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {channelMessages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {msg.sender.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-900">{msg.sender.name}</span>
                  <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                </div>

                <div className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100 max-w-2xl">
                  <p>{msg.content}</p>

                  {/* Embedded Meeting Card inside Chat */}
                  {msg.meetingCard && (
                    <div className="mt-3 p-3 rounded-xl bg-purple-600 text-white flex items-center justify-between shadow-md">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-white/20">
                          <Video className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">{msg.meetingCard.title}</p>
                          <p className="text-[11px] text-purple-200">{msg.meetingCard.time}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onLaunchMeeting(msg.meetingCard!.meetingId, msg.meetingCard!.title)}
                        className="px-3 py-1.5 bg-white hover:bg-purple-50 text-purple-900 rounded-lg text-xs font-bold shadow-sm transition"
                      >
                        Join Now
                      </button>
                    </div>
                  )}

                  {/* Attachments */}
                  {msg.attachments && (
                    <div className="mt-2 space-y-1">
                      {msg.attachments.map((att) => (
                        <div
                          key={att.filename}
                          className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800"
                        >
                          <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                          <span>{att.filename}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({att.size})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reactions */}
                {msg.reactions && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {Object.entries(msg.reactions).map(([emoji, count]) => (
                      <span
                        key={emoji}
                        className="text-[11px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1 text-slate-700"
                      >
                        <span>{emoji}</span>
                        <span className="font-bold">{count}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Message Input Box */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="rounded-2xl border border-slate-300 p-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={2}
              placeholder={`Message #${currentChannel.name}...`}
              className="w-full text-xs text-slate-800 outline-none resize-none placeholder-slate-400"
            />

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1 text-slate-500">
                <button className="p-1.5 hover:bg-slate-100 rounded-md transition"><Paperclip className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-slate-100 rounded-md transition"><Smile className="w-4 h-4" /></button>
                <button
                  onClick={handleStartInstantCall}
                  title="Insert Video Room"
                  className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-md transition flex items-center gap-1 text-xs font-semibold"
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleSendMessage}
                className="flex items-center gap-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
