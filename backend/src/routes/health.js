import express from 'express';
import { db } from '../db/database.js';

export const healthRouter = express.Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: {
      type: 'SQLite-compatible',
      seeded: db.isSeeded(),
      businessesCount: db.all('businesses').length,
      productsCount: db.all('products').length,
    },
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});
