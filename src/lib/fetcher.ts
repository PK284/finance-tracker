/**
 * Core price fetching engine — yahoo-finance2 v3
 * Fetches all 7 assets in parallel from their respective sources
 */

// yahoo-finance2 v3 requires instantiation via `new YahooFinance()`
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { default: YahooFinance } = require('yahoo-finance2');
const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export type FetchedPrice = {
  asset_key: string;
  asset_name: string;
  price: number;
  currency: string;
  unit: string;
  source: string;
  error?: string;
};

// ── USD/INR ────────────────────────────────────────────────────────────────
async function fetchUsdInr(): Promise<FetchedPrice> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await yf.quote('USDINR=X');
    return {
      asset_key: 'USD_INR',
      asset_name: 'USD / INR',
      price: Number(result?.regularMarketPrice ?? 0),
      currency: 'INR',
      unit: 'per USD',
      source: 'Yahoo Finance',
    };
  } catch (e: unknown) {
    return { asset_key: 'USD_INR', asset_name: 'USD / INR', price: 0, currency: 'INR', unit: 'per USD', source: 'Yahoo Finance', error: String(e) };
  }
}

// ── Gold (GoldAPI.io → INR per gram) ──────────────────────────────────────
async function fetchGold(): Promise<FetchedPrice> {
  try {
    const res = await fetch('https://www.goldapi.io/api/XAU/INR', {
      headers: { 'x-access-token': process.env.GOLD_API_KEY ?? '' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`GoldAPI HTTP ${res.status}`);
    const data = await res.json();
    // GoldAPI returns price per troy ounce; 1 troy oz = 31.1035 grams
    const pricePerGram = (Number(data.price) || 0) / 31.1035;
    return {
      asset_key: 'GOLD',
      asset_name: 'Gold',
      price: Math.round(pricePerGram * 100) / 100,
      currency: 'INR',
      unit: 'per gram',
      source: 'GoldAPI.io',
    };
  } catch (e: unknown) {
    return { asset_key: 'GOLD', asset_name: 'Gold', price: 0, currency: 'INR', unit: 'per gram', source: 'GoldAPI.io', error: String(e) };
  }
}

// ── Silver (GoldAPI.io → INR per gram) ────────────────────────────────────
async function fetchSilver(): Promise<FetchedPrice> {
  try {
    const res = await fetch('https://www.goldapi.io/api/XAG/INR', {
      headers: { 'x-access-token': process.env.GOLD_API_KEY ?? '' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`GoldAPI HTTP ${res.status}`);
    const data = await res.json();
    const pricePerGram = (Number(data.price) || 0) / 31.1035;
    return {
      asset_key: 'SILVER',
      asset_name: 'Silver',
      price: Math.round(pricePerGram * 100) / 100,
      currency: 'INR',
      unit: 'per gram',
      source: 'GoldAPI.io',
    };
  } catch (e: unknown) {
    return { asset_key: 'SILVER', asset_name: 'Silver', price: 0, currency: 'INR', unit: 'per gram', source: 'GoldAPI.io', error: String(e) };
  }
}

// ── Petrol Bangalore ─────────────────────────────────────────────────────
async function fetchPetrolBangalore(): Promise<FetchedPrice> {
  const base = {
    asset_key: 'PETROL_BLR',
    asset_name: 'Petrol · Bangalore',
    currency: 'INR',
    unit: 'per litre',
  };

  // Scrape GoodReturns (most reliable free source for Indian fuel prices)
  try {
    const { load } = await import('cheerio');
    const res = await fetch(
      'https://www.goodreturns.in/petrol-price-in-bangalore.html',
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
        cache: 'no-store',
      }
    );
    const html = await res.text();
    const $ = load(html);

    // Try GoodReturns selectors (they update layout occasionally)
    const selectors = [
      '.applicationcost .font14',
      '.fuel_rate .font14',
      'span.font14',
      '#petrol_rate',
      '.petrol-price',
      'td.price_go',
    ];
    for (const sel of selectors) {
      const txt = $(sel).first().text().trim();
      const match = txt.match(/[\d]{2,3}\.\d+/);
      if (match) {
        return { ...base, price: parseFloat(match[0]), source: 'GoodReturns (scraped)' };
      }
    }
  } catch (_) { /* fallback below */ }

  // Known recent BLR petrol price — updated when scraper fails
  return {
    ...base, price: 102.84,
    source: 'Static value – add GOLD_API_KEY to enable live scrape',
    error: 'Scraper failed – using static fallback',
  };
}

// ── NIFTY 50 ──────────────────────────────────────────────────────────────
async function fetchNifty50(): Promise<FetchedPrice> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await yf.quote('^NSEI');
    return {
      asset_key: 'NIFTY50',
      asset_name: 'NIFTY 50',
      price: Number(result?.regularMarketPrice ?? 0),
      currency: 'INR',
      unit: 'points',
      source: 'Yahoo Finance',
    };
  } catch (e: unknown) {
    return { asset_key: 'NIFTY50', asset_name: 'NIFTY 50', price: 0, currency: 'INR', unit: 'points', source: 'Yahoo Finance', error: String(e) };
  }
}

// ── GROWW (NSE) ───────────────────────────────────────────────────────────
async function fetchGroww(): Promise<FetchedPrice> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await yf.quote('GROWW.NS');
    return {
      asset_key: 'GROWW',
      asset_name: 'GROWW',
      price: Number(result?.regularMarketPrice ?? 0),
      currency: 'INR',
      unit: 'per share',
      source: 'Yahoo Finance',
    };
  } catch (e: unknown) {
    return { asset_key: 'GROWW', asset_name: 'GROWW', price: 0, currency: 'INR', unit: 'per share', source: 'Yahoo Finance', error: String(e) };
  }
}

// ── PayPal (NASDAQ) ───────────────────────────────────────────────────────
async function fetchPaypal(): Promise<FetchedPrice> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await yf.quote('PYPL');
    return {
      asset_key: 'PYPL',
      asset_name: 'PayPal',
      price: Number(result?.regularMarketPrice ?? 0),
      currency: 'USD',
      unit: 'per share',
      source: 'Yahoo Finance',
    };
  } catch (e: unknown) {
    return { asset_key: 'PYPL', asset_name: 'PayPal', price: 0, currency: 'USD', unit: 'per share', source: 'Yahoo Finance', error: String(e) };
  }
}

// ── Master fetcher ────────────────────────────────────────────────────────
export async function fetchAllPrices(): Promise<FetchedPrice[]> {
  const results = await Promise.allSettled([
    fetchUsdInr(),
    fetchGold(),
    fetchSilver(),
    fetchPetrolBangalore(),
    fetchNifty50(),
    fetchGroww(),
    fetchPaypal(),
  ]);

  const fallbacks = [
    { key: 'USD_INR', name: 'USD / INR', currency: 'INR', unit: 'per USD' },
    { key: 'GOLD', name: 'Gold', currency: 'INR', unit: 'per gram' },
    { key: 'SILVER', name: 'Silver', currency: 'INR', unit: 'per gram' },
    { key: 'PETROL_BLR', name: 'Petrol · Bangalore', currency: 'INR', unit: 'per litre' },
    { key: 'NIFTY50', name: 'NIFTY 50', currency: 'INR', unit: 'points' },
    { key: 'GROWW', name: 'GROWW', currency: 'INR', unit: 'per share' },
    { key: 'PYPL', name: 'PayPal', currency: 'USD', unit: 'per share' },
  ];

  return results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    const fb = fallbacks[i];
    return {
      asset_key: fb.key,
      asset_name: fb.name,
      price: 0,
      currency: fb.currency,
      unit: fb.unit,
      source: 'error',
      error: String(r.reason),
    };
  });
}
