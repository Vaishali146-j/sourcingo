import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Bookmark,
  Zap,
  RotateCcw,
  Info,
  Check,
  ChevronRight,
  Filter,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SupplierCard } from './SupplierCard';

interface SupplierCardStackProps {
  onOpenDetails: () => void;
  onOpenRFQ: () => void;
  onResetFilters: () => void;
}

export const SupplierCardStack: React.FC<SupplierCardStackProps> = ({
  onOpenDetails,
  onOpenRFQ,
  onResetFilters,
}) => {
  const {
    visibleOfferings,
    currentOffering,
    handleSwipe,
    undoSwipe,
    canUndo,
    shortlistIds,
    setSelectedSupplierDetail,
    openRFQModal,
  } = useApp();

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeExitDirection, setSwipeExitDirection] = useState<'left' | 'right' | 'up' | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });

  // Handle pointer down / touch start
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
      return;
    }
    setIsDragging(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 110;
    if (dragOffset.x > threshold) {
      triggerSwipeAction('shortlist');
    } else if (dragOffset.x < -threshold) {
      triggerSwipeAction('reject');
    } else if (dragOffset.y < -threshold * 1.3) {
      triggerSwipeAction('rfq');
    } else {
      // Snap back
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const triggerSwipeAction = (action: 'reject' | 'shortlist' | 'rfq') => {
    if (!currentOffering) return;

    if (action === 'reject') {
      setSwipeExitDirection('left');
    } else if (action === 'shortlist') {
      setSwipeExitDirection('right');
    } else if (action === 'rfq') {
      setSwipeExitDirection('up');
    }

    setTimeout(() => {
      handleSwipe(action, currentOffering.id);
      setDragOffset({ x: 0, y: 0 });
      setSwipeExitDirection(null);
    }, 280);
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowLeft' || e.key === 'x') {
        e.preventDefault();
        triggerSwipeAction('reject');
      } else if (e.key === 'ArrowRight' || e.key === 'l') {
        e.preventDefault();
        triggerSwipeAction('shortlist');
      } else if (e.key === 'ArrowUp' || e.key === 'r') {
        e.preventDefault();
        triggerSwipeAction('rfq');
      } else if ((e.key === 'z' || e.key === 'Z') && canUndo) {
        e.preventDefault();
        undoSwipe();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentOffering, canUndo]);

  if (!currentOffering) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 sm:p-12 text-center max-w-xl mx-auto my-6 card-elevation">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#14283F]">
          <Check className="w-8 h-8 text-[#0F766E]" />
        </div>
        <h3 className="text-xl font-bold text-[#14283F] mb-2">Discovery Queue Completed</h3>
        <p className="text-sm text-[#64748B] mb-6 leading-relaxed">
          You have reviewed all available MSME manufacturers matching your current filters. You currently have{' '}
          <strong className="text-[#14283F]">{shortlistIds.length} suppliers</strong> in your shortlist.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onResetFilters}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#14283F] text-white text-xs font-semibold rounded-xl hover:bg-[#0A1624] transition-colors cursor-pointer"
          >
            Reset Filters & View All
          </button>
          {canUndo && (
            <button
              type="button"
              onClick={undoSwipe}
              className="w-full sm:w-auto px-5 py-2.5 bg-white border border-[#E2E8F0] text-[#172033] text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-[#64748B]" />
              Undo Last Pass
            </button>
          )}
        </div>
      </div>
    );
  }

  // Calculate card transform styles during drag or animated exit
  const rotation = isDragging ? dragOffset.x * 0.08 : 0;
  const opacity = isDragging ? Math.max(0.6, 1 - Math.abs(dragOffset.x) / 600) : 1;

  let transformStyle = `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0px) rotate(${rotation}deg)`;
  let transitionStyle = isDragging ? 'none' : 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease';

  if (swipeExitDirection === 'left') {
    transformStyle = 'translate3d(-600px, 40px, 0px) rotate(-22deg)';
    transitionStyle = 'transform 0.28s ease-in, opacity 0.28s ease-in';
  } else if (swipeExitDirection === 'right') {
    transformStyle = 'translate3d(600px, 40px, 0px) rotate(22deg)';
    transitionStyle = 'transform 0.28s ease-in, opacity 0.28s ease-in';
  } else if (swipeExitDirection === 'up') {
    transformStyle = 'translate3d(0px, -600px, 0px)';
    transitionStyle = 'transform 0.28s ease-in, opacity 0.28s ease-in';
  }

  const nextOffering = visibleOfferings[1];

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Keyboard Shortcut Indicator */}
      <div className="hidden lg:flex items-center gap-3 text-[11px] text-[#64748B] mb-2">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded font-mono text-[10px]">←</kbd> Pass
        </span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded font-mono text-[10px]">↑</kbd> Instant RFQ
        </span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded font-mono text-[10px]">→</kbd> Shortlist
        </span>
        {canUndo && (
          <>
            <span>·</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded font-mono text-[10px]">Z</kbd> Undo
            </span>
          </>
        )}
      </div>

      {/* Card Deck Viewport */}
      <div className="relative w-full aspect-[4/5] sm:aspect-auto sm:h-[660px]">
        {/* Next Card in Stack (peeking beneath) */}
        {nextOffering && (
          <div
            className="absolute inset-0 pointer-events-none transform scale-[0.96] translate-y-3 opacity-60 transition-transform duration-300"
            aria-hidden="true"
          >
            <SupplierCard offering={nextOffering} />
          </div>
        )}

        {/* Active Top Card */}
        <div
          ref={cardRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            transform: transformStyle,
            transition: transitionStyle,
            opacity: swipeExitDirection ? 0 : opacity,
            touchAction: 'none',
          }}
          className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing"
        >
          <SupplierCard
            offering={currentOffering}
            onViewDetails={() => {
              setSelectedSupplierDetail(currentOffering);
              onOpenDetails();
            }}
            onRequestQuote={() => {
              openRFQModal(currentOffering);
              onOpenRFQ();
            }}
          />

          {/* Swipe Feedback Overlays */}
          {/* PASS / REJECT Overlay (Red) */}
          <div
            className={`absolute top-8 right-8 z-30 pointer-events-none border-4 border-[#DC2626] text-[#DC2626] font-extrabold text-2xl uppercase tracking-widest px-4 py-1.5 rounded-xl transform rotate-12 transition-opacity ${
              dragOffset.x < -40 || swipeExitDirection === 'left' ? 'opacity-90' : 'opacity-0'
            }`}
          >
            PASS
          </div>

          {/* SHORTLIST Overlay (Green / Teal) */}
          <div
            className={`absolute top-8 left-8 z-30 pointer-events-none border-4 border-[#0F766E] text-[#0F766E] font-extrabold text-2xl uppercase tracking-widest px-4 py-1.5 rounded-xl transform -rotate-12 transition-opacity ${
              dragOffset.x > 40 || swipeExitDirection === 'right' ? 'opacity-90' : 'opacity-0'
            }`}
          >
            SHORTLIST
          </div>

          {/* RFQ / SUPER LIKE Overlay (Signal Amber) */}
          <div
            className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none border-4 border-[#F59E0B] text-[#F59E0B] bg-[#14283F]/90 font-extrabold text-2xl uppercase tracking-widest px-5 py-2 rounded-xl transition-opacity ${
              dragOffset.y < -60 || swipeExitDirection === 'up' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            INSTANT RFQ
          </div>
        </div>
      </div>

      {/* Tactile Control Buttons Bar beneath Card */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mt-5 select-none">
        {/* Undo Button */}
        <button
          type="button"
          onClick={undoSwipe}
          disabled={!canUndo}
          className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
            canUndo
              ? 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#14283F] hover:border-slate-400 shadow-sm cursor-pointer active:scale-95'
              : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
          }`}
          title="Undo last swipe (Z)"
          aria-label="Undo previous action"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Reject / Pass Button */}
        <button
          type="button"
          onClick={() => triggerSwipeAction('reject')}
          className="w-14 h-14 rounded-full bg-white border border-[#E2E8F0] text-[#DC2626] hover:bg-red-50 hover:border-red-200 shadow-md flex items-center justify-center transition-all cursor-pointer active:scale-90 group"
          title="Pass on supplier (Left Arrow)"
          aria-label="Reject supplier"
        >
          <X className="w-7 h-7 group-hover:scale-110 transition-transform stroke-[2.5]" />
        </button>

        {/* Super Like / Instant RFQ Button */}
        <button
          type="button"
          onClick={() => triggerSwipeAction('rfq')}
          className="w-12 h-12 rounded-full bg-[#14283F] border border-slate-700 text-[#F59E0B] hover:bg-[#0A1624] shadow-md flex items-center justify-center transition-all cursor-pointer active:scale-90 group"
          title="Direct Request for Quote (Up Arrow)"
          aria-label="Request quote directly"
        >
          <Zap className="w-5 h-5 fill-[#F59E0B] group-hover:scale-110 transition-transform" />
        </button>

        {/* Shortlist / Express Interest Button */}
        <button
          type="button"
          onClick={() => triggerSwipeAction('shortlist')}
          className="w-14 h-14 rounded-full bg-white border border-[#E2E8F0] text-[#0F766E] hover:bg-teal-50 hover:border-teal-200 shadow-md flex items-center justify-center transition-all cursor-pointer active:scale-90 group"
          title="Shortlist & check mutual match (Right Arrow)"
          aria-label="Shortlist supplier"
        >
          <Bookmark className="w-7 h-7 fill-[#0F766E]/20 text-[#0F766E] group-hover:scale-110 transition-transform stroke-[2.5]" />
        </button>

        {/* Factory Profile Details Button */}
        <button
          type="button"
          onClick={() => {
            if (currentOffering) {
              setSelectedSupplierDetail(currentOffering);
              onOpenDetails();
            }
          }}
          className="w-11 h-11 rounded-full bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#14283F] hover:border-slate-400 shadow-sm flex items-center justify-center transition-all cursor-pointer active:scale-95"
          title="Detailed Manufacturer & Plant Audit"
          aria-label="View factory details"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
