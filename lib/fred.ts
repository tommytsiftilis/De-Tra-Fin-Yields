import { FredResponse } from "@/types";

const BASE_URL = "https://api.stlouisfed.org/fred";

// Series IDs
const SERIES = {
  FED_FUNDS: "DFF",
  TBILL_3M: "DTB3",
};

function getApiKey(): string {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    throw new Error(
      "FRED_API_KEY is required. Get a free key at https://fred.stlouisfed.org/docs/api/api_key.html"
    );
  }
  return apiKey;
}

function buildUrl(
  seriesId: string,
  startDate?: string,
  endDate?: string
): string {
  const apiKey = getApiKey();

  const params = new URLSearchParams({
    series_id: seriesId,
    file_type: "json",
    api_key: apiKey,
  });

  if (startDate) {
    params.set("observation_start", startDate);
  }

  if (endDate) {
    params.set("observation_end", endDate);
  }

  return `${BASE_URL}/series/observations?${params.toString()}`;
}

async function fetchSeries(
  seriesId: string,
  startDate?: string,
  endDate?: string
): Promise<FredResponse> {
  const url = buildUrl(seriesId, startDate, endDate);

  const response = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`FRED API error: ${response.status}`);
  }

  const json = await response.json();
  return {
    observations: json.observations || [],
  };
}

export async function fetchFedFundsRate(
  startDate?: string,
  endDate?: string
): Promise<FredResponse> {
  return fetchSeries(SERIES.FED_FUNDS, startDate, endDate);
}

export async function fetchTBillRate(
  startDate?: string,
  endDate?: string
): Promise<FredResponse> {
  return fetchSeries(SERIES.TBILL_3M, startDate, endDate);
}

export async function fetchAllRates(
  startDate?: string,
  endDate?: string
): Promise<{
  fedFunds: FredResponse;
  tbill: FredResponse;
}> {
  const [fedFunds, tbill] = await Promise.all([
    fetchFedFundsRate(startDate, endDate),
    fetchTBillRate(startDate, endDate),
  ]);

  return { fedFunds, tbill };
}

export { SERIES };
