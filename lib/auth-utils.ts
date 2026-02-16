import { auth } from "@clerk/nextjs";

const E2E_TEST_USER_ID = "e2e-test-user";

/** Get userId from Clerk auth, with E2E testing fallback */
export async function getAuthUserId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    if (userId) return userId;
  } catch {
    // auth() throws when Clerk middleware is bypassed (E2E testing)
  }
  if (process.env.E2E_TESTING === "true") return E2E_TEST_USER_ID;
  return null;
}
