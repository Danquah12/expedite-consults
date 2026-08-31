'use client';

import React from 'react';
import {
  Inbox, Star, Send, FileText, AlertOctagon, Trash2, Archive,
  Plus, HardDrive, ShieldCheck, Tag
} from 'lucide-react';
import { Mailbox, MailboxRole } from '../types/mail';

interface SidebarProps {
  mailboxes: Mailbox[];
  activeRole: MailboxRole;
  onSelectRole: (role: MailboxRole) => void;
  onOpenCompose: () => void;
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  inbox: <Inbox className="w-4 h-4" />,
  starred: <Star className="w-4 h-4" />,
  sent: <Send className="w-4 h-4" />,
  drafts: <FileText className="w-4 h-4" />,
  spam: <AlertOctagon className="w-4 h-4" />,
  trash: <Trash2 className="w-4 h-4" />,
  archive: <Archive className="w-4 h-4" />,
};

export const Sidebar: React.FC<SidebarProps> = ({
  mailboxes,
  activeRole,
  onSelectRole,
  onOpenCompose
}) => {
  return (
    <aside className="w-64 bg-gray-50/60 border-r border-gray-200 p-3 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)]">
      <div>
        {/* Floating / Prominent Compose Button */}
        <button
          onClick={onOpenCompose}
          className="w-full mb-4 py-3 px-5 bg-white hover:bg-blue-50 text-gray-900 hover:text-blue-700 font-semibold rounded-2xl shadow-md hover:shadow-lg border border-gray-200 flex items-center justify-center gap-2.5 transition-all group"
        >
          <div className="w-6 h-6 rounded-lg bg-blue-600 group-hover:bg-blue-700 text-white flex items-center justify-center transition">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-sm font-semibold tracking-wide">Compose Email</span>
        </button>

        {/* Mailbox Hierarchy */}
        <div className="space-y-1">
          {mailboxes.map((mb) => {
            const isActive = activeRole === mb.role;
            const icon = ROLE_ICONS[mb.role] || <Tag className="w-4 h-4" />;

            return (
              <button
                key={mb.id}
                onClick={() => onSelectRole(mb.role)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-100/70 text-blue-900 font-semibold'
                    : 'text-gray-700 hover:bg-gray-200/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-blue-700' : 'text-gray-500'}>
                    {icon}
                  </span>
                  <span>{mb.name}</span>
                </div>

                {mb.unread_messages > 0 ? (
                  <span className="bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {mb.unread_messages}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 font-normal">
                    {mb.total_messages > 0 ? mb.total_messages : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Labels Section */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Labels</span>
            <button className="text-gray-400 hover:text-gray-700 p-1">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Research & Defense</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Infrastructure & SRE</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>Consulting & Clients</span>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Quota Gauge & Security Badge */}
      <div className="pt-4 border-t border-gray-200">
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-600 font-semibold mb-1.5">
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-blue-600" />
              <span>Storage Quota</span>
            </div>
            <span>2.4 GB / 10 GB</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full w-[24%]" />
          </div>
          <div className="mt-2.5 flex items-center gap-1 text-[11px] text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero-Trust Encryption Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
