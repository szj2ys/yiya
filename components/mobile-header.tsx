"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const tabs = [
  { label: "Learn", href: "/learn", iconSrc: "/learn.svg" },
  { label: "Leaderboard", href: "/leaderboard", iconSrc: "/leaderboard.svg" },
  { label: "Quests", href: "/quests", iconSrc: "/quests.svg" },
  { label: "Shop", href: "/shop", iconSrc: "/shop.svg" },
] as const;

export const MobileHeader = () => {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200"
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
              <div className="relative w-7 h-7">
                <Image
                  src={tab.iconSrc}
                  alt={tab.label}
                  fill
                  className={cn(
                    "object-contain transition-opacity",
                    isActive ? "opacity-100" : "opacity-50",
                  )}
                />
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
