"use client";

import React from "react";
import { SlideData } from "@/lib/types";
import { DynamicIcon } from "@/components/common/DynamicIcon";
import { MetricsGrid } from "@/components/widgets/MetricsGrid";
import { ComparisonMatrix } from "@/components/widgets/ComparisonMatrix";
import { ArchitectureDiagram } from "@/components/widgets/ArchitectureDiagram";
import { TimelineFlow } from "@/components/widgets/TimelineFlow";
import { RoiCalculator } from "@/components/widgets/RoiCalculator";
import { Quote, ArrowRight, CornerUpLeft } from "lucide-react";

interface SlideCardProps {
  slide: SlideData;
  isActive: boolean;
  isVisible: boolean;
  onFocus: () => void;
  onNext: () => void;
  onOverview: () => void;
  accentColor?: string;
}

export const SlideCard: React.FC<SlideCardProps> = ({
  slide,
  isActive,
  isVisible,
  onFocus,
  onNext,
  onOverview,
  accentColor = "#3b82f6",
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: slide.x,
        top: slide.y,
        transform: "translate(-50%, -50%)",
        width: 820,
      }}
      className={`transition-all duration-500 pointer-events-auto ${
        isActive
          ? "z-30 scale-100 opacity-100"
          : "z-10 scale-[0.90] opacity-40 hover:opacity-90 hover:scale-[0.94] cursor-pointer"
      }`}
      onClick={(e) => {
        if (!isActive) {
          e.stopPropagation();
          onFocus();
        }
      }}
    >
      <div
        className={`rounded-2xl p-7 md:p-8 backdrop-blur-2xl transition-all duration-500 border shadow-2xl relative overflow-hidden ${
          isActive
            ? "bg-slate-900/95 border-slate-600/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85)] ring-1"
            : "bg-slate-950/80 border-slate-800 hover:border-slate-700 shadow-xl"
        }`}
        style={{
          boxShadow: isActive ? `0 0 50px -10px ${accentColor}33` : undefined,
          borderColor: isActive ? `${accentColor}70` : undefined,
        }}
      >
        {/* Accent top gradient stripe */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 opacity-90"
          style={{
            background: `linear-gradient(90deg, ${accentColor}, #8b5cf6, ${accentColor})`,
          }}
        />

        {/* Slide Header: Kicker & Badges */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border shadow-sm"
              style={{
                backgroundColor: `${accentColor}18`,
                borderColor: `${accentColor}50`,
                color: accentColor,
              }}
            >
              {slide.kicker}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Node #{slide.id.replace("s-", "").toUpperCase()}
            </span>
          </div>

          {/* Quick Actions when active */}
          {isActive && (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOverview();
                }}
                className="text-[11px] text-slate-400 hover:text-white px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 hover:bg-slate-700/80 transition-colors flex items-center gap-1"
                title="Zoom out to macro overview"
              >
                <CornerUpLeft className="w-3 h-3" />
                <span>Overview</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                className="text-[11px] text-white px-2.5 py-1 rounded-md font-medium border transition-colors flex items-center gap-1 shadow-sm"
                style={{
                  backgroundColor: `${accentColor}cc`,
                  borderColor: accentColor,
                }}
                title="Fly to next slide"
              >
                <span>Next</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Master Heading & Subtitle */}
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug mb-2">
          {slide.title}
        </h2>
        <p className="text-sm md:text-base text-slate-300 font-normal leading-relaxed mb-4">
          {slide.subtitle}
        </p>

        {/* Embedded Interactive Widgets */}
        {slide.widgetType === "comparison-matrix" && slide.widgetData?.comparisons && (
          <ComparisonMatrix comparisons={slide.widgetData.comparisons} />
        )}

        {slide.widgetType === "architecture-diagram" && slide.widgetData?.techPillars && (
          <ArchitectureDiagram pillars={slide.widgetData.techPillars} />
        )}

        {slide.widgetType === "timeline-flow" && slide.widgetData?.timeline && (
          <TimelineFlow timeline={slide.widgetData.timeline} />
        )}

        {slide.widgetType === "roi-calculator" && (
          <RoiCalculator defaults={slide.widgetData?.calculatorDefaults} />
        )}

        {/* Metrics Grid */}
        {slide.metrics && slide.metrics.length > 0 && <MetricsGrid metrics={slide.metrics} />}

        {/* Core Bullet Points */}
        {slide.bullets && slide.bullets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
            {slide.bullets.map((b, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="p-1.5 rounded-md"
                    style={{
                      backgroundColor: `${accentColor}20`,
                      color: accentColor,
                    }}
                  >
                    <DynamicIcon name={b.iconName} className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{b.title}</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Executive Callout Quote */}
        {slide.callout && (
          <div
            className="mt-4 p-3.5 rounded-xl border flex items-start gap-3 relative overflow-hidden"
            style={{
              backgroundColor: `${accentColor}10`,
              borderColor: `${accentColor}35`,
            }}
          >
            <Quote
              className="w-5 h-5 shrink-0 mt-0.5"
              style={{ color: accentColor }}
            />
            <div className="text-xs">
              <p className="text-slate-200 italic font-medium leading-relaxed">
                {slide.callout.text}
              </p>
              {(slide.callout.author || slide.callout.badge) && (
                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  {slide.callout.author && <span>— {slide.callout.author}</span>}
                  {slide.callout.badge && (
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {slide.callout.badge}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
