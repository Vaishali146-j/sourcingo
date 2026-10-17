import React from 'react';
import {
  X,
  Check,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { SupplierOffering } from '../../types';
import { TrustBadge } from '../common/TrustBadge';
import { ProductValueIndicator } from '../common/ProductValueIndicator';

interface SupplierComparisonTableProps {
  suppliers: SupplierOffering[];
  onClose: () => void;
  onRequestQuote: (offering: SupplierOffering) => void;
}

export const SupplierComparisonTable: React.FC<SupplierComparisonTableProps> = ({
  suppliers,
  onClose,
  onRequestQuote,
}) => {
  if (suppliers.length === 0) return null;

  // Determine lowest price and shortest lead time
  const minPrice = Math.min(...suppliers.map((s) => s.product.unitPrice));
  const minLeadTime = Math.min(...suppliers.map((s) => s.product.leadTimeDays));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-[#172033]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#14283F] text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-white">
              Side-by-Side Supplier Comparison Matrix
            </h3>
            <p className="text-xs text-slate-300">
              Evaluating {suppliers.length} shortlisted manufacturers on price, delivery, capacity & audit compliance.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto overflow-y-auto p-6 flex-1">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="p-3 bg-slate-50 font-bold text-[#14283F] uppercase tracking-wider w-48 text-[11px]">
                  Comparison Metric
                </th>
                {suppliers.map((s) => (
                  <th key={s.id} className="p-3 min-w-[200px] align-top bg-white border-l border-[#E2E8F0]">
                    <div className="font-bold text-sm text-[#14283F]">{s.manufacturer.name}</div>
                    <div className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#0F766E]" />
                      <span>{s.manufacturer.city}, {s.manufacturer.state}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {/* Product */}
              <tr>
                <td className="p-3 bg-slate-50 font-semibold text-[#64748B]">Featured Product</td>
                {suppliers.map((s) => (
                  <td key={s.id} className="p-3 border-l border-[#E2E8F0]">
                    <div className="font-medium text-[#172033]">{s.product.name}</div>
                    <span className="text-[10px] text-[#64748B]">{s.product.category}</span>
                  </td>
                ))}
              </tr>

              {/* Unit Price */}
              <tr>
                <td className="p-3 bg-slate-50 font-semibold text-[#64748B]">Unit Price (INR)</td>
                {suppliers.map((s) => {
                  const isLowest = s.product.unitPrice === minPrice;
                  return (
                    <td key={s.id} className="p-3 border-l border-[#E2E8F0]">
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono font-bold text-base text-[#14283F]">
                          ₹{s.product.unitPrice}
                        </span>
                        <span className="text-[10px] text-[#64748B]">{s.product.priceUnit}</span>
                      </div>
                      {isLowest && (
                        <span className="text-[10px] font-bold text-[#0F766E] uppercase">
                          Lowest Price
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Lead Time */}
              <tr>
                <td className="p-3 bg-slate-50 font-semibold text-[#64748B]">Production Lead Time</td>
                {suppliers.map((s) => {
                  const isFastest = s.product.leadTimeDays === minLeadTime;
                  return (
                    <td key={s.id} className="p-3 border-l border-[#E2E8F0]">
                      <span className="font-bold text-[#14283F] font-mono text-sm">
                        {s.product.leadTimeDays} Days
                      </span>
                      {isFastest && (
                        <span className="block text-[10px] font-bold text-[#0F766E] uppercase">
                          Fastest Turnaround
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* MOQ */}
              <tr>
                <td className="p-3 bg-slate-50 font-semibold text-[#64748B]">Minimum Order Quantity (MOQ)</td>
                {suppliers.map((s) => (
                  <td key={s.id} className="p-3 border-l border-[#E2E8F0] font-mono font-medium">
                    {s.product.moq.toLocaleString()} units
                  </td>
                ))}
              </tr>

              {/* Monthly Capacity */}
              <tr>
                <td className="p-3 bg-slate-50 font-semibold text-[#64748B]">Monthly Output Capacity</td>
                {suppliers.map((s) => (
                  <td key={s.id} className="p-3 border-l border-[#E2E8F0] font-mono font-medium">
                    {s.product.monthlyCapacity.toLocaleString()} units/mo
                  </td>
                ))}
              </tr>

              {/* Rating */}
              <tr>
                <td className="p-3 bg-slate-50 font-semibold text-[#64748B]">Manufacturer Rating</td>
                {suppliers.map((s) => (
                  <td key={s.id} className="p-3 border-l border-[#E2E8F0]">
                    <div className="flex items-center gap-1 font-semibold text-[#14283F]">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{s.manufacturer.rating.toFixed(2)}</span>
                      <span className="text-[#64748B] text-[11px] font-normal">
                        ({s.manufacturer.ratingCount} reviews)
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Value Evaluation */}
              <tr>
                <td className="p-3 bg-slate-50 font-semibold text-[#64748B]">Calculated Value Label</td>
                {suppliers.map((s) => (
                  <td key={s.id} className="p-3 border-l border-[#E2E8F0]">
                    <ProductValueIndicator
                      label={s.product.valueLabel}
                      explanation={s.product.valueExplanation}
                    />
                  </td>
                ))}
              </tr>

              {/* Payment Settlement Rate */}
              <tr>
                <td className="p-3 bg-slate-50 font-semibold text-[#64748B]">Payment Reliability</td>
                {suppliers.map((s) => (
                  <td key={s.id} className="p-3 border-l border-[#E2E8F0]">
                    <span className="font-semibold text-[#15803D]">
                      {s.manufacturer.paymentReliability.onTimePaymentRate}%
                    </span>{' '}
                    <span className="text-[#64748B] text-[11px]">
                      ({s.manufacturer.paymentReliability.completedTransactions} orders)
                    </span>
                  </td>
                ))}
              </tr>

              {/* Certifications */}
              <tr>
                <td className="p-3 bg-slate-50 font-semibold text-[#64748B]">Statutory Compliance</td>
                {suppliers.map((s) => (
                  <td key={s.id} className="p-3 border-l border-[#E2E8F0] text-[11px] space-y-1">
                    <div className="text-[#0F766E] font-medium">
                      GST: {s.manufacturer.verificationStatus.gstNumber}
                    </div>
                    <div className="text-[#64748B]">
                      {s.manufacturer.verificationStatus.certifications.join(', ')}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Action Row */}
              <tr>
                <td className="p-3 bg-slate-50 font-semibold text-[#64748B]">Procurement Action</td>
                {suppliers.map((s) => (
                  <td key={s.id} className="p-3 border-l border-[#E2E8F0]">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onRequestQuote(s);
                      }}
                      className="w-full py-2 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Request RFQ</span>
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
