import React, { useState } from 'react';
import {
  Bookmark,
  Trash2,
  Zap,
  Sparkles,
  ArrowRight,
  Scale,
  MapPin,
  Star,
  ExternalLink,
  Plus,
  Compass,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SupplierOffering } from '../../types';
import { TrustBadge } from '../common/TrustBadge';
import { ProductValueIndicator, PaymentReliabilityBadge } from '../common/ProductValueIndicator';
import { SupplierComparisonTable } from './SupplierComparisonTable';

interface ShortlistViewProps {
  onOpenRFQ: (offering: SupplierOffering) => void;
  onOpenDetails: (offering: SupplierOffering) => void;
}

export const ShortlistView: React.FC<ShortlistViewProps> = ({
  onOpenRFQ,
  onOpenDetails,
}) => {
  const {
    shortlistedOfferings,
    removeFromShortlist,
    clearShortlist,
    setActiveTab,
    setProcurementPriority,
    runProcurementAnalysis,
  } = useApp();

  const [showCompareTable, setShowCompareTable] = useState(false);

  const handleLaunchAIAssistant = () => {
    setActiveTab('procurement');
    runProcurementAnalysis('Best Overall');
  };

  if (shortlistedOfferings.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-[#64748B]">
          <Bookmark className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#14283F] mb-2">No Suppliers Shortlisted Yet</h3>
        <p className="text-sm text-[#64748B] mb-6 leading-relaxed">
          While exploring MSME manufacturers in Discover mode, swipe right or click the Shortlist bookmark to save promising suppliers for comparison.
        </p>
        <button
          type="button"
          onClick={() => setActiveTab('discover')}
          className="px-5 py-2.5 bg-[#14283F] text-white text-xs font-semibold rounded-xl hover:bg-[#0A1624] transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Compass className="w-4 h-4 text-amber-400" />
          <span>Start Supplier Discovery</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6">
      {/* Shortlist Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#14283F] tracking-tight">
              Shortlisted Suppliers
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#0F766E] text-white">
              {shortlistedOfferings.length} Saved
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Evaluate, compare, and trigger AI procurement recommendations before issuing formal RFQs.
          </p>
        </div>

        {/* Global Shortlist Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {shortlistedOfferings.length >= 2 && (
            <button
              type="button"
              onClick={() => setShowCompareTable(true)}
              className="px-3.5 py-2 bg-white border border-[#E2E8F0] text-[#14283F] rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Scale className="w-4 h-4 text-[#0F766E]" />
              <span>Compare ({shortlistedOfferings.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleLaunchAIAssistant}
            className="px-4 py-2 bg-[#14283F] hover:bg-[#0A1624] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Procurement Assistant</span>
          </button>

          <button
            type="button"
            onClick={clearShortlist}
            className="p-2 text-[#64748B] hover:text-[#DC2626] rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
            title="Clear all shortlisted suppliers"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of Shortlisted Supplier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {shortlistedOfferings.map((offering) => {
          const { manufacturer, product } = offering;

          return (
            <div
              key={offering.id}
              className="bg-white rounded-2xl border border-[#E2E8F0] card-elevation overflow-hidden flex flex-col justify-between"
            >
              {/* Product Thumbnail & Category Header */}
              <div>
                <div className="relative h-40 bg-slate-900 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Header badges */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-semibold text-[#14283F]">
                    {product.category}
                  </div>

                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-semibold text-[#0F766E]">
                    {product.valueLabel} Value
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <h3 className="font-bold text-sm text-white truncate drop-shadow">
                      {product.name}
                    </h3>
                  </div>
                </div>

                {/* Company & Metrics Body */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-[#14283F] leading-tight">
                        {manufacturer.name}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-[#64748B] mt-0.5">
                        <MapPin className="w-3 h-3 text-[#0F766E]" />
                        <span>{manufacturer.city}, {manufacturer.state}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-[#14283F] shrink-0">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{manufacturer.rating.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Procurement Metrics Pill-free Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-[#F5F7FA] p-2.5 rounded-xl border border-[#E2E8F0] text-center">
                    <div>
                      <span className="text-[10px] text-[#64748B] block uppercase">Unit Price</span>
                      <span className="font-bold text-xs text-[#14283F] font-mono">
                        ₹{product.unitPrice}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block uppercase">Lead Time</span>
                      <span className="font-bold text-xs text-[#0F766E] font-mono">
                        {product.leadTimeDays}d
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block uppercase">MOQ</span>
                      <span className="font-bold text-xs text-[#14283F] font-mono">
                        {product.moq}
                      </span>
                    </div>
                  </div>

                  {/* Trust & Verification info */}
                  <div className="text-[11px] text-[#64748B] space-y-1">
                    <div className="truncate">
                      <span className="font-medium text-[#172033]">GSTIN: </span>
                      <span className="font-mono text-[#64748B]">{manufacturer.verificationStatus.gstNumber}</span>
                    </div>
                    <div className="truncate">
                      <span className="font-medium text-[#172033]">Audited: </span>
                      <span>{manufacturer.verificationStatus.certifications.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 pt-0 border-t border-[#E2E8F0]/80 mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => removeFromShortlist(offering.id)}
                  className="p-2 text-[#64748B] hover:text-[#DC2626] rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onOpenDetails(offering)}
                    className="px-3 py-1.5 border border-[#E2E8F0] text-[#14283F] rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Audit Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenRFQ(offering)}
                    className="px-3.5 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3 h-3 fill-slate-950" />
                    <span>Request Quote</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Matrix Modal */}
      {showCompareTable && (
        <SupplierComparisonTable
          suppliers={shortlistedOfferings}
          onClose={() => setShowCompareTable(false)}
          onRequestQuote={onOpenRFQ}
        />
      )}
    </div>
  );
};
