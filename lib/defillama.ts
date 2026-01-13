import { DefiPool, ApyHistory } from "@/types";

const BASE_URL = "https://yields.llama.fi";

// Tracked pool configuration with explicit pool IDs
// Using hardcoded IDs ensures we always get the correct pool (filter matching can be ambiguous)
export const TRACKED_POOLS = {
  AAVE_V3_USDC: {
    poolId: "aa70268e-4b52-42bf-a116-608b370f9501",
    displayName: "Aave V3",
    symbol: "USDC",
    chain: "Ethereum",
  },
  AAVE_V3_USDT: {
    poolId: "f981a304-bb6c-45b8-b0c5-fd2f515ad23a",
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
    poolId: "b55f43a8-f444-4cd8-a3a4-0a4e786ba566",
    displayName: "Morpho (Steakhouse)",
    symbol: "STEAKUSDC",
    chain: "Ethereum",
  },
};

export async function fetchAllPools(): Promise<DefiPool[]> {
  const response = await fetch(`${BASE_URL}/pools`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`DefiLlama API error: ${response.status}`);
  }

  const json = await response.json();
  return json.data as DefiPool[];
}

export async function fetchTrackedPools(): Promise<DefiPool[]> {
  const allPools = await fetchAllPools();

  // Filter by explicit pool IDs for accuracy
  const poolIds = Object.values(TRACKED_POOLS).map((p) => p.poolId);
  const trackedPools = allPools.filter((pool) => poolIds.includes(pool.pool));

  return trackedPools;
}

export async function fetchPoolHistory(poolId: string): Promise<ApyHistory> {
  const response = await fetch(`${BASE_URL}/chart/${poolId}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`DefiLlama chart API error: ${response.status}`);
  }

  const json = await response.json();
  return {
    data: json.data || [],
  };
}

export async function fetchTrackedPoolsWithHistory(): Promise<{
  current: DefiPool[];
  historical: Map<string, ApyHistory>;
}> {
  const pools = await fetchTrackedPools();

  // Fetch historical data for each pool in parallel
  const historyPromises = pools.map(async (pool) => {
    const history = await fetchPoolHistory(pool.pool);
    return [pool.pool, history] as const;
  });

  const historyResults = await Promise.all(historyPromises);
  const historical = new Map(historyResults);

  return { current: pools, historical };
}

