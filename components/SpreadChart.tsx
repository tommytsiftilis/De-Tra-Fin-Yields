"use client";

import { useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceLine,
  Line,
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

interface DataSeries {
  key: string;
  name: string;
  color: string;
  type: "defi" | "tradfi";
  dashed?: boolean;
}

const DATA_SERIES: DataSeries[] = [
  { key: "aaveUsdcApy", name: "Aave USDC", color: "#6366f1", type: "defi" },
  { key: "aaveUsdtApy", name: "Aave USDT", color: "#8b5cf6", type: "defi" },
  { key: "compoundUsdcApy", name: "Compound USDC", color: "#06b6d4", type: "defi" },
  { key: "fedFundsRate", name: "Fed Funds", color: "#f59e0b", type: "tradfi", dashed: true },
  { key: "tbillRate", name: "3M T-Bill", color: "#f97316", type: "tradfi", dashed: true },
];

function ToggleButton({
  active,
  onClick,
  color,
  children,
  dashed,
}: {
  active: boolean;
  onClick: () => void;
  color: string;
  children: React.ReactNode;
  dashed?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
        active
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      <span
        className={`w-3 h-0.5 rounded-full ${dashed ? "" : ""}`}
        style={{
          backgroundColor: active ? color : "#9ca3af",
          backgroundImage: dashed
            ? `repeating-linear-gradient(90deg, ${active ? color : "#9ca3af"} 0px, ${active ? color : "#9ca3af"} 2px, transparent 2px, transparent 4px)`
            : undefined,
        }}
      />
      {children}
    </button>
  );
}

export default function SpreadChart({ data, isLoading }: SpreadChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("6m");
  const [showSpreadArea, setShowSpreadArea] = useState(true);
  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(
    new Set(DATA_SERIES.map((s) => s.key))
  );

  const toggleSeries = (key: string) => {
    setVisibleSeries((prev) => {
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
    setVisibleSeries(new Set(DATA_SERIES.map((s) => s.key)));
  };

  const selectNone = () => {
    setVisibleSeries(new Set());
  };

  const selectDefi = () => {
    setVisibleSeries(new Set(DATA_SERIES.filter((s) => s.type === "defi").map((s) => s.key)));
  };

  const selectTradfi = () => {
    setVisibleSeries(new Set(DATA_SERIES.filter((s) => s.type === "tradfi").map((s) => s.key)));
  };

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
        <div className="flex flex-col gap-4">
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
                <span className="text-gray-600">Spread area</span>
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

          {/* Series toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 mr-1">Show:</span>
            {DATA_SERIES.map((series) => (
              <ToggleButton
                key={series.key}
                active={visibleSeries.has(series.key)}
                onClick={() => toggleSeries(series.key)}
                color={series.color}
                dashed={series.dashed}
              >
                {series.name}
              </ToggleButton>
            ))}
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-200">
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
              <span className="text-gray-300">|</span>
              <button
                onClick={selectDefi}
                className="text-xs text-indigo-600 hover:underline"
              >
                DeFi
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={selectTradfi}
                className="text-xs text-indigo-600 hover:underline"
              >
                TradFi
              </button>
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

                {/* Dynamic lines based on visibility */}
                {DATA_SERIES.map((series) =>
                  visibleSeries.has(series.key) ? (
                    <Line
                      key={series.key}
                      type="monotone"
                      dataKey={series.key}
                      name={series.name}
                      stroke={series.color}
                      dot={false}
                      strokeWidth={2}
                      strokeDasharray={series.dashed ? "5 5" : undefined}
                    />
                  ) : null
                )}
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
            <span
              className="w-4 h-0.5"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, #f59e0b 0px, #f59e0b 3px, transparent 3px, transparent 6px)",
              }}
            ></span>
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
