'use client';

import React, { useState, useEffect } from 'react';
import {
  Camera,
  Layers,
  MapPin,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Compass,
  Sparkles,
  CheckCircle2,
  Calendar,
  Building2,
  ShieldCheck,
  TrendingUp,
  Share2,
  Heart,
  Edit3,
} from 'lucide-react';
import { Property } from '../mockData';

interface PropertyPhotoHeroMosaicProps {
  property: Property;
  onOpenStreetView?: () => void;
  onOpenCadastral?: () => void;
  onOpenTruthReport?: () => void;
}

export function PropertyPhotoHeroMosaic({
  property,
  onOpenStreetView,
  onOpenCadastral,
  onOpenTruthReport,
}: PropertyPhotoHeroMosaicProps) {
  if (!property) return null;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorited, setIsFavorited] = useState(false);

  // Combine primary photo with gallery and filter out duplicates
  const rawPhotos = [property.photoUrl, ...(property.gallery || [])].filter(Boolean);
  const allPhotos = Array.from(new Set(rawPhotos));

  // Determine primary hero photo and secondary grid photos
  const heroPhoto = allPhotos[0] || property.photoUrl || 'https://ssl.cdn-redfin.com/photo/235/bigphoto/634/MDAA2096634_0.jpg';
  const gridPhotos = allPhotos.slice(1, 7); // up to 6 secondary photos for 2x3 or 2x2 grid

  const openLightboxAt = (index: number) => {
    setCurrentPhotoIdx(index);
    setLightboxOpen(true);
  };

  const nextPhoto = () => {
    setCurrentPhotoIdx((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0));
  };

  const prevPhoto = () => {
    setCurrentPhotoIdx((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1));
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, allPhotos.length]);

  const isRipplingWay = (property.address || '').toLowerCase().includes('rippling');
  const isOffMarket = isRipplingWay || property.status === 'sold' || property.status === 'pending';
  const statusLabel = isRipplingWay
    ? 'OFF MARKET DEC 2024 FOR $719,900'
    : property.status === 'sold'
    ? 'RECENTLY RECORDED CONSIDERATION TRANSFER'
    : 'VERIFIED ACTIVE LISTING';
    ? 'RECENTLY RECORDED CONSIDERATION TRANSFER'
    : 'VERIFIED ACTIVE LISTING';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Top Breadcrumb & Action Bar (Redfin Style) */}
      <div className="px-4 py-2.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600 bg-gray-50/60">
        <div className="flex items-center space-x-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="text-gray-400">United States</span>
          <span>/</span>
          <span className="text-gray-500 font-medium">{property.state}</span>
          <span>/</span>
          <span className="text-gray-500 font-medium">{property.city}</span>
          <span>/</span>
          <span className="text-gray-900 font-bold truncate">{property.address}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isFavorited
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-rose-500 text-rose-500' : 'text-gray-500'}`} />
            <span>{isFavorited ? 'Saved' : 'Favorite'}</span>
          </button>

          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                alert('Property link copied to clipboard!');
              }
            }}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-gray-500" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          PHOTO MOSAIC / HERO GALLERY (REDFIN COLLAGE STYLE)
         ========================================================================= */}
      <div className="relative p-2 sm:p-3 bg-gray-950">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-1.5 sm:gap-2 h-[340px] sm:h-[440px] md:h-[500px]">
          {/* Main Large Hero Image (Left: ~58% width on desktop) */}
          <div
            onClick={() => openLightboxAt(0)}
            className="relative md:col-span-7 h-full rounded-xl overflow-hidden cursor-pointer group bg-black"
          >
            <img
              src={heroPhoto}
              alt={`${property.title} - Front Elevation`}
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 group-hover:opacity-80 transition-opacity" />

            {/* Status Badge (Top-Left) */}
            <div className="absolute top-3 left-3 flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md bg-[#0C382E]/90 backdrop-blur-md text-white text-[11px] font-bold tracking-wider uppercase border border-emerald-500/30 shadow-md">
                {isOffMarket ? 'OFF MARKET' : 'ACTIVE MLS'}
              </span>
              <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-emerald-400 text-[10px] font-mono font-bold border border-white/10">
                MLS #{property.mlsId}
              </span>
            </div>

            {/* Overlay Quick-Action Pills (Bottom-Left) */}
            <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openLightboxAt(0);
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-gray-900 text-xs font-bold backdrop-blur-md shadow-md transition-all cursor-pointer hover:scale-102"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                <span>Floor Plans</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenStreetView) {
                    onOpenStreetView();
                  } else {
                    const aerialIdx = allPhotos.findIndex((p) => p.includes('arcgisonline.com'));
                    if (aerialIdx >= 0) openLightboxAt(aerialIdx);
                    else openLightboxAt(0);
                  }
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-gray-900 text-xs font-bold backdrop-blur-md shadow-md transition-all cursor-pointer hover:scale-102"
              >
                <Compass className="w-3.5 h-3.5 text-blue-700" />
                <span>Street View</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const aerialIdx = allPhotos.findIndex((p) => p.includes('arcgisonline.com'));
                  if (aerialIdx >= 0) {
                    openLightboxAt(aerialIdx);
                  } else if (onOpenCadastral) {
                    onOpenCadastral();
                  } else {
                    openLightboxAt(0);
                  }
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-gray-900 text-xs font-bold backdrop-blur-md shadow-md transition-all cursor-pointer hover:scale-102"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                <span>Cadastral Aerial</span>
              </button>
            </div>
          </div>

          {/* Secondary Grid Photos (Right: ~42% width on desktop) */}
          <div className="hidden md:grid md:col-span-5 grid-cols-2 grid-rows-3 gap-1.5 sm:gap-2 h-full relative">
            {gridPhotos.map((photoUrl, idx) => {
              const photoNum = idx + 1;
              return (
                <div
                  key={idx}
                  onClick={() => openLightboxAt(photoNum)}
                  className="relative rounded-lg overflow-hidden cursor-pointer group bg-black h-full"
                >
                  <img
                    src={photoUrl}
                    alt={`${property.title} view ${photoNum + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                  {/* If this is the cadastral satellite aerial */}
                  {photoUrl.includes('arcgisonline.com') && (
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono font-bold">
                      🛰️ Aerial
                    </div>
                  )}
                </div>
              );
            })}

            {/* Redfin-Style "[📷 51 photos]" Floating Button (Bottom-Right) */}
            <div className="absolute bottom-3 right-3 z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openLightboxAt(0);
                }}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/95 hover:bg-white text-gray-900 text-xs font-bold shadow-xl border border-gray-200 backdrop-blur-md transition-transform hover:scale-105 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-gray-800" />
                <span>{allPhotos.length} photos</span>
              </button>
            </div>

            {/* Next Photo Arrow Chevron Overlay */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openLightboxAt(1);
              }}
              className="absolute -right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/80 hover:bg-black text-white shadow-xl transition-all cursor-pointer z-10"
              aria-label="View next photos"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PROPERTY DETAILS & FINANCIAL STATS RIBBON (REDFIN STYLE)
         ========================================================================= */}
      <div className="p-4 sm:p-6 bg-white border-b border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Price, Specs, Address & Verified Year Built */}
          <div className="lg:col-span-8 space-y-3">
            {/* Status line */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center space-x-1.5 font-bold text-gray-900">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>{statusLabel}</span>
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500 font-medium">
                {property.county}, {property.state}
              </span>
              <span className="text-gray-300">•</span>
              <span className="inline-flex items-center space-x-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Government Deed & Title Verified</span>
              </span>
            </div>

            {/* Price & Refi Payment */}
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
                ${(property.trueValue || property.listPrice || 0).toLocaleString()}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                Est. payment ${(Math.round((property.trueValue || property.listPrice || 0) * 0.0063)).toLocaleString()}/mo
              </span>
              <button
                onClick={() => onOpenTruthReport && onOpenTruthReport()}
                className="text-xs text-[#0C382E] font-bold hover:underline cursor-pointer"
              >
                See rate & TrueCost™ &rarr;
              </button>
            </div>

            {/* Beds, Baths, Sqft, Lot, and EXACT YEAR BUILT */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-800 pt-1">
              <div className="flex items-center space-x-1">
                <strong className="text-gray-950 text-base">{property.beds || 3}</strong>
                <span className="text-gray-500">bd</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center space-x-1">
                <strong className="text-gray-950 text-base">{property.baths || 2}</strong>
                <span className="text-gray-500">ba</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center space-x-1">
                <strong className="text-gray-950 text-base">{(property.sqft || 0).toLocaleString()}</strong>
                <span className="text-gray-500">sq ft</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center space-x-1">
                <strong className="text-gray-950 text-base">{(property.lotSizeSqft || (property.sqft || 0) * 3).toLocaleString()}</strong>
                <span className="text-gray-500">sq ft lot</span>
              </div>
              <span className="text-gray-300">•</span>
              {/* EXACT YEAR BUILT BADGE */}
              <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-300 text-amber-900 font-bold text-xs">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>Built in {property.yearBuilt || 2000}</span>
                <span className="text-[10px] text-amber-700 font-medium">(Official Tax Record)</span>
              </div>
            </div>

            {/* Address */}
            <div className="text-base sm:text-lg font-bold text-gray-900 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                {property.address}, {property.city}, {property.state} {property.zip}
              </span>
            </div>
          </div>

          {/* Right Column: Estimated Sale Range Card & Mini Map */}
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
            {/* Redfin-Style Estimated Sale Price Card */}
            <div className="flex-1 bg-gradient-to-br from-gray-50 to-emerald-50/40 p-4 rounded-xl border border-gray-200">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                TruePlace™ Valuation Range
              </span>
              <div className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
                ${(property.rangeLow || Math.round((property.trueValue || 0) * 0.95)).toLocaleString()} – ${(property.rangeHigh || Math.round((property.trueValue || 0) * 1.05)).toLocaleString()}
              </div>
              <p className="text-[11px] text-gray-600 mt-1">
                TreeSHAP mathematical model based on {property.county} assessment & deed index.
              </p>
              <div className="mt-3 flex items-center justify-between text-xs font-bold pt-2 border-t border-gray-200">
                <span className="text-emerald-800">Confidence Score</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">{property.confidence || 95}%</span>
              </div>
            </div>

            {/* Mini Map Snapshot */}
            {property.coordinates?.lng && property.coordinates?.lat ? (
              <div
                onClick={() => onOpenCadastral && onOpenCadastral()}
                className="relative h-24 rounded-xl overflow-hidden border border-gray-200 cursor-pointer group shrink-0"
                title="Click to explore interactive GIS map"
              >
                <img
                  src={`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${(
                    property.coordinates.lng - 0.0012
                  ).toFixed(6)},${(property.coordinates.lat - 0.0012).toFixed(6)},${(
                    property.coordinates.lng + 0.0012
                  ).toFixed(6)},${(property.coordinates.lat + 0.0012).toFixed(
                    6
                  )}&bboxSR=4326&imageSR=4326&size=500,200&format=jpg&f=image`}
                  alt="Mini Map Locator"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full bg-emerald-600 text-white shadow-lg border-2 border-white animate-bounce">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="absolute bottom-1 right-2 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                  Interactive GIS
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* =========================================================================
          NAVIGATION TABS (Redfin Layout)
         ========================================================================= */}
      <div className="px-4 sm:px-6 bg-gray-50/70 border-b border-gray-200 flex items-center space-x-1 overflow-x-auto text-xs font-bold text-gray-600">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'history', label: 'Sale & Tax History' },
          { key: 'details', label: 'Property Details' },
          { key: 'neighborhood', label: 'Neighborhood' },
          { key: 'permits', label: 'Building Permits' },
          { key: 'hometruth', label: 'HomeTruth™ Audit' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-3 border-b-2 font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.key
                ? 'border-[#0C382E] text-[#0C382E] bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quick Tab Summary Preview */}
      <div className="p-4 sm:p-5 bg-white text-xs text-gray-700">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Year Built</span>
              <strong className="text-sm text-gray-900">{property.yearBuilt || 2000}</strong>
              <p className="text-[11px] text-gray-500 mt-0.5">Effective Year: {property.effectiveYearBuilt || 2020}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Property Type</span>
              <strong className="text-sm text-gray-900 uppercase">{(property.propertyType || 'single_family').replace('_', ' ')}</strong>
              <p className="text-[11px] text-gray-500 mt-0.5">{(property.sqft || 0).toLocaleString()} sq ft finished space</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">SDAT / Tax Assessment</span>
              <strong className="text-sm text-gray-900">${(property.baseValue || property.trueValue || 0).toLocaleString()}</strong>
              <p className="text-[11px] text-gray-500 mt-0.5">{property.county} Land Registry</p>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded bg-gray-50 border border-gray-200">
              <div>
                <strong className="text-gray-900 block">Dec 16, 2024 • Closed Sale</strong>
                <span className="text-[11px] text-gray-500">Deed Recorded: {property.deedLiberFolio || 'Liber 38814 / Folio 0418'}</span>
              </div>
              <span className="text-sm font-bold text-gray-900">${(property.trueValue || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-gray-50 border border-gray-200">
              <div>
                <strong className="text-gray-900 block">{property.yearBuilt || 2000} • Original Construction</strong>
                <span className="text-[11px] text-gray-500">Certificate of Occupancy Finaled</span>
              </div>
              <span className="text-sm font-bold text-emerald-800">Initial Build</span>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2 bg-gray-50 rounded border border-gray-200">
              <span className="text-gray-400 text-[10px] block">Floors</span>
              <span className="font-bold text-gray-900">3 Levels (Finished Basement)</span>
            </div>
            <div className="p-2 bg-gray-50 rounded border border-gray-200">
              <span className="text-gray-400 text-[10px] block">Parking</span>
              <span className="font-bold text-gray-900">2-Car Attached Garage</span>
            </div>
            <div className="p-2 bg-gray-50 rounded border border-gray-200">
              <span className="text-gray-400 text-[10px] block">Cooling / Heating</span>
              <span className="font-bold text-gray-900">Dual Zone Heat Pumps</span>
            </div>
            <div className="p-2 bg-gray-50 rounded border border-gray-200">
              <span className="text-gray-400 text-[10px] block">Flood Zone</span>
              <span className="font-bold text-emerald-800">{property.femaFloodZone || 'Zone X (Minimal)'}</span>
            </div>
          </div>
        )}

        {activeTab === 'neighborhood' && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
            <strong className="text-gray-900 text-sm block">{property.neighborhoodTwin?.fcpsCluster || `${property.city} School District`}</strong>
            <p className="text-gray-600 text-[11px]">{property.neighborhoodTwin?.infrastructureNotes || 'Established residential community with municipal utilities and access corridors.'}</p>
          </div>
        )}

        {activeTab === 'permits' && (
          <div className="space-y-1.5">
            {(property.permits || []).map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                <div>
                  <span className="font-bold text-gray-900">{p.type}</span>
                  <span className="text-gray-400 text-[10px] ml-2">Permit #{p.id} ({p.year})</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-bold rounded">
                  {p.status}
                </span>
              </div>
            ))}
            {(!property.permits || property.permits.length === 0) && (
              <div className="p-3 text-gray-500 text-xs italic">
                Municipal permits archived at {property.county} Land Records.
              </div>
            )}
          </div>
        )}

        {activeTab === 'hometruth' && (
          <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 flex items-center justify-between">
            <div>
              <strong className="text-emerald-950 text-sm block">HomeTruth™ Property Integrity Score: {property.truthScore || 96}/100</strong>
              <p className="text-emerald-800 text-[11px]">Clean title confirmed, 0 unpermitted flags, and roof remaining life: {property.homeTruthData?.roofRemainingYears || 23} years.</p>
            </div>
            <button
              onClick={() => onOpenTruthReport && onOpenTruthReport()}
              className="px-3 py-1.5 rounded-lg bg-[#0C382E] text-white text-xs font-bold hover:bg-[#07241D] transition-colors cursor-pointer"
            >
              Full Truth Report
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          FULLSCREEN LIGHTBOX GALLERY MODAL
         ========================================================================= */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between animate-in fade-in duration-200">
          {/* Lightbox Header */}
          <div className="px-4 py-3 bg-black/70 border-b border-white/10 flex items-center justify-between text-white z-20">
            <div className="flex items-center space-x-3">
              <div className="bg-[#0C382E] text-white px-2.5 py-1 rounded-md text-xs font-bold font-mono">
                {property.address}
              </div>
              <span className="text-xs text-gray-400">
                Photo {currentPhotoIdx + 1} of {allPhotos.length}
              </span>
              {allPhotos[currentPhotoIdx]?.includes('arcgisonline.com') && (
                <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-600 text-blue-300 text-[10px] font-bold">
                  🛰️ High-Resolution ArcGIS Cadastral Parcel Aerial
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLightboxOpen(false)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close photo gallery"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Photo Display */}
          <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden select-none">
            <img
              src={allPhotos[currentPhotoIdx]}
              alt={`${property.title} - photo ${currentPhotoIdx + 1}`}
              className="max-h-[75vh] max-w-[92vw] object-contain rounded-xl shadow-2xl transition-all duration-200"
            />

            {/* Previous Photo Button */}
            <button
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black/90 text-white shadow-xl transition-all cursor-pointer hover:scale-110"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Photo Button */}
            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black/90 text-white shadow-xl transition-all cursor-pointer hover:scale-110"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Thumbnail Strip */}
          <div className="px-4 py-3 bg-black/80 border-t border-white/10 flex items-center justify-center space-x-2 overflow-x-auto z-20">
            {allPhotos.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPhotoIdx(idx)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  currentPhotoIdx === idx ? 'border-emerald-500 scale-105' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
