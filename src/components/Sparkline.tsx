'use client';

import { LineChart, Line, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';

type SparklineProps = {
    data: Array<{ created_date: string; price: number }>;
    positive: boolean;
    color?: string;
};

export default function Sparkline({ data, positive, color }: SparklineProps) {
    const strokeColor = color || (positive ? '#00e68a' : '#ff5470');

    // Premium animated placeholder for Day 1
    if (!data || data.length < 2) {
        return (
            <div style={{
                height: '52px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: '2px',
                padding: '0 2px',
            }}>
                {Array.from({ length: 24 }).map((_, i) => {
                    const h = 12 + Math.abs(Math.sin(i * 0.7 + 0.5)) * 28;
                    return (
                        <div
                            key={i}
                            style={{
                                width: '3px',
                                borderRadius: '2px',
                                background: `linear-gradient(to top, ${strokeColor}22, ${strokeColor}44)`,
                                height: `${h}px`,
                                animation: `bar-pulse 2.4s ease-in-out ${i * 0.06}s infinite alternate`,
                                transformOrigin: 'bottom',
                            }}
                        />
                    );
                })}
            </div>
        );
    }

    return (
        <div style={{ height: '52px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={`gradient-${positive ? 'pos' : 'neg'}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.2} />
                            <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke={strokeColor}
                        strokeWidth={1.5}
                        fill={`url(#gradient-${positive ? 'pos' : 'neg'})`}
                        dot={false}
                        isAnimationActive={true}
                    />
                    <Tooltip
                        contentStyle={{
                            background: 'rgba(10,11,20,0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            fontSize: '11px',
                            color: '#fff',
                            padding: '6px 10px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        }}
                        labelStyle={{ display: 'none' }}
                        formatter={(value) => [Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 }), 'Price']}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
