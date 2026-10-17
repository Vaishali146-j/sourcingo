import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { DiscoveryView } from './components/discovery/DiscoveryView';
import { RequirementParserModal } from './components/discovery/RequirementParserModal';
import { SupplierDetailModal } from './components/discovery/SupplierDetailModal';
import { ShortlistView } from './components/shortlist/ShortlistView';
import { ConnectionsInboxView } from './components/matches/ConnectionsInboxView';
import { MatchCelebrationModal } from './components/matches/MatchCelebrationModal';
import { ProcurementAssistantView } from './components/procurement/ProcurementAssistantView';
import { OrdersQuotationTracker } from './components/rfq/OrdersQuotationTracker';
import { RFQModal } from './components/rfq/RFQModal';
import { ManufacturerDashboardView } from './components/manufacturer/ManufacturerDashboardView';
import { SupplierOffering, MatchConnection } from './types';
import { X, Compass, Bookmark, Users, FileSpreadsheet, BrainCircuit, LayoutDashboard } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    role,
    rfqModalOffering,
    openRFQModal,
    closeRFQModal,
    selectedSupplierDetail,
    setSelectedSupplierDetail,
    shortlistIds,
    matches,
    rfqs,
  } = useApp();

  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenRFQForOffering = (offering: SupplierOffering) => {
    openRFQModal(offering);
  };

  const handleOpenDetailsForOffering = (offering: SupplierOffering) => {
    setSelectedSupplierDetail(offering);
    setIsDetailsModalOpen(true);
  };

  const handleOpenRFQForMatch = (match: MatchConnection) => {
    openRFQModal(match.matchedOffering);
  };

  const handleOpenDetailsForMatch = (match: MatchConnection) => {
    setSelectedSupplierDetail(match.matchedOffering);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#172033] flex flex-col font-sans">
      {/* Global Application Header */}
      <Header
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenRequirementModal={() => setIsRequirementModalOpen(true)}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex w-full">
        {/* Desktop Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 flex flex-col overflow-x-hidden pb-16 md:pb-6">
          {activeTab === 'discover' && (
            <DiscoveryView
              onOpenRequirementModal={() => setIsRequirementModalOpen(true)}
              onOpenRFQModal={() => {}}
              onOpenDetailsModal={() => setIsDetailsModalOpen(true)}
            />
          )}

          {activeTab === 'shortlist' && (
            <ShortlistView
              onOpenRFQ={handleOpenRFQForOffering}
              onOpenDetails={handleOpenDetailsForOffering}
            />
          )}

          {activeTab === 'matches' && (
            <ConnectionsInboxView
              onOpenRFQ={handleOpenRFQForMatch}
              onOpenDetails={handleOpenDetailsForMatch}
            />
          )}

          {activeTab === 'procurement' && (
            <ProcurementAssistantView
              onOpenRFQ={handleOpenRFQForOffering}
              onOpenDetails={handleOpenDetailsForOffering}
            />
          )}

          {activeTab === 'rfqs' && <OrdersQuotationTracker />}

          {activeTab === 'manufacturer-dashboard' && <ManufacturerDashboardView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Mobile Slide-over Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 bg-[#14283F] text-white p-5 flex flex-col justify-between shadow-2xl z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <span className="font-bold text-lg text-white">Sourcingo</span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-4 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('discover');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-semibold ${
                    activeTab === 'discover' ? 'bg-[#F59E0B] text-slate-950' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4" />
                    <span>Discover Suppliers</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('shortlist');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-semibold ${
                    activeTab === 'shortlist' ? 'bg-[#F59E0B] text-slate-950' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4" />
                    <span>Shortlist & Compare</span>
                  </div>
                  {shortlistIds.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px]">
                      {shortlistIds.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('matches');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-semibold ${
                    activeTab === 'matches' ? 'bg-[#F59E0B] text-slate-950' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Mutual Connections</span>
                  </div>
                  {matches.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-teal-500 text-white text-[10px]">
                      {matches.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('procurement');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-semibold ${
                    activeTab === 'procurement' ? 'bg-[#F59E0B] text-slate-950' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4" />
                    <span>AI Procurement Advisor</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('rfqs');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-semibold ${
                    activeTab === 'rfqs' ? 'bg-[#F59E0B] text-slate-950' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>RFQs & Quotation Deals</span>
                  </div>
                  {rfqs.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px]">
                      {rfqs.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('manufacturer-dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-semibold ${
                    activeTab === 'manufacturer-dashboard' ? 'bg-[#F59E0B] text-slate-950' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Manufacturer Workspace</span>
                  </div>
                </button>
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-700 text-[11px] text-slate-400">
              Indian MSME Matchmaking Prototype
            </div>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <RequirementParserModal
        isOpen={isRequirementModalOpen}
        onClose={() => setIsRequirementModalOpen(false)}
      />

      <SupplierDetailModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onOpenRFQ={() => {
          setIsDetailsModalOpen(false);
          if (selectedSupplierDetail) openRFQModal(selectedSupplierDetail);
        }}
      />

      <RFQModal
        isOpen={Boolean(rfqModalOffering)}
        onClose={closeRFQModal}
        offering={rfqModalOffering}
      />

      <MatchCelebrationModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
