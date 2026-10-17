import React from 'react';
import {
  Sparkles,
  Zap,
  ArrowRight,
  Handshake,
  Building2,
  CheckCircle2,
  X,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MatchCelebrationModal: React.FC = () => {
  const {
    activeMatchForCelebration,
    dismissCelebration,
    setActiveTab,
    openRFQModal,
  } = useApp();

  if (!activeMatchForCelebration) return null;

  const { buyerBusiness, manufacturerBusiness, matchedOffering } = activeMatchForCelebration;

  const handleViewConnection = () => {
    dismissCelebration();
    setActiveTab('matches');
  };

  const handleRequestQuote = () => {
    dismissCelebration();
    openRFQModal(matchedOffering);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#14283F] border border-slate-700 text-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 text-center relative overflow-hidden">
        {/* Background Subtle Gradient & Industrial Pattern */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          type="button"
          onClick={dismissCelebration}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebratory Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#0F766E] p-0.5 mx-auto mb-4 shadow-xl">
          <div className="w-full h-full bg-[#14283F] rounded-[14px] flex items-center justify-center text-amber-400">
            <Handshake className="w-8 h-8" />
          </div>
        </div>

        {/* Professional Header */}
        <div className="text-xs uppercase tracking-widest font-mono text-amber-400 font-bold mb-1">
          Reciprocal Interest Verified
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          It’s a Match!
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed mb-6">
          Both <strong className="text-white">{buyerBusiness.name}</strong> and{' '}
          <strong className="text-white">{manufacturerBusiness.name}</strong> have expressed mutual interest. Direct commercial communication channel is now open.
        </p>

        {/* Visual Dual Business Badges Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 mb-6">
          <div className="flex items-center justify-between gap-3">
            {/* Buyer Badge */}
            <div className="flex-1 text-center sm:text-left flex flex-col items-center sm:items-start">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-700 border border-slate-600 mb-2">
                <img
                  src={buyerBusiness.logo}
                  alt={buyerBusiness.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="font-bold text-xs sm:text-sm text-white truncate max-w-[120px] sm:max-w-none">
                {buyerBusiness.name}
              </div>
              <span className="text-[10px] text-slate-400">
                {buyerBusiness.city}, {buyerBusiness.state}
              </span>
            </div>

            {/* Connection Link */}
            <div className="flex flex-col items-center justify-center px-2">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
              </div>
              <span className="text-[9px] font-mono uppercase text-teal-400 tracking-wider mt-1">
                Connected
              </span>
            </div>

            {/* Manufacturer Badge */}
            <div className="flex-1 text-center sm:text-right flex flex-col items-center sm:items-end">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-700 border border-slate-600 mb-2">
                <img
                  src={manufacturerBusiness.logo}
                  alt={manufacturerBusiness.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="font-bold text-xs sm:text-sm text-white truncate max-w-[120px] sm:max-w-none">
                {manufacturerBusiness.name}
              </div>
              <span className="text-[10px] text-slate-400">
                {manufacturerBusiness.city}, {manufacturerBusiness.state}
              </span>
            </div>
          </div>

          {/* Matched Product Snippet */}
          <div className="mt-4 pt-3 border-t border-slate-700/60 text-left text-xs text-slate-300 flex items-center justify-between">
            <span className="truncate text-slate-400">
              Matched on: <strong className="text-white">{matchedOffering.product.name}</strong>
            </span>
            <span className="font-mono text-amber-400 font-bold ml-2 shrink-0">
              ₹{matchedOffering.product.unitPrice} {matchedOffering.product.priceUnit}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleRequestQuote}
            className="w-full py-3 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Request Official Quotation (RFQ)</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleViewConnection}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-teal-400" />
              <span>Open Commercial Chat</span>
            </button>

            <button
              type="button"
              onClick={dismissCelebration}
              className="flex-1 py-2.5 bg-transparent hover:bg-slate-800/40 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              Continue Discovering
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
