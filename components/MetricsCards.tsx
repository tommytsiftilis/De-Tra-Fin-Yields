"use client";

import { formatPercent, formatDate } from "@/lib/utils";
import { SpreadMetrics } from "@/types";

interface MetricsCardsProps {
  metrics?: SpreadMetrics;
  isLoading?: boolean;
}

function MetricCard({
  label,
  value,
  subtitle,
  isLoading,
  isPositive,
}: {
  label: string;
  value: string;
  subtitle?: string;
  isLoading?: boolean;
  isPositive?: boolean;
}) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <p className="text-sm text-gray-500">{label}</p>
      {isLoading ? (
        <div className="h-8 w-20 bg-gray-200 animate-pulse rounded mt-1" />
      ) : (
        <>
          <p
            className={`text-2xl font-bold ${
              isPositive === undefined
                ? "text-gray-900"
                : isPositive
                  ? "text-green-600"
                  : "text-red-600"
            }`}
          >
            {value}
          </p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </>
      )}
    </div>
  );
}

export default function MetricsCards({
  metrics,
  isLoading,
}: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        label="Current Spread"
        value={metrics ? formatPercent(metrics.currentSpread) : "--"}
        subtitle="vs Fed Funds"
        isLoading={isLoading}
        isPositive={metrics ? metrics.currentSpread > 0 : undefined}
      />
      <MetricCard
        label="Average Spread"
        value={metrics ? formatPercent(metrics.averageSpread) : "--"}
        subtitle="18-month average"
        isLoading={isLoading}
        isPositive={metrics ? metrics.averageSpread > 0 : undefined}
      />
      <MetricCard
        label="Max Spread"
        value={metrics ? formatPercent(metrics.maxSpread.value) : "--"}
        subtitle={metrics?.maxSpread.date ? formatDate(metrics.maxSpread.date) : undefined}
        isLoading={isLoading}
        isPositive={true}
      />
      <MetricCard
        label="Min Spread"
        value={metrics ? formatPercent(metrics.minSpread.value) : "--"}
        subtitle={metrics?.minSpread.date ? formatDate(metrics.minSpread.date) : undefined}
        isLoading={isLoading}
        isPositive={metrics ? metrics.minSpread.value > 0 : undefined}
      />
    </div>
  );
}
