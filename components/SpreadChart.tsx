"use client";

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
import { SpreadDataPoint } from "@/types";
import { formatShortDate } from "@/lib/utils";

interface SpreadChartProps {
  data?: SpreadDataPoint[];
  isLoading?: boolean;
}

const COLORS = {
  aaveUsdc: "#6366f1", // indigo
  aaveUsdt: "#8b5cf6", // violet
  compoundUsdc: "#06b6d4", // cyan
  fedFunds: "#ef4444", // red
  tbill: "#f97316", // orange
};

export default function SpreadChart({ data, isLoading }: SpreadChartProps) {
  // Sample data at regular intervals for better chart performance
  const sampledData = data
    ? data.filter((_, i) => i % 7 === 0 || i === data.length - 1)
    : [];

  return (
    <div className="border rounded-lg p-4 bg-white">
      <h2 className="text-xl font-semibold mb-4">Historical Yields</h2>
      <div className="h-80">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading chart...</div>
          </div>
        ) : sampledData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={sampledData}
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
                tickFormatter={(value) => `${value.toFixed(1)}%`}
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
                domain={["auto", "auto"]}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(2)}%`]}
                labelFormatter={(label) => formatShortDate(label)}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
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
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
