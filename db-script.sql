BEGIN;

-- -------------------------------
-- DROP SECTION (clean reset)
-- -------------------------------

-- Drop triggers
DROP TRIGGER IF EXISTS trg_set_updated_at_statuses ON statuses;
DROP TRIGGER IF EXISTS trg_set_updated_at_roles ON roles;
DROP TRIGGER IF EXISTS trg_set_updated_at_users ON users;
DROP TRIGGER IF EXISTS trg_set_updated_at_user_roles ON user_roles;
DROP TRIGGER IF EXISTS trg_set_updated_at_tokens ON tokens;

-- Drop trigger function
DROP FUNCTION IF EXISTS set_updated_at;

-- Drop tables (reverse dependency order)
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS tokens;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS statuses;

-- -------------------------------
-- CREATE SECTION (schema setup)
-- -------------------------------

-- Create audit trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create table: statuses
CREATE TABLE statuses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER DEFAULT 1
);

-- Create table: roles
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER DEFAULT 1
);

-- Create table: users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  status_id INTEGER REFERENCES statuses(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER DEFAULT 1
);

-- Create table: user_roles
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  role_id INTEGER REFERENCES roles(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER DEFAULT 1
);

-- Create table: tokens
CREATE TABLE tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expired_at TIMESTAMPTZ NOT NULL, -- this refers to refresh token expiry
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER DEFAULT 1
);

-- -------------------------------
-- TRIGGER SECTION
-- -------------------------------

-- Create triggers for updated_at
CREATE TRIGGER trg_set_updated_at_statuses
BEFORE UPDATE ON statuses
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_set_updated_at_roles
BEFORE UPDATE ON roles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_set_updated_at_users
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_set_updated_at_user_roles
BEFORE UPDATE ON user_roles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_set_updated_at_tokens
BEFORE UPDATE ON tokens
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -------------------------------
-- INDEX SECTION
-- -------------------------------

-- Speed up token lookups
CREATE INDEX idx_tokens_access_token ON tokens(access_token);
CREATE UNIQUE INDEX idx_tokens_refresh_token ON tokens(refresh_token);
CREATE INDEX idx_tokens_user_id ON tokens(user_id);
CREATE INDEX idx_tokens_expired_at ON tokens(expired_at);

-- -------------------------------
-- SEED SECTION
-- -------------------------------

-- Seed data for statuses
INSERT INTO statuses (name, description)
VALUES 
  ('Active', 'Can log in and use the system'),
  ('Inactive', 'Disabled or deleted user');

-- Seed data for roles
INSERT INTO roles (name, description)
VALUES
  ('Admin', 'Full access to the system'),
  ('Player', 'End-user or customer'),
  ('Support', 'Support team member'),
  ('Accountant', 'Handles finances and reports'),
  ('Developer', 'Developer or technical team');

-- Seed admin user (with hashed password)
-- Example bcrypt hash for 'admin123'
INSERT INTO users (username, email, password, status_id)
SELECT
  'admin',
  'admin@example.com',
  '$2b$10$YQRnR/9U2NCOUFPnMT.JJ.SVi/Di4S5hzAgt0/4f3neMfmULWUKYq',  -- bcrypt('secret123')
  id
FROM statuses
WHERE name = 'Active';

-- Assign Admin role to admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'Admin';

COMMIT;