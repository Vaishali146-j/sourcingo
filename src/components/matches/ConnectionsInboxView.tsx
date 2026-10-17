import React, { useState } from 'react';
import {
  Users,
  MessageSquare,
  Zap,
  Phone,
  Mail,
  Send,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MatchConnection } from '../../types';

interface ConnectionsInboxViewProps {
  onOpenRFQ: (match: MatchConnection) => void;
  onOpenDetails: (match: MatchConnection) => void;
}

export const ConnectionsInboxView: React.FC<ConnectionsInboxViewProps> = ({
  onOpenRFQ,
  onOpenDetails,
}) => {
  const {
    matches,
    activeBuyer,
    activeManufacturer,
    role,
    sendConnectionMessage,
    setActiveTab,
  } = useApp();

  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    matches.length > 0 ? matches[0].id : ''
  );
  const [messageInput, setMessageInput] = useState('');

  const currentMatch = matches.find((m) => m.id === selectedMatchId) || matches[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentMatch) return;
    sendConnectionMessage(currentMatch.id, messageInput.trim());
    setMessageInput('');
  };

  if (matches.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-[#64748B]">
          <Users className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#14283F] mb-2">No Mutual Connections Yet</h3>
        <p className="text-sm text-[#64748B] mb-6 leading-relaxed">
          In Sourcingo, a genuine connection forms when both businesses show reciprocal interest. Continue discovering verified MSMEs to trigger mutual connections.
        </p>
        <button
          type="button"
          onClick={() => setActiveTab('discover')}
          className="px-5 py-2.5 bg-[#14283F] text-white text-xs font-semibold rounded-xl hover:bg-[#0A1624] transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Compass className="w-4 h-4 text-amber-400" />
          <span>Discover Suppliers</span>
        </button>
      </div>
    );
  }

  const partnerBusiness =
    role === 'buyer'
      ? currentMatch.manufacturerBusiness
      : currentMatch.buyerBusiness;

  return (
    <div className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#14283F] tracking-tight">
              Mutual Business Connections
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#0F766E] text-white">
              {matches.length} Verified
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Reciprocal connections with direct commercial contacts and messaging.
          </p>
        </div>

        <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-[#0F766E] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            <strong>Distinction:</strong> Unlike simple shortlists, these entities have mutually validated sourcing interest.
          </span>
        </div>
      </div>

      {/* Main Split Interface: Connections List & Interactive Chat Pane */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] card-elevation overflow-hidden flex-1 flex flex-col md:flex-row min-h-[560px] max-h-[75vh]">
        {/* Left Column: Connections Threads */}
        <div className="w-full md:w-80 border-r border-[#E2E8F0] flex flex-col bg-[#F5F7FA] shrink-0">
          <div className="p-3.5 border-b border-[#E2E8F0] text-xs font-bold text-[#14283F] uppercase tracking-wider bg-white">
            Active Commercial Channels
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-[#E2E8F0]">
            {matches.map((item) => {
              const partner = role === 'buyer' ? item.manufacturerBusiness : item.buyerBusiness;
              const isSelected = item.id === currentMatch.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedMatchId(item.id)}
                  className={`w-full p-4 text-left transition-colors cursor-pointer flex items-start gap-3 ${
                    isSelected ? 'bg-white border-l-4 border-l-[#0F766E]' : 'hover:bg-slate-100/80'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-[#14283F] truncate">
                        {partner.name}
                      </h4>
                      <span className="text-[10px] text-[#64748B] font-mono shrink-0">
                        {item.lastMessageTimestamp?.split(',')[0] || 'Active'}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                      {partner.city}, {partner.state}
                    </p>

                    <p className="text-[11px] text-[#172033] font-medium truncate mt-1">
                      {item.lastMessage || 'Reciprocal connection verified'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Conversation & Partner Profile Header */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Partner Info Header */}
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between gap-4 bg-white shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-[#E2E8F0] shrink-0">
                <img
                  src={partnerBusiness.logo}
                  alt={partnerBusiness.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#14283F] truncate">
                    {partnerBusiness.name}
                  </h3>
                  <span className="text-[10px] text-[#0F766E] font-medium bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                    Mutual Match
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5 truncate">
                  <span>{partnerBusiness.contact.name} ({partnerBusiness.contact.title})</span>
                  <span>·</span>
                  <span className="font-mono text-[11px]">{partnerBusiness.contact.phone}</span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onOpenDetails(currentMatch)}
                className="px-3 py-1.5 border border-[#E2E8F0] text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Profile
              </button>

              <button
                type="button"
                onClick={() => onOpenRFQ(currentMatch)}
                className="px-3.5 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Request RFQ</span>
              </button>
            </div>
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F5F7FA]">
            {currentMatch.messages.map((msg) => {
              const isMine =
                (role === 'buyer' && msg.senderId === activeBuyer.id) ||
                (role === 'manufacturer' && msg.senderId === activeManufacturer.id);

              if (msg.isSystemNotice) {
                return (
                  <div key={msg.id} className="text-center my-3">
                    <span className="inline-block px-3 py-1 bg-white border border-[#E2E8F0] text-[11px] text-[#64748B] rounded-full shadow-xs">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div className="text-[10px] text-[#64748B] mb-0.5 px-1 font-medium">
                    {msg.senderName} · {msg.timestamp}
                  </div>
                  <div
                    className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                      isMine
                        ? 'bg-[#14283F] text-white rounded-tr-xs'
                        : 'bg-white border border-[#E2E8F0] text-[#172033] rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-[#E2E8F0] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={`Send message to ${partnerBusiness.contact.name}...`}
              className="flex-1 p-2.5 bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#14283F]"
            />
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="px-4 py-2.5 bg-[#14283F] hover:bg-[#0A1624] disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
