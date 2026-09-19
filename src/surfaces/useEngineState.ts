// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Composable-UI Tier 3: the shared subscription hook the declarative control
// cards use. It is the reusable distillation of the hand-rolled
// `useEffect`+`onStateChange` idiom `PerioSidebar.tsx` established — read the
// engine getter at mount, then re-read it on every `onStateChange` notification
// so the card re-renders from the current chart state. Cards still read stray
// values (`getReadOnly()` etc.) inline, exactly as `PerioSidebar` does; each
// `onStateChange` re-render re-reads them too.

import { useEffect, useState } from "react";
import { onStateChange } from "../odontogram";

export function useEngineState<T>(read: () => T): T {
  const [v, setV] = useState(read);
  useEffect(() => {
    setV(read());
    return onStateChange(() => setV(read()));
  }, []);
  return v;
}
