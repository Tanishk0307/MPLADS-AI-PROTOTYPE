/*
# MPLADS AI Monitoring Platform — Schema

## Purpose
Tracks MPLADS (Members of Parliament Local Area Development Scheme) projects, their
sanctioned vs. spent budgets, sector classifications, and AI-detected anomaly flags
(cost overruns, geo-location duplicates, timeline delays, etc.).

This is a single-tenant monitoring dashboard (no sign-in), so all data is public/shared
and policies allow anon + authenticated access.

## New Tables

### sectors
- `id` (uuid, pk)
- `name` (text, unique) — e.g. "Roads", "Water", "Education", "Health"
- `icon` (text) — lucide icon name for UI display
- `created_at` (timestamptz)

### constituencies
- `id` (uuid, pk)
- `name` (text, not null) — e.g. "Varanasi", "Gorakhpur"
- `state` (text, not null) — e.g. "Uttar Pradesh"
- `mp_name` (text) — sitting MP name
- `created_at` (timestamptz)

### projects
- `id` (uuid, pk)
- `name` (text, not null)
- `sector_id` (uuid, fk -> sectors)
- `constituency_id` (uuid, fk -> constituencies)
- `sanctioned_amount_cr` (numeric, not null) — sanctioned amount in crore ₹
- `spent_amount_cr` (numeric, not null default 0) — spent amount in crore ₹
- `status` (text, default 'ongoing') — one of: ongoing, completed, stalled, flagged
- `latitude` (double precision)
- `longitude` (double precision)
- `benchmark_amount_cr` (numeric) — expected/benchmark cost for AI comparison
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### anomalies
- `id` (uuid, pk)
- `project_id` (uuid, fk -> projects)
- `type` (text, not null) — one of: cost_overrun, geo_duplicate, timeline_delay, vendor_irregular, fund_diversion
- `severity` (text, not null default 'medium') — one of: low, medium, high
- `title` (text, not null) — short headline
- `description` (text) — detailed explanation
- `metric_value` (numeric) — e.g. +42 (% overrun), 2 (duplicate count)
- `detected_at` (timestamptz, default now())
- `resolved` (boolean, default false)

## Security
- RLS enabled on all tables.
- All tables use `TO anon, authenticated` policies (single-tenant, intentionally public data).
- Full CRUD allowed on all tables for anon + authenticated.

## Notes
1. Amounts stored in crore ₹ (the standard MPLADS reporting unit).
2. `benchmark_amount_cr` enables AI cost-overrun comparison without a separate benchmark table.
3. `latitude`/`longitude` enable geo-duplicate detection logic in the UI.
4. Anomaly severity drives the "High Risk Flags" counter on the dashboard.
*/

-- Sectors
CREATE TABLE IF NOT EXISTS sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  icon text NOT NULL DEFAULT 'Building2',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_sectors" ON sectors;
CREATE POLICY "anon_select_sectors" ON sectors FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_sectors" ON sectors;
CREATE POLICY "anon_insert_sectors" ON sectors FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_sectors" ON sectors;
CREATE POLICY "anon_update_sectors" ON sectors FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_sectors" ON sectors;
CREATE POLICY "anon_delete_sectors" ON sectors FOR DELETE TO anon, authenticated USING (true);

-- Constituencies
CREATE TABLE IF NOT EXISTS constituencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  state text NOT NULL,
  mp_name text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE constituencies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_constituencies" ON constituencies;
CREATE POLICY "anon_select_constituencies" ON constituencies FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_constituencies" ON constituencies;
CREATE POLICY "anon_insert_constituencies" ON constituencies FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_constituencies" ON constituencies;
CREATE POLICY "anon_update_constituencies" ON constituencies FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_constituencies" ON constituencies;
CREATE POLICY "anon_delete_constituencies" ON constituencies FOR DELETE TO anon, authenticated USING (true);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sector_id uuid REFERENCES sectors(id) ON DELETE SET NULL,
  constituency_id uuid REFERENCES constituencies(id) ON DELETE SET NULL,
  sanctioned_amount_cr numeric NOT NULL CHECK (sanctioned_amount_cr >= 0),
  spent_amount_cr numeric NOT NULL DEFAULT 0 CHECK (spent_amount_cr >= 0),
  status text NOT NULL DEFAULT 'ongoing' CHECK (status IN ('ongoing','completed','stalled','flagged')),
  latitude double precision,
  longitude double precision,
  benchmark_amount_cr numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
CREATE POLICY "anon_insert_projects" ON projects FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_projects" ON projects;
CREATE POLICY "anon_update_projects" ON projects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_projects" ON projects;
CREATE POLICY "anon_delete_projects" ON projects FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_projects_sector ON projects(sector_id);
CREATE INDEX IF NOT EXISTS idx_projects_constituency ON projects(constituency_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Anomalies
CREATE TABLE IF NOT EXISTS anomalies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('cost_overrun','geo_duplicate','timeline_delay','vendor_irregular','fund_diversion')),
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high')),
  title text NOT NULL,
  description text,
  metric_value numeric,
  detected_at timestamptz DEFAULT now(),
  resolved boolean NOT NULL DEFAULT false
);
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_anomalies" ON anomalies;
CREATE POLICY "anon_select_anomalies" ON anomalies FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_anomalies" ON anomalies;
CREATE POLICY "anon_insert_anomalies" ON anomalies FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_anomalies" ON anomalies;
CREATE POLICY "anon_update_anomalies" ON anomalies FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_anomalies" ON anomalies;
CREATE POLICY "anon_delete_anomalies" ON anomalies FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_anomalies_project ON anomalies(project_id);
CREATE INDEX IF NOT EXISTS idx_anomalies_severity ON anomalies(severity);
CREATE INDEX IF NOT EXISTS idx_anomalies_resolved ON anomalies(resolved);
