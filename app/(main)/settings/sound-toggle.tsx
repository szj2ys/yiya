"use client";

import { useEffect, useState } from "react";

import { isMuted, setMuted as setGlobalMuted } from "@/lib/tts";

export const SoundToggle = () => {
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    setSoundOn(!isMuted());
  }, []);

  const apply = (on: boolean) => {
    setSoundOn(on);
    setGlobalMuted(!on);
  };

  return (
    <section className="w-full">
      <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 mb-1">
        Sound
      </h2>
      <p className="text-sm text-neutral-500 mb-4">
        Toggle text-to-speech audio during lessons.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => apply(true)}
          className={`flex-1 rounded-2xl border-2 px-5 py-4 text-center text-base font-semibold transition-all duration-200 active:scale-[0.98] ${
            soundOn
              ? "border-green-600 bg-green-50 text-green-700 shadow-sm"
              : "border-neutral-100 bg-white text-neutral-600 hover:border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-700"
          }`}
        >
          On
        </button>
        <button
          onClick={() => apply(false)}
          className={`flex-1 rounded-2xl border-2 px-5 py-4 text-center text-base font-semibold transition-all duration-200 active:scale-[0.98] ${
            !soundOn
              ? "border-green-600 bg-green-50 text-green-700 shadow-sm dark:bg-green-950 dark:text-green-400"
              : "border-neutral-100 bg-white text-neutral-600 hover:border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-700"
          }`}
        >
          Off
        </button>
      </div>
    </section>
  );
};
