"use client";

import { useUser } from "@clerk/nextjs";
import posthog from "posthog-js";
import { PostHogProvider as PostHogJsProvider } from "posthog-js/react";
import { useEffect, useRef } from "react";

import { initAnalytics } from "@/lib/analytics-init";
import { track } from "@/lib/analytics";

type Props = {
  children: React.ReactNode;
};

const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";

let didInitPosthog = false;

export function PostHogProvider({ children }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? DEFAULT_POSTHOG_HOST;

  const { user, isLoaded, isSignedIn } = useUser();
  const didFireSessionStart = useRef(false);

  useEffect(() => {
    if (!apiKey) return;
    if (didInitPosthog) return;

    posthog.init(apiKey, {
      api_host: apiHost,
      capture_pageview: true,
    });

    didInitPosthog = true;
    initAnalytics();
  }, [apiHost, apiKey]);

  useEffect(() => {
    if (!apiKey) return;
    if (!isLoaded) return;

    if (isSignedIn && user) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        created_at: user.createdAt,
      });

      if (!didFireSessionStart.current) {
        didFireSessionStart.current = true;
        track("session_start", {});
      }
      return;
    }

    posthog.reset();
  }, [apiKey, isLoaded, isSignedIn, user]);

  if (!apiKey) {
    return children;
  }

  return <PostHogJsProvider client={posthog}>{children}</PostHogJsProvider>;
}
