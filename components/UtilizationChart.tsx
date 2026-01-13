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

const COLORS = {
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

  const pools = data || [];

  return (
    <div className="border rounded-lg p-4 bg-white">
      <h2 className="text-xl font-semibold mb-4">DeFi Total Value Locked</h2>
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
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => formatShortDate(date)}
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis
                tickFormatter={formatTvl}
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <Tooltip
                formatter={(value: number) => [formatTvl(value)]}
                labelFormatter={(label) => formatShortDate(label)}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              {pools.map((pool) => {
                const key = `${pool.project}-${pool.symbol}`;
                const color =
                  COLORS[key as keyof typeof COLORS] || "#9ca3af";
                const name = `${pool.project === "aave-v3" ? "Aave" : "Compound"} ${pool.symbol}`;
                return (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={name}
                    stroke={color}
                    fill={color}
                    fillOpacity={0.3}
                    stackId="1"
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
