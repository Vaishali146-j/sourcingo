export type Role = 'buyer' | 'manufacturer';

export type GeographicReach = 'city' | 'state' | 'selected-states' | 'pan-india';

export type VerificationEvidence = 'Independently Verified' | 'Document Submitted' | 'Self Reported';

export type ValueLabel = 'Best' | 'Good' | 'OK' | 'Insufficient Data';

export type ProcurementPriority = 'Best Overall' | 'Lowest Cost' | 'Highest Quality' | 'Fastest Delivery';

export type OrderStatus =
  | 'RFQ Requested'
  | 'Quote Received'
  | 'Order Confirmed'
  | 'In Production'
  | 'Dispatched'
  | 'Delivered';

export interface BusinessVerification {
  isGstVerified: boolean;
  gstNumber?: string;
  gstEvidence: VerificationEvidence;
  isIsoCertified: boolean;
  certifications: string[]; // e.g. ["ISO 9001:2015", "IATF 16949", "ZED Gold"]
  certificationEvidence: VerificationEvidence;
  isUdyamVerified: boolean;
  udyamNumber?: string;
  panVerified: boolean;
}

export interface PaymentReliability {
  score: number; // 0-100
  label: 'Excellent' | 'Reliable' | 'Developing' | 'Insufficient History';
  onTimePaymentRate: number; // percentage
  completedTransactions: number;
  evidenceStatus: 'Transaction-supported' | 'Insufficient History';
  averageDaysToPay: number;
}

export interface RatingBreakdown {
  quality: number;
  delivery: number;
  communication: number;
  specCompliance: number;
}

export interface BusinessContact {
  name: string;
  title: string;
  phone: string;
  email: string;
}

export interface Business {
  id: string;
  role: Role;
  name: string;
  legalName: string;
  logo: string;
  city: string;
  state: string;
  country: string;
  serviceableRegions: string[];
  distanceKm?: number;
  industry: string;
  description: string;
  yearEstablished: number;
  annualTurnover: string;
  employeeCount: string;
  factoryAreaSqFt?: number;
  contact: BusinessContact;
  verificationStatus: BusinessVerification;
  rating: number;
  ratingCount: number;
  ratingBreakdown: RatingBreakdown;
  paymentReliability: PaymentReliability;
  demoDataNotice: boolean;
  registeredAddress: string;
}

export interface Product {
  id: string;
  manufacturerId: string;
  name: string;
  category: string;
  imageUrl: string;
  galleryUrls?: string[];
  material: string;
  specifications: Record<string, string>;
  unitPrice: number; // in INR
  currency: 'INR';
  priceUnit: string; // e.g. 'per piece', 'per meter', 'per kg'
  moq: number;
  monthlyCapacity: number;
  remainingMonthlyCapacity?: number;
  leadTimeDays: number;
  valueLabel: ValueLabel;
  valueProposition: string;
  valueExplanation: string;
  certifications: string[];
  deliveryTerms: string;
  sampleAvailable: boolean;
  samplePriceInr?: number;
}

export interface SupplierOffering {
  id: string; // unique offering id
  manufacturer: Business;
  product: Product;
  compositeScore: number; // 0-100 score for matching
  matchReasons: string[];
  distanceEstimateKm: number;
}

export interface BuyerRequirement {
  id: string;
  buyerId: string;
  rawText: string;
  productCategory: string;
  material: string;
  quantity: number;
  unit: string;
  maxBudget: number;
  priceUnit: string;
  technicalSpecifications: string[];
  preferredLocation: {
    city?: string | null;
    state?: string | null;
    reach: GeographicReach;
  };
  selectedStates?: string[];
  deadlineDays: number;
  requiredCertifications: string[];
  hardConstraints: string[];
  softPreferences: string[];
  interpretationSummary: string;
  timestamp: string;
}

export interface SwipeAction {
  id: string;
  actorBusinessId: string;
  targetOfferingId: string;
  targetBusinessId: string;
  action: 'reject' | 'shortlist' | 'rfq';
  createdAt: string;
}

export interface MatchConnection {
  id: string;
  buyerId: string;
  manufacturerId: string;
  buyerBusiness: Business;
  manufacturerBusiness: Business;
  matchedOffering: SupplierOffering;
  createdAt: string;
  status: 'active' | 'archived';
  unreadCount: number;
  lastMessage?: string;
  lastMessageTimestamp?: string;
  messages: {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: string;
    isSystemNotice?: boolean;
  }[];
}

export interface RFQItem {
  id: string;
  rfqNumber: string;
  buyerId: string;
  buyerName: string;
  manufacturerId: string;
  manufacturerName: string;
  offeringId: string;
  productId: string;
  productName: string;
  productCategory: string;
  quantity: number;
  unit: string;
  specifications: string;
  deliveryLocation: string;
  deliveryState: string;
  requestedDate: string;
  targetBudget?: number;
  notes?: string;
  status: OrderStatus;
  quotation?: QuotationResponse;
  timeline: {
    status: OrderStatus;
    timestamp: string;
    note: string;
  }[];
  createdAt: string;
}

export interface QuotationResponse {
  id: string;
  rfqId: string;
  manufacturerId: string;
  unitPrice: number;
  totalAmount: number;
  moq: number;
  leadTimeDays: number;
  validity: string;
  deliveryTerms: string;
  notes: string;
  submittedAt: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface SupplierEvaluation {
  supplierId: string;
  rank: number;
  badge: string;
  keyStrengths: string[];
  tradeOffs: string;
  riskOrUncertainty: string;
  recommendedAction: string;
}

export interface ProcurementAdviceResult {
  topRecommendationId: string;
  executiveSummary: string;
  supplierEvaluations: SupplierEvaluation[];
  procurementTip: string;
  priority: ProcurementPriority;
  scoreBreakdowns: Record<
    string,
    {
      priceScore: number;
      qualityScore: number;
      leadTimeScore: number;
      capacityScore: number;
      compositeScore: number;
    }
  >;
}
