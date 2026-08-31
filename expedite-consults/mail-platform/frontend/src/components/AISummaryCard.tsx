'use client';

import React from 'react';
import { Sparkles, CheckSquare, ListChecks, ArrowRight, Bot } from 'lucide-react';

interface AISummaryCardProps {
  summary: string;
  category?: string;
  onDraftReplyWithAI?: () => void;
}

export const AISummaryCard: React.FC<AISummaryCardProps> = ({
  summary,
  category = 'primary',
  onDraftReplyWithAI
}) => {
  if (!summary) return null;

  return (
    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-violet-50 via-indigo-50/50 to-blue-50 border border-violet-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-violet-600 text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-violet-950">AI Executive Summary</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-200/70 text-violet-800 uppercase">
            {category}
          </span>
        </div>

        {onDraftReplyWithAI && (
          <button
            onClick={onDraftReplyWithAI}
            className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:text-violet-900 bg-white/80 hover:bg-white px-2.5 py-1 rounded-lg border border-violet-200 shadow-xs transition"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Generate Reply Draft</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      <p className="text-sm text-gray-800 leading-relaxed font-normal">
        {summary}
      </p>

      <div className="mt-3 pt-2.5 border-t border-violet-200/60 flex items-center gap-4 text-xs text-violet-900/80 font-medium">
        <div className="flex items-center gap-1.5">
          <ListChecks className="w-3.5 h-3.5 text-violet-600" />
          <span>Extracted key takeaways</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>Action items identified</span>
        </div>
      </div>
    </div>
  );
};
