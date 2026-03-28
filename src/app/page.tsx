'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, Minus, Wifi, WifiOff, Activity, Clock, Zap } from 'lucide-react';
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

  const totalGainers   = Object.values(latestMap).filter((r) => (r.pct_change ?? 0) > 0).length;
  const totalLosers    = Object.values(latestMap).filter((r) => (r.pct_change ?? 0) < 0).length;
  const totalUnchanged = ASSETS.length - totalGainers - totalLosers;
  const isLiveMode     = data?.mode === 'live';
  const isDay1         = data?.mode === 'database' && Object.values(latestMap).every(r => r.pct_change === null);

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div className="bg-mesh" />
      <div className="noise-overlay" />

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>

        {/* ── Header ─────────────────────────────── */}
        <header style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>

            {/* Left block */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div className="live-dot" />
                <span style={{
                  color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                }}>
                  Live Dashboard
                </span>
                <div style={{
                  width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)',
                }} />
                {!isOnline ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#ff5470', fontSize: '10px', fontWeight: 700 }}>
                    <WifiOff size={10} /> Offline
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#00d4ff', fontSize: '10px', fontWeight: 700 }}>
                    <Wifi size={10} /> {isLiveMode ? 'Live Mode' : 'DB Connected'}
                  </span>
                )}
              </div>

              <h1 style={{
                margin: 0,
                fontSize: 'clamp(2rem, 5vw, 2.8rem)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Finance Tracker
              </h1>
              <p style={{
                margin: '8px 0 0', color: 'rgba(255,255,255,0.25)',
                fontSize: '13px', fontWeight: 500, letterSpacing: '0.01em',
              }}>
                {dateStr}
              </p>
            </div>

            {/* Right: Clock + Refresh */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={14} style={{ color: 'rgba(255,255,255,0.25)' }} />
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 'clamp(1.2rem, 3vw, 1.7rem)',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #00d4ff, #966bff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.03em',
                }}>
                  {timeStr}
                </div>
              </div>
              <button
                onClick={() => fetchPrices(true)}
                disabled={isRefreshing}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.55)',
                  borderRadius: '12px', padding: '7px 16px',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.15)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.8)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)';
                }}
              >
                <RefreshCw size={12} style={{ animation: isRefreshing ? 'spin 0.7s linear infinite' : 'none' }} />
                Refresh
              </button>
              {lastUpdated && (
                <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '10px', margin: 0, fontWeight: 500 }}>
                  Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </p>
              )}
            </div>
          </div>

          {/* ── Market Summary Bar ───────────────── */}
          {data && !loading && (
            <div style={{
              marginTop: '1.75rem',
              display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center',
              padding: '14px 20px',
              background: 'rgba(14,15,30,0.5)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              backdropFilter: 'blur(12px)',
            }}>
              <Activity size={14} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', fontWeight: 600 }}>Market Pulse</span>
              <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.08)' }} />

              {isDay1 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={12} style={{ color: '#966bff' }} />
                  <span style={{ color: '#966bff', fontSize: '12px', fontWeight: 600 }}>
                    Day 1 — % change & sparklines begin after tomorrow&apos;s 6 AM log
                  </span>
                </div>
              ) : isLiveMode ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={12} style={{ color: '#00d4ff' }} />
                  <span style={{ color: '#00d4ff', fontSize: '12px', fontWeight: 600 }}>
                    Live Prices — connect Supabase for history
                  </span>
                </div>
              ) : (
                <>
                  <span className="stat-pill" style={{
                    background: 'rgba(0,230,138,0.08)',
                    border: '1px solid rgba(0,230,138,0.18)',
                    color: '#00e68a',
                  }}>
                    <TrendingUp size={11} strokeWidth={2.5} /> {totalGainers} Up
                  </span>
                  <span className="stat-pill" style={{
                    background: 'rgba(255,84,112,0.08)',
                    border: '1px solid rgba(255,84,112,0.18)',
                    color: '#ff5470',
                  }}>
                    <TrendingDown size={11} strokeWidth={2.5} /> {totalLosers} Down
                  </span>
                  <span className="stat-pill" style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.35)',
                  }}>
                    <Minus size={11} strokeWidth={2.5} /> {totalUnchanged} Flat
                  </span>
                </>
              )}
            </div>
          )}
        </header>

        {/* ── Asset Cards Grid ─────────────────── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {ASSETS.map((_, i) => (
              <div key={i} style={{ height: '230px', animationDelay: `${i * 70}ms` }} className="skeleton" />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {ASSETS.map((asset, i) => (
              <div key={asset.key} className="card-enter" style={{ animationDelay: `${i * 80}ms` }}>
                <PriceCard
                  asset={asset}
                  log={latestMap[asset.key]}
                  history={historyMap[asset.key] ?? []}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Footer ──────────────────────────── */}
        <footer style={{
          marginTop: '4rem', textAlign: 'center',
          color: 'rgba(255,255,255,0.1)', fontSize: '11px', lineHeight: 2,
        }}>
          <div style={{
            width: '60px', height: '1px', margin: '0 auto 1.5rem',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          }} />
          <p>Yahoo Finance · GoldAPI.io · GoodReturns &nbsp;·&nbsp; Auto-refreshes every 5 min</p>
          <p style={{ marginTop: '2px' }}>Built with ❤️ by Piyush</p>
        </footer>
      </main>
    </div>
  );
}
