import React from 'react';
import {
  Compass,
  Bookmark,
  Users,
  FileSpreadsheet,
  BrainCircuit,
  LayoutDashboard,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const {
    role,
    activeTab,
    setActiveTab,
    shortlistIds,
    matches,
    rfqs,
  } = useApp();

  const buyerNav = [
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'shortlist', label: 'Shortlist', icon: Bookmark, badge: shortlistIds.length || undefined },
    { id: 'matches', label: 'Matches', icon: Users, badge: matches.length || undefined },
    { id: 'procurement', label: 'AI Advisor', icon: BrainCircuit },
    { id: 'rfqs', label: 'RFQs', icon: FileSpreadsheet, badge: rfqs.length || undefined },
  ];

  const mfgNav = [
    { id: 'manufacturer-dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'rfqs', label: 'Quotes', icon: FileSpreadsheet, badge: rfqs.length || undefined },
    { id: 'matches', label: 'Buyers', icon: Users, badge: matches.length || undefined },
    { id: 'discover', label: 'Feed Preview', icon: Compass },
  ];

  const items = role === 'buyer' ? buyerNav : mfgNav;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#14283F] border-t border-slate-700/80 px-2 py-1 safe-area-inset-bottom">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 py-1.5 flex flex-col items-center justify-center relative transition-colors ${
                isActive ? 'text-[#F59E0B]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold rounded-full bg-[#F59E0B] text-slate-950 min-w-3.5 text-center leading-3">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-semibold text-white' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
