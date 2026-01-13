# Agent Guidelines for DeFi vs TradFi Yields Dashboard

## Project Overview
Real-time Next.js dashboard comparing DeFi stablecoin yields (Aave/Compound) against TradFi risk-free rates (Fed Funds, T-bills), hosted on Vercel.

## Key Documentation
- **Implementation Plan**: `docs/IMPLEMENTATION_PLAN.md` - detailed technical spec
- **Beads Guide**: `.beads/BD_GUIDE.md` - task tracking workflow

## Task Management
This project uses **beads** for task tracking. See `.beads/BD_GUIDE.md` for commands.

Quick reference:
- `bd ready` - show unblocked tasks
- `bd show <id>` - view task details
- `bd start <id>` - begin working on a task
- `bd done <id>` - mark task complete
- `bd create "title"` - create new task

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Data Fetching**: SWR
- **Deployment**: Vercel

## Data Sources
- **DeFi**: DefiLlama Yields API (free, no auth)
- **TradFi**: FRED API (free)

## Code Style
- TypeScript strict mode
- Functional components with hooks
- API routes with response caching
- SWR for client-side data fetching
