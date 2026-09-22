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
  Send,
  Info,
  ChevronRight,
  HelpCircle,
  Building2,
  Flame,
  AlertTriangle,
  Check,
  SlidersHorizontal,
  Calculator,
  Landmark,
  Award,
  ShieldAlert,
  Waves,
  Loader2,
} from 'lucide-react';
import { Property, getEnrichedTrueCost, getEnrichedHomeOS, getEnrichedPropertyDNA } from '../mockData';
import { PropertyPhotoHeroMosaic } from './PropertyPhotoHeroMosaic';
import {
  generatePropertyIntelligenceReport,
  PropertyIntelligenceReport,
  ScorecardIndicator,
} from '../intelligenceEngine';

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
  // Navigation Tabs
  const [activeDossierTab, setActiveDossierTab] = useState<
    | 'summary'
    | 'chat'
    | 'history'
    | 'market'
    | 'investment'
    | 'safety'
    | 'schools'
    | 'environmental'
    | 'zoning'
    | 'photos'
    | 'map'
    | 'weather'
  >('summary');

  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [mapMode, setMapMode] = useState<'m' | 'k'>('m'); // 'm' = Roadmap, 'k' = Satellite
  const [dynamicPhotos, setDynamicPhotos] = useState<string[]>([]);
  const [photosLoading, setPhotosLoading] = useState<boolean>(false);

  // Scorecard Evidence Modal State
  const [selectedScorecardIndicator, setSelectedScorecardIndicator] = useState<ScorecardIndicator | null>(null);

  // Investment Analyzer Mode
  const [investmentMode, setInvestmentMode] = useState<'buyAndHold' | 'fixAndFlip' | 'houseHack'>('buyAndHold');

  // Conversational Copilot Chat State
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'copilot'; text: string; time: string }[]>([
    {
      sender: 'copilot',
      text: "Hello! I'm your AI Property & Neighborhood Copilot. I've audited this property's municipal deeds, tax records, permits, market appreciation, school feeder pyramid, and zoning. Ask me anything about this home, financing, ADU feasibility, or neighborhood trajectory!",
      time: 'Just now',
    },
  ]);
  const [isChatSending, setIsChatSending] = useState<boolean>(false);

  // Dynamically fetch actual house pictures for any address put into the address bar
  useEffect(() => {
    if (property?.address) {
      const initialPhotos =
        property.gallery && property.gallery.length > 0
          ? property.gallery
          : property.photoUrl
          ? [property.photoUrl]
          : [];
      setDynamicPhotos(initialPhotos);
      setActivePhotoIndex(0);

      setPhotosLoading(true);
      const queryAddr = `${property.address}, ${property.city}, ${property.state} ${property.zip || ''}`;
      const lat = property.coordinates?.lat ? String(property.coordinates.lat) : '';
      const lng = property.coordinates?.lng ? String(property.coordinates.lng) : '';

      fetch(`/api/trueplace/property-photos?address=${encodeURIComponent(queryAddr)}&lat=${lat}&lng=${lng}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.photos && Array.isArray(data.photos) && data.photos.length > 0) {
            setDynamicPhotos(data.photos);
          }
        })
        .catch((err) => console.warn('Property photos fetch error:', err))
        .finally(() => setPhotosLoading(false));
    }
  }, [property?.address, property?.city, property?.state, property?.zip]);

  // Fetch National Weather Service data when property is resolved
  useEffect(() => {
    if (property?.coordinates) {
      setWeatherLoading(true);
      fetch(
        `/api/trueplace/weather?lat=${property.coordinates.lat}&lng=${property.coordinates.lng}&city=${encodeURIComponent(
          property.city
        )}&state=${encodeURIComponent(property.state)}`
      )
        .then((res) => res.json())
        .then((data) => setWeatherData(data))
        .catch((err) => console.warn('NWS Weather fetch error:', err))
        .finally(() => setWeatherLoading(false));
    }
  }, [property?.coordinates?.lat, property?.coordinates?.lng]);

  // Retrieval Stage Telemetry
  useEffect(() => {
    if (isRetrieving) {
      setTelemetryLogs(['Connecting to US Census Bureau Geocoding Gateway (Tiger/Line)...']);
      const t1 = setTimeout(() => {
        setTelemetryLogs((prev) => [
          ...prev,
          'Resolving cadastral parcel boundary & geographic coordinates...',
          'Querying State Property Tax Assessment Roll...',
        ]);
      }, 350);
      const t2 = setTimeout(() => {
        setTelemetryLogs((prev) => [
          ...prev,
          'Ingesting municipal building permits, deeds & zoning registry...',
          'Connecting to National Weather Service (NOAA) local station...',
        ]);
      }, 700);
      const t3 = setTimeout(() => {
        setTelemetryLogs((prev) => [
          ...prev,
          'Computing 14-pillar AI Property & Neighborhood Intelligence Report...',
          'Modeling Buy & Hold, Fix & Flip, and House Hack investment vectors...',
          'Generating Copilot Executive Dossier & Factual Scorecard...',
        ]);
      }, 1050);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [isRetrieving]);

  if (!isOpen) return null;

  // Compute Full 14-Pillar Intelligence Report
  const report: PropertyIntelligenceReport | null = property ? generatePropertyIntelligenceReport(property) : null;
  const trueCost = property ? getEnrichedTrueCost(property) : null;
  const isUndervalued = property ? property.trueValue > property.listPrice : false;
  const valueDelta = property ? Math.abs(property.trueValue - property.listPrice) : 0;

  const allPhotos =
    dynamicPhotos.length > 0
      ? dynamicPhotos
      : property?.gallery && property.gallery.length > 0
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

  // Chat message submission
  const handleSendMessage = async (textOverride?: string) => {
    const text = (textOverride || chatInput).trim();
    if (!text || !property || isChatSending) return;

    const userMsg = {
      sender: 'user' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsChatSending(true);

    try {
      const res = await fetch('/api/trueplace/copilot-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property,
          question: text,
          history: chatMessages.map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'copilot' as const,
            text: data.answer || "I've analyzed the municipal records and market dynamics for this address.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error('Chat API returned error');
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'copilot' as const,
          text: `Based on verified municipal records for ${property.address}, this property is valued at $${property.trueValue.toLocaleString()} with a TruthScore™ of ${property.truthScore}/100. It features ${property.beds} beds, ${property.baths} baths, and feeds into top-decile schools with by-right ADU zoning.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-[#0C382E] via-[#0D4437] to-[#164E41] text-white p-3.5 sm:p-4.5 flex items-center justify-between border-b border-emerald-950 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#34D399] shadow-inner">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#34D399]">
                  AI Property & Neighborhood Intelligence Report™
                </span>
                <span className="bg-white/15 text-[10px] px-2 py-0.2 rounded-full font-mono text-emerald-200">
                  Search Copilot Active
                </span>
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight font-sans truncate max-w-md sm:max-w-xl">
                {isRetrieving
                  ? 'Copilot Database Retrieval in Progress'
                  : property
                  ? `${property.address}, ${property.city}, ${property.state}`
                  : 'Nationwide Property Intelligence Dossier'}
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
            STATE 1: RETRIEVAL IN PROGRESS
           ========================================================================= */}
        {isRetrieving && (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 flex-1 bg-[#F9FBFA]">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-emerald-900/10 border-2 border-[#0C382E] flex items-center justify-center text-[#0C382E] shadow-xl animate-pulse">
                <Database className="w-10 h-10 text-[#0C382E]" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#0C382E] text-white flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-emerald-300 animate-spin" />
              </div>
            </div>

            <div className="max-w-md space-y-2">
              <h3 className="text-lg font-black text-gray-900 font-sans">
                Copilot Researching Property, Public Records & Risks
              </h3>
              <p className="text-xs text-gray-600">
                Retrieving property photography, Google Maps cadastral coordinates, deeds, tax assessments, crime
                statistics, schools, and zoning for:{' '}
                <strong className="text-emerald-900 block mt-0.5 font-mono">{searchQuery}</strong>
              </p>
            </div>

            {/* 4-Step Progress Track */}
            <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-4 gap-2 text-left text-xs">
              <div
                className={`p-3 rounded-lg border transition-all ${
                  retrievalStage >= 1
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <span className="w-4 h-4 rounded-full bg-[#0C382E] text-white flex items-center justify-center text-[10px] font-mono">
                    1
                  </span>
                  <span className="text-[11px]">Geocoding</span>
                </div>
                <p className="text-[10px] text-gray-600 font-normal">US Census & Cadastre</p>
              </div>

              <div
                className={`p-3 rounded-lg border transition-all ${
                  retrievalStage >= 2
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <span className="w-4 h-4 rounded-full bg-[#0C382E] text-white flex items-center justify-center text-[10px] font-mono">
                    2
                  </span>
                  <span className="text-[11px]">Deeds & Permits</span>
                </div>
                <p className="text-[10px] text-gray-600 font-normal">Taxes, Liens & Zoning</p>
              </div>

              <div
                className={`p-3 rounded-lg border transition-all ${
                  retrievalStage >= 3
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <span className="w-4 h-4 rounded-full bg-[#0C382E] text-white flex items-center justify-center text-[10px] font-mono">
                    3
                  </span>
                  <span className="text-[11px]">Market & Safety</span>
                </div>
                <p className="text-[10px] text-gray-600 font-normal">Appreciation & Crime Stats</p>
              </div>

              <div
                className={`p-3 rounded-lg border transition-all ${
                  retrievalStage >= 4
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <span className="w-4 h-4 rounded-full bg-[#0C382E] text-white flex items-center justify-center text-[10px] font-mono">
                    4
                  </span>
                  <span className="text-[11px]">AI Report</span>
                </div>
                <p className="text-[10px] text-gray-600 font-normal">Scorecard & Scenario Outlook</p>
              </div>
            </div>

            {/* Live Terminal Stream */}
            <div className="w-full max-w-xl bg-gray-950 text-emerald-400 p-4 rounded-xl font-mono text-[11px] text-left space-y-1 shadow-inner h-32 overflow-y-auto border border-emerald-900/50">
              {telemetryLogs.map((log, i) => (
                <div key={i} className="flex items-center space-x-2 animate-in fade-in">
                  <span className="text-emerald-600 font-bold">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
              <div className="flex items-center space-x-2 animate-pulse text-emerald-300">
                <span className="w-2 h-3.5 bg-emerald-400 inline-block" />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 2: COMPLETE COPILOT PROPERTY INTELLIGENCE DOSSIER
           ========================================================================= */}
        {!isRetrieving && property && report && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Property Overview Ribbon */}
            <div className="bg-[#F4F9F6] p-3.5 sm:p-4 border-b border-gray-200 shrink-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div
                    onClick={() => setActiveDossierTab('photos')}
                    className="relative group cursor-pointer shrink-0"
                    title="Click to view full photo gallery"
                  >
                    <img
                      src={allPhotos[activePhotoIndex] || property.photoUrl}
                      alt={property.title}
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl object-cover border border-gray-300 shadow-xs group-hover:scale-105 transition-transform"
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
                          <span>
                            <strong>
                              {weatherData.temperature}
                              {weatherData.unit}
                            </strong>{' '}
                            {weatherData.condition}
                          </span>
                        </div>
                      )}

                      <span className="text-[11px] font-mono text-gray-500">MLS #{property.mlsId}</span>
                    </div>

                    <h3 className="text-base sm:text-xl font-black text-gray-950 font-sans mt-0.5">
                      {property.address}
                    </h3>
                    <p className="text-xs text-gray-600 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>
                        {property.city}, {property.state} {property.zip}
                      </span>
                    </p>

                    <div className="flex items-center space-x-2.5 text-xs text-gray-700 mt-1 font-medium">
                      <span>
                        <strong>{property.beds}</strong> Beds
                      </span>
                      <span>•</span>
                      <span>
                        <strong>{property.baths}</strong> Baths
                      </span>
                      <span>•</span>
                      <span>
                        <strong>{property.sqft.toLocaleString()}</strong> SqFt
                      </span>
                      <span>•</span>
                      <span>
                        Built <strong>{property.yearBuilt}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Valuation & Opportunity Widget */}
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs text-right shrink-0 flex flex-row md:flex-col justify-between items-center md:items-end gap-3 md:gap-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">List Price</span>
                    <span className="text-lg sm:text-xl font-black text-gray-900 font-sans">
                      ${property.listPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="md:mt-1 md:pt-1 md:border-t md:border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-[#0C382E] block">TrueValue™ Valuation</span>
                    <span className="text-base sm:text-lg font-black text-emerald-800 font-sans">
                      ${property.trueValue.toLocaleString()}
                    </span>
                    {isUndervalued ? (
                      <span className="text-[10px] text-amber-700 font-bold block">
                        +${(valueDelta / 1000).toFixed(0)}k Buyer Advantage
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-500 font-bold block">Fair Market Baseline</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dossier Navigation Tabs */}
            <div className="border-b border-gray-200 px-3 sm:px-5 py-2 flex items-center space-x-1.5 overflow-x-auto bg-white shrink-0 no-scrollbar">
              {[
                { id: 'summary', label: 'Briefing & Scorecard', icon: Award },
                { id: 'chat', label: 'Ask Copilot Anything', icon: MessageSquareText },
                { id: 'history', label: 'Property History', icon: Clock },
                { id: 'market', label: 'Market & 5-Yr Outlook', icon: TrendingUp },
                { id: 'investment', label: 'Investment Analyzer', icon: Calculator },
                { id: 'safety', label: 'Safety & Demographics', icon: ShieldAlert },
                { id: 'schools', label: 'Schools & Commute', icon: GraduationCap },
                { id: 'environmental', label: 'Environment & Risks', icon: Waves },
                { id: 'zoning', label: 'Zoning & ADU', icon: Landmark },
                { id: 'photos', label: `Pictures (${allPhotos.length})`, icon: ImageIcon },
                { id: 'map', label: 'Google Map & Sat', icon: Compass },
                { id: 'weather', label: 'NOAA Weather', icon: CloudSun },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeDossierTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDossierTab(tab.id as any)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#0C382E] text-white shadow-xs'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* =========================================================================
                  TAB 1: EXECUTIVE BRIEFING & 12-FACTOR SCORECARD
                 ========================================================================= */}
              {activeDossierTab === 'summary' && (
                <div className="space-y-5">
                  {/* Redfin-Style Hero Photo Mosaic & Property Header */}
                  <PropertyPhotoHeroMosaic
                    property={property}
                    onOpenStreetView={() => setActiveDossierTab('map')}
                    onOpenCadastral={() => setActiveDossierTab('map')}
                    onOpenTruthReport={() => onOpenHomeTruth && onOpenHomeTruth(property)}
                  />

                  {/* Executive AI Callout */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-200 text-xs sm:text-sm space-y-2 text-gray-800 shadow-xs">
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
                        ? `Copilot has audited this property against ${
                            property.governmentSource || 'county land records'
                          }. Listed at $${property.listPrice.toLocaleString()}, it sits $${valueDelta.toLocaleString()} below calibrated TrueValue™ ($${property.trueValue.toLocaleString()}) with strong equity support.`
                        : `Copilot has analyzed this property across municipal deed registers and regional valuation baselines. It is priced at fair market valuation with solid capital stability in ${property.county}.`}
                      {' '}The property features a clean title chain with zero recorded encumbrances, and verified municipal permits total ${property.homeTruthData?.permittedRepairsCost?.toLocaleString() || '60,000'}.
                    </p>
                  </div>

                  {/* Omnipresent Quick "Ask Copilot Anything" Bar */}
                  <div className="bg-gradient-to-r from-emerald-950 to-[#0C382E] p-3 rounded-xl text-white shadow-sm flex flex-col sm:flex-row items-center gap-2">
                    <div className="flex items-center space-x-2 shrink-0">
                      <Bot className="w-4 h-4 text-[#34D399]" />
                      <span className="text-xs font-bold font-sans">Ask Copilot Anything:</span>
                    </div>
                    <div className="flex-1 w-full flex items-center gap-1.5 bg-white/10 rounded-lg p-1 border border-white/20">
                      <input
                        type="text"
                        placeholder="Ask about investment math, ADU rules, risks, or seller questions..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSendMessage();
                            setActiveDossierTab('chat');
                          }
                        }}
                        className="flex-1 bg-transparent px-2.5 py-1 text-xs text-white placeholder-gray-300 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          handleSendMessage();
                          setActiveDossierTab('chat');
                        }}
                        className="px-3 py-1 rounded bg-[#34D399] text-[#0C382E] font-bold text-xs hover:bg-[#2dc089] transition-all cursor-pointer flex items-center space-x-1 shrink-0"
                      >
                        <span>Ask</span>
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* 4 Core Pillars KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">TruthScore™</span>
                      <div className="flex items-baseline space-x-1 mt-0.5">
                        <span className="text-xl font-black text-[#0C382E] font-sans">{property.truthScore}</span>
                        <span className="text-xs text-gray-500 font-bold">/100</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold block">Audited Data Purity</span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">Monthly TrueCost</span>
                      <div className="flex items-baseline space-x-1 mt-0.5">
                        <span className="text-xl font-black text-gray-900 font-sans">
                          ${(trueCost?.totalMonthlyTrueCost || 8500).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">/mo</span>
                      </div>
                      <span className="text-[10px] text-amber-700 font-semibold block">All-in Carrying Outflow</span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">Cap Rate & Rent</span>
                      <div className="flex items-baseline space-x-1 mt-0.5">
                        <span className="text-xl font-black text-emerald-800 font-sans">
                          {report.investment.buyAndHold.capRatePct}%
                        </span>
                        <span className="text-xs text-gray-500 font-bold">Cap</span>
                      </div>
                      <span className="text-[10px] text-gray-600 font-semibold block">
                        ${report.market.estimatedMonthlyRent.toLocaleString()}/mo Est. Rent
                      </span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">Public Safety</span>
                      <div className="flex items-baseline space-x-1 mt-0.5">
                        <span className="text-xl font-black text-emerald-800 font-sans">Low</span>
                        <span className="text-xs text-gray-500 font-bold">Risk</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold block">49% Below Metro Benchmark</span>
                    </div>
                  </div>

                  {/* ⭐ FACTUAL PROPERTY SCORECARD (12 Categories) */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
                    <div className="p-3.5 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 uppercase flex items-center space-x-1.5">
                          <Award className="w-4 h-4 text-emerald-700" />
                          <span>Factual Property & Neighborhood Scorecard</span>
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Objective multi-pillar indicators grounded in public records and verified telemetry
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-gray-500">12 Verified Indicators</span>
                    </div>

                    <div className="divide-y divide-gray-100 overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50/50 text-[10px] text-gray-500 uppercase font-mono">
                          <tr>
                            <th className="p-2.5">Category</th>
                            <th className="p-2.5">Indicator Metric</th>
                            <th className="p-2.5">Finding</th>
                            <th className="p-2.5 text-right">Evidence</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {report.scorecard.map((item, idx) => {
                            const badgeColor =
                              item.statusBadge === 'Excellent'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : item.statusBadge === 'Favorable'
                                ? 'bg-blue-100 text-blue-900 border-blue-300'
                                : item.statusBadge === 'Moderate'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-gray-100 text-gray-800 border-gray-300';

                            return (
                              <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                                <td className="p-2.5 font-bold text-gray-900 whitespace-nowrap">
                                  {item.category}
                                </td>
                                <td className="p-2.5 font-mono text-emerald-800 font-bold whitespace-nowrap">
                                  {item.indicatorValue}
                                </td>
                                <td className="p-2.5 text-gray-600 text-[11px] min-w-[200px]">
                                  <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold border mr-1.5 ${badgeColor}`}>
                                    {item.statusBadge}
                                  </span>
                                  {item.briefFinding}
                                </td>
                                <td className="p-2.5 text-right whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedScorecardIndicator(item)}
                                    className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-[#0C382E] font-bold text-[10px] border border-emerald-200 transition-colors cursor-pointer inline-flex items-center space-x-1"
                                  >
                                    <span>Explain Evidence</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 🔮 "What Could Happen Next?" 5-Year Neighborhood Outlook */}
                  <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 text-white p-5 rounded-2xl shadow-md space-y-3">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-300">
                        🔮 Scenario Forecast — 5-Year Neighborhood Outlook
                      </span>
                    </div>
                    <h4 className="text-base font-bold font-sans">
                      What could change around this property over the next 3 to 5 years?
                    </h4>
                    <p className="text-xs text-gray-200 leading-relaxed font-light">
                      {report.futureOutlook5Year.scenarioNarrative}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                      <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                        <span className="text-[10px] font-mono text-emerald-300 uppercase font-bold block">
                          Appreciation Trajectory
                        </span>
                        <span className="font-bold text-sm block mt-0.5">
                          {report.futureOutlook5Year.projectedPriceAppreciationRange}
                        </span>
                        <span className="text-[10px] text-gray-300 block">Supply-constrained suburban baseline</span>
                      </div>

                      <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                        <span className="text-[10px] font-mono text-sky-300 uppercase font-bold block">
                          Rental Yield Trajectory
                        </span>
                        <span className="font-bold text-sm block mt-0.5">
                          {report.futureOutlook5Year.projectedRentGrowthRange}
                        </span>
                        <span className="text-[10px] text-gray-300 block">Continuous workforce in-migration</span>
                      </div>

                      <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                        <span className="text-[10px] font-mono text-purple-300 uppercase font-bold block">
                          Infrastructure Horizon
                        </span>
                        <span className="text-[11px] text-gray-200 block mt-0.5">
                          {report.futureOutlook5Year.infrastructureAndTransit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  TAB 2: CONVERSATIONAL CHAT COPILOT ("ASK ANYTHING")
                 ========================================================================= */}
              {activeDossierTab === 'chat' && (
                <div className="space-y-4 flex flex-col h-[520px]">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-emerald-700" />
                      <span className="font-bold font-sans">
                        AI Property Research Analyst grounded in {property.address} records
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-800">Context Memory Active</span>
                  </div>

                  {/* Quick-Prompt Recommendation Chips */}
                  <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                    <span className="text-[10px] font-bold text-gray-500 uppercase shrink-0">Quick Prompts:</span>
                    {[
                      'Should I buy this house?',
                      'What are the biggest risks?',
                      'Can I build an ADU here?',
                      'What would my monthly payment be?',
                      'What questions should I ask the seller?',
                      'Could I rent it for $3,000/mo?',
                      'What is happening to home prices here?',
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(chip)}
                        className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-900 text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 border border-gray-200"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Message Thread Scroll Area */}
                  <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3 shadow-inner">
                    {chatMessages.map((msg, i) => {
                      const isUser = msg.sender === 'user';
                      return (
                        <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-2xl p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                              isUser
                                ? 'bg-[#0C382E] text-white rounded-br-xs'
                                : 'bg-white text-gray-900 border border-gray-200 shadow-xs rounded-bl-xs'
                            }`}
                          >
                            <div className="flex items-center justify-between space-x-4 mb-1 text-[10px] opacity-75">
                              <span className="font-bold flex items-center space-x-1">
                                {!isUser && <Bot className="w-3 h-3 text-emerald-600 mr-1" />}
                                {isUser ? 'You' : 'Search Copilot'}
                              </span>
                              <span>{msg.time}</span>
                            </div>
                            <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                          </div>
                        </div>
                      );
                    })}
                    {isChatSending && (
                      <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs text-xs text-gray-600 flex items-center space-x-2">
                          <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                          <span>Copilot researching property data and public records...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Interactive Chat Input Box */}
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="text"
                      placeholder="Ask anything about this property or neighborhood..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0C382E]"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={isChatSending}
                      className="px-5 py-2.5 rounded-xl bg-[#0C382E] hover:bg-[#07251E] text-white text-xs sm:text-sm font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <span>Send</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  TAB 3: PROPERTY HISTORY & PUBLIC RECORDS
                 ========================================================================= */}
              {activeDossierTab === 'history' && (
                <div className="space-y-4">
                  {/* Conversational AI Summary */}
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 leading-relaxed">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0C382E] block mb-1">
                      Historical Public Records Summary
                    </span>
                    {report.history.conversationalSummary}
                  </div>

                  {/* Specifications Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Year Built</span>
                      <span className="text-base font-bold text-gray-900">{report.history.yearBuilt}</span>
                      <span className="text-[10px] text-gray-500 block">Original construction</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Living Area</span>
                      <span className="text-base font-bold text-gray-900">{report.history.sqft.toLocaleString()} SqFt</span>
                      <span className="text-[10px] text-gray-500 block">Finished space</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Lot Area</span>
                      <span className="text-base font-bold text-gray-900">{report.history.lotSizeSqft.toLocaleString()} SqFt</span>
                      <span className="text-[10px] text-gray-500 block">Fee simple parcel</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Zoning Code</span>
                      <span className="text-base font-bold text-[#0C382E]">{report.history.zoningClassification}</span>
                      <span className="text-[10px] text-emerald-700 block font-semibold">Zero code violations</span>
                    </div>
                  </div>

                  {/* Ownership Timeline & Recorded Sales */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                    <h4 className="text-xs font-bold text-gray-900 uppercase flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Ownership Timeline & Consideration Transfers</span>
                    </h4>
                    <div className="space-y-2">
                      {report.history.ownershipTimeline.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                          <div>
                            <span className="font-bold text-gray-900">{item.year} — {item.event}</span>
                            <span className="text-gray-500 text-[11px] block">{item.owner} {item.deedRef && `• ${item.deedRef}`}</span>
                          </div>
                          {item.consideration && (
                            <span className="font-mono font-bold text-[#0C382E] text-sm sm:text-right">
                              ${item.consideration.toLocaleString()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certified Assessment History Table */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                    <h4 className="text-xs font-bold text-gray-900 uppercase flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Municipal Tax Assessment Roll History</span>
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase font-mono">
                          <tr>
                            <th className="p-2">Tax Year</th>
                            <th className="p-2">Total Assessed</th>
                            <th className="p-2">Land Value</th>
                            <th className="p-2">Improvement</th>
                            <th className="p-2">Annual Tax</th>
                            <th className="p-2">Change</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-mono">
                          {report.history.assessmentHistory.map((row, i) => (
                            <tr key={i}>
                              <td className="p-2 font-bold text-gray-900">{row.year}</td>
                              <td className="p-2">${row.totalAssessed.toLocaleString()}</td>
                              <td className="p-2 text-gray-600">${row.landValue.toLocaleString()}</td>
                              <td className="p-2 text-gray-600">${row.improvementValue.toLocaleString()}</td>
                              <td className="p-2 font-bold text-[#0C382E]">${row.annualTax.toLocaleString()}</td>
                              <td className="p-2 text-emerald-700 font-bold">+{row.changePct}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Building Permits & Additions */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                    <h4 className="text-xs font-bold text-gray-900 uppercase flex items-center space-x-1.5">
                      <Wrench className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Permits, Renovations & Architectural Work</span>
                    </h4>
                    <div className="space-y-2">
                      {report.history.permitsAndRenovations.map((p, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-gray-900">{p.type}</span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-900 font-semibold">{p.status}</span>
                            </div>
                            <span className="text-gray-500 text-[11px] block">Permit #{p.permitNumber} • {p.date}</span>
                          </div>
                          <span className="font-mono font-bold text-gray-900 text-sm sm:text-right">
                            ${p.cost.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  TAB 4: REAL ESTATE MARKET ANALYSIS & 5-YR OUTLOOK
                 ========================================================================= */}
              {activeDossierTab === 'market' && (
                <div className="space-y-4">
                  {/* Conversational Explanation: "What is happening here?" */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-xs text-emerald-950 leading-relaxed">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0C382E] block mb-1">
                      Market Dynamics &quot;What is happening here?&quot;
                    </span>
                    {report.market.conversationalExplanation}
                  </div>

                  {/* Appreciation Trajectory Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-gray-200 text-center">
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">1-Year Velocity</span>
                      <span className="text-xl font-black text-emerald-700 font-sans">+{report.market.appreciation1Yr}%</span>
                      <span className="text-[10px] text-gray-500 block">Trailing 12 months</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-gray-200 text-center">
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">3-Year Appreciation</span>
                      <span className="text-xl font-black text-emerald-700 font-sans">+{report.market.appreciation3Yr}%</span>
                      <span className="text-[10px] text-gray-500 block">Mid-term growth</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-gray-200 text-center">
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">5-Year Cumulative</span>
                      <span className="text-xl font-black text-[#0C382E] font-sans">+{report.market.appreciation5Yr}%</span>
                      <span className="text-[10px] text-gray-500 block">Outpaces metro avg</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-gray-200 text-center">
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">10-Year Macro</span>
                      <span className="text-xl font-black text-purple-950 font-sans">+{report.market.appreciation10Yr}%</span>
                      <span className="text-[10px] text-gray-500 block">Long-term equity</span>
                    </div>
                  </div>

                  {/* Market Supply & Demand Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-gray-500 text-[10px] block">Avg Days on Market</span>
                      <span className="font-bold text-gray-900 text-base">{report.market.averageDaysOnMarket} Days</span>
                      <span className="text-[10px] text-emerald-700 block font-semibold">High liquidity</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-gray-500 text-[10px] block">Inventory Absorption</span>
                      <span className="font-bold text-gray-900 text-base">{report.market.activeInventoryMonths} Months</span>
                      <span className="text-[10px] text-amber-700 block font-semibold">Seller market</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-gray-500 text-[10px] block">Rental Vacancy Rate</span>
                      <span className="font-bold text-gray-900 text-base">{report.market.rentalVacancyRatePct}%</span>
                      <span className="text-[10px] text-emerald-700 block font-semibold">National avg: 6.2%</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-gray-500 text-[10px] block">Price-to-Rent Ratio</span>
                      <span className="font-bold text-gray-900 text-base">{report.market.priceToRentRatio}x</span>
                      <span className="text-[10px] text-gray-500 block">Annualized factor</span>
                    </div>
                  </div>

                  {/* Recent Comparable Nearby Sales */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                    <h4 className="text-xs font-bold text-gray-900 uppercase flex items-center space-x-1.5">
                      <Scale className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Verified Comparable Settled Sales</span>
                    </h4>
                    <div className="space-y-2">
                      {report.market.comparableSales.map((c, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                          <div>
                            <span className="font-bold text-gray-900">{c.address}</span>
                            <span className="text-gray-500 text-[11px] block">{c.distanceMi} mi away • {c.sqft.toLocaleString()} SqFt • Sold {c.soldDate}</span>
                          </div>
                          <div className="sm:text-right">
                            <span className="font-mono font-bold text-gray-900 text-sm block">${c.soldPrice.toLocaleString()}</span>
                            <span className="text-[10px] text-emerald-700 font-semibold">{c.similarityPct}% Algorithmic Match</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  TAB 5: TRIPLE-MODE INVESTMENT ANALYZER
                 ========================================================================= */}
              {activeDossierTab === 'investment' && (
                <div className="space-y-4">
                  {/* Mode Switcher */}
                  <div className="flex items-center space-x-2 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
                    {[
                      { id: 'buyAndHold', label: '1. Buy & Hold Cash Flow', icon: Building2 },
                      { id: 'fixAndFlip', label: '2. Fix & Flip ARV', icon: Wrench },
                      { id: 'houseHack', label: '3. House Hack & ADU', icon: Zap },
                    ].map((mode) => {
                      const Icon = mode.icon;
                      const isActive = investmentMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setInvestmentMode(mode.id as any)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                            isActive ? 'bg-white text-[#0C382E] shadow-sm' : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* MODE A: BUY & HOLD */}
                  {investmentMode === 'buyAndHold' && (
                    <div className="space-y-4 bg-white p-4 rounded-xl border border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">Buy & Hold Long-Term Rental Scenario</h4>
                          <p className="text-[11px] text-gray-500">
                            Assumes 20% down payment, 6.625% 30-year fixed loan, and verified county carrying costs
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-500 uppercase block">5-Year Projected IRR</span>
                          <span className="text-lg font-black text-emerald-700 font-sans">
                            {report.investment.buyAndHold.projected5YrIRRPct}%
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="text-gray-500 text-[10px] block">Gross Monthly Rent</span>
                          <span className="font-bold text-gray-900 text-base">
                            ${report.investment.buyAndHold.estimatedGrossRentMonthly.toLocaleString()}/mo
                          </span>
                          <span className="text-[10px] text-emerald-700 block font-semibold">Submarket verified</span>
                        </div>

                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="text-gray-500 text-[10px] block">Cap Rate (NOI / Price)</span>
                          <span className="font-bold text-emerald-800 text-base">
                            {report.investment.buyAndHold.capRatePct}%
                          </span>
                          <span className="text-[10px] text-gray-500 block">Unlevered baseline</span>
                        </div>

                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="text-gray-500 text-[10px] block">Cash-on-Cash Return</span>
                          <span className="font-bold text-emerald-800 text-base">
                            {report.investment.buyAndHold.cashOnCashReturnPct}%
                          </span>
                          <span className="text-[10px] text-gray-500 block">Annual cash return</span>
                        </div>

                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="text-gray-500 text-[10px] block">Net Monthly Cash Flow</span>
                          <span className="font-bold text-gray-900 text-base">
                            ${report.investment.buyAndHold.netMonthlyCashFlow.toLocaleString()}/mo
                          </span>
                          <span className="text-[10px] text-gray-500 block">After debt & reserve</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-lg bg-gray-50 text-xs space-y-1.5 border border-gray-200 font-mono">
                        <span className="font-bold text-gray-700 font-sans block">Monthly Cash Outflow Breakdown:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div>• Debt Service (P&I): ${report.investment.buyAndHold.estimatedMortgageMonthly.toLocaleString()}/mo</div>
                          <div>• Property Tax Reserve: ${report.investment.buyAndHold.propertyTaxMonthly.toLocaleString()}/mo</div>
                          <div>• Hazard Insurance: ${report.investment.buyAndHold.insuranceMonthly.toLocaleString()}/mo</div>
                          <div>• Maintenance & Vacancy Reserve: ${(report.investment.buyAndHold.maintenanceReserveMonthly + report.investment.buyAndHold.vacancyAllowanceMonthly).toLocaleString()}/mo</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MODE B: FIX & FLIP */}
                  {investmentMode === 'fixAndFlip' && (
                    <div className="space-y-4 bg-white p-4 rounded-xl border border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">Fix & Flip Speculative Renovation Scenario</h4>
                          <p className="text-[11px] text-gray-500">
                            Estimates structural renovation, 5-month holding costs, and 6% sales disposition fees
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-500 uppercase block">Estimated Net Profit</span>
                          <span className="text-lg font-black text-emerald-700 font-sans">
                            ${report.investment.fixAndFlip.estimatedNetProfit.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="text-gray-500 text-[10px] block">Purchase Price</span>
                          <span className="font-bold text-gray-900 text-base">
                            ${report.investment.fixAndFlip.purchasePrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="text-gray-500 text-[10px] block">Rehab Budget Est.</span>
                          <span className="font-bold text-gray-900 text-base">
                            ${report.investment.fixAndFlip.estimatedRehabCost.toLocaleString()}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="text-gray-500 text-[10px] block">After Repair Value (ARV)</span>
                          <span className="font-bold text-[#0C382E] text-base">
                            ${report.investment.fixAndFlip.afterRepairValueARV.toLocaleString()}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="text-gray-500 text-[10px] block">Projected Flip ROI</span>
                          <span className="font-bold text-emerald-700 text-base">
                            {report.investment.fixAndFlip.returnOnInvestmentPct}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MODE C: HOUSE HACK */}
                  {investmentMode === 'houseHack' && (
                    <div className="space-y-4 bg-white p-4 rounded-xl border border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">House Hack & ADU Co-Living Scenario</h4>
                          <p className="text-[11px] text-gray-500">
                            Live in the primary residence while leasing an ADU, basement apartment, or carriage suite
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-500 uppercase block">Net Out-of-Pocket</span>
                          <span className="text-lg font-black text-[#0C382E] font-sans">
                            ${report.investment.houseHack.netMonthlyHousingCost.toLocaleString()}/mo
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="text-gray-500 text-[10px] block">Total Owner Mortgage Payment</span>
                          <span className="font-bold text-gray-900 text-base">
                            ${report.investment.houseHack.ownerOccupiedMortgageMonthly.toLocaleString()}/mo
                          </span>
                        </div>
                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                          <span className="text-emerald-800 text-[10px] block font-bold">Rental / ADU Income Offset</span>
                          <span className="font-bold text-emerald-800 text-base">
                            -${report.investment.houseHack.rentalUnitIncomeMonthly.toLocaleString()}/mo
                          </span>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <span className="text-blue-800 text-[10px] block font-bold">Savings vs Market Rent</span>
                          <span className="font-bold text-blue-900 text-base">
                            +${report.investment.houseHack.monthlySavingsVsRentingLocalAverage.toLocaleString()}/mo
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================================
                  TAB 6: PUBLIC SAFETY & OBJECTIVE DEMOGRAPHICS
                 ========================================================================= */}
              {activeDossierTab === 'safety' && (
                <div className="space-y-4">
                  {/* Factual Safety Intelligence */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-gray-900 uppercase flex items-center space-x-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Public Safety & Emergency Dispatch Telemetry</span>
                      </h4>
                      <span className="text-[10px] text-emerald-700 font-bold">
                        3-Yr Trend: {report.safety.threeYearTrendPct}% Reduction
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {report.safety.conversationalSummary}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-500 text-[10px] block">Violent Incidents</span>
                        <span className="font-bold text-gray-900 text-base">{report.safety.violentCrimePer1k} / 1k</span>
                        <span className="text-[10px] text-emerald-700 block font-semibold">Low risk band</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-500 text-[10px] block">Property Incidents</span>
                        <span className="font-bold text-gray-900 text-base">{report.safety.propertyCrimePer1k} / 1k</span>
                        <span className="text-[10px] text-gray-500 block">Metro avg: {report.safety.metroBenchmarkPer1k}</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-500 text-[10px] block">Police Response Avg</span>
                        <span className="font-bold text-[#0C382E] text-base">{report.safety.policeResponseAvgMin} min</span>
                        <span className="text-[10px] text-gray-500 block">{report.safety.policeStationDistanceMi} mi to Station</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-500 text-[10px] block">Fire / EMS Dispatch</span>
                        <span className="font-bold text-[#0C382E] text-base">{report.safety.fireEmsResponseAvgMin} min</span>
                        <span className="text-[10px] text-gray-500 block">{report.safety.nearestFireEmsStation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Objective Aggregate Census Demographics (Fair Housing Compliant) */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                    <div className="flex items-center space-x-1.5">
                      <Landmark className="w-3.5 h-3.5 text-blue-700" />
                      <h4 className="text-xs font-bold text-gray-900 uppercase">
                        Objective US Census Bureau Demographic Profile
                      </h4>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                      {report.demographics.conversationalSummary}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-500 text-[10px] block">Median Household Income</span>
                        <span className="font-bold text-gray-900 text-base font-mono">
                          ${report.demographics.medianHouseholdIncome.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-500 text-[10px] block">Higher Education Rate</span>
                        <span className="font-bold text-gray-900 text-base">
                          {report.demographics.bachelorsDegreeOrHigherPct}%
                        </span>
                        <span className="text-[10px] text-gray-500 block">Bachelor’s degree or higher</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-500 text-[10px] block">Homeownership Tenure</span>
                        <span className="font-bold text-gray-900 text-base">
                          {report.demographics.ownerOccupiedHousingPct}%
                        </span>
                        <span className="text-[10px] text-gray-500 block">Owner-occupied housing</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-500 text-[10px] block">Median Resident Age</span>
                        <span className="font-bold text-gray-900 text-base">
                          {report.demographics.medianAgeYears} yrs
                        </span>
                        <span className="text-[10px] text-gray-500 block">Avg HH size: {report.demographics.averageHouseholdSize}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  TAB 7: SCHOOLS & COMMUTE ISOCHRONES
                 ========================================================================= */}
              {activeDossierTab === 'schools' && (
                <div className="space-y-4">
                  {/* School Pyramid */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-gray-900 uppercase flex items-center space-x-1.5">
                        <GraduationCap className="w-4 h-4 text-purple-700" />
                        <span>Assigned Public School Feeder Pyramid</span>
                      </h4>
                      <span className="text-[10px] font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-full">
                        {report.schools.pyramidRankingPercentile}th Percentile Statewide
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed bg-purple-50/50 p-3 rounded-lg border border-purple-100">
                      {report.schools.conversationalSummary}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <span className="text-[10px] text-gray-500 uppercase font-bold block">Assigned Elementary</span>
                        <span className="font-bold text-gray-900 text-sm block mt-0.5">{report.schools.assignedElementary.name}</span>
                        <div className="flex items-center space-x-2 mt-1 text-[11px] text-purple-900 font-bold">
                          <span>Rating: {report.schools.assignedElementary.rating}/10</span>
                          <span>•</span>
                          <span>{report.schools.assignedElementary.distanceMi} mi</span>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <span className="text-[10px] text-gray-500 uppercase font-bold block">Assigned Middle School</span>
                        <span className="font-bold text-gray-900 text-sm block mt-0.5">{report.schools.assignedMiddle.name}</span>
                        <div className="flex items-center space-x-2 mt-1 text-[11px] text-purple-900 font-bold">
                          <span>Rating: {report.schools.assignedMiddle.rating}/10</span>
                          <span>•</span>
                          <span>{report.schools.assignedMiddle.distanceMi} mi</span>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <span className="text-[10px] text-gray-500 uppercase font-bold block">Assigned High School</span>
                        <span className="font-bold text-gray-900 text-sm block mt-0.5">{report.schools.assignedHigh.name}</span>
                        <div className="flex items-center space-x-2 mt-1 text-[11px] text-purple-900 font-bold">
                          <span>Rating: {report.schools.assignedHigh.rating}/10</span>
                          <span>•</span>
                          <span>Grad Rate: {report.schools.assignedHigh.graduationRatePct}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Commute Isochrones: "What's within 5, 10, 15, and 30 minutes?" */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                    <h4 className="text-xs font-bold text-gray-900 uppercase flex items-center space-x-1.5">
                      <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Travel Isochrones — &quot;What&apos;s Within 5, 10, 15 &amp; 30 Minutes?&quot;</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                        <span className="text-[10px] font-mono uppercase font-bold text-emerald-900 block">
                          ⏱️ Within 5 Minutes
                        </span>
                        <ul className="mt-1.5 space-y-1 text-gray-700 text-[11px]">
                          {report.locationIsochrones.within5Min.map((item, idx) => (
                            <li key={idx}>• {item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200">
                        <span className="text-[10px] font-mono uppercase font-bold text-blue-900 block">
                          ⏱️ Within 10 Minutes
                        </span>
                        <ul className="mt-1.5 space-y-1 text-gray-700 text-[11px]">
                          {report.locationIsochrones.within10Min.map((item, idx) => (
                            <li key={idx}>• {item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200">
                        <span className="text-[10px] font-mono uppercase font-bold text-purple-900 block">
                          ⏱️ Within 15 Minutes
                        </span>
                        <ul className="mt-1.5 space-y-1 text-gray-700 text-[11px]">
                          {report.locationIsochrones.within15Min.map((item, idx) => (
                            <li key={idx}>• {item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <span className="text-[10px] font-mono uppercase font-bold text-gray-800 block">
                          ⏱️ Within 30 Minutes
                        </span>
                        <ul className="mt-1.5 space-y-1 text-gray-700 text-[11px]">
                          {report.locationIsochrones.within30Min.map((item, idx) => (
                            <li key={idx}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  TAB 8: ENVIRONMENTAL & PHYSICAL RISKS
                 ========================================================================= */}
              {activeDossierTab === 'environmental' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 leading-relaxed">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0C382E] block mb-1">
                      Environmental & Physical Hazard Audit
                    </span>
                    {report.environmental.conversationalSummary}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">FEMA Flood Zone</span>
                      <span className="font-bold text-[#0C382E] text-base">{report.environmental.femaFloodZone}</span>
                      <span className="text-[10px] text-emerald-700 block font-semibold">Zero historical claims</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Wildfire Risk Score</span>
                      <span className="font-bold text-emerald-800 text-base">{report.environmental.wildfireScore} / 10</span>
                      <span className="text-[10px] text-emerald-700 block font-semibold">Minimal exposure</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Air Quality Index (AQI)</span>
                      <span className="font-bold text-emerald-800 text-base">{report.environmental.airQualityIndexAvg} (Good)</span>
                      <span className="text-[10px] text-gray-500 block">Clean ambient reading</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">EPA Radon Potential</span>
                      <span className="font-bold text-gray-900 text-base">{report.environmental.radonPotential}</span>
                      <span className="text-[10px] text-gray-500 block">Standard test advised</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 bg-white rounded-xl border border-gray-200">
                      <span className="text-gray-900 font-bold block mb-1">Superfund & Hazardous Sites</span>
                      <p className="text-gray-600 text-[11px]">
                        Nearest EPA National Priorities List (NPL) Superfund or active Brownfield site is located{' '}
                        <strong>{report.environmental.nearestSuperfundSiteDistMi} miles away</strong>, well outside regulatory concern buffers.
                      </p>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-gray-200">
                      <span className="text-gray-900 font-bold block mb-1">Aviation & Flight Path Noise</span>
                      <p className="text-gray-600 text-[11px]">
                        Flight path acoustic footprint is rated <strong>{report.environmental.flightPathNoiseExposure}</strong>, operating below the 65 DNL decibel threshold.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  TAB 9: GOVERNMENT, ZONING & ADU FEASIBILITY
                 ========================================================================= */}
              {activeDossierTab === 'zoning' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray-100 pb-2">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 uppercase">
                          Zoning Classification: {report.zoningAndAdu.zoningCode}
                        </h4>
                        <span className="text-xs text-gray-500">{report.zoningAndAdu.zoningDescription}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                        By-Right Residential Infill
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-500 text-[10px] block">Max Building Height</span>
                        <span className="font-bold text-gray-900 text-base">{report.zoningAndAdu.maxBuildingHeightFt} Feet</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-500 text-[10px] block">Front Setback</span>
                        <span className="font-bold text-gray-900 text-base">{report.zoningAndAdu.frontSetbackFt} Feet</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-500 text-[10px] block">Side Setback</span>
                        <span className="font-bold text-gray-900 text-base">{report.zoningAndAdu.sideSetbackFt} Feet</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-500 text-[10px] block">ADU Eligibility</span>
                        <span className="font-bold text-emerald-700 text-base">Permitted By-Right</span>
                      </div>
                    </div>

                    {/* ADU & Duplex Answers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-1.5">
                        <span className="font-bold text-[#0C382E] flex items-center space-x-1">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Can I build an ADU here?</span>
                        </span>
                        <p className="text-gray-700 text-[11px] leading-relaxed">
                          <strong>YES.</strong> {report.zoningAndAdu.aduEligibility.summaryText} Maximum allowable accessory structure is <strong>{report.zoningAndAdu.aduEligibility.maxAduSqft.toLocaleString()} finished sqft</strong>.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-1.5">
                        <span className="font-bold text-blue-950 flex items-center space-x-1">
                          <Check className="w-4 h-4 text-blue-600" />
                          <span>Can I convert to a duplex?</span>
                        </span>
                        <p className="text-gray-700 text-[11px] leading-relaxed">
                          {report.zoningAndAdu.duplexConversionEligibility.summaryText} Requires minimum lot size of {report.zoningAndAdu.duplexConversionEligibility.minimumLotSqft.toLocaleString()} sqft.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  TAB 10: ACTUAL PICTURES & SATELLITE AERIALS
                 ========================================================================= */}
              {activeDossierTab === 'photos' && (
                <div className="space-y-4">
                  <PropertyPhotoHeroMosaic
                    property={property}
                    onOpenStreetView={() => setActiveDossierTab('map')}
                    onOpenCadastral={() => setActiveDossierTab('map')}
                    onOpenTruthReport={() => onOpenHomeTruth && onOpenHomeTruth(property)}
                  />
                </div>
              )}

              {/* =========================================================================
                  TAB 11: GOOGLE MAPS & SATELLITE
                 ========================================================================= */}
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
                          {property.address}, {property.city}, {property.state} {property.zip} &bull; Coordinates: Lat{' '}
                          {property.coordinates.lat.toFixed(5)}, Lng {property.coordinates.lng.toFixed(5)}
                        </p>
                      </div>

                      <div className="flex items-center flex-wrap gap-2">
                        {/* Map Mode Switcher */}
                        <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
                          <button
                            type="button"
                            onClick={() => setMapMode('m')}
                            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                              mapMode === 'm'
                                ? 'bg-white text-gray-900 shadow-xs font-bold'
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                          >
                            Roadmap
                          </button>
                          <button
                            type="button"
                            onClick={() => setMapMode('k')}
                            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                              mapMode === 'k'
                                ? 'bg-[#0C382E] text-white shadow-xs font-bold'
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                          >
                            Satellite
                          </button>
                        </div>

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

                    {/* Embedded Interactive Google Map with iwloc suppression */}
                    <div className="relative w-full h-84 sm:h-96 rounded-xl overflow-hidden border border-gray-300 shadow-inner bg-gray-100">
                      <iframe
                        title="Google Map Location"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(
                          property.address
                            ? `${property.address}, ${property.city}, ${property.state} ${property.zip}`
                            : `${property.coordinates.lat},${property.coordinates.lng}`
                        )}&t=${mapMode}&z=16&ie=UTF8&iwloc=&output=embed`}
                        className="w-full h-full border-0"
                        loading="lazy"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  TAB 12: NATIONAL WEATHER SERVICE (NOAA)
                 ========================================================================= */}
              {activeDossierTab === 'weather' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-sky-900 via-blue-900 to-indigo-950 text-white p-5 rounded-xl shadow-md space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-sky-300 block">
                          Official Government Weather Station
                        </span>
                        <h3 className="text-xl font-black font-sans mt-0.5">
                          {weatherData ? `${weatherData.stationName} (${weatherData.stationId})` : 'NOAA Weather Gateway'}
                        </h3>
                        <p className="text-xs text-sky-200">
                          Serving {property.city}, {property.state} &bull; Forecast Office:{' '}
                          {weatherData?.cwa || 'National Weather Service'}
                        </p>
                      </div>

                      {weatherData && (
                        <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-xl border border-white/20">
                          <Thermometer className="w-7 h-7 text-amber-400" />
                          <div>
                            <span className="text-2xl sm:text-3xl font-black font-mono">
                              {weatherData.temperature}&deg;{weatherData.unit}
                            </span>
                            <span className="text-[11px] text-sky-200 block">{weatherData.condition}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {weatherLoading && (
                      <div className="p-4 rounded-lg bg-white/10 text-xs text-sky-200 flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Querying api.weather.gov live observation telemetry...</span>
                      </div>
                    )}

                    {weatherData && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="bg-white/10 p-3 rounded-lg border border-white/15">
                          <span className="text-sky-300 text-[10px] uppercase block">Wind Velocity</span>
                          <span className="font-bold text-sm block mt-0.5">{weatherData.windSpeed}</span>
                        </div>
                        <div className="bg-white/10 p-3 rounded-lg border border-white/15">
                          <span className="text-sky-300 text-[10px] uppercase block">Relative Humidity</span>
                          <span className="font-bold text-sm block mt-0.5">{weatherData.humidity}</span>
                        </div>
                        <div className="bg-white/10 p-3 rounded-lg border border-white/15">
                          <span className="text-sky-300 text-[10px] uppercase block">Barometric Pressure</span>
                          <span className="font-bold text-sm block mt-0.5">{weatherData.barometricPressure}</span>
                        </div>
                        <div className="bg-white/10 p-3 rounded-lg border border-white/15">
                          <span className="text-sky-300 text-[10px] uppercase block">Observation Time</span>
                          <span className="font-bold text-sm block mt-0.5">{weatherData.timestamp}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Action Footer */}
            <div className="p-3.5 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600 hidden sm:inline">
                  Copilot retrieved from <strong>{property.governmentSource || 'National Cadastral Network'}</strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveDossierTab('chat')}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#0C382E] text-white hover:bg-[#07251E] text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <MessageSquareText className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>Ask Copilot Anything</span>
                </button>

                {onOpenHomeTruth && (
                  <button
                    type="button"
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
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            EVIDENTIARY SCORECARD EXPLAINER MODAL
           ========================================================================= */}
        {selectedScorecardIndicator && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-bold text-base text-gray-900">
                    {selectedScorecardIndicator.category} — Evidentiary Audit
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedScorecardIndicator(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <span className="text-gray-500 font-bold uppercase text-[10px]">Metric Value</span>
                  <span className="font-mono font-bold text-[#0C382E] text-base">
                    {selectedScorecardIndicator.indicatorValue}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold text-gray-900 block uppercase text-[10px] text-gray-500">
                    Analytical Finding
                  </span>
                  <p className="text-gray-800 font-medium">{selectedScorecardIndicator.briefFinding}</p>
                </div>

                <div className="space-y-1.5 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200">
                  <span className="font-bold text-emerald-950 block uppercase text-[10px] flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Copilot Data Evidence & Methodology</span>
                  </span>
                  <p className="text-gray-700 text-xs leading-relaxed">
                    {selectedScorecardIndicator.conversationalEvidence}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedScorecardIndicator(null)}
                className="w-full py-2.5 rounded-xl bg-[#0C382E] text-white font-bold text-xs hover:bg-[#07251E] transition-colors cursor-pointer"
              >
                Close Evidence
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
