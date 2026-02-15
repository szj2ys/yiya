import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { ExplanationPanel } from "@/components/explanation-panel";

const trackSpy = vi.fn();

vi.mock("@/lib/analytics", () => ({
  track: (...args: unknown[]) => trackSpy(...args),
}));

describe("ExplanationPanel", () => {
  it("should render explanation content", () => {
    render(
      <ExplanationPanel
        challengeId={123}
        loading={false}
        explanation={{
          explanation: "Because...",
          rule: "Rule...",
          tip: "Tip...",
          examples: [
            { source: "A", translation: "B" },
            { source: "C", translation: "D" },
          ],
          cached: false,
        }}
        onDismiss={() => undefined}
        onPractice={() => undefined}
      />,
    );

    expect(screen.getByText("Because...")).toBeInTheDocument();
    expect(screen.getByText("Rule...")).toBeInTheDocument();
    expect(screen.getByText("Tip...")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("should show skeleton when loading", () => {
    const { container } = render(
      <ExplanationPanel
        challengeId={123}
        loading={true}
        explanation={null}
        onDismiss={() => undefined}
        onPractice={() => undefined}
      />,
    );

    // We rely on animate-pulse skeleton divs.
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("should call onDismiss when Got it clicked", () => {
    const onDismiss = vi.fn();
    render(
      <ExplanationPanel
        challengeId={123}
        loading={false}
        explanation={{
          explanation: "Because...",
          rule: "Rule...",
          tip: "Tip...",
          examples: [],
          cached: false,
        }}
        onDismiss={onDismiss}
        onPractice={() => undefined}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Got it" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
