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

function formatPrice(price: number, currency: string, unit: string): string {
    if (price === 0) return '—';
    const symbol = currency === 'INR' ? '₹' : '$';
    const formatted = price.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `${symbol}${formatted}`;
}

export default function PriceCard({ asset, log, history }: PriceCardProps) {
    const pct = log?.pct_change ?? null;
    const isPositive = pct !== null && pct > 0;
    const isNegative = pct !== null && pct < 0;
    const isNeutral = pct === null || pct === 0;

    const pctColor = isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-white/40';
    const pctBg = isPositive ? 'bg-emerald-500/10 border-emerald-500/20' : isNegative ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/10';
    const glowColor = isPositive ? 'shadow-emerald-500/10' : isNegative ? 'shadow-red-500/10' : 'shadow-transparent';

    const categoryColors: Record<string, string> = {
        forex: 'from-violet-500/20 to-indigo-500/0',
        commodity: 'from-amber-500/20 to-yellow-500/0',
        fuel: 'from-orange-500/20 to-red-500/0',
        index: 'from-cyan-500/20 to-blue-500/0',
        stock: 'from-teal-500/20 to-emerald-500/0',
    };

    const gradientClass = categoryColors[asset.category] ?? 'from-white/5 to-transparent';

    return (
        <div
            className={`
        relative rounded-2xl p-5 transition-all duration-300 ease-out
        bg-gradient-to-br ${gradientClass}
        border border-white/8
        backdrop-blur-sm
        hover:scale-[1.02] hover:border-white/15 hover:shadow-xl ${glowColor}
        group cursor-default
      `}
            style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)`,
                borderColor: 'rgba(255,255,255,0.08)',
            }}
        >
            {/* Card glow effect */}
            <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: isPositive
                        ? 'radial-gradient(circle at 50% 0%, rgba(0,255,135,0.04) 0%, transparent 70%)'
                        : isNegative
                            ? 'radial-gradient(circle at 50% 0%, rgba(255,71,87,0.04) 0%, transparent 70%)'
                            : 'none',
                }}
            />

            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl select-none">{asset.emoji}</span>
                    <div>
                        <h3 className="text-white font-semibold text-sm leading-tight">{asset.name}</h3>
                        <p className="text-white/40 text-xs mt-0.5">{asset.description}</p>
                    </div>
                </div>

                {/* % Change Badge */}
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-semibold ${pctBg} ${pctColor}`}>
                    {isPositive ? (
                        <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
                    ) : isNegative ? (
                        <TrendingDown className="w-3 h-3" strokeWidth={2.5} />
                    ) : (
                        <Minus className="w-3 h-3" strokeWidth={2.5} />
                    )}
                    {pct !== null ? `${pct > 0 ? '+' : ''}${pct.toFixed(2)}%` : '—'}
                </div>
            </div>

            {/* Price */}
            <div className="mb-1">
                <span className="text-white font-bold text-2xl tracking-tight tabular-nums">
                    {log ? formatPrice(log.price, asset.currency, asset.unit) : <span className="text-white/20 text-lg">Loading…</span>}
                </span>
                <span className="text-white/30 text-xs ml-2">{asset.unit}</span>
            </div>

            {/* Previous price */}
            {log?.prev_price && (
                <p className="text-white/30 text-xs mb-3">
                    Prev: {formatPrice(log.prev_price, asset.currency, asset.unit)}
                </p>
            )}

            {/* Sparkline */}
            <div className="mt-3 -mx-1">
                <Sparkline data={history} positive={!isNegative} />
            </div>

            {/* Last updated */}
            {log?.created_date && (
                <p className="text-white/20 text-[10px] mt-2 text-right">
                    {new Date(log.created_date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
            )}
        </div>
    );
}
