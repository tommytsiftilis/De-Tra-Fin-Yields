# DeFi vs TradFi Yields Dashboard - Implementation Plan

## Overview
Real-time Next.js dashboard on Vercel comparing DeFi stablecoin yields against TradFi risk-free rates.

---

## Data Sources

### DeFi Data: DefiLlama Yields API
- **Base URL**: `https://yields.llama.fi`
- **Endpoints**:
  - `GET /pools` - all yield pools (find Aave/Compound pool IDs)
  - `GET /chart/{pool}` - historical APY for specific pool
- **No auth required**, free tier sufficient
- **Pools to track**:
  - Aave V3 USDC (Ethereum)
  - Aave V3 USDT (Ethereum)
  - Compound V3 USDC (Ethereum)

### TradFi Data: FRED API
- **Base URL**: `https://api.stlouisfed.org/fred`
- **Endpoints**:
  - `GET /series/observations?series_id=DFF` - Fed Funds Rate (daily)
  - `GET /series/observations?series_id=DTB3` - 3-Month T-Bill (daily)
- **Optional API key** (free registration at https://fred.stlouisfed.org/docs/api/api_key.html)
- **No key needed** for <100 requests/day

---

## Project Structure

```
/
├── app/
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Main dashboard page
│   ├── globals.css              # Global styles
│   └── api/
│       ├── defi-yields/
│       │   └── route.ts         # DefiLlama proxy
│       ├── tradfi-rates/
│       │   └── route.ts         # FRED proxy
│       └── spread/
│           └── route.ts         # Combined data + spread calc
├── components/
│   ├── Header.tsx               # Dashboard header
│   ├── RatesTable.tsx           # Current rates snapshot
│   ├── SpreadChart.tsx          # Historical spread visualization
│   ├── UtilizationChart.tsx     # DeFi utilization context
│   └── MetricsCards.tsx         # Summary statistics
├── lib/
│   ├── defillama.ts             # DefiLlama API client
│   ├── fred.ts                  # FRED API client
│   └── utils.ts                 # Helpers (date formatting, etc)
├── types/
│   └── index.ts                 # TypeScript interfaces
├── docs/
│   └── IMPLEMENTATION_PLAN.md   # This file
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Implementation Tasks

### Phase 1: Project Setup
- [ ] Initialize Next.js 14 with App Router
  ```bash
  npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
  ```
- [ ] Install dependencies
  ```bash
  npm install recharts swr date-fns
  npm install -D @types/node
  ```
- [ ] Set up basic layout and globals

### Phase 2: API Clients
- [ ] Create `lib/defillama.ts`
  - Function to fetch all pools and filter for Aave/Compound USDC/USDT
  - Function to fetch historical APY for a pool ID
  - Type definitions for API responses

- [ ] Create `lib/fred.ts`
  - Function to fetch Fed Funds Rate observations
  - Function to fetch T-Bill observations
  - Handle date range params (last 18 months)

- [ ] Create `lib/utils.ts`
  - Date formatting helpers
  - Spread calculation (DeFi APY - risk-free rate)
  - Data normalization for charts

### Phase 3: API Routes
- [ ] Create `app/api/defi-yields/route.ts`
  - Fetch current + historical DeFi yields
  - Cache with `revalidate: 3600` (1 hour)
  - Return normalized JSON

- [ ] Create `app/api/tradfi-rates/route.ts`
  - Fetch Fed Funds + T-Bill rates
  - Cache with `revalidate: 3600`
  - Return normalized JSON

- [ ] Create `app/api/spread/route.ts`
  - Combine DeFi and TradFi data
  - Calculate spread for each date
  - Return merged time series

### Phase 4: Dashboard Components
- [ ] Create `components/Header.tsx`
  - Title, last updated timestamp
  - Brief description

- [ ] Create `components/RatesTable.tsx`
  - Table showing current rates for all assets
  - Columns: Asset, Protocol, Current APY, vs Risk-Free

- [ ] Create `components/SpreadChart.tsx`
  - Recharts LineChart with:
    - X-axis: Date (last 12-18 months)
    - Y-axis: APY (%)
    - Lines: Each DeFi pool, Fed Funds, T-Bill
  - Tooltip with all values on hover
  - Legend

- [ ] Create `components/UtilizationChart.tsx`
  - Recharts AreaChart showing utilization over time
  - Helps explain rate movements

- [ ] Create `components/MetricsCards.tsx`
  - Average spread over period
  - Current spread
  - Max spread (date)
  - Min spread (date)

### Phase 5: Main Dashboard Page
- [ ] Wire up `app/page.tsx`
  - Use SWR for data fetching with 5-min refresh
  - Loading states
  - Error handling
  - Responsive grid layout

### Phase 6: Polish
- [ ] Add loading skeletons
- [ ] Mobile responsive design
- [ ] Dark mode support (optional)
- [ ] README with setup instructions

### Phase 7: Deploy
- [ ] Push to GitHub
- [ ] Connect to Vercel
- [ ] Set environment variables (FRED_API_KEY if using)
- [ ] Verify production deployment

---

## API Response Shapes

### DefiLlama /pools (filtered)
```typescript
interface DefiPool {
  pool: string;           // unique ID
  chain: string;          // "Ethereum"
  project: string;        // "aave-v3", "compound-v3"
  symbol: string;         // "USDC", "USDT"
  tvlUsd: number;
  apy: number;            // current APY
  apyBase: number;        // base APY (no rewards)
}
```

### DefiLlama /chart/{pool}
```typescript
interface ApyHistory {
  data: Array<{
    timestamp: string;    // ISO date
    apy: number;
    tvlUsd: number;
  }>;
}
```

### FRED observations
```typescript
interface FredObservation {
  date: string;           // "YYYY-MM-DD"
  value: string;          // rate as string (parse to float)
}
```

### Internal spread data
```typescript
interface SpreadDataPoint {
  date: string;
  aaveUsdcApy: number;
  aaveUsdtApy: number;
  compoundUsdcApy: number;
  fedFundsRate: number;
  tbillRate: number;
  spreadVsFed: number;    // best DeFi rate - fed funds
  spreadVsTbill: number;  // best DeFi rate - t-bill
}
```

---

## Caching Strategy

| Layer | TTL | Purpose |
|-------|-----|---------|
| Next.js API routes | 1 hour | Reduce upstream API calls |
| SWR client-side | 5 minutes | Keep UI fresh |
| Vercel Edge | Automatic | CDN caching |

---

## Environment Variables

```env
# Optional - increases FRED rate limit
FRED_API_KEY=your_key_here
```

---

## Useful Commands

```bash
# Development
npm run dev

# Type checking
npm run type-check  # or: npx tsc --noEmit

# Build
npm run build

# Deploy preview
vercel

# Deploy production
vercel --prod
```

---

## Reference Links

- [DefiLlama Yields API Docs](https://defillama.com/docs/api)
- [FRED API Docs](https://fred.stlouisfed.org/docs/api/fred/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Recharts](https://recharts.org/en-US/)
- [SWR](https://swr.vercel.app/)
