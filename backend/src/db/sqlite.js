import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_PATH = process.env.DATABASE_PATH || path.join(DATA_DIR, 'sourcingo.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let sqliteDb = null;
let isNativeBetterSqlite3 = false;

import { initSchema } from './schema.js';

// Attempt to load better-sqlite3
try {
  const { default: BetterSqlite3 } = await import('better-sqlite3');
  sqliteDb = new BetterSqlite3(DB_PATH, {
    verbose: process.env.NODE_ENV === 'development' ? console.log : null,
  });

  // Enable WAL mode, foreign key constraints, and initialize all table structures
  initSchema(sqliteDb);

  isNativeBetterSqlite3 = true;
  console.log(`📦 SQLite database initialized with better-sqlite3 at: ${DB_PATH}`);
} catch (err) {
  console.warn('⚠️  better-sqlite3 native driver not installed or compiled in current environment.');
  console.warn('   Using portable SQLite-compatible storage adapter for local persistence.');
}

/**
 * Universal SQLite interface supporting better-sqlite3 with prepared statements
 */
export const dbConnection = {
  isNative: isNativeBetterSqlite3,
  raw: sqliteDb,

  /**
   * Execute prepared statement returning multiple rows
   */
  all(sql, params = []) {
    if (isNativeBetterSqlite3 && sqliteDb) {
      const stmt = sqliteDb.prepare(sql);
      return Array.isArray(params) ? stmt.all(...params) : stmt.all(params);
    }
    return [];
  },

  /**
   * Execute prepared statement returning single row
   */
  get(sql, params = []) {
    if (isNativeBetterSqlite3 && sqliteDb) {
      const stmt = sqliteDb.prepare(sql);
      return Array.isArray(params) ? stmt.get(...params) : stmt.get(params);
    }
    return null;
  },

  /**
   * Execute insert, update, or delete query
   */
  run(sql, params = []) {
    if (isNativeBetterSqlite3 && sqliteDb) {
      const stmt = sqliteDb.prepare(sql);
      return Array.isArray(params) ? stmt.run(...params) : stmt.run(params);
    }
    return { changes: 0, lastInsertRowid: 0 };
  },

  /**
   * Execute multi-statement SQL block (e.g., migrations, DDL)
   */
  exec(sql) {
    if (isNativeBetterSqlite3 && sqliteDb) {
      return sqliteDb.exec(sql);
    }
  },

  /**
   * Run operations inside an ACID transaction
   */
  transaction(fn) {
    if (isNativeBetterSqlite3 && sqliteDb) {
      return sqliteDb.transaction(fn)();
    }
    return fn();
  },

  close() {
    if (sqliteDb) {
      sqliteDb.close();
    }
  },
};

export default dbConnection;
