interface HeaderProps {
  lastUpdated?: string;
}

export default function Header({ lastUpdated }: HeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            DeFi vs TradFi Yields
          </h1>
          <p className="text-gray-600 mt-1 max-w-2xl">
            Real-time comparison of decentralized finance stablecoin lending
            yields against traditional risk-free rates
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm">
          {lastUpdated && (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>
                Updated{" "}
                {new Date(lastUpdated).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-gray-600">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Refreshes every 5 min</span>
          </div>
        </div>
      </div>

      {/* Quick explanation */}
      <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-amber-50 rounded-lg border border-gray-200">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-indigo-600 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div className="text-sm text-gray-700">
            <p className="font-medium text-gray-900">What is this dashboard?</p>
            <p className="mt-1">
              This tracks the yield spread between{" "}
              <span className="font-medium text-indigo-700">DeFi lending</span>{" "}
              (Aave, Compound) and{" "}
              <span className="font-medium text-amber-700">
                TradFi risk-free rates
              </span>{" "}
              (Fed Funds, T-Bills). A positive spread means DeFi pays more,
              but comes with smart contract risk. A negative spread suggests
              capital is flowing out of DeFi.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
