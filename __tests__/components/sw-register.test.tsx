import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { ServiceWorkerRegister } from "@/components/sw-register";

describe("ServiceWorkerRegister", () => {
  let registerSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    registerSpy = vi.fn().mockResolvedValue({
      addEventListener: vi.fn(),
    });

    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        register: registerSpy,
        controller: null,
        ready: Promise.resolve({ pushManager: {} }),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should register service worker on mount", async () => {
    render(<ServiceWorkerRegister />);

    // Wait for the async registration to be called
    await vi.waitFor(() => {
      expect(registerSpy).toHaveBeenCalledWith("/sw.js");
    });
  });

  it("should render nothing (null)", () => {
    const { container } = render(<ServiceWorkerRegister />);
    expect(container.innerHTML).toBe("");
  });
});
