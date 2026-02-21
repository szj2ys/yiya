import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Unit test for assertAdmin() — the shared admin guard for API routes.
 *
 * We mock @clerk/nextjs's auth() to return different sessionClaims
 * and verify the guard returns a 403 JSON response for non-admins
 * and null for admins.
 */

const mockAuth = vi.fn();

vi.mock("@clerk/nextjs", () => ({
  auth: () => mockAuth(),
}));

// vi.mock is hoisted by vitest, so the mock is in place before this import resolves
import { assertAdmin } from "@/lib/admin-guard";

describe("assertAdmin", () => {
  beforeEach(() => {
    mockAuth.mockReset();
  });

  it("should return 403 for non-admin API requests", async () => {
    mockAuth.mockReturnValue({
      sessionClaims: {
        publicMetadata: { role: "user" },
      },
    });

    const result = await assertAdmin();

    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);

    const body = await result!.json();
    expect(body).toEqual({ error: "Forbidden" });
  });

  it("should return 403 when sessionClaims is missing", async () => {
    mockAuth.mockReturnValue({});

    const result = await assertAdmin();

    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);

    const body = await result!.json();
    expect(body).toEqual({ error: "Forbidden" });
  });

  it("should return 403 when publicMetadata has no role", async () => {
    mockAuth.mockReturnValue({
      sessionClaims: {
        publicMetadata: {},
      },
    });

    const result = await assertAdmin();

    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it("should return null for admin users", async () => {
    mockAuth.mockReturnValue({
      sessionClaims: {
        publicMetadata: { role: "admin" },
      },
    });

    const result = await assertAdmin();

    expect(result).toBeNull();
  });
});
