import { SpreadDataPoint, SpreadMetrics } from "@/types";

export function formatDate(date: Date | string): string {
  // TODO: Implement
  throw new Error("Not implemented");
}

export function formatPercent(value: number): string {
  // TODO: Implement
  throw new Error("Not implemented");
}

export function calculateSpread(defiApy: number, riskFreeRate: number): number {
  // TODO: Implement
  throw new Error("Not implemented");
}

export function calculateMetrics(data: SpreadDataPoint[]): SpreadMetrics {
  // TODO: Implement
  throw new Error("Not implemented");
}

export function normalizeDataForChart(
  defiData: unknown[],
  tradfiData: unknown[]
): SpreadDataPoint[] {
  // TODO: Implement - merge and align dates
  throw new Error("Not implemented");
}
