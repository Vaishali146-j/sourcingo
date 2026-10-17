# Sourcingo — B2B Industrial Sourcing & Matchmaking Platform

Sourcingo bridges the gap between Indian MSME manufacturers and industrial buyers through Tinder-style supplier discovery, explainable AI procurement recommendations, and a streamlined quotation workflow.

---

## 1. Prerequisites

- **Node.js**: `v18.0.0` or higher (Node 20+ recommended).
- **Package Manager**: `npm` (v9+) or `bun` / `pnpm` / `yarn`.
- **Operating System**: macOS, Linux, or Windows (WSL / PowerShell).

---

## 2. Quick Localhost Setup

### Step 1: Clone & Install Dependencies

```bash
git clone <your-repository-url>
cd sourcingo
npm install
```

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Optional: Gemini API Key for AI Natural-Language Requirement Parsing & Procurement Advice
# Obtain a free or pay-as-you-go key from https://aistudio.google.com/
GEMINI_API_KEY="your_gemini_api_key_here"

# Server Port (default: 3000)
PORT=3000
```

*Note: Sourcingo includes deterministic industrial fallback logic. If `GEMINI_API_KEY` is not provided, the entire platform remains 100% operational with deterministic parsers and multi-criteria scoring.*

### Step 3: Run the Application (Full-Stack)

Start both the backend Express API and the Vite frontend simultaneously:

```bash
npm run dev
```

The application will start at:
- **Web Application**: `http://localhost:3000`
- **Backend API Health**: `http://localhost:3000/api/health`
- **Discovery Feed**: `http://localhost:3000/api/discovery`

---

## 3. Project Structure

The codebase is organized into dedicated `frontend` and `backend` directories:

```
├── backend/
│   ├── db/
│   │   ├── database.ts        # Disk-persisted JSON database engine
│   │   └── seedData.ts        # Indian MSME seed dataset & initializer
│   ├── routes/
│   │   └── api.ts             # REST API router (discovery, swipes, RFQs, etc.)
│   └── server.ts              # Express API server & Vite middleware mount
│
├── frontend/
│   ├── index.html             # Single-page application entry HTML
│   └── src/
│       ├── api/
│       │   └── client.ts      # Typed REST API client
│       ├── components/
│       │   ├── common/        # Trust badges, capacity progress bar, etc.
│       │   ├── discovery/     # Tinder-style supplier card stack & modals
│       │   ├── manufacturer/  # MSME inbound demand dashboard & catalog
│       │   ├── matches/       # Mutual connection celebration & chat
│       │   ├── procurement/   # AI procurement comparison assistant
│       │   └── shortlist/     # Saved supplier matrix & comparison table
│       ├── context/
│       │   └── AppContext.tsx # Central frontend state connected to backend
│       ├── data/
│       │   └── mockSuppliers.ts
│       ├── types/
│       │   └── index.ts
│       ├── App.tsx
│       ├── index.css          # Industrial Precision Tailwind CSS theme
│       └── main.tsx
│
├── data/
│   └── sourcingo.db.json      # Persistent local database file
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 4. Database & Local Persistence

Sourcingo uses a persistent disk-backed database located at:
`data/sourcingo.db.json`

- **Automatic Seeding**: The server automatically seeds the database on first run with verified Indian MSME manufacturers across authentic clusters (Ludhiana CNC, Ahmedabad cotton textiles, Surat technical textiles, Coimbatore pump castings, Peenya Bengaluru aerospace stamping, Rajkot forgings, Moradabad brass valves, etc.).
- **Data Persistence**: Swipes, matches, messages, RFQs, quotations, and product additions survive server restarts.
- **Reset Database**: Delete `data/sourcingo.db.json` and restart the server to restore original seed data.

---

## 4. Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check & database stats |
| `GET` | `/api/demo/session` | Active demo user session |
| `POST` | `/api/demo/switch-role` | Switch between Buyer and Manufacturer demo mode |
| `GET` | `/api/discovery` | Supplier discovery feed (excluding current user's business) |
| `POST` | `/api/requirements/parse` | Natural-language requirement interpretation with Gemini |
| `POST` | `/api/swipes` | Record buyer interest/pass with server-side mutual match evaluation |
| `POST` | `/api/swipes/undo` | Undo the most recent swipe |
| `GET` | `/api/matches` | Retrieve mutual verified connections |
| `POST` | `/api/matches/:id/messages` | Send commercial inquiry in chat thread |
| `POST` | `/api/procurement/recommendations` | AI procurement ranking and trade-off generation |
| `GET` | `/api/rfqs` | List active RFQs for current business |
| `POST` | `/api/rfqs` | Submit new Request for Quotation |
| `POST` | `/api/rfqs/:id/quotations` | Manufacturer submits commercial quotation |
| `POST` | `/api/quotations/:id/accept` | Buyer accepts quote and creates formal order |
| `PATCH` | `/api/orders/:id/status` | Advance order status across production & dispatch |

---

## 5. Troubleshooting

- **Port in use**: If port 3000 is occupied, set `PORT=3001 npm run dev` in your shell.
- **Card exclusion**: As specified, the card of the signed-in user's own business is strictly excluded from both the card stack interface and the `/api/discovery` backend feed. Switch roles via the header dropdown to view the platform from either perspective.
