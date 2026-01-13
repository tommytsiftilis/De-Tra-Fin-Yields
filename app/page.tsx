"use client";

import Header from "@/components/Header";
import RatesTable from "@/components/RatesTable";
import SpreadChart from "@/components/SpreadChart";
import UtilizationChart from "@/components/UtilizationChart";
import MetricsCards from "@/components/MetricsCards";

export default function Home() {
  // TODO: Implement SWR data fetching
  // TODO: Add loading states
  // TODO: Add error handling

  return (
    <main className="min-h-screen p-8">
      <Header />
      <div className="grid gap-6 mt-6">
        <MetricsCards />
        <RatesTable />
        <SpreadChart />
        <UtilizationChart />
      </div>
    </main>
  );
}
