"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
  children: ReactNode;
};

export function DashboardSection({ children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div data-testid="dashboard-section">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="mb-3 flex w-full items-center gap-x-2 text-sm font-medium text-neutral-500 hover:text-neutral-700"
        data-testid="dashboard-toggle"
      >
        <ChevronDown
          className={[
            "h-4 w-4 transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
        {open ? "Hide stats" : "Show stats"}
      </button>
      {open && <div className="flex flex-col gap-y-4">{children}</div>}
    </div>
  );
}
