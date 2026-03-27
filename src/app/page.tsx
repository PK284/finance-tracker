'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, TrendingUp, Wifi, WifiOff } from 'lucide-react';
import PriceCard from '@/components/PriceCard';
import { ASSETS } from '@/lib/assets';
import type { PriceLog } from '@/lib/supabase';

type HistoryRow = { asset_key: string; price: number; pct_change: number | null; created_date: string };
type ApiResponse = { success: boolean; mode?: 'database' | 'live'; latest: PriceLog[]; history: HistoryRow[]; fetchedAt: string };

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function DashboardPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchPrices = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch('/api/prices', { cache: 'no-store' });
      const json: ApiResponse = await res.json();
      setData(json);
      setLastUpdated(new Date());
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    } finally {
      setLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, []);

  // Initial fetch + auto-refresh every 5 minutes
  useEffect(() => {
    fetchPrices();
    const interval = setInterval(() => fetchPrices(), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Build lookup maps
  const latestMap = Object.fromEntries((data?.latest ?? []).map((r) => [r.asset_key, r]));
  const historyMap: Record<string, HistoryRow[]> = {};
  for (const row of data?.history ?? []) {
    if (!historyMap[row.asset_key]) historyMap[row.asset_key] = [];
    historyMap[row.asset_key].push(row);
  }

  const timeStr = currentTime.toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const totalGainers = Object.values(latestMap).filter((r) => (r.pct_change ?? 0) > 0).length;
  const totalLosers = Object.values(latestMap).filter((r) => (r.pct_change ?? 0) < 0).length;
  const isLiveMode = data?.mode === 'live';

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Background mesh */}
      <div className="bg-mesh" />

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <header style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Title block */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <div className="live-dot" />
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Live Dashboard
                </span>
                {!isOnline && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ff4757', fontSize: '11px', fontWeight: 600 }}>
                    <WifiOff size={12} /> Offline
                  </span>
                )}
                {isOnline && data && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00d2ff', fontSize: '11px', fontWeight: 600 }}>
                    <Wifi size={12} /> Connected
                  </span>
                )}
              </div>
              <h1 style={{ margin: 0, fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Finance Tracker
              </h1>
              <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>
                {dateStr}
              </p>
            </div>

            {/* Clock + controls */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 700, color: '#00d2ff', letterSpacing: '0.05em' }}>
                {timeStr}
              </div>
              <button
                onClick={() => fetchPrices(true)}
                disabled={isRefreshing}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)', borderRadius: '10px', padding: '6px 14px',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <RefreshCw size={12} style={{ animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none' }} />
                Refresh
              </button>
              {lastUpdated && (
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', margin: 0 }}>
                  Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </p>
              )}
            </div>
          </div>

          {/* Market Summary Bar */}
          {data && !loading && (
            <div style={{
              marginTop: '1.5rem',
              display: 'flex', gap: '1rem', flexWrap: 'wrap',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px',
              alignItems: 'center',
            }}>
              <TrendingUp size={15} style={{ color: 'rgba(255,255,255,0.3)' }} />
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', fontWeight: 500 }}>Market Overview:</span>
              {isLiveMode ? (
                <span style={{ color: '#00d2ff', fontSize: '12px', fontWeight: 600 }}>⚡ Live Prices — % change available after first daily log</span>
              ) : (
                <>
                  <span style={{ color: '#00ff87', fontSize: '12px', fontWeight: 700 }}>▲ {totalGainers} Gainers</span>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>·</span>
                  <span style={{ color: '#ff4757', fontSize: '12px', fontWeight: 700 }}>▼ {totalLosers} Losers</span>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>·</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{ASSETS.length - totalGainers - totalLosers} Unchanged</span>
                </>
              )}
            </div>
          )}
        </header>

        {/* ── Asset Cards Grid ────────────────────────────────── */}
        {loading ? (
          // Skeleton loading state
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {ASSETS.map((_, i) => (
              <div key={i} style={{ borderRadius: '18px', height: '195px', animationDelay: `${i * 60}ms` }} className="skeleton" />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
            {ASSETS.map((asset, i) => (
              <div
                key={asset.key}
                className="card-enter"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <PriceCard
                  asset={asset}
                  log={latestMap[asset.key]}
                  history={historyMap[asset.key] ?? []}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── No Data State — only when not in live mode and truly empty ── */}
        {!loading && !data?.latest?.length && !isLiveMode && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', fontWeight: 600 }}>No data logged yet</p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginTop: '8px' }}>
              Trigger the first log by calling <code style={{ background: 'rgba(255,255,255,0.07)', padding: '2px 6px', borderRadius: '4px' }}>/api/log-prices</code> with your cron secret.
            </p>
          </div>
        )}

        {/* ── Footer ─────────────────────────────────────────── */}
        <footer style={{ marginTop: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: '11px' }}>
          <p>
            Data sources: Yahoo Finance · GoldAPI.io · GoodReturns &nbsp;|&nbsp; Auto-refreshes every 5 min
          </p>
          <p style={{ marginTop: '4px' }}>Built with ❤️ &nbsp; by Piyush</p>
        </footer>
      </main>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
