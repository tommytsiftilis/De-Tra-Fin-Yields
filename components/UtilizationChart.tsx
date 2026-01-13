"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatShortDate } from "@/lib/utils";

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

const COLORS: Record<string, string> = {
  "aave-v3-USDC": "#6366f1",
  "aave-v3-USDT": "#8b5cf6",
  "compound-v3-USDC": "#06b6d4",
};

function formatTvl(value: number): string {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(0)}M`;
  }
  return `$${(value / 1e3).toFixed(0)}K`;
}

export default function UtilizationChart({
  data,
  isLoading,
}: UtilizationChartProps) {
  // Merge all pool data into a single time series
  const mergedData: Array<Record<string, number | string>> = [];

  if (data) {
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

    // Sort by date and sample for performance
    const sortedDates = Array.from(dateMap.keys()).sort();
    const sampledDates = sortedDates.filter(
      (_, i) => i % 7 === 0 || i === sortedDates.length - 1
    );

    for (const date of sampledDates) {
      mergedData.push(dateMap.get(date)!);
    }
  }

  // Calculate total TVL for the latest date
  const latestData = mergedData[mergedData.length - 1];
  const totalTvl = latestData
    ? Object.entries(latestData)
        .filter(([key]) => key !== "date")
        .reduce((sum, [, value]) => sum + (typeof value === "number" ? value : 0), 0)
    : 0;

  const pools = data || [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              DeFi Total Value Locked
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Capital deposited in tracked lending pools
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{formatTvl(totalTvl)}</p>
            <p className="text-xs text-gray-500">Current Total TVL</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="h-64">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-pulse text-gray-400">Loading chart...</div>
            </div>
          ) : mergedData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={mergedData}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <defs>
                  {pools.map((pool) => {
                    const key = `${pool.project}-${pool.symbol}`;
                    const color = COLORS[key] || "#9ca3af";
                    return (
                      <linearGradient
                        key={key}
                        id={`gradient-${key}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                      </linearGradient>
                    );
                  })}
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => formatShortDate(date)}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  stroke="#d1d5db"
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatTvl}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  stroke="#d1d5db"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: number) => [formatTvl(value)]}
                  labelFormatter={(label) => formatShortDate(label)}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend verticalAlign="top" height={36} />

                {pools.map((pool) => {
                  const key = `${pool.project}-${pool.symbol}`;
                  const color = COLORS[key] || "#9ca3af";
                  const name = `${pool.project === "aave-v3" ? "Aave" : "Compound"} ${pool.symbol}`;
                  return (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={name}
                      stroke={color}
                      fill={`url(#gradient-${key})`}
                      strokeWidth={2}
                      stackId="1"
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <span className="font-medium">Why TVL matters:</span> Higher TVL generally indicates more trust in a protocol.
          TVL changes can also affect yields - more deposits typically lower rates as supply increases.
        </p>
      </div>
    </div>
  );
}
