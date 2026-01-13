export default function RatesTable() {
  // TODO: Implement
  // - Table showing current rates for all assets
  // - Columns: Asset, Protocol, Current APY, vs Risk-Free

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Current Rates</h2>
      <table className="w-full">
        <thead>
          <tr className="text-left border-b">
            <th className="pb-2">Asset</th>
            <th className="pb-2">Protocol</th>
            <th className="pb-2">Current APY</th>
            <th className="pb-2">vs Risk-Free</th>
          </tr>
        </thead>
        <tbody>
          {/* TODO: Map over rates data */}
        </tbody>
      </table>
    </div>
  );
}
