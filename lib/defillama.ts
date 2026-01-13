import { DefiPool, ApyHistory } from "@/types";

const BASE_URL = "https://yields.llama.fi";

// Pool identifiers for tracking
const TRACKED_POOLS = {
  AAVE_V3_USDC: "", // TODO: Find pool ID from /pools endpoint
  AAVE_V3_USDT: "", // TODO: Find pool ID from /pools endpoint
  COMPOUND_V3_USDC: "", // TODO: Find pool ID from /pools endpoint
};

export async function fetchAllPools(): Promise<DefiPool[]> {
  // TODO: Implement
  throw new Error("Not implemented");
}

export async function fetchTrackedPools(): Promise<DefiPool[]> {
  // TODO: Implement - filter for Aave/Compound USDC/USDT on Ethereum
  throw new Error("Not implemented");
}

export async function fetchPoolHistory(poolId: string): Promise<ApyHistory> {
  // TODO: Implement
  throw new Error("Not implemented");
}

export { TRACKED_POOLS };
