// Asset configuration — single source of truth for all 7 tracked assets
export type AssetConfig = {
    key: string;         // DB key
    name: string;        // Display name
    description: string; // Short description shown on card
    currency: string;    // 'INR' or 'USD'
    unit: string;        // Price unit label
    emoji: string;       // Emoji icon
    category: 'forex' | 'commodity' | 'fuel' | 'index' | 'stock';
};

export const ASSETS: AssetConfig[] = [
    {
        key: 'USD_INR',
        name: 'USD / INR',
        description: 'US Dollar vs Indian Rupee',
        currency: 'INR',
        unit: 'per USD',
        emoji: '💱',
        category: 'forex',
    },
    {
        key: 'GOLD',
        name: 'Gold',
        description: 'Spot price (24K)',
        currency: 'INR',
        unit: 'per gram',
        emoji: '🪙',
        category: 'commodity',
    },
    {
        key: 'SILVER',
        name: 'Silver',
        description: 'Spot price',
        currency: 'INR',
        unit: 'per gram',
        emoji: '🔘',
        category: 'commodity',
    },
    {
        key: 'PETROL_BLR',
        name: 'Petrol · Bangalore',
        description: 'Fuel price (BLR)',
        currency: 'INR',
        unit: 'per litre',
        emoji: '⛽',
        category: 'fuel',
    },
    {
        key: 'NIFTY50',
        name: 'NIFTY 50',
        description: 'NSE Index',
        currency: 'INR',
        unit: 'points',
        emoji: '📈',
        category: 'index',
    },
    {
        key: 'GROWW',
        name: 'GROWW',
        description: 'NSE: GROWW',
        currency: 'INR',
        unit: 'per share',
        emoji: '🌱',
        category: 'stock',
    },
    {
        key: 'PYPL',
        name: 'PayPal',
        description: 'NASDAQ: PYPL',
        currency: 'USD',
        unit: 'per share',
        emoji: '🅿️',
        category: 'stock',
    },
];

export const ASSET_MAP = Object.fromEntries(ASSETS.map((a) => [a.key, a]));
