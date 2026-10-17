import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import SQLite connection configured with better-sqlite3
import { dbConnection } from './db/sqlite.js';
import { db } from './db/database.js';
import { seedDatabase } from './db/seed.js';

// Import Modular API Route Controllers
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

// Initialize Database & Seed Records
seedDatabase();

// -------------------------------------------------------------
// Core Middleware: CORS & JSON Parsing
// -------------------------------------------------------------

// 1. CORS Configuration
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin: allowedOrigin === '*' ? '*' : [allowedOrigin, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
}));

// 2. Request Body Parsers (JSON & URL-Encoded)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Request Logging in Development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// -------------------------------------------------------------
// API Routes Ready for Development
// -------------------------------------------------------------

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

// Root Welcome Route
app.get('/', (_req, res) => {
  res.json({
    name: 'Sourcingo B2B Matchmaking API',
    version: '1.0.0',
    status: 'running',
    sqlite: {
      driver: dbConnection.isNative ? 'better-sqlite3' : 'portable-sqlite-engine',
      connected: true,
    },
    documentation: '/api/health',
  });
});

// Backward compatibility redirects for legacy endpoints
app.post('/api/parse-requirement', (req, res) => res.redirect(307, '/api/requirements/parse'));
app.post('/api/procurement-advice', (req, res) => res.redirect(307, '/api/procurement/recommendations'));

// -------------------------------------------------------------
// Centralized Error Handling
// -------------------------------------------------------------
app.use(errorHandler);

// Start Express HTTP Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Sourcingo Express Server Active`);
  console.log(`🔌 Port:          ${PORT}`);
  console.log(`🗄️  Database:      SQLite (${dbConnection.isNative ? 'better-sqlite3' : 'portable-sqlite'})`);
  console.log(`🌐 CORS Allowed:  ${allowedOrigin}`);
  console.log(`📡 Health Check:  http://localhost:${PORT}/api/health`);
  console.log(`🔍 Discovery API: http://localhost:${PORT}/api/discovery`);
  console.log(`======================================================\n`);
});

export default app;
