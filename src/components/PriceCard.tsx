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

const categoryThemes: Record<string, {
    accent: string;
    accentDim: string;
    glow: string;
    borderHover: string;
    iconBg: string;
    iconBorder: string;
    label: string;
}> = {
    forex: {
        accent: '#966bff',
        accentDim: 'rgba(150,107,255,0.15)',
        glow: 'rgba(150,107,255,0.08)',
        borderHover: 'rgba(150,107,255,0.35)',
        iconBg: 'rgba(150,107,255,0.1)',
        iconBorder: 'rgba(150,107,255,0.2)',
        label: 'FOREX',
    },
    commodity: {
        accent: '#ffb347',
        accentDim: 'rgba(255,179,71,0.15)',
        glow: 'rgba(255,179,71,0.08)',
        borderHover: 'rgba(255,179,71,0.35)',
        iconBg: 'rgba(255,179,71,0.1)',
        iconBorder: 'rgba(255,179,71,0.2)',
        label: 'COMMODITY',
    },
    fuel: {
        accent: '#ff7849',
        accentDim: 'rgba(255,120,73,0.15)',
        glow: 'rgba(255,120,73,0.08)',
        borderHover: 'rgba(255,120,73,0.35)',
        iconBg: 'rgba(255,120,73,0.1)',
        iconBorder: 'rgba(255,120,73,0.2)',
        label: 'FUEL',
    },
    index: {
        accent: '#00d4ff',
        accentDim: 'rgba(0,212,255,0.15)',
        glow: 'rgba(0,212,255,0.08)',
        borderHover: 'rgba(0,212,255,0.35)',
        iconBg: 'rgba(0,212,255,0.1)',
        iconBorder: 'rgba(0,212,255,0.2)',
        label: 'INDEX',
    },
    stock: {
        accent: '#00e68a',
        accentDim: 'rgba(0,230,138,0.15)',
        glow: 'rgba(0,230,138,0.08)',
        borderHover: 'rgba(0,230,138,0.35)',
        iconBg: 'rgba(0,230,138,0.1)',
        iconBorder: 'rgba(0,230,138,0.2)',
        label: 'STOCK',
    },
};

export default function PriceCard({ asset, log, history }: PriceCardProps) {
    const pct = log?.pct_change ?? null;
    const isPositive = pct !== null && pct > 0;
    const isNegative = pct !== null && pct < 0;
    const isDay1 = pct === null && !!log;

    const theme = categoryThemes[asset.category] ?? categoryThemes.stock;

    // Badge colors: green for positive, red for negative, category color for Day 1
    const badgeStyle = isPositive
        ? { background: 'rgba(0,230,138,0.1)', border: '1px solid rgba(0,230,138,0.25)', color: '#00e68a' }
        : isNegative
        ? { background: 'rgba(255,84,112,0.1)', border: '1px solid rgba(255,84,112,0.25)', color: '#ff5470' }
        : { background: theme.accentDim, border: `1px solid ${theme.iconBorder}`, color: theme.accent };

    return (
        <div
            style={{
                position: 'relative',
                borderRadius: '20px',
                padding: '22px 20px 18px',
                background: 'rgba(14,15,30,0.65)',
                border: `1px solid rgba(255,255,255,0.06)`,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                overflow: 'hidden',
                cursor: 'default',
            }}
            onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.boxShadow = `0 12px 40px ${theme.glow}, 0 0 0 1px ${theme.borderHover}`;
                el.style.transform = 'translateY(-3px)';
                el.style.borderColor = theme.borderHover;
            }}
            onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.boxShadow = 'none';
                el.style.transform = 'translateY(0)';
                el.style.borderColor = 'rgba(255,255,255,0.06)';
            }}
        >
            {/* Top accent line */}
            <div style={{
                position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px',
                background: `linear-gradient(90deg, transparent, ${theme.accent}60, transparent)`,
            }} />

            {/* Left color stripe */}
            <div style={{
                position: 'absolute', top: '15%', bottom: '15%', left: 0, width: '3px',
                borderRadius: '0 3px 3px 0',
                background: `linear-gradient(to bottom, ${theme.accent}, ${theme.accent}33)`,
            }} />

            {/* Category label */}
            <div style={{
                position: 'absolute', top: '12px', right: '14px',
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: theme.accent,
                opacity: 0.4,
            }}>
                {theme.label}
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                    width: '42px', height: '42px',
                    borderRadius: '14px',
                    background: theme.iconBg,
                    border: `1px solid ${theme.iconBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0,
                }}>
                    {asset.emoji}
                </div>
                <div style={{ minWidth: 0 }}>
                    <h3 style={{
                        margin: 0, color: '#fff', fontWeight: 700,
                        fontSize: '14px', letterSpacing: '-0.01em',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {asset.name}
                    </h3>
                    <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.32)', fontSize: '11px' }}>
                        {asset.description}
                    </p>
                </div>
            </div>

            {/* Price + Change */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div>
                    <span style={{
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: 'clamp(1.5rem, 3vw, 1.85rem)',
                        letterSpacing: '-0.03em',
                        lineHeight: 1,
                        fontFamily: "'Inter', system-ui, sans-serif",
                        fontVariantNumeric: 'tabular-nums',
                    }}>
                        {log ? formatPrice(log.price, asset.currency) : (
                            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '1.1rem' }}>—</span>
                        )}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginLeft: '6px', fontWeight: 500 }}>
                        {asset.unit}
                    </span>
                </div>

                {/* Badge */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '3px',
                    padding: '4px 10px', borderRadius: '10px',
                    fontSize: '11px', fontWeight: 700, flexShrink: 0,
                    ...badgeStyle,
                }}>
                    {isPositive ? <TrendingUp style={{ width: '12px', height: '12px' }} strokeWidth={2.5} />
                        : isNegative ? <TrendingDown style={{ width: '12px', height: '12px' }} strokeWidth={2.5} />
                        : <Minus style={{ width: '12px', height: '12px' }} strokeWidth={2.5} />}
                    {pct !== null ? `${pct > 0 ? '+' : ''}${pct.toFixed(2)}%` : isDay1 ? 'DAY 1' : '—'}
                </div>
            </div>

            {/* Yesterday row */}
            <div style={{ minHeight: '16px', marginBottom: '8px' }}>
                {log?.prev_price ? (
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.22)', fontSize: '11px' }}>
                        Yesterday · {formatPrice(log.prev_price, asset.currency)}
                    </p>
                ) : isDay1 ? (
                    <p style={{ margin: 0, fontSize: '11px', color: theme.accent, opacity: 0.5 }}>
                        ↺ Tracking starts after next daily log
                    </p>
                ) : null}
            </div>

            {/* Sparkline */}
            <Sparkline data={history} positive={!isNegative} color={theme.accent} />

            {/* Date */}
            {log?.created_date && (
                <p style={{ color: 'rgba(255,255,255,0.14)', fontSize: '10px', margin: '6px 0 0', textAlign: 'right', fontWeight: 500 }}>
                    {new Date(log.created_date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
            )}
        </div>
    );
}
