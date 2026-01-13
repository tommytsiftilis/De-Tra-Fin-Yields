"use client";

import { useState } from "react";
import { formatPercent } from "@/lib/utils";
import { CurrentRates } from "@/types";

interface RatesTableProps {
  rates?: CurrentRates;
  isLoading?: boolean;
}

type RiskFreeBase = "fedFunds" | "tbill";

interface RateRow {
  id: string;
  asset: string;
  protocol: string;
  apy: number;
  type: "defi" | "tradfi";
  description: string;
}

function TrendIndicator({ value, baseRate }: { value: number; baseRate: number }) {
  const diff = value - baseRate;
  if (value === baseRate) {
    return <span className="text-gray-400">--</span>;
  }

  const isPositive = diff > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono ${
        isPositive ? "text-emerald-600" : "text-red-600"
      }`}
    >
      {isPositive ? (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      )}
      {isPositive ? "+" : ""}
      {formatPercent(diff)}
    </span>
  );
}

function TypeBadge({ type }: { type: "defi" | "tradfi" }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        type === "defi"
          ? "bg-indigo-100 text-indigo-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {type === "defi" ? "DeFi" : "TradFi"}
    </span>
  );
}

export default function RatesTable({ rates, isLoading }: RatesTableProps) {
  const [riskFreeBase, setRiskFreeBase] = useState<RiskFreeBase>("fedFunds");

  const baseRate = rates
    ? riskFreeBase === "fedFunds"
      ? rates.tradfi.fedFunds
      : rates.tradfi.tbill
    : 0;

  const baseRateLabel = riskFreeBase === "fedFunds" ? "Fed Funds" : "3M T-Bill";

  const rows: RateRow[] = rates
    ? [
        {
          id: "aave-usdc",
          asset: "USDC",
          protocol: "Aave V3",
          apy: rates.defi.aaveUsdc,
          type: "defi",
          description: "Variable supply APY on Ethereum mainnet",
        },
        {
          id: "aave-usdt",
          asset: "USDT",
          protocol: "Aave V3",
          apy: rates.defi.aaveUsdt,
          type: "defi",
          description: "Variable supply APY on Ethereum mainnet",
        },
        {
          id: "compound-usdc",
          asset: "USDC",
          protocol: "Compound V3",
          apy: rates.defi.compoundUsdc,
          type: "defi",
          description: "Base supply APY on Ethereum mainnet",
        },
        {
          id: "fed-funds",
          asset: "USD",
          protocol: "Fed Funds Rate",
          apy: rates.tradfi.fedFunds,
          type: "tradfi",
          description: "Overnight interbank lending rate (risk-free benchmark)",
        },
        {
          id: "tbill",
          asset: "USD",
          protocol: "3-Month T-Bill",
          apy: rates.tradfi.tbill,
          type: "tradfi",
          description: "US Treasury Bill yield (virtually risk-free)",
        },
      ]
    : [];

  // Find best DeFi rate
  const defiRates = rows.filter((r) => r.type === "defi").map((r) => r.apy);
  const bestDefiApy = defiRates.length > 0 ? Math.max(...defiRates) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Current Rates</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Live yields from DeFi protocols and traditional finance
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              DeFi
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              TradFi
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3">Protocol / Rate</th>
              <th className="px-4 py-3 text-right">Current APY</th>
              <th className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <span>vs</span>
                  <select
                    value={riskFreeBase}
                    onChange={(e) => setRiskFreeBase(e.target.value as RiskFreeBase)}
                    className="appearance-none bg-white border border-gray-200 rounded px-2 py-0.5 text-xs font-medium text-gray-700 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="fedFunds">Fed Funds</option>
                    <option value="tbill">3M T-Bill</option>
                  </select>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-4">
                    <div className="h-5 w-12 bg-gray-200 animate-pulse rounded-full" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-12 bg-gray-200 animate-pulse rounded" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="h-4 w-16 bg-gray-200 animate-pulse rounded ml-auto" />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="h-4 w-16 bg-gray-200 animate-pulse rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  No data available
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const isBestRate = row.type === "defi" && row.apy === bestDefiApy && bestDefiApy > 0;
                const isBaseRate =
                  (riskFreeBase === "fedFunds" && row.id === "fed-funds") ||
                  (riskFreeBase === "tbill" && row.id === "tbill");
                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isBestRate ? "bg-emerald-50/50" : ""
                    } ${isBaseRate ? "bg-amber-50/30" : ""}`}
                  >
                    <td className="px-4 py-4">
                      <TypeBadge type={row.type} />
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-medium text-gray-900">{row.asset}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <span className="text-gray-900 font-medium">
                          {row.protocol}
                        </span>
                        {isBestRate && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                            Best
                          </span>
                        )}
                        {isBaseRate && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                            Base
                          </span>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5">
                          {row.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span
                        className={`text-lg font-mono font-semibold ${
                          row.type === "defi" ? "text-indigo-600" : "text-amber-600"
                        }`}
                      >
                        {formatPercent(row.apy)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <TrendIndicator value={row.apy} baseRate={baseRate} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <span className="font-medium">Understanding the comparison:</span> DeFi rates fluctuate based on supply/demand.
          TradFi rates are set by the Federal Reserve. Comparing against <span className="font-medium">{baseRateLabel}</span> ({formatPercent(baseRate)}).
        </p>
      </div>
    </div>
  );
}
