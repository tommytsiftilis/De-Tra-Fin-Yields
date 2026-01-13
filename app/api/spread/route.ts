import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  // TODO: Implement
  // - Combine DeFi and TradFi data
  // - Calculate spread for each date
  // - Return merged time series

  return NextResponse.json({
    message: "Not implemented",
    data: [],
    metrics: null,
  });
}
