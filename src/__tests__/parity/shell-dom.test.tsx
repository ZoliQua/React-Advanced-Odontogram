// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Shell DOM-parity harness.
//
// Freezes the markup `OdontogramShell` renders, so the composable-UI refactor
// (design/composable-ui.md) can prove that extracting the shell's JSX into
// separately-placeable surface components leaves the DEFAULT composition
// byte-identical. This is the objective contract behind constraint #2 of that
// document — "the default composition renders a byte-identical DOM".
//
// The engine's two DOM-mutating lifecycle calls (`initOdontogram` /
// `destroyOdontogram`) are stubbed so the snapshot captures ONLY the shell's own
// JSX: `#toothGrid` stays empty and the grid's SVG content — already covered by
// the SVG-fingerprint fixtures in this directory — never enters this snapshot.
// Everything else in `odontogram.ts` stays real, so the captured markup reflects
// genuine getter values rather than hand-written mock returns.
//
// Re-capture with `npm run parity:capture` (sets PARITY_CAPTURE) after an
// INTENTIONAL shell markup change; the guarded capture below never runs in the
// normal suite, so the golden is not re-frozen by accident.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import App from "../../App";

vi.mock("../../odontogram", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../odontogram")>();
  return {
    ...actual,
    initOdontogram: vi.fn().mockResolvedValue(undefined),
    destroyOdontogram: vi.fn(),
  };
});

const GOLDEN_PATH = path.resolve(__dirname, "shell-dom-golden.html");

/**
 * Collapse the bundle-inlined assets (base64 brand logo, `?raw` icon SVGs
 * carried on `data-icon-src`) to a short placeholder.
 *
 * They are static build artifacts, not layout: leaving them in makes the golden
 * ~130 KB of unreadable base64, which would defeat the purpose of a fixture
 * whose whole job is to make an unintended markup change VISIBLE in a diff.
 * Structure, ids, classes and attribute order — everything the composability
 * refactor could plausibly disturb — are preserved verbatim.
 */
function normalizeInlinedAssets(html: string): string {
  return stripDynamicContents(
    html
      .replace(/data:image\/[a-z+]+;base64,[A-Za-z0-9+/=]+/g, "data:<inlined-image>")
      .replace(/data-icon-src="[^"]{200,}"/g, 'data-icon-src="<inlined-svg>"'),
  );
}

/**
 * Strip the CONTENTS of controls whose children are runtime-populated, leaving
 * the shell structure (ids, classes, attribute order) intact for comparison.
 *
 * Tier 3 converts the control cards from imperatively-populated static shells
 * into declarative React that renders its `<option>`s / dynamic rows at mount.
 * In the mocked-init golden those children used to be empty (init is stubbed);
 * a declarative card renders them immediately. Normalizing the contents out
 * makes the golden verify the shell STRUCTURE regardless of whether children
 * come from imperative init or declarative JSX — so it stays byte-stable across
 * all six card conversions. The children themselves (option lists, checkbox
 * grids) are verified by the real-init behavior tests instead.
 *
 * The container emptier is NESTING-AWARE: PR 3c's declarative `#cariesChecks`
 * wraps its cells in a `.surface-cross` <div> (the imperative `buildSurfaceCross`
 * did too), so a naive `.*?</div>` would stop at the inner close tag and leave a
 * stray `</div>`. `emptyContainer` walks tags counting depth to find the
 * container's MATCHING close, then blanks everything between — reducing a
 * populated container to `<div id="…" …></div>` exactly as the empty
 * mocked-init shell serialised.
 */
function emptyContainer(html: string, id: string): string {
  const openRe = new RegExp(`<div id="${id}"[^>]*>`, "g");
  let m: RegExpExecArray | null;
  while ((m = openRe.exec(html)) !== null) {
    const contentStart = m.index + m[0].length;
    // Walk forward from the open tag, tracking <div>/</div> nesting depth.
    let depth = 1;
    const tagRe = /<\/?div\b[^>]*>/g;
    tagRe.lastIndex = contentStart;
    let t: RegExpExecArray | null;
    while ((t = tagRe.exec(html)) !== null) {
      depth += t[0].startsWith("</") ? -1 : 1;
      if (depth === 0) {
        // t is the matching close tag; blank the content between.
        html = html.slice(0, contentStart) + html.slice(t.index);
        openRe.lastIndex = contentStart + "</div>".length;
        break;
      }
    }
  }
  return html;
}

function stripDynamicContents(html: string): string {
  let out = html.replace(/(<select\b[^>]*>).*?(<\/select>)/g, "$1$2");
  for (const id of ["cariesChecks", "fillingSurfaceChecks", "modsChecks", "cariesSubcrownRow", "perioGrid", "statusExtraSelect"]) {
    out = emptyContainer(out, id);
  }
  return out;
}

/** Render the default shell composition and return its normalized markup. */
function renderShellMarkup(): string {
  const { container } = render(<App />);
  return normalizeInlinedAssets(container.innerHTML);
}

describe("shell DOM parity", () => {
  beforeEach(() => {
    cleanup();
    document.documentElement.classList.remove("dark");
  });

  // Guarded exactly like capture.test.ts: only `npm run parity:capture` writes.
  it.skipIf(!process.env.PARITY_CAPTURE)("capture frozen shell-DOM fixture (one-time)", () => {
    writeFileSync(GOLDEN_PATH, renderShellMarkup(), "utf-8");
  });

  it.skipIf(!!process.env.PARITY_CAPTURE)("default composition matches the frozen shell DOM", () => {
    expect(existsSync(GOLDEN_PATH)).toBe(true);
    const golden = readFileSync(GOLDEN_PATH, "utf-8");
    expect(renderShellMarkup()).toBe(golden);
  });

  it.skipIf(!!process.env.PARITY_CAPTURE)("is deterministic across renders", () => {
    const first = renderShellMarkup();
    cleanup();
    const second = renderShellMarkup();
    expect(second).toBe(first);
  });
});
