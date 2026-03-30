# Comprehensive Project Documentation: Personal Finance Tracker

## Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Tracked Assets Portfolio](#tracked-assets-portfolio)
5. [System Architecture & Data Flow](#system-architecture--data-flow)
6. [Folder Structure](#folder-structure)
7. [Database Schema (Supabase)](#database-schema-supabase)
8. [API Endpoints](#api-endpoints)
9. [Automation & Cron Jobs](#automation--cron-jobs)
10. [Environment Variables](#environment-variables)
11. [Deployment Guide (Vercel)](#deployment-guide-vercel)
12. [Local Development Setup](#local-development-setup)
13. [How to Add a New Asset](#how-to-add-a-new-asset)
14. [Troubleshooting & Maintenance](#troubleshooting--maintenance)

---

## 1. Project Overview
The Personal Finance Tracker is an automated, zero-maintenance web dashboard designed to monitor the prices of various global and local assets (stocks, currencies, commodities, and fuel). It runs entirely on free-tier services, requiring absolutely zero running costs ($0.00/year). 

The dashboard provides a highly visual, premium "glassmorphism" interface with dark mode, real-time fetching fallbacks, and 30-day historical trend graphs (sparklines).

## 2. Key Features
- **Zero Cost Architecture**: Uses Vercel (Hobby), Supabase (Free), and GitHub Actions (Free).
- **Automated Daily Logging**: Automatically records the price of all tracked assets every day at 6:00 AM IST.
- **Resilient "Live Mode"**: If the database is empty or unavailable, the app falls back to fetching live prices directly from the APIs, ensuring the dashboard never goes down.
- **Premium UI**: Features a modern, dark-themed bento-grid layout, glassmorphism card effects, and animated sparkline charts.
- **Custom Scraper**: Capable of scraping data from web pages (e.g., Petrol prices) when standard APIs are unavailable.

## 3. Technology Stack
- **Frontend Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Custom Vanilla CSS (for advanced gradient meshes and animations)
- **Charting**: Recharts (for Area/Sparkline charts)
- **Icons**: Lucide React
- **Backend / API**: Next.js Serverless Route Handlers
- **Database**: Supabase (PostgreSQL)
- **Automation**: GitHub Actions (Cron Workflow)
- **Hosting**: Vercel

## 4. Tracked Assets Portfolio
The system tracks 7 specific assets across 5 categories:

| Key | Name | Category | Fetch Source |
| :--- | :--- | :--- | :--- |
| `USD_INR` | USD / INR | Forex | Yahoo Finance API (`yahoo-finance2`) |
| `GOLD` | Gold (24K) | Commodity | GoldAPI.io |
| `SILVER` | Silver | Commodity | GoldAPI.io |
| `PETROL_BLR`| Petrol (Bangalore)| Fuel | Custom Web Scraper (Cheerio) via GoodReturns |
| `NIFTY50` | NIFTY 50 | Index | Yahoo Finance API |
| `GROWW` | GROWW | Stock | Yahoo Finance API |
| `PYPL` | PayPal | Stock | Yahoo Finance API |

## 5. System Architecture & Data Flow
1. **The Scheduler**: Every day at 6:00 AM IST, a GitHub Action runs.
2. **The Trigger**: The Action sends an HTTP POST request to `https://[YOUR_DOMAIN]/api/log-prices` with a secret Bearer token (`CRON_SECRET`).
3. **Data Fetching**: The Next.js API route securely calls all external APIs (Yahoo Finance, GoldAPI, Scraper) concurrently.
4. **Calculations**: The API compares the fresh live prices with the previous day's prices (from Supabase) to calculate the `% change`.
5. **Storage**: The new data row (including the calculated % change) is saved into the Supabase `price_logs` table.
6. **Frontend Display**: When a user opens the dashboard, the frontend fetches data from `/api/prices`, which loads the latest data and a 30-day history array from Supabase to render the numbers and sparklines.

## 6. Folder Structure
```text
finance-tracker/
├── .github/workflows/          # Contains the cron.yml for daily GitHub Actions
├── public/                     # Static assets (icons, manifest)
├── supabase/                   # Supabase migration scripts and schema definitions
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── fetch-prices/   # Route to get raw live prices bypassing the DB
    │   │   ├── log-prices/     # Route triggered by the Cron job to save data
    │   │   └── prices/         # Route used by the frontend to get DB data
    │   ├── globals.css         # Premium CSS, animations, and Tailwind imports
    │   ├── layout.tsx          # Root HTML layout and metadata
    │   └── page.tsx            # Main Dashboard UI (Bento grid)
    ├── components/
    │   ├── PriceCard.tsx       # Reusable UI component for each asset card
    │   └── Sparkline.tsx       # Recharts AreaChart component for historical trends
    └── lib/
        ├── assets.ts           # Central configuration for all tracked assets
        ├── fetcher.ts          # Core logic connecting to external APIs/Scrapers
        └── supabase.ts         # Supabase client instantiation logic
```

## 7. Database Schema (Supabase)
The project uses a single PostgreSQL table named `price_logs` inside Supabase.

**Table Definition:**
```sql
CREATE TABLE price_logs (
    id SERIAL PRIMARY KEY,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    asset_key VARCHAR(50) NOT NULL,
    asset_name VARCHAR(100) NOT NULL,
    price NUMERIC NOT NULL,
    currency VARCHAR(10) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    prev_price NUMERIC,
    pct_change NUMERIC,
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    source VARCHAR(50),
    error TEXT
);
```
- A composite Unique constraint exists on `(asset_key, created_date)` to ensure an asset only gets logged once per day.

## 8. API Endpoints

### `GET /api/prices`
- **Purpose**: Feeds the frontend dashboard.
- **Behavior**: Tries to connect to Supabase. If successful, returns the latest daily logs and the last 30 days of history. If Supabase fails or is unconfigured, it falls back seamlessly to `live` mode and fetches prices directly.

### `GET /api/fetch-prices`
- **Purpose**: Diagnostic endpoint.
- **Behavior**: Bypasses the database entirely and fetches live data directly from the APIs. Useful for checking if APIs are responding correctly.

### `GET /api/log-prices`
- **Purpose**: Automation endpoint.
- **Security**: Requires an `Authorization: Bearer <CRON_SECRET>` header.
- **Behavior**: Fetches live prices, calculates previous day differences, and inserts a new row into the Supabase database. 

## 9. Automation & Cron Jobs
We use GitHub Actions because Vercel Hobby tier only allows 1 cron job per day, but GitHub Actions allows unlimited cron jobs and provides detailed logs.

**File**: `.github/workflows/cron.yml`
- Runs daily at `0 0 * * *` (UTC), which translates to roughly 5:30 AM / 6:00 AM IST.
- Executes a `curl` command against the Vercel production URL targeting `/api/log-prices`.
- Uses GitHub Repository Secrets (`CRON_SECRET` and `PROD_URL`) to securely authenticate the request.

## 10. Environment Variables
To run this project securely, the following variables must be configured in your Vercel Project Settings:

| Variable | Purpose | Location to Find it |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Connects frontend/backend to DB | Supabase Dashboard -> Settings -> API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Safe public key for DB reading | Supabase Dashboard -> Settings -> API |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key for writing to DB | Supabase Dashboard -> Settings -> API |
| `GOLD_API_KEY` | Fetches Gold/Silver from GoldAPI.io | GoldAPI.io Dashboard |
| `CRON_SECRET` | Custom password to protect the log API | You invented this (e.g., `mySecret123`) |

## 11. Deployment Guide (Vercel)
1. Push your code to a GitHub repository.
2. Go to Vercel.com and click "Add New Project".
3. Import your GitHub repository.
4. Open the "Environment Variables" section before clicking deploy.
5. Add all 5 variables listed in Section 10.
6. Click Deploy.
7. Vercel will automatically build the Next.js app and provide a live URL (e.g., `finance-tracker.vercel.app`).

## 12. Local Development Setup
1. Clone the repository to your local machine: `git clone [REPO_URL]`
2. Install dependencies: `npm install`
3. Create a `.env.local` file in the root directory.
4. Copy the environment variables into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   CRON_SECRET=your_secret
   GOLD_API_KEY=your_key
   ```
5. Run the development server: `npm run dev`
6. Open `http://localhost:3000` in your browser.

## 13. How to Add a New Asset
The project is built to be easily scalable. If you want to track a new stock (e.g., Apple), follow these two steps:

**Step 1: Define the Asset Configuration**
Open `src/lib/assets.ts` and add a new entry to the `ASSETS` array:
```typescript
{
    key: 'AAPL',
    name: 'Apple Inc.',
    description: 'NASDAQ: AAPL',
    currency: 'USD',
    unit: 'per share',
    emoji: '🍎',
    category: 'stock',
}
```

**Step 2: Define How to Fetch It**
Open `src/lib/fetcher.ts`. In the `fetchAllPrices()` function, add the scraping logic. Because Apple is a stock, you can easily use Yahoo Finance:
```typescript
const aaplData = await safeYahooQuote('AAPL');
prices.push({
    asset_key: 'AAPL',
    asset_name: 'Apple Inc.',
    price: aaplData?.regularMarketPrice ?? 0,
    currency: 'USD',
    unit: 'per share',
    source: 'Yahoo Finance'
});
```
Commit and push your code. The dashboard will automatically create a new premium card for Apple, and tomorrow at 6 AM, it will begin logging its history!

## 14. Troubleshooting & Maintenance

- **Sparklines show "Day 1" or are empty**: Sparklines require at least 2 days of data to form a line. Ensure your `/api/log-prices` API has been hit at least twice.
- **GoldAPI returns HTTP 403**: You have likely exceeded the 100 free requests per month. Ensure you do not hit the log API manually too many times.
- **Vercel Build Fails with "Supabase URL is required"**: This means `createClient` is being called globally outside of a request handler. Always use the `getSupabase()` getter function inside your API routes.
- **Petrol Prices not updating**: Web scraping is fragile. If GoodReturns changes their HTML structure, the Cheerio scraper in `fetcher.ts` will fail and use a static fallback. You will need to inspect the GoodReturns website and update the CSS selectors in the fetcher.
