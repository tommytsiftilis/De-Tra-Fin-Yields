import { format, parseISO, subMonths } from "date-fns";
import { SpreadDataPoint, SpreadMetrics } from "@/types";
import { TRACKED_POOLS } from "@/lib/defillama";

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy");
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d");
}

export function formatMonthYear(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM ''yy");
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function calculateSpread(defiApy: number, riskFreeRate: number): number {
  return defiApy - riskFreeRate;
}

export function getBestDefiRate(dataPoint: SpreadDataPoint): number {
  return Math.max(
    dataPoint.aaveUsdcApy || 0,
    dataPoint.aaveUsdtApy || 0,
    dataPoint.compoundUsdcApy || 0,
    dataPoint.morphoUsdcApy || 0
  );
}

export function calculateMetrics(data: SpreadDataPoint[]): SpreadMetrics {
  if (data.length === 0) {
    return {
      currentSpread: 0,
      averageSpread: 0,
      maxSpread: { value: 0, date: "" },
      minSpread: { value: 0, date: "" },
    };
  }

  const spreads = data.map((d) => ({
    value: d.spreadVsFed,
    date: d.date,
  }));

  const currentSpread = spreads[spreads.length - 1]?.value || 0;
  const averageSpread =
    spreads.reduce((sum, s) => sum + s.value, 0) / spreads.length;

  let maxSpread = spreads[0];
  let minSpread = spreads[0];

  for (const spread of spreads) {
    if (spread.value > maxSpread.value) {
      maxSpread = spread;
    }
    if (spread.value < minSpread.value) {
      minSpread = spread;
    }
  }

  return {
    currentSpread,
    averageSpread,
    maxSpread,
    minSpread,
  };
}

export function getDateRange(monthsBack: number = 18): {
  startDate: string;
  endDate: string;
} {
  const endDate = new Date();
  const startDate = subMonths(endDate, monthsBack);

  return {
    startDate: format(startDate, "yyyy-MM-dd"),
    endDate: format(endDate, "yyyy-MM-dd"),
  };
}

// APY field keys in SpreadDataPoint
type ApyKey = "aaveUsdcApy" | "aaveUsdtApy" | "compoundUsdcApy" | "morphoUsdcApy";

// Map pool IDs to their data keys
function getDataKeyForPoolId(poolId: string): ApyKey | null {
  if (poolId === TRACKED_POOLS.AAVE_V3_USDC.poolId) return "aaveUsdcApy";
  if (poolId === TRACKED_POOLS.AAVE_V3_USDT.poolId) return "aaveUsdtApy";
  if (poolId === TRACKED_POOLS.COMPOUND_V3_USDC.poolId) return "compoundUsdcApy";
  if (poolId === TRACKED_POOLS.MORPHO_USDC.poolId) return "morphoUsdcApy";
  return null;
}

export function normalizeDataForChart(
  defiData: Array<{
    poolId: string;
    project: string;
    symbol: string;
    history: Array<{ timestamp: string; apy: number; tvlUsd: number }>;
  }>,
  fedFundsData: Array<{ date: string; value: string }>,
  tbillData: Array<{ date: string; value: string }>
): SpreadDataPoint[] {
  // Create a map of date -> data
  const dateMap = new Map<string, Partial<SpreadDataPoint>>();

  // Process DeFi data using pool ID mapping
  for (const pool of defiData) {
    const key = getDataKeyForPoolId(pool.poolId);
    if (!key) continue;

    for (const point of pool.history) {
      const date = point.timestamp.split("T")[0];
      if (!dateMap.has(date)) {
        dateMap.set(date, { date });
      }
      const existing = dateMap.get(date)!;
      existing[key] = point.apy;
    }
  }

  // Process Fed Funds data
  for (const obs of fedFundsData) {
    const date = obs.date;
    const value = parseFloat(obs.value);
    if (!isNaN(value)) {
      if (!dateMap.has(date)) {
        dateMap.set(date, { date });
      }
      dateMap.get(date)!.fedFundsRate = value;
    }
  }

  // Process T-Bill data
  for (const obs of tbillData) {
    const date = obs.date;
    const value = parseFloat(obs.value);
    if (!isNaN(value)) {
      if (!dateMap.has(date)) {
        dateMap.set(date, { date });
      }
      dateMap.get(date)!.tbillRate = value;
    }
  }

  // Convert to array and fill in missing values + calculate spreads
  const sortedDates = Array.from(dateMap.keys()).sort();
  const result: SpreadDataPoint[] = [];

  let lastKnown = {
    aaveUsdcApy: 0,
    aaveUsdtApy: 0,
    compoundUsdcApy: 0,
    morphoUsdcApy: 0,
    fedFundsRate: 0,
    tbillRate: 0,
  };

  for (const date of sortedDates) {
    const data = dateMap.get(date)!;

    // Carry forward missing values
    const point: SpreadDataPoint = {
      date,
      aaveUsdcApy: data.aaveUsdcApy ?? lastKnown.aaveUsdcApy,
      aaveUsdtApy: data.aaveUsdtApy ?? lastKnown.aaveUsdtApy,
      compoundUsdcApy: data.compoundUsdcApy ?? lastKnown.compoundUsdcApy,
      morphoUsdcApy: data.morphoUsdcApy ?? lastKnown.morphoUsdcApy,
      fedFundsRate: data.fedFundsRate ?? lastKnown.fedFundsRate,
      tbillRate: data.tbillRate ?? lastKnown.tbillRate,
      spreadVsFed: 0,
      spreadVsTbill: 0,
    };

    // Calculate spreads using best DeFi rate
    const bestDefiRate = getBestDefiRate(point);
    point.spreadVsFed = calculateSpread(bestDefiRate, point.fedFundsRate);
    point.spreadVsTbill = calculateSpread(bestDefiRate, point.tbillRate);

    // Update last known values
    lastKnown = {
      aaveUsdcApy: point.aaveUsdcApy,
      aaveUsdtApy: point.aaveUsdtApy,
      compoundUsdcApy: point.compoundUsdcApy,
      morphoUsdcApy: point.morphoUsdcApy,
      fedFundsRate: point.fedFundsRate,
      tbillRate: point.tbillRate,
    };

    result.push(point);
  }

  return result;
}
