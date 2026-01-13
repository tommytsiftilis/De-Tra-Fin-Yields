// Color system for DeFi vs TradFi dashboard
// Dark theme optimized for crypto dashboards

export const colors = {
  // DeFi colors (blue/purple family - brightened for dark bg)
  defi: {
    primary: "#818cf8", // indigo-400
    secondary: "#a78bfa", // violet-400
    tertiary: "#22d3ee", // cyan-400
    light: "#312e81", // indigo-900
    dark: "#6366f1", // indigo-500
  },

  // TradFi colors (amber/orange family - brightened for dark bg)
  tradfi: {
    primary: "#fbbf24", // amber-400
    secondary: "#fb923c", // orange-400
    light: "#78350f", // amber-900
    dark: "#f59e0b", // amber-500
  },

  // Semantic colors (adjusted for dark theme)
  positive: {
    text: "#34d399", // emerald-400
    bg: "rgba(16, 185, 129, 0.15)", // emerald with transparency
    border: "#10b981", // emerald-500
  },

  negative: {
    text: "#f87171", // red-400
    bg: "rgba(239, 68, 68, 0.15)", // red with transparency
    border: "#ef4444", // red-500
  },

  neutral: {
    text: "#94a3b8", // slate-400
    bg: "rgba(100, 116, 139, 0.15)", // slate with transparency
    border: "#475569", // slate-600
  },

  // Chart colors (same but optimized for dark backgrounds)
  chart: {
    aaveUsdc: "#818cf8", // indigo-400
    aaveUsdt: "#a78bfa", // violet-400
    compoundUsdc: "#22d3ee", // cyan-400
    morphoUsdc: "#34d399", // emerald-400
    fedFunds: "#fbbf24", // amber-400
    tbill: "#fb923c", // orange-400
    spread: "#34d399", // emerald-400
    spreadNegative: "#f87171", // red-400
  },

  // Dark theme specific
  dark: {
    bg: "#020617", // slate-950
    card: "#0f172a", // slate-900
    elevated: "#1e293b", // slate-800
    border: "#334155", // slate-700
    text: "#f1f5f9", // slate-100
    textMuted: "#94a3b8", // slate-400
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
