import { createClient } from '@supabase/supabase-js';

export type PriceLog = {
  id: number;
  fetched_at: string;
  asset_key: string;
  asset_name: string;
  price: number;
  currency: string;
  unit: string;
  prev_price: number | null;
  pct_change: number | null;
  created_date: string;
};

/**
 * Lazy factory — creates a new Supabase client with the anon key.
 * Called only inside request handlers, never at module level.
 */
export function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Lazy factory — creates a Supabase admin client (service role key).
 * Only use inside trusted server-side API routes.
 */
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
