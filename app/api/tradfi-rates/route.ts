import { NextResponse } from "next/server";
import { fetchAllRates } from "@/lib/fred";
import { getDateRange } from "@/lib/utils";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const { startDate, endDate } = getDateRange(18);
    const { fedFunds, tbill } = await fetchAllRates(startDate, endDate);

    // Get current rates (most recent observation)
    const currentFedFunds =
      fedFunds.observations.length > 0
        ? parseFloat(
            fedFunds.observations[fedFunds.observations.length - 1].value
          )
        : null;

    const currentTBill =
      tbill.observations.length > 0
        ? parseFloat(tbill.observations[tbill.observations.length - 1].value)
        : null;

    return NextResponse.json({
      success: true,
      data: {
        fedFunds: {
          current: currentFedFunds,
          history: fedFunds.observations,
        },
        tbill: {
          current: currentTBill,
          history: tbill.observations,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching TradFi rates:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
