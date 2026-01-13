"use client";

import { useState } from "react";
import useSWR from "swr";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import RatesTable from "@/components/RatesTable";
import SpreadChart from "@/components/SpreadChart";
import TvlChart from "@/components/TvlChart";
import UtilizationRateChart from "@/components/UtilizationRateChart";
import MetricsCards from "@/components/MetricsCards";
import { SpreadDataPoint, SpreadMetrics, CurrentRates } from "@/types";

export type DefiSelection = "aaveUsdc" | "aaveUsdt" | "compoundUsdc" | "morphoUsdc";
export type TradfiSelection = "fedFunds" | "tbill";

interface SpreadApiResponse {
  success: boolean;
  data?: {
    timeSeries: SpreadDataPoint[];
    metrics: SpreadMetrics;
    currentRates: CurrentRates;
    tvl: Array<{
      poolId: string;
      project: string;
      symbol: string;
      history: Array<{ date: string; tvlUsd: number }>;
    }>;
    utilization: Array<{
      poolId: string;
      displayName: string;
      symbol: string;
      history: Array<{
        date: string;
        utilization: number;
        totalSupplyUsd: number;
        totalBorrowUsd: number;
      }>;
    }>;
  };
  error?: string;
  timestamp?: string;
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    return res.json();
  });

export default function Home() {
  // Selection state for DeFi and TradFi comparison
  const [selectedDefi, setSelectedDefi] = useState<DefiSelection>("aaveUsdc");
  const [selectedTradfi, setSelectedTradfi] = useState<TradfiSelection>("fedFunds");

  const { data, error, isLoading } = useSWR<SpreadApiResponse>(
    "/api/spread",
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      revalidateOnFocus: false,
    }
  );

  const hasError = error || (data && !data.success);
  const errorMessage = error?.message || data?.error || "Unknown error";

  return (
    <main className="min-h-screen bg-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header timestamp={data?.timestamp} />

        {hasError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="text-red-700 font-medium">Error loading data</p>
                <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Hero: Side-by-side DeFi vs TradFi comparison */}
          <HeroSection
            rates={data?.data?.currentRates}
            isLoading={isLoading}
            selectedDefi={selectedDefi}
            selectedTradfi={selectedTradfi}
            onDefiChange={setSelectedDefi}
            onTradfiChange={setSelectedTradfi}
          />

          {/* Spread metrics with sparklines */}
          <MetricsCards
            metrics={data?.data?.metrics}
            timeSeries={data?.data?.timeSeries}
            currentRates={data?.data?.currentRates}
            isLoading={isLoading}
            selectedDefi={selectedDefi}
            selectedTradfi={selectedTradfi}
          />

          {/* Historical yields chart */}
          <SpreadChart
            data={data?.data?.timeSeries}
            isLoading={isLoading}
            selectedDefi={selectedDefi}
            selectedTradfi={selectedTradfi}
          />

          {/* Utilization Rate Chart - explains why rates move */}
          <UtilizationRateChart
            data={data?.data?.utilization}
            isLoading={isLoading}
          />

          {/* Two-column layout for table and TVL */}
          <div className="grid lg:grid-cols-2 gap-6 items-start">
            <RatesTable
              rates={data?.data?.currentRates}
              isLoading={isLoading}
            />
            <TvlChart
              data={data?.data?.tvl}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-slate-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-sm text-slate-500">
              <p>
                Data sources:{" "}
                <a
                  href="https://defillama.com/yields"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  DefiLlama
                </a>{" "}
                (DeFi yields) &{" "}
                <a
                  href="https://fred.stlouisfed.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 hover:underline"
                >
                  FRED
                </a>{" "}
                (TradFi rates)
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>Auto-refresh: 5 min</span>
              <span>API cache: 1 hour</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            This dashboard is for informational purposes only. DeFi yields
            involve smart contract risk and are not equivalent to FDIC-insured
            deposits or government securities.
          </p>
        </footer>
      </div>
    </main>
  );
}
