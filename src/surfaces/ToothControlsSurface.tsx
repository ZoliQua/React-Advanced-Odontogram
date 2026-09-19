// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026
//
// Composable surface — the `<div className="panel-odontogram-controls">` region:
// the odontogram control panel (selection actions, Statuses/Tooth/Ortho/Caries/
// Fillings/Root-periodontium cards). Every input node here is a mount point the
// engine wires imperatively via `wireControls()`. Composable-UI Tier 2 made that
// wiring re-runnable (idempotent per-element), so this surface may unmount and
// remount: on each mount it calls `rewireControls()` to wire its fresh nodes.
// Presentational: reads its gates from `useOdontogramUi()`, holds no state.

import { useEffect } from "react";
import { useOdontogramUi } from "../OdontogramContext";
import { rewireControls, resetTooth } from "../odontogram";
import OrthodonticsCard from "./cards/OrthodonticsCard";
import StatusesCard from "./cards/StatusesCard";
import ToothDetailsCard from "./cards/ToothDetailsCard";
import CariesCard from "./cards/CariesCard";
import FillingsCard from "./cards/FillingsCard";
import RootPeriodontiumCard from "./cards/RootPeriodontiumCard";
import DiagnosesCard from "./cards/DiagnosesCard";

export default function ToothControlsSurface() {
  const { t, showStatusCard, showOrthoCard } = useOdontogramUi();

  // Re-wire the imperative controls whenever this surface (re)mounts. No-op on
  // first mount (the provider's init effect runs afterwards and does the first
  // wiring); acts only on later remounts, e.g. returning from the perio view.
  useEffect(() => { rewireControls(); }, []);

  return (
          <div className="panel-odontogram-controls">
          <div className="panel-header">
            <div>
              <div className="panel-title-row">
                <span className="panel-title">{t("panel.controls")}</span>
                <div className="panel-title-actions">
                  <button id="btnSelectNone" className="btn btn-ghost btn-icon btn-danger" title={t("panel.clearSelection")} aria-label={t("panel.clearSelection")}>{t("panel.clearSelection")}</button>
                  <button id="btnToggleControlsCard" className="icon-btn" title={t("actions.collapse", { label: t("panel.controls") })} aria-label={t("actions.collapse", { label: t("panel.controls") })}>
                    <span className="toggle-icon" aria-hidden="true">−</span>
                  </button>
                </div>
              </div>
              <div className="panel-subtitle">{t("panel.activeTooth")}: <span id="activeToothLabel" className="pill">{t("selection.none")}</span></div>
              <div id="controlsActions" className="panel-subtitle select-actions">
                <div className="select-actions-row">
                  <button id="btnSelectAll" className="btn btn-ghost btn-icon" title={t("panel.selectActions.all")}>{t("panel.selectActions.all")}</button>
                  <button id="btnSelectAllPresent" className="btn btn-ghost btn-icon fade-toggle" title={t("panel.selectActions.present")}>{t("panel.selectActions.present")}</button>
                  <button id="btnSelectPermanent" className="btn btn-ghost btn-icon fade-toggle" title={t("panel.selectActions.permanent")}>{t("panel.selectActions.permanent")}</button>
                  <button id="btnSelectMilk" className="btn btn-ghost btn-icon fade-toggle" title={t("panel.selectActions.milk")}>{t("panel.selectActions.milk")}</button>
                  <button id="btnSelectImplants" className="btn btn-ghost btn-icon fade-toggle" title={t("panel.selectActions.implants")}>{t("panel.selectActions.implants")}</button>
                  <button id="btnSelectAllMissing" className="btn btn-ghost btn-icon fade-toggle" title={t("panel.selectActions.missing")}>{t("panel.selectActions.missing")}</button>
                </div>
                <div className="select-actions-row">
                  <button id="btnSelectUpper" className="btn btn-ghost btn-icon" title={t("panel.selectActions.upper")}>{t("panel.selectActions.upper")}</button>
                  <button id="btnSelectUpperFront" className="btn btn-ghost btn-icon" title={t("panel.selectActions.upperFront")}>{t("panel.selectActions.upperFront")}</button>
                  <button id="btnSelectUpperMolar" className="btn btn-ghost btn-icon" title={t("panel.selectActions.upperMolar")}>{t("panel.selectActions.upperMolar")}</button>
                  <button id="btnSelectLower" className="btn btn-ghost btn-icon" title={t("panel.selectActions.lower")}>{t("panel.selectActions.lower")}</button>
                  <button id="btnSelectLowerFront" className="btn btn-ghost btn-icon" title={t("panel.selectActions.lowerFront")}>{t("panel.selectActions.lowerFront")}</button>
                  <button id="btnSelectLowerMolar" className="btn btn-ghost btn-icon" title={t("panel.selectActions.lowerMolar")}>{t("panel.selectActions.lowerMolar")}</button>
                </div>
              </div>
            </div>
            <div id="warnings" className="warnings"></div>
          </div>

          <div className="panel-body">
            <div className={showStatusCard ? "" : "hidden"}>
              <section className="card" id="statusCard">
                <div className="card-title card-title-row">
                  <span>{t("status.title")}</span>
                  <button id="btnToggleStatusCard" className="icon-btn" title={t("actions.collapse", { label: t("status.title") })} aria-label={t("actions.collapse", { label: t("status.title") })}>
                    <span className="toggle-icon" aria-hidden="true">−</span>
                  </button>
                </div>
                <StatusesCard />
              </section>
            </div>

            <section className="card">
              <div className="card-title card-title-row">
                <span>{t("tooth.title")}</span>
                <button id="btnResetTooth" className="btn btn-ghost btn-sm" title={t("tooth.resetTitle")} aria-label={t("tooth.resetTitle")} onClick={() => resetTooth()}>{t("tooth.reset")}</button>
              </div>
              <ToothDetailsCard />
            </section>

            <div className={showOrthoCard ? "" : "hidden"}>
              <OrthodonticsCard />
            </div>

            <section id="cariesSection" className="card">
              <div className="card-title card-title-row">
                <span>{t("caries.title")}</span>
                <button id="btnToggleCariesCard" className="icon-btn" title={t("actions.collapse", { label: t("caries.title") })} aria-label={t("actions.collapse", { label: t("caries.title") })}>
                  <span className="toggle-icon" aria-hidden="true">−</span>
                </button>
              </div>
              <CariesCard />
            </section>

            <section id="fillingSection" className="card">
              <div className="card-title card-title-row">
                <span>{t("filling.title")}</span>
                <button id="btnToggleFillingCard" className="icon-btn" title={t("actions.collapse", { label: t("filling.title") })} aria-label={t("actions.collapse", { label: t("filling.title") })}>
                  <span className="toggle-icon" aria-hidden="true">−</span>
                </button>
              </div>
              <FillingsCard />
            </section>

            <section id="rootPeriodontiumSection" className="card">
              <div className="card-title card-title-row">
                <span>{t("card.rootPeriodontium")}</span>
                <button id="btnToggleRootPeriodontiumCard" className="icon-btn" title={t("actions.collapse", { label: t("card.rootPeriodontium") })} aria-label={t("actions.collapse", { label: t("card.rootPeriodontium") })}>
                  <span className="toggle-icon" aria-hidden="true">−</span>
                </button>
              </div>
              <RootPeriodontiumCard />
            </section>

            <section id="diagnosesSection" className="card">
              <div className="card-title card-title-row">
                <span>{t("card.diagnoses")}</span>
                <button id="btnToggleDiagnosesCard" className="icon-btn" title={t("actions.collapse", { label: t("card.diagnoses") })} aria-label={t("actions.collapse", { label: t("card.diagnoses") })}>
                  <span className="toggle-icon" aria-hidden="true">−</span>
                </button>
              </div>
              <DiagnosesCard />
            </section>

          </div>
          </div>
  );
}
