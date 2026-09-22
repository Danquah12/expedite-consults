'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Property, getEnrichedTrueCost, getEnrichedPropertyDNA } from '../mockData';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  Home,
  DollarSign,
  Layers,
  Wrench,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface HomeownershipCopilotProps {
  property: Property;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
  metadata?: {
    category?: string;
    financialEstimate?: string;
    zoningCitation?: string;
  };
}

export const HomeownershipCopilot: React.FC<HomeownershipCopilotProps> = ({ property }) => {
  const trueCost = getEnrichedTrueCost(property);
  const dna = getEnrichedPropertyDNA(property);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'copilot',
      text: `Hello! I am your TruePlace Homeownership Copilot™. I have ingested the complete digital twin for ${property.address} in ${property.city}, including its Fairfax/Arlington LDS permit records, 2026 TreeSHAP valuation ($${property.trueValue.toLocaleString()}), and municipal zoning overlays. How can I advise you today?`,
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Pre-configured intelligent prompt suggestions
  const SUGGESTIONS = [
    {
      label: 'Can I build an ADU here?',
      query: `Can I build an Accessory Dwelling Unit (ADU) at ${property.address}? What are the zoning and setback requirements?`,
    },
    {
      label: 'Should I renovate the kitchen or add a primary suite?',
      query: `What is the expected ROI of a luxury kitchen remodel versus a primary suite expansion for this home?`,
    },
    {
      label: 'When does refinancing make sense?',
      query: `If interest rates decline from 6.625% to 5.75%, how much would my monthly TrueCost drop, and what is the breakeven?`,
    },
    {
      label: 'Should I sell or rent it out?',
      query: `Analyze whether I should sell at TrueValue ($${property.trueValue.toLocaleString()}) or rent it out at $${property.investmentData.estimatedRent.toLocaleString()}/mo.`,
    },
  ];

  const handleSend = (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    // Context-sensitive deterministic response logic
    setTimeout(() => {
      let replyText = '';
      let meta: ChatMessage['metadata'] = undefined;

      const lower = q.toLowerCase();

      if (lower.includes('adu') || lower.includes('accessory')) {
        const isArlington = property.county.includes('Arlington');
        if (isArlington) {
          replyText = `Under Arlington County's Missing Middle and ADU Housing Guidelines, accessory dwelling units are permitted up to 750 sq.ft. (or 35% of gross floor area). Because this lot is ${property.lotSizeSqft.toLocaleString()} sq.ft., a detached ADU is feasible subject to a 5-foot rear/side setback and owner-occupancy on the parcel. Estimated build cost: $160,000 - $210,000; estimated monthly rental revenue: $1,900 - $2,200/mo.`;
          meta = {
            category: 'Zoning & Development',
            zoningCitation: 'Arlington County Zoning Ordinance Section 12.9 (ADUs)',
            financialEstimate: '+$2,100/mo Net Rental Inflow',
          };
        } else {
          replyText = `Under Fairfax County Zoning Ordinance § 4102.7, an Accessory Living Unit (ALU) is permitted within the principal dwelling by right, or as a detached structure with a Special Permit on lots over 2 acres. For this ${property.lotSizeSqft.toLocaleString()} sq.ft. parcel, finishing the lower level as an interior suite is the most friction-free pathway without county board variance hearings.`;
          meta = {
            category: 'Zoning & Permitting',
            zoningCitation: 'Fairfax County Zoning Ordinance § 4102.7',
            financialEstimate: 'Interior Build ROI: 78% of Capital Expended',
          };
        }
      } else if (lower.includes('renovate') || lower.includes('kitchen') || lower.includes('suite')) {
        replyText = `Based on Northern Virginia resale comp analytics, a luxury kitchen remodel ($65,000 investment) in ${property.city} yields an estimated TrueValue appreciation of +$48,500 (~75% immediate return). However, adding a ground-floor primary suite would elevate this property from ${property.beds} to ${property.beds + 1} beds, unlocking an estimated +$95,000 in market valuation against an $85,000 build cost (112% ROI).`;
        meta = {
          category: 'Renovation ROI',
          financialEstimate: 'Primary Suite ROI: 112% | Kitchen ROI: 75%',
        };
      } else if (lower.includes('refinance') || lower.includes('interest rate')) {
        const loan = property.listPrice * 0.8;
        const currentPI = trueCost.principalAndInterest;
        // 5.75% rate
        const r = 0.0575 / 12;
        const newPI = Math.round((loan * (r * Math.pow(1 + r, 360))) / (Math.pow(1 + r, 360) - 1));
        const savings = currentPI - newPI;
        replyText = `At a 5.75% rate (an 87.5 bps reduction from 6.625%), your Principal & Interest drops from $${currentPI.toLocaleString()}/mo to $${newPI.toLocaleString()}/mo—saving you $${savings.toLocaleString()} every single month ($${(savings * 12).toLocaleString()}/year). Assuming standard Northern Virginia closing and settlement fees of ~$6,500, your breakeven horizon is approximately ${(6500 / savings).toFixed(1)} months.`;
        meta = {
          category: 'Refinance Analysis',
          financialEstimate: `$${savings.toLocaleString()}/mo savings • ${(6500 / savings).toFixed(1)} mo breakeven`,
        };
      } else if (lower.includes('rent') || lower.includes('sell')) {
        const rent = property.investmentData.estimatedRent;
        const cap = property.investmentData.capRate;
        replyText = `If you sell today at TrueValue ($${property.trueValue.toLocaleString()}), after 5.5% brokerage commissions and Virginia transfer taxes, you take home ~$${Math.round(property.trueValue * 0.94).toLocaleString()} in gross equity. If you hold as a rental, market comps in ${property.zip} command $${rent.toLocaleString()}/mo, generating a ${cap}% cap rate and an expected 5-year appreciation gain of +${property.investmentData.fiveYearAppreciationPct}%. Holding is strongly favored if you have low fixed-rate leverage.`;
        meta = {
          category: 'Wealth Strategy',
          financialEstimate: `$${rent.toLocaleString()}/mo Gross Rent • ${cap}% Cap Rate`,
        };
      } else {
        replyText = `Analyzing your query against the parcel records for ${property.address}. This property currently holds a TrueValue of $${property.trueValue.toLocaleString()} with a ${property.confidence}% confidence interval and a Property Health Score of ${property.healthScores.overall}/100. Its all-in monthly TrueCost is $${trueCost.totalMonthlyTrueCost.toLocaleString()}/mo. Would you like me to model counterfactual renovations, tax appeal projections, or school boundary appreciation trends?`;
      }

      const copilotMsg: ChatMessage = {
        id: `copilot-${Date.now()}`,
        sender: 'copilot',
        text: replyText,
        timestamp: 'Just now',
        metadata: meta,
      };

      setMessages((prev) => [...prev, copilotMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-4 w-full max-w-full overflow-hidden flex flex-col h-[650px] sm:h-[700px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#0C382E] text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-950 tracking-tight">
                Homeownership Copilot™
              </h2>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.2 rounded-full font-mono font-bold">
                PARCEL-GROUNDED AI
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Personalized advisory for {property.address} • {property.city}, {property.state}
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'reset',
                sender: 'copilot',
                text: `Conversation reset. Ingested parcel records for ${property.address}. What would you like to model?`,
                timestamp: 'Just now',
              },
            ])
          }
          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          title="Reset conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Suggestion Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 shrink-0 no-scrollbar">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            onClick={() => handleSend(s.query)}
            className="px-3 py-1.5 rounded-full bg-emerald-50 text-[#0C382E] border border-emerald-200 text-xs font-semibold whitespace-nowrap hover:bg-emerald-100 transition-colors cursor-pointer shrink-0"
          >
            ✨ {s.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs sm:text-sm">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 sm:p-4 space-y-2 ${
                  isUser
                    ? 'bg-[#0C382E] text-white rounded-br-xs'
                    : 'bg-gray-100 text-gray-900 rounded-bl-xs border border-gray-200'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>

                {/* Grounded Citation / Metadata Card */}
                {m.metadata && (
                  <div className="mt-2 pt-2 border-t border-gray-200/60 bg-white/70 rounded-lg p-2.5 text-[11px] space-y-1 text-gray-800">
                    {m.metadata.financialEstimate && (
                      <div className="flex items-center space-x-1.5 font-bold text-emerald-800">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{m.metadata.financialEstimate}</span>
                      </div>
                    )}
                    {m.metadata.zoningCitation && (
                      <div className="flex items-center space-x-1.5 text-gray-600 font-mono text-[10px]">
                        <ShieldCheck className="w-3 h-3 text-blue-600" />
                        <span>Source: {m.metadata.zoningCitation}</span>
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={`text-[9px] ${
                    isUser ? 'text-emerald-300/80 text-right' : 'text-gray-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-600 rounded-2xl p-3 rounded-bl-xs border border-gray-200 flex items-center space-x-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Copilot is querying Fairfax/Arlington zoning & TrueValue models...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="pt-2 border-t border-gray-100 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask anything (e.g., ADU zoning, kitchen ROI, refinancing breakeven)..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0C382E] focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="px-4 py-2.5 rounded-xl bg-[#0C382E] text-white font-bold text-xs sm:text-sm hover:bg-[#08261F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 shrink-0 cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default HomeownershipCopilot;
