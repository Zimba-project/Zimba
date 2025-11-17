// Simple mapping of CSS variables for light/dark themes.

export const themeVars = {
  light: {
    "--color-primary": "99 102 241",        // #6366f1 (purple as app primary)
    "--color-secondary": "37 99 235",     // #2563eb (blue as secondary)
    "--color-success": "34 197 94",        // #22c55e
    "--color-info": "14 165 233",          // #0ea5e9
    "--color-warning": "245 158 11",       // #f59e0b
    "--color-background": "255 255 255",   // #white  (background)
    "--color-surface": "243 244 246",      // #f3f4f6 -cards and surfaces
    "--color-text": "17 24 39",            // #111827
    "--color-border": "229 231 235",       // #e5e7eb
    "--color-muted": "107 114 128",        // #6b7280
    "--color-on-primary": "255 255 255",    // white text on primary
    "--color-danger": "220 38 38",         // #dc2626 (red)
  },
  dark: {
    "--color-primary": "129 140 248",       // #818cf8 (purple primary in dark)
    "--color-secondary": "96 165 250",    // #60a5fa (blue secondary in dark)
    "--color-success": "52 211 153",       // #34d399
    "--color-info": "56 189 248",          // #38bdf8
    "--color-warning": "250 204 21",       // #facc15
    "--color-background": "15 23 42",      // #0f172a
    "--color-surface": "20 25 40",         // slightly lighter than background
    "--color-text": "248 250 252",         // #f8fafc
    "--color-border": "55 65 81",          // #374151
    "--color-muted": "148 163 184",        // #94a3b8
    "--color-on-primary": "0 0 0",          // use black text on bright primary if needed
    "--color-danger": "248 113 113",       // #f87171 (light red)
    "--color-overlay": "0 0 0",             // overlay color (black) used with alpha for image overlays
  },
};
