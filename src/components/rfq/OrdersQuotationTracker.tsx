import React, { useState } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  Calendar,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Send,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RFQItem, OrderStatus } from '../../types';

export const OrdersQuotationTracker: React.FC = () => {
  const { rfqs, role, advanceRFQStatus, setActiveTab } = useApp();
  const [selectedRfqId, setSelectedRfqId] = useState<string>(
    rfqs.length > 0 ? rfqs[0].id : ''
  );

  const activeRfq = rfqs.find((r) => r.id === selectedRfqId) || rfqs[0];

  const statuses: OrderStatus[] = [
    'RFQ Requested',
    'Quote Received',
    'Order Confirmed',
    'In Production',
    'Dispatched',
    'Delivered',
  ];

  if (rfqs.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-[#64748B]">
          <FileSpreadsheet className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#14283F] mb-2">No Active RFQs or Orders</h3>
        <p className="text-sm text-[#64748B] mb-6 leading-relaxed">
          Request a quote from any discovered or shortlisted MSME manufacturer to track procurement quotations and order delivery milestones here.
        </p>
        <button
          type="button"
          onClick={() => setActiveTab('discover')}
          className="px-5 py-2.5 bg-[#14283F] text-white text-xs font-semibold rounded-xl hover:bg-[#0A1624] transition-colors cursor-pointer"
        >
          Discover Suppliers
        </button>
      </div>
    );
  }

  const currentStatusIndex = statuses.indexOf(activeRfq.status);

  return (
    <div className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6 flex flex-col space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-[#14283F] tracking-tight">
            Quotation & Deal Tracking
          </h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#14283F] text-white">
            {rfqs.length} Active Records
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Full B2B quotation lifecycle from initial procurement inquiry to delivery at destination factory.
        </p>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: RFQ & Order Queue */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] card-elevation overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F5F7FA] font-bold text-xs text-[#14283F] uppercase tracking-wider">
            Inquiry & Order Queue
          </div>

          <div className="divide-y divide-[#E2E8F0] overflow-y-auto max-h-[640px]">
            {rfqs.map((item) => {
              const isSelected = item.id === activeRfq.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedRfqId(item.id)}
                  className={`w-full p-4 text-left transition-colors cursor-pointer ${
                    isSelected ? 'bg-slate-50 border-l-4 border-l-[#F59E0B]' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-[#64748B] mb-1">
                    <span className="font-mono font-bold text-[#14283F]">{item.rfqNumber}</span>
                    <span>{item.requestedDate}</span>
                  </div>

                  <h4 className="font-bold text-xs text-[#14283F] truncate mb-1">
                    {item.productName}
                  </h4>

                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="text-[#64748B]">
                      {role === 'buyer' ? item.manufacturerName : item.buyerName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-800'
                          : item.status === 'In Production' || item.status === 'Dispatched'
                          ? 'bg-teal-50 text-teal-800'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Quotation Lifecycle & Progression */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Progression Stepper */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-elevation">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase">
                  {activeRfq.rfqNumber}
                </span>
                <h3 className="font-bold text-base text-[#14283F] leading-tight">
                  {activeRfq.productName}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#64748B] block">Current Stage</span>
                <span className="font-bold text-xs text-[#0F766E]">{activeRfq.status}</span>
              </div>
            </div>

            {/* Visual Stepper */}
            <div className="relative flex items-center justify-between py-2 overflow-x-auto">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-1 bg-[#0F766E] -translate-y-1/2 z-0 transition-all duration-500"
                style={{
                  width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%`,
                }}
              />

              {statuses.map((st, idx) => {
                const isPassed = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;

                return (
                  <div key={st} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-[#F59E0B] text-slate-950 ring-4 ring-amber-100 scale-110 shadow-md'
                          : isPassed
                          ? 'bg-[#0F766E] text-white'
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}
                    >
                      {isPassed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] mt-2 text-center max-w-[80px] font-medium leading-tight ${
                        isCurrent
                          ? 'text-[#14283F] font-bold'
                          : isPassed
                          ? 'text-[#0F766E]'
                          : 'text-slate-400'
                      }`}
                    >
                      {st}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Contextual Action Button to Advance Order Lifecycle */}
            <div className="mt-5 pt-4 border-t border-[#E2E8F0] flex items-center justify-between flex-wrap gap-3">
              <div className="text-xs text-[#64748B]">
                Interactive simulation controls for industrial procurement prototype:
              </div>

              <div className="flex items-center gap-2">
                {activeRfq.status === 'Quote Received' && (
                  <button
                    type="button"
                    onClick={() => advanceRFQStatus(activeRfq.id, 'Order Confirmed')}
                    className="px-4 py-2 bg-[#15803D] hover:bg-green-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Quotation & Confirm PO</span>
                  </button>
                )}

                {activeRfq.status === 'Order Confirmed' && (
                  <button
                    type="button"
                    onClick={() => advanceRFQStatus(activeRfq.id, 'In Production')}
                    className="px-4 py-2 bg-[#14283F] hover:bg-[#0A1624] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Package className="w-4 h-4" />
                    <span>Allocate Batch to Production</span>
                  </button>
                )}

                {activeRfq.status === 'In Production' && (
                  <button
                    type="button"
                    onClick={() => advanceRFQStatus(activeRfq.id, 'Dispatched')}
                    className="px-4 py-2 bg-[#0F766E] hover:bg-teal-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Mark Dispatched (e-Way Bill Generated)</span>
                  </button>
                )}

                {activeRfq.status === 'Dispatched' && (
                  <button
                    type="button"
                    onClick={() => advanceRFQStatus(activeRfq.id, 'Delivered')}
                    className="px-4 py-2 bg-[#15803D] hover:bg-green-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Delivery & Sign Goods Receipt (GRN)</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quotation Commercial Details Card */}
          {activeRfq.quotation ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-elevation space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
                  <h4 className="font-bold text-sm text-[#14283F]">
                    Submitted Commercial Quotation
                  </h4>
                </div>
                <span className="text-xs font-mono text-[#64748B]">
                  Validity: {activeRfq.quotation.validity}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#F5F7FA] p-3 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block uppercase">Quoted Unit Price</span>
                  <div className="font-mono font-bold text-base text-[#14283F]">
                    ₹{activeRfq.quotation.unitPrice}
                  </div>
                  <span className="text-[10px] text-[#64748B]">Per {activeRfq.unit}</span>
                </div>

                <div className="bg-[#F5F7FA] p-3 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block uppercase">Total Deal Value</span>
                  <div className="font-mono font-bold text-base text-[#0F766E]">
                    ₹{(activeRfq.quotation.unitPrice * activeRfq.quantity).toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-[#64748B]">Excl. 18% GST</span>
                </div>

                <div className="bg-[#F5F7FA] p-3 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block uppercase">Committed Lead Time</span>
                  <div className="font-mono font-bold text-base text-[#14283F]">
                    {activeRfq.quotation.leadTimeDays} Days
                  </div>
                  <span className="text-[10px] text-[#64748B]">Dispatch readiness</span>
                </div>

                <div className="bg-[#F5F7FA] p-3 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block uppercase">Minimum Batch (MOQ)</span>
                  <div className="font-mono font-bold text-base text-[#14283F]">
                    {activeRfq.quotation.moq.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-[#64748B]">{activeRfq.unit}</span>
                </div>
              </div>

              <div className="p-3 bg-[#F5F7FA] rounded-xl border border-[#E2E8F0] space-y-1 text-xs">
                <div>
                  <span className="font-semibold text-[#14283F]">Freight & Delivery Terms: </span>
                  <span className="text-[#172033]">{activeRfq.quotation.deliveryTerms}</span>
                </div>
                <div>
                  <span className="font-semibold text-[#14283F]">Manufacturer Commercial Remarks: </span>
                  <span className="text-[#172033]">{activeRfq.quotation.notes}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-elevation text-xs text-[#64748B] flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <span className="font-bold text-[#14283F] block">Awaiting Manufacturer Quotation Response</span>
                <span>
                  The manufacturer is reviewing batch tooling and raw material pricing. Response SLA typically under 24 business hours.
                </span>
              </div>
            </div>
          )}

          {/* Audit Timeline */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-elevation space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#14283F]">
              Milestone Audit Trail
            </h4>

            <div className="space-y-3">
              {activeRfq.timeline.map((event, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#0F766E] mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#14283F]">{event.status}</span>
                      <span className="text-[10px] text-[#64748B] font-mono">{event.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{event.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
