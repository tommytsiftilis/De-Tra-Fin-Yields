// DefiLlama Types

export interface DefiPool {
  pool: string;
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyBase: number;
}

export interface ApyHistoryPoint {
  timestamp: string;
  apy: number;
  tvlUsd: number;
}

export interface ApyHistory {
  data: ApyHistoryPoint[];
}

// FRED Types

export interface FredObservation {
  date: string;
  value: string;
}

export interface FredResponse {
  observations: FredObservation[];
}

// Internal Types

export interface SpreadDataPoint {
  date: string;
  aaveUsdcApy: number;
  aaveUsdtApy: number;
  compoundUsdcApy: number;
  morphoUsdcApy: number;
  fedFundsRate: number;
  tbillRate: number;
  spreadVsFed: number;
  spreadVsTbill: number;
}

export interface CurrentRates {
  defi: {
    aaveUsdc: number;
    aaveUsdt: number;
    compoundUsdc: number;
    morphoUsdc: number;
  };
  tradfi: {
    fedFunds: number;
    tbill: number;
  };
  lastUpdated: string;
}

export interface SpreadMetrics {
  currentSpread: number;
  averageSpread: number;
  maxSpread: { value: number; date: string };
  minSpread: { value: number; date: string };
}
