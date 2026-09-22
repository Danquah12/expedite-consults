'use client';

import React, { useState } from 'react';
import { Property, getEnrichedCommunitySentiment, ResidentQuestionAnswer } from '../mockData';
import {
  Users,
  MessageSquare,
  ThumbsUp,
  ShieldCheck,
  Star,
  Send,
  HelpCircle,
  Sparkles,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface CommunitySentimentProps {
  property: Property;
}

export const CommunitySentiment: React.FC<CommunitySentimentProps> = ({ property }) => {
  const sentiment = getEnrichedCommunitySentiment(property);
  const [qaList, setQaList] = useState<ResidentQuestionAnswer[]>(sentiment.qaThreads);
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>({});
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  const handleUpvote = (id: string) => {
    if (upvotedIds[id]) return;
    setUpvotedIds((prev) => ({ ...prev, [id]: true }));
    setQaList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item))
    );
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    const newEntry: ResidentQuestionAnswer = {
      id: `qa-${Date.now()}`,
      question: newQuestion.trim(),
      askedBy: 'Prospective Buyer (You)',
      answer:
        'Question submitted to verified deed-holding neighbors in this school cluster. Average resident response time: 3.4 hours.',
      answeredBy: 'Awaiting Verified Resident Responses',
      residentType: 'Moderated Community Queue',
      yearsInNeighborhood: 0,
      upvotes: 1,
      verifiedResident: false,
    };

    setQaList([newEntry, ...qaList]);
    setNewQuestion('');
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 4000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#0C382E] flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Civic Intelligence</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight mt-0.5">
            Community Sentiment & Verified Resident Q&A
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Real lived experience from verified homeowners and tenants in {property.city} ({property.county}).
          </p>
        </div>

        {/* Overall Score Badge */}
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-center space-x-3 self-start sm:self-auto">
          <div className="w-10 h-10 rounded-lg bg-[#0C382E] text-white flex items-center justify-center font-black text-lg shadow-xs">
            {sentiment.overallScore}
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Community Vibe Index
            </span>
            <span className="text-xs font-semibold text-emerald-950">
              Top 8% in Northern Virginia
            </span>
          </div>
        </div>
      </div>

      {/* 6 Sentiment Category Bars */}
      <div className="space-y-3">
        <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider">
          Verified Micro-Neighborhood Feedback
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sentiment.metrics.map((metric) => (
            <div key={metric.category} className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">{metric.category}</span>
                <span className="text-xs font-black text-[#0C382E]">{metric.score}/100</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${metric.score}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-500 pt-0.5">
                <span>{metric.summary}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resident Q&A Marketplace */}
      <div className="space-y-4 pt-2 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-1.5">
              <MessageSquare className="w-4 h-4 text-[#0C382E]" />
              <span>Ask a Verified Resident</span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Questions answered exclusively by residents verified via county tax roll and property deed records.
            </p>
          </div>

          <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md self-start sm:self-auto font-medium">
            🛡️ Strict Anti-Steering & Fair Housing Filter Active
          </span>
        </div>

        {/* Submit Question Form */}
        <form onSubmit={handleAskQuestion} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g., Is traffic noisy in the morning? How responsive is the school administration?"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0C382E] focus:border-transparent"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-lg bg-[#0C382E] text-white font-bold text-xs hover:bg-[#08261F] transition-colors flex items-center space-x-1.5 shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask Neighbors</span>
          </button>
        </form>

        {submittedSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Your question was queued and routed to verified neighbors in this school pyramid.</span>
          </div>
        )}

        {/* Existing Q&A Threads */}
        <div className="space-y-3">
          {qaList.map((qa) => (
            <div key={qa.id} className="bg-gray-50/70 border border-gray-200 rounded-xl p-3.5 sm:p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-900">“{qa.question}”</span>
                  </div>
                  <span className="text-[10px] text-gray-400 block">Asked by {qa.askedBy}</span>
                </div>

                <button
                  onClick={() => handleUpvote(qa.id)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    upvotedIds[qa.id]
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                  title="Helpful community answer"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>{qa.upvotes}</span>
                </button>
              </div>

              {/* Answer Content */}
              <div className="bg-white p-3 rounded-lg border border-gray-150 text-xs text-gray-800 leading-relaxed">
                <p>{qa.answer}</p>
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
                  <span className="flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <strong>{qa.answeredBy}</strong>
                    {qa.yearsInNeighborhood > 0 && <span>({qa.yearsInNeighborhood} yrs resident)</span>}
                  </span>
                  <span className="text-emerald-700 font-mono font-bold">VERIFIED NEIGHBOR</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunitySentiment;
