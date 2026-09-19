// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import {
  initOdontogram,
  destroyOdontogram,
  setNumberingSystem,
  getChartMode,
  setChartMode,
  getStatusChart,
  getPlanChart,
  setPlanChart,
  getPlanChanges,
  openPerioOverlay,
  closePerioOverlay,
  isPerioOverlayOpen,
  hasAnyPerioData,
  exportStatus,
  importStatus,
  exportPdf,
  exportPerioImage,
  exportPerioSvg,
  enablePersistence,
  disablePersistence,
  clearPersistedState,
  isPersistenceEnabled,
  OdontogramProvider,
  useOdontogramUi,
  OdontogramTopbar,
  OdontogramChartSurface,
  ToothInfoSurface,
  ToothControlsSurface,
} from "../App";

describe("public API exports — App.tsx re-exports", () => {
  it("exports lifecycle functions", () => {
    expect(initOdontogram).toBeDefined();
    expect(typeof initOdontogram).toBe("function");
    expect(destroyOdontogram).toBeDefined();
    expect(typeof destroyOdontogram).toBe("function");
  });

  it("exports chart-mode control functions", () => {
    expect(getChartMode).toBeDefined();
    expect(typeof getChartMode).toBe("function");
    expect(setChartMode).toBeDefined();
    expect(typeof setChartMode).toBe("function");
  });

  it("exports state serialization functions", () => {
    expect(getStatusChart).toBeDefined();
    expect(typeof getStatusChart).toBe("function");
    expect(getPlanChart).toBeDefined();
    expect(typeof getPlanChart).toBe("function");
    expect(setPlanChart).toBeDefined();
    expect(typeof setPlanChart).toBe("function");
  });

  it("exports plan-diff function", () => {
    expect(getPlanChanges).toBeDefined();
    expect(typeof getPlanChanges).toBe("function");
  });

  it("exports numbering system setter", () => {
    expect(setNumberingSystem).toBeDefined();
    expect(typeof setNumberingSystem).toBe("function");
  });

  it("exports perio overlay control functions", () => {
    expect(openPerioOverlay).toBeDefined();
    expect(typeof openPerioOverlay).toBe("function");
    expect(closePerioOverlay).toBeDefined();
    expect(typeof closePerioOverlay).toBe("function");
    expect(isPerioOverlayOpen).toBeDefined();
    expect(typeof isPerioOverlayOpen).toBe("function");
  });

  it("exports perio data presence check", () => {
    expect(hasAnyPerioData).toBeDefined();
    expect(typeof hasAnyPerioData).toBe("function");
  });

  it("exports JSON import/export functions", () => {
    expect(exportStatus).toBeDefined();
    expect(typeof exportStatus).toBe("function");
    expect(importStatus).toBeDefined();
    expect(typeof importStatus).toBe("function");
  });

  it("exports periodontal export format functions", () => {
    expect(exportPdf).toBeDefined();
    expect(typeof exportPdf).toBe("function");
    expect(exportPerioImage).toBeDefined();
    expect(typeof exportPerioImage).toBe("function");
    expect(exportPerioSvg).toBeDefined();
    expect(typeof exportPerioSvg).toBe("function");
  });

  it("exports persistence control functions", () => {
    expect(enablePersistence).toBeDefined();
    expect(typeof enablePersistence).toBe("function");
    expect(disablePersistence).toBeDefined();
    expect(typeof disablePersistence).toBe("function");
    expect(clearPersistedState).toBeDefined();
    expect(typeof clearPersistedState).toBe("function");
    expect(isPersistenceEnabled).toBeDefined();
    expect(typeof isPersistenceEnabled).toBe("function");
  });

  it("exports the composable-UI provider, hook, and surface components", () => {
    expect(typeof OdontogramProvider).toBe("function");
    expect(typeof useOdontogramUi).toBe("function");
    expect(typeof OdontogramTopbar).toBe("function");
    expect(typeof OdontogramChartSurface).toBe("function");
    expect(typeof ToothInfoSurface).toBe("function");
    expect(typeof ToothControlsSurface).toBe("function");
  });
});
