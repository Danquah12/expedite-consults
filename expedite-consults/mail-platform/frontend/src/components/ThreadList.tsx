'use client';

import React, { useState } from 'react';
import {
  Star, Paperclip, RefreshCw, Archive, Trash2, Mail, CheckSquare,
  Square, Tag, Clock, Sparkles
} from 'lucide-react';
import { Thread, AICategory } from '../types/mail';

interface ThreadListProps {
  threads: Thread[];
  selectedThreadId: string | null;
  onSelectThread: (id: string) => void;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
  onRefresh: () => void;
  activeCategory: AICategory | 'all';
  onSelectCategory: (cat: AICategory | 'all') => void;
}

export const ThreadList: React.FC<ThreadListProps> = ({
  threads,
  selectedThreadId,
  onSelectThread,
  onToggleStar,
  onRefresh,
  activeCategory,
  onSelectCategory
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === threads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(threads.map((t) => t.id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredThreads = threads.filter((t) => {
    if (activeCategory === 'all') return true;
    return t.ai_category === activeCategory;
  });

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 bg-white border-r border-gray-200 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Top Action Toolbar */}
      <div className="h-12 border-b border-gray-200 px-4 flex items-center justify-between shrink-0 bg-white select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSelectAll}
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition"
          >
            {selectedIds.length > 0 && selectedIds.length === threads.length ? (
              <CheckSquare className="w-4 h-4 text-blue-600" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onRefresh}
            title="Refresh mail"
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-1 pl-2 border-l border-gray-300">
              <button title="Archive" className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md">
                <Archive className="w-4 h-4" />
              </button>
              <button title="Delete" className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md">
                <Trash2 className="w-4 h-4" />
              </button>
              <button title="Mark as read" className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">
          Showing <span className="font-semibold text-gray-700">{filteredThreads.length}</span> conversations
        </div>
      </div>

      {/* Gmail-Style Category Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50/50 shrink-0 text-xs font-semibold">
        {[
          { id: 'all', label: 'All Mail' },
          { id: 'primary', label: 'Primary' },
          { id: 'urgent', label: 'Urgent Action' },
          { id: 'updates', label: 'System Updates' },
          { id: 'promotions', label: 'Promotions' }
        ].map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectCategory(tab.id as any)}
              className={`flex-1 py-2.5 px-3 text-center transition border-b-2 flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'border-blue-600 text-blue-700 bg-white font-bold'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
              }`}
            >
              {tab.id === 'urgent' && <span className="w-2 h-2 rounded-full bg-red-500" />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Thread Rows Container */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {filteredThreads.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Mail className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium">No messages in this folder or category</p>
          </div>
        ) : (
          filteredThreads.map((thread) => {
            const isSelected = selectedThreadId === thread.id;
            const isChecked = selectedIds.includes(thread.id);

            return (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className={`group flex items-center gap-3 px-4 py-3 cursor-pointer select-none transition-all ${
                  isSelected
                    ? 'bg-blue-50/80 border-l-4 border-l-blue-600'
                    : thread.is_read
                    ? 'bg-white hover:bg-gray-50'
                    : 'bg-blue-50/25 hover:bg-blue-50/50 font-semibold'
                }`}
              >
                {/* Selection checkbox */}
                <button
                  onClick={(e) => toggleSelectOne(thread.id, e)}
                  className="text-gray-400 hover:text-gray-700 p-0.5"
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>

                {/* Star Button */}
                <button
                  onClick={(e) => onToggleStar(thread.id, e)}
                  className="p-0.5 transition"
                >
                  <Star
                    className={`w-4 h-4 ${
                      thread.is_starred
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-gray-300 hover:text-gray-500'
                    }`}
                  />
                </button>

                {/* Subject & Snippet Preview */}
                <div className="flex-1 min-w-0 flex items-baseline gap-2">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-sm tracking-tight truncate max-w-[200px] ${
                        !thread.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'
                      }`}
                    >
                      {thread.subject}
                    </span>
                    {thread.message_count > 1 && (
                      <span className="text-[11px] font-bold text-gray-500 bg-gray-200/80 px-1.5 py-0.2 rounded-full">
                        {thread.message_count}
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-gray-500 truncate flex-1 font-normal">
                    — {thread.snippet}
                  </span>
                </div>

                {/* Badges & Meta */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {thread.ai_category === 'urgent' && (
                    <span className="text-[10px] uppercase font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      Urgent
                    </span>
                  )}
                  {thread.has_attachments && (
                    <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                  )}
                  <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                    {formatTimestamp(thread.last_message_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
