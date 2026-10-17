import React, { useState } from 'react';
import {
  MapPin,
  Star,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Package,
  Calendar,
  Layers,
  Truck,
  FileCheck,
  Info,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import { SupplierOffering } from '../../types';
import { TrustBadge, DemoDataDisclaimer } from '../common/TrustBadge';
import { ProductValueIndicator, PaymentReliabilityBadge } from '../common/ProductValueIndicator';

interface SupplierCardProps {
  offering: SupplierOffering;
  onViewDetails?: () => void;
  onRequestQuote?: () => void;
  isDraggable?: boolean;
}

export const SupplierCard: React.FC<SupplierCardProps> = ({
  offering,
  onViewDetails,
  onRequestQuote,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { manufacturer, product } = offering;

  const images = [
    product.imageUrl,
    ...(product.galleryUrls || []),
  ].filter(Boolean);

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] card-elevation-lg overflow-hidden flex flex-col h-full max-h-[82vh] md:max-h-[720px] select-none text-[#172033]">
      {/* Top Header: Company Identity & Location */}
      <div className="px-5 py-4 border-b border-[#E2E8F0]/80 bg-white flex items-start justify-between gap-3 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-base sm:text-lg text-[#14283F] tracking-tight truncate max-w-[280px] sm:max-w-md">
              {manufacturer.name}
            </h3>
            {/* Clean metadata text */}
            <span className="text-xs text-[#64748B] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#0F766E] shrink-0" />
              <span>{manufacturer.city}, {manufacturer.state}</span>
              <span className="text-[#94A3B8]" aria-hidden="true">·</span>
              <span className="text-[11px] font-mono text-[#64748B]">~{offering.distanceEstimateKm} km</span>
            </span>
          </div>

          {/* Verification evidence text */}
          <div className="mt-1 flex items-center gap-2 flex-wrap text-xs text-[#64748B]">
            {manufacturer.verificationStatus.isGstVerified && (
              <TrustBadge
                label="GST"
                code={manufacturer.verificationStatus.gstNumber}
                evidence={manufacturer.verificationStatus.gstEvidence}
              />
            )}
            {manufacturer.verificationStatus.isIsoCertified && (
              <>
                <span className="text-[#94A3B8]" aria-hidden="true">·</span>
                <TrustBadge
                  label={manufacturer.verificationStatus.certifications[0] || 'ISO 9001'}
                  evidence={manufacturer.verificationStatus.certificationEvidence}
                />
              </>
            )}
          </div>
        </div>

        {/* Rating and Profile link */}
        <div className="flex flex-col items-end shrink-0">
          <div className="flex items-center gap-1 text-xs font-semibold text-[#14283F]">
            <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
            <span>{manufacturer.rating.toFixed(2)}</span>
            <span className="text-[11px] text-[#64748B] font-normal">({manufacturer.ratingCount})</span>
          </div>
          <button
            type="button"
            onClick={onViewDetails}
            className="mt-1 text-[11px] font-medium text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer"
          >
            Factory Audit
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Scrollable Center: Product Presentation & Key Procurement Metrics */}
      <div className="overflow-y-auto flex-1 flex flex-col">
        {/* Large Visual Industrial Product Photo */}
        <div className="relative h-48 sm:h-56 bg-slate-900 shrink-0 overflow-hidden group">
          <img
            src={images[activeImageIndex] || product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Image Overlay: Product Title & Category */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-300 drop-shadow">
              {product.category}
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white drop-shadow leading-snug truncate">
              {product.name}
            </h4>
          </div>

          {/* Gallery navigation dots if multiple photos */}
          {images.length > 1 && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeImageIndex === idx ? 'bg-amber-400 w-4' : 'bg-white/60'
                  }`}
                  aria-label={`Show image ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Value Label Pill Overlaid */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm border border-slate-200">
            <ProductValueIndicator
              label={product.valueLabel}
              explanation={product.valueExplanation}
            />
          </div>
        </div>

        {/* Procurement Key Numbers Grid (Transparent Price, MOQ, Lead Time, Capacity) */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Primary Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pb-4 border-b border-[#E2E8F0]">
              <div className="bg-[#F5F7FA] p-2.5 rounded-xl border border-[#E2E8F0]/70">
                <span className="text-[10px] text-[#64748B] uppercase font-semibold tracking-wider block">
                  Unit Price
                </span>
                <div className="text-base sm:text-lg font-bold text-[#14283F] font-mono leading-tight mt-0.5">
                  ₹{product.unitPrice.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-[#64748B]">{product.priceUnit}</span>
              </div>

              <div className="bg-[#F5F7FA] p-2.5 rounded-xl border border-[#E2E8F0]/70">
                <span className="text-[10px] text-[#64748B] uppercase font-semibold tracking-wider block">
                  Minimum Order (MOQ)
                </span>
                <div className="text-base sm:text-lg font-bold text-[#14283F] font-mono leading-tight mt-0.5">
                  {product.moq.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-[#64748B]">{product.priceUnit.replace('per ', '')}s</span>
              </div>

              <div className="bg-[#F5F7FA] p-2.5 rounded-xl border border-[#E2E8F0]/70">
                <span className="text-[10px] text-[#64748B] uppercase font-semibold tracking-wider block">
                  Lead Time
                </span>
                <div className="text-base sm:text-lg font-bold text-[#0F766E] font-mono leading-tight mt-0.5">
                  {product.leadTimeDays} Days
                </div>
                <span className="text-[10px] text-[#64748B]">Batch dispatch</span>
              </div>

              <div className="bg-[#F5F7FA] p-2.5 rounded-xl border border-[#E2E8F0]/70">
                <span className="text-[10px] text-[#64748B] uppercase font-semibold tracking-wider block">
                  Monthly Capacity
                </span>
                <div className="text-base sm:text-lg font-bold text-[#14283F] font-mono leading-tight mt-0.5">
                  {(product.monthlyCapacity / 1000).toFixed(0)}k
                </div>
                <span className="text-[10px] text-[#64748B]">Units / month</span>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="mt-3 text-xs leading-relaxed text-[#172033] bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60">
              <span className="font-semibold text-amber-900 block mb-0.5">Industrial Value Proposition:</span>
              <p className="text-[#172033] text-[13px]">{product.valueProposition}</p>
            </div>

            {/* Payment Reliability and Trust Footnote */}
            <div className="mt-3 flex items-center justify-between flex-wrap gap-2 text-xs">
              <PaymentReliabilityBadge paymentReliability={manufacturer.paymentReliability} />
              <span className="text-[11px] text-[#64748B]">
                Established {manufacturer.yearEstablished} · Turnover {manufacturer.annualTurnover}
              </span>
            </div>
          </div>

          {/* Expandable Technical Specifications Accordion */}
          <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between text-xs font-semibold text-[#14283F] hover:text-[#0F766E] py-1 cursor-pointer transition-colors"
            >
              <span>Technical Specifications & Compliance</span>
              <span className="flex items-center gap-1 text-[11px] text-[#64748B]">
                {isExpanded ? 'Hide Specs' : 'View Full Specs'}
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </button>

            {isExpanded && (
              <div className="mt-2.5 space-y-2 bg-[#F5F7FA] p-3 rounded-xl border border-[#E2E8F0] text-xs">
                <div className="font-semibold text-[#14283F] text-[11px]">
                  Material Composition: <span className="font-normal text-[#172033]">{product.material}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="text-[11px]">
                      <span className="text-[#64748B]">{key}: </span>
                      <span className="font-medium text-[#172033]">{val}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] text-[11px] flex items-center justify-between text-[#64748B]">
                  <span>Delivery: {product.deliveryTerms}</span>
                  {product.sampleAvailable && (
                    <span className="text-[#0F766E] font-medium">Sample available (₹{product.samplePriceInr})</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Footnote: Demo notice */}
      <div className="px-5 py-2 bg-[#F5F7FA] border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B] shrink-0">
        <DemoDataDisclaimer />
        <span className="font-mono text-[10px]">ID: {manufacturer.id.toUpperCase()}</span>
      </div>
    </div>
  );
};
