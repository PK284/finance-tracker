'use client';

import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

type SparklineProps = {
    data: Array<{ created_date: string; price: number }>;
    positive: boolean;
};

export default function Sparkline({ data, positive }: SparklineProps) {
    // Beautiful empty state when < 2 data points (Day 1)
    if (!data || data.length < 2) {
        return (
            <div style={{
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                padding: '0 4px',
            }}>
                {/* Animated bars simulating a sparkline "loading" state */}
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            width: '3px',
                            borderRadius: '2px',
                            background: positive
                                ? `rgba(0,255,135,${0.08 + Math.sin(i * 0.6) * 0.06})`
                                : `rgba(255,71,87,${0.08 + Math.sin(i * 0.6) * 0.06})`,
                            height: `${18 + Math.abs(Math.sin(i * 0.9 + 1)) * 24}px`,
                            animation: `bar-pulse 2.4s ease-in-out ${i * 0.08}s infinite alternate`,
                        }}
                    />
                ))}
                <style>{`
                    @keyframes bar-pulse {
                        from { opacity: 0.3; transform: scaleY(0.7); }
                        to   { opacity: 0.8; transform: scaleY(1);   }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{ height: '56px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                    <Line
                        type="monotone"
                        dataKey="price"
                        stroke={positive ? '#00ff87' : '#ff4757'}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={true}
                    />
                    <Tooltip
                        contentStyle={{
                            background: 'rgba(10,10,20,0.95)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '8px',
                            fontSize: '11px',
                            color: '#fff',
                            padding: '4px 8px',
                        }}
                        labelStyle={{ display: 'none' }}
                        formatter={(value) => [Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 }), 'Price']}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
