"use client";

import { formatPercent } from "@/lib/utils";
import { CurrentRates } from "@/types";
import { DefiSelection, TradfiSelection } from "@/app/page";

interface HeroSectionProps {
  rates?: CurrentRates;
  isLoading?: boolean;
  selectedDefi: DefiSelection;
  selectedTradfi: TradfiSelection;
  onDefiChange: (selection: DefiSelection) => void;
  onTradfiChange: (selection: TradfiSelection) => void;
}

const DEFI_OPTIONS: { value: DefiSelection; label: string; protocol: string }[] = [
  { value: "aaveUsdc", label: "USDC", protocol: "Aave V3" },
  { value: "aaveUsdt", label: "USDT", protocol: "Aave V3" },
  { value: "compoundUsdc", label: "USDC", protocol: "Compound V3" },
];

const TRADFI_OPTIONS: { value: TradfiSelection; label: string; description: string }[] = [
  { value: "fedFunds", label: "Fed Funds Rate", description: "Overnight rate" },
  { value: "tbill", label: "3-Month T-Bill", description: "Treasury yield" },
];

function getDefiRate(rates: CurrentRates, selection: DefiSelection): number {
  switch (selection) {
    case "aaveUsdc":
      return rates.defi.aaveUsdc;
    case "aaveUsdt":
      return rates.defi.aaveUsdt;
    case "compoundUsdc":
      return rates.defi.compoundUsdc;
  }
}

function getTradfiRate(rates: CurrentRates, selection: TradfiSelection): number {
  switch (selection) {
    case "fedFunds":
      return rates.tradfi.fedFunds;
    case "tbill":
      return rates.tradfi.tbill;
  }
}

function getDefiLabel(selection: DefiSelection): { asset: string; protocol: string } {
  const option = DEFI_OPTIONS.find((o) => o.value === selection);
  return { asset: option?.label || "USDC", protocol: option?.protocol || "Aave V3" };
}

function getTradfiLabel(selection: TradfiSelection): string {
  const option = TRADFI_OPTIONS.find((o) => o.value === selection);
  return option?.label || "Fed Funds Rate";
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-300 rounded ${className || ""}`} />
  );
}

function SelectButton({
  options,
  value,
  onChange,
  colorClass,
}: {
  options: { value: string; label: string; sublabel?: string }[];
  value: string;
  onChange: (value: string) => void;
  colorClass: string;
}) {
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 pr-8 text-sm font-medium cursor-pointer hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${colorClass}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}{opt.sublabel ? ` (${opt.sublabel})` : ""}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

export default function HeroSection({
  rates,
  isLoading,
  selectedDefi,
  selectedTradfi,
  onDefiChange,
  onTradfiChange,
}: HeroSectionProps) {
  const defiRate = rates ? getDefiRate(rates, selectedDefi) : 0;
  const tradfiRate = rates ? getTradfiRate(rates, selectedTradfi) : 0;
  const spread = defiRate - tradfiRate;
  const spreadPercent = tradfiRate > 0 ? (spread / tradfiRate) * 100 : 0;
  const defiLabel = getDefiLabel(selectedDefi);
  const tradfiLabel = getTradfiLabel(selectedTradfi);

  const defiSelectOptions = DEFI_OPTIONS.map((o) => ({
    value: o.value,
    label: o.label,
    sublabel: o.protocol,
  }));

  const tradfiSelectOptions = TRADFI_OPTIONS.map((o) => ({
    value: o.value,
    label: o.label,
    sublabel: o.description,
  }));

  return (
    <div className="bg-slate-100 rounded-2xl p-6 md:p-8 border border-slate-300 shadow-sm">
      {/* Title */}
      <div className="text-center mb-6">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
          Current Yield Comparison
        </p>
      </div>

      {/* Main comparison */}
      <div className="grid md:grid-cols-3 gap-6 items-center">
        {/* DeFi Side */}
        <div className="text-center md:text-right">
          <div className="inline-block">
            <div className="flex items-center justify-center md:justify-end gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
              <span className="text-sm font-medium text-indigo-600">DeFi Stablecoin</span>
            </div>

            {/* DeFi selector */}
            <div className="mb-3">
              <SelectButton
                options={defiSelectOptions}
                value={selectedDefi}
                onChange={(v) => onDefiChange(v as DefiSelection)}
                colorClass="text-indigo-700 focus:ring-indigo-500"
              />
            </div>

            {isLoading ? (
              <Skeleton className="h-12 w-32 mx-auto md:ml-auto md:mr-0" />
            ) : (
              <p className="text-4xl md:text-5xl font-bold text-slate-800">
                {formatPercent(defiRate)}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              {defiLabel.asset} on {defiLabel.protocol}
            </p>
          </div>
        </div>

        {/* Spread indicator (center) */}
        <div className="flex flex-col items-center">
          <div
            className={`px-6 py-4 rounded-xl border-2 ${
              spread >= 0
                ? "bg-emerald-900/20 border-emerald-500/50"
                : "bg-red-900/20 border-red-500/50"
            }`}
          >
            <p className="text-xs font-medium text-slate-400 text-center mb-1">
              SPREAD
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mx-auto" />
            ) : (
              <>
                <p
                  className={`text-3xl font-bold text-center ${
                    spread >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {spread >= 0 ? "+" : ""}
                  {formatPercent(spread)}
                </p>
                <p
                  className={`text-xs text-center mt-1 ${
                    spread >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {spread >= 0
                    ? `${spreadPercent.toFixed(0)}% premium over risk-free`
                    : `${Math.abs(spreadPercent).toFixed(0)}% below risk-free`}
                </p>
              </>
            )}
          </div>

          {/* Visual spread bar */}
          <div className="w-full max-w-xs mt-4">
            <div className="h-2 bg-slate-300 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  spread >= 0 ? "bg-emerald-500" : "bg-red-500"
                }`}
                style={{
                  width: `${Math.min(Math.abs(spread) * 10, 100)}%`,
                  marginLeft: spread < 0 ? "auto" : 0,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Risk-free</span>
              <span>+10%</span>
            </div>
          </div>
        </div>

        {/* TradFi Side */}
        <div className="text-center md:text-left">
          <div className="inline-block">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="text-sm font-medium text-amber-500">TradFi Risk-Free</span>
            </div>

            {/* TradFi selector */}
            <div className="mb-3">
              <SelectButton
                options={tradfiSelectOptions}
                value={selectedTradfi}
                onChange={(v) => onTradfiChange(v as TradfiSelection)}
                colorClass="text-amber-700 focus:ring-amber-500"
              />
            </div>

            {isLoading ? (
              <Skeleton className="h-12 w-32 mx-auto md:mr-auto md:ml-0" />
            ) : (
              <p className="text-4xl md:text-5xl font-bold text-slate-800">
                {formatPercent(tradfiRate)}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              {tradfiLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Context footer */}
      <div className="mt-6 pt-4 border-t border-slate-300">
        <p className="text-xs text-slate-500 text-center">
          <span className="font-medium">What this means:</span> {defiLabel.asset} on {defiLabel.protocol}{" "}
          currently offers{" "}
          {spread >= 0 ? (
            <span className="text-emerald-600 font-medium">
              {formatPercent(Math.abs(spread))} more
            </span>
          ) : (
            <span className="text-red-600 font-medium">
              {formatPercent(Math.abs(spread))} less
            </span>
          )}{" "}
          yield than {tradfiLabel}. This spread reflects the additional risk/reward of decentralized protocols.
        </p>
      </div>
    </div>
  );
}
