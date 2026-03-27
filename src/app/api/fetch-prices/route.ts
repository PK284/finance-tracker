import { NextResponse } from 'next/server';
import { fetchAllPrices } from '@/lib/fetcher';

/**
 * GET /api/fetch-prices
 * Returns live prices for all 7 assets without writing to DB.
 * Useful for testing and debugging.
 */
export async function GET() {
    try {
        const prices = await fetchAllPrices();
        return NextResponse.json({ success: true, data: prices, fetchedAt: new Date().toISOString() });
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
