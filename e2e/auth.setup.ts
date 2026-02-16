import { clerkSetup, clerk } from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, ".auth/user.json");

setup("authenticate via Clerk", async ({ page }) => {
  await clerkSetup();

  const email = process.env.CLERK_E2E_USER_EMAIL;
  const password = process.env.CLERK_E2E_USER_PASSWORD;

  if (!email || !password) {
    await page.context().storageState({ path: authFile });
    return;
  }

  await page.goto("/");

  // clerk.signIn may throw "Execution context destroyed" due to
  // post-sign-in navigation — that's fine, sign-in still succeeded.
  try {
    await clerk.signIn({
      page,
      signInParams: {
        strategy: "password",
        identifier: email,
        password: password,
      },
    });
  } catch (e: any) {
    if (!e.message?.includes("context was destroyed")) {
      throw e;
    }
  }

  // Wait for page to settle after sign-in navigation
  await page.waitForLoadState("networkidle", { timeout: 15_000 });

  await page.context().storageState({ path: authFile });
});
