-- src/db/schema.sql
-- schema.sql for Cloudflare D1 (SQLite)

-- Drop all tables
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS payment_types;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS payment_plans;
DROP TABLE IF EXISTS advisors;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS projects;

-- Table: projects
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  logo TEXT,
  is_deleted INTEGER DEFAULT 0 NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Sample data: projects
INSERT INTO projects(name, logo) VALUES
('Madhav Vihar', 'https://picsum.photos/id/27/200'),
('Oam Vihar', 'https://picsum.photos/id/37/200');

-- Table: customers
CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  aadhar TEXT,
  phone TEXT,
  email TEXT,
  is_deleted INTEGER DEFAULT 0 NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Table: advisors
CREATE TABLE advisors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  is_deleted INTEGER DEFAULT 0 NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Table: payment_plans
CREATE TABLE payment_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  total_installments INTEGER,
  is_deleted INTEGER DEFAULT 0 NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Sample data: payment_plans
INSERT INTO payment_plans (name, project_id, total_installments) VALUES
('Group A - 25%', 1, 5),
('Group B - 33%', 1, 3),
('Group C - 50%', 1, 2),
('Group D - 50%', 1, 3),
('Group E - 100%', 1, 1);

-- Table: properties
CREATE TABLE properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  receipt_num INTEGER,
  project_id INTEGER NOT NULL,
  customer_id INTEGER,
  advisor_id INTEGER,
  payment_plan_id INTEGER,
  name TEXT NOT NULL,
  name_in_words TEXT,
  commission_pct REAL,
  rate REAL,
  area REAL,
  total_amount REAL,
  total_amount_in_words TEXT,
  facing TEXT CHECK (facing IN ('east', 'west', 'north', 'south')),
  is_deleted INTEGER DEFAULT 0 NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (advisor_id) REFERENCES advisors(id),
  FOREIGN KEY (payment_plan_id) REFERENCES payment_plans(id)
);

-- Table: payment_types
CREATE TABLE payment_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  project_id INTEGER NOT NULL,
  payment_plan_id INTEGER NOT NULL,
  amount REAL,
  amount_pct REAL,
  amount_in_words TEXT,
  installment_number INTEGER,
  due_date TEXT,
  is_deleted INTEGER DEFAULT 0 NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (payment_plan_id) REFERENCES payment_plans(id) ON DELETE CASCADE
);

-- Sample data: payment_types
INSERT INTO payment_types (name, project_id, payment_plan_id, installment_number, amount_pct) VALUES
('On Booking', 1, 1, 1, 25),
('4 Month of Booking', 1, 1, 2, 20),
('8 Month of Booking', 1, 1, 3, 20),
('12 Month of Booking', 1, 1, 4, 20),
('On Registry', 1, 1, 5, 15),
('On Booking', 1, 2, 1, 33),
('6 Month of Booking', 1, 2, 2, 33),
('On Registry', 1, 2, 3, 34),
('On Booking', 1, 3, 1, 50),
('On Registry', 1, 3, 2, 50),
('On Booking', 1, 4, 1, 50),
('5 Month of Booking', 1, 4, 2, 25),
('On Registry', 1, 4, 3, 25),
('Full Payment on Booking', 1, 5, 1, 100);

-- Table: transactions
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  property_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  advisor_id INTEGER,
  payment_type_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  amount_in_words TEXT,
  mode_id INTEGER,
  date TEXT NOT NULL DEFAULT CURRENT_DATE,
  cheque_num TEXT,
  cheque_date TEXT,
  receipt_url TEXT,
  is_deleted INTEGER DEFAULT 0 NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (advisor_id) REFERENCES advisors(id),
  FOREIGN KEY (payment_type_id) REFERENCES payment_types(id) ON DELETE CASCADE
);
