import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";

import { SoundToggle } from "@/app/(main)/settings/sound-toggle";
import { _resetMuteCache, isMuted, setMuted } from "@/lib/tts";

describe("SoundToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    _resetMuteCache();
  });

  it("should render On and Off buttons", () => {
    render(<SoundToggle />);

    expect(screen.getByText("On")).toBeInTheDocument();
    expect(screen.getByText("Off")).toBeInTheDocument();
  });

  it("should toggle sound setting", () => {
    render(<SoundToggle />);

    // Default is sound on (unmuted)
    const onButton = screen.getByText("On");
    expect(onButton.className).toContain("border-green-600");

    // Click Off
    const offButton = screen.getByText("Off");
    fireEvent.click(offButton);

    expect(isMuted()).toBe(true);
    expect(localStorage.getItem("yiya-muted")).toBe("true");
    expect(offButton.className).toContain("border-green-600");

    // Click On again
    fireEvent.click(screen.getByText("On"));

    expect(isMuted()).toBe(false);
    expect(localStorage.getItem("yiya-muted")).toBe("false");
  });

  it("should reflect muted state on initial render", () => {
    setMuted(true);

    render(<SoundToggle />);

    const offButton = screen.getByText("Off");
    expect(offButton.className).toContain("border-green-600");
  });
});
