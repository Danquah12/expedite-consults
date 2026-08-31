'use client';

import React, { useState } from 'react';
import {
  ArrowLeft, Star, Trash2, Archive, Reply, Forward, Paperclip,
  Download, Sparkles, Send, MoreVertical, FileText, ChevronDown, ChevronUp
} from 'lucide-react';
import { ThreadDetail, Message } from '../types/mail';
import { AISummaryCard } from './AISummaryCard';

interface ThreadViewProps {
  thread: ThreadDetail | null;
  onBack: () => void;
  onToggleStar: (id: string) => void;
  onDeleteThread: (id: string) => void;
  onSendReply: (bodyHtml: string, threadId: string) => void;
}

export const ThreadView: React.FC<ThreadViewProps> = ({
  thread,
  onBack,
  onToggleStar,
  onDeleteThread,
  onSendReply
}) => {
  const [replyText, setReplyText] = useState('');
  const [collapsedIds, setCollapsedIds] = useState<string[]>([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  if (!thread) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center text-gray-400 p-8 h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-sm mx-auto flex items-center justify-center mb-3">
            <MailboxIcon className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-600">Select a conversation to read</p>
          <p className="text-xs text-gray-400 mt-1">Or compose a new email message</p>
        </div>
      </div>
    );
  }

  const toggleCollapse = (msgId: string) => {
    setCollapsedIds((prev) =>
      prev.includes(msgId) ? prev.filter((id) => id !== msgId) : [...prev, msgId]
    );
  };

  const handleGenerateAiReply = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      setReplyText(
        `Hi team,\n\nThank you for the detailed update and proposal review notes. I have reviewed Section 4 and verified our reinforcement learning loop latency benchmarks. I will schedule the defense committee sync for this Thursday.\n\nBest regards,\nDavid Asiedu`
      );
      setIsGeneratingAi(false);
    }, 600);
  };

  const handleSend = () => {
    if (!replyText.trim()) return;
    onSendReply(replyText, thread.id);
    setReplyText('');
  };

  return (
    <div className="flex-1 bg-white flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Top Header Controls */}
      <div className="h-12 border-b border-gray-200 px-4 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleStar(thread.id)}
            className="p-1.5 text-gray-400 hover:text-amber-500 rounded-md transition"
          >
            <Star
              className={`w-4 h-4 ${
                thread.is_starred ? 'fill-amber-400 text-amber-500' : ''
              }`}
            />
          </button>
          <button
            onClick={() => onDeleteThread(thread.id)}
            title="Delete conversation"
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            title="Archive"
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition"
          >
            <Archive className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 uppercase">
            {thread.ai_category}
          </span>
          <button className="p-1.5 text-gray-500 hover:text-gray-800 rounded-md">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Conversation Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
        {/* Subject Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-snug">
            {thread.subject}
          </h1>
        </div>

        {/* AI Summary Banner */}
        {thread.ai_summary && (
          <AISummaryCard
            summary={thread.ai_summary}
            category={thread.ai_category}
            onDraftReplyWithAI={handleGenerateAiReply}
          />
        )}

        {/* Messages Chain */}
        <div className="space-y-4">
          {thread.messages.map((msg, index) => {
            const isLast = index === thread.messages.length - 1;
            const isCollapsed = collapsedIds.includes(msg.id) && !isLast;

            return (
              <div
                key={msg.id}
                className={`rounded-2xl border transition-all ${
                  isLast
                    ? 'border-gray-300 bg-white shadow-sm'
                    : 'border-gray-200 bg-gray-50/60'
                }`}
              >
                {/* Message Header */}
                <div
                  onClick={() => !isLast && toggleCollapse(msg.id)}
                  className={`p-4 flex items-center justify-between cursor-pointer select-none ${
                    isCollapsed ? 'hover:bg-gray-100/70 rounded-2xl' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {(msg.from_name || msg.from_address).substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                          {msg.from_name || msg.from_address}
                        </span>
                        <span className="text-xs text-gray-400">&lt;{msg.from_address}&gt;</span>
                      </div>
                      <p className="text-xs text-gray-500">to {msg.to_addresses.join(', ')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(msg.received_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {!isLast && (
                      <button className="text-gray-400 p-1">
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Message Body Content */}
                {!isCollapsed && (
                  <div className="px-5 pb-5 pt-2 border-t border-gray-100">
                    <div
                      className="prose prose-sm text-gray-800 leading-relaxed font-normal"
                      dangerouslySetInnerHTML={{ __html: msg.body_html || msg.body_plain || '' }}
                    />

                    {/* Attachments Section */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>{msg.attachments.length} Attachment(s)</span>
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                          {msg.attachments.map((att) => (
                            <div
                              key={att.id}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition text-xs font-medium text-gray-800 cursor-pointer shadow-xs"
                            >
                              <FileText className="w-4 h-4 text-blue-600" />
                              <div className="max-w-[180px] truncate">
                                <span className="font-semibold">{att.filename}</span>
                                <span className="text-[10px] text-gray-400 block">
                                  {(att.size_bytes / 1024 / 1024).toFixed(1)} MB
                                </span>
                              </div>
                              <Download className="w-3.5 h-3.5 text-gray-400 hover:text-blue-600 transition" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Inline Reply Box */}
        <div className="mt-8 rounded-2xl border border-gray-300 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Reply className="w-4 h-4 text-blue-600" />
              <span>Reply to conversation</span>
            </span>

            <button
              onClick={handleGenerateAiReply}
              disabled={isGeneratingAi}
              className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-xl border border-violet-200 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingAi ? 'Synthesizing Draft...' : 'Smart Reply with AI'}</span>
            </button>
          </div>

          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={4}
            placeholder="Type your reply here or click 'Smart Reply with AI'..."
            className="w-full text-sm text-gray-800 placeholder-gray-400 p-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition resize-none"
          />

          <div className="mt-3 flex items-center justify-between">
            <button className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              onClick={handleSend}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function MailboxIcon(props: any) {
  return <Reply {...props} />;
}
