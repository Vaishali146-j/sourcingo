# Sourcingo Backend (Node.js + Express + SQLite)

This folder contains the complete, standalone backend for **Sourcingo**, an AI-powered B2B supplier matchmaking platform connecting Indian MSME manufacturers with industrial buyers.

---

## 📁 Project Structure

```
backend/
├── .env.example              # Environment variables template
├── package.json              # Backend dependencies and run scripts
├── README.md                 # Setup & API instructions
├── data/                     # Persistent SQLite database store
│   └── sourcingo.sqlite.json # Disk database
└── src/
    ├── server.js             # Main Express server entry point
    ├── db/
    │   ├── database.js       # SQLite-compatible engine & queries
    │   ├── schema.sql        # Full DDL schema for all tables
    │   └── seed.js           # Seed data with Indian MSME clusters
    ├── middleware/
    │   └── errorHandler.js   # Centralized error handler
    ├── services/
    │   └── geminiService.js  # Gemini API & deterministic fallback
    └── routes/
        ├── health.js         # Health check & status
        ├── session.js        # Demo session & role switching
        ├── businesses.js     # Business directory & details
        ├── products.js       # Product catalog CRUD
        ├── discovery.js      # Card feed (excludes signed-in business)
        ├── requirements.js   # Natural-language requirement parsing
        ├── swipes.js         # Swipes & mutual matching engine
        ├── matches.js        # Mutual connections & messaging
        ├── procurement.js    # AI procurement recommendations
        ├── rfqs.js           # RFQ & quotation lifecycle
        └── orders.js         # PO creation & order tracking
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (Node 20+ recommended).
- **npm**: v9+ (or `yarn` / `pnpm` / `bun`).

### 2. Installation
Navigate into the `backend/` directory:

```bash
cd backend
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Open `.env` and set your configuration:
```env
PORT=5000
CORS_ORIGIN=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key_here
```
*(If no `GEMINI_API_KEY` is set, the server runs with deterministic industrial parsers and trade-off generators without crashing).*

### 4. Seed the Database
To initialize or re-seed the SQLite database with Indian MSME manufacturers and demo data:

```bash
npm run seed
```

### 5. Run the Server
- **Development (with hot reload)**:
  ```bash
  npm run dev
  ```
- **Production**:
  ```bash
  npm start
  ```

The server will start listening at `http://localhost:5000`.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check, DB record counts & status |
| `GET` | `/api/demo/session` | Current demo user session |
| `POST` | `/api/demo/switch-role` | Switch between Buyer and Manufacturer demo roles |
| `GET` | `/api/businesses` | List all businesses with filters |
| `GET` | `/api/products` | Query products catalog |
| `POST` | `/api/products` | Create product listing (Manufacturer) |
| `PATCH` | `/api/products/:id` | Update product listing |
| `DELETE` | `/api/products/:id` | Delete product listing |
| `GET` | `/api/discovery` | Supplier discovery feed (**excludes current user's business**) |
| `POST` | `/api/requirements/parse` | Natural-language requirement parser |
| `POST` | `/api/swipes` | Record swipe; enforces server-authoritative mutual match rule |
| `POST` | `/api/swipes/undo` | Undo most recent swipe |
| `GET` | `/api/matches` | Connected mutual matches |
| `POST` | `/api/matches/:id/messages`| Send message in connection channel |
| `POST` | `/api/procurement/recommendations` | Explainable AI procurement ranking & trade-offs |
| `POST` | `/api/rfqs` | Submit Request for Quotation |
| `GET` | `/api/rfqs` | List user's RFQs |
| `POST` | `/api/rfqs/:id/quotations`| Manufacturer submits formal quotation |
| `POST` | `/api/orders/quotations/:id/accept` | Buyer accepts quotation and issues PO |
| `GET` | `/api/orders` | List purchase orders and deliveries |
| `PATCH` | `/api/orders/:id/status` | Advance milestone (`Confirmed` → `In Production` → `Dispatched` → `Delivered`) |
