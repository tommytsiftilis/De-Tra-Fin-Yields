"use client";

// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SpreadChart() {
  // TODO: Implement
  // - Recharts LineChart with:
  //   - X-axis: Date (last 12-18 months)
  //   - Y-axis: APY (%)
  //   - Lines: Each DeFi pool, Fed Funds, T-Bill
  // - Tooltip with all values on hover
  // - Legend

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Historical Yields</h2>
      <div className="h-80 flex items-center justify-center text-gray-400">
        {/* TODO: Add Recharts LineChart */}
        Chart placeholder
      </div>
    </div>
  );
}
