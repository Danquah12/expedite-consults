'use client';

import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ThreadList } from './ThreadList';
import { ThreadView } from './ThreadView';
import { ComposeModal } from './ComposeModal';
import {
  MOCK_MAILBOXES,
  MOCK_THREADS,
  MOCK_THREAD_DETAIL
} from '../services/api';
import { MailboxRole, AICategory, Thread, ThreadDetail } from '../types/mail';

export const WebmailApp: React.FC = () => {
  const [mailboxes, setMailboxes] = useState(MOCK_MAILBOXES);
  const [threads, setThreads] = useState<Thread[]>(MOCK_THREADS);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>('t-101');
  const [currentThreadDetail, setCurrentThreadDetail] = useState<ThreadDetail | null>(MOCK_THREAD_DETAIL);
  const [activeRole, setActiveRole] = useState<MailboxRole>('inbox');
  const [activeCategory, setActiveCategory] = useState<AICategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiActive, setIsAiActive] = useState(true);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const handleSelectThread = (id: string) => {
    setSelectedThreadId(id);
    const matched = threads.find((t) => t.id === id);
    if (matched) {
      // Mark read
      setThreads((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_read: true } : t))
      );
      if (id === 't-101') {
        setCurrentThreadDetail(MOCK_THREAD_DETAIL);
      } else {
        setCurrentThreadDetail({
          ...matched,
          is_read: true,
          messages: [
            {
              id: `m-${id}-1`,
              thread_id: id,
              message_id: `<${id}@axiommail.com>`,
              from_address: 'alex.chen@cloudsystems.io',
              from_name: 'Alex Chen',
              to_addresses: ['d.asiedu@expediteconsults.com'],
              subject: matched.subject,
              body_plain: matched.snippet || '',
              body_html: `<p>${matched.snippet}</p>`,
              snippet: matched.snippet,
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

  const handleToggleStar = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_starred: !t.is_starred } : t))
    );
    if (currentThreadDetail && currentThreadDetail.id === id) {
      setCurrentThreadDetail({
        ...currentThreadDetail,
        is_starred: !currentThreadDetail.is_starred
      });
    }
  };

  const handleDeleteThread = (id: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== id));
    setSelectedThreadId(null);
    setCurrentThreadDetail(null);
  };

  const handleSendReply = (bodyHtml: string, threadId: string) => {
    if (!currentThreadDetail) return;
    const newMsg = {
      id: `m-reply-${Date.now()}`,
      thread_id: threadId,
      message_id: `<reply-${Date.now()}@axiommail.com>`,
      from_address: 'd.asiedu@expediteconsults.com',
      from_name: 'David Asiedu',
      to_addresses: ['dr.danquah@university.edu'],
      subject: `Re: ${currentThreadDetail.subject}`,
      body_plain: bodyHtml,
      body_html: `<p>${bodyHtml.replace(/\n/g, '<br/>')}</p>`,
      snippet: bodyHtml.slice(0, 100),
      is_read: true,
      is_starred: false,
      is_draft: false,
      has_attachments: false,
      received_at: new Date().toISOString()
    };

    setCurrentThreadDetail({
      ...currentThreadDetail,
      messages: [...currentThreadDetail.messages, newMsg],
      message_count: currentThreadDetail.message_count + 1,
      last_message_at: newMsg.received_at
    });

    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              message_count: t.message_count + 1,
              snippet: newMsg.snippet,
              last_message_at: newMsg.received_at
            }
          : t
      )
    );
  };

  const handleSendNewMessage = (data: { to: string; subject: string; body: string }) => {
    const newId = `t-${Date.now()}`;
    const newThread: Thread = {
      id: newId,
      subject: data.subject,
      snippet: data.body.slice(0, 100),
      last_message_at: new Date().toISOString(),
      message_count: 1,
      is_read: true,
      is_starred: false,
      has_attachments: false,
      ai_category: 'primary',
      created_at: new Date().toISOString()
    };

    setThreads([newThread, ...threads]);
    handleSelectThread(newId);
  };

  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) {
      setThreads(MOCK_THREADS);
      return;
    }
    const q = query.toLowerCase();
    const filtered = MOCK_THREADS.filter(
      (t) =>
        t.subject.toLowerCase().includes(q) ||
        (t.snippet && t.snippet.toLowerCase().includes(q))
    );
    setThreads(filtered);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans antialiased text-gray-900">
      {/* Top Application Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        isAiActive={isAiActive}
        onToggleAi={() => setIsAiActive(!isAiActive)}
      />

      {/* Main Mail Grid Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          mailboxes={mailboxes}
          activeRole={activeRole}
          onSelectRole={(role) => {
            setActiveRole(role);
            if (role === 'starred') {
              setThreads(MOCK_THREADS.filter((t) => t.is_starred));
            } else {
              setThreads(MOCK_THREADS);
            }
          }}
          onOpenCompose={() => setIsComposeOpen(true)}
        />

        {/* Center Thread List */}
        <div className="w-[440px] shrink-0 border-r border-gray-200">
          <ThreadList
            threads={threads}
            selectedThreadId={selectedThreadId}
            onSelectThread={handleSelectThread}
            onToggleStar={handleToggleStar}
            onRefresh={() => setThreads(MOCK_THREADS)}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
        </div>

        {/* Right Conversation Viewer */}
        <div className="flex-1 min-w-0">
          <ThreadView
            thread={currentThreadDetail}
            onBack={() => setSelectedThreadId(null)}
            onToggleStar={(id) => handleToggleStar(id)}
            onDeleteThread={handleDeleteThread}
            onSendReply={handleSendReply}
          />
        </div>
      </div>

      {/* Floating Compose Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSend={handleSendNewMessage}
      />
    </div>
  );
};
