"use client";

import { formatPercent, formatDate } from "@/lib/utils";
import { SpreadMetrics, SpreadDataPoint } from "@/types";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface MetricsCardsProps {
  metrics?: SpreadMetrics;
  timeSeries?: SpreadDataPoint[];
  isLoading?: boolean;
}

function Sparkline({
  data,
  dataKey,
  color,
  referenceValue,
}: {
  data: SpreadDataPoint[];
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
}: {
  title: string;
  value: string;
  subtitle?: string;
  description?: string;
  isLoading?: boolean;
  isPositive?: boolean;
  sparklineData?: SpreadDataPoint[];
  sparklineKey?: string;
  sparklineColor?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {icon}
      </div>

      {isLoading ? (
        <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
      ) : (
        <p
          className={`text-2xl font-bold ${
            isPositive === undefined
              ? "text-gray-900"
              : isPositive
                ? "text-emerald-600"
                : "text-red-600"
          }`}
        >
          {value}
        </p>
      )}

      {subtitle && (
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
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
        <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
          {description}
        </p>
      )}
    </div>
  );
}

export default function MetricsCards({
  metrics,
  timeSeries,
  isLoading,
}: MetricsCardsProps) {
  // Calculate context data
  const avgSpread = metrics?.averageSpread || 0;
  const currentSpread = metrics?.currentSpread || 0;
  const vsAverage = currentSpread - avgSpread;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Current Spread"
        value={metrics ? formatPercent(metrics.currentSpread) : "--"}
        subtitle={
          metrics
            ? `${vsAverage >= 0 ? "+" : ""}${formatPercent(vsAverage)} vs avg`
            : undefined
        }
        description="DeFi yield minus Fed Funds Rate. Positive = DeFi pays more."
        isLoading={isLoading}
        isPositive={metrics ? metrics.currentSpread > 0 : undefined}
        sparklineData={timeSeries}
        sparklineKey="spreadVsFed"
        sparklineColor={currentSpread >= 0 ? "#10b981" : "#ef4444"}
        icon={
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            metrics && metrics.currentSpread >= 0 ? "bg-emerald-100" : "bg-red-100"
          }`}>
            {metrics && metrics.currentSpread >= 0 ? (
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
        value={metrics ? formatPercent(metrics.averageSpread) : "--"}
        subtitle="Historical benchmark"
        description="Long-term average spread. Use this to assess if current spread is attractive."
        isLoading={isLoading}
        isPositive={metrics ? metrics.averageSpread > 0 : undefined}
        icon={
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        }
      />

      <MetricCard
        title="Peak Spread"
        value={metrics ? formatPercent(metrics.maxSpread.value) : "--"}
        subtitle={metrics?.maxSpread.date ? formatDate(metrics.maxSpread.date) : undefined}
        description="Highest recorded spread. Occurred during high DeFi demand or low Fed rates."
        isLoading={isLoading}
        isPositive={true}
        icon={
          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        }
      />

      <MetricCard
        title="Lowest Spread"
        value={metrics ? formatPercent(metrics.minSpread.value) : "--"}
        subtitle={metrics?.minSpread.date ? formatDate(metrics.minSpread.date) : undefined}
        description="Lowest recorded spread. Negative means TradFi paid more than DeFi."
        isLoading={isLoading}
        isPositive={metrics ? metrics.minSpread.value > 0 : undefined}
        icon={
          <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
            <svg className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          </div>
        }
      />
    </div>
  );
}
