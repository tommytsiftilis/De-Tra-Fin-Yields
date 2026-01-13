import { DefiPool, ApyHistory } from "@/types";

const BASE_URL = "https://yields.llama.fi";

// Pool identifiers for tracking - these are discovered from the /pools endpoint
// Format: {chain}-{project}-{symbol}
const POOL_FILTERS = {
  AAVE_V3_USDC: { chain: "Ethereum", project: "aave-v3", symbol: "USDC" },
  AAVE_V3_USDT: { chain: "Ethereum", project: "aave-v3", symbol: "USDT" },
  COMPOUND_V3_USDC: { chain: "Ethereum", project: "compound-v3", symbol: "USDC" },
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

  // Filter for our tracked pools
  const trackedPools = allPools.filter((pool) => {
    return Object.values(POOL_FILTERS).some(
      (filter) =>
        pool.chain === filter.chain &&
        pool.project === filter.project &&
        pool.symbol === filter.symbol
    );
  });

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

export { POOL_FILTERS };
