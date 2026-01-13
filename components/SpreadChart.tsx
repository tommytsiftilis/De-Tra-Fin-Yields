"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import { SpreadDataPoint } from "@/types";
import { formatShortDate, formatPercent } from "@/lib/utils";

interface SpreadChartProps {
  data?: SpreadDataPoint[];
  isLoading?: boolean;
}

type TimeRange = "3m" | "6m" | "1y" | "all";

const TIME_RANGES: { value: TimeRange; label: string; days: number }[] = [
  { value: "3m", label: "3M", days: 90 },
  { value: "6m", label: "6M", days: 180 },
  { value: "1y", label: "1Y", days: 365 },
  { value: "all", label: "All", days: Infinity },
];

const COLORS = {
  aaveUsdc: "#6366f1",
  aaveUsdt: "#8b5cf6",
  compoundUsdc: "#06b6d4",
  fedFunds: "#f59e0b",
  tbill: "#f97316",
};

export default function SpreadChart({ data, isLoading }: SpreadChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("6m");
  const [showSpreadArea, setShowSpreadArea] = useState(true);

  // Filter data by time range
  const filteredData = data
    ? (() => {
        const range = TIME_RANGES.find((r) => r.value === timeRange);
        if (!range || range.days === Infinity) return data;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - range.days);
        return data.filter((d) => new Date(d.date) >= cutoffDate);
      })()
    : [];

  // Sample data for performance
  const sampledData = filteredData.filter(
    (_, i) => i % 3 === 0 || i === filteredData.length - 1
  );

  // Calculate best DeFi rate for spread visualization
  const chartData = sampledData.map((d) => ({
    ...d,
    bestDefiRate: Math.max(d.aaveUsdcApy, d.aaveUsdtApy, d.compoundUsdcApy),
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Historical Yields
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              DeFi protocol yields vs Federal Reserve rates over time
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Spread toggle */}
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showSpreadArea}
                onChange={(e) => setShowSpreadArea(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-600">Show spread</span>
            </label>

            {/* Time range selector */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {TIME_RANGES.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    timeRange === range.value
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
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
        <div className="h-80">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-pulse text-gray-400">Loading chart...</div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="spreadGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
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
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  stroke="#d1d5db"
                  tickLine={false}
                  axisLine={false}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatPercent(value),
                    name,
                  ]}
                  labelFormatter={(label) => formatShortDate(label)}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ paddingBottom: "10px" }}
                />

                {/* Reference line at 0 */}
                <ReferenceLine y={0} stroke="#d1d5db" strokeDasharray="3 3" />

                {/* Spread area (best DeFi minus Fed Funds) */}
                {showSpreadArea && (
                  <Area
                    type="monotone"
                    dataKey="spreadVsFed"
                    name="Spread"
                    fill="url(#spreadGradient)"
                    stroke="#10b981"
                    strokeWidth={0}
                  />
                )}

                {/* DeFi lines */}
                <Line
                  type="monotone"
                  dataKey="aaveUsdcApy"
                  name="Aave USDC"
                  stroke={COLORS.aaveUsdc}
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="aaveUsdtApy"
                  name="Aave USDT"
                  stroke={COLORS.aaveUsdt}
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="compoundUsdcApy"
                  name="Compound USDC"
                  stroke={COLORS.compoundUsdc}
                  dot={false}
                  strokeWidth={2}
                />

                {/* TradFi lines (dashed) */}
                <Line
                  type="monotone"
                  dataKey="fedFundsRate"
                  name="Fed Funds"
                  stroke={COLORS.fedFunds}
                  dot={false}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="tbillRate"
                  name="3M T-Bill"
                  stroke={COLORS.tbill}
                  dot={false}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-indigo-500"></span>
            <span className="text-gray-600">DeFi yields (solid lines)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-amber-500" style={{ backgroundImage: "repeating-linear-gradient(90deg, #f59e0b 0px, #f59e0b 3px, transparent 3px, transparent 6px)" }}></span>
            <span className="text-gray-600">TradFi rates (dashed lines)</span>
          </span>
          {showSpreadArea && (
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-3 bg-emerald-500/30 rounded"></span>
              <span className="text-gray-600">Spread area (DeFi advantage)</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
