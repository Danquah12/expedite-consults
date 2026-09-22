'use client';

import React, { useState } from 'react';
import { Property } from '../mockData';
import {
  Calendar,
  Hammer,
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
  Wrench,
  TrendingUp,
  Filter,
} from 'lucide-react';

interface PropertyTimelineProps {
  property: Property;
}

export const PropertyTimeline: React.FC<PropertyTimelineProps> = ({ property }) => {
  const [filterType, setFilterType] = useState<string>('all');

  const timelineItems = property.timeline || [];

  const filteredItems = timelineItems.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'built':
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case 'sale':
        return <DollarSign className="w-4 h-4 text-sky-600" />;
      case 'permit':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'renovation':
        return <Hammer className="w-4 h-4 text-purple-600" />;
      case 'listed':
      default:
        return <TrendingUp className="w-4 h-4 text-[#0C382E]" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'built':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'sale':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'permit':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'renovation':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'listed':
      default:
        return 'bg-emerald-50 text-[#0C382E] border-emerald-300';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#0C382E] block">
            Proprietary Property Graph Timeline
          </span>
          <h2 className="text-xl font-black tracking-tight text-gray-950">
            Property Lifecycle & Renovation Timeline
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Full chronological record from original construction through county-permitted renovations to active listing.
          </p>
        </div>

        {/* Milestone Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
          <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          {[
            { id: 'all', label: 'All Milestones' },
            { id: 'renovation', label: 'Renovations' },
            { id: 'permit', label: 'Permits' },
            { id: 'sale', label: 'Sales & Deeds' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterType === f.id
                  ? 'bg-[#0C382E] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Timeline Stream */}
      <div className="relative pl-6 border-l-2 border-emerald-200 space-y-6 ml-3">
        {filteredItems.map((item, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline Dot Marker */}
            <div className="absolute -left-[31px] top-1 w-6 h-6 rounded-full bg-white border-2 border-emerald-600 flex items-center justify-center shadow-xs">
              {getIcon(item.type)}
            </div>

            {/* Timeline Milestone Card */}
            <div className="bg-gray-50/70 hover:bg-emerald-50/30 p-4 rounded-xl border border-gray-200/80 transition-all hover:border-emerald-300 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-black text-gray-900">{item.year}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.2 rounded-full border ${getBadgeColor(item.type)}`}>
                    {item.type}
                  </span>
                  <h4 className="text-xs font-bold text-gray-900">{item.title}</h4>
                </div>

                {item.cost && (
                  <span className="text-xs font-black text-gray-900 self-start sm:self-auto">
                    ${item.cost.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
