'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { PriceLog } from '@/lib/supabase';
import type { AssetConfig } from '@/lib/assets';
import Sparkline from './Sparkline';

type SparkPoint = { created_date: string; price: number };

type PriceCardProps = {
    asset: AssetConfig;
    log: PriceLog | undefined;
    history: SparkPoint[];
};

function formatPrice(price: number, currency: string): string {
    if (price === 0) return '—';
    const symbol = currency === 'INR' ? '₹' : '$';
    const formatted = price.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `${symbol}${formatted}`;
}

const categoryStyles: Record<string, { border: string; glow: string; badge: string; barColor: string }> = {
    forex:     { border: 'rgba(139,92,246,0.3)',  glow: 'rgba(139,92,246,0.12)', badge: 'rgba(139,92,246,0.15)', barColor: '#8b5cf6' },
    commodity: { border: 'rgba(245,158,11,0.3)',  glow: 'rgba(245,158,11,0.12)', badge: 'rgba(245,158,11,0.15)', barColor: '#f59e0b' },
    fuel:      { border: 'rgba(249,115,22,0.3)',  glow: 'rgba(249,115,22,0.12)', badge: 'rgba(249,115,22,0.15)', barColor: '#f97316' },
    index:     { border: 'rgba(6,182,212,0.3)',   glow: 'rgba(6,182,212,0.12)',  badge: 'rgba(6,182,212,0.15)',  barColor: '#06b6d4' },
    stock:     { border: 'rgba(16,185,129,0.3)',  glow: 'rgba(16,185,129,0.12)', badge: 'rgba(16,185,129,0.15)', barColor: '#10b981' },
};

export default function PriceCard({ asset, log, history }: PriceCardProps) {
    const pct = log?.pct_change ?? null;
    const isPositive = pct !== null && pct > 0;
    const isNegative = pct !== null && pct < 0;
    const isDay1 = pct === null && !!log;

    const cat = categoryStyles[asset.category] ?? categoryStyles.stock;

    const pctBadgeStyle = isPositive
        ? { background: 'rgba(0,255,135,0.12)', border: '1px solid rgba(0,255,135,0.25)', color: '#00ff87' }
        : isNegative
        ? { background: 'rgba(255,71,87,0.12)', border: '1px solid rgba(255,71,87,0.25)', color: '#ff4757' }
        : { background: cat.badge, border: `1px solid ${cat.border}`, color: cat.barColor };

    return (
        <div
            style={{
                position: 'relative',
                borderRadius: '20px',
                padding: '20px',
                background: 'rgba(255,255,255,0.035)',
                border: `1px solid ${cat.border}`,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: `0 0 0 0 transparent, inset 0 1px 0 rgba(255,255,255,0.06)`,
                transition: 'all 0.25s ease',
                overflow: 'hidden',
                cursor: 'default',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${cat.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`;
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLDivElement).style.borderColor = cat.barColor.replace(')', ',0.5)').replace('rgb', 'rgba');
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 0 transparent, inset 0 1px 0 rgba(255,255,255,0.06)`;
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.borderColor = cat.border;
            }}
        >
            {/* Top color accent bar */}
            <div style={{
                position: 'absolute',
                top: 0, left: '20%', right: '20%',
                height: '1px',
                background: `linear-gradient(90deg, transparent, ${cat.barColor}, transparent)`,
                opacity: 0.5,
            }} />

            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '38px', height: '38px',
                        borderRadius: '12px',
                        background: cat.badge,
                        border: `1px solid ${cat.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px',
                        flexShrink: 0,
                    }}>
                        {asset.emoji}
                    </div>
                    <div>
                        <h3 style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: '13px', letterSpacing: '-0.01em' }}>
                            {asset.name}
                        </h3>
                        <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>
                            {asset.description}
                        </p>
                    </div>
                </div>

                {/* % Change badge */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '4px 9px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    flexShrink: 0,
                    ...pctBadgeStyle,
                }}>
                    {isPositive ? (
                        <TrendingUp style={{ width: '11px', height: '11px' }} strokeWidth={2.5} />
                    ) : isNegative ? (
                        <TrendingDown style={{ width: '11px', height: '11px' }} strokeWidth={2.5} />
                    ) : (
                        <Minus style={{ width: '11px', height: '11px' }} strokeWidth={2.5} />
                    )}
                    {pct !== null ? `${pct > 0 ? '+' : ''}${pct.toFixed(2)}%` : isDay1 ? 'DAY 1' : '—'}
                </div>
            </div>

            {/* Price */}
            <div style={{ marginBottom: '4px' }}>
                <span style={{
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 'clamp(1.4rem, 3vw, 1.75rem)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                }}>
                    {log ? formatPrice(log.price, asset.currency) : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1.1rem' }}>Loading…</span>}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginLeft: '6px' }}>
                    {asset.unit}
                </span>
            </div>

            {/* Prev price row */}
            <div style={{ minHeight: '18px', marginBottom: '10px' }}>
                {log?.prev_price ? (
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.28)', fontSize: '11px' }}>
                        Yesterday: {formatPrice(log.prev_price, asset.currency)}
                    </p>
                ) : isDay1 ? (
                    <p style={{ margin: 0, color: cat.barColor, fontSize: '11px', opacity: 0.7 }}>
                        ↺ History builds after 6 AM tomorrow
                    </p>
                ) : null}
            </div>

            {/* Sparkline */}
            <Sparkline data={history} positive={!isNegative} />

            {/* Footer date */}
            {log?.created_date && (
                <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '10px', margin: '8px 0 0', textAlign: 'right' }}>
                    {new Date(log.created_date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
            )}
        </div>
    );
}
