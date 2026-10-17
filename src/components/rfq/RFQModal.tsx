import React, { useState } from 'react';
import {
  X,
  Zap,
  CheckCircle2,
  Calendar,
  MapPin,
  Building2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SupplierOffering } from '../../types';

interface RFQModalProps {
  isOpen: boolean;
  onClose: () => void;
  offering: SupplierOffering | null;
}

export const RFQModal: React.FC<RFQModalProps> = ({
  isOpen,
  onClose,
  offering,
}) => {
  const { createRFQ, activeBuyer } = useApp();

  if (!isOpen || !offering) return null;

  const { manufacturer, product } = offering;

  const [quantity, setQuantity] = useState<number>(product.moq || 1000);
  const [unit, setUnit] = useState<string>(product.priceUnit.replace('per ', '') || 'units');
  const [specifications, setSpecifications] = useState<string>(
    `${product.material}, standard tolerance, test certificate with delivery.`
  );
  const [deliveryLocation, setDeliveryLocation] = useState<string>(
    activeBuyer.registeredAddress || 'Plot 42, Bhosari MIDC, Pune, Maharashtra'
  );
  const [deliveryState, setDeliveryState] = useState<string>(activeBuyer.state || 'Maharashtra');
  const [requestedDate, setRequestedDate] = useState<string>(
    new Date(Date.now() + 86400000 * (product.leadTimeDays + 3)).toISOString().split('T')[0]
  );
  const [targetBudget, setTargetBudget] = useState<number>(product.unitPrice);
  const [notes, setNotes] = useState<string>('Please include freight to destination in quoted rate.');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!quantity || quantity <= 0) {
      setErrorMessage('Please enter a valid procurement quantity.');
      return;
    }

    if (!deliveryLocation.trim()) {
      setErrorMessage('Delivery factory destination is required.');
      return;
    }

    createRFQ({
      offering,
      quantity: Number(quantity),
      unit,
      specifications,
      deliveryLocation,
      deliveryState,
      requestedDate,
      targetBudget: Number(targetBudget),
      notes,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden text-[#172033]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#14283F] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Zap className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Request for Quotation (RFQ)</h3>
              <p className="text-xs text-slate-300">
                To: <strong className="text-white">{manufacturer.name}</strong> ({manufacturer.city}, {manufacturer.state})
              </p>
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

        {isSubmitted ? (
          /* Confirmation Success State */
          <div className="p-8 text-center flex-1 flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 bg-teal-50 text-[#0F766E] rounded-full flex items-center justify-center border border-teal-200">
              <CheckCircle2 className="w-8 h-8 text-[#0F766E]" />
            </div>
            <h4 className="text-xl font-bold text-[#14283F]">RFQ Submitted Successfully</h4>
            <p className="text-xs text-[#64748B] max-w-md leading-relaxed">
              Your inquiry has been transmitted to {manufacturer.name}. The manufacturer will receive your target specifications and return a formal commercial quotation.
            </p>
            <span className="text-xs font-mono text-[#0F766E] font-semibold">
              Tracking under: RFQs & Orders
            </span>
          </div>
        ) : (
          /* RFQ Form */
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Target Product Summary Box */}
              <div className="bg-[#F5F7FA] p-3 rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#64748B] uppercase font-semibold">Target Product</span>
                  <div className="font-bold text-xs text-[#14283F]">{product.name}</div>
                  <div className="text-[11px] text-[#64748B]">{product.category} · {product.material}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#64748B] uppercase font-semibold">Catalog Price</span>
                  <div className="font-bold text-sm text-[#0F766E] font-mono">
                    ₹{product.unitPrice} {product.priceUnit}
                  </div>
                </div>
              </div>

              {/* Quantity and Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#14283F] font-semibold mb-1">
                    Requested Order Quantity *
                  </label>
                  <input
                    type="number"
                    min={product.moq}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#14283F]"
                    required
                  />
                  <span className="text-[10px] text-[#64748B]">Supplier MOQ: {product.moq}</span>
                </div>

                <div>
                  <label className="block text-[#14283F] font-semibold mb-1">
                    Target Budget / Unit (₹)
                  </label>
                  <input
                    type="number"
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#14283F]"
                  />
                  <span className="text-[10px] text-[#64748B]">Target benchmark</span>
                </div>
              </div>

              {/* Technical Specifications */}
              <div>
                <label className="block text-[#14283F] font-semibold mb-1">
                  Technical Specifications & Tolerances *
                </label>
                <textarea
                  rows={2}
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs focus:ring-2 focus:ring-[#14283F] resize-none"
                  placeholder="Dimensional tolerances, surface finish, grade specifications..."
                  required
                />
              </div>

              {/* Delivery Factory Destination & State */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[#14283F] font-semibold mb-1">
                    Consignee Delivery Location *
                  </label>
                  <input
                    type="text"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs focus:ring-2 focus:ring-[#14283F]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#14283F] font-semibold mb-1">
                    Destination State
                  </label>
                  <input
                    type="text"
                    value={deliveryState}
                    onChange={(e) => setDeliveryState(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs focus:ring-2 focus:ring-[#14283F]"
                    required
                  />
                </div>
              </div>

              {/* Requested Delivery Date */}
              <div>
                <label className="block text-[#14283F] font-semibold mb-1">
                  Required Target Delivery Date
                </label>
                <input
                  type="date"
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#14283F]"
                  required
                />
              </div>

              {/* Commercial Notes */}
              <div>
                <label className="block text-[#14283F] font-semibold mb-1">
                  Commercial Terms & Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs focus:ring-2 focus:ring-[#14283F]"
                  placeholder="e.g. 30-day payment term, sample batch required first"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#F5F7FA] flex items-center justify-between shrink-0">
              <span className="text-xs text-[#64748B]">
                Total Estimated Value: <strong className="font-mono text-[#14283F]">₹{(quantity * (targetBudget || product.unitPrice)).toLocaleString('en-IN')}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-[#E2E8F0] text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Transmit RFQ</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
