import { FredResponse } from "@/types";

const BASE_URL = "https://api.stlouisfed.org/fred";

// Series IDs
const SERIES = {
  FED_FUNDS: "DFF",
  TBILL_3M: "DTB3",
};

export async function fetchFedFundsRate(
  startDate?: string,
  endDate?: string
): Promise<FredResponse> {
  // TODO: Implement
  throw new Error("Not implemented");
}

export async function fetchTBillRate(
  startDate?: string,
  endDate?: string
): Promise<FredResponse> {
  // TODO: Implement
  throw new Error("Not implemented");
}

export { SERIES };
