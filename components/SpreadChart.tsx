"use client";

import { useState, useMemo } from "react";
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
  TooltipProps,
} from "recharts";
import { SpreadDataPoint } from "@/types";
import { DefiSelection, TradfiSelection } from "@/app/page";
import { formatPercent } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface SpreadChartProps {
  data?: SpreadDataPoint[];
  isLoading?: boolean;
  selectedDefi: DefiSelection;
  selectedTradfi: TradfiSelection;
}

type TimeRange = "1w" | "1m" | "3m" | "6m" | "1y" | "all" | "custom";

const TIME_RANGES: { value: TimeRange; label: string; days: number; tickInterval: number }[] = [
  { value: "1w", label: "1W", days: 7, tickInterval: 1 },       // Daily
  { value: "1m", label: "1M", days: 30, tickInterval: 5 },      // Every 5 days
  { value: "3m", label: "3M", days: 90, tickInterval: 14 },     // Every 2 weeks
  { value: "6m", label: "6M", days: 180, tickInterval: 30 },    // Monthly
  { value: "1y", label: "1Y", days: 365, tickInterval: 60 },    // Every 2 months
  { value: "all", label: "All", days: Infinity, tickInterval: 90 }, // Quarterly
];

// Format date for axis based on time range
function formatAxisDate(dateStr: string, timeRange: TimeRange): string {
  const d = parseISO(dateStr);
  if (timeRange === "1w" || timeRange === "1m" || timeRange === "3m" || timeRange === "custom") {
    return format(d, "MMM d");
  }
  return format(d, "MMM ''yy");
}

// Format date for tooltip
function formatTooltipDate(dateStr: string): string {
  const d = parseISO(dateStr);
  return format(d, "MMM d, yyyy");
}

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
          : "bg-slate-300 text-slate-500 hover:bg-gray-200"
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

// Custom tooltip that shows spread when comparing two items
function CustomTooltip({
  active,
  payload,
  label,
  visibleSeries,
}: TooltipProps<number, string> & {
  visibleSeries: Set<string>;
}) {
  if (!active || !payload || payload.length === 0) return null;

  // Get visible rate values
  const rateValues: { name: string; value: number; color: string; type: "defi" | "tradfi" }[] = [];

  for (const entry of payload) {
    const series = DATA_SERIES.find((s) => s.key === entry.dataKey);
    if (series && visibleSeries.has(series.key) && entry.value !== undefined) {
      rateValues.push({
        name: series.name,
        value: entry.value,
        color: series.color,
        type: series.type,
      });
    }
  }

  // Calculate spread if exactly one DeFi and one TradFi are selected
  const defiRates = rateValues.filter((r) => r.type === "defi");
  const tradfiRates = rateValues.filter((r) => r.type === "tradfi");

  let spreadInfo: { spread: number; defiName: string; tradfiName: string } | null = null;
  if (defiRates.length === 1 && tradfiRates.length === 1) {
    spreadInfo = {
      spread: defiRates[0].value - tradfiRates[0].value,
      defiName: defiRates[0].name,
      tradfiName: tradfiRates[0].name,
    };
  }

  return (
    <div className="bg-slate-50 border border-slate-300 rounded-lg shadow-lg p-3 min-w-[200px]">
      <p className="text-xs font-medium text-slate-500 mb-2">
        {formatTooltipDate(label as string)}
      </p>

      {/* Rate values */}
      {rateValues.length > 0 && (
        <div className="space-y-1 mb-2">
          {rateValues.map((rate) => (
            <div key={rate.name} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: rate.color }}
                />
                <span className="text-xs text-slate-600">{rate.name}</span>
              </div>
              <span className="text-xs font-mono font-medium text-slate-800">
                {formatPercent(rate.value)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Auto-calculated spread for 1:1 comparison */}
      {spreadInfo && (
        <div className="border-t border-gray-100 pt-2 mt-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-slate-500">Spread</span>
            <span
              className={`text-xs font-mono font-bold ${
                spreadInfo.spread >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {spreadInfo.spread >= 0 ? "+" : ""}
              {formatPercent(spreadInfo.spread)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {spreadInfo.defiName} − {spreadInfo.tradfiName}
          </p>
        </div>
      )}
    </div>
  );
}

export default function SpreadChart({
  data,
  isLoading,
  selectedDefi,
  selectedTradfi,
}: SpreadChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("3m");
  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(
    new Set(DATA_SERIES.map((s) => s.key))
  );
  const [showSpreadArea, setShowSpreadArea] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const selectAllSeries = () => {
    setVisibleSeries(new Set(DATA_SERIES.map((s) => s.key)));
  };

  const selectNoneSeries = () => {
    setVisibleSeries(new Set());
  };

  const selectDefi = () => {
    setVisibleSeries(new Set(DATA_SERIES.filter((s) => s.type === "defi").map((s) => s.key)));
  };

  const selectTradfi = () => {
    setVisibleSeries(new Set(DATA_SERIES.filter((s) => s.type === "tradfi").map((s) => s.key)));
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

  // Filter data by time range and compute spreads
  const chartData = useMemo(() => {
    if (!data) return [];

    let filtered = data;

    if (timeRange === "custom" && customStartDate && customEndDate) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      filtered = data.filter((d) => {
        const date = new Date(d.date);
        return date >= startDate && date <= endDate;
      });
    } else {
      const range = TIME_RANGES.find((r) => r.value === timeRange);
      if (range && range.days !== Infinity) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - range.days);
        filtered = data.filter((d) => new Date(d.date) >= cutoffDate);
      }
    }

    // No sampling - show daily granularity
    // Add computed spreads for spread area feature
    return filtered.map((d) => {
      return {
        ...d,
        // For spread area (based on selected comparison)
        selectedSpread:
          (d[`${selectedDefi === "aaveUsdc" ? "aaveUsdcApy" : selectedDefi === "aaveUsdt" ? "aaveUsdtApy" : "compoundUsdcApy"}`] as number) -
          (d[selectedTradfi === "fedFunds" ? "fedFundsRate" : "tbillRate"] as number),
      };
    });
  }, [data, timeRange, customStartDate, customEndDate, selectedDefi, selectedTradfi]);

  // Get tick interval for current time range
  const currentRange = TIME_RANGES.find((r) => r.value === timeRange);
  // For custom range, calculate based on number of days
  const tickInterval = useMemo(() => {
    if (timeRange === "custom" && customStartDate && customEndDate) {
      const days = Math.ceil((new Date(customEndDate).getTime() - new Date(customStartDate).getTime()) / (1000 * 60 * 60 * 24));
      if (days <= 7) return 1;
      if (days <= 30) return 5;
      if (days <= 90) return 14;
      if (days <= 180) return 30;
      return 60;
    }
    return currentRange?.tickInterval || 30;
  }, [timeRange, customStartDate, customEndDate, currentRange]);

  // Generate tick values - show only certain dates
  const ticks = useMemo(() => {
    if (chartData.length === 0) return [];
    const result: string[] = [];
    for (let i = 0; i < chartData.length; i += tickInterval) {
      result.push(chartData[i].date);
    }
    // Always include the last date
    const lastDate = chartData[chartData.length - 1]?.date;
    if (lastDate && !result.includes(lastDate)) {
      result.push(lastDate);
    }
    return result;
  }, [chartData, tickInterval]);

  return (
    <div className="bg-slate-100 rounded-xl border border-slate-300 overflow-hidden">
      <div className="p-4 border-b border-slate-300">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Historical Yields
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                DeFi protocol yields vs. traditional finance rates over time
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Spread area toggle */}
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSpreadArea}
                  onChange={(e) => setShowSpreadArea(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-600">Spread area</span>
              </label>

              {/* Time range selector */}
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-slate-300 overflow-hidden">
                  {TIME_RANGES.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => handleTimeRangeChange(range.value)}
                      className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                        timeRange === range.value
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-200"
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
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                      timeRange === "custom"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  {showDatePicker && (
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-slate-200 p-4 z-10 min-w-[280px]">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
                          <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

          {/* Rates toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 mr-1">Rates:</span>
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
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-300">
              <button
                onClick={selectAllSeries}
                className="text-xs text-indigo-600 hover:underline"
              >
                All
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={selectNoneSeries}
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
              <div className="animate-pulse text-slate-400">Loading chart...</div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400">
              No data available
            </div>
          ) : visibleSeries.size === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400">
              Select at least one rate to display
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
                  ticks={ticks}
                  tickFormatter={(date) => formatAxisDate(date, timeRange)}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  stroke="#d1d5db"
                  tickLine={false}
                  interval="preserveStartEnd"
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
                  content={
                    <CustomTooltip
                      visibleSeries={visibleSeries}
                    />
                  }
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ paddingBottom: "10px" }}
                />

                {/* Reference line at 0 */}
                <ReferenceLine y={0} stroke="#d1d5db" strokeDasharray="3 3" />

                {/* Spread area based on selected comparison */}
                {showSpreadArea && (
                  <Area
                    type="monotone"
                    dataKey="selectedSpread"
                    name="Selected Spread"
                    fill="url(#spreadGradient)"
                    stroke="#10b981"
                    strokeWidth={0}
                  />
                )}

                {/* Rate lines */}
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

      <div className="px-4 py-3 bg-slate-200 border-t border-slate-300">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-indigo-500"></span>
            <span className="text-slate-600">DeFi yields (solid lines)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-4 h-0.5"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, #f59e0b 0px, #f59e0b 3px, transparent 3px, transparent 6px)",
              }}
            ></span>
            <span className="text-slate-600">TradFi rates (dashed lines)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-3 bg-emerald-500/30 rounded"></span>
            <span className="text-slate-600">Spread areas</span>
          </span>
          <span className="text-slate-400 ml-auto">
            Tip: Select 1 DeFi + 1 TradFi to see spread in tooltip
          </span>
        </div>
      </div>
    </div>
  );
}
