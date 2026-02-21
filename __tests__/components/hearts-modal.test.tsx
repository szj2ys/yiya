import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

const pushSpy = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushSpy }) }));

const trackSpy = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/analytics", async () => {
  const actual = await vi.importActual<typeof import("@/lib/analytics")>(
    "@/lib/analytics",
  );
  return { ...actual, track: trackSpy };
});

const closeSpy = vi.fn();
vi.mock("@/store/use-hearts-modal", () => ({
  useHeartsModal: () => ({ isOpen: true, close: closeSpy }),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img alt={props.alt} />,
}));

beforeEach(() => {
  pushSpy.mockClear();
  closeSpy.mockClear();
  trackSpy.mockClear();
});

describe("HeartsModal", () => {
  it("should render practice-to-earn button as primary CTA", async () => {
    const { HeartsModal } = await import("@/components/modals/hearts-modal");
    render(<HeartsModal />);

    const practiceBtn = screen.getByText("Practice to earn hearts");
    expect(practiceBtn).toBeInTheDocument();

    // "Practice to earn hearts" should come before "Get unlimited hearts"
    const buttons = screen.getAllByRole("button");
    const practiceIdx = buttons.findIndex((b) => b.textContent === "Practice to earn hearts");
    const upgradeIdx = buttons.findIndex((b) => b.textContent === "Get unlimited hearts");
    const notNowIdx = buttons.findIndex((b) => b.textContent === "Not now");

    expect(practiceIdx).toBeLessThan(upgradeIdx);
    expect(upgradeIdx).toBeLessThan(notNowIdx);
  });

  it("should navigate to /practice when practice button clicked", async () => {
    const { HeartsModal } = await import("@/components/modals/hearts-modal");
    render(<HeartsModal />);

    fireEvent.click(screen.getByText("Practice to earn hearts"));

    expect(closeSpy).toHaveBeenCalled();
    expect(pushSpy).toHaveBeenCalledWith("/practice");
  });

  it("should navigate to /shop when upgrade button clicked", async () => {
    const { HeartsModal } = await import("@/components/modals/hearts-modal");
    render(<HeartsModal />);

    fireEvent.click(screen.getByText("Get unlimited hearts"));

    expect(closeSpy).toHaveBeenCalled();
    expect(pushSpy).toHaveBeenCalledWith("/shop");
  });

  it("should close modal when Not now button clicked", async () => {
    const { HeartsModal } = await import("@/components/modals/hearts-modal");
    render(<HeartsModal />);

    fireEvent.click(screen.getByText("Not now"));

    expect(closeSpy).toHaveBeenCalled();
    expect(pushSpy).not.toHaveBeenCalled();
  });

  it("should show warm title copy", async () => {
    const { HeartsModal } = await import("@/components/modals/hearts-modal");
    render(<HeartsModal />);

    expect(
      screen.getByText("Take a breath — you can earn hearts back"),
    ).toBeInTheDocument();
  });
});
