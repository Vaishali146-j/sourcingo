import React from 'react';
import { Layers, CheckCircle2, Clock, AlertTriangle, Info } from 'lucide-react';

interface CapacityProgressBarProps {
  monthlyCapacity: number;
  remainingCapacity?: number;
  unit?: string;
  moq?: number;
  showDetails?: boolean;
}

export const CapacityProgressBar: React.FC<CapacityProgressBarProps> = ({
  monthlyCapacity,
  remainingCapacity,
  unit = 'units',
  moq,
  showDetails = true,
}) => {
  // If remaining capacity is not explicitly set, derive realistic 25% - 40% availability based on capacity
  const effectiveRemaining =
    remainingCapacity !== undefined
      ? remainingCapacity
      : Math.round(monthlyCapacity * 0.32);

  const bookedCapacity = Math.max(0, monthlyCapacity - effectiveRemaining);
  const remainingPercent = Math.min(100, Math.max(0, Math.round((effectiveRemaining / monthlyCapacity) * 100)));
  const bookedPercent = 100 - remainingPercent;

  // Status classification
  let statusText = 'Optimal Floor Availability';
  let statusColor = 'text-[#0F766E]';
  let dotColor = 'bg-[#0F766E]';
  let barColor = 'bg-[#0F766E]';

  if (remainingPercent <= 15) {
    statusText = 'Constrained Production Slots';
    statusColor = 'text-[#DC2626]';
    dotColor = 'bg-[#DC2626]';
    barColor = 'bg-[#DC2626]';
  } else if (remainingPercent <= 30) {
    statusText = 'Fast-Filling Batch Schedule';
    statusColor = 'text-[#B45309]';
    dotColor = 'bg-[#F59E0B]';
    barColor = 'bg-[#F59E0B]';
  } else {
    statusText = 'Immediate Allocation Available';
    statusColor = 'text-[#0F766E]';
    dotColor = 'bg-[#0F766E]';
    barColor = 'bg-[#0F766E]';
  }

  const cleanUnit = unit.replace('per ', '').trim();

  return (
    <div className="bg-[#F5F7FA] rounded-xl border border-[#E2E8F0] p-4 text-xs">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#14283F] shrink-0" />
          <span className="font-bold text-[#14283F] uppercase tracking-wider text-[11px]">
            Monthly Production Capacity & Availability
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          <span className={`font-semibold ${statusColor}`}>{statusText}</span>
        </div>
      </div>

      {/* Numerical Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
        <div className="bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
          <span className="text-[10px] text-[#64748B] block uppercase font-medium">
            Available Remaining
          </span>
          <div className="text-sm sm:text-base font-bold text-[#0F766E] font-mono leading-tight mt-0.5">
            {effectiveRemaining.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#64748B]">
            {cleanUnit}s ({remainingPercent}% free)
          </span>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
          <span className="text-[10px] text-[#64748B] block uppercase font-medium">
            Current Booked Orders
          </span>
          <div className="text-sm sm:text-base font-bold text-[#14283F] font-mono leading-tight mt-0.5">
            {bookedCapacity.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#64748B]">
            {cleanUnit}s ({bookedPercent}% booked)
          </span>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-[#E2E8F0] col-span-2 sm:col-span-1">
          <span className="text-[10px] text-[#64748B] block uppercase font-medium">
            Total Rated Throughput
          </span>
          <div className="text-sm sm:text-base font-bold text-[#14283F] font-mono leading-tight mt-0.5">
            {monthlyCapacity.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#64748B]">{cleanUnit}s / month</span>
        </div>
      </div>

      {/* Visual Dual-Segment Progress Bar */}
      <div className="space-y-1.5">
        <div
          role="progressbar"
          aria-valuenow={effectiveRemaining}
          aria-valuemin={0}
          aria-valuemax={monthlyCapacity}
          aria-label={`Production capacity: ${effectiveRemaining} ${cleanUnit}s remaining out of ${monthlyCapacity} total monthly capacity`}
          className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex shadow-inner"
        >
          {/* Booked Portion (Dark Navy) */}
          <div
            className="bg-[#14283F] h-full transition-all duration-500 ease-out relative group"
            style={{ width: `${bookedPercent}%` }}
            title={`Booked Orders: ${bookedCapacity.toLocaleString()} ${cleanUnit}s (${bookedPercent}%)`}
          />

          {/* Remaining Available Portion (Industrial Teal or Status Color) */}
          <div
            className={`${barColor} h-full transition-all duration-500 ease-out relative`}
            style={{ width: `${remainingPercent}%` }}
            title={`Available Floor Capacity: ${effectiveRemaining.toLocaleString()} ${cleanUnit}s (${remainingPercent}%)`}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#14283F]" />
            <span>Committed Batches ({bookedPercent}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-xs ${barColor}`} />
            <span className="font-medium text-[#172033]">
              Immediate Open Capacity ({remainingPercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Contextual Buyer Guidance */}
      {showDetails && (
        <div className="mt-3 pt-2.5 border-t border-[#E2E8F0] flex items-start gap-2 text-[11px] text-[#64748B] leading-relaxed">
          <Info className="w-3.5 h-3.5 text-[#0F766E] shrink-0 mt-0.5" />
          <span>
            {moq && moq > effectiveRemaining ? (
              <span className="text-[#DC2626]">
                Notice: Minimum order quantity ({moq.toLocaleString()} {cleanUnit}s) exceeds current month's remaining capacity. Inquire for next cycle batching.
              </span>
            ) : (
              <span>
                Orders within open capacity ({effectiveRemaining.toLocaleString()} {cleanUnit}s) can be scheduled into the line without backlog waiting periods.
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};
