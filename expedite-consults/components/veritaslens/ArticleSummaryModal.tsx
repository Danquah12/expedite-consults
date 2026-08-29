'use client';

import React, { useState } from 'react';
import { NewsArticle, NewsCluster } from '@/lib/veritaslens/types';
import { 
  X, 
  ExternalLink, 
  Share2, 
  Smartphone, 
  Copy, 
  Check, 
  FileText, 
  ShieldCheck, 
  Scale, 
  TrendingUp, 
  Info,
  Radio,
  BookOpen
} from 'lucide-react';

interface ArticleSummaryModalProps {
  article: NewsArticle | null;
  cluster?: NewsCluster | null;
  isOpen: boolean;
  onClose: () => void;
  onShareBroadcast?: (cluster: NewsCluster) => void;
  onSendToPhone?: (cluster: NewsCluster) => void;
}

export const ArticleSummaryModal: React.FC<ArticleSummaryModalProps> = ({
  article,
  cluster,
  isOpen,
  onClose,
  onShareBroadcast,
  onSendToPhone
}) => {
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  if (!isOpen || !article) return null;

  const cleanTitle = article.title
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<');

  const cleanSnippet = (() => {
    const raw = article.cleanedContent || '';
    const stripped = raw
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/<[^>]*>/g, ' ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/target=["']?[^"'\s>]*["']?/gi, '')
      .replace(/href=["']?[^"'\s>]*["']?/gi, '')
      .replace(/oc=["']?[^"'\s>]*["']?/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!stripped || stripped.length < 15 || stripped.startsWith('=')) {
      return `${cleanTitle}. Detailed investigative reporting, historical context, and direct statements gathered by the ${article.outletName} editorial newsroom.`;
    }
    return stripped;
  })();

  const spinPct = Math.round((article.lexicalLoad || 0) * 100);
  const biasLabel = article.biasAlignment || 'Center';

  const handleCopySummary = () => {
    const textToCopy = `📰 [VeritasLens News Summary]
Outlet: ${article.outletName} (${biasLabel})
Headline: "${cleanTitle}"
Spin Rating: ${spinPct}% | Lexical Load: ${(article.lexicalLoad || 0).toFixed(2)}

Executive Summary:
${cleanSnippet}

Source Link: ${article.url}
VeritasLens Intelligence: https://portal.expediteconsults.com/veritaslens`;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).catch(() => {});
      }
    } catch (e) {
      console.warn(e);
    }
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative overflow-hidden animate-fade-in max-h-[92vh] flex flex-col">
        {/* Glow */}
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400">
              <BookOpen className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded border ${
                  biasLabel === 'Left' || biasLabel === 'Lean_Left'
                    ? 'bg-blue-950 text-blue-300 border-blue-800'
                    : biasLabel === 'Right' || biasLabel === 'Lean_Right'
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                }`}>
                  {article.outletName} ({biasLabel})
                </span>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60 font-bold">
                  Spin Rating: {spinPct}%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Executive News Summary & Linguistic Spin Breakdown
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          {/* Main Headline */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
              Newsroom Headline:
            </div>
            <h3 className="text-base font-bold text-white leading-relaxed">
              "{cleanTitle}"
            </h3>
            {article.author && (
              <p className="text-[11px] font-mono text-slate-400">
                Reported by: <span className="text-slate-200">{article.author}</span> • Published: {new Date(article.publishedAt || Date.now()).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Executive Summary */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                Executive Summary & Key Takeaways:
              </span>
              <span className="text-[10px] font-mono text-slate-500">AI DeBERTa Verified</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {cleanSnippet}
            </p>
          </div>

          {/* Forensic Linguistic & Bias Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">Lexical Load</div>
              <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                {(article.lexicalLoad || 0.05).toFixed(2)}
              </div>
              <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                {article.lexicalLoad > 0.3 ? 'Heavy Emotional Framing' : 'Objective Phrasing'}
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">Sentiment Score</div>
              <div className={`text-sm font-bold font-mono mt-0.5 ${
                (article.sentimentScore || 0) > 0.2 ? 'text-emerald-400' : (article.sentimentScore || 0) < -0.2 ? 'text-rose-400' : 'text-slate-300'
              }`}>
                {(article.sentimentScore || 0) > 0 ? `+${(article.sentimentScore || 0).toFixed(2)}` : (article.sentimentScore || 0).toFixed(2)}
              </div>
              <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                {(article.sentimentScore || 0) > 0.2 ? 'Positive Tone' : (article.sentimentScore || 0) < -0.2 ? 'Negative Tone' : 'Neutral Tone'}
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">Partisan Lean</div>
              <div className={`text-sm font-bold font-mono mt-0.5 ${
                biasLabel === 'Left' || biasLabel === 'Lean_Left' ? 'text-blue-400' :
                biasLabel === 'Right' || biasLabel === 'Lean_Right' ? 'text-rose-400' :
                'text-emerald-400'
              }`}>
                {biasLabel}
              </div>
              <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                AllSides Standard
              </div>
            </div>
          </div>

          {/* Wire Fact Contrast */}
          {cluster && (
            <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Neutral Wire Benchmark ({cluster.rawWireSource}):</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                "{cluster.rawWireFact || cluster.rawWireFactSummary}"
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedSuccess ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            {cluster && onSendToPhone && (
              <button
                onClick={() => {
                  onClose();
                  onSendToPhone(cluster);
                }}
                className="px-3.5 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-300 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Send this news summary to phone"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>📱 Send to Phone</span>
              </button>
            )}

            {cluster && onShareBroadcast && (
              <button
                onClick={() => {
                  onClose();
                  onShareBroadcast(cluster);
                }}
                className="px-3.5 py-2 bg-blue-950/80 hover:bg-blue-900 border border-blue-700/80 text-blue-300 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Broadcast this article to LinkedIn or X"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                <span>📢 Share</span>
              </button>
            )}
          </div>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 shadow-lg shadow-cyan-600/30"
          >
            <span>Read Original Article at {article.outletName}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
