import { NextResponse } from "next/server";
import {
  fetchTrackedPools,
  fetchPoolHistory,
} from "@/lib/defillama";
import { getDateRange } from "@/lib/utils";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const pools = await fetchTrackedPools();
    const { startDate } = getDateRange(18);

    // Fetch historical data for each pool in parallel
    const poolsWithHistory = await Promise.all(
      pools.map(async (pool) => {
        const history = await fetchPoolHistory(pool.pool);

        // Filter history to only include data from the last 18 months
        const filteredHistory = history.data.filter((point) => {
          const pointDate = point.timestamp.split("T")[0];
          return pointDate >= startDate;
        });

        return {
          poolId: pool.pool,
          chain: pool.chain,
          project: pool.project,
          symbol: pool.symbol,
          currentApy: pool.apy,
          currentApyBase: pool.apyBase,
          tvlUsd: pool.tvlUsd,
          history: filteredHistory,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: poolsWithHistory,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching DeFi yields:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
