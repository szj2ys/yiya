"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateEmailReminders } from "@/actions/email-preferences";

type Props = {
  defaultEnabled: boolean;
};

export const EmailReminderToggle = ({ defaultEnabled }: Props) => {
  const [enabled, setEnabled] = useState(defaultEnabled);
  const [pending, startTransition] = useTransition();

  const apply = (on: boolean) => {
    setEnabled(on);
    startTransition(async () => {
      try {
        await updateEmailReminders(on);
        toast.success(on ? "Streak reminders enabled" : "Streak reminders disabled");
      } catch {
        setEnabled(!on);
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <section className="w-full">
      <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 mb-1">
        Streak Reminders
      </h2>
      <p className="text-sm text-neutral-500 mb-4">
        Get an email reminder when your streak is about to expire.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => apply(true)}
          disabled={pending}
          className={`flex-1 rounded-2xl border-2 px-5 py-4 text-center text-base font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-60 ${
            enabled
              ? "border-green-600 bg-green-50 text-green-700 shadow-sm"
              : "border-neutral-100 bg-white text-neutral-600 hover:border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-700"
          }`}
        >
          On
        </button>
        <button
          onClick={() => apply(false)}
          disabled={pending}
          className={`flex-1 rounded-2xl border-2 px-5 py-4 text-center text-base font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-60 ${
            !enabled
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
