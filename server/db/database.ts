import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'sourcingo.db.json');

export interface DatabaseSchema {
  version: number;
  session: {
    role: 'buyer' | 'manufacturer';
    buyerId: string;
    manufacturerId: string;
  };
  businesses: any[];
  products: any[];
  buyer_requirements: any[];
  swipes: any[];
  interests: any[];
  matches: any[];
  rfqs: any[];
  quotations: any[];
  orders: any[];
  notifications: any[];
}

const INITIAL_DB: DatabaseSchema = {
  version: 1,
  session: {
    role: 'buyer',
    buyerId: 'buyer-tata-tier1',
    manufacturerId: 'mfg-apex',
  },
  businesses: [],
  products: [],
  buyer_requirements: [],
  swipes: [],
  interests: [],
  matches: [],
  rfqs: [],
  quotations: [],
  orders: [],
  notifications: [],
};

export class Database {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.warn('Failed to parse database file, resetting to initial:', err);
        this.data = { ...INITIAL_DB };
        this.persist();
      }
    } else {
      this.data = { ...INITIAL_DB };
      this.persist();
    }
  }

  private persist() {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error persisting database to disk:', err);
    }
  }

  // Session
  getSession() {
    return this.data.session;
  }

  setSession(role: 'buyer' | 'manufacturer', businessId?: string) {
    this.data.session.role = role;
    if (businessId) {
      if (role === 'buyer') {
        this.data.session.buyerId = businessId;
      } else {
        this.data.session.manufacturerId = businessId;
      }
    }
    this.persist();
    return this.data.session;
  }

  getCurrentUserBusinessId() {
    return this.data.session.role === 'buyer'
      ? this.data.session.buyerId
      : this.data.session.manufacturerId;
  }

  // Generic collection operations
  getCollection<T = any>(name: keyof Omit<DatabaseSchema, 'version' | 'session'>): T[] {
    return (this.data[name] as T[]) || [];
  }

  findById<T = any>(name: keyof Omit<DatabaseSchema, 'version' | 'session'>, id: string): T | undefined {
    const list = this.getCollection<T>(name);
    return list.find((item: any) => item.id === id);
  }

  insert<T extends { id?: string }>(name: keyof Omit<DatabaseSchema, 'version' | 'session'>, item: T): T {
    if (!item.id) {
      item.id = `${name.slice(0, 4)}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    }
    (this.data[name] as any[]).push(item);
    this.persist();
    return item;
  }

  update<T = any>(
    name: keyof Omit<DatabaseSchema, 'version' | 'session'>,
    id: string,
    updates: Record<string, any>
  ): T | null {
    const collection = this.data[name] as any[];
    const index = collection.findIndex((item) => item.id === id);
    if (index === -1) return null;

    collection[index] = { ...collection[index], ...updates, updatedAt: new Date().toISOString() };
    this.persist();
    return collection[index];
  }

  delete(name: keyof Omit<DatabaseSchema, 'version' | 'session'>, id: string): boolean {
    const collection = this.data[name] as any[];
    const index = collection.findIndex((item) => item.id === id);
    if (index === -1) return false;

    collection.splice(index, 1);
    this.persist();
    return true;
  }

  // Seed check
  isSeeded(): boolean {
    return this.data.businesses.length > 0 && this.data.products.length > 0;
  }

  seed(initialData: {
    businesses: any[];
    products: any[];
    matches?: any[];
    rfqs?: any[];
  }) {
    this.data.businesses = initialData.businesses;
    this.data.products = initialData.products;
    if (initialData.matches && this.data.matches.length === 0) {
      this.data.matches = initialData.matches;
    }
    if (initialData.rfqs && this.data.rfqs.length === 0) {
      this.data.rfqs = initialData.rfqs;
    }
    this.persist();
  }
}

export const db = new Database();
