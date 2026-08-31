'use client';

import React from 'react';
import {
  Mail, Calendar, MessageSquare, Video, Users, HardDrive, Sparkles,
  LayoutGrid, Zap, Settings
} from 'lucide-react';
import { AppModule, PresenceStatus } from '../types/connect';

interface NavigationRailProps {
  activeModule: AppModule;
  onSelectModule: (module: AppModule) => void;
  unreadMailCount: number;
  unreadChatCount: number;
  presence: PresenceStatus;
  onChangePresence: (status: PresenceStatus) => void;
}

const PRESENCE_COLORS: Record<PresenceStatus, { bg: string; label: string }> = {
  available: { bg: 'bg-emerald-500', label: 'Available' },
  busy: { bg: 'bg-red-500', label: 'Busy / Do Not Disturb' },
  in_meeting: { bg: 'bg-purple-600', label: 'In a Session' },
  away: { bg: 'bg-amber-500', label: 'Away / Coverage Mode' },
  offline: { bg: 'bg-gray-400', label: 'Appear Offline' },
};

export const NavigationRail: React.FC<NavigationRailProps> = ({
  activeModule,
  onSelectModule,
  unreadMailCount,
  unreadChatCount,
  presence,
  onChangePresence
}) => {
  const [showPresenceMenu, setShowPresenceMenu] = React.useState(false);

  const navItems = [
    { id: 'dispatch', label: 'Dispatch', icon: <Mail className="w-4 h-4" />, badge: unreadMailCount },
    { id: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
    { id: 'nexus', label: 'Nexus', icon: <MessageSquare className="w-4 h-4" />, badge: unreadChatCount },
    { id: 'session', label: 'Session', icon: <Video className="w-4 h-4" /> },
    { id: 'forge', label: 'Forge', icon: <LayoutGrid className="w-4 h-4 text-purple-400" /> },
    { id: 'flow', label: 'Flow', icon: <Zap className="w-4 h-4 text-amber-400" /> },
    { id: 'vault', label: 'Vault', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'directory', label: 'Directory', icon: <Users className="w-4 h-4" /> },
    { id: 'intelligence', label: 'Pulse AI', icon: <Sparkles className="w-4 h-4 text-violet-400" /> },
  ];

  return (
    <aside className="w-16 bg-slate-900 text-slate-300 flex flex-col items-center justify-between py-3 shrink-0 select-none z-40 border-r border-slate-800">
      {/* Top Brand Logo */}
      <div className="flex flex-col items-center gap-3">
        <div
          onClick={() => onSelectModule('dispatch')}
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-600/30 cursor-pointer hover:scale-105 transition"
        >
          A
        </div>

        {/* Navigation Tabs with Proprietary Taxonomy */}
        <div className="flex flex-col items-center gap-1 w-full">
          {navItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id as AppModule)}
                title={item.label}
                className={`relative w-12 h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 transition ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/40'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`}
              >
                {item.icon}
                <span className="text-[8px] tracking-tight">{item.label}</span>

                {item.badge && item.badge > 0 ? (
                  <span className="absolute top-1 right-1.5 min-w-[14px] h-3.5 px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-slate-900">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Profile & Presence Selector */}
      <div className="flex flex-col items-center gap-2 relative">
        <button
          onClick={() => setShowPresenceMenu(!showPresenceMenu)}
          title="Change Presence"
          className="relative group p-1"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-slate-700 group-hover:ring-blue-500 transition">
            DA
          </div>
          <span
            className={`absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${PRESENCE_COLORS[presence].bg}`}
          />
        </button>

        {showPresenceMenu && (
          <div className="absolute bottom-12 left-16 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 p-2 w-56 z-50 animate-in fade-in slide-in-from-left-2 text-xs">
            <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
              <p className="font-bold text-slate-900">David Asiedu</p>
              <p className="text-[10px] text-slate-500">d.asiedu@axiomconnect.com</p>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Set Presence</p>
            {(Object.keys(PRESENCE_COLORS) as PresenceStatus[]).map((key) => (
              <button
                key={key}
                onClick={() => {
                  onChangePresence(key);
                  setShowPresenceMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition font-medium"
              >
                <span className={`w-2 h-2 rounded-full ${PRESENCE_COLORS[key].bg}`} />
                <span>{PRESENCE_COLORS[key].label}</span>
              </button>
            ))}
          </div>
        )}

        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition">
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
