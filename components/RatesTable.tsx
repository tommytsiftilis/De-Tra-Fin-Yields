"use client";

import { formatPercent } from "@/lib/utils";
import { CurrentRates } from "@/types";

interface RatesTableProps {
  rates?: CurrentRates;
  isLoading?: boolean;
}

interface RateRow {
  asset: string;
  protocol: string;
  apy: number;
  vsFedFunds: number;
  type: "defi" | "tradfi";
}

export default function RatesTable({ rates, isLoading }: RatesTableProps) {
  const rows: RateRow[] = rates
    ? [
        {
          asset: "USDC",
          protocol: "Aave V3",
          apy: rates.defi.aaveUsdc,
          vsFedFunds: rates.defi.aaveUsdc - rates.tradfi.fedFunds,
          type: "defi",
        },
        {
          asset: "USDT",
          protocol: "Aave V3",
          apy: rates.defi.aaveUsdt,
          vsFedFunds: rates.defi.aaveUsdt - rates.tradfi.fedFunds,
          type: "defi",
        },
        {
          asset: "USDC",
          protocol: "Compound V3",
          apy: rates.defi.compoundUsdc,
          vsFedFunds: rates.defi.compoundUsdc - rates.tradfi.fedFunds,
          type: "defi",
        },
        {
          asset: "USD",
          protocol: "Fed Funds Rate",
          apy: rates.tradfi.fedFunds,
          vsFedFunds: 0,
          type: "tradfi",
        },
        {
          asset: "USD",
          protocol: "3-Month T-Bill",
          apy: rates.tradfi.tbill,
          vsFedFunds: rates.tradfi.tbill - rates.tradfi.fedFunds,
          type: "tradfi",
        },
      ]
    : [];

  return (
    <div className="border rounded-lg p-4 bg-white overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">Current Rates</h2>
      <table className="w-full min-w-[500px]">
        <thead>
          <tr className="text-left border-b">
            <th className="pb-2 font-medium text-gray-600">Asset</th>
            <th className="pb-2 font-medium text-gray-600">Protocol</th>
            <th className="pb-2 font-medium text-gray-600 text-right">
              Current APY
            </th>
            <th className="pb-2 font-medium text-gray-600 text-right">
              vs Fed Funds
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b last:border-b-0">
                <td className="py-3">
                  <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                </td>
                <td className="py-3">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                </td>
                <td className="py-3 text-right">
                  <div className="h-4 w-16 bg-gray-200 animate-pulse rounded ml-auto" />
                </td>
                <td className="py-3 text-right">
                  <div className="h-4 w-16 bg-gray-200 animate-pulse rounded ml-auto" />
                </td>
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-8 text-center text-gray-400">
                No data available
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={i}
                className={`border-b last:border-b-0 ${
                  row.type === "tradfi" ? "bg-gray-50" : ""
                }`}
              >
                <td className="py-3 font-medium">{row.asset}</td>
                <td className="py-3 text-gray-600">{row.protocol}</td>
                <td className="py-3 text-right font-mono">
                  {formatPercent(row.apy)}
                </td>
                <td
                  className={`py-3 text-right font-mono ${
                    row.vsFedFunds > 0
                      ? "text-green-600"
                      : row.vsFedFunds < 0
                        ? "text-red-600"
                        : "text-gray-400"
                  }`}
                >
                  {row.vsFedFunds === 0
                    ? "--"
                    : `${row.vsFedFunds > 0 ? "+" : ""}${formatPercent(row.vsFedFunds)}`}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
