import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Footer } from "@/app/(marketing)/footer";

describe("Footer", () => {
  it("should render footer links", () => {
    render(<Footer />);

    expect(screen.getByText("Privacy")).toBeInTheDocument();
    expect(screen.getByText("Terms")).toBeInTheDocument();
  });

  it("should render copyright text", () => {
    render(<Footer />);

    const year = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`${year} Yiya`)),
    ).toBeInTheDocument();
  });

  it("should render links as anchor elements", () => {
    render(<Footer />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveTextContent("Privacy");
    expect(links[1]).toHaveTextContent("Terms");
  });
});
