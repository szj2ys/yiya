import React from "react";
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock React cache before other imports
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    cache: (fn: any) => fn,
  };
});

// Next.js / app router mocks
vi.mock("next/image", () => ({
  default: ({ fill, priority, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? ""} />;
  },
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// Clerk component stubs (keeps marketing page tests deterministic)
vi.mock("@clerk/nextjs", () => {
  return {
    ClerkLoaded: ({ children }: any) => children,
    ClerkLoading: ({ children }: any) => null,
    SignedIn: ({ children }: any) => null,
    SignedOut: ({ children }: any) => children,
    SignInButton: ({ children }: any) => children,
    SignUpButton: ({ children }: any) => children,
    UserButton: () => null,
    useUser: () => ({
      user: null,
      isLoaded: true,
      isSignedIn: false,
    }),
  };
});

// PayPal SDK mock
vi.mock("@paypal/paypal-js", () => ({
  loadScript: vi.fn(),
}));
