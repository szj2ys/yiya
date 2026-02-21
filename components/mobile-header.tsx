"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";

import { cn } from "@/lib/utils";

type Tab = {
  label: string;
  href: string;
  iconSrc?: string;
  Icon?: React.ComponentType<{ className?: string }>;
};

const tabs: Tab[] = [
  { label: "Learn", href: "/learn", iconSrc: "/learn.svg" },
  { label: "Leaderboard", href: "/leaderboard", iconSrc: "/leaderboard.svg" },
  { label: "Review", href: "/practice", Icon: BookOpen },
  { label: "Shop", href: "/shop", iconSrc: "/shop.svg" },
  { label: "Settings", href: "/settings", iconSrc: "/settings.svg" },
];

export const MobileHeader = () => {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-[56px]">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] rounded-xl transition-colors",
                isActive
                  ? "text-green-600"
                  : "text-neutral-400 active:bg-neutral-100",
              )}
            >
              <div className="relative w-7 h-7 flex items-center justify-center">
                {tab.iconSrc ? (
                  <Image
                    src={tab.iconSrc}
                    alt={tab.label}
                    fill
                    className={cn(
                      "object-contain transition-opacity",
                      isActive ? "opacity-100" : "opacity-50",
                    )}
                  />
                ) : tab.Icon ? (
                  <tab.Icon
                    className={cn(
                      "h-6 w-6 transition-opacity",
                      isActive ? "opacity-100 text-green-600" : "opacity-50 text-neutral-400",
                    )}
                  />
                ) : null}
              </div>
              <span
                className={cn(
                  "text-[10px] leading-tight font-semibold",
                  isActive ? "text-green-600" : "text-neutral-400",
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
