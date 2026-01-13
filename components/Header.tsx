"use client";

import { useState } from "react";

interface HeaderProps {
  timestamp?: string;
}

export default function Header({ timestamp }: HeaderProps) {
  const [infoExpanded, setInfoExpanded] = useState(false);

  return (
    <header className="mb-8">
      {/* Title and last updated in same row */}
      <div className="flex flex-col items-center text-center">
        <h1 className="text-3xl font-bold text-white">
          DeFi vs TradFi Yields
        </h1>
        <p className="text-slate-300 mt-1 max-w-xl text-sm">
          Real-time comparison of DeFi stablecoin yields vs traditional risk-free rates
        </p>
        {timestamp && (
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              Last updated:{" "}
              {new Date(timestamp).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Collapsible info box */}
      <div className="mt-4 max-w-lg mx-auto">
        <button
          onClick={() => setInfoExpanded(!infoExpanded)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-all text-sm text-slate-300"
        >
          <svg
            className="w-4 h-4 text-indigo-500"
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
          <span className="font-medium">What is this dashboard?</span>
          <svg
            className={`w-4 h-4 transition-transform ${infoExpanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {infoExpanded && (
          <div className="mt-2 p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-sm text-slate-300 animate-in fade-in slide-in-from-top-2 duration-200">
            <p>
              This tracks the yield spread between{" "}
              <span className="font-medium text-indigo-400">DeFi lending</span>{" "}
              (Aave, Compound) and{" "}
              <span className="font-medium text-amber-500">TradFi risk-free rates</span>{" "}
              (Fed Funds, T-Bills).
            </p>
            <ul className="mt-2 space-y-1 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">●</span>
                <span><strong>Positive spread</strong> = DeFi pays more (but with smart contract risk)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">●</span>
                <span><strong>Negative spread</strong> = Capital flowing out of DeFi</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
