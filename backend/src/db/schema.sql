-- Sourcingo SQLite Database Schema

CREATE TABLE IF NOT EXISTS session (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  role TEXT NOT NULL DEFAULT 'buyer',
  buyer_id TEXT NOT NULL DEFAULT 'buyer-tata-tier1',
  manufacturer_id TEXT NOT NULL DEFAULT 'mfg-apex',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  legal_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'manufacturer')),
  logo TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  serviceable_regions_json TEXT DEFAULT '["Pan-India"]',
  industry TEXT NOT NULL,
  description TEXT,
  year_established INTEGER,
  annual_turnover TEXT,
  employee_count TEXT,
  factory_area_sqft INTEGER,
  contact_json TEXT NOT NULL,
  verification_json TEXT NOT NULL,
  rating REAL DEFAULT 4.8,
  rating_count INTEGER DEFAULT 10,
  rating_breakdown_json TEXT,
  payment_reliability_json TEXT,
  registered_address TEXT,
  demo_data_notice INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  manufacturer_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  gallery_urls_json TEXT DEFAULT '[]',
  material TEXT NOT NULL,
  specifications_json TEXT NOT NULL,
  unit_price REAL NOT NULL,
  currency TEXT DEFAULT 'INR',
  price_unit TEXT NOT NULL,
  moq INTEGER NOT NULL,
  monthly_capacity INTEGER NOT NULL,
  remaining_monthly_capacity INTEGER,
  lead_time_days INTEGER NOT NULL,
  value_label TEXT DEFAULT 'Good',
  value_proposition TEXT,
  value_explanation TEXT,
  certifications_json TEXT DEFAULT '[]',
  delivery_terms TEXT,
  sample_available INTEGER DEFAULT 1,
  sample_price_inr REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (manufacturer_id) REFERENCES businesses (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS buyer_requirements (
  id TEXT PRIMARY KEY,
  buyer_id TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  product_category TEXT NOT NULL,
  material TEXT,
  quantity INTEGER,
  unit TEXT,
  max_budget REAL,
  price_unit TEXT,
  technical_specs_json TEXT DEFAULT '[]',
  preferred_location_json TEXT,
  deadline_days INTEGER,
  required_certifications_json TEXT DEFAULT '[]',
  hard_constraints_json TEXT DEFAULT '[]',
  soft_preferences_json TEXT DEFAULT '[]',
  interpretation_summary TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES businesses (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS swipes (
  id TEXT PRIMARY KEY,
  actor_business_id TEXT NOT NULL,
  target_business_id TEXT NOT NULL,
  target_offering_id TEXT,
  action TEXT NOT NULL CHECK (action IN ('reject', 'shortlist', 'rfq')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(actor_business_id, target_business_id),
  FOREIGN KEY (actor_business_id) REFERENCES businesses (id) ON DELETE CASCADE,
  FOREIGN KEY (target_business_id) REFERENCES businesses (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interests (
  id TEXT PRIMARY KEY,
  manufacturer_id TEXT NOT NULL,
  buyer_id TEXT NOT NULL,
  offering_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (manufacturer_id) REFERENCES businesses (id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES businesses (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  buyer_id TEXT NOT NULL,
  manufacturer_id TEXT NOT NULL,
  matched_offering_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  unread_count INTEGER DEFAULT 0,
  last_message TEXT,
  last_message_timestamp TEXT,
  messages_json TEXT DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(buyer_id, manufacturer_id),
  FOREIGN KEY (buyer_id) REFERENCES businesses (id) ON DELETE CASCADE,
  FOREIGN KEY (manufacturer_id) REFERENCES businesses (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rfqs (
  id TEXT PRIMARY KEY,
  rfq_number TEXT NOT NULL UNIQUE,
  buyer_id TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  manufacturer_id TEXT NOT NULL,
  manufacturer_name TEXT NOT NULL,
  offering_id TEXT,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_category TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL,
  specifications TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  delivery_state TEXT NOT NULL,
  requested_date TEXT NOT NULL,
  target_budget REAL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'RFQ Requested',
  quotation_json TEXT,
  timeline_json TEXT NOT NULL DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES businesses (id) ON DELETE CASCADE,
  FOREIGN KEY (manufacturer_id) REFERENCES businesses (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quotations (
  id TEXT PRIMARY KEY,
  rfq_id TEXT NOT NULL,
  manufacturer_id TEXT NOT NULL,
  unit_price REAL NOT NULL,
  total_amount REAL NOT NULL,
  moq INTEGER NOT NULL,
  lead_time_days INTEGER NOT NULL,
  validity TEXT NOT NULL,
  delivery_terms TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rfq_id) REFERENCES rfqs (id) ON DELETE CASCADE,
  FOREIGN KEY (manufacturer_id) REFERENCES businesses (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  rfq_id TEXT NOT NULL,
  quotation_id TEXT NOT NULL,
  buyer_id TEXT NOT NULL,
  manufacturer_id TEXT NOT NULL,
  confirmed_quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  total_amount REAL NOT NULL,
  delivery_location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Order Confirmed',
  timeline_json TEXT NOT NULL DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rfq_id) REFERENCES rfqs (id) ON DELETE CASCADE,
  FOREIGN KEY (quotation_id) REFERENCES quotations (id) ON DELETE CASCADE
);

-- Indices for rapid query lookups
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_mfg ON products (manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_swipes_actor ON swipes (actor_business_id);
CREATE INDEX IF NOT EXISTS idx_matches_buyer ON matches (buyer_id);
CREATE INDEX IF NOT EXISTS idx_matches_mfg ON matches (manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_buyer ON rfqs (buyer_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_mfg ON rfqs (manufacturer_id);
