// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { expect, type Page } from "@playwright/test";

export const UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
export const LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

export type Box = { x: number; y: number; width: number; height: number };

/** Open the demo and wait until the chart has actually drawn its teeth. */
export async function openChart(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.locator('#toothGrid .tooth-tile.side-view[data-tooth="11"]')).toBeVisible();
}

/** The rendered box of each tooth's side-view tile, in the given order. */
export async function sideTiles(page: Page, teeth: number[]): Promise<Box[]> {
  const boxes: Box[] = [];
  for (const n of teeth) {
    const box = await page.locator(`#toothGrid .tooth-tile.side-view[data-tooth="${n}"]`).first().boundingBox();
    expect(box, `tooth ${n} has no rendered box`).not.toBeNull();
    boxes.push(box!);
  }
  return boxes;
}

/**
 * The teeth form ONE row, left to right in the given order, without overlapping.
 * This is the property the measured-anatomy layout collapse broke: every tile
 * stacked into a single column, each one individually still "visible".
 */
export function expectOneRow(boxes: Box[], label: string): void {
  for (const b of boxes) {
    expect(b.width, `${label}: a tile collapsed to no width`).toBeGreaterThan(8);
    expect(b.height, `${label}: a tile collapsed to no height`).toBeGreaterThan(8);
  }
  for (let i = 1; i < boxes.length; i++) {
    const prev = boxes[i - 1], cur = boxes[i];
    expect(cur.x, `${label}: tile ${i} is not to the right of tile ${i - 1}`).toBeGreaterThanOrEqual(prev.x + prev.width - 1);
  }
  const top = boxes.map((b) => b.y + b.height / 2);
  expect(Math.max(...top) - Math.min(...top), `${label}: the tiles are not on one row`).toBeLessThan(boxes[0].height / 2);
}

/** Open the language menu and pick a language by its English name. */
export async function chooseLanguage(page: Page, englishName: RegExp): Promise<void> {
  await page.locator("#languageMenu").getByRole("button").first().click();
  await page.getByRole("menuitemradio", { name: englishName }).click();
}
