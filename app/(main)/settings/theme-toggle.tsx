"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  const applyTheme = (next: Theme) => {
    setTheme(next);

    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    try {
      localStorage.setItem("theme", next);
    } catch {
      // localStorage unavailable — ignore
    }
  };

  return (
    <section className="w-full">
      <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 mb-1">
        Appearance
      </h2>
      <p className="text-sm text-neutral-500 mb-4">
        Choose your preferred color scheme.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => applyTheme("light")}
          className={`flex-1 rounded-2xl border-2 px-5 py-4 text-center text-base font-semibold transition-all duration-200 active:scale-[0.98] ${
            theme === "light"
              ? "border-green-600 bg-green-50 text-green-700 shadow-sm"
              : "border-neutral-100 bg-white text-neutral-600 hover:border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-700"
          }`}
        >
          Light
        </button>
        <button
          onClick={() => applyTheme("dark")}
          className={`flex-1 rounded-2xl border-2 px-5 py-4 text-center text-base font-semibold transition-all duration-200 active:scale-[0.98] ${
            theme === "dark"
              ? "border-green-600 bg-green-50 text-green-700 shadow-sm dark:bg-green-950 dark:text-green-400"
              : "border-neutral-100 bg-white text-neutral-600 hover:border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-700"
          }`}
        >
          Dark
        </button>
      </div>
    </section>
  );
};
