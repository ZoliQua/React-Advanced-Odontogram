// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { t } from "./i18n/useI18n";

export interface TourStep {
  /** CSS selector for the element to highlight. Empty string centers the card. */
  selector: string;
  titleKey: string;
  textKey: string;
  /**
   * The app view this step wants to be in. The tour switches to it before
   * highlighting (idempotent — a no-op when the view is already active or when
   * the perio chart is disabled and the toggle is absent).
   */
  view?: "odontogram" | "perio";
  /** When present and false, the step is skipped during navigation. */
  available?: () => boolean;
}

/** The perio steps only make sense when the periodontal view toggle is present
 *  (the perio chart is enabled in Settings). */
function perioAvailable(): boolean {
  return !!document.getElementById("appViewToggle");
}

/** The case/regional-diagnoses step targets its own launch-bar button, which is
 *  present whenever the perio chart is enabled — in toggle AND popup mode — so it
 *  is gated on the button itself rather than on the view toggle. */
function caseDiagnosesAvailable(): boolean {
  return !!document.getElementById("openCaseDiagnosesBtn");
}

export const TOUR_STEPS: TourStep[] = [
  { selector: "#toothGrid, .tooth-grid", titleKey: "intro.tooth.title",     textKey: "intro.tooth.text",     view: "odontogram" },
  { selector: "#cariesSection",          titleKey: "intro.caries.title",    textKey: "intro.caries.text",    view: "odontogram" },
  { selector: "#pulpEndoSelect",         titleKey: "intro.pulp.title",      textKey: "intro.pulp.text",      view: "odontogram" },
  { selector: "#rootPeriodontiumSection",titleKey: "intro.rootCanal.title", textKey: "intro.rootCanal.text", view: "odontogram" },
  { selector: "#diagnosesSection",       titleKey: "intro.diagnoses.title", textKey: "intro.diagnoses.text", view: "odontogram" },
  { selector: "#openCaseDiagnosesBtn",   titleKey: "intro.caseDiagnoses.title", textKey: "intro.caseDiagnoses.text", view: "odontogram", available: caseDiagnosesAvailable },
  { selector: "#toothSelect",            titleKey: "intro.implant.title",   textKey: "intro.implant.text",   view: "odontogram" },
  { selector: "#fillingSection",         titleKey: "intro.filling.title",   textKey: "intro.filling.text",   view: "odontogram" },
  { selector: "#restorationSelect",      titleKey: "intro.crown.title",     textKey: "intro.crown.text",     view: "odontogram" },
  { selector: "#toothGrid, .tooth-grid", titleKey: "intro.note.title",      textKey: "intro.note.text",      view: "odontogram" },
  { selector: "#controlsActions",        titleKey: "intro.selection.title", textKey: "intro.selection.text", view: "odontogram" },
  { selector: "#languageMenu",           titleKey: "intro.language.title",  textKey: "intro.language.text",  view: "odontogram" },
  { selector: "#btnSettingsMenu",        titleKey: "intro.settings.title",  textKey: "intro.settings.text",  view: "odontogram" },
  { selector: "#appViewToggle",          titleKey: "intro.perioView.title", textKey: "intro.perioView.text", view: "perio", available: perioAvailable },
  { selector: "#perioInlinePanel",       titleKey: "intro.perioChart.title",textKey: "intro.perioChart.text",view: "perio", available: perioAvailable },
  { selector: "#btnExportMenu",          titleKey: "intro.export.title",    textKey: "intro.export.text",    view: "odontogram" },
  { selector: "#btnImportMenu",          titleKey: "intro.import.title",    textKey: "intro.import.text",    view: "odontogram" },
  { selector: "",                        titleKey: "intro.done.title",      textKey: "intro.done.text",      view: "odontogram" },
];

export function clampStep(i: number): number {
  return Math.max(0, Math.min(TOUR_STEPS.length - 1, i));
}

const raf: (cb: () => void) => void =
  typeof requestAnimationFrame === "function"
    ? (cb) => requestAnimationFrame(cb)
    : (cb) => { setTimeout(cb, 16); };

let tourEls: HTMLElement[] = [];
let tourIndex = 0;
let keyHandler: ((e: KeyboardEvent) => void) | null = null;
// Incremented on every render so a deferred (rAF) highlight from a superseded
// step never draws over the current one.
let generation = 0;

/** Remove only the overlay DOM — NOT the key handler. Used between renders so
 *  keyboard stepping survives a re-render (the original bug: the shared cleanup
 *  nulled the handler on the first render, killing arrow navigation). */
function clearEls(){
  for(const el of tourEls) el.remove();
  tourEls = [];
}

/** Full teardown: remove the overlay AND unbind keys. Used by Skip/Finish/Escape. */
function cleanup(){
  generation++;
  clearEls();
  if(keyHandler){ document.removeEventListener("keydown", keyHandler); keyHandler = null; }
}

function stepAvailable(i: number): boolean {
  const s = TOUR_STEPS[i];
  return !s.available || s.available();
}

/** Next available step index in a direction, or the current index if none. */
function nextAvailable(from: number, dir: 1 | -1): number {
  let i = from + dir;
  while(i >= 0 && i < TOUR_STEPS.length && !stepAvailable(i)) i += dir;
  if(i < 0 || i >= TOUR_STEPS.length) return from;
  return i;
}

/** Indices of the steps that will actually be shown, for the "x / n" counter. */
function availableIndices(): number[] {
  const out: number[] = [];
  for(let i = 0; i < TOUR_STEPS.length; i++) if(stepAvailable(i)) out.push(i);
  return out;
}

function makeEl(tag: string, cls: string, text?: string): HTMLElement {
  const n = document.createElement(tag);
  n.className = cls;
  if(text !== undefined) n.textContent = text;
  return n;
}

/** Switch the app into the view a step wants, by clicking the real toggle
 *  button so React state updates. No-op when already active or when the perio
 *  toggle is absent (perio disabled → only the odontogram view exists). */
function ensureView(view: TourStep["view"]){
  if(!view) return;
  const toggle = document.getElementById("appViewToggle");
  if(!toggle) return;
  const btnId = view === "perio" ? "appViewDentalChart" : "appViewOdontogram";
  const btn = document.getElementById(btnId) as HTMLButtonElement | null;
  if(btn && !btn.classList.contains("is-active")) btn.click();
}

/** Position the highlight box + card near the target. The target may only exist
 *  after a view switch re-renders, so retry a few animation frames before
 *  falling back to a centered card. */
function locate(step: TourStep, card: HTMLElement, gen: number, attempt: number){
  if(gen !== generation) return; // superseded by a newer render
  const target = step.selector ? (document.querySelector(step.selector) as HTMLElement | null) : null;
  if(target){
    target.scrollIntoView({ block: "center", inline: "center" });
    const r = target.getBoundingClientRect();
    const hl = makeEl("div", "odon-tour-highlight");
    hl.style.left = `${r.left - 6}px`;
    hl.style.top = `${r.top - 6}px`;
    hl.style.width = `${r.width + 12}px`;
    hl.style.height = `${r.height + 12}px`;
    document.body.appendChild(hl);
    tourEls.push(hl);
    const top = Math.min(r.bottom + 12, window.innerHeight - 220);
    const left = Math.min(Math.max(8, r.left), window.innerWidth - 320);
    card.style.top = `${Math.max(8, top)}px`;
    card.style.left = `${left}px`;
    card.classList.remove("odon-tour-card-center");
  }else if(step.selector && attempt < 5){
    raf(() => locate(step, card, gen, attempt + 1));
  }else{
    card.classList.add("odon-tour-card-center");
  }
}

function render(){
  clearEls();
  const gen = ++generation;
  const step = TOUR_STEPS[tourIndex];
  ensureView(step.view);

  const backdrop = makeEl("div", "odon-tour-backdrop");
  document.body.appendChild(backdrop);
  tourEls.push(backdrop);

  const avail = availableIndices();
  const shownPos = Math.max(0, avail.indexOf(tourIndex)) + 1;
  const isLast = avail.length > 0 && tourIndex === avail[avail.length - 1];
  const isFirst = avail.length > 0 && tourIndex === avail[0];

  const card = makeEl("div", "odon-tour-card");
  const counter = makeEl("div", "odon-tour-counter", `${shownPos} / ${avail.length}`);
  const title = makeEl("div", "odon-tour-title", t(step.titleKey));
  const text = makeEl("div", "odon-tour-text", t(step.textKey));
  const actions = makeEl("div", "odon-tour-actions");
  const skip = makeEl("button", "odon-tour-btn odon-tour-skip", t("intro.skip"));
  const back = makeEl("button", "odon-tour-btn", t("intro.back"));
  const next = makeEl("button", "odon-tour-btn odon-tour-next", isLast ? t("intro.finish") : t("intro.next"));
  skip.onclick = cleanup;
  back.onclick = () => { tourIndex = nextAvailable(tourIndex, -1); render(); };
  next.onclick = () => { if(isLast){ cleanup(); } else { tourIndex = nextAvailable(tourIndex, 1); render(); } };
  (back as HTMLButtonElement).disabled = isFirst;
  actions.append(skip, back, next);
  card.append(counter, title, text, actions);
  document.body.appendChild(card);
  tourEls.push(card);
  // Center immediately; locate() repositions once the target is measurable.
  card.classList.add("odon-tour-card-center");

  locate(step, card, gen, 0);
}

/** Start the interactive intro tour. */
export function startIntroTour(){
  // Begin at the first available step (skip any leading unavailable ones).
  tourIndex = stepAvailable(0) ? 0 : nextAvailable(0, 1);
  if(keyHandler) document.removeEventListener("keydown", keyHandler);
  keyHandler = (e: KeyboardEvent) => {
    if(e.key === "Escape"){ cleanup(); }
    else if(e.key === "ArrowRight"){ e.preventDefault(); tourIndex = nextAvailable(tourIndex, 1); render(); }
    else if(e.key === "ArrowLeft"){ e.preventDefault(); tourIndex = nextAvailable(tourIndex, -1); render(); }
  };
  document.addEventListener("keydown", keyHandler);
  render();
}
