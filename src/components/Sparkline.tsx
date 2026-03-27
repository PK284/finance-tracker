'use client';

import {
    LineChart,
    Line,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

type SparklineProps = {
    data: Array<{ created_date: string; price: number }>;
    positive: boolean;
};

export default function Sparkline({ data, positive }: SparklineProps) {
    if (!data || data.length < 2) {
        return <div className="h-14 flex items-center justify-center text-xs text-white/20">Not enough data yet</div>;
    }

    return (
        <div className="h-14 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                    <Line
                        type="monotone"
                        dataKey="price"
                        stroke={positive ? '#00ff87' : '#ff4757'}
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={true}
                    />
                    <Tooltip
                        contentStyle={{
                            background: 'rgba(10,10,20,0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '6px',
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
