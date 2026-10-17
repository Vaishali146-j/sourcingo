import React from 'react';
import {
  X,
  MapPin,
  Star,
  ShieldCheck,
  Building2,
  Calendar,
  Users,
  Award,
  FileText,
  Phone,
  Mail,
  Zap,
  Bookmark,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TrustBadge, DemoDataDisclaimer } from '../common/TrustBadge';
import { ProductValueIndicator, PaymentReliabilityBadge } from '../common/ProductValueIndicator';
import { CapacityProgressBar } from '../common/CapacityProgressBar';

interface SupplierDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRFQ: () => void;
}

export const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({
  isOpen,
  onClose,
  onOpenRFQ,
}) => {
  const {
    selectedSupplierDetail,
    handleSwipe,
    shortlistIds,
  } = useApp();

  if (!isOpen || !selectedSupplierDetail) return null;

  const { manufacturer, product } = selectedSupplierDetail;
  const isShortlisted = shortlistIds.includes(selectedSupplierDetail.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-[#172033]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#14283F] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 p-0.5 border border-white/20 overflow-hidden shrink-0">
              <img
                src={manufacturer.logo}
                alt={manufacturer.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-white leading-tight">
                {manufacturer.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>{manufacturer.city}, {manufacturer.state}</span>
                <span>·</span>
                <span className="text-amber-400 font-medium">Est. {manufacturer.yearEstablished}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Company Overview & Legal Identity */}
          <div>
            <h4 className="text-xs font-bold text-[#14283F] uppercase tracking-wider mb-2">
              Factory & Plant Background
            </h4>
            <p className="text-sm text-[#172033] leading-relaxed mb-3">
              {manufacturer.description}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F5F7FA] p-3.5 rounded-xl border border-[#E2E8F0]">
              <div>
                <span className="text-[#64748B] block text-[10px] uppercase">Annual Turnover</span>
                <span className="font-bold text-[#14283F] text-xs">{manufacturer.annualTurnover}</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10px] uppercase">Workforce</span>
                <span className="font-bold text-[#14283F] text-xs">{manufacturer.employeeCount} personnel</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10px] uppercase">Factory Area</span>
                <span className="font-bold text-[#14283F] text-xs">
                  {manufacturer.factoryAreaSqFt?.toLocaleString()} sq.ft
                </span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10px] uppercase">Serviceable Area</span>
                <span className="font-bold text-[#14283F] text-xs">{manufacturer.serviceableRegions.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Production Capacity & Remaining Availability Gauge */}
          <div>
            <h4 className="text-xs font-bold text-[#14283F] uppercase tracking-wider mb-2">
              Plant Capacity & Immediate Availability
            </h4>
            <CapacityProgressBar
              monthlyCapacity={product.monthlyCapacity}
              remainingCapacity={product.remainingMonthlyCapacity}
              unit={product.priceUnit}
              moq={product.moq}
            />
          </div>

          {/* Verification Evidence Matrix */}
          <div>
            <h4 className="text-xs font-bold text-[#14283F] uppercase tracking-wider mb-2">
              Statutory Verifications & Certifications
            </h4>
            <div className="space-y-2 bg-[#F5F7FA] p-3.5 rounded-xl border border-[#E2E8F0]">
              <div className="flex items-center justify-between py-1 border-b border-[#E2E8F0]">
                <span className="font-medium text-[#172033]">GSTIN Registration</span>
                <TrustBadge
                  label={manufacturer.verificationStatus.gstNumber || 'GST Verified'}
                  evidence={manufacturer.verificationStatus.gstEvidence}
                />
              </div>

              {manufacturer.verificationStatus.udyamNumber && (
                <div className="flex items-center justify-between py-1 border-b border-[#E2E8F0]">
                  <span className="font-medium text-[#172033]">MSME Udyam Registration</span>
                  <TrustBadge
                    label={manufacturer.verificationStatus.udyamNumber}
                    evidence="Independently Verified"
                  />
                </div>
              )}

              <div className="flex items-center justify-between py-1">
                <span className="font-medium text-[#172033]">Quality Audit Certifications</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {manufacturer.verificationStatus.certifications.map((c) => (
                    <span key={c} className="text-[#0F766E] font-medium text-xs">
                      {c}
                    </span>
                  ))}
                  <span className="text-[#64748B] text-[11px]">(Independently Verified)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Ratings & Payment History */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Rating Breakdown */}
            <div className="bg-[#F5F7FA] p-4 rounded-xl border border-[#E2E8F0]">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-bold text-[#14283F]">Buyer Rating Breakdown</h5>
                <div className="flex items-center gap-1 font-bold text-[#14283F]">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>{manufacturer.rating.toFixed(2)}</span>
                  <span className="text-[#64748B] font-normal text-xs">({manufacturer.ratingCount} reviews)</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[#64748B] mb-1">
                    <span>Product Quality</span>
                    <span className="font-semibold text-[#14283F]">{manufacturer.ratingBreakdown.quality} / 5</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0F766E] h-full rounded-full"
                      style={{ width: `${(manufacturer.ratingBreakdown.quality / 5) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#64748B] mb-1">
                    <span>Delivery Reliability</span>
                    <span className="font-semibold text-[#14283F]">{manufacturer.ratingBreakdown.delivery} / 5</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#14283F] h-full rounded-full"
                      style={{ width: `${(manufacturer.ratingBreakdown.delivery / 5) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#64748B] mb-1">
                    <span>Specification Conformance</span>
                    <span className="font-semibold text-[#14283F]">{manufacturer.ratingBreakdown.specCompliance} / 5</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0F766E] h-full rounded-full"
                      style={{ width: `${(manufacturer.ratingBreakdown.specCompliance / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Reliability */}
            <div className="bg-[#F5F7FA] p-4 rounded-xl border border-[#E2E8F0] flex flex-col justify-between">
              <div>
                <h5 className="font-bold text-[#14283F] mb-1">Payment & Commercial History</h5>
                <p className="text-[#64748B] text-[11px] mb-3">
                  Documented B2B escrow and milestone settlement reliability on platform transactions.
                </p>
                <div className="text-2xl font-bold font-mono text-[#15803D] mb-1">
                  {manufacturer.paymentReliability.onTimePaymentRate}%
                </div>
                <div className="text-xs text-[#172033] font-medium">
                  On-time milestone compliance across {manufacturer.paymentReliability.completedTransactions} closed orders.
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#E2E8F0] text-[11px] text-[#64748B]">
                Average invoice settlement speed: {manufacturer.paymentReliability.averageDaysToPay} days.
              </div>
            </div>
          </div>

          {/* Plant & Machinery Contact */}
          <div>
            <h4 className="text-xs font-bold text-[#14283F] uppercase tracking-wider mb-2">
              Commercial Contact
            </h4>
            <div className="p-3 bg-[#F5F7FA] rounded-xl border border-[#E2E8F0] flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="font-semibold text-[#14283F]">{manufacturer.contact.name}</div>
                <div className="text-[#64748B] text-[11px]">{manufacturer.contact.title}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-[#14283F] font-mono">
                  <Phone className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>{manufacturer.contact.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#14283F]">
                  <Mail className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>{manufacturer.contact.email}</span>
                </div>
              </div>
            </div>
          </div>

          <DemoDataDisclaimer />
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#F5F7FA] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#E2E8F0] text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close Audit
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                handleSwipe('shortlist', selectedSupplierDetail.id);
                onClose();
              }}
              className={`px-4 py-2 border text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
                isShortlisted
                  ? 'bg-teal-50 border-teal-300 text-[#0F766E]'
                  : 'bg-white border-[#E2E8F0] text-[#14283F] hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{isShortlisted ? 'In Shortlist' : 'Add to Shortlist'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRFQ();
              }}
              className="px-5 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Request Formal Quote (RFQ)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
