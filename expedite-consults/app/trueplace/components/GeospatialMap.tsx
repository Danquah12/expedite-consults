'use client';

import React, { useState } from 'react';
import { Property } from '../mockData';
import { Layers, ShieldAlert, GraduationCap, Flame, Eye, MapPin, Compass, MousePointer } from 'lucide-react';

interface GeospatialMapProps {
  properties: Property[];
  selectedProperty: Property;
  onSelectProperty: (prop: Property) => void;
}

export const GeospatialMap: React.FC<GeospatialMapProps> = ({
  properties,
  selectedProperty,
  onSelectProperty,
}) => {
  // Layer toggles
  const [showFloodZones, setShowFloodZones] = useState(true);
  const [showSchoolDistricts, setShowSchoolDistricts] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
  const [customPolygonDrawn, setCustomPolygonDrawn] = useState(false);

  return (
    <div className="bg-white border border-[#D5C7B2] rounded-xl shadow-sm overflow-hidden flex flex-col h-[650px]">
      {/* Map Control Header */}
      <div className="bg-[#004D40] text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-[#00382E]">
        <div className="flex items-center space-x-2">
          <Compass className="w-5 h-5 text-[#E07A5F]" />
          <div>
            <h3 className="text-sm font-bold tracking-tight">Geospatial Environmental & Property Discovery</h3>
            <p className="text-[11px] text-gray-300">Mapbox GL Vector Tiles + PostGIS Spatial Boundaries</p>
          </div>
        </div>

        {/* Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowFloodZones(!showFloodZones)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold border transition-colors cursor-pointer ${
              showFloodZones
                ? 'bg-[#E07A5F] text-white border-[#E07A5F]'
                : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/15'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Flood Risk Zones</span>
          </button>

          <button
            onClick={() => setShowSchoolDistricts(!showSchoolDistricts)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold border transition-colors cursor-pointer ${
              showSchoolDistricts
                ? 'bg-[#2A9D8F] text-white border-[#2A9D8F]'
                : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/15'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>School Boundaries</span>
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold border transition-colors cursor-pointer ${
              showHeatmap
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/15'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Price Heatmap</span>
          </button>

          <button
            onClick={() => {
              setIsDrawingPolygon(!isDrawingPolygon);
              if (!isDrawingPolygon) setCustomPolygonDrawn(true);
            }}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold border transition-colors cursor-pointer ${
              customPolygonDrawn
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/15'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>{customPolygonDrawn ? 'Custom Boundary Active' : 'Draw Boundary'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Map Visual Surface */}
      <div className="relative flex-1 bg-[#EAE8E3] overflow-hidden flex items-center justify-center select-none">
        {/* Synthetic Map Background Grid & Street Lines */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle street grid */}
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#D7D3CA" strokeWidth="1" />
            </pattern>
            <pattern id="floodHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#E76F51" strokeWidth="2" strokeOpacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="#EFECE6" />
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Major Roads / Arterials */}
          <path d="M 0,220 Q 300,200 600,260 T 1200,210" fill="none" stroke="#FAF8F5" strokeWidth="16" />
          <path d="M 0,220 Q 300,200 600,260 T 1200,210" fill="none" stroke="#D3CEBF" strokeWidth="8" />

          <path d="M 380,0 Q 420,300 390,650" fill="none" stroke="#FAF8F5" strokeWidth="14" />
          <path d="M 380,0 Q 420,300 390,650" fill="none" stroke="#D3CEBF" strokeWidth="7" />

          {/* Park / Green Reserve */}
          <path d="M 120,80 Q 220,60 260,160 T 160,260 Z" fill="#D5E5D5" stroke="#B8D0B8" strokeWidth="2" />
          <text x="160" y="170" fill="#406B40" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
            Travis Heights Greenbelt
          </text>

          {/* Waterway / River (Colorado River / Lady Bird Lake) */}
          <path d="M 0,60 Q 450,110 850,70 T 1400,90" fill="none" stroke="#C2D8E8" strokeWidth="48" />
          <path d="M 0,60 Q 450,110 850,70 T 1400,90" fill="none" stroke="#A7C6DC" strokeWidth="32" />

          {/* Environmental Layer: Flood Zone Overlays */}
          {showFloodZones && (
            <g>
              <path
                d="M 10,60 Q 450,120 750,90 T 1200,100 L 1200,150 Q 750,160 450,180 T 10,130 Z"
                fill="url(#floodHatch)"
                stroke="#E76F51"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
              <rect x="25" y="100" width="160" height="24" rx="4" fill="#E76F51" fillOpacity="0.85" />
              <text x="35" y="116" fill="white" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                100-Yr Flood Plain (Zone AE)
              </text>
            </g>
          )}

          {/* Environmental Layer: School Attendance Boundary */}
          {showSchoolDistricts && (
            <g>
              <path
                d="M 280,180 L 850,220 L 780,550 L 260,480 Z"
                fill="#2A9D8F"
                fillOpacity="0.08"
                stroke="#2A9D8F"
                strokeWidth="2"
                strokeDasharray="6 3"
              />
              <rect x="300" y="200" width="220" height="24" rx="4" fill="#2A9D8F" fillOpacity="0.9" />
              <text x="310" y="216" fill="white" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                Travis Heights Elementary Boundary (9/10)
              </text>
            </g>
          )}

          {/* Price Heatmap Gradient Overlay */}
          {showHeatmap && (
            <g>
              <circle cx="580" cy="360" r="140" fill="#E07A5F" fillOpacity="0.25" />
              <circle cx="580" cy="360" r="90" fill="#E76F51" fillOpacity="0.3" />
              <circle cx="580" cy="360" r="45" fill="#9E2A2B" fillOpacity="0.35" />
            </g>
          )}

          {/* Custom Drawn Polygon Boundary */}
          {customPolygonDrawn && (
            <g>
              <polygon
                points="420,260 780,270 750,470 410,440"
                fill="#4F46E5"
                fillOpacity="0.15"
                stroke="#4F46E5"
                strokeWidth="2.5"
              />
              <circle cx="420" cy="260" r="4" fill="#4F46E5" />
              <circle cx="780" cy="270" r="4" fill="#4F46E5" />
              <circle cx="750" cy="470" r="4" fill="#4F46E5" />
              <circle cx="410" cy="440" r="4" fill="#4F46E5" />
              <rect x="430" y="280" width="160" height="20" rx="3" fill="#4F46E5" />
              <text x="440" y="294" fill="white" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                ST_Contains Active Filter
              </text>
            </g>
          )}
        </svg>

        {/* Render Dynamic Property Pins for all real properties */}
        <div className="absolute inset-0 pointer-events-none">
          {properties.map((prop) => {
            // Coordinate normalization for U.S. national map projection
            // Lat range ~25 (Miami) to 48 (Seattle), Lng range ~-124 (West Coast) to -73 (East Coast)
            const minLat = 24.5;
            const maxLat = 49.0;
            const minLng = -124.5;
            const maxLng = -71.0;

            const leftPct = Math.max(6, Math.min(94, ((prop.coordinates.lng - minLng) / (maxLng - minLng)) * 88 + 6));
            const topPct = Math.max(8, Math.min(92, 90 - ((prop.coordinates.lat - minLat) / (maxLat - minLat)) * 82));

            const isSelected = selectedProperty.id === prop.id;
            const formattedPrice = prop.trueValue >= 1000000
              ? `$${(prop.trueValue / 1000000).toFixed(1)}M`
              : `$${Math.round(prop.trueValue / 1000)}k`;

            return (
              <div
                key={prop.id}
                onClick={() => onSelectProperty(prop)}
                style={{ top: `${topPct}%`, left: `${leftPct}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
              >
                <div
                  className={`relative flex flex-col items-center transition-all duration-300 ${
                    isSelected ? 'scale-120 z-40' : 'hover:scale-110 z-20 opacity-90 hover:opacity-100'
                  }`}
                >
                  <div
                    className={`text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg border-2 flex items-center space-x-1 whitespace-nowrap transition-colors ${
                      isSelected
                        ? 'bg-[#0C382E] text-white border-emerald-400 ring-4 ring-emerald-400/30'
                        : 'bg-white text-gray-900 border-gray-300 group-hover:border-[#0C382E]'
                    }`}
                  >
                    <span>{formattedPrice}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-emerald-400 animate-ping' : 'bg-emerald-600'
                      }`}
                    />
                  </div>
                  <div
                    className={`w-2 h-2 rotate-45 -mt-1 ${
                      isSelected ? 'bg-[#0C382E]' : 'bg-white border-r border-b border-gray-300'
                    }`}
                  />

                  {/* Enhanced Tooltip Card on Active Selection */}
                  {isSelected && (
                    <div className="absolute -bottom-24 bg-white/95 backdrop-blur-md p-2.5 rounded-xl shadow-2xl border border-gray-200 text-gray-900 text-xs whitespace-nowrap z-50 flex items-center space-x-3 pointer-events-auto">
                      <img
                        src={prop.photoUrl}
                        alt={prop.address}
                        className="w-14 h-14 object-cover rounded-lg border border-gray-200 shrink-0"
                      />
                      <div>
                        <div className="font-extrabold text-gray-900 leading-tight">{prop.address}</div>
                        <div className="text-[11px] text-gray-500 font-medium">
                          {prop.city}, {prop.state} {prop.zip} • {prop.beds}bd/{prop.baths}ba
                        </div>
                        <div className="text-[11px] font-black text-[#0C382E] mt-0.5 flex items-center space-x-2">
                          <span>TrueValue: ${(prop.trueValue).toLocaleString()}</span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                            Truth Score: {prop.truthScore}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs p-3.5 rounded-lg border border-gray-300 shadow-md text-xs text-gray-800 max-w-xs pointer-events-auto space-y-1.5">
          <div className="font-bold text-[#004D40] uppercase tracking-wider text-[10px] pb-1 border-b border-gray-200">
            Geospatial Environmental Legend
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-[#E76F51] opacity-70 border border-[#E76F51]"></span>
            <span className="text-[11px]">100-Year Flood Plain (Zone AE)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-[#2A9D8F] opacity-70 border border-[#2A9D8F]"></span>
            <span className="text-[11px]">NCES Elementary Boundary (Austin ISD)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#004D40]"></span>
            <span className="text-[11px]">Verified Active Property Listing</span>
          </div>
        </div>
      </div>
    </div>
  );
};
