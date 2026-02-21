import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { Header } from "@/app/lesson/header";
import { _resetMuteCache, setMuted, isMuted } from "@/lib/tts";

vi.mock("@/store/use-exit-modal", () => ({
  useExitModal: () => ({ open: vi.fn() }),
}));

vi.mock("@/components/ui/progress", () => ({
  Progress: ({ value }: { value: number }) => (
    <div data-testid="progress" data-value={value} />
  ),
}));

describe("Header mute button", () => {
  beforeEach(() => {
    localStorage.clear();
    _resetMuteCache();
  });

  it("should render Volume2 icon when unmuted", () => {
    render(
      <Header hearts={5} percentage={50} hasActiveSubscription={false} />,
    );

    const button = screen.getByRole("button", { name: /mute sound/i });
    expect(button).toBeInTheDocument();
  });

  it("should toggle mute icon on click", () => {
    render(
      <Header hearts={5} percentage={50} hasActiveSubscription={false} />,
    );

    const button = screen.getByRole("button", { name: /mute sound/i });
    fireEvent.click(button);

    expect(isMuted()).toBe(true);
    expect(screen.getByRole("button", { name: /unmute sound/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /unmute sound/i }));
    expect(isMuted()).toBe(false);
    expect(screen.getByRole("button", { name: /mute sound/i })).toBeInTheDocument();
  });

  it("should initialize as muted when localStorage says muted", () => {
    setMuted(true);

    render(
      <Header hearts={5} percentage={50} hasActiveSubscription={false} />,
    );

    expect(screen.getByRole("button", { name: /unmute sound/i })).toBeInTheDocument();
  });
});
