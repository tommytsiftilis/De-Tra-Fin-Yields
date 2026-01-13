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
        isPositive ? "text-emerald-400" : "text-red-400"
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
  const [riskFreeBase, setRiskFreeBase] = useState<RiskFreeBase>("tbill");

  const baseRate = rates
    ? riskFreeBase === "fedFunds"
      ? rates.tradfi.fedFunds
      : rates.tradfi.tbill
    : 0;

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
        {
          id: "morpho-usdc",
          asset: "USDC",
          protocol: "Morpho (Steakhouse)",
          apy: rates.defi.morphoUsdc,
          description: "Curated vault yield on Ethereum mainnet",
        },
      ]
    : [];

  // Find best DeFi rate
  const bestDefiApy = defiRows.length > 0 ? Math.max(...defiRows.map((r) => r.apy)) : 0;

  return (
    <div className="bg-slate-800/60 rounded-xl border border-slate-600/40 overflow-hidden">
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
                <h2 className="text-lg font-bold text-white tracking-tight">DeFi Yields</h2>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Current stablecoin lending rates
              </p>
            </div>
          </div>

          {/* TradFi comparison selector */}
          <div className="flex items-center gap-3 p-2 bg-slate-800/60 rounded-lg">
            <span className="text-xs text-slate-400">Compare to:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setRiskFreeBase("fedFunds")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  riskFreeBase === "fedFunds"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                    : "bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600"
                }`}
              >
                Fed Funds {rates && <span className="font-mono font-semibold">({formatPercent(rates.tradfi.fedFunds)})</span>}
              </button>
              <button
                onClick={() => setRiskFreeBase("tbill")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  riskFreeBase === "tbill"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                    : "bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600"
                }`}
              >
                3M T-Bill {rates && <span className="font-mono font-semibold">({formatPercent(rates.tradfi.tbill)})</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700/60 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Protocol</th>
                <th className="px-4 py-3 text-right">Current APY</th>
                <th className="px-4 py-3 text-right">Spread</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-4">
                      <div className="h-4 w-12 bg-slate-700 animate-pulse rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-24 bg-slate-700 animate-pulse rounded" />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="h-4 w-16 bg-slate-700 animate-pulse rounded ml-auto" />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="h-4 w-16 bg-slate-700 animate-pulse rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : defiRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-400">
                    No data available
                  </td>
                </tr>
              ) : (
                defiRows.map((row) => {
                  const isBestRate = row.apy === bestDefiApy && bestDefiApy > 0;
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-800/50 transition-colors ${
                        isBestRate ? "bg-emerald-500/10" : ""
                      }`}
                    >
                      <td className="px-4 py-4">
                        <span className="font-medium text-white">{row.asset}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <span className="text-white font-medium">
                            {row.protocol}
                          </span>
                          {isBestRate && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400">
                              Best
                            </span>
                          )}
                          <p className="text-xs text-slate-400 mt-0.5">
                            {row.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span
                          className={`text-xl font-extrabold tabular-nums ${
                            isBestRate ? "text-emerald-400" : "text-indigo-300"
                          }`}
                          style={isBestRate ? { textShadow: '0 0 15px rgba(52, 211, 153, 0.4)' } : undefined}
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

        <div className="px-5 py-3 bg-slate-800/40 border-t border-slate-700/50">
          <p className="text-xs text-slate-500">
            Positive spread = DeFi yields above risk-free rate (with smart contract risk)
          </p>
        </div>
    </div>
  );
}
