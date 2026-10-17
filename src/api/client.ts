import {
  SupplierOffering,
  BuyerRequirement,
  RFQItem,
  MatchConnection,
  ProcurementPriority,
  OrderStatus,
  Business,
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let message = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const parsed = JSON.parse(errorBody);
      if (parsed.error) message = parsed.error;
    } catch (_) {}
    throw new Error(message);
  }

  return response.json();
}

export const api = {
  // Health & Session
  async getHealth() {
    return request<any>('/health');
  },

  async getSession() {
    return request<{ success: boolean; data: any }>('/demo/session');
  },

  async switchRole(role: 'buyer' | 'manufacturer', businessId?: string) {
    return request<{ success: boolean; data: any }>('/demo/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role, businessId }),
    });
  },

  // Businesses & Products
  async getBusinesses(params?: { role?: string; state?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return request<{ success: boolean; data: Business[] }>(`/businesses${query ? `?${query}` : ''}`);
  },

  async getProducts(params?: { category?: string; manufacturerId?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return request<{ success: boolean; data: any[] }>(`/products${query ? `?${query}` : ''}`);
  },

  async createProduct(productData: any) {
    return request<{ success: boolean; data: any }>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  async updateProduct(id: string, updates: any) {
    return request<{ success: boolean; data: any }>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteProduct(id: string) {
    return request<{ success: boolean; message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Discovery Feed (Excludes signed-in user's business)
  async getDiscovery(filters?: {
    sector?: string;
    maxBudget?: number | null;
    maxMoq?: number | null;
    geographicReach?: string;
    state?: string;
  }) {
    const params: Record<string, string> = {};
    if (filters?.sector && filters.sector !== 'all') params.sector = filters.sector;
    if (filters?.maxBudget !== null && filters?.maxBudget !== undefined) params.maxBudget = String(filters.maxBudget);
    if (filters?.maxMoq !== null && filters?.maxMoq !== undefined) params.maxMoq = String(filters.maxMoq);
    if (filters?.geographicReach) params.geographicReach = filters.geographicReach;
    if (filters?.state) params.state = filters.state;

    const query = new URLSearchParams(params).toString();
    return request<{ success: boolean; count: number; data: SupplierOffering[] }>(
      `/discovery${query ? `?${query}` : ''}`
    );
  },

  // Requirements & AI Parsing
  async parseRequirement(requirementText: string) {
    return request<{ success: boolean; source: string; data: any }>('/requirements/parse', {
      method: 'POST',
      body: JSON.stringify({ requirementText }),
    });
  },

  async saveRequirement(requirement: Partial<BuyerRequirement>) {
    return request<{ success: boolean; data: any }>('/requirements', {
      method: 'POST',
      body: JSON.stringify(requirement),
    });
  },

  async getRequirements() {
    return request<{ success: boolean; data: any[] }>('/requirements');
  },

  // Swipes & Matching
  async sendSwipe(targetBusinessId: string, targetOfferingId: string, action: 'reject' | 'shortlist' | 'rfq') {
    return request<{
      success: boolean;
      swipe: any;
      matched: boolean;
      match?: MatchConnection;
    }>('/swipes', {
      method: 'POST',
      body: JSON.stringify({ targetBusinessId, targetOfferingId, action }),
    });
  },

  async getSwipes() {
    return request<{ success: boolean; data: any[] }>('/swipes');
  },

  async undoSwipe() {
    return request<{ success: boolean; undoneSwipe: any }>('/swipes/undo', {
      method: 'POST',
    });
  },

  async getMatches() {
    return request<{ success: boolean; data: MatchConnection[] }>('/matches');
  },

  async sendMatchMessage(matchId: string, text: string) {
    return request<{ success: boolean; data: MatchConnection; message: any }>(`/matches/${matchId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  async acceptInterest(buyerId: string, offeringId?: string) {
    return request<{ success: boolean; data: MatchConnection }>('/interests/accept', {
      method: 'POST',
      body: JSON.stringify({ buyerId, offeringId }),
    });
  },

  // AI Procurement Assistant
  async getProcurementAdvice(priority: ProcurementPriority, suppliers: SupplierOffering[], buyerRequirement?: any) {
    return request<{ success: boolean; source: string; data: any }>('/procurement/recommendations', {
      method: 'POST',
      body: JSON.stringify({ priority, suppliers, buyerRequirement }),
    });
  },

  // RFQs & Quotations
  async createRFQ(rfqData: any) {
    return request<{ success: boolean; data: RFQItem }>('/rfqs', {
      method: 'POST',
      body: JSON.stringify(rfqData),
    });
  },

  async getRFQs() {
    return request<{ success: boolean; data: RFQItem[] }>('/rfqs');
  },

  async updateRFQStatus(rfqId: string, status: OrderStatus, note?: string) {
    return request<{ success: boolean; data: RFQItem }>(`/rfqs/${rfqId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  },

  async submitQuotation(rfqId: string, quotationData: any) {
    return request<{ success: boolean; data: RFQItem; quotation: any }>(`/rfqs/${rfqId}/quotations`, {
      method: 'POST',
      body: JSON.stringify(quotationData),
    });
  },

  async acceptQuotation(quotationId: string) {
    return request<{ success: boolean; data: any }>(`/quotations/${quotationId}/accept`, {
      method: 'POST',
    });
  },

  // Orders
  async getOrders() {
    return request<{ success: boolean; data: any[] }>('/orders');
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
    return request<{ success: boolean; data: any }>(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  },
};
