import React from 'react';
import {
  Compass,
  Bookmark,
  Users,
  FileSpreadsheet,
  BrainCircuit,
  LayoutDashboard,
  Boxes,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    role,
    activeTab,
    setActiveTab,
    shortlistIds,
    matches,
    rfqs,
  } = useApp();

  const buyerNavItems = [
    {
      id: 'discover',
      label: 'Discover Suppliers',
      icon: Compass,
      description: 'Swipe-based MSME discovery',
    },
    {
      id: 'shortlist',
      label: 'Shortlist & Compare',
      icon: Bookmark,
      badge: shortlistIds.length > 0 ? shortlistIds.length : undefined,
      description: 'Vetted supplier matrix',
    },
    {
      id: 'matches',
      label: 'Mutual Connections',
      icon: Users,
      badge: matches.length > 0 ? matches.length : undefined,
      badgeColor: 'bg-[#0F766E]',
      description: 'Reciprocal matches & chat',
    },
    {
      id: 'procurement',
      label: 'AI Procurement',
      icon: BrainCircuit,
      description: 'Trade-offs & recommendation',
    },
    {
      id: 'rfqs',
      label: 'RFQs & Orders',
      icon: FileSpreadsheet,
      badge: rfqs.length > 0 ? rfqs.length : undefined,
      description: 'Quotation deal tracking',
    },
  ];

  const manufacturerNavItems = [
    {
      id: 'manufacturer-dashboard',
      label: 'Inbound Demand',
      icon: LayoutDashboard,
      description: 'Buyer traffic & metrics',
    },
    {
      id: 'rfqs',
      label: 'Incoming RFQs',
      icon: FileSpreadsheet,
      badge: rfqs.filter((r) => r.status === 'RFQ Requested').length || undefined,
      badgeColor: 'bg-[#F59E0B]',
      description: 'Submit formal quotations',
    },
    {
      id: 'matches',
      label: 'Connected Buyers',
      icon: Users,
      badge: matches.length > 0 ? matches.length : undefined,
      badgeColor: 'bg-[#0F766E]',
      description: 'Active commercial threads',
    },
    {
      id: 'discover',
      label: 'Marketplace View',
      icon: Compass,
      description: 'Preview buyer discovery card',
    },
  ];

  const navItems = role === 'buyer' ? buyerNavItems : manufacturerNavItems;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#E2E8F0] shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Section Kicker */}
          <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider px-3 mb-2">
            {role === 'buyer' ? 'Strategic Procurement' : 'MSME Factory Hub'}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all text-xs font-medium ${
                    isActive
                      ? 'bg-[#14283F] text-white shadow-sm font-semibold'
                      : 'text-[#172033] hover:bg-[#F5F7FA] hover:text-[#14283F]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? 'text-[#F59E0B]'
                          : 'text-[#64748B]'
                      }`}
                    />
                    <div className="truncate">
                      <div className="truncate">{item.label}</div>
                    </div>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`ml-2 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-md text-white ${
                        isActive
                          ? 'bg-amber-500 text-slate-900'
                          : item.badgeColor || 'bg-[#14283F]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Industrial Trust & Network Footnote */}
        <div className="pt-4 border-t border-[#E2E8F0]">
          <div className="p-3 bg-[#F5F7FA] rounded-xl border border-[#E2E8F0]/80">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#14283F] mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Make in India MSME Pulse</span>
            </div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              100% verified GSTIN registries and audited MSME manufacturing clusters across 12 states.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
