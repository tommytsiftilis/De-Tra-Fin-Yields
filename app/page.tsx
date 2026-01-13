"use client";

import useSWR from "swr";
import Header from "@/components/Header";
import RatesTable from "@/components/RatesTable";
import SpreadChart from "@/components/SpreadChart";
import UtilizationChart from "@/components/UtilizationChart";
import MetricsCards from "@/components/MetricsCards";
import { SpreadDataPoint, SpreadMetrics, CurrentRates } from "@/types";

interface SpreadApiResponse {
  success: boolean;
  data?: {
    timeSeries: SpreadDataPoint[];
    metrics: SpreadMetrics;
    currentRates: CurrentRates;
    utilization: Array<{
      poolId: string;
      project: string;
      symbol: string;
      history: Array<{ date: string; tvlUsd: number }>;
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
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Header lastUpdated={data?.timestamp} />

        {hasError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">Error loading data</p>
            <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
          </div>
        )}

        <div className="grid gap-6 mt-6">
          <MetricsCards metrics={data?.data?.metrics} isLoading={isLoading} />

          <RatesTable rates={data?.data?.currentRates} isLoading={isLoading} />

          <SpreadChart data={data?.data?.timeSeries} isLoading={isLoading} />

          <UtilizationChart
            data={data?.data?.utilization}
            isLoading={isLoading}
          />
        </div>

        <footer className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
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
            &{" "}
            <a
              href="https://fred.stlouisfed.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              FRED
            </a>
          </p>
          <p className="mt-1">
            Refreshes every 5 minutes. API data cached for 1 hour.
          </p>
        </footer>
      </div>
    </main>
  );
}
