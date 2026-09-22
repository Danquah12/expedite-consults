'use client';

import React, { useState } from 'react';
import { Property, getEnrichedTrueCost } from '../mockData';
import {
  DollarSign,
  AlertCircle,
  TrendingUp,
  Percent,
  Calculator,
  ShieldCheck,
  Building2,
  Car,
  Wrench,
  Zap,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

interface TrueCostCalculatorProps {
  property: Property;
}

export const TrueCostCalculator: React.FC<TrueCostCalculatorProps> = ({ property }) => {
  const [downPaymentPct, setDownPaymentPct] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(6.625);
  const [includeCommuteTolls, setIncludeCommuteTolls] = useState<boolean>(true);

  const enriched = getEnrichedTrueCost(property);

  // Recalculate dynamic monthly values based on user sliders
  const loanAmount = property.listPrice * (1 - downPaymentPct / 100);
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = 360;
  const dynamicPI = Math.round(
    (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)
  );

  const dynamicCommute = includeCommuteTolls ? enriched.commuteCost : 0;
  const dynamicTotal =
    dynamicPI +
    enriched.propertyTax +
    enriched.hazardInsurance +
    enriched.floodInsurance +
    enriched.hoaFee +
    enriched.utilities +
    enriched.maintenanceReserve +
    dynamicCommute;

  const hiddenDelta = dynamicTotal - dynamicPI;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#0C382E] flex items-center space-x-1.5">
            <Calculator className="w-3.5 h-3.5 text-emerald-600" />
            <span>TrueCost™ Reality Calculator</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight mt-0.5">
            Beyond the Mortgage: True Monthly Cost
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Legacy sites only show Principal & Interest. TruePlace reveals the complete monthly cash commitment.
          </p>
        </div>

        {/* Shock Badge */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 sm:p-3 flex items-center space-x-2.5 self-start sm:self-auto">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-left">
            <span className="text-[10px] text-amber-700 font-bold block uppercase tracking-wider">
              Hidden Cost Delta
            </span>
            <span className="text-xs font-black text-amber-900">
              +${hiddenDelta.toLocaleString()}/mo above advertised P&I
            </span>
          </div>
        </div>
      </div>

      {/* Comparison Visual Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Advertised Portals View */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-500">Advertised Portal Estimate</span>
              <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-mono">
                Zillow / Redfin P&I
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-700 tracking-tight">
              ${dynamicPI.toLocaleString()}
              <span className="text-xs font-normal text-gray-500">/mo</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Leaves out county property taxes, insurance escrows, HOA dues, routine maintenance, and commuting tolls.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center text-[11px] text-gray-400">
            <span>Standard 30-year fixed amortization</span>
          </div>
        </div>

        {/* TruePlace Reality Cost */}
        <div className="rounded-xl border-2 border-[#0C382E] bg-emerald-50/40 p-4 relative flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#0C382E]">TrueCost™ Actual Monthly</span>
              <span className="text-[10px] bg-[#0C382E] text-white px-2 py-0.5 rounded font-mono font-bold">
                TRUE CASH OUTFLOW
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0C382E] tracking-tight">
              ${dynamicTotal.toLocaleString()}
              <span className="text-xs font-medium text-emerald-800">/mo</span>
            </div>
            <p className="text-[11px] text-emerald-900 mt-1">
              All-inclusive fiduciary projection calibrated to Northern Virginia tax millage & living expenses.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-emerald-200 flex items-center space-x-1.5 text-[11px] text-[#0C382E] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero surprise escrow shortages after closing</span>
          </div>
        </div>
      </div>

      {/* Interactive Controls / Sliders */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
          Adjust Your Financing Scenario
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Down Payment % */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-gray-700">
              <span>Down Payment</span>
              <span className="font-bold text-[#0C382E]">{downPaymentPct}% (${((property.listPrice * downPaymentPct) / 100).toLocaleString()})</span>
            </div>
            <input
              type="range"
              min={3}
              max={50}
              step={1}
              value={downPaymentPct}
              onChange={(e) => setDownPaymentPct(Number(e.target.value))}
              className="w-full accent-[#0C382E] cursor-pointer"
            />
          </div>

          {/* Interest Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-gray-700">
              <span>Mortgage Rate</span>
              <span className="font-bold text-[#0C382E]">{interestRate.toFixed(2)}%</span>
            </div>
            <input
              type="range"
              min={5.0}
              max={8.5}
              step={0.125}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-[#0C382E] cursor-pointer"
            />
          </div>

          {/* Commute Toggle */}
          <div className="flex items-center justify-between sm:justify-center space-x-2 pt-2 sm:pt-4">
            <span className="text-xs font-medium text-gray-700">Include Commute / Tolls</span>
            <input
              type="checkbox"
              checked={includeCommuteTolls}
              onChange={(e) => setIncludeCommuteTolls(e.target.checked)}
              className="w-4 h-4 accent-[#0C382E] rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Itemized 8-Point Reality Breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider">
          Itemized Monthly Cost Stack (Northern Virginia Calibrated)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Principal & Interest */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-1.5 text-xs text-gray-500 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-gray-700" />
              <span>Mortgage (P&I)</span>
            </div>
            <div className="text-lg font-bold text-gray-900">${dynamicPI.toLocaleString()}/mo</div>
            <span className="text-[10px] text-gray-400">30-Yr Fixed @ {interestRate}%</span>
          </div>

          {/* 2. County Property Taxes */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-1.5 text-xs text-gray-500 mb-1">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{property.county} Taxes</span>
            </div>
            <div className="text-lg font-bold text-gray-900">${enriched.propertyTax.toLocaleString()}/mo</div>
            <span className="text-[10px] text-gray-400">County millage assessment</span>
          </div>

          {/* 3. Hazard & Storm Insurance */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-1.5 text-xs text-gray-500 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hazard / Fire Ins.</span>
            </div>
            <div className="text-lg font-bold text-gray-900">${enriched.hazardInsurance.toLocaleString()}/mo</div>
            <span className="text-[10px] text-gray-400">Escrow premium</span>
          </div>

          {/* 4. HOA / Condo Dues */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-1.5 text-xs text-gray-500 mb-1">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>HOA / Civic Dues</span>
            </div>
            <div className="text-lg font-bold text-gray-900">${enriched.hoaFee.toLocaleString()}/mo</div>
            <span className="text-[10px] text-gray-400">Common grounds / trash</span>
          </div>

          {/* 5. Estimated Utilities */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-1.5 text-xs text-gray-500 mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Utilities & Fiber</span>
            </div>
            <div className="text-lg font-bold text-gray-900">${enriched.utilities.toLocaleString()}/mo</div>
            <span className="text-[10px] text-gray-400">Electric, gas, water, gigabit</span>
          </div>

          {/* 6. Routine Maintenance Reserve */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-1.5 text-xs text-gray-500 mb-1">
              <Wrench className="w-3.5 h-3.5 text-teal-600" />
              <span>Maintenance Reserve</span>
            </div>
            <div className="text-lg font-bold text-gray-900">${enriched.maintenanceReserve.toLocaleString()}/mo</div>
            <span className="text-[10px] text-gray-400">Standard $1/sqft/yr sinking fund</span>
          </div>

          {/* 7. Commuter Transit / Tolls */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-1.5 text-xs text-gray-500 mb-1">
              <Car className="w-3.5 h-3.5 text-rose-600" />
              <span>Commuting / Tolls</span>
            </div>
            <div className="text-lg font-bold text-gray-900">${dynamicCommute.toLocaleString()}/mo</div>
            <span className="text-[10px] text-gray-400">
              {property.neighborhoodTwin.metroDistanceMi < 1.0 ? 'Metro SmartTrip fare' : 'I-66 / Dulles Tolls'}
            </span>
          </div>

          {/* 8. Flood Surcharge */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-1.5 text-xs text-gray-500 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
              <span>FEMA Flood Ins.</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {enriched.floodInsurance > 0 ? `$${enriched.floodInsurance}/mo` : '$0 (Zone X)'}
            </div>
            <span className="text-[10px] text-gray-400">Based on county hydrology</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrueCostCalculator;
