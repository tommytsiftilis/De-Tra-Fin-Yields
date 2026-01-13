import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  // TODO: Implement
  // - Fetch current + historical DeFi yields from DefiLlama
  // - Return normalized JSON

  return NextResponse.json({
    message: "Not implemented",
    current: [],
    historical: [],
  });
}
