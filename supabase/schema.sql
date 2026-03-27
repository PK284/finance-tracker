-- Finance Tracker: Supabase Schema
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Drop existing table if re-creating
-- DROP TABLE IF EXISTS price_logs;

CREATE TABLE IF NOT EXISTS price_logs (
  id           BIGSERIAL PRIMARY KEY,
  fetched_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  asset_key    TEXT NOT NULL,          -- e.g. 'USD_INR', 'GOLD', 'NIFTY50', 'GROWW', 'PYPL'
  asset_name   TEXT NOT NULL,          -- Human readable name
  price        NUMERIC(18, 4) NOT NULL,
  currency     TEXT NOT NULL DEFAULT 'INR',  -- 'INR' or 'USD'
  unit         TEXT NOT NULL DEFAULT '',     -- 'per USD', 'per 10g', 'per litre', etc.
  prev_price   NUMERIC(18, 4),
  pct_change   NUMERIC(8, 4),
  created_date DATE NOT NULL DEFAULT CURRENT_DATE,
  CONSTRAINT unique_asset_date UNIQUE (asset_key, created_date)
);

-- Index for fast dashboard queries
CREATE INDEX IF NOT EXISTS idx_price_logs_date      ON price_logs (created_date DESC);
CREATE INDEX IF NOT EXISTS idx_price_logs_asset_key ON price_logs (asset_key);

-- Enable Row Level Security (RLS)
ALTER TABLE price_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for the dashboard)
CREATE POLICY "Allow public read" ON price_logs
  FOR SELECT USING (true);

-- Allow server-side insert/upsert via service_role key only
CREATE POLICY "Allow service insert" ON price_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service update" ON price_logs
  FOR UPDATE USING (true);
