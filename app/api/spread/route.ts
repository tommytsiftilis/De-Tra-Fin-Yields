import { NextResponse } from "next/server";
import {
  fetchTrackedPools,
  fetchPoolHistory,
} from "@/lib/defillama";
import { fetchAllRates } from "@/lib/fred";
import {
  getDateRange,
  normalizeDataForChart,
  calculateMetrics,
} from "@/lib/utils";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const { startDate, endDate } = getDateRange(18);

    // Fetch all data in parallel
    const [pools, tradfiRates] = await Promise.all([
      fetchTrackedPools(),
      fetchAllRates(startDate, endDate),
    ]);

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
          project: pool.project,
          symbol: pool.symbol,
          currentApy: pool.apy,
          tvlUsd: pool.tvlUsd,
          history: filteredHistory,
        };
      })
    );

    // Normalize data into time series
    const normalizedData = normalizeDataForChart(
      poolsWithHistory,
      tradfiRates.fedFunds.observations,
      tradfiRates.tbill.observations
    );

    // Calculate metrics
    const metrics = calculateMetrics(normalizedData);

    // Get current rates for quick reference
    const currentRates = {
      defi: {
        aaveUsdc:
          poolsWithHistory.find(
            (p) => p.project === "aave-v3" && p.symbol === "USDC"
          )?.currentApy || 0,
        aaveUsdt:
          poolsWithHistory.find(
            (p) => p.project === "aave-v3" && p.symbol === "USDT"
          )?.currentApy || 0,
        compoundUsdc:
          poolsWithHistory.find(
            (p) => p.project === "compound-v3" && p.symbol === "USDC"
          )?.currentApy || 0,
      },
      tradfi: {
        fedFunds:
          tradfiRates.fedFunds.observations.length > 0
            ? parseFloat(
                tradfiRates.fedFunds.observations[
                  tradfiRates.fedFunds.observations.length - 1
                ].value
              )
            : 0,
        tbill:
          tradfiRates.tbill.observations.length > 0
            ? parseFloat(
                tradfiRates.tbill.observations[
                  tradfiRates.tbill.observations.length - 1
                ].value
              )
            : 0,
      },
      lastUpdated: new Date().toISOString(),
    };

    // Get utilization data (TVL over time) for the chart
    const utilizationData = poolsWithHistory.map((pool) => ({
      poolId: pool.poolId,
      project: pool.project,
      symbol: pool.symbol,
      history: pool.history.map((h) => ({
        date: h.timestamp.split("T")[0],
        tvlUsd: h.tvlUsd,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: {
        timeSeries: normalizedData,
        metrics,
        currentRates,
        utilization: utilizationData,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching spread data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
