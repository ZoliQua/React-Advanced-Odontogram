// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// UI-3b Task 7: `ExportOptionsModal` — PDF export-settings dialog. Mirrors
// `DualStateConfirm.tsx`'s dialog contract (backdrop/modal classes,
// role="dialog", focus-trap, Esc/backdrop close); see
// `ds1-confirm.test.ts`/`ds1-confirm-revert.test.tsx` for that contract's own
// coverage — this suite focuses on T7's own behavior: the four
// patient-data/odontogram/perio-status/perio-description checkboxes
// (default ON), auto-disabling the two perio checkboxes when there is no
// perio data charted, and calling `exportPdf()` with the chosen opts.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import ExportOptionsModal from "../ExportOptionsModal";
import * as odo from "../odontogram";

const t = (k: string) => k;

afterEach(cleanup);

describe("UI-3b T7: export options modal", () => {
  beforeEach(() => odo.__resetChartStateForTest());

  it("disables perio toggles when there is no perio data", () => {
    render(createElement(ExportOptionsModal, { open: true, t, onClose: () => {} }));
    const perioStatus = screen.getByLabelText("export.options.perioStatus") as HTMLInputElement;
    const perioDescription = screen.getByLabelText("export.options.perioDescription") as HTMLInputElement;
    expect(perioStatus.disabled).toBe(true);
    expect(perioDescription.disabled).toBe(true);
    expect(screen.getByText("export.options.noPerio")).toBeTruthy();
  });

  it("leaves perio toggles enabled when perio data exists", () => {
    odo.setPerioSite(11, "MB", { pd: 4 });
    render(createElement(ExportOptionsModal, { open: true, t, onClose: () => {} }));
    const perioStatus = screen.getByLabelText("export.options.perioStatus") as HTMLInputElement;
    expect(perioStatus.disabled).toBe(false);
    expect(screen.queryByText("export.options.noPerio")).toBeNull();
  });

  it("calls exportPdf with the chosen opts on Export", () => {
    const spy = vi.spyOn(odo, "exportPdf").mockResolvedValue();
    odo.setPerioSite(11, "MB", { pd: 4 });
    render(createElement(ExportOptionsModal, { open: true, t, onClose: () => {} }));
    fireEvent.click(screen.getByText("export.options.export"));
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        patientData: true,
        odontogramChart: true,
        odontogramDescription: true,
        // no tooth has a note in this fixture → forced off regardless of checkbox
        individualNotes: false,
        perioStatus: true,
        perioDescription: true,
      }),
    );
    spy.mockRestore();
  });

  it("2.2.1: disables the individual-notes checkbox when no tooth has a note", () => {
    render(createElement(ExportOptionsModal, { open: true, t, onClose: () => {} }));
    const notes = screen.getByLabelText("toothInfo.notes") as HTMLInputElement;
    expect(notes.disabled).toBe(true);
  });

  it("forces perio opts off when there is no perio data, even if the checkboxes were left checked", () => {
    const spy = vi.spyOn(odo, "exportPdf").mockResolvedValue();
    render(createElement(ExportOptionsModal, { open: true, t, onClose: () => {} }));
    fireEvent.click(screen.getByText("export.options.export"));
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ perioStatus: false, perioDescription: false, individualNotes: false }),
    );
    spy.mockRestore();
  });

  it("Cancel closes without calling exportPdf", () => {
    const spy = vi.spyOn(odo, "exportPdf").mockResolvedValue();
    const onClose = vi.fn();
    render(createElement(ExportOptionsModal, { open: true, t, onClose }));
    fireEvent.click(screen.getByText("export.options.cancel"));
    expect(spy).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("Escape closes the dialog", () => {
    const onClose = vi.fn();
    render(createElement(ExportOptionsModal, { open: true, t, onClose }));
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("backdrop click closes the dialog", () => {
    const onClose = vi.fn();
    const { container } = render(createElement(ExportOptionsModal, { open: true, t, onClose }));
    const backdrop = container.querySelector(".odon-confirm-backdrop") as HTMLElement;
    fireEvent.mouseDown(backdrop, { target: backdrop });
    expect(onClose).toHaveBeenCalled();
  });

  it("renders nothing when closed", () => {
    const { container } = render(createElement(ExportOptionsModal, { open: false, t, onClose: () => {} }));
    expect(container.querySelector(".odon-confirm-backdrop")).toBeNull();
  });
});
