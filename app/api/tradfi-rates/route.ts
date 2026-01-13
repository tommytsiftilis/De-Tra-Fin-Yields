import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  // TODO: Implement
  // - Fetch Fed Funds + T-Bill rates from FRED
  // - Return normalized JSON

  return NextResponse.json({
    message: "Not implemented",
    fedFunds: [],
    tbill: [],
  });
}
