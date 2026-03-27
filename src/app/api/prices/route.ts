import { NextResponse } from 'next/server';
import { fetchAllPrices } from '@/lib/fetcher';

/**
 * GET /api/prices
 * Returns the latest prices for all 7 assets.
 *
 * Strategy:
 * 1. Try to read from Supabase (logged historical data + % change)
 * 2. If Supabase is not configured or fails → fall back to live fetch
 *    (no % change available in fallback mode, but prices still show)
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const isSupabaseConfigured =
    supabaseUrl.length > 0 && !supabaseUrl.includes('YOUR_PROJECT_ID');

  // ── Path A: Supabase configured — read from DB ─────────────────────────
  if (isSupabaseConfigured) {
    try {
      const { supabase } = await import('@/lib/supabase');

      const { data: latestRaw, error: err1 } = await supabase
        .from('price_logs')
        .select('*')
        .order('created_date', { ascending: false })
        .limit(14); // grab 2 days worth

      if (!err1) {
        // Deduplicate: keep the most recent row per asset_key
        const seen = new Set<string>();
        const latest = (latestRaw ?? []).filter((r: { asset_key: string }) => {
          if (seen.has(r.asset_key)) return false;
          seen.add(r.asset_key);
          return true;
        });

        // History: last 30 days for sparklines
        const { data: history } = await supabase
          .from('price_logs')
          .select('asset_key, price, pct_change, created_date')
          .order('created_date', { ascending: true })
          .limit(7 * 30);

        return NextResponse.json({
          success: true,
          mode: 'database',
          latest,
          history: history ?? [],
          fetchedAt: new Date().toISOString(),
        });
      }
    } catch {
      // fall through to live mode
    }
  }

  // ── Path B: No Supabase — fetch live prices directly ──────────────────
  try {
    const prices = await fetchAllPrices();

    // Shape live prices into the same format as DB rows
    const today = new Date().toISOString().slice(0, 10);
    const latest = prices.map((p) => ({
      id: 0,
      fetched_at: new Date().toISOString(),
      asset_key: p.asset_key,
      asset_name: p.asset_name,
      price: p.price,
      currency: p.currency,
      unit: p.unit,
      prev_price: null,
      pct_change: null,
      created_date: today,
      source: p.source,
      error: p.error ?? null,
    }));

    return NextResponse.json({
      success: true,
      mode: 'live', // tells dashboard this is direct live data (no % change yet)
      latest,
      history: [], // no history without DB
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
