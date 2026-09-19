# Composable UI — specification & implementation plan

Design document for [issue #20](https://github.com/ZoliQua/React-Advanced-Odontogram/issues/20)
("make the odontogram UI composable across host application layouts").

Status: **draft — Tier 1 in progress**

---

## 1. Problem

`OdontogramShell` renders one fixed DOM/layout. A host application that wants the
dental chart in its main content area, the tooth controls in a side panel, and a
review surface elsewhere cannot do so without forking the package or copying
private controls.

The request is explicitly **not** for multiple independent charts. All surfaces
must keep operating on **one package-owned session**, sharing selection state,
validation, and export result.

## 2. Measured baseline

The coupling that makes this non-trivial, measured on `v2.4.0`:

| Property | Value |
|---|---|
| `$("#id")` lookups in `src/odontogram.ts` | **275**, over **142** distinct element IDs |
| `id="…"` attributes in `src/App.tsx` JSX | **152** |
| `wireControls()` | ~635 lines, **runs once** (`controlsWired` guard) |
| `syncControlsFromState()` | ~413 lines, pushes state into DOM by ID |
| `initOdontogram()` | takes **no container argument** — binds against `document` |
| Module-level mutable engine state | 54 top-level `let` + `charts` / `caseMeta` / `planEditedTeeth` |

Two properties of the existing design make this **much cheaper than it looks**:

1. **The DOM helper binds to `document`, not to a container** — the `$` helper in `src/odontogram.ts`:
   ```ts
   const $ = (sel: string, el: ParentNode = document) => el.querySelector(sel) as any;
   ```
   The engine therefore does not care *where* in the document a control lives. If
   the ID exists anywhere, wiring and state-sync work.
2. **A single shared session is what the issue wants.** The module-level singleton
   already provides it. The expensive part of such refactors — per-instance
   context, isolated sessions — is out of scope by the requester's own framing.

And one property makes it harder than it looks:

3. **Wiring is one-shot.** `wireControls()` returns early once `controlsWired` is
   set. The codebase already documents the consequence in three places in
   `src/App.tsx` and works around it by hiding rather than unmounting. The
   odontogram control panel, for instance, is kept always mounted across the
   perio view toggle — its comment explains why:

   > Keep the odontogram control panel ALWAYS mounted, toggling only its
   > visibility with CSS. Unmounting it on the perio toggle would produce fresh
   > DOM nodes whose one-time `wireControls()` listeners are never re-attached,
   > silently breaking odontogram editing after a round-trip.

   The same hide-instead-of-unmount workaround guards the chart column and the
   Status|Plan toggle.

## 3. Precedent inside this repository

The periodontal half of the project has **already completed this migration**:

| File | Lines | DOM lookups |
|---|---|---|
| `src/PerioChart.tsx` | 2339 | 10 |
| `src/PerioSidebar.tsx` | 441 | **0** |

Both are ordinary React components, subscribe to `onStateChange` independently,
are separately invocable, and share the singleton session. `PerioSidebar` is the
working template for what the odontogram controls should become in Tier 3.

## 4. Constraints (non-negotiable)

1. `OdontogramShell`'s public props interface is unchanged; all additions are additive.
2. The default composition renders a **byte-identical DOM** to the current shell.
3. `parity` (SVG fingerprint), FHIR-golden and roundtrip-golden fixtures stay byte-identical.
4. No clinical payload change; payload version does not move.
5. One session shared by all surfaces. Multi-instance is explicitly **not** in scope.
6. No host-specific dependency; the package stays standalone.

## 5. Design

### Tier 1 — composition seams (static placement)

Extract the existing JSX regions of `App.tsx` into exported surface components
that render exactly the markup they render today:

| Component | Region extracted (JSX marker in `App.tsx`) |
|---|---|
| `OdontogramTopbar` | `<header className="topbar">` |
| `OdontogramChartSurface` | `<section className="chart">` |
| `ToothInfoSurface` | `<section className="tooth-info card">` |
| `ToothControlsSurface` | `.panel-odontogram-controls` |

Shared shell state (language, `t`, summary, settings flags, refs, handlers) moves
into an `OdontogramUiContext`, provided by a new `OdontogramProvider`.
`OdontogramShell` becomes `OdontogramProvider` + the current composition, so its
rendered DOM is unchanged.

A host composes surfaces itself:

```tsx
<OdontogramProvider language="en">
  <MyWorkspace>
    <MyMain><OdontogramChartSurface /></MyMain>
    <MySidePanel><ToothControlsSurface /></MySidePanel>
  </MyWorkspace>
</OdontogramProvider>
```

**Constraints a host must observe in Tier 1** (documented, lifted in Tier 2):
- one provider per document (IDs are global);
- every surface must be mounted before `initOdontogram()` completes, and must not
  be unmounted afterwards — hide with CSS instead.

### Tier 2 — mount-order independence

Removes the Tier 1 constraints, and is what makes composition genuinely useful
(a surface in a drawer or tab that mounts on demand).

- Make wiring **idempotent and re-runnable**: replace the single `controlsWired`
  boolean with per-surface registration, so a surface mounting late binds its own
  controls without rebinding already-bound ones.
- Re-run `syncControlsFromState()` for a surface when it mounts.
- Remove the three CSS hide-instead-of-unmount workarounds once wiring survives
  unmount/remount.

Highest-regression-risk tier: double-binding and stale listeners are the failure
modes. The full test suite is the safety net; new tests must cover mount → unmount
→ remount cycles.

### Tier 3 — declarative controls

Convert `wireControls()` + `syncControlsFromState()` (~1050 lines) from
imperative ID-bound DOM manipulation into React that reads engine state via
`onStateChange`, following `PerioSidebar`. Staged one control card at a time
(Statuses, Caries, Fillings, Root/Periodontium, …), each its own PR, each keeping
DOM parity until the card is fully converted.

## 6. Explicitly out of scope

- **"Dirty/cancel behavior" and "structured preview/apply of clinical changes"**
  from the issue text are a **new feature**, not a refactoring step: the concepts
  do not exist in the codebase today (`dirty`, `preview`, `rollback`,
  `transaction`: zero occurrences). They would touch `gateToothEdit`, the most
  safety-critical path in the engine. Tracked separately.
- Multiple independent odontogram instances per page.
- Any visual or behavioral change to the existing shell.

## 7. Verification

Every tier must pass, before commit:

1. `npx tsc -b --noEmit` — clean.
2. `npx vitest run` — full suite green.
3. `npx eslint .` — 0 errors.
4. **DOM-parity fixture** — the shell's rendered markup captured before the
   refactor and asserted identical after it. This is the objective contract that
   "the default composition is unchanged" is measured against.
5. Parity / FHIR-golden / roundtrip-golden fixtures byte-identical.

## 8. PR sequence

| PR | Content | Risk |
|---|---|---|
| 1 | DOM-parity harness + Tier 1 surface extraction + provider | low |
| 2 | Tier 2 re-wireable binding + remove hide-instead-of-unmount workarounds | medium |
| 3…n | Tier 3, one control card per PR | medium, incremental |

Documentation (`CHANGELOG.md`, the 12 language READMEs, minimal `README.md`) is
updated with each PR, per the project's documentation policy.
