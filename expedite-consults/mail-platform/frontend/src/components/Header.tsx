'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, Sparkles, HelpCircle, Settings, Grid, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  isAiActive: boolean;
  onToggleAi: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  isAiActive,
  onToggleAi
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearchSubmit(searchQuery);
    }
  };

  const applyFilterChip = (chip: string) => {
    const newQuery = searchQuery ? `${searchQuery} ${chip}` : chip;
    onSearchChange(newQuery);
    onSearchSubmit(newQuery);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between sticky top-0 z-30 select-none shadow-xs">
      {/* Brand Identity */}
      <div className="flex items-center gap-3 w-64 min-w-[200px]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20">
          A
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-900 tracking-tight text-lg">AxiomMail</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">v1.0</span>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">Enterprise Communications</p>
        </div>
      </div>

      {/* Gmail-Style Advanced Search Bar */}
      <div className="flex-1 max-w-3xl px-4 relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search mail by sender, subject, 'has:attachment', 'is:unread'..."
            className="w-full pl-11 pr-24 py-2.5 bg-gray-100/80 hover:bg-gray-100 focus:bg-white text-sm text-gray-800 placeholder-gray-500 rounded-2xl border border-transparent focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
          />
          <div className="absolute right-2.5 flex items-center gap-1">
            <button
              onClick={() => setShowFilters(!showFilters)}
              title="Search filters"
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleAi}
              title="Toggle AI Copilot"
              className={`p-1.5 rounded-lg flex items-center gap-1 text-xs font-semibold transition ${
                isAiActive
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                  : 'text-violet-700 hover:bg-violet-50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">AI</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Chips Dropdown */}
        {showFilters && (
          <div className="absolute top-12 left-4 right-4 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-40 animate-in fade-in slide-in-from-top-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Search Operators</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => applyFilterChip('has:attachment')} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition">📎 has:attachment</button>
              <button onClick={() => applyFilterChip('is:unread')} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition">✉️ is:unread</button>
              <button onClick={() => applyFilterChip('is:starred')} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition">⭐ is:starred</button>
              <button onClick={() => applyFilterChip('from:')} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition">👤 from:[user]</button>
              <button onClick={() => applyFilterChip('subject:')} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition">📝 subject:[term]</button>
            </div>
          </div>
        )}
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Postfix & LMTP Online</span>
        </div>
        <button className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition">
          <HelpCircle className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition">
          <Settings className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm cursor-pointer ml-1">
          DA
        </div>
      </div>
    </header>
  );
};
