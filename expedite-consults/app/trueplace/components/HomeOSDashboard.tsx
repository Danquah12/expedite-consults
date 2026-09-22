'use client';

import React, { useState } from 'react';
import { Property, getEnrichedHomeOS, HomeOSAppliance } from '../mockData';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  TrendingDown,
  ShieldAlert,
  Flame,
  Zap,
  Droplets,
  DollarSign,
  PlusCircle,
  Camera,
  Check,
  Sparkles,
} from 'lucide-react';

interface HomeOSDashboardProps {
  property: Property;
}

export const HomeOSDashboard: React.FC<HomeOSDashboardProps> = ({ property }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const { appliances, maintenanceTasks } = getEnrichedHomeOS(property);

  const toggleTask = (id: string) => {
    setCompletedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredAppliances =
    activeCategory === 'All'
      ? appliances
      : appliances.filter((a) => a.category === activeCategory);

  // Total TrueValue penalty if aging equipment is deferred
  const totalDeferredPenalty = appliances.reduce(
    (acc, item) => acc + Math.abs(item.impactOnTrueValue),
    0
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#0C382E] flex items-center space-x-1.5">
            <Wrench className="w-3.5 h-3.5 text-emerald-600" />
            <span>Home Ownership Operating System</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight mt-0.5">
            HomeOS™ Lifecycle & Maintenance Advisor
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Preserve your home equity. Real-time tracking of mechanical lifecycles, preventative tasks, and TrueValue impact.
          </p>
        </div>

        {/* Equity Risk Alert Banner */}
        {totalDeferredPenalty > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 sm:p-3 flex items-center space-x-2.5 self-start sm:self-auto">
            <TrendingDown className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="text-[10px] text-rose-700 font-bold block uppercase tracking-wider">
                Deferred Maintenance Equity Risk
              </span>
              <span className="text-xs font-black text-rose-950">
                -${totalDeferredPenalty.toLocaleString()} TrueValue impact if unaddressed
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            Monitored Systems
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#0C382E]">
            {appliances.length} Assets
          </span>
          <span className="text-[10px] text-emerald-700 block mt-0.5">Fairfax/Arlington Permit Ingested</span>
        </div>

        <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-3">
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
            Preventative Tasks
          </span>
          <span className="text-xl sm:text-2xl font-black text-blue-950">
            {maintenanceTasks.length} Upcoming
          </span>
          <span className="text-[10px] text-blue-700 block mt-0.5">Seasonal schedules active</span>
        </div>

        <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
            Replacement Due
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-950">
            {appliances.filter((a) => a.remainingLifeYears <= 3).length} Systems
          </span>
          <span className="text-[10px] text-amber-700 block mt-0.5">Within 36 months</span>
        </div>

        <div className="bg-purple-50/50 border border-purple-200 rounded-xl p-3">
          <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
            Quick Ingest
          </span>
          <button className="flex items-center space-x-1 text-xs font-bold text-purple-900 hover:text-purple-950 cursor-pointer mt-1">
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Plate OCR</span>
          </button>
          <span className="text-[10px] text-purple-700 block mt-0.5">Auto-parse serial & year</span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
        {['All', 'HVAC', 'Roof', 'Water', 'Electrical'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === cat
                ? 'bg-[#0C382E] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Major Appliances & Systems Grid */}
      <div className="space-y-4">
        <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider">
          Critical Mechanical Assets & Lifecycles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAppliances.map((item) => {
            const isCritical = item.remainingLifeYears <= 2;
            const isWarning = item.remainingLifeYears <= 5 && !isCritical;

            return (
              <div
                key={item.id}
                className={`rounded-xl border p-4 transition-all flex flex-col justify-between ${
                  isCritical
                    ? 'border-rose-300 bg-rose-50/20 shadow-xs'
                    : isWarning
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-gray-900">{item.name}</span>
                        {item.permitVerified && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-semibold">
                            PERMIT VERIFIED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                        {item.brand} • {item.model}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isCritical ? 'Replace Soon' : isWarning ? 'Service Window' : 'Optimal'}
                    </span>
                  </div>

                  {/* Lifespan Progress Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[11px] text-gray-600">
                      <span>Installed {item.installedYear} ({2026 - item.installedYear} yrs in service)</span>
                      <span className="font-bold text-gray-900">
                        {item.remainingLifeYears} yrs remaining
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.max(8, Math.min(100, (item.remainingLifeYears / item.expectedLifeYears) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Recommendation Note */}
                  <p className="text-xs text-gray-700 mt-2.5 bg-gray-50 p-2 rounded-lg border border-gray-150">
                    💡 {item.recommendation}
                  </p>
                </div>

                {/* Footer with Cost & TrueValue Impact */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Est. Replacement Cost</span>
                    <span className="font-bold text-gray-900">
                      ${item.replacementCostLow.toLocaleString()} - ${item.replacementCostHigh.toLocaleString()}
                    </span>
                  </div>

                  {item.impactOnTrueValue < 0 && (
                    <div className="text-right">
                      <span className="text-[10px] text-rose-600 font-bold block">TrueValue Impact</span>
                      <span className="font-black text-rose-700">
                        -${Math.abs(item.impactOnTrueValue).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preventative Maintenance Schedule Checklist */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-[#0C382E]" />
            <span>Seasonal Preventative Maintenance Checklist</span>
          </h3>
          <span className="text-xs text-gray-500">
            {Object.values(completedTasks).filter(Boolean).length} of {maintenanceTasks.length} Completed
          </span>
        </div>

        <div className="space-y-2">
          {maintenanceTasks.map((task) => {
            const isDone = !!completedTasks[task.id];
            return (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  isDone
                    ? 'bg-emerald-50/40 border-emerald-300 text-gray-500'
                    : 'bg-white border-gray-200 hover:border-gray-300 text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                      isDone
                        ? 'bg-[#0C382E] border-[#0C382E] text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-bold ${isDone ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </span>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-medium">
                        {task.season} • {task.frequency}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">{task.description}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-gray-400 block">Due Date</span>
                  <span className="text-xs font-semibold text-gray-700">{task.dueDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomeOSDashboard;
