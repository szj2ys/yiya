import React from "react";
import "@testing-library/jest-dom/vitest";

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
  };
});
