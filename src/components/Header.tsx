import React, { useState } from 'react';
import {
  Search,
  Bell,
  ArrowRightLeft,
  Building2,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  Factory,
  Briefcase,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenRequirementModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenRequirementModal,
}) => {
  const {
    role,
    toggleRole,
    activeBuyer,
    activeManufacturer,
    setActiveManufacturerId,
    offerings,
    matches,
    rfqs,
    setActiveTab,
  } = useApp();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Calculate unread or active notifications
  const pendingRfqsCount = rfqs.filter((r) => r.status === 'Quote Received' || r.status === 'RFQ Requested').length;
  const activeMatchesCount = matches.length;

  return (
    <header className="sticky top-0 z-40 bg-[#14283F] text-white border-b border-slate-700/80">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Trigger + Brand Identity */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 -ml-2 text-slate-300 hover:text-white focus:outline-none"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Geometric Sourcingo Brandmark & Wordmark */}
          <div
            onClick={() => setActiveTab(role === 'buyer' ? 'discover' : 'manufacturer-dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            {/* Geometric Linked Chain / Sourcing Node Icon */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#B45309] p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#14283F] rounded-[10px] flex items-center justify-center relative overflow-hidden">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-[#F59E0B] transition-transform duration-300 group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Geometric Interlocking Supply Links */}
                  <circle cx="8" cy="8" r="3.5" />
                  <circle cx="16" cy="16" r="3.5" />
                  <path d="M10.5 10.5L13.5 13.5" stroke="#FFFFFF" strokeWidth="2.4" />
                  <circle cx="12" cy="12" r="1.5" fill="#F59E0B" />
                </svg>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-white font-sans">
                  Sourcingo
                </span>
                <span className="text-[10px] font-mono tracking-wider uppercase text-amber-400 font-semibold px-1 py-0.2 bg-amber-500/10 rounded border border-amber-500/20">
                  B2B
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:block tracking-wide -mt-0.5">
                Indian MSME Industrial Network
              </span>
            </div>
          </div>
        </div>

        {/* Center: Natural Language Quick Search / Smart Requirement Trigger */}
        <div className="flex-1 max-w-xl mx-2 hidden lg:block">
          <button
            type="button"
            onClick={onOpenRequirementModal}
            className="w-full h-10 px-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-left flex items-center justify-between text-xs text-slate-300 transition-all shadow-inner group"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-4 h-4 text-[#F59E0B] shrink-0" />
              <span className="truncate group-hover:text-white transition-colors">
                e.g., “Need 5,000m cotton fabric under ₹150/m from Gujarat within 2 weeks”
              </span>
            </div>
            <span className="shrink-0 text-[11px] font-medium bg-[#14283F] border border-slate-600 px-2 py-0.5 rounded text-slate-400">
              AI Parse
            </span>
          </button>
        </div>

        {/* Right: Role Switcher & Profile Navigation */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick Requirement on tablet/mobile */}
          <button
            type="button"
            onClick={onOpenRequirementModal}
            className="lg:hidden p-2 text-slate-300 hover:text-white bg-slate-800/70 border border-slate-700 rounded-lg text-xs flex items-center gap-1.5"
            title="Parse Procurement Requirement"
          >
            <Search className="w-4 h-4 text-[#F59E0B]" />
            <span className="hidden sm:inline text-xs">Search</span>
          </button>

          {/* Role Switcher Pill/Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 text-xs text-slate-200 transition-colors cursor-pointer"
              aria-label="Switch between Industrial Buyer and MSME Manufacturer workspace"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  role === 'buyer' ? 'bg-[#F59E0B]' : 'bg-[#0F766E]'
                }`}
              />
              <span className="font-semibold text-white">
                {role === 'buyer' ? 'Buyer Mode' : 'Manufacturer Mode'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Role Switcher Dropdown */}
            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-[#14283F] border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs">
                <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/80 mb-1">
                  Active Demonstration Workspace
                </div>

                {/* Switch to Buyer */}
                <button
                  type="button"
                  onClick={() => {
                    if (role !== 'buyer') toggleRole();
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full p-2.5 rounded-lg text-left flex items-start gap-3 transition-colors ${
                    role === 'buyer'
                      ? 'bg-slate-800/90 border border-amber-500/40 text-white'
                      : 'hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{activeBuyer.name}</span>
                      {role === 'buyer' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      Buyer · {activeBuyer.city}, {activeBuyer.state}
                    </p>
                    <span className="text-[10px] text-amber-400/90 font-medium">
                      Tinder-style discovery, shortlists, AI procurement
                    </span>
                  </div>
                </button>

                {/* Switch to Manufacturer */}
                <div className="mt-1 pt-1 border-t border-slate-700/60">
                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase">
                    Select Indian MSME Manufacturer:
                  </div>

                  {offerings.slice(0, 3).map((item) => (
                    <button
                      key={item.manufacturer.id}
                      type="button"
                      onClick={() => {
                        setActiveManufacturerId(item.manufacturer.id);
                        if (role !== 'manufacturer') toggleRole();
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full p-2 rounded-lg text-left flex items-start gap-2.5 transition-colors mb-1 ${
                        role === 'manufacturer' && activeManufacturer.id === item.manufacturer.id
                          ? 'bg-slate-800/90 border border-teal-500/40 text-white'
                          : 'hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <Factory className="w-3.5 h-3.5 text-[#0F766E] mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white truncate text-xs">
                            {item.manufacturer.name}
                          </span>
                          {role === 'manufacturer' && activeManufacturer.id === item.manufacturer.id && (
                            <Check className="w-3.5 h-3.5 text-teal-400" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {item.manufacturer.city}, {item.manufacturer.state} · {item.product.category}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors relative"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {pendingRfqsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#F59E0B]" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-[#14283F] border border-slate-700 rounded-xl shadow-2xl p-3 z-50 text-xs">
                <div className="font-semibold text-white mb-2 flex items-center justify-between">
                  <span>Industrial Activity</span>
                  <span className="text-[10px] text-slate-400">Live Updates</span>
                </div>
                <div className="space-y-2">
                  <div
                    onClick={() => {
                      setActiveTab('matches');
                      setShowNotifications(false);
                    }}
                    className="p-2 bg-slate-800/80 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
                  >
                    <div className="font-medium text-teal-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      Mutual Match Connected
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Sabarmati Weaving accepted interest for heavy duck canvas.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setActiveTab('rfqs');
                      setShowNotifications(false);
                    }}
                    className="p-2 bg-slate-800/80 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
                  >
                    <div className="font-medium text-amber-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Quotation Received
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Formal quotation ₹140/m submitted for RFQ-GJ-2026-081.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700 border border-slate-600 shrink-0">
              <img
                src={role === 'buyer' ? activeBuyer.logo : activeManufacturer.logo}
                alt={role === 'buyer' ? activeBuyer.name : activeManufacturer.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight truncate max-w-[140px]">
                {role === 'buyer' ? activeBuyer.name : activeManufacturer.name}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#0F766E]" />
                GST & MSME Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
