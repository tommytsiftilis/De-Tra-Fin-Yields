# DeFi vs TradFi Yields Dashboard

**Live:** [de-tra-fin-yields.vercel.app](https://de-tra-fin-yields.vercel.app)

Real-time dashboard comparing DeFi stablecoin lending yields against TradFi risk-free rates.

## What It Tracks

**DeFi Yields (via DefiLlama)**
- Aave V3 USDC & USDT (Ethereum)
- Compound V3 USDC (Ethereum)
- Morpho Steakhouse USDC (Ethereum)

**TradFi Rates (via FRED)**
- Federal Funds Rate
- 3-Month Treasury Bill

## Tech Stack

Next.js 16 (App Router) / TypeScript / Tailwind CSS / Recharts / SWR / Vercel

## Local Development

```bash
git clone https://github.com/tommy-dtran/De-Tra-Fin-Yields.git
cd De-Tra-Fin-Yields
npm install
```

Get a free [FRED API key](https://fred.stlouisfed.org/docs/api/api_key.html), then:

```bash
echo "FRED_API_KEY=your_key_here" > .env.local
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Data Sources

- [DefiLlama Yields API](https://defillama.com/docs/api) — free, no auth
- [FRED API](https://fred.stlouisfed.org/docs/api/fred/) — free API key required

## License

MIT
