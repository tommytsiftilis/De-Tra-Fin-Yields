export default function MetricsCards() {
  // TODO: Implement
  // - Average spread over period
  // - Current spread
  // - Max spread (date)
  // - Min spread (date)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="border rounded-lg p-4">
        <p className="text-sm text-gray-500">Current Spread</p>
        <p className="text-2xl font-bold">--</p>
      </div>
      <div className="border rounded-lg p-4">
        <p className="text-sm text-gray-500">Average Spread</p>
        <p className="text-2xl font-bold">--</p>
      </div>
      <div className="border rounded-lg p-4">
        <p className="text-sm text-gray-500">Max Spread</p>
        <p className="text-2xl font-bold">--</p>
      </div>
      <div className="border rounded-lg p-4">
        <p className="text-sm text-gray-500">Min Spread</p>
        <p className="text-2xl font-bold">--</p>
      </div>
    </div>
  );
}
