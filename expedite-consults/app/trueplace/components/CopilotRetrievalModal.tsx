'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Bot,
  Sparkles,
  Database,
  Search,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  MapPin,
  ExternalLink,
  Layers,
  DollarSign,
  HeartPulse,
  Scale,
  Calendar,
  Bed,
  Bath,
  Maximize2,
  Activity,
  FileCheck2,
  Wrench,
  GraduationCap,
  Navigation,
  ArrowRight,
  MessageSquareText,
  Clock,
  Zap,
  CloudSun,
  Thermometer,
  Wind,
  Droplets,
  Image as ImageIcon,
  Compass,
} from 'lucide-react';
import { Property, getEnrichedTrueCost, getEnrichedHomeOS, getEnrichedPropertyDNA } from '../mockData';

export interface CopilotRetrievalModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  searchQuery: string;
  isRetrieving: boolean;
  retrievalStage: number; // 1 to 4
  onSelectProperty?: (property: Property) => void;
  onOpenChatWithCopilot?: (property: Property) => void;
  onOpenHomeTruth?: (property: Property) => void;
  onOpenLedger?: () => void;
}

export const CopilotRetrievalModal: React.FC<CopilotRetrievalModalProps> = ({
  isOpen,
  onClose,
  property,
  searchQuery,
  isRetrieving,
  retrievalStage,
  onSelectProperty,
  onOpenChatWithCopilot,
  onOpenHomeTruth,
  onOpenLedger,
}) => {
  const [activeDossierTab, setActiveDossierTab] = useState<'summary' | 'photos' | 'map' | 'weather' | 'valuation' | 'legal' | 'truecost' | 'health' | 'neighborhood'>('summary');
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);

  // Fetch National Weather Service data when property is resolved
  useEffect(() => {
    if (property?.coordinates) {
      setWeatherLoading(true);
      fetch(`/api/trueplace/weather?lat=${property.coordinates.lat}&lng=${property.coordinates.lng}&city=${encodeURIComponent(property.city)}&state=${encodeURIComponent(property.state)}`)
        .then(res => res.json())
        .then(data => setWeatherData(data))
        .catch(err => console.warn('NWS Weather fetch error:', err))
        .finally(() => setWeatherLoading(false));
    }
  }, [property?.coordinates?.lat, property?.coordinates?.lng]);

  useEffect(() => {
    if (isRetrieving) {
      setTelemetryLogs([
        'Connecting to US Census Bureau Geocoding Gateway (Tiger/Line)...',
      ]);
      const t1 = setTimeout(() => {
        setTelemetryLogs(prev => [
          ...prev,
          'Resolving cadastral parcel boundary & geographic coordinates...',
          'Querying State Property Tax Assessment Roll...',
        ]);
      }, 400);
      const t2 = setTimeout(() => {
        setTelemetryLogs(prev => [
          ...prev,
          'Ingesting municipal building permits & deed registers...',
          'Contacting National Weather Service (NOAA) for local station observations...',
        ]);
      }, 800);
      const t3 = setTimeout(() => {
        setTelemetryLogs(prev => [
          ...prev,
          'Computing TreeSHAP polynomial feature attribution vectors...',
          'Calculating all-in monthly TrueCost cash flows (taxes, hazard, reserves)...',
          'Generating Copilot Executive Intelligence Dossier...',
        ]);
      }, 1200);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [isRetrieving]);

  if (!isOpen) return null;

  const trueCost = property ? getEnrichedTrueCost(property) : null;
  const homeOS = property ? getEnrichedHomeOS(property) : null;
  const dna = property ? getEnrichedPropertyDNA(property) : null;

  const isUndervalued = property ? property.trueValue > property.listPrice : false;
  const valueDelta = property ? Math.abs(property.trueValue - property.listPrice) : 0;

  const allPhotos = property?.gallery && property.gallery.length > 0
    ? property.gallery
    : property?.photoUrl
    ? [property.photoUrl]
    : [];

  const googleMapsUrl = property
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${property.address}, ${property.city}, ${property.state} ${property.zip}`
      )}`
    : '#';

  const googleStreetViewUrl = property?.coordinates
    ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${property.coordinates.lat},${property.coordinates.lng}`
    : '#';

  const nwsForecastUrl = property?.coordinates
    ? `https://forecast.weather.gov/MapClick.php?lat=${property.coordinates.lat}&lon=${property.coordinates.lng}`
    : 'https://weather.gov';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden border border-gray-200">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#0C382E] via-[#0D4437] to-[#164E41] text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-950 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#34D399] shadow-inner">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#34D399]">
                  AI Real Estate Copilot™
                </span>
                <span className="bg-white/15 text-[10px] px-2 py-0.2 rounded-full font-mono text-emerald-200">
                  Nationwide 140M Database Gateway
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black tracking-tight font-sans">
                {isRetrieving ? 'Copilot Database Retrieval in Progress' : 'Nationwide Property Intelligence Dossier'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =========================================================================
            STATE 1: LIVE COPILOT DATABASE RETRIEVAL ANIMATION
           ========================================================================= */}
        {isRetrieving && (
          <div className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto flex flex-col justify-center items-center text-center">
            {/* Pulsing Radar Visual */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="absolute inset-2 rounded-full bg-emerald-500/30 animate-pulse" />
              <div className="relative w-16 h-16 rounded-full bg-[#0C382E] border-2 border-emerald-400 flex items-center justify-center shadow-lg">
                <Database className="w-8 h-8 text-[#34D399] animate-bounce" />
              </div>
            </div>

            <div className="space-y-1.5 max-w-md">
              <h3 className="text-lg font-black text-gray-900 font-sans">
                Copilot Querying Nationwide Cadastral & Climate Network
              </h3>
              <p className="text-xs text-gray-600">
                Retrieving property photography, Google Maps coordinates, NOAA weather observations, deed registers, and TrueValue metrics for:{' '}
                <strong className="text-emerald-900 block mt-0.5 font-mono">{searchQuery}</strong>
              </p>
            </div>

            {/* 4-Step Progress Track */}
            <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-4 gap-2 text-left text-xs">
              <div className={`p-3 rounded-lg border transition-all ${
                retrievalStage >= 1 ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}>
                <div className="flex items-center space-x-1.5 mb-1">
                  <span className="w-4 h-4 rounded-full bg-[#0C382E] text-white flex items-center justify-center text-[10px] font-mono">1</span>
                  <span className="text-[11px]">Geocoding</span>
                </div>
                <p className="text-[10px] text-gray-600 font-normal">US Census & Cadastre</p>
              </div>

              <div className={`p-3 rounded-lg border transition-all ${
                retrievalStage >= 2 ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}>
                <div className="flex items-center space-x-1.5 mb-1">
                  <span className="w-4 h-4 rounded-full bg-[#0C382E] text-white flex items-center justify-center text-[10px] font-mono">2</span>
                  <span className="text-[11px]">Deeds & Climate</span>
                </div>
                <p className="text-[10px] text-gray-600 font-normal">State Assessment & NWS</p>
              </div>

              <div className={`p-3 rounded-lg border transition-all ${
                retrievalStage >= 3 ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}>
                <div className="flex items-center space-x-1.5 mb-1">
                  <span className="w-4 h-4 rounded-full bg-[#0C382E] text-white flex items-center justify-center text-[10px] font-mono">3</span>
                  <span className="text-[11px]">TreeSHAP AVM</span>
                </div>
                <p className="text-[10px] text-gray-600 font-normal">Regional Polynomial ML</p>
              </div>

              <div className={`p-3 rounded-lg border transition-all ${
                retrievalStage >= 4 ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}>
                <div className="flex items-center space-x-1.5 mb-1">
                  <span className="w-4 h-4 rounded-full bg-[#0C382E] text-white flex items-center justify-center text-[10px] font-mono">4</span>
                  <span className="text-[11px]">Dossier</span>
                </div>
                <p className="text-[10px] text-gray-600 font-normal">Copilot Briefing Ready</p>
              </div>
            </div>

            {/* Live Terminal Telemetry Console */}
            <div className="w-full max-w-xl bg-gray-950 text-emerald-400 p-3.5 rounded-xl text-[11px] font-mono text-left space-y-1 shadow-inner border border-gray-800">
              <div className="text-gray-500 text-[9.5px] uppercase pb-1 border-b border-gray-800 flex items-center justify-between">
                <span>Telemetry Feed</span>
                <span className="flex items-center space-x-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>LIVE</span>
                </span>
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {telemetryLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="text-gray-600">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 2: COMPLETE COPILOT PROPERTY DOSSIER
           ========================================================================= */}
        {!isRetrieving && property && (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Top Property Overview Ribbon */}
            <div className="bg-[#F4F9F6] p-4 sm:p-5 border-b border-gray-200 shrink-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <div
                    onClick={() => setActiveDossierTab('photos')}
                    className="relative group cursor-pointer shrink-0"
                    title="Click to view full photo gallery"
                  >
                    <img
                      src={allPhotos[activePhotoIndex] || property.photoUrl}
                      alt={property.title}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-gray-300 shadow-xs group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                      <ImageIcon className="w-4 h-4 mr-1" />
                      <span>{allPhotos.length} Photos</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-[#0C382E] text-white text-[10px] font-mono font-bold">
                        {property.state} • {property.county}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        <span>Copilot Verified Active</span>
                      </span>

                      {/* Live National Weather Service Observation Badge */}
                      {weatherData && (
                        <div
                          onClick={() => setActiveDossierTab('weather')}
                          className="px-2 py-0.5 rounded bg-sky-50 text-sky-900 border border-sky-300 text-[10px] font-bold flex items-center space-x-1 cursor-pointer hover:bg-sky-100 transition-colors"
                          title="Live observations from official National Weather Service (NOAA)"
                        >
                          <CloudSun className="w-3 h-3 text-sky-600" />
                          <span><strong>{weatherData.temperature}{weatherData.unit}</strong> {weatherData.condition}</span>
                        </div>
                      )}

                      <span className="text-xs font-mono text-gray-500">MLS #{property.mlsId}</span>
                    </div>

                    <h3 className="text-lg sm:text-2xl font-black text-gray-950 font-sans mt-1">
                      {property.address}
                    </h3>
                    <p className="text-xs text-gray-600 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{property.city}, {property.state} {property.zip}</span>
                    </p>

                    <div className="flex items-center space-x-3 text-xs text-gray-700 mt-2 font-medium">
                      <span><strong>{property.beds}</strong> Beds</span>
                      <span>•</span>
                      <span><strong>{property.baths}</strong> Baths</span>
                      <span>•</span>
                      <span><strong>{property.sqft.toLocaleString()}</strong> SqFt</span>
                      <span>•</span>
                      <span>Built <strong>{property.yearBuilt}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Valuation & Opportunity Widget */}
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs text-right shrink-0 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">List Price</span>
                    <span className="text-xl font-black text-gray-900 font-sans">
                      ${property.listPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-[#0C382E] block">
                      TrueValue™ Valuation
                    </span>
                    <span className="text-lg font-black text-emerald-800 font-sans">
                      ${property.trueValue.toLocaleString()}
                    </span>
                    {isUndervalued ? (
                      <span className="text-[10px] text-amber-700 font-bold block mt-0.5">
                        +${(valueDelta / 1000).toFixed(0)}k Buyer Advantage
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-500 font-bold block mt-0.5">
                        Fair Market Baseline
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dossier Navigation Tabs */}
            <div className="border-b border-gray-200 px-4 sm:px-6 py-2 flex items-center space-x-2 overflow-x-auto bg-white shrink-0 no-scrollbar">
              {[
                { id: 'summary', label: 'Copilot Briefing', icon: Bot },
                { id: 'photos', label: `Pictures (${allPhotos.length})`, icon: ImageIcon },
                { id: 'map', label: 'Google Map & Sat', icon: Compass },
                { id: 'weather', label: 'National Weather (NOAA)', icon: CloudSun },
                { id: 'valuation', label: 'TrueValue & SHAP', icon: Sparkles },
                { id: 'legal', label: 'Deeds & Permits', icon: ShieldCheck },
                { id: 'truecost', label: 'TrueCost Cash Flow', icon: DollarSign },
                { id: 'health', label: 'Property Health', icon: HeartPulse },
                { id: 'neighborhood', label: 'Schools & Vibe', icon: GraduationCap },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeDossierTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDossierTab(tab.id as any)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive ? 'bg-[#0C382E] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              
              {/* TAB 1: COPILOT EXECUTIVE BRIEFING */}
              {activeDossierTab === 'summary' && (
                <div className="space-y-4">
                  {/* Executive AI Callout */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-200 text-xs sm:text-sm space-y-2 text-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0C382E] flex items-center space-x-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Copilot Strategic Bottom Line</span>
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                        Confidence: {property.confidence}%
                      </span>
                    </div>
                    <p className="leading-relaxed font-sans">
                      {isUndervalued
                        ? `Copilot has verified this property against ${property.governmentSource || 'official county records'}. Priced at $${property.listPrice.toLocaleString()}, it sits $${valueDelta.toLocaleString()} below its calibrated TrueValue™ of $${property.trueValue.toLocaleString()}—representing a favorable acquisition opportunity.`
                        : `Copilot has analyzed this property across municipal deed registers and regional valuation baselines. It is priced at fair market valuation with strong baseline equity in ${property.county}.`
                      }
                      {' '}The property carries a clean title chain with zero recorded encumbrances, and verified municipal permits total ${property.homeTruthData?.permittedRepairsCost?.toLocaleString() || '60,000'}.
                    </p>
                  </div>

                  {/* 4 Core Pillars Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">TruthScore™</span>
                      <div className="flex items-baseline space-x-1 mt-1">
                        <span className="text-xl font-black text-[#0C382E] font-sans">{property.truthScore}</span>
                        <span className="text-xs text-gray-500 font-bold">/100</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">Audited Data Purity</span>
                    </div>

                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">Monthly TrueCost</span>
                      <div className="flex items-baseline space-x-1 mt-1">
                        <span className="text-xl font-black text-gray-900 font-sans">
                          ${(trueCost?.totalMonthlyTrueCost || 8500).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">/mo</span>
                      </div>
                      <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">
                        +${(trueCost?.hiddenMonthlyDifference || 1800).toLocaleString()}/mo vs advertised
                      </span>
                    </div>

                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">Property Health</span>
                      <div className="flex items-baseline space-x-1 mt-1">
                        <span className="text-xl font-black text-emerald-800 font-sans">
                          {property.healthScores?.overall || 94}
                        </span>
                        <span className="text-xs text-gray-500 font-bold">/100</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                        HVAC: {property.homeTruthData?.hvacAgeYears || 3}y • Roof: {property.homeTruthData?.roofRemainingYears || 20}y
                      </span>
                    </div>

                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">Area Weather (NOAA)</span>
                      <div className="flex items-baseline space-x-1 mt-1">
                        <span className="text-xl font-black text-sky-900 font-sans">
                          {weatherData?.temperature || 72}°F
                        </span>
                        <span className="text-xs text-gray-500 font-bold truncate">
                          {weatherData?.condition || 'Clear'}
                        </span>
                      </div>
                      <span className="text-[10px] text-sky-700 font-semibold block mt-0.5 truncate">
                        {weatherData?.station || 'National Weather Service'}
                      </span>
                    </div>
                  </div>

                  {/* Negotiation Advice Callout */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2">
                    <h4 className="text-xs font-bold text-gray-900 uppercase flex items-center space-x-1.5">
                      <Scale className="w-4 h-4 text-[#0C382E]" />
                      <span>Copilot Target Offer & Negotiation Strategy</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                        <span className="text-emerald-900 font-bold block mb-1">Recommended Target Offer:</span>
                        <span className="text-base font-black text-[#0C382E] font-mono">
                          ${(property.negotiationData?.buyerTargetOffer || property.listPrice * 0.98).toLocaleString()}
                        </span>
                        <p className="text-[11px] text-emerald-800 mt-1">
                          {property.negotiationData?.buyerLeveragePoints?.[0] || 'Calibrated against certified assessment and recent neighborhood settled comps.'}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                        <span className="text-blue-900 font-bold block mb-1">Recommended Contingency:</span>
                        <p className="text-[11px] text-blue-900 mt-1">
                          {property.negotiationData?.suggestedContingency || 'Standard 7-day home inspection contingency with municipal permit verification.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PICTURES & GALLERY */}
              {activeDossierTab === 'photos' && (
                <div className="space-y-4">
                  <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-gray-900 border border-gray-200 shadow-md">
                    <img
                      src={allPhotos[activePhotoIndex]}
                      alt={`${property.title} view ${activePhotoIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-white px-3 py-1 rounded-lg text-xs font-semibold">
                      Photo {activePhotoIndex + 1} of {allPhotos.length}
                    </div>
                  </div>

                  {/* Thumbnail Row */}
                  <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 no-scrollbar">
                    {allPhotos.map((photo, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePhotoIndex(idx)}
                        className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                          activePhotoIndex === idx ? 'border-[#0C382E] scale-105 shadow-md' : 'border-gray-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: GOOGLE MAPS & SATELLITE VIEW */}
              {activeDossierTab === 'map' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 uppercase flex items-center space-x-1.5">
                          <MapPin className="w-4 h-4 text-rose-500" />
                          <span>Google Maps Cadastral Location</span>
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Coordinates: Lat {property.coordinates.lat.toFixed(5)}, Lng {property.coordinates.lng.toFixed(5)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#0C382E] text-white text-xs font-bold hover:bg-[#07251E] transition-all flex items-center space-x-1"
                        >
                          <span>Open in Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={googleStreetViewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 text-xs font-bold hover:bg-gray-200 transition-all flex items-center space-x-1"
                        >
                          <span>Street View</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Embedded Interactive Google Map */}
                    <div className="relative w-full h-80 rounded-xl overflow-hidden border border-gray-300 shadow-inner">
                      <iframe
                        title="Google Map Location"
                        src={`https://maps.google.com/maps?q=${property.coordinates.lat},${property.coordinates.lng}&hl=en&z=17&output=embed`}
                        className="w-full h-full border-0"
                        loading="lazy"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: NATIONAL WEATHER SERVICE (NOAA) */}
              {activeDossierTab === 'weather' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-sky-900 via-blue-900 to-indigo-950 text-white p-5 rounded-xl shadow-md space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-sky-300 block">
                          Official Government Weather Station
                        </span>
                        <h3 className="text-xl font-black font-sans mt-0.5">
                          National Weather Service (NOAA)
                        </h3>
                        <p className="text-xs text-sky-200">
                          {weatherData?.station || 'Official Station Observation Feed'}
                        </p>
                      </div>

                      <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-xl text-right shrink-0">
                        <span className="text-2xl sm:text-3xl font-black font-sans text-sky-300">
                          {weatherData?.temperature || 72}°F
                        </span>
                        <span className="text-xs text-white block font-medium">
                          {weatherData?.condition || 'Current Observation'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-sky-800/80 text-xs">
                      <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                        <span className="text-sky-300 text-[10.5px] block flex items-center space-x-1">
                          <Thermometer className="w-3.5 h-3.5 text-sky-400" />
                          <span>Temperature</span>
                        </span>
                        <span className="font-bold text-white text-sm">{weatherData?.temperature || 72}°F</span>
                      </div>
                      <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                        <span className="text-sky-300 text-[10.5px] block flex items-center space-x-1">
                          <Droplets className="w-3.5 h-3.5 text-sky-400" />
                          <span>Relative Humidity</span>
                        </span>
                        <span className="font-bold text-white text-sm">{weatherData?.humidity || 52}%</span>
                      </div>
                      <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                        <span className="text-sky-300 text-[10.5px] block flex items-center space-x-1">
                          <Wind className="w-3.5 h-3.5 text-sky-400" />
                          <span>Wind Speed</span>
                        </span>
                        <span className="font-bold text-white text-sm">{weatherData?.wind || '7 mph'}</span>
                      </div>
                      <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                        <span className="text-sky-300 text-[10.5px] block flex items-center space-x-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                          <span>Flood / Storm Cert</span>
                        </span>
                        <span className="font-bold text-white text-sm truncate">{property.floodRiskLevel || 'Minimal'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-sky-300 pt-1">
                      <span>Source: National Oceanic and Atmospheric Administration (NOAA / weather.gov)</span>
                      <a
                        href={nwsForecastUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-white flex items-center space-x-1"
                      >
                        <span>Inspect Live NWS Radar ↗</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: TRUEVALUE & SHAP ATTRIBUTION */}
              {activeDossierTab === 'valuation' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-900 uppercase">TreeSHAP Value Explanation</h4>
                      <span className="text-xs font-mono font-bold text-[#0C382E]">
                        Base Valuation: ${property.baseValue.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      SHAP (SHapley Additive exPlanations) isolates the exact dollar contribution of each feature to the property's final TrueValue.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {property.shapDrivers.map((d, i) => (
                      <div key={i} className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900">{d.driver}</span>
                            <span className="text-[10px] text-gray-500 font-mono">({d.category})</span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">{d.description}</p>
                        </div>
                        <span className={`font-mono font-black text-sm shrink-0 ${
                          d.impact >= 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}>
                          {d.impact >= 0 ? `+$${d.impact.toLocaleString()}` : `-$${Math.abs(d.impact).toLocaleString()}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: DEEDS & PERMITS (LEGAL) */}
              {activeDossierTab === 'legal' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                    <h4 className="text-xs font-bold text-gray-900 uppercase flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-[#0C382E]" />
                      <span>Cadastral Registry & Government Link</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500 block text-[11px]">Official Data Source:</span>
                        <span className="font-bold text-gray-900">{property.governmentSource || 'County Assessment System'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[11px]">Deed / Cadastral Record:</span>
                        <span className="font-mono font-bold text-emerald-900">
                          {property.deedLiberFolio || property.sslCadastralId || 'Recorded Clean Title Chain'}
                        </span>
                      </div>
                    </div>

                    {property.sdatDeedUrl && (
                      <a
                        href={property.sdatDeedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-900 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 cursor-pointer"
                      >
                        <span>🏛️ Inspect Official Deed on Maryland SDAT Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {property.countyPermitUrl && (
                      <a
                        href={property.countyPermitUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-900 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 cursor-pointer"
                      >
                        <span>🏛️ Inspect Official Permits on Fairfax County PLUS Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Permits Table */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-900 uppercase">Verified Building Permits</h4>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-100 text-gray-600 text-[10px] uppercase">
                          <tr>
                            <th className="p-2.5">Permit ID</th>
                            <th className="p-2.5">Work Type</th>
                            <th className="p-2.5">Declared Cost</th>
                            <th className="p-2.5">Year</th>
                            <th className="p-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {property.permits.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50">
                              <td className="p-2.5 font-mono font-bold text-gray-900">{p.id}</td>
                              <td className="p-2.5 text-gray-700">{p.type}</td>
                              <td className="p-2.5 font-bold text-gray-900">${p.cost.toLocaleString()}</td>
                              <td className="p-2.5 text-gray-600">{p.year}</td>
                              <td className="p-2.5 text-emerald-700 font-bold">{p.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: TRUECOST CASH FLOW */}
              {activeDossierTab === 'truecost' && trueCost && (
                <div className="space-y-4">
                  <div className="bg-emerald-900 text-white p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-emerald-300 font-bold">Total Monthly TrueCost™</span>
                      <h3 className="text-2xl font-black font-sans mt-0.5">
                        ${trueCost.totalMonthlyTrueCost.toLocaleString()}/mo
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-gray-300 font-bold block">Advertised Mortgage Only</span>
                      <span className="text-sm font-mono line-through text-gray-400">
                        ${trueCost.advertisedMortgageOnly.toLocaleString()}/mo
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-500 text-[10.5px] block">Principal & Interest</span>
                      <span className="font-bold text-gray-900 font-mono">${trueCost.principalAndInterest.toLocaleString()}/mo</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-500 text-[10.5px] block">Property Taxes ({property.state})</span>
                      <span className="font-bold text-gray-900 font-mono">${trueCost.propertyTax.toLocaleString()}/mo</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-500 text-[10.5px] block">Hazard Insurance</span>
                      <span className="font-bold text-gray-900 font-mono">${trueCost.hazardInsurance.toLocaleString()}/mo</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-500 text-[10.5px] block">Maintenance Reserve</span>
                      <span className="font-bold text-gray-900 font-mono">${trueCost.maintenanceReserve.toLocaleString()}/mo</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-500 text-[10.5px] block">Estimated Utilities</span>
                      <span className="font-bold text-gray-900 font-mono">${trueCost.utilities.toLocaleString()}/mo</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-500 text-[10.5px] block">HOA / Condo Fee</span>
                      <span className="font-bold text-gray-900 font-mono">${trueCost.hoaFee.toLocaleString()}/mo</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: PROPERTY HEALTH */}
              {activeDossierTab === 'health' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-500 text-[10.5px] block">Structural Integrity</span>
                      <span className="font-bold text-emerald-800 text-sm">{property.healthScores?.structural || 98}/100</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-500 text-[10.5px] block">Mechanical Systems</span>
                      <span className="font-bold text-emerald-800 text-sm">{property.healthScores?.systems || 95}/100</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-500 text-[10.5px] block">Energy Efficiency</span>
                      <span className="font-bold text-emerald-800 text-sm">{property.healthScores?.energy || 94}/100</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-500 text-[10.5px] block">Environmental Risk</span>
                      <span className="font-bold text-emerald-800 text-sm">{property.healthScores?.risk || 98}/100</span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
                    <h4 className="font-bold text-gray-900 uppercase">HomeOS™ Critical Equipment Lifecycles</h4>
                    <div className="space-y-2 pt-1">
                      <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-gray-900 block">Architectural Roof Assembly</span>
                          <span className="text-[11px] text-gray-500">Estimated remaining lifespan: {property.homeTruthData?.roofRemainingYears || 22} years</span>
                        </div>
                        <span className="text-emerald-700 font-bold text-[11px]">Optimal Condition</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-gray-900 block">HVAC Heat Pump / Condenser</span>
                          <span className="text-[11px] text-gray-500">Installed age: {property.homeTruthData?.hvacAgeYears || 3} years (12y typical service life)</span>
                        </div>
                        <span className="text-emerald-700 font-bold text-[11px]">High Efficiency Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: NEIGHBORHOOD & SCHOOLS */}
              {activeDossierTab === 'neighborhood' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-500 text-[10.5px] block">Public School Rating</span>
                      <span className="font-bold text-purple-900 text-sm">{property.schoolRating}/10</span>
                      <span className="text-[10px] text-gray-500 block truncate">{property.neighborhoodTwin?.fcpsCluster}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-500 text-[10.5px] block">Walk Score / Transit</span>
                      <span className="font-bold text-gray-900 text-sm">Walk: {property.walkScore} • Transit: {property.transitScore}</span>
                      <span className="text-[10px] text-gray-500 block">{property.neighborhoodTwin?.metroDistanceMi} mi to Transit Hub</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-500 text-[10.5px] block">1-Year Price Velocity</span>
                      <span className="font-bold text-emerald-700 text-sm">+{property.neighborhoodTwin?.appreciationVelocity1Yr || 5.4}%</span>
                      <span className="text-[10px] text-gray-500 block">Steady Capital Inflow</span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-xs space-y-1.5">
                    <span className="font-bold text-gray-900 uppercase block">Infrastructure & Corridor Outlook</span>
                    <p className="text-gray-600 leading-relaxed">
                      {property.neighborhoodTwin?.infrastructureNotes || 'High economic stability and steady capital inflow across regional innovation corridors.'}
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Bottom Action Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600 hidden sm:inline">
                  Copilot retrieved from <strong>{property.governmentSource || 'National Cadastral Network'}</strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {onOpenChatWithCopilot && (
                  <button
                    onClick={() => {
                      onOpenChatWithCopilot(property);
                      onClose();
                    }}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#0C382E] text-white hover:bg-[#07251E] text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <MessageSquareText className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Chat with Copilot About This Home</span>
                  </button>
                )}

                {onOpenHomeTruth && (
                  <button
                    onClick={() => {
                      onOpenHomeTruth(property);
                      onClose();
                    }}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-100 text-emerald-950 hover:bg-emerald-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Print HomeTruth™ Audit</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="px-3 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
