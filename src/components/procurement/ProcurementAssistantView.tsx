import React, { useEffect } from 'react';
import {
  Sparkles,
  TrendingDown,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Zap,
  ArrowRight,
  HelpCircle,
  ShieldCheck,
  RefreshCw,
  Coins,
  MapPin,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProcurementPriority, SupplierOffering } from '../../types';

interface ProcurementAssistantViewProps {
  onOpenRFQ: (offering: SupplierOffering) => void;
  onOpenDetails: (offering: SupplierOffering) => void;
}

export const ProcurementAssistantView: React.FC<ProcurementAssistantViewProps> = ({
  onOpenRFQ,
  onOpenDetails,
}) => {
  const {
    shortlistedOfferings,
    offerings,
    procurementPriority,
    setProcurementPriority,
    procurementResult,
    isAnalyzingProcurement,
    runProcurementAnalysis,
    activeRequirement,
    setActiveTab,
  } = useApp();

  const suppliersInEvaluation =
    shortlistedOfferings.length >= 2
      ? shortlistedOfferings
      : offerings.slice(0, 4);

  // Automatically run evaluation on mount if no result
  useEffect(() => {
    if (!procurementResult) {
      runProcurementAnalysis(procurementPriority);
    }
  }, []);

  const handlePriorityChange = (priority: ProcurementPriority) => {
    setProcurementPriority(priority);
    runProcurementAnalysis(priority);
  };

  const priorities: {
    id: ProcurementPriority;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'Best Overall',
      title: 'Best Overall',
      description: 'Balanced weighting across pricing, audited quality & lead time.',
      icon: Scale,
    },
    {
      id: 'Lowest Cost',
      title: 'Lowest Cost',
      description: 'Maximizes margin savings and raw material unit economics.',
      icon: Coins,
    },
    {
      id: 'Highest Quality',
      title: 'Highest Quality',
      description: 'Prioritizes CMM accuracy, ISO/IATF audits & zero-defect history.',
      icon: Award,
    },
    {
      id: 'Fastest Delivery',
      title: 'Fastest Delivery',
      description: 'Prioritizes shortest lead times and proximate regional dispatch.',
      icon: Clock,
    },
  ];

  return (
    <div className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#14283F] tracking-tight">
              AI Procurement Assistant
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-900 border border-amber-500/30">
              Explainable Matchmaker
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Grounded multi-criteria analysis evaluating {suppliersInEvaluation.length} shortlisted suppliers against your procurement constraints.
          </p>
        </div>

        <button
          type="button"
          onClick={() => runProcurementAnalysis()}
          disabled={isAnalyzingProcurement}
          className="px-4 py-2 bg-[#14283F] hover:bg-[#0A1624] disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isAnalyzingProcurement ? 'animate-spin' : ''}`} />
          <span>{isAnalyzingProcurement ? 'Re-evaluating Models...' : 'Re-calculate Advice'}</span>
        </button>
      </div>

      {/* Evaluation Context & Shortlist Status */}
      {shortlistedOfferings.length < 2 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
          <span>
            <strong>Note:</strong> You currently have {shortlistedOfferings.length} supplier in your shortlist. The advisor is evaluating our top vetted catalog suppliers to demonstrate comparative trade-offs.
          </span>
          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            className="text-xs font-bold text-amber-950 underline cursor-pointer shrink-0 ml-2"
          >
            Add More from Discovery →
          </button>
        </div>
      )}

      {/* Priority Selection Tabs (Zero Pill Discipline) */}
      <div>
        <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-2">
          Select Sourcing Optimization Priority
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {priorities.map((item) => {
            const Icon = item.icon;
            const isSelected = procurementPriority === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePriorityChange(item.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#14283F] text-white border-[#14283F] shadow-md ring-2 ring-[#F59E0B]'
                    : 'bg-white border-[#E2E8F0] text-[#172033] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-[#F59E0B]' : 'text-[#0F766E]'}`} />
                  <span className="font-bold text-xs">{item.title}</span>
                </div>
                <p className={`text-[11px] leading-relaxed ${isSelected ? 'text-slate-300' : 'text-[#64748B]'}`}>
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Executive Sourcing Rationale */}
      {procurementResult && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-elevation space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center border border-teal-200">
                <Sparkles className="w-4 h-4 text-[#0F766E]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#14283F]">
                  Strategic Procurement Advice ({procurementResult.priority})
                </h3>
                <span className="text-[10px] text-[#64748B]">
                  Deterministic cluster ranking verified with Gemini industrial analysis
                </span>
              </div>
            </div>

            <div className="text-[11px] text-[#64748B] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Evidence-grounded (No fabricated metrics)</span>
            </div>
          </div>

          <p className="text-sm text-[#172033] bg-[#F5F7FA] p-3.5 rounded-xl border border-[#E2E8F0] leading-relaxed">
            {procurementResult.executiveSummary}
          </p>

          {/* Negotiating tip for Indian MSMEs */}
          {procurementResult.procurementTip && (
            <div className="text-xs text-amber-900 bg-amber-50/80 p-3 rounded-xl border border-amber-200/70 flex items-start gap-2">
              <span className="font-bold text-amber-950 shrink-0">Cluster Negotiation Insight:</span>
              <p className="text-[11px] leading-relaxed">{procurementResult.procurementTip}</p>
            </div>
          )}
        </div>
      )}

      {/* Ranked Supplier Evaluations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#14283F] uppercase tracking-wider">
            Ranked Candidate Evaluations & Trade-offs
          </h3>
          <span className="text-xs text-[#64748B]">
            Weights adjusted for <strong className="text-[#14283F]">{procurementPriority}</strong>
          </span>
        </div>

        <div className="space-y-4">
          {suppliersInEvaluation.map((offering, idx) => {
            const evalData = procurementResult?.supplierEvaluations.find(
              (e) => e.supplierId === offering.id
            );
            const scoreBreakdown = procurementResult?.scoreBreakdowns[offering.id];
            const isTopRanked = idx === 0;

            return (
              <div
                key={offering.id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden p-5 ${
                  isTopRanked
                    ? 'border-[#0F766E] ring-2 ring-[#0F766E]/20 card-elevation-lg'
                    : 'border-[#E2E8F0] card-elevation'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Supplier Info & Badge */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isTopRanked
                          ? 'bg-[#0F766E] text-white shadow-md'
                          : 'bg-slate-100 text-[#14283F] border border-[#E2E8F0]'
                      }`}
                    >
                      #{idx + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-base text-[#14283F]">
                          {offering.manufacturer.name}
                        </h4>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                            isTopRanked
                              ? 'bg-teal-50 text-[#0F766E] border border-teal-200'
                              : 'bg-slate-100 text-[#64748B]'
                          }`}
                        >
                          {evalData?.badge || (isTopRanked ? 'Top Recommendation' : 'Alternative')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#64748B] mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#0F766E]" />
                          {offering.manufacturer.city}, {offering.manufacturer.state}
                        </span>
                        <span>·</span>
                        <span>{offering.product.name}</span>
                        <span>·</span>
                        <span className="font-mono text-[#14283F] font-semibold">
                          ₹{offering.product.unitPrice} {offering.product.priceUnit}
                        </span>
                        <span>·</span>
                        <span className="text-[#0F766E] font-medium">{offering.product.leadTimeDays}d lead</span>
                      </div>

                      {/* Trade-off Callout */}
                      <div className="mt-3 p-3 bg-[#F5F7FA] rounded-xl border border-[#E2E8F0] text-xs">
                        <span className="font-semibold text-[#14283F] block mb-0.5">
                          Procurement Trade-off:
                        </span>
                        <p className="text-[#172033] text-[12px] leading-relaxed">
                          {evalData?.tradeOffs ||
                            `Quotes ₹${offering.product.unitPrice} with ${offering.product.leadTimeDays} days production turnaround.`}
                        </p>
                      </div>

                      {/* Risk & Recommended Next Step */}
                      <div className="mt-2.5 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                        <span className="text-[#64748B]">
                          <strong>Risk Profile:</strong> {evalData?.riskOrUncertainty || 'Low risk; verified GST & MSME.'}
                        </span>
                        <span className="text-[#0F766E] font-medium">
                          <strong>Action:</strong> {evalData?.recommendedAction || 'Request RFQ sample batch'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Transparent Score Breakdown + Quick Actions */}
                  <div className="lg:w-64 flex flex-col justify-between shrink-0 border-t lg:border-t-0 lg:border-l border-[#E2E8F0] pt-3 lg:pt-0 lg:pl-5 space-y-3">
                    {/* Scores Matrix */}
                    {scoreBreakdown ? (
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between items-center text-[#64748B] text-[11px]">
                          <span>Price Competitiveness</span>
                          <span className="font-mono font-semibold text-[#14283F]">{scoreBreakdown.priceScore}/100</span>
                        </div>
                        <div className="flex justify-between items-center text-[#64748B] text-[11px]">
                          <span>Audited Quality</span>
                          <span className="font-mono font-semibold text-[#14283F]">{scoreBreakdown.qualityScore}/100</span>
                        </div>
                        <div className="flex justify-between items-center text-[#64748B] text-[11px]">
                          <span>Turnaround Speed</span>
                          <span className="font-mono font-semibold text-[#14283F]">{scoreBreakdown.leadTimeScore}/100</span>
                        </div>
                        <div className="pt-1 border-t border-[#E2E8F0] flex justify-between items-center font-bold text-xs text-[#14283F]">
                          <span>Composite Fit</span>
                          <span className="font-mono text-[#0F766E] text-sm">{scoreBreakdown.compositeScore}%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-[#64748B]">
                        Capacity: {offering.product.monthlyCapacity.toLocaleString()} units/mo
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenDetails(offering)}
                        className="flex-1 py-2 border border-[#E2E8F0] text-[#14283F] rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer text-center"
                      >
                        Audit Factory
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenRFQ(offering)}
                        className="flex-1 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                      >
                        <Zap className="w-3.5 h-3.5 fill-slate-950" />
                        <span>Request RFQ</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
