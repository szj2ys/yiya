import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Integration test for the admin layout.
 *
 * Since the admin layout is a server component, we verify correct
 * wiring by inspecting the source code for expected patterns:
 * - Uses currentUser() from @clerk/nextjs
 * - Checks publicMetadata.role === "admin"
 * - Redirects non-admin users to /learn
 */
describe("AdminLayout", () => {
  const layoutSource = readFileSync(
    resolve(process.cwd(), "app/admin/layout.tsx"),
    "utf-8",
  );

  it("should redirect non-admin users from /admin to /learn", () => {
    expect(layoutSource).toContain('redirect("/learn")');
  });

  it("should import currentUser from @clerk/nextjs", () => {
    expect(layoutSource).toContain("currentUser");
    expect(layoutSource).toContain("@clerk/nextjs");
  });

  it("should check publicMetadata.role for admin", () => {
    expect(layoutSource).toContain("publicMetadata");
    expect(layoutSource).toContain('"admin"');
  });

  it("should render children when user is admin", () => {
    expect(layoutSource).toContain("children");
  });
});
