'use client';

import React, { useState } from 'react';
import { Property } from '../mockData';
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  Copy,
  Check,
  ShieldAlert,
  Scale,
  DollarSign,
  FileCheck,
} from 'lucide-react';

interface NegotiationAssistantModalProps {
  property: Property;
}

export const NegotiationAssistantModal: React.FC<NegotiationAssistantModalProps> = ({ property }) => {
  const [mode, setMode] = useState<'buyer' | 'seller'>('buyer');
  const [copied, setCopied] = useState(false);

  const neg = property.negotiationData;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#0C382E] flex items-center space-x-1.5">
            <Scale className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tactical Pricing Co-Pilot</span>
          </span>
          <h2 className="text-xl font-black text-gray-950 tracking-tight mt-0.5">
            AI Negotiation Assistant™
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Harness TreeSHAP mechanical deductions and micro-comp velocity to structure optimal offers or defend listing price.
          </p>
        </div>

        {/* Toggle between Buyer and Seller Mode */}
        <div className="flex items-center p-1 bg-gray-100 rounded-xl self-start sm:self-auto border border-gray-200">
          <button
            onClick={() => setMode('buyer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'buyer'
                ? 'bg-[#0C382E] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Buyer Mode
          </button>
          <button
            onClick={() => setMode('seller')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'seller'
                ? 'bg-[#0C382E] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Seller Mode
          </button>
        </div>
      </div>

      {/* Mode Content */}
      {mode === 'buyer' ? (
        <div className="space-y-5">
          {/* Target Offer Banner */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-emerald-900 uppercase">AI Recommended Target Offer</span>
              <div className="text-2xl font-black text-[#0C382E]">
                ${neg.buyerTargetOffer.toLocaleString()}
              </div>
              <div className="text-xs text-emerald-700">
                Discount Strategy: ${(property.listPrice - neg.buyerTargetOffer).toLocaleString()} below listing price based on verified mechanical deductions
              </div>
            </div>

            <div className="text-xs font-semibold text-emerald-800 bg-white/70 px-3 py-2 rounded-lg border border-emerald-200">
              List Price: ${property.listPrice.toLocaleString()} • TrueValue: ${property.trueValue.toLocaleString()}
            </div>
          </div>

          {/* Key Leverage Points */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Tactical Buyer Leverage Points
            </h4>
            <div className="space-y-2">
              {neg.buyerLeveragePoints.map((point, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-start space-x-2.5 text-xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ready-to-Copy Offer Clause */}
          <div className="bg-[#F8FAF9] p-4 rounded-xl border border-gray-300 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                Recommended Contract Addendum Contingency
              </span>
              <button
                onClick={() => handleCopy(neg.suggestedContingency)}
                className="flex items-center space-x-1 text-xs font-bold text-[#0C382E] hover:underline cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Addendum Clause'}</span>
              </button>
            </div>
            <p className="p-3 bg-white rounded-lg border border-gray-200 font-mono text-[11px] text-gray-800 leading-relaxed">
              "{neg.suggestedContingency}"
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Seller Recommended Counter */}
          <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-sky-900 uppercase">Recommended Counter-Offer Strategy</span>
              <div className="text-2xl font-black text-sky-950">
                ${neg.sellerCounterOffer.toLocaleString()}
              </div>
              <div className="text-xs text-sky-800">
                Firm Stance: Backed by certified county building permits and high TrueValue confidence ({property.confidence}%)
              </div>
            </div>

            <div className="text-xs font-semibold text-sky-900 bg-white/70 px-3 py-2 rounded-lg border border-sky-200">
              List Price: ${property.listPrice.toLocaleString()}
            </div>
          </div>

          {/* Price Defense Points */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Seller Price Defense Rationale
            </h4>
            <div className="space-y-2">
              {neg.sellerDefensePoints.map((point, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-start space-x-2.5 text-xs">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
