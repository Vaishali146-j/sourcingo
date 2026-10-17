import React, { useState } from 'react';
import {
  LayoutDashboard,
  Boxes,
  FileSpreadsheet,
  Users,
  Plus,
  Zap,
  CheckCircle2,
  Clock,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Building2,
  Edit2,
  AlertCircle,
  Eye,
  Send,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SupplierOffering, Product } from '../../types';

export const ManufacturerDashboardView: React.FC = () => {
  const {
    activeManufacturer,
    offerings,
    rfqs,
    matches,
    submitQuotationResponse,
    acceptBuyerInboundInterest,
    activeBuyer,
    addOrUpdateProductOffering,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'rfqs' | 'products' | 'inbound'>('overview');
  const [showQuoteModal, setShowQuoteModal] = useState<string | null>(null);

  // Quote form draft
  const [quotedPrice, setQuotedPrice] = useState<number>(140);
  const [quotedMoq, setQuotedMoq] = useState<number>(1000);
  const [quotedLeadTime, setQuotedLeadTime] = useState<number>(10);
  const [quoteValidity, setQuoteValidity] = useState<string>('15 Days');
  const [deliveryTerms, setDeliveryTerms] = useState<string>('FOR Destination with transit insurance');
  const [quoteNotes, setQuoteNotes] = useState<string>('Discounted tier-1 buyer rate applied.');

  // Product modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newCategory, setNewCategory] = useState('Textiles & Fabrics');
  const [newMaterial, setNewMaterial] = useState('Heavy Cotton Duck / Alloy Steel');
  const [newPrice, setNewPrice] = useState(250);
  const [newMoq, setNewMoq] = useState(500);
  const [newCapacity, setNewCapacity] = useState(25000);
  const [newLeadTime, setNewLeadTime] = useState(10);

  // Filter items relevant to active manufacturer
  const manufacturerOfferings = offerings.filter(
    (o) => o.manufacturer.id === activeManufacturer.id
  );
  const manufacturerRfqs = rfqs.filter(
    (r) => r.manufacturerId === activeManufacturer.id || r.status === 'RFQ Requested'
  );
  const manufacturerMatches = matches.filter(
    (m) => m.manufacturerId === activeManufacturer.id
  );

  const pendingRfqs = manufacturerRfqs.filter((r) => r.status === 'RFQ Requested');
  const activeOrders = manufacturerRfqs.filter(
    (r) => r.status === 'Order Confirmed' || r.status === 'In Production' || r.status === 'Dispatched'
  );

  const handleSendQuote = (rfqId: string) => {
    submitQuotationResponse(rfqId, {
      unitPrice: Number(quotedPrice),
      moq: Number(quotedMoq),
      leadTimeDays: Number(quotedLeadTime),
      validity: quoteValidity,
      deliveryTerms,
      notes: quoteNotes,
    });
    setShowQuoteModal(null);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      manufacturerId: activeManufacturer.id,
      name: newProductName,
      category: newCategory,
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      material: newMaterial,
      specifications: {
        'Quality Standard': 'IS / ISO Standard Compliant',
        'Inspection Protocol': 'Batch dimensional sign-off',
      },
      unitPrice: Number(newPrice),
      currency: 'INR',
      priceUnit: 'per piece',
      moq: Number(newMoq),
      monthlyCapacity: Number(newCapacity),
      leadTimeDays: Number(newLeadTime),
      valueLabel: 'Good',
      valueProposition: 'Verified MSME factory direct production line with full traceability.',
      valueExplanation: 'Competitive cluster pricing backed by verified GST credentials.',
      certifications: activeManufacturer.verificationStatus.certifications,
      deliveryTerms: 'Ex-Factory or Door delivery across India',
      sampleAvailable: true,
      samplePriceInr: Math.round(Number(newPrice) * 1.5),
    };

    const newOffering: SupplierOffering = {
      id: `offering-${Date.now()}`,
      manufacturer: activeManufacturer,
      product: newProd,
      compositeScore: 90,
      matchReasons: ['New MSME offering directly published to platform'],
      distanceEstimateKm: 450,
    };

    addOrUpdateProductOffering(newOffering);
    setShowAddProductModal(false);
    setNewProductName('');
  };

  return (
    <div className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      {/* Header with Active MSME Factory Details */}
      <div className="bg-[#14283F] text-white rounded-2xl p-6 border border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 border border-slate-600 shrink-0">
            <img
              src={activeManufacturer.logo}
              alt={activeManufacturer.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {activeManufacturer.name}
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold">
                Verified MSME Plant
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>{activeManufacturer.city}, {activeManufacturer.state}</span>
              <span>·</span>
              <span>GST: {activeManufacturer.verificationStatus.gstNumber}</span>
              <span>·</span>
              <span>Turnover: {activeManufacturer.annualTurnover}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowAddProductModal(true)}
            className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>List New Industrial Product</span>
          </button>
        </div>
      </div>

      {/* Workspace Tabs (Zero Pill Discipline) */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#14283F] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#14283F]'
          }`}
        >
          Demand Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rfqs')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'rfqs'
              ? 'bg-[#14283F] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#14283F]'
          }`}
        >
          <span>Incoming RFQs</span>
          {pendingRfqs.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#F59E0B] text-slate-950 font-bold text-[10px] flex items-center justify-center">
              {pendingRfqs.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inbound')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'inbound'
              ? 'bg-[#14283F] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#14283F]'
          }`}
        >
          <span>Buyer Interest Feed</span>
          <span className="px-1.5 py-0.5 rounded bg-teal-100 text-[#0F766E] font-bold text-[10px]">
            1 Inbound
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'bg-[#14283F] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#14283F]'
          }`}
        >
          Product Catalog ({manufacturerOfferings.length})
        </button>
      </div>

      {/* Tab 1: Demand Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] card-elevation">
              <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block">
                Profile Views
              </span>
              <div className="text-2xl font-bold font-mono text-[#14283F] mt-1">348</div>
              <span className="text-[11px] text-[#0F766E] font-medium">+18% this week</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] card-elevation">
              <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block">
                Buyer Shortlists
              </span>
              <div className="text-2xl font-bold font-mono text-[#14283F] mt-1">42</div>
              <span className="text-[11px] text-[#64748B]">Active enterprise buyers</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] card-elevation">
              <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block">
                Mutual Connections
              </span>
              <div className="text-2xl font-bold font-mono text-[#0F766E] mt-1">
                {manufacturerMatches.length}
              </div>
              <span className="text-[11px] text-[#0F766E] font-medium">Reciprocal validated</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] card-elevation">
              <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block">
                Pending RFQs
              </span>
              <div className="text-2xl font-bold font-mono text-[#F59E0B] mt-1">
                {pendingRfqs.length}
              </div>
              <span className="text-[11px] text-[#64748B]">Action required</span>
            </div>
          </div>

          {/* Pending RFQ Alerts */}
          {pendingRfqs.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600 fill-amber-600" />
                  <h3 className="font-bold text-sm text-amber-950">
                    High Priority RFQs Requiring Quotation
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('rfqs')}
                  className="text-xs font-bold text-amber-900 underline cursor-pointer"
                >
                  View All ({pendingRfqs.length})
                </button>
              </div>

              <div className="space-y-2">
                {pendingRfqs.map((rfq) => (
                  <div
                    key={rfq.id}
                    className="bg-white p-3.5 rounded-xl border border-amber-200/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#14283F]">
                        {rfq.productName} · {rfq.quantity.toLocaleString()} {rfq.unit}
                      </div>
                      <div className="text-[#64748B] text-[11px]">
                        Buyer: {rfq.buyerName} · Destination: {rfq.deliveryLocation}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowQuoteModal(rfq.id);
                        setQuotedPrice(rfq.targetBudget || 140);
                      }}
                      className="px-3.5 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Submit Quote
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Orders Track */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-elevation">
            <h3 className="font-bold text-sm text-[#14283F] uppercase tracking-wider mb-4">
              Active Production & Dispatch Batches
            </h3>

            {activeOrders.length === 0 ? (
              <p className="text-xs text-[#64748B]">
                No orders currently in production. Accept pending quotations to begin batch tracking.
              </p>
            ) : (
              <div className="space-y-3">
                {activeOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3.5 bg-[#F5F7FA] rounded-xl border border-[#E2E8F0] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-mono text-[10px] text-[#64748B]">{ord.rfqNumber}</span>
                      <div className="font-bold text-[#14283F]">{ord.productName}</div>
                      <div className="text-[#64748B] text-[11px]">
                        {ord.quantity.toLocaleString()} {ord.unit} for {ord.buyerName}
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded bg-teal-100 text-[#0F766E] font-bold text-xs">
                      {ord.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Incoming RFQs */}
      {activeTab === 'rfqs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#14283F] uppercase tracking-wider">
              RFQ Response Center
            </h3>
            <span className="text-xs text-[#64748B]">
              Respond with unit rate, MOQ, lead time, and freight terms
            </span>
          </div>

          <div className="space-y-4">
            {manufacturerRfqs.map((rfq) => (
              <div
                key={rfq.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-elevation space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#64748B]">{rfq.rfqNumber}</span>
                    <h4 className="font-bold text-base text-[#14283F]">{rfq.productName}</h4>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded self-start ${
                      rfq.status === 'Quote Received'
                        ? 'bg-teal-50 text-[#0F766E]'
                        : 'bg-amber-50 text-amber-900'
                    }`}
                  >
                    {rfq.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F5F7FA] p-3 rounded-xl border border-[#E2E8F0] text-xs">
                  <div>
                    <span className="text-[10px] text-[#64748B] block uppercase">Buyer</span>
                    <span className="font-bold text-[#14283F]">{rfq.buyerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] block uppercase">Requested Volume</span>
                    <span className="font-bold text-[#14283F] font-mono">
                      {rfq.quantity.toLocaleString()} {rfq.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] block uppercase">Target Date</span>
                    <span className="font-bold text-[#14283F]">{rfq.requestedDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] block uppercase">Target Budget</span>
                    <span className="font-bold text-[#0F766E] font-mono">
                      ₹{rfq.targetBudget ? `${rfq.targetBudget} / unit` : 'Not specified'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-[#172033] bg-white p-3 rounded-xl border border-[#E2E8F0] space-y-1">
                  <div>
                    <span className="font-semibold text-[#14283F]">Required Technical Specifications: </span>
                    <span className="text-[#64748B]">{rfq.specifications}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#14283F]">Destination Factory: </span>
                    <span className="text-[#64748B]">{rfq.deliveryLocation}</span>
                  </div>
                </div>

                {/* Response Action */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-[#64748B]">
                    {rfq.quotation
                      ? `Quotation of ₹${rfq.quotation.unitPrice}/${rfq.unit} submitted on ${rfq.quotation.submittedAt.split('T')[0]}`
                      : 'Pending your commercial pricing submission'}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setShowQuoteModal(rfq.id);
                      setQuotedPrice(rfq.targetBudget || 140);
                    }}
                    className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>{rfq.quotation ? 'Update Quotation' : 'Submit Formal Quote'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Buyer Interest Feed */}
      {activeTab === 'inbound' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#14283F] uppercase tracking-wider">
              Inbound Industrial Buyer Inquiries
            </h3>
            <span className="text-xs text-[#64748B]">
              Buyers who expressed discovery interest in your product offerings
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-elevation space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-[#E2E8F0] shrink-0">
                  <img
                    src={activeBuyer.logo}
                    alt={activeBuyer.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#14283F]">{activeBuyer.name}</h4>
                  <p className="text-xs text-[#64748B]">
                    {activeBuyer.city}, {activeBuyer.state} · Turnover: {activeBuyer.annualTurnover}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-[#0F766E] font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Payment Score: {activeBuyer.paymentReliability.score}/100</span>
                    <span>·</span>
                    <span>GST Verified Tier-1 EPC Buyer</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  acceptBuyerInboundInterest(activeBuyer.id, manufacturerOfferings[0]?.id || offerings[0].id);
                  setActiveTab('overview');
                }}
                className="px-4 py-2 bg-[#0F766E] hover:bg-teal-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept Interest & Connect</span>
              </button>
            </div>

            <div className="bg-[#F5F7FA] p-3 rounded-xl border border-[#E2E8F0] text-xs leading-relaxed text-[#172033]">
              <span className="font-semibold text-[#14283F]">Stated Buyer Procurement Scope: </span>
              “Actively looking for long-term contract supply of industrial duck canvas and high-tensile components for Western Region equipment assemblies.”
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Product Catalog */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#14283F] uppercase tracking-wider">
              Published Product Offerings
            </h3>
            <button
              type="button"
              onClick={() => setShowAddProductModal(true)}
              className="px-3.5 py-1.5 bg-[#14283F] text-white rounded-xl text-xs font-semibold hover:bg-[#0A1624] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {manufacturerOfferings.map((offering) => (
              <div
                key={offering.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-4 card-elevation flex gap-4"
              >
                <div className="w-28 h-28 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                  <img
                    src={offering.product.imageUrl}
                    alt={offering.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 text-xs flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-[#64748B] uppercase font-semibold block">
                      {offering.product.category}
                    </span>
                    <h4 className="font-bold text-sm text-[#14283F] truncate">
                      {offering.product.name}
                    </h4>
                    <p className="text-[11px] text-[#64748B] line-clamp-1 mt-0.5">
                      {offering.product.material}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-mono font-bold text-sm text-[#14283F]">
                      ₹{offering.product.unitPrice}
                    </span>
                    <span className="text-[10px] text-[#64748B]">{offering.product.priceUnit}</span>
                    <span className="text-[10px] text-[#0F766E] font-medium ml-auto">
                      {offering.product.leadTimeDays}d Lead Time
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quote Submission Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-lg p-6 text-xs text-[#172033] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="font-bold text-sm text-[#14283F]">
                Submit Commercial Quotation
              </h3>
              <button
                type="button"
                onClick={() => setShowQuoteModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#14283F] font-semibold mb-1">
                    Quoted Unit Rate (₹) *
                  </label>
                  <input
                    type="number"
                    value={quotedPrice}
                    onChange={(e) => setQuotedPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl font-mono text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#14283F] font-semibold mb-1">
                    Production Lead Time (Days) *
                  </label>
                  <input
                    type="number"
                    value={quotedLeadTime}
                    onChange={(e) => setQuotedLeadTime(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#14283F] font-semibold mb-1">
                  Freight & Delivery Terms
                </label>
                <input
                  type="text"
                  value={deliveryTerms}
                  onChange={(e) => setDeliveryTerms(e.target.value)}
                  className="w-full p-2.5 bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[#14283F] font-semibold mb-1">
                  Quote Validity Period
                </label>
                <input
                  type="text"
                  value={quoteValidity}
                  onChange={(e) => setQuoteValidity(e.target.value)}
                  className="w-full p-2.5 bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[#14283F] font-semibold mb-1">
                  Commercial Remarks / Concessions
                </label>
                <textarea
                  rows={2}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full p-2.5 bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl text-xs resize-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowQuoteModal(null)}
                className="px-4 py-2 border border-[#E2E8F0] rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSendQuote(showQuoteModal)}
                className="px-5 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Transmit Quote to Buyer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleSaveProduct}
            className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-lg p-6 text-xs text-[#172033] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="font-bold text-sm text-[#14283F]">
                List New Manufactured Component
              </h3>
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[#14283F] font-semibold mb-1">Product Title *</label>
                <input
                  type="text"
                  placeholder="e.g. CNC Splined Tractor Transmission Bush"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full p-2.5 bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#14283F] font-semibold mb-1">Sector Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl text-xs"
                  >
                    <option value="Textiles & Fabrics">Textiles & Fabrics</option>
                    <option value="CNC Machining & Precision Parts">CNC Machining & Precision Parts</option>
                    <option value="Pumps & Electric Motors">Pumps & Electric Motors</option>
                    <option value="Brass Hardware & Valves">Brass Hardware & Valves</option>
                    <option value="Industrial Fasteners">Industrial Fasteners</option>
                    <option value="Pipes & Industrial Tubes">Pipes & Industrial Tubes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#14283F] font-semibold mb-1">Material Spec</label>
                  <input
                    type="text"
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value)}
                    className="w-full p-2.5 bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#14283F] font-semibold mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl font-mono text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#14283F] font-semibold mb-1">MOQ</label>
                  <input
                    type="number"
                    value={newMoq}
                    onChange={(e) => setNewMoq(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl font-mono text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#14283F] font-semibold mb-1">Lead Time (d)</label>
                  <input
                    type="number"
                    value={newLeadTime}
                    onChange={(e) => setNewLeadTime(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl font-mono text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                className="px-4 py-2 border border-[#E2E8F0] rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#14283F] text-white font-bold rounded-xl text-xs hover:bg-[#0A1624] transition-colors cursor-pointer"
              >
                Publish Offering
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
