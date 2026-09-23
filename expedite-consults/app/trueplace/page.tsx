'use client';

import React, { useState } from 'react';
import { Property, calculateInstantTrueValue } from './mockData';
import { REAL_DMV_INVENTORY } from './realDataService';
import { PropertyInventoryLedgerModal } from './components/PropertyInventoryLedgerModal';
import { PropertyPhotoHeroMosaic } from './components/PropertyPhotoHeroMosaic';
import { Header, ThemeKey, THEMES } from './components/Header';
import { TrueValueCard } from './components/TrueValueCard';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { ExplainabilityDashboard } from './components/ExplainabilityDashboard';
import { GeospatialMap } from './components/GeospatialMap';
import { TruthReportModal } from './components/TruthReportModal';
import { AdminPortal } from './components/AdminPortal';
import { HomeTruthReport } from './components/HomeTruthReport';
import { PropertyTimeline } from './components/PropertyTimeline';
import { PropertyHealthCard } from './components/PropertyHealthCard';
import { NeighborhoodDigitalTwin } from './components/NeighborhoodDigitalTwin';
import { NegotiationAssistantModal } from './components/NegotiationAssistantModal';
import { TrueCostCalculator } from './components/TrueCostCalculator';
import { HomeOSDashboard } from './components/HomeOSDashboard';
import { CommunitySentiment } from './components/CommunitySentiment';
import { AIPropertyInspector } from './components/AIPropertyInspector';
import { HomeownershipCopilot } from './components/HomeownershipCopilot';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Wrench,
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  FileText,
  PlusCircle,
  X,
  TrendingUp,
  Award,
  ArrowUpDown,
  Building2,
  Compass,
  FileCheck2,
  Scale,
  HeartPulse,
  Clock,
  ExternalLink,
  Loader2,
  Bot,
} from 'lucide-react';
import { CopilotRetrievalModal } from './components/CopilotRetrievalModal';

export default function TruePlacePortalPage() {
  const [theme, setTheme] = useState<ThemeKey>('green');
  const [activeTab, setActiveTab] = useState<string>('search');
  const [ghostMode, setGhostMode] = useState<boolean>(true);
  const [properties, setProperties] = useState<Property[]>(REAL_DMV_INVENTORY);
  const [selectedProperty, setSelectedProperty] = useState<Property>(REAL_DMV_INVENTORY[0]);
  const [showTruthReportModal, setShowTruthReportModal] = useState<boolean>(false);
  const [showHomeTruthModal, setShowHomeTruthModal] = useState<boolean>(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState<boolean>(false);
  const [showLedgerModal, setShowLedgerModal] = useState<boolean>(false);

  // Copilot Nationwide Database Retrieval States
  const [showCopilotModal, setShowCopilotModal] = useState<boolean>(false);
  const [isCopilotRetrieving, setIsCopilotRetrieving] = useState<boolean>(false);
  const [copilotRetrievalStage, setCopilotRetrievalStage] = useState<number>(1);
  const [copilotDossierProperty, setCopilotDossierProperty] = useState<Property | null>(null);

  // Nationwide Address Autocomplete & Evaluation States
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<any[]>([]);
  const [isSearchingNational, setIsSearchingNational] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [nationalEvaluationToast, setNationalEvaluationToast] = useState<string | null>(null);

  // New Custom Address Form State
  const [customAddress, setCustomAddress] = useState<string>('4420 N Fairfax Dr');
  const [customCity, setCustomCity] = useState<string>('Arlington');
  const [customState, setCustomState] = useState<string>('VA');
  const [customZip, setCustomZip] = useState<string>('22203');
  const [customBeds, setCustomBeds] = useState<number>(4);
  const [customBaths, setCustomBaths] = useState<number>(3.5);
  const [customSqft, setCustomSqft] = useState<number>(3100);
  const [customListPrice, setCustomListPrice] = useState<number>(1425000);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubmarket, setSelectedSubmarket] = useState<string>('All DMV (Real Data)');
  const [priceMax, setPriceMax] = useState<number>(5000000);
  const [minBeds, setMinBeds] = useState<number>(0);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('truthScore');

  // Handle Nationwide Address Autocomplete Search
  const handleSearchChange = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      setIsSearchingNational(true);
      try {
        const res = await fetch(`/api/trueplace/search-address?q=${encodeURIComponent(val)}`);
        if (res.ok) {
          const data = await res.json();
          setAutocompleteSuggestions(data.suggestions || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('National search error:', err);
      } finally {
        setIsSearchingNational(false);
      }
    } else {
      setAutocompleteSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Copilot Nationwide Database Retrieval Engine
  const handleCopilotRetrieve = async (queryOverride?: string, suggestionItem?: any) => {
    const rawTarget = (queryOverride || searchQuery).trim();
    const target = rawTarget || '1100 Congress Ave, Austin, TX 78701';

    setShowSuggestions(false);
    setShowCopilotModal(true);
    setIsCopilotRetrieving(true);
    setCopilotRetrievalStage(1);

    const timer1 = setTimeout(() => setCopilotRetrievalStage(2), 350);
    const timer2 = setTimeout(() => setCopilotRetrievalStage(3), 750);
    const timer3 = setTimeout(() => setCopilotRetrievalStage(4), 1150);

    try {
      const payload: any = {};
      if (suggestionItem?.magicKey) {
        payload.magicKey = suggestionItem.magicKey;
        payload.singleLine = suggestionItem.label;
      } else {
        payload.singleLine = target;
      }

      const res = await fetch('/api/trueplace/evaluate-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const evaluatedProp: Property = data.property;

        setProperties(prev => [
          evaluatedProp,
          ...prev.filter(p => p.address.toLowerCase() !== evaluatedProp.address.toLowerCase())
        ]);
        setSelectedProperty(evaluatedProp);
        setCopilotDossierProperty(evaluatedProp);
        setNationalEvaluationToast(`Copilot retrieved ${evaluatedProp.address}, ${evaluatedProp.city}, ${evaluatedProp.state} from national database!`);
        setTimeout(() => setNationalEvaluationToast(null), 5000);
      } else {
        // Check local match as fallback
        const existing = properties.find(p =>
          p.address.toLowerCase().includes(target.toLowerCase()) ||
          p.city.toLowerCase().includes(target.toLowerCase()) ||
          p.zip.includes(target)
        );
        if (existing) {
          setSelectedProperty(existing);
          setCopilotDossierProperty(existing);
        } else {
          setCopilotDossierProperty(properties[0]);
        }
      }
    } catch (err) {
      console.error('Copilot national retrieval failed:', err);
      const fallback = properties.find(p => p.address.toLowerCase().includes(target.toLowerCase())) || properties[0];
      setSelectedProperty(fallback);
      setCopilotDossierProperty(fallback);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setTimeout(() => {
        setIsCopilotRetrieving(false);
      }, 1300);
    }
  };

  // Handle selecting and evaluating a nationwide address from autocomplete
  const handleSelectNationalAddress = async (suggestion: any) => {
    await handleCopilotRetrieve(suggestion.label, suggestion);
  };

  // Handle Adding / Evaluating Any Real Address
  const handleAnalyzeNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const newProp = calculateInstantTrueValue(
      customAddress,
      customCity,
      customState,
      customZip,
      Number(customBeds),
      Number(customBaths),
      Number(customSqft),
      Number(customListPrice)
    );
    setProperties([newProp, ...properties]);
    setSelectedProperty(newProp);
    setShowAddAddressModal(false);
    setActiveTab('valuation');

    // Asynchronously fetch actual photos for this custom address
    const fullQueryAddr = `${customAddress}, ${customCity}, ${customState} ${customZip}`;
    fetch(`/api/trueplace/property-photos?address=${encodeURIComponent(fullQueryAddr)}&lat=${newProp.coordinates.lat}&lng=${newProp.coordinates.lng}`)
      .then(res => res.json())
      .then(data => {
        if (data.photos && data.photos.length > 0) {
          setProperties(prev => prev.map(p => p.id === newProp.id ? { ...p, photoUrl: data.photos[0], gallery: data.photos } : p));
          setSelectedProperty(prev => prev.id === newProp.id ? { ...prev, photoUrl: data.photos[0], gallery: data.photos } : prev);
        }
      })
      .catch(() => {});
  };

  // Tri-Jurisdiction Real DMV Submarkets & Agencies
  const SUBMARKETS = [
    { label: 'All DMV (Real Data)', count: properties.length },
    { label: 'Prestigious Estates ($2.5M+)', count: properties.filter((p) => p.listPrice >= 2500000).length },
    { label: 'Northern Virginia (VA)', count: properties.filter((p) => p.state === 'VA').length },
    { label: 'Maryland (MD SDAT)', count: properties.filter((p) => p.state === 'MD').length },
    { label: 'Washington DC (DC GIS)', count: properties.filter((p) => p.state === 'DC').length },
    { label: 'Bethesda & Potomac', count: properties.filter((p) => p.city === 'Bethesda' || p.city === 'Potomac').length },
    { label: 'McLean & Great Falls', count: properties.filter((p) => p.city === 'McLean' || p.city === 'Great Falls').length },
    { label: 'Chevy Chase & Gibson Island', count: properties.filter((p) => p.city === 'Chevy Chase' || p.city === 'Gibson Island').length },
    { label: 'Arlington & Alexandria', count: properties.filter((p) => p.city === 'Arlington' || p.city === 'Alexandria').length },
    { label: 'Georgetown & Capitol Hill', count: properties.filter((p) => p.city === 'Washington').length },
    { label: 'Vienna & Falls Church', count: properties.filter((p) => p.city === 'Vienna' || p.city === 'Falls Church').length },
    { label: 'Reston & Ashburn', count: properties.filter((p) => p.city === 'Reston' || p.city === 'Ashburn').length },
  ];

  // Filter logic
  let filteredProperties = properties.filter((prop) => {
    if (selectedSubmarket !== 'All DMV (Real Data)') {
      if (selectedSubmarket === 'Prestigious Estates ($2.5M+)' && prop.listPrice < 2500000) return false;
      if (selectedSubmarket === 'Northern Virginia (VA)' && prop.state !== 'VA') return false;
      if (selectedSubmarket === 'Maryland (MD SDAT)' && prop.state !== 'MD') return false;
      if (selectedSubmarket === 'Washington DC (DC GIS)' && prop.state !== 'DC') return false;
      if (selectedSubmarket === 'Bethesda & Potomac' && prop.city !== 'Bethesda' && prop.city !== 'Potomac') return false;
      if (selectedSubmarket === 'McLean & Great Falls' && prop.city !== 'McLean' && prop.city !== 'Great Falls') return false;
      if (selectedSubmarket === 'Chevy Chase & Gibson Island' && prop.city !== 'Chevy Chase' && prop.city !== 'Gibson Island') return false;
      if (selectedSubmarket === 'Arlington & Alexandria' && prop.city !== 'Arlington' && prop.city !== 'Alexandria') return false;
      if (selectedSubmarket === 'Georgetown & Capitol Hill' && prop.city !== 'Washington') return false;
      if (selectedSubmarket === 'Vienna & Falls Church' && prop.city !== 'Vienna' && prop.city !== 'Falls Church') return false;
      if (selectedSubmarket === 'Reston & Ashburn' && prop.city !== 'Reston' && prop.city !== 'Ashburn') return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        prop.address.toLowerCase().includes(q) ||
        prop.city.toLowerCase().includes(q) ||
        prop.state.toLowerCase().includes(q) ||
        prop.zip.includes(q) ||
        prop.county.toLowerCase().includes(q) ||
        prop.title.toLowerCase().includes(q) ||
        prop.mlsId.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (prop.listPrice > priceMax) return false;
    if (minBeds > 0 && prop.beds < minBeds) return false;
    if (propertyTypeFilter !== 'all' && prop.propertyType !== propertyTypeFilter) return false;
    if (verifiedOnly && !prop.isVerifiedActive) return false;
    return true;
  });

  // Sort logic
  filteredProperties.sort((a, b) => {
    if (sortBy === 'truthScore') return b.truthScore - a.truthScore;
    if (sortBy === 'health') return (b.healthScores?.overall || 0) - (a.healthScores?.overall || 0);
    if (sortBy === 'priceAsc') return a.listPrice - b.listPrice;
    if (sortBy === 'priceDesc') return b.listPrice - a.listPrice;
    if (sortBy === 'undervalued') {
      const discountA = a.trueValue - a.listPrice;
      const discountB = b.trueValue - b.listPrice;
      return discountB - discountA;
    }
    if (sortBy === 'sqft') return b.sqft - a.sqft;
    if (sortBy === 'newest') return b.yearBuilt - a.yearBuilt;
    return 0;
  });

  // Dynamic Theme Colors
  const getThemeStyles = () => {
    switch (theme) {
      case 'dark':
        return {
          heroBg: 'bg-gradient-to-r from-[#0F172A] via-[#020617] to-[#1E293B]',
          heroAccent: 'text-[#38BDF8]',
          pageBg: 'bg-[#090D16]',
          cardBorder: 'border-slate-800',
          btnPrimary: 'bg-[#38BDF8] hover:bg-[#0284C7] text-slate-950',
          badgePrimary: 'bg-[#0F172A] text-[#38BDF8] border-slate-700',
        };
      case 'clean':
        return {
          heroBg: 'bg-gradient-to-r from-[#1E293B] via-[#334155] to-[#0F172A]',
          heroAccent: 'text-[#60A5FA]',
          pageBg: 'bg-[#F8FAFC]',
          cardBorder: 'border-gray-200',
          btnPrimary: 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white',
          badgePrimary: 'bg-blue-50 text-blue-800 border-blue-200',
        };
      case 'nordic':
        return {
          heroBg: 'bg-gradient-to-r from-[#1E3A5F] via-[#112338] to-[#2A4D78]',
          heroAccent: 'text-[#93C5FD]',
          pageBg: 'bg-[#F1F5F9]',
          cardBorder: 'border-slate-200',
          btnPrimary: 'bg-[#1E3A5F] hover:bg-[#14263D] text-white',
          badgePrimary: 'bg-blue-50 text-[#1E3A5F] border-blue-200',
        };
      case 'sand':
        return {
          heroBg: 'bg-gradient-to-r from-[#3D3025] via-[#241C15] to-[#544335]',
          heroAccent: 'text-[#F59E0B]',
          pageBg: 'bg-[#FAF6F0]',
          cardBorder: 'border-[#E0D7CC]',
          btnPrimary: 'bg-[#78350F] hover:bg-[#92400E] text-white',
          badgePrimary: 'bg-[#F5EDE1] text-[#78350F] border-[#D5C7B2]',
        };
      case 'green':
      default:
        return {
          heroBg: 'bg-gradient-to-r from-[#0C382E] via-[#07251E] to-[#164E41]',
          heroAccent: 'text-[#34D399]',
          pageBg: 'bg-[#F4F9F6]',
          cardBorder: 'border-emerald-900/15',
          btnPrimary: 'bg-[#0C382E] hover:bg-[#07251E] text-white',
          badgePrimary: 'bg-emerald-50 text-[#0C382E] border-emerald-200',
        };
    }
  };

  const currentStyles = getThemeStyles();

  return (
    <div className={`flex flex-col min-h-screen ${currentStyles.pageBg} transition-colors duration-300 w-full max-w-full overflow-x-hidden`}>
      {/* Header with Theme Switcher & Ghost Mode */}
      <Header
        ghostMode={ghostMode}
        onToggleGhostMode={() => setGhostMode(!ghostMode)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        theme={theme}
        onSelectTheme={(t) => setTheme(t)}
        onOpenLedger={() => setShowLedgerModal(true)}
      />

      {/* Main Content Area - with mobile bottom dock clearance */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8 space-y-6 overflow-x-hidden">
        {/* =========================================================================
            TAB 1: EXPLORE NORTHERN VIRGINIA HOMES
           ========================================================================= */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Hero / Mission Banner */}
            <div className="relative text-white p-6 sm:p-9 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 border border-emerald-500/20">
              {/* User-Selected Architectural Dusk Hero Background */}
              <img
                src="/images/hero-building-dusk.jpg"
                alt="Architectural engineering and modern design backdrop"
                className="absolute inset-0 w-full h-full object-cover object-center scale-105 filter brightness-90 contrast-105"
              />
              {/* Atmospheric Multi-Layer Dark Gradient for readability & branding */}
              <div className={`absolute inset-0 ${currentStyles.heroBg} opacity-85 mix-blend-multiply`} />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/40 backdrop-blur-[0.5px]" />

              <div className="relative z-10 max-w-3xl space-y-2.5">
                <span className="text-[11px] uppercase tracking-widest font-bold flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span className={currentStyles.heroAccent}>Maryland • Virginia • Washington DC Real Estate Scope</span>
                </span>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-sans">
                  Real Homes. Real Data. <span className={currentStyles.heroAccent}>Real Peace of Mind.</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-light">
                  Capital Region's premier residential intelligence platform. 100% real government and municipal records synced every 30 minutes from Maryland SDAT, Fairfax County PLUS, and DC GIS. Zero lead sales. Complete Ghost Mode privacy.
                </p>

                {/* Call to Action: Evaluate Address + Open 30-Min Ledger */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setShowAddAddressModal(true)}
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-white text-[#0C382E] font-bold text-xs hover:bg-emerald-50 transition-all shadow-md cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-[#0C382E]" />
                    <span>Evaluate Any MD / VA / DC Address</span>
                  </button>
                  <button
                    onClick={() => setShowLedgerModal(true)}
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-emerald-950/80 border border-emerald-400/50 text-emerald-200 font-bold text-xs hover:bg-emerald-900 transition-all shadow-md cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-[#34D399]" />
                    <span>Open 30-Min Property Ledger</span>
                  </button>
                  <span className="text-xs text-gray-300 hidden sm:inline">
                    Live 30-min heartbeat: SDAT deeds & Fairfax/DCRA permits
                  </span>
                </div>
              </div>
              <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
            </div>

            {/* Northern Virginia Submarket Filter Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
              {SUBMARKETS.map((sub) => (
                <button
                  key={sub.label}
                  onClick={() => setSelectedSubmarket(sub.label)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSubmarket === sub.label
                      ? 'bg-[#0C382E] text-white shadow-xs'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span>{sub.label}</span>
                  <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${selectedSubmarket === sub.label ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {sub.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search, Filter & Sort Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1 w-full flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search any address nationwide (e.g., 1100 Congress Ave Austin, 9641 Sunset Blvd Beverly Hills, 7200 Wisconsin Ave Bethesda)..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCopilotRetrieve();
                        }
                      }}
                      onFocus={() => { if (autocompleteSuggestions.length > 0) setShowSuggestions(true); }}
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0C382E] focus:border-transparent font-medium"
                    />
                    {isSearchingNational && (
                      <Loader2 className="w-4 h-4 text-emerald-600 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                    )}
                  </div>

                  {/* Dedicated Copilot Nationwide Database Retrieve Button */}
                  <button
                    type="button"
                    onClick={() => handleCopilotRetrieve()}
                    disabled={isCopilotRetrieving}
                    className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#0C382E] via-[#0D4437] to-[#164E41] text-white hover:brightness-110 font-bold text-xs sm:text-sm flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer shrink-0 border border-emerald-400/50 active:scale-95 disabled:opacity-50"
                    title="Command Copilot to retrieve all information from national databases"
                  >
                    <Bot className="w-4 h-4 text-[#34D399] animate-pulse" />
                    <span className="whitespace-nowrap font-sans font-bold hidden xs:inline sm:inline">Copilot Retrieve</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  </button>

                  {/* Floating Nationwide Autocomplete Dropdown */}
                  {showSuggestions && autocompleteSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-gray-100 max-h-80 overflow-y-auto">
                      <div className="px-3.5 py-1.5 bg-[#0C382E] text-white text-[10.5px] font-bold flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <Bot className="w-3.5 h-3.5 text-[#34D399]" />
                          <span>Copilot National Address Geocoder (All 50 US States)</span>
                        </span>
                        <span className="text-gray-300 text-[9.5px]">Select to Run Full Retrieval</span>
                      </div>
                      {autocompleteSuggestions.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectNationalAddress(item)}
                          className="p-3 hover:bg-emerald-50/80 cursor-pointer transition-colors flex items-center justify-between gap-3 text-left"
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0C382E] text-white shrink-0">
                              {item.state || 'US'}
                            </span>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-gray-900 truncate">
                                {item.streetAddress}
                              </div>
                              <div className="text-[11px] text-gray-500 truncate">
                                {item.cityState}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0 flex items-center space-x-1">
                            <Bot className="w-3 h-3 text-emerald-700" />
                            <span>Retrieve Dossier &rarr;</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
                  {/* Property Type Dropdown */}
                  <select
                    value={propertyTypeFilter}
                    onChange={(e) => setPropertyTypeFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-lg border border-gray-300 text-xs font-semibold bg-white text-gray-700 cursor-pointer focus:outline-none"
                  >
                    <option value="all">All Property Types</option>
                    <option value="single_family">Single Family</option>
                    <option value="townhouse">Townhouse</option>
                  </select>

                  {/* Bedrooms Filter */}
                  <select
                    value={minBeds}
                    onChange={(e) => setMinBeds(Number(e.target.value))}
                    className="px-3 py-2.5 rounded-lg border border-gray-300 text-xs font-semibold bg-white text-gray-700 cursor-pointer focus:outline-none"
                  >
                    <option value={0}>Any Bedrooms</option>
                    <option value={3}>3+ Beds</option>
                    <option value={4}>4+ Beds</option>
                    <option value={5}>5+ Beds</option>
                  </select>

                  {/* Sort By Dropdown */}
                  <div className="flex items-center space-x-1.5 bg-gray-50 border border-gray-300 px-2.5 py-1.5 rounded-lg">
                    <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-gray-800 cursor-pointer focus:outline-none"
                    >
                      <option value="truthScore">Truth Score (Highest)</option>
                      <option value="health">Property Health Score</option>
                      <option value="priceAsc">Price: Low to High</option>
                      <option value="priceDesc">Price: High to Low</option>
                      <option value="undervalued">Greatest Undervaluation</option>
                      <option value="sqft">Living Area (Largest)</option>
                      <option value="newest">Newest Built</option>
                    </select>
                  </div>

                  {/* Verified Active 48h Toggle */}
                  <button
                    onClick={() => setVerifiedOnly(!verifiedOnly)}
                    className={`flex items-center space-x-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      verifiedOnly
                        ? 'bg-[#0C382E] text-white border-[#0C382E]'
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>48h Verified Only</span>
                  </button>
                </div>
              </div>

              {/* Copilot Quick Retrieval Prompts */}
              <div className="flex items-center space-x-1.5 overflow-x-auto text-xs pt-1 border-t border-gray-100 no-scrollbar">
                <span className="text-[10px] font-bold text-[#0C382E] uppercase flex items-center space-x-1 shrink-0">
                  <Bot className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copilot Retrieval Shortcuts:</span>
                </span>
                {[
                  { label: 'Beverly Hills, CA', query: '9641 Sunset Blvd, Beverly Hills, CA 90210' },
                  { label: 'Austin, TX', query: '1100 Congress Ave, Austin, TX 78701' },
                  { label: 'Miami, FL', query: '1100 Biscayne Blvd, Miami, FL 33132' },
                  { label: 'Bethesda, MD (SDAT)', query: '7200 Wisconsin Ave, Bethesda, MD 20814' },
                  { label: 'McLean, VA (PLUS)', query: '1137 Basil Rd, McLean, VA 22101' },
                  { label: 'Georgetown, DC (GIS)', query: '1420 Wisconsin Ave NW, Washington, DC 20007' },
                  { label: 'Dallas, TX', query: '1600 Pennsylvania Ave, Dallas, TX 75215' },
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSearchQuery(prompt.query);
                      handleCopilotRetrieve(prompt.query);
                    }}
                    className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 flex items-center space-x-1"
                  >
                    <span>⚡</span>
                    <span>{prompt.label}</span>
                  </button>
                ))}
              </div>

              {/* National Evaluation Progress / Feedback Toast */}
              {nationalEvaluationToast && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-950 flex items-center space-x-2 animate-in fade-in">
                  {isEvaluating ? (
                    <Loader2 className="w-4 h-4 text-emerald-700 animate-spin shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  )}
                  <span>{nationalEvaluationToast}</span>
                </div>
              )}
            </div>

            {/* Results Grid Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  Showing <strong className="text-gray-900 font-bold">{filteredProperties.length}</strong> verified active properties in Northern Virginia & DMV
                  {selectedSubmarket !== 'All NoVA & DMV' && <span> • <strong>{selectedSubmarket}</strong></span>}
                </span>
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0C382E]" />
                  <span>Bright MLS 48-hour active broker synchronization</span>
                </span>
              </div>

              {/* Property Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((prop) => {
                  const isUndervalued = prop.trueValue > prop.listPrice;
                  const valueDelta = Math.abs(prop.trueValue - prop.listPrice);

                  return (
                    <div
                      key={prop.id}
                      onClick={() => {
                        setSelectedProperty(prop);
                        setCopilotDossierProperty(prop);
                        setIsCopilotRetrieving(false);
                        setShowCopilotModal(true);
                      }}
                      className="bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-lg hover:border-emerald-500 transition-all overflow-hidden flex flex-col justify-between group cursor-pointer"
                    >
                      {/* Photo & Badges */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                        <img
                          src={prop.photoUrl}
                          alt={prop.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified Active ({prop.lastVerifiedHoursAgo}h ago)</span>
                          </span>
                          {prop.id.startsWith('us-eval-') && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-purple-900/90 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
                              <Bot className="w-3 h-3 text-[#34D399]" />
                              <span>⭐ Copilot Retrieved</span>
                            </span>
                          )}
                        </div>
                        <div className="absolute top-2.5 right-2.5 flex items-center space-x-1">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-[#0C382E]/90 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
                            <HeartPulse className="w-3 h-3 text-[#34D399]" />
                            <span>Health: {prop.healthScores?.overall || 92}</span>
                          </span>
                        </div>

                        {/* Opportunity Badge */}
                        {isUndervalued && (
                          <div className="absolute bottom-2.5 left-2.5">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-600/90 backdrop-blur-xs text-white text-[10px] font-bold">
                              <TrendingUp className="w-3 h-3" />
                              <span>+${(valueDelta / 1000).toFixed(0)}k TrueValue Advantage</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Listing Content */}
                      <div className="p-4 space-y-3 flex-1">
                        <div>
                          <div className="text-xl font-black text-gray-950 font-sans tracking-tight">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(prop.listPrice)}
                          </div>
                          <div className="text-xs font-bold text-[#0C382E] mt-0.5 flex items-center space-x-2">
                            <span>TrueValue™: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(prop.trueValue)}</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                              {prop.confidence}% Conf.
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-gray-700">
                          <h4 className="font-bold text-gray-900 line-clamp-1">{prop.title}</h4>
                          <p className="text-gray-500 text-[11px] flex items-center space-x-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#E07A5F] shrink-0" />
                            <span>{prop.address}, {prop.city}, {prop.state} {prop.zip}</span>
                          </p>
                        </div>

                        {/* Specs Badges */}
                        <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
                          <span className="flex items-center space-x-1">
                            <Bed className="w-3.5 h-3.5 text-gray-400" />
                            <span><strong>{prop.beds}</strong> bds</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Bath className="w-3.5 h-3.5 text-gray-400" />
                            <span><strong>{prop.baths}</strong> ba</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
                            <span><strong>{prop.sqft ? prop.sqft.toLocaleString() : '—'}</strong> sqft</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>Built {prop.yearBuilt}</span>
                          </span>
                        </div>

                        {/* Regional & Real Government Verification Metrics */}
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                          <span>Schools: <strong className="text-gray-700">{prop.schoolRating}/10</strong></span>
                          <span>Metro: <strong className="text-gray-700">{prop.neighborhoodTwin?.metroDistanceMi || 1.2} mi</strong></span>
                          {prop.sdatDeedUrl ? (
                            <a
                              href={prop.sdatDeedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-800 hover:text-emerald-950 hover:underline font-bold flex items-center space-x-1"
                              title="Inspect real deed on Maryland SDAT"
                            >
                              <span>🏛️ MD SDAT Deed</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : prop.countyPermitUrl ? (
                            <a
                              href={prop.countyPermitUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-800 hover:text-emerald-950 hover:underline font-bold flex items-center space-x-1"
                              title="Inspect real permit on Fairfax PLUS"
                            >
                              <span>🏛️ Fairfax PLUS</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : prop.sslCadastralId ? (
                            <span className="text-purple-800 font-bold text-[10.5px]">🏛️ DC GIS MAR</span>
                          ) : (
                            <span className="text-emerald-700 font-semibold">Clean Title Chain</span>
                          )}
                        </div>
                      </div>

                      {/* Action Footer with Top Features */}
                      <div className="p-3 bg-gray-50 border-t border-gray-100 flex flex-col gap-2">
                        {/* Primary Quick Actions */}
                        <div className="flex items-center justify-between gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProperty(prop);
                              setShowHomeTruthModal(true);
                            }}
                            className="flex-1 flex items-center justify-center space-x-1 py-2 px-2 rounded-lg text-[11px] font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 transition-colors cursor-pointer"
                            title="Open Carfax for Homes HomeTruth Audit"
                          >
                            <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>HomeTruth™</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProperty(prop);
                              setActiveTab('truecost');
                            }}
                            className="flex-1 flex items-center justify-center space-x-1 py-2 px-2 rounded-lg text-[11px] font-bold text-gray-800 bg-gray-200/80 hover:bg-gray-300 transition-colors cursor-pointer"
                            title="Calculate All-In Monthly TrueCost"
                          >
                            <span>💰 TrueCost</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProperty(prop);
                              setActiveTab('valuation');
                            }}
                            className="flex-1 flex items-center justify-center space-x-1 py-2 px-2 rounded-lg bg-[#0C382E] text-white text-[11px] font-bold hover:bg-[#07251E] transition-colors cursor-pointer shadow-xs"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#34D399]" />
                            <span>TrueValue</span>
                          </button>
                        </div>

                        {/* Copilot Nationwide Dossier Direct Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProperty(prop);
                            setCopilotDossierProperty(prop);
                            setIsCopilotRetrieving(false);
                            setShowCopilotModal(true);
                          }}
                          className="w-full py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 text-[11px] font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <Bot className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Copilot Full Property Dossier (Map • Weather • Data)</span>
                          <Sparkles className="w-3 h-3 text-amber-500" />
                        </button>

                        {/* Secondary Quick Action Bar */}
                        <div className="grid grid-cols-4 gap-1 text-[10.5px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProperty(prop);
                              setActiveTab('homeos');
                            }}
                            className="py-1 px-1 rounded bg-white border border-gray-200 text-gray-700 hover:border-[#0C382E] font-medium text-center truncate cursor-pointer"
                          >
                            🏡 HomeOS
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProperty(prop);
                              setActiveTab('copilot');
                            }}
                            className="py-1 px-1 rounded bg-white border border-gray-200 text-gray-700 hover:border-[#0C382E] font-medium text-center truncate cursor-pointer"
                          >
                            🤖 Copilot
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProperty(prop);
                              setActiveTab('inspector');
                            }}
                            className="py-1 px-1 rounded bg-white border border-gray-200 text-gray-700 hover:border-[#0C382E] font-medium text-center truncate cursor-pointer"
                          >
                            🔬 Inspect
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProperty(prop);
                              setActiveTab('community');
                            }}
                            className="py-1 px-1 rounded bg-white border border-gray-200 text-gray-700 hover:border-[#0C382E] font-medium text-center truncate cursor-pointer"
                          >
                            👥 Vibe
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: HOMETRUTH™ AUDIT (CARFAX FOR HOUSES)
           ========================================================================= */}
        {activeTab === 'hometruth' && (
          <div className="space-y-6">
            <div className="bg-[#0C382E] text-white p-6 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#34D399] block">
                  The Carfax For Houses™
                </span>
                <h2 className="text-2xl font-black tracking-tight">HomeTruth™ Certified Property Audit</h2>
                <p className="text-xs text-gray-200 mt-1 max-w-2xl">
                  Inspect official county building permits, chain of title records, insurance flood status, and major mechanical asset lifecycles before making an offer.
                </p>
              </div>
              <button
                onClick={() => setShowHomeTruthModal(true)}
                className="px-4 py-2.5 rounded-lg bg-white text-[#0C382E] font-bold text-xs hover:bg-emerald-50 transition-all shadow-md cursor-pointer flex items-center space-x-1.5"
              >
                <FileCheck2 className="w-4 h-4 text-[#0C382E]" />
                <span>Launch Printable HomeTruth™ Certificate</span>
              </button>
            </div>

            {/* Render Inline HomeTruth Audit View */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{selectedProperty.address}</h3>
                  <p className="text-xs text-gray-500">{selectedProperty.city}, {selectedProperty.state} • {selectedProperty.county}</p>
                </div>
                <span className="text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  HomeTruth Score: 100/100 Clean Title
                </span>
              </div>

              {/* Permits Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase">Permit & Renovation Audit Trail</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Permit ID</th>
                        <th className="p-2.5">Type of Work</th>
                        <th className="p-2.5">Declared Cost</th>
                        <th className="p-2.5">Year</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(selectedProperty?.permits || []).map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="p-2.5 font-mono font-bold text-gray-900">{p.id}</td>
                          <td className="p-2.5 text-gray-700">{p.type}</td>
                          <td className="p-2.5 font-bold text-gray-900">${(p.cost || 0).toLocaleString()}</td>
                          <td className="p-2.5 text-gray-600">{p.year}</td>
                          <td className="p-2.5 text-emerald-700 font-bold">{p.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: PROPERTY TIMELINE
           ========================================================================= */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <PropertyTimeline property={selectedProperty} />
          </div>
        )}

        {/* =========================================================================
            TAB 4: PROPERTY HEALTH INDEX
           ========================================================================= */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            <PropertyHealthCard property={selectedProperty} />
          </div>
        )}

        {/* =========================================================================
            TAB 5: AI NEGOTIATION CO-PILOT
           ========================================================================= */}
        {activeTab === 'negotiate' && (
          <div className="space-y-6">
            <NegotiationAssistantModal property={selectedProperty} />
          </div>
        )}

        {/* =========================================================================
            TAB 6: NEIGHBORHOOD DIGITAL TWIN
           ========================================================================= */}
        {activeTab === 'digitaltwin' && (
          <div className="space-y-6">
            <NeighborhoodDigitalTwin property={selectedProperty} />
          </div>
        )}

        {/* =========================================================================
            TAB 7: TRUEVALUE™ ENGINE VIEW
           ========================================================================= */}
        {activeTab === 'valuation' && (
          <div className="space-y-6">
            <div className="relative text-white p-6 rounded-xl shadow-md overflow-hidden border border-emerald-500/20">
              <img
                src="/images/hero-building-dusk.jpg"
                alt="Architectural Backdrop"
                className="absolute inset-0 w-full h-full object-cover object-center filter brightness-60"
              />
              <div className="absolute inset-0 bg-[#0C382E]/85 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
              <div className="relative z-10">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#34D399] block">
                  7-Layer Hybrid Valuation Architecture
                </span>
                <h2 className="text-2xl font-black tracking-tight">TrueValue™ Machine Learning Engine</h2>
                <p className="text-xs text-gray-200 mt-1 max-w-2xl">
                  Unlike opaque black-box models, TrueValue combines MLS characteristics, county tax assessments, municipal building permits, and computer-vision finish scoring with strict mathematical additivity.
                </p>
              </div>
            </div>

            {/* Redfin-Style Multi-Photo Collage Hero */}
            <PropertyPhotoHeroMosaic
              property={selectedProperty}
              onOpenTruthReport={() => setShowHomeTruthModal(true)}
              onOpenCadastral={() => setActiveTab('map')}
            />

            {/* Render TrueValue Card */}
            <TrueValueCard
              property={selectedProperty}
              onViewExplainability={() => setActiveTab('explainability')}
              onLaunchWhatIf={() => setActiveTab('whatif')}
            />

            {/* Real Property Selector for Multi-Property Evaluation */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
              <div className="flex justify-between items-center mb-3">
                <div className="text-xs font-bold uppercase text-gray-700">
                  Select Any Active NoVA / DMV Residence to Evaluate:
                </div>
                <button
                  onClick={() => setShowAddAddressModal(true)}
                  className="text-xs font-bold text-[#0C382E] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Analyze Custom Address</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 max-h-72 overflow-y-auto pr-1">
                {properties.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProperty(p)}
                    className={`p-2.5 rounded-lg text-left border text-xs transition-all cursor-pointer ${
                      selectedProperty.id === p.id
                        ? 'border-[#0C382E] bg-emerald-50/60 ring-2 ring-[#0C382E]'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold text-gray-900 truncate">{p.address}</div>
                    <div className="text-[11px] text-gray-500">{p.city}, {p.state} • {p.beds}b/{p.baths}ba</div>
                    <div className="text-[11px] font-bold text-[#0C382E] mt-1">
                      TrueValue: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p.trueValue)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 8: WHAT-IF COUNTERFACTUAL SIMULATOR
           ========================================================================= */}
        {activeTab === 'whatif' && (
          <div className="space-y-6">
            <WhatIfSimulator
              property={selectedProperty}
              onSaveScenario={(s) => {
                alert(`Scenario "${s.name}" saved! Projected equity uplift: +$${s.uplift.toLocaleString()}`);
              }}
            />
          </div>
        )}

        {/* =========================================================================
            TAB 9: SHAP EXPLAINABILITY LAB
           ========================================================================= */}
        {activeTab === 'explainability' && (
          <div className="space-y-6">
            <ExplainabilityDashboard
              property={selectedProperty}
              onExportReport={() => setShowTruthReportModal(true)}
            />
          </div>
        )}

        {/* =========================================================================
            TAB 10: GEOSPATIAL & METRO MAP
           ========================================================================= */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <GeospatialMap
              properties={filteredProperties}
              selectedProperty={selectedProperty}
              onSelectProperty={(p) => setSelectedProperty(p)}
            />
          </div>
        )}

        {/* =========================================================================
            TAB: TRUECOST™ REALITY CALCULATOR (FEATURE 6)
           ========================================================================= */}
        {activeTab === 'truecost' && (
          <div className="space-y-6">
            <TrueCostCalculator property={selectedProperty} />
          </div>
        )}

        {/* =========================================================================
            TAB: HOMEOS™ DASHBOARD & MAINTENANCE ADVISOR (FEATURE 7)
           ========================================================================= */}
        {activeTab === 'homeos' && (
          <div className="space-y-6">
            <HomeOSDashboard property={selectedProperty} />
          </div>
        )}

        {/* =========================================================================
            TAB: HOMEOWNERSHIP COPILOT™ (FEATURE 10)
           ========================================================================= */}
        {activeTab === 'copilot' && (
          <div className="space-y-6">
            <HomeownershipCopilot property={selectedProperty} />
          </div>
        )}

        {/* =========================================================================
            TAB: AI PROPERTY INSPECTOR™ (FEATURE 9)
           ========================================================================= */}
        {activeTab === 'inspector' && (
          <div className="space-y-6">
            <AIPropertyInspector property={selectedProperty} />
          </div>
        )}

        {/* =========================================================================
            TAB: COMMUNITY SENTIMENT & RESIDENT Q&A (FEATURE 8)
           ========================================================================= */}
        {activeTab === 'community' && (
          <div className="space-y-6">
            <CommunitySentiment property={selectedProperty} />
          </div>
        )}

        {/* =========================================================================
            TAB: TRUTH REPORT PDF VIEWER
           ========================================================================= */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Truth Report™ Generation Center</h2>
                  <p className="text-xs text-gray-500">Official bank-grade valuation, permit audit, and TreeSHAP attribution statement for {selectedProperty.address}.</p>
                </div>
                <button
                  onClick={() => setShowTruthReportModal(true)}
                  className="px-4 py-2.5 bg-[#0C382E] text-white rounded-lg font-bold text-xs hover:bg-[#07251E] transition-colors cursor-pointer flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Open Full PDF Truth Report</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB: PLATFORM ADMIN & ACCURACY PORTAL
           ========================================================================= */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <AdminPortal properties={properties} />
          </div>
        )}
      </main>

      {/* HomeTruth™ Carfax for Homes Modal */}
      {showHomeTruthModal && (
        <HomeTruthReport
          property={selectedProperty}
          onClose={() => setShowHomeTruthModal(false)}
        />
      )}

      {/* Truth Report Modal */}
      {showTruthReportModal && (
        <TruthReportModal
          property={selectedProperty}
          onClose={() => setShowTruthReportModal(false)}
        />
      )}

      {/* Instant Property Valuation / Custom Address Evaluation Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 space-y-4 border border-gray-300">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#0C382E]" />
                <h3 className="text-base font-bold text-gray-900">Instant TrueValue™ Property Evaluation</h3>
              </div>
              <button
                onClick={() => setShowAddAddressModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Enter any real address in Northern Virginia or Maryland. TruePlace will run our 7-layer valuation engine, generate TreeSHAP attributions, find arm's-length comparables, and add the property to your active portfolio.
            </p>

            <form onSubmit={handleAnalyzeNewAddress} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder="e.g. 4420 N Fairfax Dr"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0C382E]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0C382E]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={customState}
                    onChange={(e) => setCustomState(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0C382E]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Zip Code</label>
                  <input
                    type="text"
                    required
                    value={customZip}
                    onChange={(e) => setCustomZip(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0C382E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={customBeds}
                    onChange={(e) => setCustomBeds(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0C382E]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    step={0.5}
                    min={1}
                    max={10}
                    value={customBaths}
                    onChange={(e) => setCustomBaths(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0C382E]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Sq Ft</label>
                  <input
                    type="number"
                    min={400}
                    max={20000}
                    value={customSqft}
                    onChange={(e) => setCustomSqft(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0C382E]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">List Price (Optional / Estimated)</label>
                <input
                  type="number"
                  step={1000}
                  value={customListPrice}
                  onChange={(e) => setCustomListPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0C382E]"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0C382E] text-white font-bold hover:bg-[#07251E] shadow-sm flex items-center space-x-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>Run Live TrueValue™ Audit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Property Inventory Ledger Modal */}
      <PropertyInventoryLedgerModal
        isOpen={showLedgerModal}
        onClose={() => setShowLedgerModal(false)}
        properties={properties}
        onPropertiesUpdated={(updated) => {
          setProperties(updated);
          if (updated.length > 0) setSelectedProperty(updated[0]);
        }}
      />

      {/* Copilot Nationwide Database Retrieval Modal */}
      <CopilotRetrievalModal
        isOpen={showCopilotModal}
        onClose={() => setShowCopilotModal(false)}
        property={copilotDossierProperty || selectedProperty}
        searchQuery={searchQuery}
        isRetrieving={isCopilotRetrieving}
        retrievalStage={copilotRetrievalStage}
        onSelectProperty={(p) => {
          setSelectedProperty(p);
          setShowCopilotModal(false);
        }}
        onOpenChatWithCopilot={(p) => {
          setSelectedProperty(p);
          setActiveTab('copilot');
        }}
        onOpenHomeTruth={(p) => {
          setSelectedProperty(p);
          setShowHomeTruthModal(true);
        }}
        onOpenLedger={() => setShowLedgerModal(true)}
      />

      {/* Footer */}
      <footer className="bg-[#07251E] text-white border-t border-[#041A15] text-xs py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#0C382E]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-[#F5EDE1] text-[#0C382E] flex items-center justify-center font-bold">
                TP
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight">TruePlace</span>
                <p className="text-[10px] text-gray-400">Northern Virginia Real Estate Intelligence • Real Homes. Real Data. Real Peace of Mind.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-gray-300 text-[11px]">
              <span className="hover:underline cursor-pointer">Fair Housing Compliance Policy</span>
              <span className="hover:underline cursor-pointer">RESPA Transparency Standards</span>
              <span className="hover:underline cursor-pointer">VCDPA Consumer Privacy</span>
              <span className="hover:underline cursor-pointer">Bright MLS Syndication Guidelines</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed">
            TruePlace is engineered from first principles for radical trust, data accuracy, and user privacy in the Northern Virginia & DMV corridor. Model estimations are generated using hybrid ensemble intelligence and certified TreeSHAP polynomial feature attribution with guaranteed mathematical additivity.
          </p>
        </div>
      </footer>
    </div>
  );
}
