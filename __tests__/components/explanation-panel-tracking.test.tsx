import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { ExplanationPanel } from "@/components/explanation-panel";

const trackSpy = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/analytics", () => ({
  track: (...args: unknown[]) => trackSpy(...args),
}));

describe("ExplanationPanel tracking", () => {
  it("should track explanation_view on render", async () => {
    render(
      <ExplanationPanel
        challengeId={42}
        loading={false}
        explanation={{
          explanation: "E",
          rule: "R",
          tip: "T",
          examples: [],
          cached: true,
        }}
        onDismiss={() => undefined}
        onPractice={() => undefined}
      />,
    );

    expect(trackSpy).toHaveBeenCalledWith("explanation_view", {
      challenge_id: 42,
      cached: true,
    });
  });

  it("should track explanation_practice_click on button click", async () => {
    const onPractice = vi.fn();

    render(
      <ExplanationPanel
        challengeId={42}
        loading={false}
        explanation={{
          explanation: "E",
          rule: "R",
          tip: "T",
          examples: [],
          cached: false,
        }}
        onDismiss={() => undefined}
        onPractice={onPractice}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Practice this rule →" }));

    expect(trackSpy).toHaveBeenCalledWith("explanation_practice_click", {
      challenge_id: 42,
    });
    expect(onPractice).toHaveBeenCalledTimes(1);
  });
});
