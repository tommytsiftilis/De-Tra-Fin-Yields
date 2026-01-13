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
} from "recharts";
import { formatShortDate } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface UtilizationData {
  poolId: string;
  project: string;
  symbol: string;
  history: Array<{ date: string; tvlUsd: number }>;
}

interface UtilizationChartProps {
  data?: UtilizationData[];
  isLoading?: boolean;
}

interface PoolConfig {
  key: string;
  name: string;
  color: string;
}

const POOL_CONFIGS: PoolConfig[] = [
  { key: "aave-v3-USDC", name: "Aave USDC", color: "#6366f1" },
  { key: "aave-v3-USDT", name: "Aave USDT", color: "#8b5cf6" },
  { key: "compound-v3-USDC", name: "Compound USDC", color: "#06b6d4" },
  { key: "morpho-v1-STEAKUSDC", name: "Morpho USDC", color: "#10b981" },
];

type TimeRange = "1w" | "1m" | "3m" | "6m" | "1y" | "all" | "custom";

const TIME_RANGES: { value: TimeRange; label: string; days: number }[] = [
  { value: "1w", label: "1W", days: 7 },
  { value: "1m", label: "1M", days: 30 },
  { value: "3m", label: "3M", days: 90 },
  { value: "6m", label: "6M", days: 180 },
  { value: "1y", label: "1Y", days: 365 },
  { value: "all", label: "All", days: Infinity },
];

// Format date for axis based on time range
function formatAxisDate(dateStr: string, timeRange: TimeRange): string {
  const d = parseISO(dateStr);
  if (timeRange === "1w" || timeRange === "1m" || timeRange === "3m" || timeRange === "custom") {
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

export default function TvlChart({
  data,
  isLoading,
}: UtilizationChartProps) {
  const [visiblePools, setVisiblePools] = useState<Set<string>>(
    new Set(POOL_CONFIGS.map((p) => p.key))
  );
  const [timeRange, setTimeRange] = useState<TimeRange>("3m");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const togglePool = (key: string) => {
    setVisiblePools((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const selectAll = () => {
    setVisiblePools(new Set(POOL_CONFIGS.map((p) => p.key)));
  };

  const selectNone = () => {
    setVisiblePools(new Set());
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    if (range !== "custom") {
      setShowDatePicker(false);
    }
  };

  const applyCustomDateRange = () => {
    if (customStartDate && customEndDate) {
      setTimeRange("custom");
      setShowDatePicker(false);
    }
  };

  // Merge all pool data into a single time series and filter by time range
  const mergedData = useMemo(() => {
    if (!data) return [];

    const dateMap = new Map<string, Record<string, number | string>>();

    for (const pool of data) {
      const key = `${pool.project}-${pool.symbol}`;
      for (const point of pool.history) {
        if (!dateMap.has(point.date)) {
          dateMap.set(point.date, { date: point.date });
        }
        dateMap.get(point.date)![key] = point.tvlUsd;
      }
    }

    // Sort by date
    const sortedDates = Array.from(dateMap.keys()).sort();

    // Filter by time range
    let filteredDates = sortedDates;
    if (timeRange === "custom" && customStartDate && customEndDate) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      filteredDates = sortedDates.filter((dateStr) => {
        const date = new Date(dateStr);
        return date >= startDate && date <= endDate;
      });
    } else {
      const range = TIME_RANGES.find((r) => r.value === timeRange);
      if (range && range.days !== Infinity) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - range.days);
        filteredDates = sortedDates.filter((dateStr) => new Date(dateStr) >= cutoffDate);
      }
    }

    // Sample for performance (show every Nth day based on range)
    let sampleInterval = 1;
    if (filteredDates.length > 90) sampleInterval = 7;
    else if (filteredDates.length > 30) sampleInterval = 3;

    const sampledDates = filteredDates.filter(
      (_, i) => i % sampleInterval === 0 || i === filteredDates.length - 1
    );

    return sampledDates.map((date) => dateMap.get(date)!);
  }, [data, timeRange, customStartDate, customEndDate]);

  // Calculate total TVL for visible pools only (from latest data point)
  const latestData = mergedData[mergedData.length - 1];
  const totalTvl = latestData
    ? Object.entries(latestData)
        .filter(([key]) => key !== "date" && visiblePools.has(key))
        .reduce((sum, [, value]) => sum + (typeof value === "number" ? value : 0), 0)
    : 0;

  // Get available pools from data
  const availablePools = data
    ? POOL_CONFIGS.filter((config) =>
        data.some((d) => `${d.project}-${d.symbol}` === config.key)
      )
    : [];

  return (
    <div className="bg-slate-800/70 rounded-xl border border-slate-600/50 ring-1 ring-slate-700/30 overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="border-l-4 border-cyan-500 pl-3">
              <h2 className="text-xl font-semibold tracking-tight text-white">
                DeFi Total Value Locked
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Capital deposited in tracked lending pools
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{formatTvl(totalTvl)}</p>
                <p className="text-xs text-slate-400">Selected pools TVL</p>
              </div>
            </div>
          </div>

          {/* Controls row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Pool toggles */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 mr-1">Show:</span>
              {availablePools.map((pool) => (
                <ToggleButton
                  key={pool.key}
                  active={visiblePools.has(pool.key)}
                  onClick={() => togglePool(pool.key)}
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
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-slate-600 overflow-hidden">
                {TIME_RANGES.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => handleTimeRangeChange(range.value)}
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
              {/* Custom date range button */}
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                    timeRange === "custom"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                {showDatePicker && (
                  <div className="absolute right-0 top-full mt-2 bg-slate-800 rounded-lg shadow-lg border border-slate-600 p-4 z-10 min-w-[280px]">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">End Date</label>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <button
                        onClick={applyCustomDateRange}
                        disabled={!customStartDate || !customEndDate}
                        className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Apply Range
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                  tickFormatter={formatTvl}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  stroke="#475569"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: number) => [formatTvl(value)]}
                  labelFormatter={(label) => formatShortDate(label)}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend verticalAlign="top" height={36} />

                {availablePools.map((pool) =>
                  visiblePools.has(pool.key) ? (
                    <Line
                      key={pool.key}
                      type="monotone"
                      dataKey={pool.key}
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

      <div className="px-4 py-3 bg-slate-700/40 border-t border-slate-700">
        <p className="text-xs text-slate-400">
          <span className="font-medium">Why TVL matters:</span> Higher TVL generally indicates more trust in a protocol.
          TVL changes can also affect yields - more deposits typically lower rates as supply increases.
        </p>
      </div>
    </div>
  );
}
