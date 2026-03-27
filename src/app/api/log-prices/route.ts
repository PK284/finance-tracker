import { NextRequest, NextResponse } from 'next/server';
import { fetchAllPrices } from '@/lib/fetcher';
import { supabaseAdmin } from '@/lib/supabase';
import { format } from 'date-fns';

/**
 * POST /api/log-prices
 * Protected endpoint called by the GitHub Actions cron job every morning.
 * Fetches all prices, computes % change vs yesterday, and upserts to Supabase.
 * Authorization: Bearer <CRON_SECRET>
 */
export async function POST(request: NextRequest) {
    // ── Auth check ──────────────────────────────────────────────────────────
    const authHeader = request.headers.get('authorization');
    const expectedToken = `Bearer ${process.env.CRON_SECRET}`;
    if (!process.env.CRON_SECRET || authHeader !== expectedToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(new Date(Date.now() - 86_400_000), 'yyyy-MM-dd');

    // ── Fetch yesterday's prices for % change calculation ─────────────────
    const { data: prevRows } = await supabaseAdmin
        .from('price_logs')
        .select('asset_key, price')
        .eq('created_date', yesterday);

    const prevPriceMap = Object.fromEntries(
        (prevRows ?? []).map((r: { asset_key: string; price: number }) => [r.asset_key, r.price])
    );

    // ── Fetch today's live prices ─────────────────────────────────────────
    const prices = await fetchAllPrices();

    // ── Build upsert rows ─────────────────────────────────────────────────
    const rows = prices.map((p) => {
        const prev = prevPriceMap[p.asset_key] ?? null;
        const pct = prev && prev !== 0 ? ((p.price - prev) / prev) * 100 : null;
        return {
            asset_key: p.asset_key,
            asset_name: p.asset_name,
            price: p.price,
            currency: p.currency,
            unit: p.unit,
            prev_price: prev,
            pct_change: pct !== null ? Math.round(pct * 1000) / 1000 : null,
            created_date: today,
            fetched_at: new Date().toISOString(),
        };
    });

    // ── Upsert (safe to call multiple times the same day) ─────────────────
    const { error } = await supabaseAdmin
        .from('price_logs')
        .upsert(rows, { onConflict: 'asset_key,created_date' });

    if (error) {
        console.error('Supabase upsert error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        date: today,
        logged: rows.length,
        prices: rows,
    });
}

// Also allow manual GET trigger from Vercel dashboard (dev convenience)
export async function GET(request: NextRequest) {
    return POST(request);
}
