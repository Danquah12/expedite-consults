'use client';

import React, { useState } from 'react';
import { NewsCluster } from '@/lib/veritaslens/types';
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  Sparkles, 
  Radio, 
  Globe, 
  Send,
  CheckCircle2,
  Layers,
  ArrowRight
} from 'lucide-react';

interface SocialSyndicationModalProps {
  cluster: NewsCluster | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SocialSyndicationModal: React.FC<SocialSyndicationModalProps> = ({
  cluster,
  isOpen,
  onClose
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<'linkedin' | 'twitter' | 'facebook' | 'whatsapp' | 'newsletter'>('linkedin');
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  if (!isOpen || !cluster) return null;

  const portalUrl = 'https://portal.expediteconsults.com/veritaslens';
  
  const primaryArticle = cluster.articles?.[0];
  const originalSourceOutlet = primaryArticle?.outletName || cluster.rawWireSource || 'Associated Press';
  const originalSourceUrl = primaryArticle?.url || cluster.groundTruthUrl || 'https://apnews.com';
  const outletsReporting = Array.from(new Set(cluster.articles?.map(a => a.outletName) || [cluster.rawWireSource])).join(', ');
  
  // Format Post Copy for different platforms showing ACTUAL original news source
  const linkedinCopy = `🚨 Daily Media Blindspot Report | VeritasLens Intelligence

📊 Partisan Divergence Detected:
"${cluster.representativeTitle}"

• Left Media Coverage: ${cluster.leftCoveragePct}%
• Center Neutral Wire: ${cluster.centerCoveragePct}%
• Right Media Coverage: ${cluster.rightCoveragePct}%

🏛️ Unspun Fact (${cluster.rawWireSource}):
"${cluster.rawWireFact}"

📰 Original News Outlets Reporting:
${outletsReporting}

🔗 Read Original News Source:
${originalSourceUrl}

🏛️ Primary Ground Truth Docket:
${cluster.groundTruthSource} (${cluster.groundTruthType || 'Official Record'})
${cluster.groundTruthUrl || originalSourceUrl}

Explore interactive blindspot dockets & live polygraph analysis:
${portalUrl}`;

  const twitterCopy = `🚨 Daily Blindspot Alert: "${cluster.representativeTitle.slice(0, 85)}..."

Left: ${cluster.leftCoveragePct}% | Right: ${cluster.rightCoveragePct}%

🏛️ Unspun Fact (${cluster.rawWireSource}):
${cluster.rawWireFact.slice(0, 95)}...

📰 Original Source: ${originalSourceOutlet}
🔗 Read Source: ${originalSourceUrl}`;

  const facebookCopy = `🚨 VeritasLens Daily Blindspot Report

Story: "${cluster.representativeTitle}"
Coverage: Left ${cluster.leftCoveragePct}% | Center ${cluster.centerCoveragePct}% | Right ${cluster.rightCoveragePct}%

Unspun Fact (${cluster.rawWireSource}):
${cluster.rawWireFact}

📰 Original News Source: ${outletsReporting}
🔗 Read Original News Article:
${originalSourceUrl}

🏛️ Official Docket Evidence:
${cluster.groundTruthSource} (${cluster.groundTruthUrl || originalSourceUrl})`;

  const whatsappCopy = `*🚨 VeritasLens Blindspot Briefing:*

*Story:* "${cluster.representativeTitle}"
*Coverage:* Left ${cluster.leftCoveragePct}% | Center ${cluster.centerCoveragePct}% | Right ${cluster.rightCoveragePct}%

*🏛️ Unspun Fact (${cluster.rawWireSource}):*
${cluster.rawWireFact}

*📰 Original News Source:* ${originalSourceOutlet}
*🔗 Read Original Article:* ${originalSourceUrl}

*🏛️ Official Ground Truth Docket:*
${cluster.groundTruthSource}
${cluster.groundTruthUrl || originalSourceUrl}`;

  const newsletterCopy = `SUBJECT: [VeritasLens Blindspot Briefing] ${cluster.representativeTitle}

Good morning,

Today's algorithmic media audit analyzed coverage across 14 Left, Center, and Right newsrooms.

TOP BLINDSPOT STORY:
${cluster.representativeTitle}

COVERAGE ASYMMETRY:
- Left Newsrooms: ${cluster.leftCoveragePct}%
- Center Wire: ${cluster.centerCoveragePct}%
- Right Newsrooms: ${cluster.rightCoveragePct}%

THE UNSPUN FACTS (${cluster.rawWireSource}):
${cluster.rawWireFact}

ORIGINAL NEWS REPORTING OUTLETS:
${outletsReporting}
Direct Article Link: ${originalSourceUrl}

PRIMARY STATUTORY VERIFICATION:
${cluster.groundTruthSource} (${cluster.groundTruthType || 'Official Record'})
Docket Link: ${cluster.groundTruthUrl || originalSourceUrl}

Access the complete interactive platform:
${portalUrl}`;

  const currentCopy = 
    selectedPlatform === 'linkedin' ? linkedinCopy :
    selectedPlatform === 'twitter' ? twitterCopy :
    selectedPlatform === 'facebook' ? facebookCopy :
    selectedPlatform === 'whatsapp' ? whatsappCopy :
    newsletterCopy;

  const handleCopy = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(currentCopy).catch(() => {});
      }
    } catch (e) {
      console.warn('Clipboard write prevented:', e);
    }
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  const handleDirectShare = () => {
    // 1. Always copy text to clipboard for instant pasting
    handleCopy();

    // 2. Open the destination platform in a fresh, unrestricted tab
    try {
      if (selectedPlatform === 'linkedin') {
        window.open('https://www.linkedin.com/feed/', '_blank', 'noopener,noreferrer');
      } else if (selectedPlatform === 'twitter') {
        const url = `https://x.com/intent/post?text=${encodeURIComponent(twitterCopy)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      } else if (selectedPlatform === 'facebook') {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(portalUrl)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      } else if (selectedPlatform === 'whatsapp') {
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappCopy)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        const mailtoUrl = `mailto:?subject=${encodeURIComponent(`[VeritasLens] ${cluster.representativeTitle}`)}&body=${encodeURIComponent(newsletterCopy)}`;
        window.location.href = mailtoUrl;
      }
    } catch (err) {
      console.error('Share action error:', err);
    }
  };

  const handleDirectApiPublish = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch('/api/veritaslens/syndicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatform,
          headline: cluster.representativeTitle,
          blindspotType: cluster.blindspotType,
          leftPct: cluster.leftCoveragePct,
          centerPct: cluster.centerCoveragePct,
          rightPct: cluster.rightCoveragePct,
          unspunFact: cluster.rawWireFact,
          groundTruthSource: cluster.groundTruthSource,
          groundTruthUrl: cluster.groundTruthUrl,
          customText: currentCopy
        })
      });
      const data = await res.json();
      setPublishSuccess(`Successfully syndicated to ${selectedPlatform.toUpperCase()}!`);
      setTimeout(() => setPublishSuccess(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
        {/* Background glow */}
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Broadcast & Syndicate Story to Socials
              </h3>
              <p className="text-xs text-slate-400">
                1-Click automated social syndication to LinkedIn, X, Facebook, and Newsletters.
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

        {/* Platform Switcher Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0 overflow-x-auto">
          <button
            onClick={() => setSelectedPlatform('linkedin')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              selectedPlatform === 'linkedin'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>💼 LinkedIn Post</span>
          </button>

          <button
            onClick={() => setSelectedPlatform('twitter')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              selectedPlatform === 'twitter'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>𝕏 / Twitter Thread</span>
          </button>

          <button
            onClick={() => setSelectedPlatform('facebook')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              selectedPlatform === 'facebook'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>👥 Facebook Page</span>
          </button>

          <button
            onClick={() => setSelectedPlatform('whatsapp')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              selectedPlatform === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>💬 WhatsApp</span>
          </button>

          <button
            onClick={() => setSelectedPlatform('newsletter')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              selectedPlatform === 'newsletter'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📧 Email Briefing</span>
          </button>
        </div>

        {/* Story Snapshot Preview */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5 shrink-0">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-cyan-400 font-bold uppercase">Target Story:</span>
            <span className="text-slate-400">Bias Ratio: L {cluster.leftCoveragePct}% | R {cluster.rightCoveragePct}%</span>
          </div>
          <p className="text-xs font-bold text-slate-100 line-clamp-1">
            {cluster.representativeTitle}
          </p>
        </div>

        {/* Pre-Formatted Copy Box */}
        <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Pre-Generated Post Copy:</span>
            <span>{currentCopy.length} characters</span>
          </div>
          <textarea
            readOnly
            value={currentCopy}
            className="w-full flex-1 min-h-[160px] bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono leading-relaxed resize-none focus:outline-none scrollbar-thin"
          />
        </div>

        {/* Status Message */}
        {publishSuccess && (
          <div className="p-2.5 bg-emerald-950/80 border border-emerald-700 rounded-lg text-xs font-mono text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{publishSuccess}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 shrink-0">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer border border-slate-700"
          >
            {copiedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copiedSuccess ? '✅ Copied to Clipboard!' : 'Copy Formatted Text'}</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            {selectedPlatform === 'linkedin' && (
              <button
                onClick={() => {
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://expedite-consults.vercel.app/veritaslens')}`, '_blank', 'noopener,noreferrer');
                }}
                className="px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-600/40 transition flex items-center gap-1.5 cursor-pointer"
                title="Open LinkedIn Link Share dialog"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Link Share Dialog</span>
              </button>
            )}

            <button
              onClick={handleDirectShare}
              className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer shadow-lg ${
                selectedPlatform === 'linkedin'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                  : selectedPlatform === 'twitter'
                  ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/30'
                  : selectedPlatform === 'facebook'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  : selectedPlatform === 'whatsapp'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>
                {selectedPlatform === 'linkedin' ? '📋 Copy & Open LinkedIn' :
                 selectedPlatform === 'twitter' ? '1-Click Tweet on 𝕏' :
                 selectedPlatform === 'facebook' ? '1-Click Post to Facebook' :
                 selectedPlatform === 'whatsapp' ? '1-Click Share to WhatsApp' :
                 'Send Email Briefing'}
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
