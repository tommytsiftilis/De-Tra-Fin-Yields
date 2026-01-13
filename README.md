# DeFi vs TradFi Yields Dashboard

Real-time Next.js dashboard comparing DeFi stablecoin yields against TradFi risk-free rates.

## Features

- Compare Aave V3 and Compound V3 USDC/USDT yields on Ethereum
- Track against Fed Funds Rate and 3-Month T-Bill
- Historical yield visualization (18 months)
- DeFi TVL tracking
- Spread metrics (current, average, max, min)
- Auto-refresh every 5 minutes

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- SWR

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. FRED API key (free, required for TradFi data)

### Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd De-Tra-Fin-Yields
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Get a FRED API key:
   - Go to [FRED API Key Registration](https://fred.stlouisfed.org/docs/api/api_key.html)
   - Create a free account and get your API key

4. Create `.env.local` with your API key:
   ```env
   FRED_API_KEY=your_api_key_here
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `FRED_API_KEY` | Yes | API key for Federal Reserve Economic Data |

## Data Sources

- **DeFi Yields**: [DefiLlama Yields API](https://defillama.com/docs/api) (no auth required)
- **TradFi Rates**: [FRED API](https://fred.stlouisfed.org/docs/api/fred/) (free API key required)

## Caching

| Layer | TTL | Purpose |
|-------|-----|---------|
| API Routes | 1 hour | Reduce upstream API calls |
| SWR Client | 5 minutes | Keep UI fresh |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add `FRED_API_KEY` environment variable
4. Deploy

```bash
vercel --prod
```

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run type-check # Run TypeScript check
npm run lint       # Run ESLint
```

## License

MIT
