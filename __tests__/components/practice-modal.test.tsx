import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock zustand store
const mockClose = vi.fn();
vi.mock("@/store/use-practice-modal", () => ({
  usePracticeModal: () => ({
    isOpen: true,
    close: mockClose,
  }),
}));

// Mock Radix dialog to render children directly (no portal/animation)
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

import { PracticeModal } from "@/components/modals/practice-modal";

describe("PracticeModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display correct text without typo", () => {
    render(<PracticeModal />);

    expect(
      screen.getByText(/You cannot lose hearts or points in practice lessons/),
    ).toBeInTheDocument();
  });

  it("should not contain the misspelling 'loose'", () => {
    render(<PracticeModal />);

    const description = screen.getByText(
      /hearts or points in practice lessons/,
    );
    expect(description.textContent).not.toContain("loose");
  });
});
