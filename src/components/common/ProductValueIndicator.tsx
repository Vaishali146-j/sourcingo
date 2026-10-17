import React, { useState } from 'react';
import { Sparkles, HelpCircle, Info, Check, AlertTriangle } from 'lucide-react';
import { ValueLabel, PaymentReliability } from '../../types';

interface ProductValueIndicatorProps {
  label: ValueLabel;
  explanation: string;
}

export const ProductValueIndicator: React.FC<ProductValueIndicatorProps> = ({
  label,
  explanation,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getStyle = () => {
    switch (label) {
      case 'Best':
        return {
          textColor: 'text-[#0F766E]',
          dotColor: 'bg-[#0F766E]',
          title: 'Best Industrial Value',
        };
      case 'Good':
        return {
          textColor: 'text-[#14283F]',
          dotColor: 'bg-[#14283F]',
          title: 'Good Quality & Pricing',
        };
      case 'OK':
        return {
          textColor: 'text-[#B45309]',
          dotColor: 'bg-[#B45309]',
          title: 'Standard Market Parity',
        };
      default:
        return {
          textColor: 'text-[#64748B]',
          dotColor: 'bg-[#94A3B8]',
          title: 'Insufficient Data',
        };
    }
  };

  const style = getStyle();

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="inline-flex items-center gap-1.5 text-xs focus:outline-none cursor-pointer group"
        aria-label={`Product value rating: ${label}. Click for explanation.`}
      >
        <span className={`w-2 h-2 rounded-full ${style.dotColor}`} />
        <span className={`font-semibold ${style.textColor}`}>{label} Value</span>
        <HelpCircle className="w-3 h-3 text-[#94A3B8] group-hover:text-[#64748B] transition-colors" />
      </button>

      {showTooltip && (
        <div className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-[#14283F] text-white text-xs rounded-xl shadow-xl z-50 border border-slate-700 pointer-events-none">
          <div className="flex items-center gap-1.5 font-semibold text-amber-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{style.title}</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">{explanation}</p>
          <div className="mt-2 pt-2 border-t border-slate-700/60 text-[10px] text-slate-400">
            Calculated via cluster pricing parity, lead time feasibility & verified audit reports.
          </div>
        </div>
      )}
    </div>
  );
};

interface PaymentReliabilityBadgeProps {
  paymentReliability: PaymentReliability;
}

export const PaymentReliabilityBadge: React.FC<PaymentReliabilityBadgeProps> = ({
  paymentReliability,
}) => {
  const [showInfo, setShowInfo] = useState(false);

  if (paymentReliability.evidenceStatus === 'Insufficient History') {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-[#64748B]">
        <Info className="w-3.5 h-3.5 text-[#94A3B8]" />
        <span className="font-medium text-[#172033]">Payment Record</span>
        <span className="text-[#94A3B8]" aria-hidden="true">·</span>
        <span className="italic">Insufficient History</span>
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <div
        onMouseEnter={() => setShowInfo(true)}
        onMouseLeave={() => setShowInfo(false)}
        className="inline-flex items-center gap-1.5 text-xs cursor-pointer group"
      >
        <span className="w-2 h-2 rounded-full bg-[#15803D]" />
        <span className="font-medium text-[#172033]">Payment Reliability</span>
        <span className="text-[#94A3B8]" aria-hidden="true">·</span>
        <span className="font-semibold text-[#15803D]">{paymentReliability.onTimePaymentRate}% on-time</span>
        <span className="text-[#94A3B8]" aria-hidden="true">·</span>
        <span className="text-[#64748B] text-[11px]">{paymentReliability.completedTransactions} settled orders</span>
      </div>

      {showInfo && (
        <div className="absolute left-0 bottom-full mb-2 w-64 p-2.5 bg-[#14283F] text-white text-xs rounded-xl shadow-xl z-50 border border-slate-700 pointer-events-none">
          <div className="font-semibold text-slate-100 mb-1 flex items-center justify-between">
            <span>Marketplace Settlement Metric</span>
            <span className="text-emerald-400 font-mono text-[11px]">{paymentReliability.score}/100</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Documented on-time milestone releases across {paymentReliability.completedTransactions} verified commercial orders with average payout cycle of {paymentReliability.averageDaysToPay} days.
          </p>
        </div>
      )}
    </div>
  );
};
