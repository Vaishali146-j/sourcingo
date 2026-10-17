import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { seedDatabase } from './db/seed.js';
import { healthRouter } from './routes/health.js';
import { sessionRouter } from './routes/session.js';
import { businessesRouter } from './routes/businesses.js';
import { productsRouter } from './routes/products.js';
import { discoveryRouter } from './routes/discovery.js';
import { requirementsRouter } from './routes/requirements.js';
import { swipesRouter } from './routes/swipes.js';
import { matchesRouter } from './routes/matches.js';
import { procurementRouter } from './routes/procurement.js';
import { rfqsRouter } from './routes/rfqs.js';
import { ordersRouter } from './routes/orders.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize & Seed Database
seedDatabase();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json());

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/demo', sessionRouter);
app.use('/api/businesses', businessesRouter);
app.use('/api/products', productsRouter);
app.use('/api/discovery', discoveryRouter);
app.use('/api/requirements', requirementsRouter);
app.use('/api/swipes', swipesRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/procurement', procurementRouter);
app.use('/api/rfqs', rfqsRouter);
app.use('/api/orders', ordersRouter);

// Aliases for compatibility
app.post('/api/parse-requirement', (req, res) => res.redirect(307, '/api/requirements/parse'));
app.post('/api/procurement-advice', (req, res) => res.redirect(307, '/api/procurement/recommendations'));

// Centralized Error Handler
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Sourcingo Express & SQLite Backend running on port ${PORT}`);
  console.log(`📡 Health Check:  http://localhost:${PORT}/api/health`);
  console.log(`🔍 Discovery API: http://localhost:${PORT}/api/discovery`);
  console.log(`======================================================\n`);
});

export default app;
