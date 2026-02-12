import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

const trackSpy = vi.fn().mockResolvedValue(undefined);

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

vi.mock("@/lib/analytics", () => ({ track: trackSpy }));

vi.mock("@/store/use-hearts-modal", () => ({
  useHeartsModal: () => ({ isOpen: true, close: vi.fn() }),
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
  Button: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img alt={props.alt} />,
}));

describe("HeartsModal analytics", () => {
  it("should track paywall_view when hearts modal opens", async () => {
    const { HeartsModal } = await import("@/components/modals/hearts-modal");

    render(<HeartsModal />);

    expect(trackSpy).toHaveBeenCalledWith("paywall_view", { surface: "hearts_modal" });
  });
});

