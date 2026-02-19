import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

// Mock sonner
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// Mock lucide-react icons to simple spans
vi.mock("lucide-react", () => ({
  Download: (props: any) => <span data-testid="download-icon" {...props} />,
  Share2: (props: any) => <span data-testid="share-icon" {...props} />,
  X: (props: any) => <span data-testid="x-icon" {...props} />,
}));

import { ShareCard } from "@/components/share-card";

// Mock canvas getContext
const mockGetContext = vi.fn();
beforeEach(() => {
  mockGetContext.mockReturnValue({
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    beginPath: vi.fn(),
    roundRect: vi.fn(),
    fill: vi.fn(),
    clip: vi.fn(),
    stroke: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    fillText: vi.fn(),
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0,
    font: "",
    textAlign: "",
  });

  HTMLCanvasElement.prototype.getContext = mockGetContext as any;
  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => "data:image/png;base64,mock");
  HTMLCanvasElement.prototype.toBlob = vi.fn((cb) => cb(new Blob(["mock"], { type: "image/png" })));
});

const defaultProps = {
  streak: 7,
  wordsLearned: 120,
  language: "Spanish",
  accuracy: 85,
  onClose: vi.fn(),
};

describe("ShareCard", () => {
  it("should render with all stat values", () => {
    render(<ShareCard {...defaultProps} />);

    expect(screen.getByText(/7/)).toBeInTheDocument();
    expect(screen.getByText("day streak")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("words learned")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("accuracy")).toBeInTheDocument();
    expect(screen.getByText("Learn with me on Yiya")).toBeInTheDocument();
  });

  it("should display streak and language", () => {
    render(<ShareCard {...defaultProps} />);

    // Streak value shown
    expect(screen.getByText(/7/)).toBeInTheDocument();
    // Language with flag
    expect(screen.getByText(/Spanish/)).toBeInTheDocument();
    expect(screen.getByText("studying")).toBeInTheDocument();
  });

  it("should render download button", () => {
    render(<ShareCard {...defaultProps} />);

    const downloadBtn = screen.getByRole("button", { name: /download/i });
    expect(downloadBtn).toBeInTheDocument();
  });

  it("should render share button", () => {
    render(<ShareCard {...defaultProps} />);

    const shareBtn = screen.getByRole("button", { name: /share/i });
    expect(shareBtn).toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<ShareCard {...defaultProps} onClose={onClose} />);

    const closeBtn = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when clicking the overlay backdrop", () => {
    const onClose = vi.fn();
    render(<ShareCard {...defaultProps} onClose={onClose} />);

    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should render the hidden canvas element", () => {
    render(<ShareCard {...defaultProps} />);

    const canvas = screen.getByTestId("share-card-canvas");
    expect(canvas).toBeInTheDocument();
  });
});
