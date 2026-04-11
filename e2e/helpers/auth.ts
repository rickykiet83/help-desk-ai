import { type BrowserContext, type Page, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

const ADMIN_EMAIL = "admin@test.com";
const ADMIN_PASSWORD = "testpassword123";

/** Credentials for the agent created by createTestAgent(). */
export const AGENT_EMAIL = "agent@test.com";
export const AGENT_PASSWORD = "agentpassword123";

/**
 * Log in as admin via the UI and return to the caller.
 * Uses the seeded admin credentials from server/.env.test.
 */
export async function loginAsAdmin(page: Page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  await expect(page).toHaveURL("/");
}

/**
 * Log in as the test agent via the UI and return to the caller.
 * Requires createTestAgent() to have been called first.
 */
export async function loginAsAgent(page: Page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(AGENT_EMAIL, AGENT_PASSWORD);
  await expect(page).toHaveURL("/");
}

/**
 * Create a persistent admin storage state so tests can skip the login UI.
 * Call this once with `request` from a test that does NOT share context with
 * the tests consuming the state.
 *
 * Usage in a beforeAll:
 *   await saveAdminStorageState(page, context);
 */
export async function saveAdminStorageState(
  page: Page,
  context: BrowserContext,
  storagePath: string
) {
  await loginAsAdmin(page);
  await context.storageState({ path: storagePath });
}
