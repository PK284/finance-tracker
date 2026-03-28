'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, Minus, Wifi, WifiOff, BarChart2 } from 'lucide-react';
import PriceCard from '@/components/PriceCard';
import { ASSETS } from '@/lib/assets';
import type { PriceLog } from '@/lib/supabase';

type HistoryRow = { asset_key: string; price: number; pct_change: number | null; created_date: string };
type ApiResponse = { success: boolean; mode?: 'database' | 'live'; latest: PriceLog[]; history: HistoryRow[]; fetchedAt: string };

const REFRESH_INTERVAL = 5 * 60 * 1000;

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

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(() => fetchPrices(), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const latestMap = Object.fromEntries((data?.latest ?? []).map((r) => [r.asset_key, r]));
  const historyMap: Record<string, HistoryRow[]> = {};
  for (const row of data?.history ?? []) {
    if (!historyMap[row.asset_key]) historyMap[row.asset_key] = [];
    historyMap[row.asset_key].push(row);
  }

  const timeStr = currentTime.toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const totalGainers  = Object.values(latestMap).filter((r) => (r.pct_change ?? 0) > 0).length;
  const totalLosers   = Object.values(latestMap).filter((r) => (r.pct_change ?? 0) < 0).length;
  const totalUnchanged = ASSETS.length - totalGainers - totalLosers;
  const isLiveMode    = data?.mode === 'live';
  const isDay1        = data?.mode === 'database' && Object.values(latestMap).every(r => r.pct_change === null);

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div className="bg-mesh" />

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '1.75rem 1.25rem 5rem' }}>

        {/* ── Header ─────────────────────────────────────── */}
        <header style={{ marginBottom: '2.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>

            {/* Left: branding */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div className="live-dot" />
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Live Dashboard
                </span>
                {!isOnline ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ff4757', fontSize: '11px', fontWeight: 600 }}>
                    <WifiOff size={11} /> Offline
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00d2ff', fontSize: '11px', fontWeight: 600 }}>
                    <Wifi size={11} /> {isLiveMode ? 'Live Mode' : 'DB Connected'}
                  </span>
                )}
              </div>
              <h1 style={{ margin: 0, fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>
                Finance Tracker
              </h1>
              <p style={{ margin: '7px 0 0', color: 'rgba(255,255,255,0.3)', fontSize: '13px', letterSpacing: '0.01em' }}>
                {dateStr}
              </p>
            </div>

            {/* Right: clock + refresh */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <div style={{
                fontFamily: 'monospace',
                fontSize: 'clamp(1.15rem, 3vw, 1.6rem)',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #00d2ff, #7b61ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.04em',
              }}>
                {timeStr}
              </div>
              <button
                onClick={() => fetchPrices(true)}
                disabled={isRefreshing}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.65)',
                  borderRadius: '10px', padding: '6px 14px',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <RefreshCw size={12} style={{ animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none' }} />
                Refresh
              </button>
              {lastUpdated && (
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', margin: 0 }}>
                  Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </p>
              )}
            </div>
          </div>

          {/* ── Market Summary Bar ──────────────────────── */}
          {data && !loading && (
            <div style={{
              marginTop: '1.5rem',
              display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center',
              padding: '12px 18px',
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
            }}>
              <BarChart2 size={14} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontWeight: 500 }}>Market:</span>

              {isDay1 ? (
                <span style={{ color: '#7b61ff', fontSize: '12px', fontWeight: 600 }}>
                  🚀 Day 1 — % change & history start tomorrow at 6 AM IST
                </span>
              ) : isLiveMode ? (
                <span style={{ color: '#00d2ff', fontSize: '12px', fontWeight: 600 }}>
                  ⚡ Live Prices — % change available after first daily log
                </span>
              ) : (
                <>
                  <span className="stat-pill" style={{ background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.2)', color: '#00ff87' }}>
                    <TrendingUp size={11} strokeWidth={2.5} /> {totalGainers} Up
                  </span>
                  <span className="stat-pill" style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.2)', color: '#ff4757' }}>
                    <TrendingDown size={11} strokeWidth={2.5} /> {totalLosers} Down
                  </span>
                  <span className="stat-pill" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                    <Minus size={11} strokeWidth={2.5} /> {totalUnchanged} Flat
                  </span>
                </>
              )}
            </div>
          )}
        </header>

        {/* ── Asset Cards Grid ─────────────────────────── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
            {ASSETS.map((_, i) => (
              <div key={i} style={{ height: '210px', animationDelay: `${i * 60}ms` }} className="skeleton" />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
            {ASSETS.map((asset, i) => (
              <div key={asset.key} className="card-enter" style={{ animationDelay: `${i * 70}ms` }}>
                <PriceCard
                  asset={asset}
                  log={latestMap[asset.key]}
                  history={historyMap[asset.key] ?? []}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Footer ──────────────────────────────────── */}
        <footer style={{ marginTop: '3.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.12)', fontSize: '11px', lineHeight: 1.8 }}>
          <p>Sources: Yahoo Finance · GoldAPI.io · GoodReturns &nbsp;|&nbsp; Auto-refreshes every 5 min</p>
          <p>Built with ❤️ &nbsp;by Piyush</p>
        </footer>
      </main>
    </div>
  );
}
