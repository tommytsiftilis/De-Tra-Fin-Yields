# DeFi vs TradFi Yields Dashboard

Real-time Next.js dashboard comparing DeFi stablecoin yields against TradFi risk-free rates.

## Features

- Compare Aave V3 and Compound V3 USDC/USDT yields
- Track against Fed Funds Rate and 3-Month T-Bill
- Historical spread visualization
- Utilization metrics

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- SWR

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```env
# Optional - increases FRED rate limit
FRED_API_KEY=your_key_here
```

## Data Sources

- **DeFi**: [DefiLlama Yields API](https://defillama.com/docs/api)
- **TradFi**: [FRED API](https://fred.stlouisfed.org/docs/api/fred/)
