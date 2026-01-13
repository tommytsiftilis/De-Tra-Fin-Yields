"use client";

import { useMemo } from "react";
import { formatPercent, formatDate } from "@/lib/utils";
import { SpreadMetrics, SpreadDataPoint, CurrentRates } from "@/types";
import { DefiSelection, TradfiSelection } from "@/app/page";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface MetricsCardsProps {
  metrics?: SpreadMetrics;
  timeSeries?: SpreadDataPoint[];
  currentRates?: CurrentRates;
  isLoading?: boolean;
  selectedDefi: DefiSelection;
  selectedTradfi: TradfiSelection;
}

// Map selection to data key
function getDefiKey(selection: DefiSelection): keyof SpreadDataPoint {
  switch (selection) {
    case "aaveUsdc":
      return "aaveUsdcApy";
    case "aaveUsdt":
      return "aaveUsdtApy";
    case "compoundUsdc":
      return "compoundUsdcApy";
    case "morphoUsdc":
      return "morphoUsdcApy";
  }
}

function getTradfiKey(selection: TradfiSelection): keyof SpreadDataPoint {
  switch (selection) {
    case "fedFunds":
      return "fedFundsRate";
    case "tbill":
      return "tbillRate";
  }
}

function getDefiLabel(selection: DefiSelection): string {
  switch (selection) {
    case "aaveUsdc":
      return "Aave USDC";
    case "aaveUsdt":
      return "Aave USDT";
    case "compoundUsdc":
      return "Compound USDC";
    case "morphoUsdc":
      return "Morpho USDC";
  }
}

function getTradfiLabel(selection: TradfiSelection): string {
  switch (selection) {
    case "fedFunds":
      return "Fed Funds";
    case "tbill":
      return "3M T-Bill";
  }
}

// Get current rate from CurrentRates based on selection
function getCurrentDefiRate(rates: CurrentRates, selection: DefiSelection): number {
  switch (selection) {
    case "aaveUsdc":
      return rates.defi.aaveUsdc;
    case "aaveUsdt":
      return rates.defi.aaveUsdt;
    case "compoundUsdc":
      return rates.defi.compoundUsdc;
    case "morphoUsdc":
      return rates.defi.morphoUsdc;
  }
}

function getCurrentTradfiRate(rates: CurrentRates, selection: TradfiSelection): number {
  switch (selection) {
    case "fedFunds":
      return rates.tradfi.fedFunds;
    case "tbill":
      return rates.tradfi.tbill;
  }
}

// Compute metrics for the selected pair
function computeSelectedMetrics(
  timeSeries: SpreadDataPoint[],
  defiKey: keyof SpreadDataPoint,
  tradfiKey: keyof SpreadDataPoint
) {
  if (!timeSeries || timeSeries.length === 0) {
    return null;
  }

  // Add computed spread to each point
  const dataWithSpread = timeSeries.map((point) => ({
    ...point,
    computedSpread: (point[defiKey] as number) - (point[tradfiKey] as number),
  }));

  const spreads = dataWithSpread.map((d) => d.computedSpread);
  const currentSpread = spreads[spreads.length - 1];
  const averageSpread = spreads.reduce((a, b) => a + b, 0) / spreads.length;

  let maxSpread = { value: spreads[0], date: dataWithSpread[0].date };
  let minSpread = { value: spreads[0], date: dataWithSpread[0].date };

  for (let i = 0; i < spreads.length; i++) {
    if (spreads[i] > maxSpread.value) {
      maxSpread = { value: spreads[i], date: dataWithSpread[i].date };
    }
    if (spreads[i] < minSpread.value) {
      minSpread = { value: spreads[i], date: dataWithSpread[i].date };
    }
  }

  return {
    currentSpread,
    averageSpread,
    maxSpread,
    minSpread,
    dataWithSpread,
  };
}

function Sparkline({
  data,
  dataKey,
  color,
  referenceValue,
}: {
  data: Array<Record<string, unknown>>;
  dataKey: string;
  color: string;
  referenceValue?: number;
}) {
  // Sample last 30 days for sparkline
  const recentData = data.slice(-30);

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={recentData}>
        {referenceValue !== undefined && (
          <ReferenceLine y={referenceValue} stroke="#d1d5db" strokeDasharray="2 2" />
        )}
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  description,
  isLoading,
  isPositive,
  sparklineData,
  sparklineKey,
  sparklineColor,
  icon,
  isPrimary,
}: {
  title: string;
  value: string;
  subtitle?: string;
  description?: string;
  isLoading?: boolean;
  isPositive?: boolean;
  sparklineData?: Array<Record<string, unknown>>;
  sparklineKey?: string;
  sparklineColor?: string;
  icon?: React.ReactNode;
  isPrimary?: boolean;
}) {
  return (
    <div
      className={`relative rounded-xl p-5 transition-all duration-200 ${
        isPrimary
          ? "bg-gradient-to-br from-slate-800 to-slate-800/80 border-2 shadow-lg hover:shadow-xl"
          : "bg-slate-800/60 border border-slate-600/40 hover:bg-slate-700/50 hover:border-slate-500/50"
      } ${
        isPrimary && isPositive !== undefined
          ? isPositive
            ? "border-emerald-500/50 shadow-emerald-500/10"
            : "border-red-500/50 shadow-red-500/10"
          : ""
      }`}
    >
      {/* Subtle glow for primary card */}
      {isPrimary && (
        <div
          className={`absolute inset-0 rounded-xl blur-xl opacity-10 ${
            isPositive ? "bg-emerald-500" : "bg-red-500"
          }`}
        ></div>
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <p className={`font-bold ${isPrimary ? "text-base text-white" : "text-sm text-slate-300"}`}>
            {title}
          </p>
          {icon}
        </div>

        {isLoading ? (
          <div className={`${isPrimary ? "h-10 w-28" : "h-8 w-24"} bg-slate-700 animate-pulse rounded`} />
        ) : (
          <p
            className={`font-extrabold tabular-nums ${
              isPrimary ? "text-3xl" : "text-2xl"
            } ${
              isPositive === undefined
                ? "text-white"
                : isPositive
                  ? "text-emerald-400"
                  : "text-red-400"
            }`}
            style={isPrimary && isPositive !== undefined ? {
              textShadow: isPositive
                ? '0 0 20px rgba(52, 211, 153, 0.3)'
                : '0 0 20px rgba(248, 113, 113, 0.3)'
            } : undefined}
          >
            {value}
          </p>
        )}

        {subtitle && (
          <p className={`mt-1.5 ${isPrimary ? "text-sm font-medium" : "text-xs"} ${
            subtitle.startsWith("+") ? "text-emerald-400" : subtitle.startsWith("-") ? "text-red-400" : "text-slate-400"
          }`}>
            {subtitle}
          </p>
        )}

        {sparklineData && sparklineKey && sparklineColor && !isLoading && (
          <div className="mt-3 -mx-2">
            <Sparkline
              data={sparklineData}
              dataKey={sparklineKey}
              color={sparklineColor}
              referenceValue={0}
            />
          </div>
        )}

        {description && (
          <p className={`text-slate-500 mt-3 pt-3 border-t border-slate-700/50 ${isPrimary ? "text-xs" : "text-xs"}`}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function MetricsCards({
  metrics,
  timeSeries,
  currentRates,
  isLoading,
  selectedDefi,
  selectedTradfi,
}: MetricsCardsProps) {
  // Compute metrics based on selection
  const defiKey = getDefiKey(selectedDefi);
  const tradfiKey = getTradfiKey(selectedTradfi);
  const defiLabel = getDefiLabel(selectedDefi);
  const tradfiLabel = getTradfiLabel(selectedTradfi);

  const selectedMetrics = useMemo(() => {
    if (!timeSeries) return null;
    return computeSelectedMetrics(timeSeries, defiKey, tradfiKey);
  }, [timeSeries, defiKey, tradfiKey]);

  // Use actual current rates for "Current Spread" (not historical time series)
  const currentSpread = useMemo(() => {
    if (!currentRates) return 0;
    const defiRate = getCurrentDefiRate(currentRates, selectedDefi);
    const tradfiRate = getCurrentTradfiRate(currentRates, selectedTradfi);
    return defiRate - tradfiRate;
  }, [currentRates, selectedDefi, selectedTradfi]);

  // Calculate context data
  const avgSpread = selectedMetrics?.averageSpread || 0;
  const vsAverage = currentSpread - avgSpread;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Current Spread"
        value={currentRates ? formatPercent(currentSpread) : "--"}
        subtitle={
          currentRates && selectedMetrics
            ? `${vsAverage >= 0 ? "+" : ""}${formatPercent(vsAverage)} vs avg`
            : undefined
        }
        description={`${defiLabel} minus ${tradfiLabel}. Positive = DeFi pays more.`}
        isLoading={isLoading}
        isPositive={currentRates ? currentSpread > 0 : undefined}
        sparklineData={selectedMetrics?.dataWithSpread}
        sparklineKey="computedSpread"
        sparklineColor={currentSpread >= 0 ? "#10b981" : "#ef4444"}
        isPrimary={true}
        icon={
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            currentSpread >= 0 ? "bg-emerald-500/20" : "bg-red-500/20"
          }`}>
            {currentSpread >= 0 ? (
              <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg className="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
          </div>
        }
      />

      <MetricCard
        title="18-Month Average"
        value={selectedMetrics ? formatPercent(selectedMetrics.averageSpread) : "--"}
        subtitle="Historical benchmark"
        description={`Long-term average spread for ${defiLabel} vs ${tradfiLabel}.`}
        isLoading={isLoading}
        isPositive={selectedMetrics ? selectedMetrics.averageSpread > 0 : undefined}
        icon={
          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
            <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        }
      />

      <MetricCard
        title="Peak Spread"
        value={selectedMetrics ? formatPercent(selectedMetrics.maxSpread.value) : "--"}
        subtitle={selectedMetrics?.maxSpread.date ? formatDate(selectedMetrics.maxSpread.date) : undefined}
        description="Highest recorded spread. Occurred during high DeFi demand or low rates."
        isLoading={isLoading}
        isPositive={true}
        icon={
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        }
      />

      <MetricCard
        title="Lowest Spread"
        value={selectedMetrics ? formatPercent(selectedMetrics.minSpread.value) : "--"}
        subtitle={selectedMetrics?.minSpread.date ? formatDate(selectedMetrics.minSpread.date) : undefined}
        description="Lowest recorded spread. Negative means TradFi paid more."
        isLoading={isLoading}
        isPositive={selectedMetrics ? selectedMetrics.minSpread.value > 0 : undefined}
        icon={
          <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
            <svg className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          </div>
        }
      />
    </div>
  );
}
