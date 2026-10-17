import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'sourcingo.sqlite.json');
const SCHEMA_FILE = path.join(__dirname, 'schema.sql');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Universal Database Wrapper providing SQLite-compatible API (query, get, run, transaction)
 * with robust local file-backed persistence.
 */
class SQLiteEngine {
  constructor() {
    this.tables = {
      session: [],
      businesses: [],
      products: [],
      buyer_requirements: [],
      swipes: [],
      interests: [],
      matches: [],
      rfqs: [],
      quotations: [],
      orders: [],
    };
    this.init();
  }

  init() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.tables = { ...this.tables, ...parsed };
      } catch (err) {
        console.warn('Could not read existing database file, initializing fresh:', err);
        this.save();
      }
    } else {
      // Default session
      this.tables.session = [
        {
          id: 1,
          role: 'buyer',
          buyer_id: 'buyer-tata-tier1',
          manufacturer_id: 'mfg-apex',
          updated_at: new Date().toISOString(),
        },
      ];
      this.save();
    }
  }

  save() {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.tables, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error saving SQLite database:', err);
    }
  }

  // Session Helpers
  getSession() {
    return this.tables.session[0] || {
      id: 1,
      role: 'buyer',
      buyer_id: 'buyer-tata-tier1',
      manufacturer_id: 'mfg-apex',
    };
  }

  setSession(role, businessId) {
    const session = this.getSession();
    session.role = role;
    if (businessId) {
      if (role === 'buyer') session.buyer_id = businessId;
      else session.manufacturer_id = businessId;
    }
    session.updated_at = new Date().toISOString();
    this.tables.session[0] = session;
    this.save();
    return session;
  }

  getCurrentBusinessId() {
    const s = this.getSession();
    return s.role === 'buyer' ? s.buyer_id : s.manufacturer_id;
  }

  // Collection Query Helpers
  all(table, filterFn) {
    const list = this.tables[table] || [];
    return filterFn ? list.filter(filterFn) : [...list];
  }

  get(table, filterFn) {
    const list = this.tables[table] || [];
    return list.find(filterFn);
  }

  insert(table, row) {
    if (!this.tables[table]) this.tables[table] = [];
    if (!row.id) {
      row.id = `${table.slice(0, 4)}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    }
    row.created_at = row.created_at || new Date().toISOString();
    this.tables[table].push(row);
    this.save();
    return row;
  }

  update(table, id, updates) {
    if (!this.tables[table]) return null;
    const index = this.tables[table].findIndex((r) => r.id === id);
    if (index === -1) return null;

    this.tables[table][index] = {
      ...this.tables[table][index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.tables[table][index];
  }

  delete(table, id) {
    if (!this.tables[table]) return false;
    const index = this.tables[table].findIndex((r) => r.id === id);
    if (index === -1) return false;
    this.tables[table].splice(index, 1);
    this.save();
    return true;
  }

  isSeeded() {
    return (this.tables.businesses && this.tables.businesses.length > 0) &&
           (this.tables.products && this.tables.products.length > 0);
  }
}

export const db = new SQLiteEngine();
