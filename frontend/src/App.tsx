import { useMemo } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { store } from "src/store";
import { useAppSelector } from "src/store";
import { selectThemeMode } from "src/store/uiSlice";
import Home from "src/pages/home";
import NotFound from "src/pages/not-found";

type ThemeMode = "light" | "dark";

const customPalette = {
  dark: {
    bgDeep: "#0a0e14",
    bgPaper: "#0d1117",
    bgSurface: "#0f1520",
    bgInput: "#161b22",
    bgSnack: "#1c2433",
    bgMenu: "#161b22",
    borderMain: "#1e2a3a",
    borderLight: "#131a27",
    borderMedium: "#2a3544",
    borderHover: "#3b4f6b",
    borderDivider: "rgba(255,255,255,0.15)",
    textBright: "#f3f4f6",
    textPrimary: "#e5e7eb",
    textBody: "#d1d5db",
    textSecondary: "#9ca3af",
    textMuted: "#6b7280",
    textDim: "#4b5563",
    hoverOverlay: "rgba(255,255,255,0.02)",
    hoverOverlayMed: "rgba(255,255,255,0.03)",
    hoverOverlayStrong: "rgba(255,255,255,0.04)",
    chipSubtle: "rgba(255,255,255,0.05)",
    scrollThumb: "#2a3544",
    markerGreen: "#34d399",
    markerPink: "#fb7185",
    accentBlue: "#60a5fa",
    selectedBg: "rgba(59,130,246,0.15)",
    selectedBgHover: "rgba(59,130,246,0.22)",
    selectedOutline: "rgba(59,130,246,0.5)",
    linkedBg: "rgba(56,189,248,0.08)",
    linkedOutline: "rgba(56,189,248,0.25)",
    actionLeave: { bg: "rgba(16,185,129,0.15)", color: "#34d399", border: "rgba(16,185,129,0.3)" },
    actionTransfer: { bg: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "rgba(59,130,246,0.3)" },
    actionOptimize: { bg: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "rgba(245,158,11,0.3)" },
    actionOptTransfer: { bg: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "rgba(139,92,246,0.3)" },
    actionRemove: { bg: "rgba(234,67,161,0.15)", color: "#fa8be8", border: "rgba(190,92,246,0.3)" },
    catMethodology: { bg: "rgba(99,102,241,0.08)", border: "#6366f1", text: "#818cf8" },
    catAction: { bg: "rgba(20,184,166,0.08)", border: "#14b8a6", text: "#2dd4bf" },
    catControl: { bg: "rgba(245,158,11,0.08)", border: "#f59e0b", text: "#fbbf24" },
    catMethodologyChip: { bg: "rgba(99,102,241,0.15)", color: "#818cf8" },
    catActionChip: { bg: "rgba(20,184,166,0.15)", color: "#2dd4bf" },
    catControlChip: { bg: "rgba(245,158,11,0.15)", color: "#fbbf24" },
    linkBadgeBg: "rgba(56,189,248,0.12)",
    linkBadgeColor: "#7dd3fc",
    linkBadgeBorder: "rgba(56,189,248,0.25)",
    strategyChipBg: "rgba(99,102,241,0.12)",
    strategyChipColor: "#a78bfa",
    centralYesBg: "rgba(59,130,246,0.12)",
    linkCountChipBg: "rgba(59,130,246,0.1)",
    saveBtn: "#22c55e",
    saveBtnHover: "#16a34a",
    gradientFrom: "#3b82f6",
    gradientTo: "#6366f1",
    gradientFromHover: "#2563eb",
    gradientToHover: "#4f46e5",
    dangerHover: "#ef4444",
    detailBtnHover: "rgba(59,130,246,0.08)",
  },
  light: {
    bgDeep: "#f0f4f8",
    bgPaper: "#ffffff",
    bgSurface: "#f8fafc",
    bgInput: "#f1f5f9",
    bgSnack: "#1e293b",
    bgMenu: "#ffffff",
    borderMain: "#e2e8f0",
    borderLight: "#f1f5f9",
    borderMedium: "#cbd5e1",
    borderHover: "#94a3b8",
    borderDivider: "rgba(0,0,0,0.15)",
    textBright: "#0f172a",
    textPrimary: "#1e293b",
    textBody: "#334155",
    textSecondary: "#64748b",
    textMuted: "#94a3b8",
    textDim: "#94a3b8",
    hoverOverlay: "rgba(0,0,0,0.02)",
    hoverOverlayMed: "rgba(0,0,0,0.03)",
    hoverOverlayStrong: "rgba(0,0,0,0.04)",
    chipSubtle: "rgba(0,0,0,0.05)",
    scrollThumb: "#cbd5e1",
    markerGreen: "#16a34a",
    markerPink: "#e11d48",
    accentBlue: "#3b82f6",
    selectedBg: "rgba(59,130,246,0.12)",
    selectedBgHover: "rgba(59,130,246,0.18)",
    selectedOutline: "rgba(59,130,246,0.45)",
    linkedBg: "rgba(56,189,248,0.1)",
    linkedOutline: "rgba(56,189,248,0.3)",
    actionLeave: { bg: "rgba(16,185,129,0.1)", color: "#059669", border: "rgba(16,185,129,0.25)" },
    actionTransfer: { bg: "rgba(59,130,246,0.1)", color: "#2563eb", border: "rgba(59,130,246,0.25)" },
    actionOptimize: { bg: "rgba(245,158,11,0.1)", color: "#d97706", border: "rgba(245,158,11,0.25)" },
    actionOptTransfer: { bg: "rgba(139,92,246,0.1)", color: "#7c3aed", border: "rgba(139,92,246,0.25)" },
    actionRemove: { bg: "rgba(234,67,161,0.15)", color: "#bf4bad", border: "rgba(190,92,246,0.3)" },
    catMethodology: { bg: "rgba(99,102,241,0.06)", border: "#6366f1", text: "#4f46e5" },
    catAction: { bg: "rgba(20,184,166,0.06)", border: "#14b8a6", text: "#0d9488" },
    catControl: { bg: "rgba(245,158,11,0.06)", border: "#f59e0b", text: "#d97706" },
    catMethodologyChip: { bg: "rgba(99,102,241,0.1)", color: "#4f46e5" },
    catActionChip: { bg: "rgba(20,184,166,0.1)", color: "#0d9488" },
    catControlChip: { bg: "rgba(245,158,11,0.1)", color: "#d97706" },
    linkBadgeBg: "rgba(56,189,248,0.1)",
    linkBadgeColor: "#0284c7",
    linkBadgeBorder: "rgba(56,189,248,0.2)",
    strategyChipBg: "rgba(99,102,241,0.1)",
    strategyChipColor: "#6366f1",
    centralYesBg: "rgba(59,130,246,0.1)",
    linkCountChipBg: "rgba(59,130,246,0.08)",
    saveBtn: "#16a34a",
    saveBtnHover: "#15803d",
    gradientFrom: "#3b82f6",
    gradientTo: "#6366f1",
    gradientFromHover: "#2563eb",
    gradientToHover: "#4f46e5",
    dangerHover: "#dc2626",
    detailBtnHover: "rgba(59,130,246,0.06)",
  },
};

export type CustomPalette = typeof customPalette.dark;

function buildTheme(mode: ThemeMode) {
  const c = customPalette[mode];
  return createTheme({
    palette: {
      mode,
      background: {
        default: c.bgDeep,
        paper: c.bgPaper,
      },
      primary: {
        main: "#3b82f6",
        light: "#60a5fa",
        dark: "#2563eb",
      },
      success: {
        main: "#10b981",
        light: "#34d399",
        dark: "#059669",
      },
      text: {
        primary: c.textPrimary,
        secondary: c.textSecondary,
      },
      divider: c.borderMain,
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: c.bgDeep,
            scrollbarWidth: "thin",
            scrollbarColor: `${c.scrollThumb} transparent`,
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": { background: c.scrollThumb, borderRadius: 3 },
          },
          "*::-webkit-scrollbar": { width: 6, height: 6 },
          "*::-webkit-scrollbar-track": { background: "transparent" },
          "*::-webkit-scrollbar-thumb": { background: c.scrollThumb, borderRadius: 3 },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: c.bgMenu,
            color: c.textBody,
            border: `1px solid ${c.borderMain}`,
            boxShadow: mode === "dark"
              ? "0 4px 16px rgba(0,0,0,0.4)"
              : "0 4px 16px rgba(0,0,0,0.1)",
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: c.textBody,
            "&:hover": { backgroundColor: c.hoverOverlayStrong },
            "&.Mui-selected": {
              backgroundColor: c.selectedBg,
              "&:hover": { backgroundColor: c.selectedBgHover },
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          icon: { color: c.textMuted },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            color: c.textBody,
            "& .MuiOutlinedInput-notchedOutline": { borderColor: c.borderMedium },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: c.borderHover },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: { color: c.textMuted },
        },
      },
    },
    custom: c,
  });
}

declare module "@mui/material/styles" {
  interface Theme {
    custom: typeof customPalette.dark;
  }
  interface ThemeOptions {
    custom?: typeof customPalette.dark;
  }
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ThemedApp() {
  const mode = useAppSelector(selectThemeMode);
  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router />
    </ThemeProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <ThemedApp />
      </Provider>
    </QueryClientProvider>
  );
}

export default App;
