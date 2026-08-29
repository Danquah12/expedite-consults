'use client';

import React, { useState } from 'react';
import { NewsCluster } from '@/lib/veritaslens/types';
import { 
  Smartphone, 
  Send, 
  MessageSquare, 
  Bell, 
  BellRing, 
  Check, 
  Copy, 
  X, 
  Radio, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle,
  Share2,
  Sparkles
} from 'lucide-react';

interface MobileAlertModalProps {
  cluster?: NewsCluster | null;
  isOpen: boolean;
  onClose: () => void;
  customTitle?: string;
  customBody?: string;
}

export const MobileAlertModal: React.FC<MobileAlertModalProps> = ({
  cluster,
  isOpen,
  onClose,
  customTitle,
  customBody
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<'sms' | 'whatsapp' | 'telegram' | 'push' | 'email'>('sms');
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [pushStatus, setPushStatus] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const portalUrl = 'https://portal.expediteconsults.com/veritaslens';
  const headline = customTitle || cluster?.representativeTitle || 'Breaking Media Blindspot & Claim Audit';
  const leftPct = cluster?.leftCoveragePct ?? 85;
  const centerPct = cluster?.centerCoveragePct ?? 15;
  const rightPct = cluster?.rightCoveragePct ?? 0;
  const unspunFact = cluster?.rawWireFact || cluster?.rawWireFactSummary || 'Empirical wire facts verified by independent Reuters/AP neutral bureaus.';
  const docketSource = cluster?.groundTruthSource || 'Congress.gov / SCOTUS Docket';
  const primaryArticle = cluster?.articles?.[0];
  const originalSourceOutlet = primaryArticle?.outletName || cluster?.rawWireSource || 'Associated Press';
  const originalSourceUrl = primaryArticle?.url || cluster?.groundTruthUrl || portalUrl;

  // 1. Format SMS / Text Message Copy (Concise for phone screens with actual source)
  const smsCopy = `🚨 VERITASLENS BREAKING ALERT

📰 "${headline.slice(0, 100)}"

📊 Coverage: Left ${leftPct}% | Right ${rightPct}%

🏛️ Unspun Fact (${cluster?.rawWireSource || 'Wire'}):
${unspunFact.slice(0, 110)}...

📰 Original Source: ${originalSourceOutlet}
🔗 Read Original: ${originalSourceUrl}
🏛️ Docket: ${docketSource}`;

  // 2. Format WhatsApp Rich Mobile Message (with bold and actual source links)
  const whatsappCopy = `*🚨 VERITASLENS MOBILE NEWS ALERT*
*Story:* "${headline}"

*📊 Partisan Coverage Asymmetry:*
• Left Media: ${leftPct}%
• Center Neutral: ${centerPct}%
• Right Media: ${rightPct}%

*🏛️ Unspun Wire Facts (${cluster?.rawWireSource || 'Reuters/AP'}):*
_${unspunFact}_

*📰 Original News Source:* ${originalSourceOutlet}
*🔗 Read Original Article:* ${originalSourceUrl}

*🔍 Official Ground Truth Docket:*
${docketSource}
${cluster?.groundTruthUrl || originalSourceUrl}`;

  // 3. Format Telegram Message
  const telegramCopy = `🚨 *VERITASLENS INTEL ALERT*
📰 *${headline}*

📊 *Coverage:* Left ${leftPct}% | Center ${centerPct}% | Right ${rightPct}%
🏛️ *Unspun Fact:* ${unspunFact}
📰 *Original Source:* ${originalSourceOutlet}
🔗 *Read Source:* ${originalSourceUrl}
🔍 *Docket:* ${docketSource}`;

  const currentMessage = 
    selectedChannel === 'whatsapp' ? whatsappCopy :
    selectedChannel === 'telegram' ? telegramCopy :
    smsCopy;

  const handleCopy = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(currentMessage).catch(() => {});
      }
    } catch (e) {
      console.warn(e);
    }
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  const handleSendToPhone = () => {
    // 1. Copy formatted text to clipboard
    handleCopy();

    // 2. Clean phone number
    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');

    try {
      if (selectedChannel === 'sms') {
        // Native mobile SMS intent
        const smsUrl = cleanPhone 
          ? `sms:${cleanPhone}?&body=${encodeURIComponent(smsCopy)}`
          : `sms:?&body=${encodeURIComponent(smsCopy)}`;
        window.open(smsUrl, '_blank');
        setSentSuccess('Launched your phone Messages app with pre-filled alert!');
      } else if (selectedChannel === 'whatsapp') {
        const waUrl = cleanPhone
          ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(whatsappCopy)}`
          : `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappCopy)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        setSentSuccess('Launched WhatsApp mobile chat with pre-filled alert!');
      } else if (selectedChannel === 'telegram') {
        const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(portalUrl)}&text=${encodeURIComponent(telegramCopy)}`;
        window.open(tgUrl, '_blank', 'noopener,noreferrer');
        setSentSuccess('Launched Telegram with alert payload!');
      } else if (selectedChannel === 'email') {
        const mailtoUrl = `mailto:${cleanPhone}?subject=${encodeURIComponent(`[VeritasLens Mobile Alert] ${headline}`)}&body=${encodeURIComponent(smsCopy)}`;
        window.location.href = mailtoUrl;
      }
      setTimeout(() => setSentSuccess(null), 6000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnableWebPush = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPushStatus('Web Push Notifications are not supported in this browser.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('🚨 VeritasLens Breaking Mobile Alert', {
          body: `"${headline.slice(0, 80)}..." - Bias Asymmetry: ${leftPct}% Left vs ${rightPct}% Right.`,
          icon: '/hero.png'
        });
        setPushStatus('✅ Mobile Push Notifications enabled! Test notification sent to your screen.');
      } else {
        setPushStatus('Push notification permission was denied in browser settings.');
      }
    } catch (e: any) {
      setPushStatus(`Push activation error: ${e.message}`);
    }
    setTimeout(() => setPushStatus(null), 8000);
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative overflow-hidden animate-fade-in max-h-[92vh] flex flex-col">
        {/* Ambient Glow */}
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-700/80 text-emerald-400">
              <Smartphone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Send Breaking Alert to Phone
              </h3>
              <p className="text-xs text-slate-400">
                1-Click instant SMS, WhatsApp, Telegram & Mobile Push notifications.
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

        {/* Channel Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0 overflow-x-auto">
          <button
            onClick={() => setSelectedChannel('sms')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              selectedChannel === 'sms'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>💬 SMS / Text Msg</span>
          </button>

          <button
            onClick={() => setSelectedChannel('whatsapp')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              selectedChannel === 'whatsapp'
                ? 'bg-green-600 text-white shadow-md shadow-green-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🟢 WhatsApp Alert</span>
          </button>

          <button
            onClick={() => setSelectedChannel('telegram')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              selectedChannel === 'telegram'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>✈️ Telegram</span>
          </button>

          <button
            onClick={() => setSelectedChannel('push')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              selectedChannel === 'push'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🔔 Mobile Push</span>
          </button>
        </div>

        {/* Input & Preview */}
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {selectedChannel !== 'push' ? (
            <div>
              <label className="text-xs font-mono font-semibold text-slate-300 block mb-1.5">
                Recipient Phone Number (Optional):
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. +1 (555) 019-2834 (or leave blank to pick contact on phone)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-rose-400">
                <BellRing className="w-5 h-5 animate-bounce" />
                <span className="text-xs font-mono font-bold uppercase">Lock-Screen Breaking News Push Alerts</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Receive instant high-priority notifications on your phone whenever VeritasLens detects significant partisan media blindspots, fabricated claims, or breaking SCOTUS dockets.
              </p>
              <button
                onClick={handleEnableWebPush}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs rounded-xl transition shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span>Enable Mobile Push Notifications on This Device</span>
              </button>
              {pushStatus && (
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300">
                  {pushStatus}
                </div>
              )}
            </div>
          )}

          {/* Live Mobile Message Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>📱 Formatted Mobile Alert Message:</span>
              <span className="text-[10px] text-emerald-400">Ready for Instant Dispatch</span>
            </div>
            <textarea
              readOnly
              value={currentMessage}
              rows={7}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono leading-relaxed resize-none focus:outline-none scrollbar-thin"
            />
          </div>

          {sentSuccess && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-700 rounded-lg text-xs font-mono text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{sentSuccess}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 shrink-0">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer border border-slate-700"
          >
            {copiedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copiedSuccess ? '✅ Copied to Clipboard!' : 'Copy Alert Text'}</span>
          </button>

          {selectedChannel !== 'push' && (
            <button
              onClick={handleSendToPhone}
              className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer shadow-lg ${
                selectedChannel === 'sms'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  : selectedChannel === 'whatsapp'
                  ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-600/30'
                  : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/30'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                {selectedChannel === 'sms' ? '💬 1-Click Send SMS to Phone' :
                 selectedChannel === 'whatsapp' ? '🟢 1-Click Send via WhatsApp' :
                 '✈️ 1-Click Send to Telegram'}
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
