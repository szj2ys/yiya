"use client";

import { useEffect, useRef, useState } from "react";
import { SignUpButton, ClerkLoaded, SignedOut } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

export function StickyCta() {
  const [visible, setVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = document.getElementById("hero-sentinel");
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <ClerkLoaded>
      <SignedOut>
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 border-t border-black/5 bg-white/95 backdrop-blur-sm px-4 py-3 transition-transform duration-300 lg:hidden ${
            visible ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <SignUpButton
            mode="modal"
            afterSignInUrl="/learn"
            afterSignUpUrl="/onboarding"
          >
            <Button
              size="lg"
              variant="secondary"
              className="h-12 w-full rounded-2xl text-base normal-case tracking-normal"
            >
              Get Started Free
            </Button>
          </SignUpButton>
        </div>
      </SignedOut>
    </ClerkLoaded>
  );
}
