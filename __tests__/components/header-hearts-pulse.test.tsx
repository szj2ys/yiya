import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

vi.mock("@/components/ui/progress", () => ({
  Progress: () => <div data-testid="progress" />,
}));

vi.mock("@/store/use-exit-modal", () => ({
  useExitModal: () => ({ open: vi.fn() }),
}));

vi.mock("@/lib/tts", () => ({
  isMuted: () => false,
  toggleMute: vi.fn(),
}));

vi.mock("lucide-react", () => ({
  InfinityIcon: (props: any) => <span data-testid="infinity" {...props} />,
  Volume2: (props: any) => <span data-testid="volume2" {...props} />,
  VolumeX: (props: any) => <span data-testid="volumex" {...props} />,
  X: (props: any) => <span data-testid="x" {...props} />,
}));

import { Header } from "@/app/lesson/header";

describe("Header hearts pulse animation", () => {
  it("should add pulse animation to hearts when hearts equals 1 and not pro", () => {
    render(
      <Header hearts={1} percentage={50} hasActiveSubscription={false} />,
    );

    const heartsDisplay = screen.getByTestId("hearts-display");
    expect(heartsDisplay.className).toContain("animate-pulse");
  });

  it("should not add pulse animation when hearts greater than 1", () => {
    render(
      <Header hearts={2} percentage={50} hasActiveSubscription={false} />,
    );

    const heartsDisplay = screen.getByTestId("hearts-display");
    expect(heartsDisplay.className).not.toContain("animate-pulse");
  });

  it("should not add pulse animation when user has active subscription", () => {
    render(
      <Header hearts={1} percentage={50} hasActiveSubscription={true} />,
    );

    const heartsDisplay = screen.getByTestId("hearts-display");
    expect(heartsDisplay.className).not.toContain("animate-pulse");
  });

  it("should not add pulse animation when hearts equals 0", () => {
    render(
      <Header hearts={0} percentage={50} hasActiveSubscription={false} />,
    );

    const heartsDisplay = screen.getByTestId("hearts-display");
    expect(heartsDisplay.className).not.toContain("animate-pulse");
  });
});
