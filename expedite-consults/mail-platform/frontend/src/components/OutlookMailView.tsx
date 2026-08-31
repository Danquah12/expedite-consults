'use client';

import React, { useState } from 'react';
import {
  Mail, Video, Plus, Trash2, Reply, Forward, Flag, Sparkles,
  Paperclip, Star, Search, ShieldCheck, Calendar, Clock,
  CheckCircle, ArrowRight, X, Maximize2, Minimize2, Send,
  Users, Building, Server, ChevronDown
} from 'lucide-react';
import { Thread, ThreadDetail, Message } from '../types/mail';
import { AISummaryCard } from './AISummaryCard';

interface OutlookMailViewProps {
  threads: Thread[];
  selectedThread: ThreadDetail | null;
  onSelectThread: (id: string) => void;
  onToggleStar: (id: string) => void;
  onDeleteThread: (id: string) => void;
  onLaunchMeeting: (meetingId: string, title: string) => void;
  onSendEmail: (data: { to: string; subject: string; body: string; fromAddress?: string; meetingLink?: string }) => void;
  onOpenExchangeAdmin?: () => void;
}

export const OutlookMailView: React.FC<OutlookMailViewProps> = ({
  threads,
  selectedThread,
  onSelectThread,
  onToggleStar,
  onDeleteThread,
  onLaunchMeeting,
  onSendEmail,
  onOpenExchangeAdmin
}) => {
  const [mailTab, setMailTab] = useState<'focused' | 'other'>('focused');
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [fromAddress, setFromAddress] = useState('d.asiedu@axiomconnect.com');
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [includeMeetingLink, setIncludeMeetingLink] = useState(false);
  const [generatedMeetingId, setGeneratedMeetingId] = useState('AXM-492-831');

  const filteredThreads = threads.filter((t) => {
    if (activeFolder === 'starred') return t.is_starred;
    if (activeFolder === 'shared_soc') return true;
    if (mailTab === 'focused') return t.ai_category === 'primary' || t.ai_category === 'urgent';
    return t.ai_category === 'updates' || t.ai_category === 'promotions';
  });

  const handleAddMeetingToCompose = () => {
    setIncludeMeetingLink(true);
    const newMeetingId = `AXM-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;
    setGeneratedMeetingId(newMeetingId);
  };

  const handleSendCompose = () => {
    if (!composeTo || !composeSubject) {
      alert('Please fill in recipient and subject.');
      return;
    }
    const meetingLink = includeMeetingLink ? `https://meet.axiom.com/${generatedMeetingId}` : undefined;
    onSendEmail({
      fromAddress,
      to: composeTo,
      subject: composeSubject,
      body: composeBody,
      meetingLink
    });
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    setIncludeMeetingLink(false);
    setIsComposeOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-white">
      {/* Outlook Ribbon */}
      <div className="h-12 bg-slate-50 border-b border-slate-200 px-4 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsComposeOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Mail</span>
          </button>

          <button
            onClick={() => {
              setIsComposeOpen(true);
              handleAddMeetingToCompose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-semibold border border-purple-200 transition"
          >
            <Video className="w-3.5 h-3.5 text-purple-700" />
            <span>Add Axiom Meeting</span>
          </button>

          <div className="h-5 w-px bg-slate-300 mx-1" />

          <button
            onClick={() => selectedThread && onDeleteThread(selectedThread.id)}
            disabled={!selectedThread}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <button
            disabled={!selectedThread}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-40 transition"
          >
            <Reply className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          {onOpenExchangeAdmin && (
            <button
              onClick={onOpenExchangeAdmin}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition"
            >
              <Server className="w-3.5 h-3.5 text-blue-700" />
              <span>Exchange Admin Center</span>
            </button>
          )}

          <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Exchange Transport Rules Active</span>
          </div>
        </div>
      </div>

      {/* 3-Pane Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Folder Tree + Exchange Shared Mailboxes */}
        <div className="w-60 bg-slate-50 border-r border-slate-200 p-3 shrink-0 flex flex-col justify-between select-none overflow-y-auto">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Personal Mailbox</p>
              {[
                { id: 'inbox', label: 'Inbox', count: 4, icon: <Mail className="w-4 h-4" /> },
                { id: 'starred', label: 'Starred', count: 2, icon: <Star className="w-4 h-4" /> },
                { id: 'sent', label: 'Sent Items', icon: <Send className="w-4 h-4" /> },
                { id: 'drafts', label: 'Drafts', count: 1, icon: <Flag className="w-4 h-4" /> },
                { id: 'trash', label: 'Deleted Items', icon: <Trash2 className="w-4 h-4" /> },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFolder(f.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    activeFolder === f.id
                      ? 'bg-blue-100 text-blue-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-200/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={activeFolder === f.id ? 'text-blue-700' : 'text-slate-500'}>{f.icon}</span>
                    <span>{f.label}</span>
                  </div>
                  {f.count && f.count > 0 ? (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-full">
                      {f.count}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            {/* Exchange Shared Mailboxes */}
            <div className="space-y-1 pt-3 border-t border-slate-200">
              <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wider px-2 py-1 flex items-center gap-1">
                <Server className="w-3 h-3" />
                <span>Exchange Shared Mailboxes</span>
              </p>
              <button
                onClick={() => setActiveFolder('shared_soc')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeFolder === 'shared_soc'
                    ? 'bg-purple-100 text-purple-950 font-bold'
                    : 'text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                  <span className="truncate">security-ops@</span>
                </div>
                <span className="text-[10px] font-bold bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded-full">
                  2
                </span>
              </button>

              <button
                onClick={() => setActiveFolder('shared_support')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-200/50 transition"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">support@expedite</span>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <button
              onClick={() => onLaunchMeeting('AXM-492-831', 'Axiom Video Room')}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Instant Meeting</span>
            </button>
          </div>
        </div>

        {/* Message List */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="flex border-b border-slate-200 bg-slate-50/50 text-xs font-bold">
            <button
              onClick={() => setMailTab('focused')}
              className={`flex-1 py-2 text-center border-b-2 transition ${
                mailTab === 'focused'
                  ? 'border-blue-600 text-blue-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Focused
            </button>
            <button
              onClick={() => setMailTab('other')}
              className={`flex-1 py-2 text-center border-b-2 transition ${
                mailTab === 'other'
                  ? 'border-blue-600 text-blue-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Other
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredThreads.map((thread) => {
              const isSelected = selectedThread?.id === thread.id;
              return (
                <div
                  key={thread.id}
                  onClick={() => onSelectThread(thread.id)}
                  className={`p-3 cursor-pointer select-none transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 border-l-4 border-l-blue-600'
                      : !thread.is_read
                      ? 'bg-blue-50/20 hover:bg-slate-50 font-semibold'
                      : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900 truncate">{thread.subject}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(thread.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                    {thread.snippet}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {thread.ai_category}
                    </span>
                    {thread.has_attachments && <Paperclip className="w-3 h-3 text-slate-400" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reading Pane */}
        <div className="flex-1 bg-white overflow-y-auto p-6 max-w-4xl">
          {selectedThread ? (
            <div className="space-y-6">
              <h1 className="text-xl font-bold text-slate-900">{selectedThread.subject}</h1>

              {/* Meeting Card Banner */}
              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-600 text-white">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-950">Axiom Meeting Attached</p>
                    <p className="text-[11px] text-purple-800">
                      Autonomous Cyber Defense Loops Dissertation Sync with Dr. Danquah.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onLaunchMeeting('AXM-492-831', selectedThread.subject)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm transition"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Axiom Meet</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {selectedThread.ai_summary && (
                <AISummaryCard summary={selectedThread.ai_summary} category={selectedThread.ai_category} />
              )}

              <div className="space-y-4">
                {selectedThread.messages.map((msg) => (
                  <div key={msg.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/40">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                          {(msg.from_name || msg.from_address).slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{msg.from_name || msg.from_address}</p>
                          <p className="text-[11px] text-slate-400">to {msg.to_addresses.join(', ')}</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(msg.received_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>

                    <div
                      className="text-sm text-slate-800 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: msg.body_html || msg.body_plain || '' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
              Select a message to view
            </div>
          )}
        </div>
      </div>

      {/* Floating Compose with Exchange "Send As" Selector */}
      {isComposeOpen && (
        <div className="fixed bottom-4 right-8 w-[600px] bg-white border border-slate-300 shadow-2xl rounded-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3">
          <div className="h-10 bg-slate-900 text-white px-4 flex items-center justify-between text-xs font-bold">
            <span>New Message — Axiom Connect</span>
            <button onClick={() => setIsComposeOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-slate-200 text-xs">
            {/* Exchange "From" delegate dropdown */}
            <div className="px-3 py-1.5 flex items-center">
              <span className="w-14 text-slate-500 font-semibold">From:</span>
              <select
                value={fromAddress}
                onChange={(e) => setFromAddress(e.target.value)}
                className="w-full bg-transparent outline-none font-semibold text-blue-700"
              >
                <option value="d.asiedu@axiomconnect.com">David Asiedu &lt;d.asiedu@axiomconnect.com&gt;</option>
                <option value="security-ops@axiomconnect.com">Security Operations Center &lt;security-ops@axiomconnect.com&gt; (Send As)</option>
                <option value="support@expediteconsults.com">Expedite Consults Support &lt;support@expediteconsults.com&gt; (Send As)</option>
              </select>
            </div>

            <div className="px-3 py-1.5 flex items-center">
              <span className="w-14 text-slate-500 font-semibold">To:</span>
              <input
                type="text"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                placeholder="recipient@domain.com"
                className="w-full outline-none text-slate-800"
              />
            </div>
            <div className="px-3 py-1.5 flex items-center">
              <span className="w-14 text-slate-500 font-semibold">Subject:</span>
              <input
                type="text"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="Meeting discussion"
                className="w-full outline-none text-slate-800 font-medium"
              />
            </div>
          </div>

          {includeMeetingLink && (
            <div className="m-3 p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-600 text-white">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-purple-950">Axiom Video Meeting Attached</p>
                  <p className="text-[11px] text-purple-700 font-mono">https://meet.axiom.com/{generatedMeetingId}</p>
                </div>
              </div>
              <button
                onClick={() => setIncludeMeetingLink(false)}
                className="text-xs text-red-500 hover:text-red-700 font-semibold"
              >
                Remove
              </button>
            </div>
          )}

          <div className="p-3 flex-1 min-h-[160px]">
            <textarea
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
              placeholder="Type your message..."
              className="w-full h-full text-xs text-slate-800 outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="h-12 bg-slate-50 border-t border-slate-200 px-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSendCompose}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>

              {!includeMeetingLink && (
                <button
                  onClick={handleAddMeetingToCompose}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-semibold transition"
                >
                  <Video className="w-3.5 h-3.5 text-purple-700" />
                  <span>Attach Meeting</span>
                </button>
              )}
            </div>

            <button onClick={() => setIsComposeOpen(false)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
