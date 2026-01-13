"use client";

import { useState } from "react";
import { formatPercent } from "@/lib/utils";
import { CurrentRates } from "@/types";

interface RatesTableProps {
  rates?: CurrentRates;
  isLoading?: boolean;
}

type RiskFreeBase = "fedFunds" | "tbill";

interface DefiRateRow {
  id: string;
  asset: string;
  protocol: string;
  apy: number;
  description: string;
}

function TrendIndicator({ value, baseRate }: { value: number; baseRate: number }) {
  const diff = value - baseRate;
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

export default function RatesTable({ rates, isLoading }: RatesTableProps) {
  const [riskFreeBase, setRiskFreeBase] = useState<RiskFreeBase>("fedFunds");

  const baseRate = rates
    ? riskFreeBase === "fedFunds"
      ? rates.tradfi.fedFunds
      : rates.tradfi.tbill
    : 0;

  const baseRateLabel = riskFreeBase === "fedFunds" ? "Fed Funds" : "3M T-Bill";

  const defiRows: DefiRateRow[] = rates
    ? [
        {
          id: "aave-usdc",
          asset: "USDC",
          protocol: "Aave V3",
          apy: rates.defi.aaveUsdc,
          description: "Variable supply APY on Ethereum mainnet",
        },
        {
          id: "aave-usdt",
          asset: "USDT",
          protocol: "Aave V3",
          apy: rates.defi.aaveUsdt,
          description: "Variable supply APY on Ethereum mainnet",
        },
        {
          id: "compound-usdc",
          asset: "USDC",
          protocol: "Compound V3",
          apy: rates.defi.compoundUsdc,
          description: "Base supply APY on Ethereum mainnet",
        },
      ]
    : [];

  // Find best DeFi rate
  const bestDefiApy = defiRows.length > 0 ? Math.max(...defiRows.map((r) => r.apy)) : 0;

  return (
    <div className="space-y-4">
      {/* DeFi Rates Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <h2 className="text-lg font-semibold text-gray-900">DeFi Stablecoin Yields</h2>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Current lending rates from decentralized protocols
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Protocol</th>
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
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
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
              ) : defiRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                    No data available
                  </td>
                </tr>
              ) : (
                defiRows.map((row) => {
                  const isBestRate = row.apy === bestDefiApy && bestDefiApy > 0;
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        isBestRate ? "bg-emerald-50/50" : ""
                      }`}
                    >
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
                          <p className="text-xs text-gray-500 mt-0.5">
                            {row.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-lg font-mono font-semibold text-indigo-600">
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
            Comparing against <span className="font-medium">{baseRateLabel}</span> ({formatPercent(baseRate)}).
            Positive spread means DeFi offers higher yields with smart contract risk.
          </p>
        </div>
      </div>

      {/* TradFi Rates Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <h2 className="text-lg font-semibold text-gray-900">TradFi Risk-Free Rates</h2>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Federal Reserve benchmark rates
          </p>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg animate-pulse">
                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-8 w-20 bg-gray-200 rounded" />
              </div>
              <div className="p-4 bg-gray-50 rounded-lg animate-pulse">
                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-8 w-20 bg-gray-200 rounded" />
              </div>
            </div>
          ) : rates ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-lg border transition-colors ${
                  riskFreeBase === "fedFunds"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-gray-50 border-gray-200 hover:border-gray-300 cursor-pointer"
                }`}
                onClick={() => setRiskFreeBase("fedFunds")}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-700">Fed Funds Rate</p>
                  {riskFreeBase === "fedFunds" && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                      Base
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold font-mono text-amber-600">
                  {formatPercent(rates.tradfi.fedFunds)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Overnight interbank lending rate
                </p>
              </div>

              <div
                className={`p-4 rounded-lg border transition-colors ${
                  riskFreeBase === "tbill"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-gray-50 border-gray-200 hover:border-gray-300 cursor-pointer"
                }`}
                onClick={() => setRiskFreeBase("tbill")}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-700">3-Month T-Bill</p>
                  {riskFreeBase === "tbill" && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                      Base
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold font-mono text-amber-600">
                  {formatPercent(rates.tradfi.tbill)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  US Treasury Bill yield
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              No data available
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Click a rate to use it as the comparison base for DeFi yields above.
          </p>
        </div>
      </div>
    </div>
  );
}
