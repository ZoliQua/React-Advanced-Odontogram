// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026
//
// Public library entry point (the npm package's JS + types entry).
//
// Imports the global stylesheet as a side effect so the library build extracts
// it to a single `dist/style.css` (consumers import it once — see the README).
// The bundled type declaration (`dist/index.d.ts`, produced by vite-plugin-dts
// with `rollupTypes`) strips this CSS side-effect import, so a consumer's `tsc`
// never sees an unresolved `./index.css`. The demo/dev app boots from
// `src/main.tsx` instead.
//
// Re-exports the full public API that already lives on `src/App.tsx` (the
// `OdontogramShell` component + the imperative state functions, `PerioChart`,
// `startIntroTour`, and all public types).
import "./index.css";

import App from "./App";

// The main component, exported both as a default and under an explicit,
// self-documenting name.
export default App;
export { App as OdontogramShell };

// Everything else already surfaced by App.tsx (state functions, PerioChart,
// startIntroTour, and the public types). `export *` does not re-export a
// default, so it never clashes with the `App` default above.
export * from "./App";
