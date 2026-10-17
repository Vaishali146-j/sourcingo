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
  handleSwipe: (action: 'reject' | 'shortlist' | 'rfq', offeringId?: string) => void;
  undoSwipe: () => void;
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
  sendConnectionMessage: (matchId: string, text: string) => void;
  acceptBuyerInboundInterest: (buyerId: string, offeringId: string) => void;

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
  }) => void;
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
  ) => void;
  advanceRFQStatus: (rfqId: string, nextStatus: OrderStatus) => void;

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
  addOrUpdateProductOffering: (offering: SupplierOffering) => void;
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

// Seed initial mutual match for demo exploration
const INITIAL_MATCHES: MatchConnection[] = [
  {
    id: 'match-sabarmati-zenith',
    buyerId: CURRENT_DEMO_BUYER.id,
    manufacturerId: 'mfg-sabarmati',
    buyerBusiness: CURRENT_DEMO_BUYER,
    manufacturerBusiness: MOCK_SUPPLIER_OFFERINGS[0].manufacturer,
    matchedOffering: MOCK_SUPPLIER_OFFERINGS[0],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'active',
    unreadCount: 1,
    lastMessage: 'Pareshbhai Patel: We can arrange 50m trial duck canvas dispatched tomorrow.',
    lastMessageTimestamp: 'Yesterday, 4:30 PM',
    messages: [
      {
        id: 'msg-1',
        senderId: 'system',
        senderName: 'Sourcingo Match Engine',
        text: 'Mutual connection established! Both Zenith Industrial and Sabarmati Weaving expressed reciprocal interest in heavy cotton canvas sourcing.',
        timestamp: '2 days ago',
        isSystemNotice: true,
      },
      {
        id: 'msg-2',
        senderId: CURRENT_DEMO_BUYER.id,
        senderName: CURRENT_DEMO_BUYER.contact.name,
        text: 'Greetings Pareshbhai. We are seeking 5,000m of 450 GSM duck canvas for pump protection shroud fabrication.',
        timestamp: '2 days ago',
      },
      {
        id: 'msg-3',
        senderId: 'mfg-sabarmati',
        senderName: 'Pareshbhai Patel',
        text: 'Namaste Vikramadityaji. We have regular spinning for 450 GSM plain duck. We can arrange 50m trial duck canvas dispatched tomorrow.',
        timestamp: 'Yesterday, 4:30 PM',
      },
    ],
  },
];

// Seed active RFQ
const INITIAL_RFQS: RFQItem[] = [
  {
    id: 'rfq-2026-081',
    rfqNumber: 'RFQ-GJ-2026-081',
    buyerId: CURRENT_DEMO_BUYER.id,
    buyerName: CURRENT_DEMO_BUYER.name,
    manufacturerId: 'mfg-sabarmati',
    manufacturerName: 'Sabarmati Weaving & Technical Fabrics',
    offeringId: 'offering-sabarmati-textiles',
    productId: 'prod-cotton-canvas-5000',
    productName: 'Heavy Industrial Cotton Duck Canvas (450 GSM)',
    productCategory: 'Textiles & Fabrics',
    quantity: 5000,
    unit: 'meters',
    specifications: '450 GSM, DWR Grade 4 water repellent coating, 152 cm roll width, warp tensile > 1800N.',
    deliveryLocation: 'Plot 42, Bhosari MIDC, Pune, Maharashtra',
    deliveryState: 'Maharashtra',
    requestedDate: '2026-11-05',
    targetBudget: 150,
    notes: 'Urgent pilot batch for pump enclosure lines. Need test certificate with shipment.',
    status: 'Quote Received',
    quotation: {
      id: 'quote-sab-081',
      rfqId: 'rfq-2026-081',
      manufacturerId: 'mfg-sabarmati',
      unitPrice: 140,
      totalAmount: 700000,
      moq: 1000,
      leadTimeDays: 10,
      validity: '15 Days (Valid till 2026-11-01)',
      deliveryTerms: 'FOR Bhosari MIDC Pune inclusive of freight & transit insurance.',
      notes: 'Special 1.4% cluster volume concession applied for Zenith Industrial.',
      submittedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      status: 'pending',
    },
    timeline: [
      {
        status: 'RFQ Requested',
        timestamp: '2 days ago',
        note: 'Buyer submitted formal procurement inquiry with technical specs.',
      },
      {
        status: 'Quote Received',
        timestamp: '18 hours ago',
        note: 'Manufacturer submitted formal quotation at ₹140/meter (within target budget).',
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('buyer');
  const [activeTab, setActiveTab] = useState<string>('discover');
  const [offerings, setOfferings] = useState<SupplierOffering[]>(MOCK_SUPPLIER_OFFERINGS);
  const [activeManufacturerId, setActiveManufacturerId] = useState<string>(MOCK_SUPPLIER_OFFERINGS[1].manufacturer.id);

  const [swipes, setSwipes] = useState<SwipeAction[]>([]);
  const [shortlistIds, setShortlistIds] = useState<string[]>(['offering-sabarmati-textiles']);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [activeRequirement, setActiveRequirement] = useState<BuyerRequirement | null>(null);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  const [matches, setMatches] = useState<MatchConnection[]>(INITIAL_MATCHES);
  const [activeMatchForCelebration, setActiveMatchForCelebration] = useState<MatchConnection | null>(null);

  const [rfqs, setRfqs] = useState<RFQItem[]>(INITIAL_RFQS);
  const [rfqModalOffering, setRfqModalOffering] = useState<SupplierOffering | null>(null);
  const [selectedSupplierDetail, setSelectedSupplierDetail] = useState<SupplierOffering | null>(null);

  const [isParsingRequirement, setIsParsingRequirement] = useState(false);
  const [procurementPriority, setProcurementPriority] = useState<ProcurementPriority>('Best Overall');
  const [procurementResult, setProcurementResult] = useState<ProcurementAdviceResult | null>(null);
  const [isAnalyzingProcurement, setIsAnalyzingProcurement] = useState(false);
  const [procurementError, setProcurementError] = useState<string | null>(null);

  // Load persisted state if exists
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.shortlistIds) setShortlistIds(parsed.shortlistIds);
        if (parsed.rejectedIds) setRejectedIds(parsed.rejectedIds);
        if (parsed.matches) setMatches(parsed.matches);
        if (parsed.rfqs) setRfqs(parsed.rfqs);
        if (parsed.activeRequirement) setActiveRequirement(parsed.activeRequirement);
        if (parsed.role) setRole(parsed.role);
      }
    } catch (e) {
      console.warn('Could not load stored state:', e);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      const stateToPersist = {
        shortlistIds,
        rejectedIds,
        matches,
        rfqs,
        activeRequirement,
        role,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToPersist));
    } catch (e) {
      console.warn('Could not persist state:', e);
    }
  }, [shortlistIds, rejectedIds, matches, rfqs, activeRequirement, role]);

  const activeBuyer = CURRENT_DEMO_BUYER;
  const activeManufacturer = useMemo(() => {
    const found = offerings.find((o) => o.manufacturer.id === activeManufacturerId);
    return found ? found.manufacturer : offerings[1].manufacturer;
  }, [offerings, activeManufacturerId]);

  const toggleRole = () => {
    const nextRole = role === 'buyer' ? 'manufacturer' : 'buyer';
    setRole(nextRole);
    if (nextRole === 'manufacturer') {
      setActiveTab('manufacturer-dashboard');
    } else {
      setActiveTab('discover');
    }
  };

  // Filter offerings based on active filters and requirements
  const visibleOfferings = useMemo(() => {
    return offerings.filter((offering) => {
      // 1. Exclude already swiped (rejected or currently shortlisted)
      if (rejectedIds.includes(offering.id)) return false;
      if (shortlistIds.includes(offering.id)) return false;

      // 2. Sector filter
      if (filters.sector !== 'all' && offering.product.category !== filters.sector) {
        return false;
      }

      // 3. MOQ filter
      if (filters.maxMoq !== null && offering.product.moq > filters.maxMoq) {
        return false;
      }

      // 4. Budget filter
      if (filters.maxBudget !== null && offering.product.unitPrice > filters.maxBudget) {
        return false;
      }

      // 5. Geographic reach filter
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

      // 6. Active requirement hard constraints
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
  }, [offerings, rejectedIds, shortlistIds, filters, activeRequirement]);

  const currentOffering = visibleOfferings.length > 0 ? visibleOfferings[0] : null;

  // Shortlisted items
  const shortlistedOfferings = useMemo(() => {
    return offerings.filter((o) => shortlistIds.includes(o.id));
  }, [offerings, shortlistIds]);

  // Reciprocal connection criteria definition for authentic mutual matching
  const checkReciprocalMatchCriteria = (offering: SupplierOffering): boolean => {
    // Reciprocal rules:
    // 1. Supplier has active pre-expressed interest in verified buyers with rating >= 4.8 and Payment score >= 90
    // 2. Or offering has composite match score >= 93 and specific cluster synergy
    const buyerRating = activeBuyer.rating;
    const buyerPaymentScore = activeBuyer.paymentReliability.score;
    const isSabarmati = offering.manufacturer.id === 'mfg-sabarmati';
    const isApex = offering.manufacturer.id === 'mfg-apex';
    const isPeenya = offering.manufacturer.id === 'mfg-peenya';

    if (isSabarmati || isApex || isPeenya) {
      if (buyerRating >= 4.8 && buyerPaymentScore >= 95) {
        return true;
      }
    }

    if (offering.compositeScore >= 94) {
      return true;
    }

    return false;
  };

  // Swiping handler
  const handleSwipe = (action: 'reject' | 'shortlist' | 'rfq', offeringId?: string) => {
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

      // Check for mutual match
      const isMutualMatch = checkReciprocalMatchCriteria(targetOffering);
      if (isMutualMatch) {
        // Create genuine mutual match connection
        const existing = matches.find((m) => m.manufacturerId === targetOffering.manufacturer.id);
        if (!existing) {
          const newMatch: MatchConnection = {
            id: `match-${Date.now()}`,
            buyerId: activeBuyer.id,
            manufacturerId: targetOffering.manufacturer.id,
            buyerBusiness: activeBuyer,
            manufacturerBusiness: targetOffering.manufacturer,
            matchedOffering: targetOffering,
            createdAt: new Date().toISOString(),
            status: 'active',
            unreadCount: 0,
            lastMessage: `Connected! ${targetOffering.manufacturer.name} accepted your interest.`,
            lastMessageTimestamp: 'Just now',
            messages: [
              {
                id: `msg-sys-${Date.now()}`,
                senderId: 'system',
                senderName: 'Sourcingo Match Engine',
                text: `Reciprocal connection verified! ${targetOffering.manufacturer.name} actively prioritizes verified buyers in ${activeBuyer.state}.`,
                timestamp: 'Just now',
                isSystemNotice: true,
              },
            ],
          };
          setMatches((prev) => [newMatch, ...prev]);
          setActiveMatchForCelebration(newMatch);
        }
      }

      if (action === 'rfq') {
        openRFQModal(targetOffering);
      }
    }
  };

  // Undo swipe
  const canUndo = swipes.length > 0;
  const undoSwipe = () => {
    if (swipes.length === 0) return;
    const [lastSwipe, ...restSwipes] = swipes;
    setSwipes(restSwipes);

    if (lastSwipe.action === 'reject') {
      setRejectedIds((prev) => prev.filter((id) => id !== lastSwipe.targetOfferingId));
    } else {
      setShortlistIds((prev) => prev.filter((id) => id !== lastSwipe.targetOfferingId));
      // Remove match if one was created by this swipe
      setMatches((prev) =>
        prev.filter((m) => m.matchedOffering.id !== lastSwipe.targetOfferingId)
      );
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

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setActiveRequirement(null);
  };

  // Natural Language Requirement Parsing
  const parseNaturalLanguageRequirement = async (text: string): Promise<BuyerRequirement | null> => {
    setIsParsingRequirement(true);
    try {
      const response = await fetch('/api/parse-requirement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirementText: text }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const json = await response.json();
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
        return newReq;
      }
    } catch (err) {
      console.warn('API error while parsing requirement, running client fallback:', err);
      // Client-side fallback if server fails
      const fallbackReq: BuyerRequirement = {
        id: `req-${Date.now()}`,
        buyerId: activeBuyer.id,
        rawText: text,
        productCategory: text.toLowerCase().includes('fabric') || text.toLowerCase().includes('cotton') ? 'Textiles & Fabrics' : 'CNC Machining & Precision Parts',
        material: 'Industrial Spec Cotton / EN19',
        quantity: 5000,
        unit: 'meters',
        maxBudget: 150,
        priceUnit: 'per meter',
        technicalSpecifications: ['DWR Finish', 'Shrinkage < 3%'],
        preferredLocation: {
          state: 'Gujarat',
          reach: 'state',
        },
        selectedStates: ['Gujarat'],
        deadlineDays: 14,
        requiredCertifications: ['ISO 9001:2015', 'GST Registered'],
        hardConstraints: ['Unit price ≤ ₹150', 'Lead time ≤ 14 days'],
        softPreferences: ['Ex-Mill Gujarat Dispatch'],
        interpretationSummary: `Parsed request: 5,000 units within ₹150 budget from Gujarat delivered in 14 days.`,
        timestamp: new Date().toISOString(),
      };
      setActiveRequirement(fallbackReq);
      setFilters((prev) => ({
        ...prev,
        sector: fallbackReq.productCategory,
        maxBudget: fallbackReq.maxBudget,
        geographicReach: 'state',
        selectedStates: ['Gujarat'],
      }));
      return fallbackReq;
    } finally {
      setIsParsingRequirement(false);
    }
    return null;
  };

  // AI Procurement Assistant Analysis
  const runProcurementAnalysis = async (priorityOverride?: ProcurementPriority) => {
    const priority = priorityOverride || procurementPriority;
    setIsAnalyzingProcurement(true);
    setProcurementError(null);

    // Filter suppliers to evaluate: use shortlisted or top 4 if shortlist is small
    const suppliersToAnalyze =
      shortlistedOfferings.length >= 2
        ? shortlistedOfferings
        : offerings.slice(0, 4);

    try {
      const response = await fetch('/api/procurement-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priority,
          suppliers: suppliersToAnalyze,
          buyerRequirement: activeRequirement,
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const json = await response.json();
      if (json.success && json.data) {
        const resultData = json.data;

        // Calculate deterministic score breakdown
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
            // Best Overall
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
      console.warn('Procurement API call failed, generating deterministic fallback:', err);
      // Deterministic fallback
      const top = suppliersToAnalyze[0];
      setProcurementResult({
        topRecommendationId: top.id,
        executiveSummary: `Under the "${priority}" criterion, ${top.manufacturer.name} in ${top.manufacturer.city} provides the highest suitability with ₹${top.product.unitPrice} ${top.product.priceUnit} and verified compliance.`,
        supplierEvaluations: suppliersToAnalyze.map((s, idx) => ({
          supplierId: s.id,
          rank: idx + 1,
          badge: idx === 0 ? 'Top Recommended Choice' : 'Vetted Alternative',
          keyStrengths: [
            `${s.manufacturer.city} cluster proximity`,
            `Capacity: ${s.product.monthlyCapacity.toLocaleString()} ${s.product.priceUnit}/mo`,
            s.manufacturer.verificationStatus.isGstVerified ? 'GST Verified' : 'Registered MSME',
          ],
          tradeOffs: `Quotes ₹${s.product.unitPrice} with ${s.product.leadTimeDays} days lead time.`,
          riskOrUncertainty: 'Standard 48-hour sample test inspection recommended.',
          recommendedAction: idx === 0 ? 'Issue formal RFQ for sample batch' : 'Keep active in shortlist',
        })),
        procurementTip: 'Leverage milestone-based payment schedules to negotiate 3-5% margin buffer with MSME mills.',
        priority,
        scoreBreakdowns: {},
      });
    } finally {
      setIsAnalyzingProcurement(false);
    }
  };

  // RFQ Creation
  const openRFQModal = (offering: SupplierOffering) => {
    setRfqModalOffering(offering);
  };

  const closeRFQModal = () => {
    setRfqModalOffering(null);
  };

  const createRFQ = (data: {
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
    const rfqNumber = `RFQ-IND-2026-${String(rfqs.length + 101).padStart(3, '0')}`;
    const newRfq: RFQItem = {
      id: `rfq-${Date.now()}`,
      rfqNumber,
      buyerId: activeBuyer.id,
      buyerName: activeBuyer.name,
      manufacturerId: data.offering.manufacturer.id,
      manufacturerName: data.offering.manufacturer.name,
      offeringId: data.offering.id,
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
      status: 'RFQ Requested',
      timeline: [
        {
          status: 'RFQ Requested',
          timestamp: 'Just now',
          note: `Procurement inquiry submitted by ${activeBuyer.name} for ${data.quantity.toLocaleString()} ${data.unit}.`,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    setRfqs((prev) => [newRfq, ...prev]);
    closeRFQModal();
  };

  // Manufacturer submits quotation
  const submitQuotationResponse = (
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
    setRfqs((prev) =>
      prev.map((item) => {
        if (item.id !== rfqId) return item;
        const quote: QuotationResponse = {
          id: `quote-${Date.now()}`,
          rfqId,
          manufacturerId: item.manufacturerId,
          unitPrice: data.unitPrice,
          totalAmount: data.unitPrice * item.quantity,
          moq: data.moq,
          leadTimeDays: data.leadTimeDays,
          validity: data.validity,
          deliveryTerms: data.deliveryTerms,
          notes: data.notes,
          submittedAt: new Date().toISOString(),
          status: 'pending',
        };

        return {
          ...item,
          status: 'Quote Received',
          quotation: quote,
          timeline: [
            ...item.timeline,
            {
              status: 'Quote Received',
              timestamp: 'Just now',
              note: `Manufacturer quoted ₹${data.unitPrice}/${item.unit} with ${data.leadTimeDays}d lead time.`,
            },
          ],
        };
      })
    );
  };

  // Advance RFQ lifecycle status
  const advanceRFQStatus = (rfqId: string, nextStatus: OrderStatus) => {
    setRfqs((prev) =>
      prev.map((item) => {
        if (item.id !== rfqId) return item;

        let note = `Status advanced to ${nextStatus}`;
        if (nextStatus === 'Order Confirmed') {
          note = 'Buyer confirmed order and accepted commercial terms.';
          if (item.quotation) item.quotation.status = 'accepted';
        } else if (nextStatus === 'In Production') {
          note = 'Raw material batch allocated; tooling & production initiated.';
        } else if (nextStatus === 'Dispatched') {
          note = 'Batch packed and dispatched via logistics partner with e-Way Bill.';
        } else if (nextStatus === 'Delivered') {
          note = 'Consignment received at destination factory; GRN generated.';
        }

        return {
          ...item,
          status: nextStatus,
          timeline: [
            ...item.timeline,
            {
              status: nextStatus,
              timestamp: 'Just now',
              note,
            },
          ],
        };
      })
    );
  };

  const dismissCelebration = () => {
    setActiveMatchForCelebration(null);
  };

  const sendConnectionMessage = (matchId: string, text: string) => {
    const sender = role === 'buyer' ? activeBuyer : activeManufacturer;
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        return {
          ...m,
          lastMessage: `${sender.contact.name}: ${text}`,
          lastMessageTimestamp: 'Just now',
          messages: [
            ...m.messages,
            {
              id: `msg-${Date.now()}`,
              senderId: sender.id,
              senderName: sender.contact.name,
              text,
              timestamp: 'Just now',
            },
          ],
        };
      })
    );
  };

  const acceptBuyerInboundInterest = (buyerId: string, offeringId: string) => {
    const offering = offerings.find((o) => o.id === offeringId);
    if (!offering) return;

    const existing = matches.find((m) => m.buyerId === buyerId && m.manufacturerId === offering.manufacturer.id);
    if (!existing) {
      const newMatch: MatchConnection = {
        id: `match-accept-${Date.now()}`,
        buyerId,
        manufacturerId: offering.manufacturer.id,
        buyerBusiness: activeBuyer,
        manufacturerBusiness: offering.manufacturer,
        matchedOffering: offering,
        createdAt: new Date().toISOString(),
        status: 'active',
        unreadCount: 0,
        lastMessage: 'Manufacturer accepted your inquiry. You are now mutually connected!',
        lastMessageTimestamp: 'Just now',
        messages: [
          {
            id: `msg-mfg-${Date.now()}`,
            senderId: 'system',
            senderName: 'Sourcingo Match Engine',
            text: `${offering.manufacturer.name} accepted inbound interest from ${activeBuyer.name}. Direct communication channel open.`,
            timestamp: 'Just now',
            isSystemNotice: true,
          },
        ],
      };
      setMatches((prev) => [newMatch, ...prev]);
      setActiveMatchForCelebration(newMatch);
    }
  };

  const addOrUpdateProductOffering = (offering: SupplierOffering) => {
    setOfferings((prev) => {
      const idx = prev.findIndex((o) => o.id === offering.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = offering;
        return updated;
      }
      return [offering, ...prev];
    });
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
