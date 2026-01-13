interface HeaderProps {
  lastUpdated?: string;
}

export default function Header({ lastUpdated }: HeaderProps) {
  return (
    <header className="border-b pb-6">
      <h1 className="text-3xl font-bold text-gray-900">DeFi vs TradFi Yields</h1>
      <p className="text-gray-600 mt-2">
        Compare DeFi stablecoin yields against risk-free rates
      </p>
      <p className="text-sm text-gray-500 mt-1">
        Tracking Aave V3 and Compound V3 USDC/USDT yields on Ethereum vs Fed
        Funds Rate and 3-Month T-Bills
      </p>
      {lastUpdated && (
        <p className="text-xs text-gray-400 mt-2">
          Last updated:{" "}
          {new Date(lastUpdated).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      )}
    </header>
  );
}
