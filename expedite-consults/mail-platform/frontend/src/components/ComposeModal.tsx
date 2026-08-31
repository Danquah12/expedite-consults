'use client';

import React, { useState } from 'react';
import {
  X, Minimize2, Maximize2, Paperclip, Sparkles, Send, Trash2,
  Bold, Italic, Link, List
} from 'lucide-react';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: { to: string; subject: string; body: string }) => void;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({
  isOpen,
  onClose,
  onSend
}) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleAiDraft = () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    setTimeout(() => {
      setSubject(`Update: ${aiPrompt.slice(0, 35)}...`);
      setBody(
        `Hi,\n\nI am writing to follow up regarding ${aiPrompt}.\n\nPlease let me know if you need any additional clarification or have questions.\n\nBest regards,\nDavid Asiedu`
      );
      setIsGenerating(false);
      setShowAiPrompt(false);
      setAiPrompt('');
    }, 700);
  };

  const handleSend = () => {
    if (!to || !subject) {
      alert('Please fill in recipient and subject.');
      return;
    }
    onSend({ to, subject, body });
    setTo('');
    setSubject('');
    setBody('');
    onClose();
  };

  return (
    <div
      className={`fixed z-50 bg-white border border-gray-300 shadow-2xl rounded-2xl flex flex-col transition-all overflow-hidden ${
        isMaximized
          ? 'inset-6 w-auto h-auto'
          : 'bottom-4 right-6 w-[560px] h-[580px]'
      }`}
    >
      {/* Compose Window Header */}
      <div className="h-11 bg-gray-900 text-white px-4 flex items-center justify-between shrink-0 select-none">
        <span className="text-xs font-semibold tracking-wide">New Message</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="text-gray-400 hover:text-white p-1 transition"
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recipient & Subject Fields */}
      <div className="divide-y divide-gray-200 shrink-0 text-sm">
        <div className="flex items-center px-4 py-2">
          <span className="text-xs font-medium text-gray-500 w-16">To:</span>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@example.com"
            className="w-full text-sm text-gray-800 outline-none"
          />
        </div>
        <div className="flex items-center px-4 py-2">
          <span className="text-xs font-medium text-gray-500 w-16">Subject:</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject line"
            className="w-full text-sm text-gray-800 outline-none font-medium"
          />
        </div>
      </div>

      {/* AI Prompt Input Bar (Collapsible) */}
      {showAiPrompt && (
        <div className="p-3 bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-violet-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-600 shrink-0" />
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Request meeting regarding Q3 defense loops audit"
              className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-white border border-violet-200 focus:outline-violet-500 text-gray-800"
            />
            <button
              onClick={handleAiDraft}
              disabled={isGenerating}
              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition"
            >
              {isGenerating ? 'Drafting...' : 'Draft'}
            </button>
          </div>
        </div>
      )}

      {/* Message Body Area */}
      <div className="flex-1 p-4 flex flex-col">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your email message..."
          className="flex-1 w-full text-sm text-gray-800 outline-none resize-none leading-relaxed placeholder-gray-400"
        />
      </div>

      {/* Footer Toolbar */}
      <div className="h-14 border-t border-gray-200 px-4 flex items-center justify-between bg-gray-50/60 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSend}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>

          <button
            onClick={() => setShowAiPrompt(!showAiPrompt)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-100 hover:bg-violet-200 text-violet-800 font-semibold text-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Draft with AI</span>
          </button>
        </div>

        <div className="flex items-center gap-1 text-gray-500">
          <button className="p-2 hover:bg-gray-200 rounded-lg transition"><Bold className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-gray-200 rounded-lg transition"><Italic className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-gray-200 rounded-lg transition"><Paperclip className="w-4 h-4" /></button>
          <button onClick={onClose} className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition ml-2">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
