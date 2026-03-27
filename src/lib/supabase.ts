import { createClient } from '@supabase/supabase-js';

// Public client (used on the frontend / in API routes for reads)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Admin client with service role key (used only in server-side API routes for writes)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
