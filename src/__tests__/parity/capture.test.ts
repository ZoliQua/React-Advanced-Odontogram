// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { test } from "vitest";
import { runCapture } from "./capture";
// Guarded: the normal suite skips this; only `npm run parity:capture` (which sets
// PARITY_CAPTURE) runs it, so the frozen goldens are never re-captured accidentally.
// Generous timeout: capturing 500+ SVG fingerprints via jsdom parsing exceeds
// vitest's default 5000ms in this environment; the capture itself is fast,
// this only accounts for jsdom/test-harness overhead.
test.skipIf(!process.env.PARITY_CAPTURE)("capture frozen parity fixtures (one-time)", () => {
  runCapture();
}, 30000);
