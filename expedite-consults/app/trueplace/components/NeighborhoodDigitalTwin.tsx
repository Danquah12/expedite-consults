'use client';

import React from 'react';
import { Property } from '../mockData';
import {
  GraduationCap,
  Train,
  Building,
  TrendingUp,
  MapPin,
  Compass,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

interface NeighborhoodDigitalTwinProps {
  property: Property;
}

export const NeighborhoodDigitalTwin: React.FC<NeighborhoodDigitalTwinProps> = ({ property }) => {
  const nt = property.neighborhoodTwin;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-100 pb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#0C382E] block">
          Civic & Geographic Intelligence
        </span>
        <h2 className="text-xl font-black text-gray-950 tracking-tight">
          Neighborhood Digital Twin: {property.city} Corridor
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Northern Virginia buyers purchase school clusters, transit walksheds, and infrastructure momentum. Explore hyper-local factors driving this property's equity.
        </p>
      </div>

      {/* Grid of Micro-Intelligence Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. School Cluster Intelligence */}
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2.5">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-emerald-700" />
            <div>
              <span className="text-[10px] font-bold uppercase text-emerald-800 block">Public School Pyramid</span>
              <h4 className="font-bold text-xs text-emerald-950">{nt.fcpsCluster}</h4>
            </div>
          </div>
          <div className="text-2xl font-black text-[#0C382E]">
            {nt.schoolRating} <span className="text-xs font-normal text-emerald-800">/ 10 Rating</span>
          </div>
          <p className="text-[11px] text-emerald-900 leading-normal">
            Ranked in top 5% statewide with 94%+ Advanced Placement participation and upward velocity.
          </p>
        </div>

        {/* 2. Mass Transit & Metro Walkshed */}
        <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-200 space-y-2.5">
          <div className="flex items-center space-x-2">
            <Train className="w-5 h-5 text-sky-700" />
            <div>
              <span className="text-[10px] font-bold uppercase text-sky-800 block">Rapid Transit Walkshed</span>
              <h4 className="font-bold text-xs text-sky-950">{nt.metroStation}</h4>
            </div>
          </div>
          <div className="text-2xl font-black text-sky-950">
            {nt.metroDistanceMi} <span className="text-xs font-normal text-sky-700">Miles Distance</span>
          </div>
          <p className="text-[11px] text-sky-900 leading-normal">
            Direct commuter link to Amazon HQ2 National Landing, Tysons, and Downtown Washington DC.
          </p>
        </div>

        {/* 3. Micro-Market Appreciation Velocity */}
        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2.5">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-amber-700" />
            <div>
              <span className="text-[10px] font-bold uppercase text-amber-800 block">Appreciation Momentum</span>
              <h4 className="font-bold text-xs text-amber-950">1-Year Velocity</h4>
            </div>
          </div>
          <div className="text-2xl font-black text-amber-950">
            +{nt.appreciationVelocity1Yr}% <span className="text-xs font-normal text-amber-700">Annualized</span>
          </div>
          <p className="text-[11px] text-amber-900 leading-normal">
            Strong capital inflow outpacing broader Mid-Atlantic baseline by 1.8% due to low inventory supply.
          </p>
        </div>
      </div>

      {/* Planned Infrastructure & Economic Growth */}
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-start space-x-3">
        <Building className="w-5 h-5 text-[#0C382E] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-gray-900">Regional Infrastructure & Master Plan Context</h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            {nt.infrastructureNotes}
          </p>
        </div>
      </div>
    </div>
  );
};
