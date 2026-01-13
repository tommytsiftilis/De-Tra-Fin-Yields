// Color system for DeFi vs TradFi dashboard
// Based on financial dashboard best practices

export const colors = {
  // DeFi colors (blue/purple family)
  defi: {
    primary: "#6366f1", // indigo-500
    secondary: "#8b5cf6", // violet-500
    tertiary: "#06b6d4", // cyan-500
    light: "#e0e7ff", // indigo-100
    dark: "#3730a3", // indigo-800
  },

  // TradFi colors (amber/orange family)
  tradfi: {
    primary: "#f59e0b", // amber-500
    secondary: "#f97316", // orange-500
    light: "#fef3c7", // amber-100
    dark: "#92400e", // amber-800
  },

  // Semantic colors
  positive: {
    text: "#059669", // emerald-600
    bg: "#d1fae5", // emerald-100
    border: "#34d399", // emerald-400
  },

  negative: {
    text: "#dc2626", // red-600
    bg: "#fee2e2", // red-100
    border: "#f87171", // red-400
  },

  neutral: {
    text: "#6b7280", // gray-500
    bg: "#f3f4f6", // gray-100
    border: "#d1d5db", // gray-300
  },

  // Chart colors
  chart: {
    aaveUsdc: "#6366f1", // indigo
    aaveUsdt: "#8b5cf6", // violet
    compoundUsdc: "#06b6d4", // cyan
    fedFunds: "#f59e0b", // amber
    tbill: "#f97316", // orange
    spread: "#10b981", // emerald
    spreadNegative: "#ef4444", // red
  },
};

export function getSpreadColor(spread: number): string {
  if (spread > 0) return colors.positive.text;
  if (spread < 0) return colors.negative.text;
  return colors.neutral.text;
}

export function getSpreadBgColor(spread: number): string {
  if (spread > 0) return colors.positive.bg;
  if (spread < 0) return colors.negative.bg;
  return colors.neutral.bg;
}
