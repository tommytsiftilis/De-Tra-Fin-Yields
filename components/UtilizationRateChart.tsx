"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatShortDate } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface UtilizationData {
  poolId: string;
  displayName: string;
  symbol: string;
  history: Array<{
    date: string;
    utilization: number;
    totalSupplyUsd: number;
    totalBorrowUsd: number;
  }>;
}

interface UtilizationRateChartProps {
  data?: UtilizationData[];
  isLoading?: boolean;
}

interface PoolConfig {
  poolId: string;
  name: string;
  color: string;
  optimalUtilization: number; // The "kink" point where rates increase sharply
}

// Pool configurations with their optimal utilization rates
const POOL_CONFIGS: PoolConfig[] = [
  {
    poolId: "aa70268e-4b52-42bf-a116-608b370f9501",
    name: "Aave USDC",
    color: "#6366f1",
    optimalUtilization: 92, // Aave's optimal utilization for stablecoins
  },
  {
    poolId: "f981a304-bb6c-45b8-b0c5-fd2f515ad23a",
    name: "Aave USDT",
    color: "#8b5cf6",
    optimalUtilization: 92,
  },
  {
    poolId: "7da72d09-56ca-4ec5-a45f-59114353e487",
    name: "Compound USDC",
    color: "#06b6d4",
    optimalUtilization: 93, // Compound V3's kink
  },
];

type TimeRange = "1w" | "1m" | "3m" | "6m" | "1y" | "all";

const TIME_RANGES: { value: TimeRange; label: string; days: number }[] = [
  { value: "1w", label: "1W", days: 7 },
  { value: "1m", label: "1M", days: 30 },
  { value: "3m", label: "3M", days: 90 },
  { value: "6m", label: "6M", days: 180 },
  { value: "1y", label: "1Y", days: 365 },
  { value: "all", label: "All", days: Infinity },
];

function formatAxisDate(dateStr: string, timeRange: TimeRange): string {
  const d = parseISO(dateStr);
  if (timeRange === "1w" || timeRange === "1m" || timeRange === "3m") {
    return format(d, "MMM d");
  }
  return format(d, "MMM ''yy");
}

function formatTvl(value: number): string {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(0)}M`;
  }
  return `$${(value / 1e3).toFixed(0)}K`;
}

function ToggleButton({
  active,
  onClick,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
        active
          ? "bg-gray-900 text-white"
          : "bg-slate-700 text-slate-400 hover:bg-slate-600"
      }`}
    >
      <span
        className="w-2.5 h-2.5 rounded-sm"
        style={{ backgroundColor: active ? color : "#9ca3af" }}
      />
      {children}
    </button>
  );
}

export default function UtilizationRateChart({
  data,
  isLoading,
}: UtilizationRateChartProps) {
  const [visiblePools, setVisiblePools] = useState<Set<string>>(
    new Set(POOL_CONFIGS.map((p) => p.poolId))
  );
  const [timeRange, setTimeRange] = useState<TimeRange>("3m");

  const togglePool = (poolId: string) => {
    setVisiblePools((prev) => {
      const next = new Set(prev);
      if (next.has(poolId)) {
        next.delete(poolId);
      } else {
        next.add(poolId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setVisiblePools(new Set(POOL_CONFIGS.map((p) => p.poolId)));
  };

  const selectNone = () => {
    setVisiblePools(new Set());
  };

  // Merge all pool data into a single time series
  const mergedData = useMemo(() => {
    if (!data) return [];

    const dateMap = new Map<string, Record<string, number | string>>();

    for (const pool of data) {
      for (const point of pool.history) {
        if (!dateMap.has(point.date)) {
          dateMap.set(point.date, { date: point.date });
        }
        dateMap.get(point.date)![pool.poolId] = point.utilization;
        // Also store supply/borrow for tooltip
        dateMap.get(point.date)![`${pool.poolId}_supply`] = point.totalSupplyUsd;
        dateMap.get(point.date)![`${pool.poolId}_borrow`] = point.totalBorrowUsd;
      }
    }

    // Sort by date
    const sortedDates = Array.from(dateMap.keys()).sort();

    // Filter by time range
    let filteredDates = sortedDates;
    const range = TIME_RANGES.find((r) => r.value === timeRange);
    if (range && range.days !== Infinity) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - range.days);
      filteredDates = sortedDates.filter(
        (dateStr) => new Date(dateStr) >= cutoffDate
      );
    }

    // Sample for performance
    let sampleInterval = 1;
    if (filteredDates.length > 90) sampleInterval = 7;
    else if (filteredDates.length > 30) sampleInterval = 3;

    const sampledDates = filteredDates.filter(
      (_, i) => i % sampleInterval === 0 || i === filteredDates.length - 1
    );

    return sampledDates.map((date) => dateMap.get(date)!);
  }, [data, timeRange]);

  // Get current utilization for each pool
  const currentUtilization = useMemo(() => {
    if (!data) return {};
    const result: Record<string, number> = {};
    for (const pool of data) {
      const latest = pool.history[pool.history.length - 1];
      if (latest) {
        result[pool.poolId] = latest.utilization;
      }
    }
    return result;
  }, [data]);

  // Get available pools from data
  const availablePools = data
    ? POOL_CONFIGS.filter((config) =>
        data.some((d) => d.poolId === config.poolId)
      )
    : [];

  // Custom tooltip
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ dataKey: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (!active || !payload || !label) return null;

    const dataPoint = mergedData.find((d) => d.date === label);

    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-lg p-3 min-w-[220px]">
        <p className="text-xs font-medium text-slate-400 mb-2">
          {formatShortDate(label)}
        </p>
        <div className="space-y-2">
          {payload.map((entry) => {
            const poolConfig = POOL_CONFIGS.find((p) => p.poolId === entry.dataKey);
            if (!poolConfig || !visiblePools.has(entry.dataKey)) return null;

            const supply = dataPoint?.[`${entry.dataKey}_supply`] as number;
            const borrow = dataPoint?.[`${entry.dataKey}_borrow`] as number;
            const isAboveOptimal = entry.value > poolConfig.optimalUtilization;

            return (
              <div key={entry.dataKey} className="space-y-1">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-slate-300">{poolConfig.name}</span>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold ${
                      isAboveOptimal ? "text-amber-400" : "text-white"
                    }`}
                  >
                    {entry.value.toFixed(1)}%
                  </span>
                </div>
                {supply && borrow && (
                  <div className="pl-4 text-[10px] text-slate-500">
                    {formatTvl(borrow)} borrowed / {formatTvl(supply)} supplied
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Utilization Rates
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Borrowed / Supplied — explains why lending rates move
              </p>
            </div>
            <div className="flex items-center gap-4">
              {availablePools.map((pool) => {
                const util = currentUtilization[pool.poolId];
                const isAboveOptimal = util > pool.optimalUtilization;
                return (
                  <div key={pool.poolId} className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        isAboveOptimal ? "text-amber-400" : "text-white"
                      }`}
                    >
                      {util?.toFixed(1) || "--"}%
                    </p>
                    <p className="text-xs text-slate-400">{pool.name}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Pool toggles */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 mr-1">Show:</span>
              {availablePools.map((pool) => (
                <ToggleButton
                  key={pool.poolId}
                  active={visiblePools.has(pool.poolId)}
                  onClick={() => togglePool(pool.poolId)}
                  color={pool.color}
                >
                  {pool.name}
                </ToggleButton>
              ))}
              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-600">
                <button
                  onClick={selectAll}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={selectNone}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  None
                </button>
              </div>
            </div>

            {/* Time range selector */}
            <div className="flex rounded-lg border border-slate-600 overflow-hidden">
              {TIME_RANGES.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    timeRange === range.value
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="h-64">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-pulse text-slate-400">Loading chart...</div>
            </div>
          ) : mergedData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400">
              No data available
            </div>
          ) : visiblePools.size === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400">
              Select at least one pool to display
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={mergedData}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => formatAxisDate(date, timeRange)}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  stroke="#475569"
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  stroke="#475569"
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} />

                {/* Optimal utilization reference line (~92-93%) */}
                <ReferenceLine
                  y={92}
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  label={{
                    value: "Optimal ~92%",
                    position: "right",
                    fill: "#f59e0b",
                    fontSize: 10,
                  }}
                />

                {availablePools.map((pool) =>
                  visiblePools.has(pool.poolId) ? (
                    <Line
                      key={pool.poolId}
                      type="monotone"
                      dataKey={pool.poolId}
                      name={pool.name}
                      stroke={pool.color}
                      strokeWidth={2}
                      dot={false}
                    />
                  ) : null
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="px-4 py-3 bg-slate-800/60 border-t border-slate-700">
        <p className="text-xs text-slate-400">
          <span className="font-medium">Why utilization matters:</span> When utilization exceeds the optimal rate (~92%),
          interest rates increase sharply to incentivize more deposits. High utilization = higher yields but less liquidity.
        </p>
      </div>
    </div>
  );
}
