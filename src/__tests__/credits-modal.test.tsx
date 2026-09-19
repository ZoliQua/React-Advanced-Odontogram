// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import CreditsModal from "../CreditsModal";

const t = (k: string) => k; // structural stub — assert on keys + hardcoded handles

afterEach(cleanup);

const HANDLES = ["ZoliQua", "odontodev", "JulianoBazzi", "yassine-bhn", "saegerdirk-star"];

describe("CreditsModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<CreditsModal open={false} t={t} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("is a labelled modal dialog when open", () => {
    render(<CreditsModal open t={t} onClose={() => {}} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby");
  });

  it("links every human contributor to their GitHub profile", () => {
    render(<CreditsModal open t={t} onClose={() => {}} />);
    for (const h of HANDLES) {
      const link = screen.getByRole("link", { name: `@${h}` });
      expect(link).toHaveAttribute("href", `https://github.com/${h}`);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    }
  });

  it("separates the creator from the other contributors", () => {
    render(<CreditsModal open t={t} onClose={() => {}} />);
    // Both section headings render (Creator/Main developer, then Contributors).
    expect(screen.getByText("credits.creatorTitle")).toBeInTheDocument();
    expect(screen.getByText("credits.contributorsTitle")).toBeInTheDocument();
    // The creator (ZoliQua) is listed under the creator heading, not the
    // contributors list: it precedes the first contributor in DOM order.
    const zoliqua = screen.getByRole("link", { name: "@ZoliQua" });
    const odontodev = screen.getByRole("link", { name: "@odontodev" });
    expect(zoliqua.compareDocumentPosition(odontodev) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("never credits Claude / the AI assistant", () => {
    const { container } = render(<CreditsModal open t={t} onClose={() => {}} />);
    expect(container.textContent ?? "").not.toMatch(/claude|assistant|\bAI\b/i);
    expect(container.innerHTML).not.toMatch(/github\.com\/(claude|anthropic)/i);
  });

  it("has a Star on GitHub badge pointing at the repo", () => {
    render(<CreditsModal open t={t} onClose={() => {}} />);
    const star = screen.getByRole("link", { name: /credits\.star/ });
    expect(star).toHaveAttribute("href", "https://github.com/ZoliQua/React-Advanced-Odontogram");
  });

  it("closes on the close button and on Escape", () => {
    const onClose = vi.fn();
    render(<CreditsModal open t={t} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "credits.close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
