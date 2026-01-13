# Implementation Plan: Fix DeFi Pool Tracking & Add Morpho

> Run this plan with: `@docs/POOL_TRACKING_FIX_PLAN.md`

## Summary
Fix the incorrect Aave USDC TVL (~$936K instead of ~$6B) by switching from filter-based to explicit pool ID matching, and add Morpho protocol for comprehensive DeFi lending coverage.

---

## Problem
Current filter `{ chain: "Ethereum", project: "aave-v3", symbol: "USDC" }` in `lib/defillama.ts` matches the wrong pool. DefiLlama has multiple pools matching these criteria.

## Solution
Use hardcoded pool IDs instead of filter matching, and add Morpho (the #2 lending protocol with $7.7B TVL).

---

## Pool Configuration (New)

| Protocol | Asset | Pool ID | TVL |
|----------|-------|---------|-----|
| Aave V3 | USDC | `aa70268e-4b52-42bf-a116-608b370f9501` | ~$6B |
| Aave V3 | USDT | *lookup from DefiLlama API first* | ~$2B |
| Compound V3 | USDC | `7da72d09-56ca-4ec5-a45f-59114353e487` | ~$2B |
| Morpho | USDC (Steakhouse) | `a44febf3-34f6-4cd5-8ab1-f246ebe49f9e` | ~$500M |

**First step**: Lookup Aave V3 USDT Ethereum pool ID by fetching `https://yields.llama.fi/pools` and finding the pool where `project: "aave-v3"`, `chain: "Ethereum"`, `symbol: "USDT"` with the highest TVL.

---

## Files to Modify

### 1. `lib/defillama.ts` - Core Change
Replace filter-based matching with explicit pool IDs:
```typescript
// REPLACE the existing POOL_FILTERS with:
const TRACKED_POOLS = {
  AAVE_V3_USDC: {
    poolId: "aa70268e-4b52-42bf-a116-608b370f9501",
    displayName: "Aave V3",
    symbol: "USDC",
    chain: "Ethereum",
  },
  AAVE_V3_USDT: {
    poolId: "LOOKUP_REQUIRED", // Get from API
    displayName: "Aave V3",
    symbol: "USDT",
    chain: "Ethereum",
  },
  COMPOUND_V3_USDC: {
    poolId: "7da72d09-56ca-4ec5-a45f-59114353e487",
    displayName: "Compound V3",
    symbol: "USDC",
    chain: "Ethereum",
  },
  MORPHO_USDC: {
    poolId: "a44febf3-34f6-4cd5-8ab1-f246ebe49f9e",
    displayName: "Morpho (Steakhouse)",
    symbol: "USDC",
    chain: "Ethereum",
  },
};

// UPDATE fetchTrackedPools() to filter by pool IDs instead of chain/project/symbol
export async function fetchTrackedPools(): Promise<DefiPool[]> {
  const allPools = await fetchAllPools();
  const poolIds = Object.values(TRACKED_POOLS).map(p => p.poolId);
  return allPools.filter(pool => poolIds.includes(pool.pool));
}
```

### 2. `types/index.ts` - Add Morpho Types
```typescript
// Add morphoUsdc to CurrentRates.defi interface
export interface CurrentRates {
  defi: {
    aaveUsdc: number;
    aaveUsdt: number;
    compoundUsdc: number;
    morphoUsdc: number; // ADD THIS
  };
  // ... rest unchanged
}

// Add morphoUsdcApy to SpreadDataPoint interface
export interface SpreadDataPoint {
  date: string;
  aaveUsdcApy: number;
  aaveUsdtApy: number;
  compoundUsdcApy: number;
  morphoUsdcApy: number; // ADD THIS
  fedFundsRate: number;
  tbillRate: number;
  spreadVsFed: number;
  spreadVsTbill: number;
}
```

### 3. `lib/utils.ts` - Data Normalization
Update `normalizeDataForChart()` to:
- Map pool IDs to data keys (not project/symbol)
- Handle Morpho data
- Import TRACKED_POOLS from defillama.ts

### 4. `app/api/spread/route.ts` - API Endpoint
Extract Morpho rates alongside existing protocols in the currentRates object.

### 5. UI Components (all similar pattern - add Morpho option):

**`app/page.tsx`**:
```typescript
export type DefiSelection = "aaveUsdc" | "aaveUsdt" | "compoundUsdc" | "morphoUsdc";
```

**`components/HeroSection.tsx`**:
```typescript
const DEFI_OPTIONS = [
  // ... existing options
  { value: "morphoUsdc", label: "USDC", protocol: "Morpho" },
];

// Add case in getDefiRate() switch
case "morphoUsdc": return rates.defi.morphoUsdc;
```

**`components/RatesTable.tsx`**:
```typescript
// Add to defiRows array:
{
  id: "morpho-usdc",
  asset: "USDC",
  protocol: "Morpho (Steakhouse)",
  apy: rates.defi.morphoUsdc,
  description: "Curated vault yield on Ethereum mainnet",
}
```

**`components/SpreadChart.tsx`**:
```typescript
const DATA_SERIES = [
  // ... existing series
  { key: "morphoUsdcApy", name: "Morpho USDC", color: "#10b981", type: "defi" },
];
```

**`components/UtilizationChart.tsx`**:
```typescript
const POOL_CONFIGS = [
  // ... existing configs
  { key: "morpho-blue-STEAKUSDC", name: "Morpho USDC", color: "#10b981" },
];
```

**`components/MetricsCards.tsx`**:
- Add `morphoUsdc` case to `getDefiKey()`, `getDefiLabel()`, `getCurrentDefiRate()`

---

## Implementation Order

1. **First**: Lookup Aave V3 USDT Ethereum pool ID from DefiLlama API
2. **Second**: Update `lib/defillama.ts` with pool IDs and new fetch logic
3. **Third**: Update `types/index.ts` with Morpho types
4. **Fourth**: Update `lib/utils.ts` normalization logic
5. **Fifth**: Update `app/api/spread/route.ts` API endpoint
6. **Sixth**: Update all 6 UI components (can be done in parallel)

---

## Verification Checklist

- [ ] Aave V3 USDT pool ID discovered and added
- [ ] Build passes: `npm run build`
- [ ] Type check passes: `npx tsc --noEmit`
- [ ] Aave USDC TVL shows ~$6B (not ~$936K)
- [ ] Morpho appears in:
  - [ ] Hero section dropdown
  - [ ] Rates table
  - [ ] Historical yields chart
  - [ ] TVL chart
- [ ] All existing functionality works (toggles, time ranges, spreads)

---

## Why This Approach

- **Hardcoded IDs > Filters**: Pool IDs are stable UUIDs, filters can match wrong pools
- **Morpho adds value**: #2 lending protocol ($7.7B TVL), institutional focus (Steakhouse, Gauntlet curators)
- **Minimal UI changes**: Just add Morpho to existing arrays, no structural changes
- **Ethereum-only**: Keeps scope manageable, Ethereum has deepest liquidity

## Research Sources
- [Allium Use Cases](https://www.allium.so/use-cases) - Enterprise data needs
- [DefiLlama Yields](https://defillama.com/yields) - Pool data source
- [Morpho Protocol](https://defillama.com/protocol/morpho) - $7.7B TVL, #2 lending
- [Aave Statistics 2025](https://coinlaw.io/aave-statistics/) - Market dominance data
