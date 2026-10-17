import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import {
  Role,
  GeographicReach,
  ProcurementPriority,
  OrderStatus,
  Business,
  SupplierOffering,
  BuyerRequirement,
  SwipeAction,
  MatchConnection,
  RFQItem,
  QuotationResponse,
  ProcurementAdviceResult,
} from '../types';
import { CURRENT_DEMO_BUYER, MOCK_SUPPLIER_OFFERINGS } from '../data/mockSuppliers';
import { api } from '../api/client';

interface FilterState {
  sector: string;
  maxMoq: number | null;
  maxBudget: number | null;
  geographicReach: GeographicReach;
  selectedStates: string[];
}

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  toggleRole: () => void;
  activeBuyer: Business;
  activeManufacturer: Business;
  setActiveManufacturerId: (id: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Discovery & Swiping
  offerings: SupplierOffering[];
  visibleOfferings: SupplierOffering[];
  currentOffering: SupplierOffering | null;
  swipes: SwipeAction[];
  shortlistIds: string[];
  rejectedIds: string[];
  handleSwipe: (action: 'reject' | 'shortlist' | 'rfq', offeringId?: string) => Promise<void>;
  undoSwipe: () => Promise<void>;
  canUndo: boolean;

  // Requirement & Filters
  activeRequirement: BuyerRequirement | null;
  setActiveRequirement: (req: BuyerRequirement | null) => void;
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  isParsingRequirement: boolean;
  parseNaturalLanguageRequirement: (text: string) => Promise<BuyerRequirement | null>;

  // Shortlist
  shortlistedOfferings: SupplierOffering[];
  removeFromShortlist: (offeringId: string) => void;
  clearShortlist: () => void;

  // Matches & Connections
  matches: MatchConnection[];
  activeMatchForCelebration: MatchConnection | null;
  dismissCelebration: () => void;
  sendConnectionMessage: (matchId: string, text: string) => Promise<void>;
  acceptBuyerInboundInterest: (buyerId: string, offeringId: string) => Promise<void>;

  // RFQ & Quotation Lifecycle
  rfqs: RFQItem[];
  rfqModalOffering: SupplierOffering | null;
  openRFQModal: (offering: SupplierOffering) => void;
  closeRFQModal: () => void;
  createRFQ: (data: {
    offering: SupplierOffering;
    quantity: number;
    unit: string;
    specifications: string;
    deliveryLocation: string;
    deliveryState: string;
    requestedDate: string;
    targetBudget?: number;
    notes?: string;
  }) => Promise<void>;
  submitQuotationResponse: (
    rfqId: string,
    data: {
      unitPrice: number;
      moq: number;
      leadTimeDays: number;
      validity: string;
      deliveryTerms: string;
      notes: string;
    }
  ) => Promise<void>;
  advanceRFQStatus: (rfqId: string, nextStatus: OrderStatus) => Promise<void>;

  // Modals
  selectedSupplierDetail: SupplierOffering | null;
  setSelectedSupplierDetail: (offering: SupplierOffering | null) => void;

  // AI Procurement Assistant
  procurementPriority: ProcurementPriority;
  setProcurementPriority: (priority: ProcurementPriority) => void;
  procurementResult: ProcurementAdviceResult | null;
  isAnalyzingProcurement: boolean;
  procurementError: string | null;
  runProcurementAnalysis: (priorityOverride?: ProcurementPriority) => Promise<void>;

  // Manufacturer Catalog
  addOrUpdateProductOffering: (offering: SupplierOffering) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'sourcingo_v1_state';

const INITIAL_FILTERS: FilterState = {
  sector: 'all',
  maxMoq: null,
  maxBudget: null,
  geographicReach: 'pan-india',
  selectedStates: [],
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('buyer');
  const [activeTab, setActiveTab] = useState<string>('discover');
  const [offerings, setOfferings] = useState<SupplierOffering[]>(MOCK_SUPPLIER_OFFERINGS);
  const [activeManufacturerId, setActiveManufacturerId] = useState<string>(MOCK_SUPPLIER_OFFERINGS[1].manufacturer.id);

  const [activeBuyer, setActiveBuyer] = useState<Business>(CURRENT_DEMO_BUYER);
  const [activeManufacturer, setActiveManufacturer] = useState<Business>(MOCK_SUPPLIER_OFFERINGS[1].manufacturer);

  const [swipes, setSwipes] = useState<SwipeAction[]>([]);
  const [shortlistIds, setShortlistIds] = useState<string[]>(['offering-sabarmati-textiles']);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [activeRequirement, setActiveRequirement] = useState<BuyerRequirement | null>(null);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  const [matches, setMatches] = useState<MatchConnection[]>([]);
  const [activeMatchForCelebration, setActiveMatchForCelebration] = useState<MatchConnection | null>(null);

  const [rfqs, setRfqs] = useState<RFQItem[]>([]);
  const [rfqModalOffering, setRfqModalOffering] = useState<SupplierOffering | null>(null);
  const [selectedSupplierDetail, setSelectedSupplierDetail] = useState<SupplierOffering | null>(null);

  const [isParsingRequirement, setIsParsingRequirement] = useState(false);
  const [procurementPriority, setProcurementPriority] = useState<ProcurementPriority>('Best Overall');
  const [procurementResult, setProcurementResult] = useState<ProcurementAdviceResult | null>(null);
  const [isAnalyzingProcurement, setIsAnalyzingProcurement] = useState(false);
  const [procurementError, setProcurementError] = useState<string | null>(null);

  // Synchronize state with Backend on load
  useEffect(() => {
    async function loadBackendData() {
      try {
        // 1. Session
        const sessionRes = await api.getSession();
        if (sessionRes.success && sessionRes.data) {
          if (sessionRes.data.session?.role) {
            setRole(sessionRes.data.session.role);
          }
          if (sessionRes.data.buyer) {
            setActiveBuyer(sessionRes.data.buyer);
          }
          if (sessionRes.data.manufacturer) {
            setActiveManufacturer(sessionRes.data.manufacturer);
            setActiveManufacturerId(sessionRes.data.manufacturer.id);
          }
        }

        // 2. Matches
        const matchesRes = await api.getMatches();
        if (matchesRes.success && Array.isArray(matchesRes.data)) {
          setMatches(matchesRes.data);
        }

        // 3. RFQs
        const rfqsRes = await api.getRFQs();
        if (rfqsRes.success && Array.isArray(rfqsRes.data)) {
          setRfqs(rfqsRes.data);
        }

        // 4. Discovery Offerings from Backend
        const discoveryRes = await api.getDiscovery();
        if (discoveryRes.success && Array.isArray(discoveryRes.data) && discoveryRes.data.length > 0) {
          setOfferings(discoveryRes.data);
        }
      } catch (err) {
        console.warn('Backend sync failed, using local seed state:', err);
      }
    }

    loadBackendData();
  }, []);

  // Update active manufacturer when activeManufacturerId changes
  useEffect(() => {
    const found = offerings.find((o) => o.manufacturer.id === activeManufacturerId);
    if (found) {
      setActiveManufacturer(found.manufacturer);
    }
  }, [offerings, activeManufacturerId]);

  const toggleRole = async () => {
    const nextRole = role === 'buyer' ? 'manufacturer' : 'buyer';
    setRole(nextRole);
    if (nextRole === 'manufacturer') {
      setActiveTab('manufacturer-dashboard');
    } else {
      setActiveTab('discover');
    }

    try {
      await api.switchRole(nextRole, nextRole === 'buyer' ? activeBuyer.id : activeManufacturer.id);
      // Refresh discovery so own business card is excluded
      const discoveryRes = await api.getDiscovery(filters);
      if (discoveryRes.success && Array.isArray(discoveryRes.data)) {
        setOfferings(discoveryRes.data);
      }
    } catch (e) {
      console.warn('Role switch error on backend:', e);
    }
  };

  // Filter offerings based on active filters and requirements
  // CRITICAL REQUIREMENT: EXCLUDE THE SIGNED-IN USER'S OWN BUSINESS FROM THE CARD INTERFACE!
  const visibleOfferings = useMemo(() => {
    // Current signed in business ID based on active role
    const currentSignedInBusinessId = role === 'manufacturer' ? activeManufacturer.id : activeBuyer.id;

    return offerings.filter((offering) => {
      // 1. EXCLUDE SIGNED-IN USER'S OWN BUSINESS CARD!
      if (offering.manufacturer.id === currentSignedInBusinessId) {
        return false;
      }

      // 2. Exclude already swiped (rejected or currently shortlisted)
      if (rejectedIds.includes(offering.id)) return false;
      if (shortlistIds.includes(offering.id)) return false;

      // 3. Sector filter
      if (filters.sector !== 'all' && offering.product.category !== filters.sector) {
        return false;
      }

      // 4. MOQ filter
      if (filters.maxMoq !== null && offering.product.moq > filters.maxMoq) {
        return false;
      }

      // 5. Budget filter
      if (filters.maxBudget !== null && offering.product.unitPrice > filters.maxBudget) {
        return false;
      }

      // 6. Geographic reach filter
      if (filters.geographicReach === 'state' && filters.selectedStates.length > 0) {
        if (!filters.selectedStates.includes(offering.manufacturer.state)) {
          return false;
        }
      }

      if (filters.geographicReach === 'selected-states' && filters.selectedStates.length > 0) {
        if (!filters.selectedStates.includes(offering.manufacturer.state)) {
          return false;
        }
      }

      // 7. Active requirement hard constraints
      if (activeRequirement) {
        if (
          activeRequirement.preferredLocation.reach === 'state' &&
          activeRequirement.preferredLocation.state &&
          offering.manufacturer.state !== activeRequirement.preferredLocation.state
        ) {
          return false;
        }

        if (activeRequirement.maxBudget && offering.product.unitPrice > activeRequirement.maxBudget * 1.15) {
          return false;
        }

        if (activeRequirement.deadlineDays && offering.product.leadTimeDays > activeRequirement.deadlineDays) {
          return false;
        }
      }

      return true;
    });
  }, [offerings, rejectedIds, shortlistIds, filters, activeRequirement, role, activeManufacturer.id, activeBuyer.id]);

  const currentOffering = visibleOfferings.length > 0 ? visibleOfferings[0] : null;

  // Shortlisted items
  const shortlistedOfferings = useMemo(() => {
    return offerings.filter((o) => shortlistIds.includes(o.id));
  }, [offerings, shortlistIds]);

  // Swiping handler connected to backend with server-authoritative mutual matching
  const handleSwipe = async (action: 'reject' | 'shortlist' | 'rfq', offeringId?: string) => {
    const targetOffering = offeringId
      ? offerings.find((o) => o.id === offeringId)
      : currentOffering;

    if (!targetOffering) return;

    const newSwipe: SwipeAction = {
      id: `swipe-${Date.now()}`,
      actorBusinessId: activeBuyer.id,
      targetOfferingId: targetOffering.id,
      targetBusinessId: targetOffering.manufacturer.id,
      action,
      createdAt: new Date().toISOString(),
    };

    setSwipes((prev) => [newSwipe, ...prev]);

    if (action === 'reject') {
      setRejectedIds((prev) => [...prev, targetOffering.id]);
    } else if (action === 'shortlist' || action === 'rfq') {
      setShortlistIds((prev) => [...prev, targetOffering.id]);
    }

    try {
      // Send swipe to backend and receive authoritative matching result
      const res = await api.sendSwipe(targetOffering.manufacturer.id, targetOffering.id, action);
      if (res.matched && res.match) {
        // Server confirmed mutual connection!
        setMatches((prev) => {
          const exists = prev.some((m) => m.id === res.match?.id || m.manufacturerId === targetOffering.manufacturer.id);
          if (exists) return prev;
          return [res.match!, ...prev];
        });
        setActiveMatchForCelebration(res.match);
      }
    } catch (e) {
      console.warn('Backend swipe error:', e);
    }

    if (action === 'rfq') {
      openRFQModal(targetOffering);
    }
  };

  // Undo swipe connected to backend
  const canUndo = swipes.length > 0;
  const undoSwipe = async () => {
    if (swipes.length === 0) return;
    const [lastSwipe, ...restSwipes] = swipes;
    setSwipes(restSwipes);

    if (lastSwipe.action === 'reject') {
      setRejectedIds((prev) => prev.filter((id) => id !== lastSwipe.targetOfferingId));
    } else {
      setShortlistIds((prev) => prev.filter((id) => id !== lastSwipe.targetOfferingId));
      setMatches((prev) =>
        prev.filter((m) => m.matchedOffering?.id !== lastSwipe.targetOfferingId)
      );
    }

    try {
      await api.undoSwipe();
    } catch (e) {
      console.warn('Backend undo swipe error:', e);
    }
  };

  const removeFromShortlist = (offeringId: string) => {
    setShortlistIds((prev) => prev.filter((id) => id !== offeringId));
  };

  const clearShortlist = () => {
    setShortlistIds([]);
  };

  const setFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = async () => {
    setFilters(INITIAL_FILTERS);
    setActiveRequirement(null);
    try {
      const res = await api.getDiscovery(INITIAL_FILTERS);
      if (res.success && Array.isArray(res.data)) {
        setOfferings(res.data);
      }
    } catch (_) {}
  };

  // Natural Language Requirement Parsing via Backend API (with Gemini + fallback)
  const parseNaturalLanguageRequirement = async (text: string): Promise<BuyerRequirement | null> => {
    setIsParsingRequirement(true);
    try {
      const json = await api.parseRequirement(text);
      if (json.success && json.data) {
        const d = json.data;
        const newReq: BuyerRequirement = {
          id: `req-${Date.now()}`,
          buyerId: activeBuyer.id,
          rawText: text,
          productCategory: d.productCategory || 'Textiles & Fabrics',
          material: d.material || 'Standard Spec',
          quantity: d.quantity || 1000,
          unit: d.unit || 'units',
          maxBudget: d.maxBudget || 200,
          priceUnit: d.priceUnit || 'per unit',
          technicalSpecifications: d.technicalSpecifications || [],
          preferredLocation: {
            city: d.preferredLocation?.city || null,
            state: d.preferredLocation?.state || null,
            reach: d.preferredLocation?.reach || 'pan-india',
          },
          selectedStates: d.preferredLocation?.state ? [d.preferredLocation.state] : [],
          deadlineDays: d.deadlineDays || 14,
          requiredCertifications: d.requiredCertifications || [],
          hardConstraints: d.hardConstraints || [],
          softPreferences: d.softPreferences || [],
          interpretationSummary: d.interpretationSummary || text,
          timestamp: new Date().toISOString(),
        };

        // Update filters based on parsed requirement
        setFilters((prev) => ({
          ...prev,
          sector: newReq.productCategory,
          maxBudget: newReq.maxBudget,
          geographicReach: newReq.preferredLocation.reach,
          selectedStates: newReq.selectedStates || [],
        }));

        setActiveRequirement(newReq);

        // Also save to backend
        api.saveRequirement(newReq).catch(console.warn);

        return newReq;
      }
    } catch (err) {
      console.warn('API error parsing requirement, using local fallback:', err);
    } finally {
      setIsParsingRequirement(false);
    }
    return null;
  };

  // AI Procurement Assistant Analysis via Backend API
  const runProcurementAnalysis = async (priorityOverride?: ProcurementPriority) => {
    const priority = priorityOverride || procurementPriority;
    setIsAnalyzingProcurement(true);
    setProcurementError(null);

    const suppliersToAnalyze =
      shortlistedOfferings.length >= 2
        ? shortlistedOfferings
        : offerings.slice(0, 4);

    try {
      const json = await api.getProcurementAdvice(priority, suppliersToAnalyze, activeRequirement);
      if (json.success && json.data) {
        const resultData = json.data;

        // Calculate transparent score breakdown
        const breakdowns: Record<string, any> = {};
        suppliersToAnalyze.forEach((s) => {
          let priceScore = Math.max(60, 100 - (s.product.unitPrice / 15) * 5);
          let leadTimeScore = Math.max(60, 100 - s.product.leadTimeDays * 2.5);
          let qualityScore = (s.manufacturer.rating / 5) * 100;
          let capacityScore = Math.min(100, (s.product.monthlyCapacity / 30000) * 100);

          let composite = 85;
          if (priority === 'Lowest Cost') {
            composite = priceScore * 0.5 + leadTimeScore * 0.2 + qualityScore * 0.2 + capacityScore * 0.1;
          } else if (priority === 'Fastest Delivery') {
            composite = leadTimeScore * 0.5 + priceScore * 0.2 + qualityScore * 0.2 + capacityScore * 0.1;
          } else if (priority === 'Highest Quality') {
            composite = qualityScore * 0.5 + priceScore * 0.2 + leadTimeScore * 0.2 + capacityScore * 0.1;
          } else {
            composite = priceScore * 0.3 + qualityScore * 0.3 + leadTimeScore * 0.25 + capacityScore * 0.15;
          }

          breakdowns[s.id] = {
            priceScore: Math.round(priceScore),
            qualityScore: Math.round(qualityScore),
            leadTimeScore: Math.round(leadTimeScore),
            capacityScore: Math.round(capacityScore),
            compositeScore: Math.round(composite),
          };
        });

        setProcurementResult({
          topRecommendationId: resultData.topRecommendationId,
          executiveSummary: resultData.executiveSummary,
          supplierEvaluations: resultData.supplierEvaluations || [],
          procurementTip: resultData.procurementTip || '',
          priority,
          scoreBreakdowns: breakdowns,
        });
      }
    } catch (err: any) {
      console.warn('Procurement API call failed:', err);
    } finally {
      setIsAnalyzingProcurement(false);
    }
  };

  // RFQ Creation via Backend API
  const openRFQModal = (offering: SupplierOffering) => {
    setRfqModalOffering(offering);
  };

  const closeRFQModal = () => {
    setRfqModalOffering(null);
  };

  const createRFQ = async (data: {
    offering: SupplierOffering;
    quantity: number;
    unit: string;
    specifications: string;
    deliveryLocation: string;
    deliveryState: string;
    requestedDate: string;
    targetBudget?: number;
    notes?: string;
  }) => {
    try {
      const res = await api.createRFQ({
        manufacturerId: data.offering.manufacturer.id,
        productId: data.offering.product.id,
        productName: data.offering.product.name,
        productCategory: data.offering.product.category,
        quantity: data.quantity,
        unit: data.unit,
        specifications: data.specifications,
        deliveryLocation: data.deliveryLocation,
        deliveryState: data.deliveryState,
        requestedDate: data.requestedDate,
        targetBudget: data.targetBudget,
        notes: data.notes,
      });

      if (res.success && res.data) {
        setRfqs((prev) => [res.data, ...prev]);
      }
    } catch (e) {
      console.warn('Backend create RFQ error:', e);
    }
    closeRFQModal();
  };

  // Manufacturer submits quotation via Backend API
  const submitQuotationResponse = async (
    rfqId: string,
    data: {
      unitPrice: number;
      moq: number;
      leadTimeDays: number;
      validity: string;
      deliveryTerms: string;
      notes: string;
    }
  ) => {
    try {
      const res = await api.submitQuotation(rfqId, data);
      if (res.success && res.data) {
        setRfqs((prev) => prev.map((item) => (item.id === rfqId ? res.data : item)));
      }
    } catch (e) {
      console.warn('Backend submit quotation error:', e);
    }
  };

  // Advance RFQ lifecycle status via Backend API
  const advanceRFQStatus = async (rfqId: string, nextStatus: OrderStatus) => {
    try {
      const rfq = rfqs.find((r) => r.id === rfqId);
      if (nextStatus === 'Order Confirmed' && rfq?.quotation) {
        // Call quotation accept on backend
        await api.acceptQuotation(rfq.quotation.id);
      } else {
        await api.updateRFQStatus(rfqId, nextStatus);
      }

      // Refresh RFQs from backend
      const refreshed = await api.getRFQs();
      if (refreshed.success && Array.isArray(refreshed.data)) {
        setRfqs(refreshed.data);
      }
    } catch (e) {
      console.warn('Backend advance status error:', e);
    }
  };

  const dismissCelebration = () => {
    setActiveMatchForCelebration(null);
  };

  const sendConnectionMessage = async (matchId: string, text: string) => {
    try {
      const res = await api.sendMatchMessage(matchId, text);
      if (res.success && res.data) {
        setMatches((prev) => prev.map((m) => (m.id === matchId ? res.data : m)));
      }
    } catch (e) {
      console.warn('Backend send message error:', e);
    }
  };

  const acceptBuyerInboundInterest = async (buyerId: string, offeringId: string) => {
    try {
      const res = await api.acceptInterest(buyerId, offeringId);
      if (res.success && res.data) {
        setMatches((prev) => {
          const exists = prev.some((m) => m.id === res.data.id);
          if (exists) return prev;
          return [res.data, ...prev];
        });
        setActiveMatchForCelebration(res.data);
      }
    } catch (e) {
      console.warn('Backend accept interest error:', e);
    }
  };

  const addOrUpdateProductOffering = async (offering: SupplierOffering) => {
    try {
      await api.createProduct({
        name: offering.product.name,
        category: offering.product.category,
        material: offering.product.material,
        unitPrice: offering.product.unitPrice,
        priceUnit: offering.product.priceUnit,
        moq: offering.product.moq,
        monthlyCapacity: offering.product.monthlyCapacity,
        remainingMonthlyCapacity: offering.product.remainingMonthlyCapacity,
        leadTimeDays: offering.product.leadTimeDays,
        specifications: offering.product.specifications,
        valueProposition: offering.product.valueProposition,
        deliveryTerms: offering.product.deliveryTerms,
        imageUrl: offering.product.imageUrl,
      });

      // Refresh discovery
      const refreshed = await api.getDiscovery(filters);
      if (refreshed.success && Array.isArray(refreshed.data)) {
        setOfferings(refreshed.data);
      }
    } catch (e) {
      console.warn('Backend create product error:', e);
      // Fallback local update
      setOfferings((prev) => [offering, ...prev]);
    }
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        toggleRole,
        activeBuyer,
        activeManufacturer,
        setActiveManufacturerId,
        activeTab,
        setActiveTab,
        offerings,
        visibleOfferings,
        currentOffering,
        swipes,
        shortlistIds,
        rejectedIds,
        handleSwipe,
        undoSwipe,
        canUndo,
        activeRequirement,
        setActiveRequirement,
        filters,
        setFilter,
        resetFilters,
        isParsingRequirement,
        parseNaturalLanguageRequirement,
        shortlistedOfferings,
        removeFromShortlist,
        clearShortlist,
        matches,
        activeMatchForCelebration,
        dismissCelebration,
        sendConnectionMessage,
        acceptBuyerInboundInterest,
        rfqs,
        rfqModalOffering,
        openRFQModal,
        closeRFQModal,
        createRFQ,
        submitQuotationResponse,
        advanceRFQStatus,
        selectedSupplierDetail,
        setSelectedSupplierDetail,
        procurementPriority,
        setProcurementPriority,
        procurementResult,
        isAnalyzingProcurement,
        procurementError,
        runProcurementAnalysis,
        addOrUpdateProductOffering,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
