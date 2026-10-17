import express from 'express';
import { db } from '../db/database.js';
import { dbConnection } from '../db/sqlite.js';

export const healthRouter = express.Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: {
      type: 'SQLite',
      driver: dbConnection.isNative ? 'better-sqlite3' : 'portable-sqlite-engine',
      seeded: db.isSeeded(),
      businessesCount: db.all('businesses').length,
      productsCount: db.all('products').length,
    },
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});
