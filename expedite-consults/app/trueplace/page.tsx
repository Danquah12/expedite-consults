'use client';

import React, { useState } from 'react';
import { MOCK_PROPERTIES, Property, calculateInstantTrueValue } from './mockData';
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
} from 'lucide-react';

export default function TruePlacePortalPage() {
  const [theme, setTheme] = useState<ThemeKey>('green');
  const [activeTab, setActiveTab] = useState<string>('search');
  const [ghostMode, setGhostMode] = useState<boolean>(true);
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [selectedProperty, setSelectedProperty] = useState<Property>(MOCK_PROPERTIES[0]);
  const [showTruthReportModal, setShowTruthReportModal] = useState<boolean>(false);
  const [showHomeTruthModal, setShowHomeTruthModal] = useState<boolean>(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState<boolean>(false);

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
  const [selectedSubmarket, setSelectedSubmarket] = useState<string>('All');
  const [priceMax, setPriceMax] = useState<number>(5000000);
  const [minBeds, setMinBeds] = useState<number>(0);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('truthScore');

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
  };

  // Northern Virginia Submarkets
  const SUBMARKETS = [
    { label: 'All NoVA & DMV', count: properties.length },
    { label: 'Arlington', count: properties.filter((p) => p.city === 'Arlington').length },
    { label: 'McLean & Great Falls', count: properties.filter((p) => p.city === 'McLean' || p.city === 'Great Falls').length },
    { label: 'Alexandria (Old Town)', count: properties.filter((p) => p.city === 'Alexandria').length },
    { label: 'Vienna & Falls Church', count: properties.filter((p) => p.city === 'Vienna' || p.city === 'Falls Church').length },
    { label: 'Reston & Tysons', count: properties.filter((p) => p.city === 'Reston' || p.city === 'Tysons').length },
    { label: 'Ashburn (Loudoun)', count: properties.filter((p) => p.city === 'Ashburn').length },
    { label: 'Bethesda MD', count: properties.filter((p) => p.city === 'Bethesda').length },
  ];

  // Filter logic
  let filteredProperties = properties.filter((prop) => {
    if (selectedSubmarket !== 'All NoVA & DMV') {
      if (selectedSubmarket === 'Arlington' && prop.city !== 'Arlington') return false;
      if (selectedSubmarket === 'McLean & Great Falls' && prop.city !== 'McLean' && prop.city !== 'Great Falls') return false;
      if (selectedSubmarket === 'Alexandria (Old Town)' && prop.city !== 'Alexandria') return false;
      if (selectedSubmarket === 'Vienna & Falls Church' && prop.city !== 'Vienna' && prop.city !== 'Falls Church') return false;
      if (selectedSubmarket === 'Reston & Tysons' && prop.city !== 'Reston' && prop.city !== 'Tysons') return false;
      if (selectedSubmarket === 'Ashburn (Loudoun)' && prop.city !== 'Ashburn') return false;
      if (selectedSubmarket === 'Bethesda MD' && prop.city !== 'Bethesda') return false;
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
      />

      {/* Main Content Area - with mobile bottom dock clearance */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8 space-y-6 overflow-x-hidden">
        {/* =========================================================================
            TAB 1: EXPLORE NORTHERN VIRGINIA HOMES
           ========================================================================= */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Hero / Mission Banner */}
            <div className={`${currentStyles.heroBg} text-white p-6 sm:p-8 rounded-2xl shadow-sm relative overflow-hidden transition-all duration-300`}>
              <div className="relative z-10 max-w-3xl space-y-2.5">
                <span className="text-[11px] uppercase tracking-widest font-bold flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span className={currentStyles.heroAccent}>Northern Virginia & DMV Launch Metro</span>
                </span>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-sans">
                  Real Homes. Real Data. <span className={currentStyles.heroAccent}>Real Peace of Mind.</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-light">
                  Northern Virginia's premier residential intelligence platform. Powered by municipal permit records (Fairfax LDS, Arlington ePlan, Alexandria), TreeSHAP mathematical valuation, and HomeTruth™ ("Carfax for Houses"). Zero lead sales. Complete Ghost Mode privacy.
                </p>

                {/* Call to Action: Evaluate Any Real Address */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setShowAddAddressModal(true)}
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-white text-[#0C382E] font-bold text-xs hover:bg-emerald-50 transition-all shadow-md cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-[#0C382E]" />
                    <span>Evaluate Any NoVA / Maryland Address</span>
                  </button>
                  <span className="text-xs text-gray-300 hidden sm:inline">
                    Instant HomeTruth™ audit, permit check & TreeSHAP valuation
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
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by address, county (Fairfax, Arlington, Loudoun), neighborhood, or MLS ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0C382E] focus:border-transparent"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
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
                      className="bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
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
                            <span><strong>{prop.sqft.toLocaleString()}</strong> sqft</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>Built {prop.yearBuilt}</span>
                          </span>
                        </div>

                        {/* NoVA Specific Metrics */}
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                          <span>Schools: <strong className="text-gray-700">{prop.schoolRating}/10</strong></span>
                          <span>Metro: <strong className="text-gray-700">{prop.neighborhoodTwin?.metroDistanceMi || 1.2} mi</strong></span>
                          <span className="text-emerald-700 font-semibold">Clean Title Chain</span>
                        </div>
                      </div>

                      {/* Action Footer with Top Features */}
                      <div className="p-3 bg-gray-50 border-t border-gray-100 flex flex-col gap-2">
                        {/* Primary Quick Actions */}
                        <div className="flex items-center justify-between gap-1.5">
                          <button
                            onClick={() => {
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
                            onClick={() => {
                              setSelectedProperty(prop);
                              setActiveTab('truecost');
                            }}
                            className="flex-1 flex items-center justify-center space-x-1 py-2 px-2 rounded-lg text-[11px] font-bold text-gray-800 bg-gray-200/80 hover:bg-gray-300 transition-colors cursor-pointer"
                            title="Calculate All-In Monthly TrueCost"
                          >
                            <span>💰 TrueCost</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedProperty(prop);
                              setActiveTab('valuation');
                            }}
                            className="flex-1 flex items-center justify-center space-x-1 py-2 px-2 rounded-lg bg-[#0C382E] text-white text-[11px] font-bold hover:bg-[#07251E] transition-colors cursor-pointer shadow-xs"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#34D399]" />
                            <span>TrueValue</span>
                          </button>
                        </div>

                        {/* Secondary Quick Action Bar */}
                        <div className="grid grid-cols-4 gap-1 text-[10.5px]">
                          <button
                            onClick={() => {
                              setSelectedProperty(prop);
                              setActiveTab('homeos');
                            }}
                            className="py-1 px-1 rounded bg-white border border-gray-200 text-gray-700 hover:border-[#0C382E] font-medium text-center truncate cursor-pointer"
                          >
                            🏡 HomeOS
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProperty(prop);
                              setActiveTab('copilot');
                            }}
                            className="py-1 px-1 rounded bg-white border border-gray-200 text-gray-700 hover:border-[#0C382E] font-medium text-center truncate cursor-pointer"
                          >
                            🤖 Copilot
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProperty(prop);
                              setActiveTab('inspector');
                            }}
                            className="py-1 px-1 rounded bg-white border border-gray-200 text-gray-700 hover:border-[#0C382E] font-medium text-center truncate cursor-pointer"
                          >
                            🔬 Inspect
                          </button>
                          <button
                            onClick={() => {
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
                      {selectedProperty.permits.map((p) => (
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
            <div className="bg-[#0C382E] text-white p-6 rounded-xl shadow-xs">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#34D399] block">
                7-Layer Hybrid Valuation Architecture
              </span>
              <h2 className="text-2xl font-black tracking-tight">TrueValue™ Machine Learning Engine</h2>
              <p className="text-xs text-gray-200 mt-1 max-w-2xl">
                Unlike opaque black-box models, TrueValue combines MLS characteristics, county tax assessments, municipal building permits, and computer-vision finish scoring with strict mathematical additivity.
              </p>
            </div>

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
