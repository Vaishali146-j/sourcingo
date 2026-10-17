import React, { useState } from 'react';
import {
  Filter,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  MapPin,
  Check,
  ChevronDown,
  X,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SupplierCardStack } from './SupplierCardStack';
import { GeographicReach } from '../../types';

interface DiscoveryViewProps {
  onOpenRequirementModal: () => void;
  onOpenRFQModal: () => void;
  onOpenDetailsModal: () => void;
}

export const DiscoveryView: React.FC<DiscoveryViewProps> = ({
  onOpenRequirementModal,
  onOpenRFQModal,
  onOpenDetailsModal,
}) => {
  const {
    visibleOfferings,
    offerings,
    filters,
    setFilter,
    resetFilters,
    activeRequirement,
    shortlistIds,
    setActiveTab,
  } = useApp();

  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // Sector list
  const sectors = [
    'all',
    'Textiles & Fabrics',
    'CNC Machining & Precision Parts',
    'Pumps & Electric Motors',
    'Brass Hardware & Valves',
    'Pipes & Industrial Tubes',
    'Industrial Fasteners',
    'Electrical Hardware & Terminals',
  ];

  // States list
  const indianStates = [
    'Gujarat',
    'Punjab',
    'Tamil Nadu',
    'Maharashtra',
    'Karnataka',
    'Uttar Pradesh',
    'Rajasthan',
    'Haryana',
    'West Bengal',
  ];

  const hasActiveFilters =
    filters.sector !== 'all' ||
    filters.maxBudget !== null ||
    filters.maxMoq !== null ||
    filters.geographicReach !== 'pan-india' ||
    activeRequirement !== null;

  return (
    <div className="flex-1 flex flex-col max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6">
      {/* Discovery Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#14283F] tracking-tight">
              Discover Suppliers
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#14283F] text-white">
              {visibleOfferings.length} Available
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Swipe right to shortlist verified Indian MSME manufacturers or submit an instant RFQ.
          </p>
        </div>

        {/* Quick Action Badges */}
        <div className="flex items-center gap-2">
          {shortlistIds.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('shortlist')}
              className="px-3 py-2 bg-teal-50 border border-teal-200 text-[#0F766E] rounded-xl text-xs font-semibold hover:bg-teal-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Shortlist ({shortlistIds.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenRequirementModal}
            className="px-3.5 py-2 bg-[#14283F] hover:bg-[#0A1624] text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Requirement Search</span>
          </button>
        </div>
      </div>

      {/* Active Requirement Notice if set */}
      {activeRequirement && (
        <div className="mb-4 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="truncate">
              <span className="font-semibold text-amber-900">Active Requirement: </span>
              <span className="text-amber-950 font-medium">{activeRequirement.interpretationSummary}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => resetFilters()}
            className="text-amber-800 hover:text-amber-950 text-[11px] font-semibold underline shrink-0 cursor-pointer"
          >
            Clear Requirement
          </button>
        </div>
      )}

      {/* Interactive Filter Tabs / Segmented Controls (Zero-Pill Discipline) */}
      <div className="mb-6 space-y-3">
        {/* Sector Tabs Bar */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl shrink-0">
            {sectors.map((sec) => {
              const isSelected = filters.sector === sec;
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setFilter('sector', sec)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-[#14283F] shadow-sm font-semibold'
                      : 'text-[#64748B] hover:text-[#14283F]'
                  }`}
                >
                  {sec === 'all' ? 'All Sectors' : sec}
                </button>
              );
            })}
          </div>

          {/* Precision Filter Drawer Button */}
          <button
            type="button"
            onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
            className={`px-3 py-1.5 border rounded-xl text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
              hasActiveFilters
                ? 'bg-[#14283F] text-white border-[#14283F]'
                : 'bg-white border-[#E2E8F0] text-[#172033] hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </button>
        </div>

        {/* Expandable Precision Filter Drawer */}
        {showFiltersDrawer && (
          <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Geographic Reach */}
            <div>
              <label className="block text-[#64748B] font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Geographic Reach
              </label>
              <select
                value={filters.geographicReach}
                onChange={(e) => setFilter('geographicReach', e.target.value as GeographicReach)}
                className="w-full p-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded-lg"
              >
                <option value="pan-india">Pan-India Reach</option>
                <option value="state">Specific State Cluster</option>
                <option value="city">Local Manufacturing City</option>
              </select>
            </div>

            {/* State Selection */}
            {filters.geographicReach === 'state' && (
              <div>
                <label className="block text-[#64748B] font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Manufacturing State
                </label>
                <select
                  value={filters.selectedStates[0] || ''}
                  onChange={(e) => setFilter('selectedStates', e.target.value ? [e.target.value] : [])}
                  className="w-full p-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded-lg"
                >
                  <option value="">Select State...</option>
                  {indianStates.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Max Budget (₹) */}
            <div>
              <label className="block text-[#64748B] font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Max Budget Ceiling (₹)
              </label>
              <div className="flex gap-1.5 items-center">
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={filters.maxBudget ?? ''}
                  onChange={(e) =>
                    setFilter('maxBudget', e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full p-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded-lg font-mono text-xs"
                />
                {filters.maxBudget !== null && (
                  <button
                    type="button"
                    onClick={() => setFilter('maxBudget', null)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Max MOQ */}
            <div>
              <label className="block text-[#64748B] font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Max Minimum Order (MOQ)
              </label>
              <div className="flex gap-1.5 items-center">
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  value={filters.maxMoq ?? ''}
                  onChange={(e) =>
                    setFilter('maxMoq', e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full p-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded-lg font-mono text-xs"
                />
                {filters.maxMoq !== null && (
                  <button
                    type="button"
                    onClick={() => setFilter('maxMoq', null)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Reset Actions */}
            <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B]">
                Showing {visibleOfferings.length} of {offerings.length} manufacturers
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-[#DC2626] font-medium hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Card Deck Viewport */}
      <div className="flex-1 flex flex-col justify-center">
        <SupplierCardStack
          onOpenDetails={onOpenDetailsModal}
          onOpenRFQ={onOpenRFQModal}
          onResetFilters={resetFilters}
        />
      </div>
    </div>
  );
};
