"use client";

import { formatPercent } from "@/lib/utils";
import { CurrentRates } from "@/types";

interface HeroSectionProps {
  rates?: CurrentRates;
  isLoading?: boolean;
}

function getBestDefiRate(rates: CurrentRates): number {
  return Math.max(
    rates.defi.aaveUsdc,
    rates.defi.aaveUsdt,
    rates.defi.compoundUsdc
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className || ""}`} />
  );
}

export default function HeroSection({ rates, isLoading }: HeroSectionProps) {
  const bestDefiRate = rates ? getBestDefiRate(rates) : 0;
  const riskFreeRate = rates?.tradfi.fedFunds || 0;
  const spread = bestDefiRate - riskFreeRate;
  const spreadPercent = riskFreeRate > 0 ? (spread / riskFreeRate) * 100 : 0;

  return (
    <div className="bg-gradient-to-r from-indigo-50 via-white to-amber-50 rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm">
      {/* Title */}
      <div className="text-center mb-6">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Current Yield Comparison
        </p>
      </div>

      {/* Main comparison */}
      <div className="grid md:grid-cols-3 gap-6 items-center">
        {/* DeFi Side */}
        <div className="text-center md:text-right">
          <div className="inline-block">
            <p className="text-sm font-medium text-indigo-600 mb-1 flex items-center justify-center md:justify-end gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
              DeFi Stablecoins
            </p>
            {isLoading ? (
              <Skeleton className="h-12 w-32 mx-auto md:ml-auto md:mr-0" />
            ) : (
              <p className="text-4xl md:text-5xl font-bold text-gray-900">
                {formatPercent(bestDefiRate)}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Best available yield (Aave/Compound)
            </p>
          </div>
        </div>

        {/* Spread indicator (center) */}
        <div className="flex flex-col items-center">
          <div
            className={`px-6 py-4 rounded-xl border-2 ${
              spread >= 0
                ? "bg-emerald-50 border-emerald-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <p className="text-xs font-medium text-gray-500 text-center mb-1">
              SPREAD
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mx-auto" />
            ) : (
              <>
                <p
                  className={`text-3xl font-bold text-center ${
                    spread >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {spread >= 0 ? "+" : ""}
                  {formatPercent(spread)}
                </p>
                <p
                  className={`text-xs text-center mt-1 ${
                    spread >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {spread >= 0
                    ? `${spreadPercent.toFixed(0)}% premium over risk-free`
                    : `${Math.abs(spreadPercent).toFixed(0)}% below risk-free`}
                </p>
              </>
            )}
          </div>

          {/* Visual spread bar */}
          <div className="w-full max-w-xs mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  spread >= 0 ? "bg-emerald-500" : "bg-red-500"
                }`}
                style={{
                  width: `${Math.min(Math.abs(spread) * 10, 100)}%`,
                  marginLeft: spread < 0 ? "auto" : 0,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Risk-free</span>
              <span>+10%</span>
            </div>
          </div>
        </div>

        {/* TradFi Side */}
        <div className="text-center md:text-left">
          <div className="inline-block">
            <p className="text-sm font-medium text-amber-600 mb-1 flex items-center justify-center md:justify-start gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              TradFi Risk-Free
            </p>
            {isLoading ? (
              <Skeleton className="h-12 w-32 mx-auto md:mr-auto md:ml-0" />
            ) : (
              <p className="text-4xl md:text-5xl font-bold text-gray-900">
                {formatPercent(riskFreeRate)}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Fed Funds Rate (overnight)
            </p>
          </div>
        </div>
      </div>

      {/* Context footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          <span className="font-medium">What this means:</span> DeFi stablecoin
          lending currently offers{" "}
          {spread >= 0 ? (
            <span className="text-emerald-600 font-medium">
              {formatPercent(Math.abs(spread))} more
            </span>
          ) : (
            <span className="text-red-600 font-medium">
              {formatPercent(Math.abs(spread))} less
            </span>
          )}{" "}
          yield than the Federal Reserve&apos;s risk-free rate. This spread
          reflects the additional risk/reward of decentralized protocols.
        </p>
      </div>
    </div>
  );
}
