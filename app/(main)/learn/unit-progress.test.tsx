import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { UnitProgress } from "./unit-progress";

describe("UnitProgress", () => {
  it("should show correct completed count", () => {
    render(<UnitProgress completed={3} total={5} />);

    expect(screen.getByText(/3\s*\/\s*5/)).toBeInTheDocument();
  });

  it("should calculate progress percentage correctly", () => {
    render(<UnitProgress completed={3} total={5} />);

    expect(screen.getByTestId("unit-progress-fill")).toHaveStyle("width: 60%");
  });
});
