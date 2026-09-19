// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// UI-4: collapsible card state — session-only UI layout flag (never serialized
// to the export payload, same convention as perioViewMode). Exercised via the
// module-level get/set/toggle/reset API.
import { describe, it, expect, beforeEach } from "vitest";
import {
  getCollapsedCards, isCardCollapsed, setCollapsedCard, toggleCollapsedCard,
  __resetChartStateForTest,
} from "../odontogram";

beforeEach(() => __resetChartStateForTest());

describe("collapsed cards state", () => {
  it("default state is empty", () => {
    const cards = getCollapsedCards();
    expect(Object.keys(cards)).toHaveLength(0);
  });

  it("getCollapsedCards returns a copy, not a reference", () => {
    const cards1 = getCollapsedCards();
    cards1.controls = true;
    // mutating the returned object must not affect module state
    const cards3 = getCollapsedCards();
    expect(cards3.controls).toBeUndefined();
  });

  it("isCardCollapsed returns false for unknown card IDs", () => {
    expect(isCardCollapsed("nonexistent")).toBe(false);
    expect(isCardCollapsed("bogus")).toBe(false);
  });

  it("isCardCollapsed returns false for default state", () => {
    expect(isCardCollapsed("controls")).toBe(false);
    expect(isCardCollapsed("status")).toBe(false);
    expect(isCardCollapsed("caries")).toBe(false);
    expect(isCardCollapsed("filling")).toBe(false);
    expect(isCardCollapsed("rootPeriodontium")).toBe(false);
  });

  it("setCollapsedCard sets a card's state", () => {
    setCollapsedCard("caries", true);
    expect(isCardCollapsed("caries")).toBe(true);
    expect(getCollapsedCards().caries).toBe(true);
  });

  it("setCollapsedCard with false clears a card's state", () => {
    setCollapsedCard("caries", true);
    setCollapsedCard("caries", false);
    expect(isCardCollapsed("caries")).toBe(false);
    expect(getCollapsedCards().caries).toBe(false);
  });

  it("setCollapsedCard with invalid ID is a no-op", () => {
    setCollapsedCard("bogus", true);
    expect(Object.keys(getCollapsedCards())).toHaveLength(0);
  });

  it("toggleCollapsedCard flips the state", () => {
    expect(isCardCollapsed("filling")).toBe(false);
    toggleCollapsedCard("filling");
    expect(isCardCollapsed("filling")).toBe(true);
    toggleCollapsedCard("filling");
    expect(isCardCollapsed("filling")).toBe(false);
  });

  it("toggleCollapsedCard with invalid ID is a no-op", () => {
    toggleCollapsedCard("bogus");
    expect(Object.keys(getCollapsedCards())).toHaveLength(0);
  });

  it("all valid card IDs can be set independently", () => {
    setCollapsedCard("controls", true);
    setCollapsedCard("status", false);
    setCollapsedCard("caries", true);
    setCollapsedCard("filling", false);
    setCollapsedCard("rootPeriodontium", true);
    const cards = getCollapsedCards();
    expect(cards.controls).toBe(true);
    expect(cards.status).toBe(false);
    expect(cards.caries).toBe(true);
    expect(cards.filling).toBe(false);
    expect(cards.rootPeriodontium).toBe(true);
  });
});

describe("session behavior", () => {
  it("reset clears collapsed state", () => {
    setCollapsedCard("caries", true);
    __resetChartStateForTest();
    expect(Object.keys(getCollapsedCards())).toHaveLength(0);
  });

  it("setCollapsedCard same value is a no-op but still notifies", () => {
    setCollapsedCard("caries", true);
    const afterSet = getCollapsedCards().caries;
    setCollapsedCard("caries", true); // same value — no-op, but notifies
    expect(getCollapsedCards().caries).toBe(afterSet);
  });

  it("setCollapsedCard with false stores false (not absent)", () => {
    setCollapsedCard("status", false);
    expect(getCollapsedCards().status).toBe(false);
    expect(isCardCollapsed("status")).toBe(false);
  });

  it("state survives reset->set cycle (session lifecycle)", () => {
    setCollapsedCard("caries", true);
    __resetChartStateForTest();
    expect(Object.keys(getCollapsedCards())).toHaveLength(0);
    setCollapsedCard("caries", true);
    expect(isCardCollapsed("caries")).toBe(true);
    setCollapsedCard("controls", true);
    expect(isCardCollapsed("controls")).toBe(true);
    expect(isCardCollapsed("caries")).toBe(true);
  });
});
