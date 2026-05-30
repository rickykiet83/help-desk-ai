import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "../helpers/auth";
import { UsersPage } from "../pages/UsersPage";

const AGENT_EMAIL = "agent@test.com";

async function setupUsersPage(page: Parameters<typeof loginAsAdmin>[0]) {
  await loginAsAdmin(page);
  const usersPage = new UsersPage(page);
  await usersPage.goto();
  await expect(usersPage.rowFor(AGENT_EMAIL)).toBeVisible();
  return usersPage;
}

// These tests mutate shared DB state — run serially.
test.describe.configure({ mode: "serial" });

test.describe("Soft-delete and restore users", () => {
  test.afterEach(async ({ page }) => {
    const usersPage = new UsersPage(page);
    await usersPage.goto();
    const badge = usersPage.statusBadgeFor(AGENT_EMAIL);
    const text = await badge.textContent().catch(() => null);
    if (text?.trim() === "Deleted") {
      await usersPage.restoreButtonFor(AGENT_EMAIL).click();
      await expect(badge).toHaveText("Active");
    }
  });

  // Requires real DB mutation — cannot be unit tested.
  test("confirming delete changes the row to Deleted and shows Restore button", async ({ page }) => {
    const usersPage = await setupUsersPage(page);
    await usersPage.deleteUser(AGENT_EMAIL);
    await expect(usersPage.statusBadgeFor(AGENT_EMAIL)).toHaveText("Deleted");
    await expect(usersPage.restoreButtonFor(AGENT_EMAIL)).toBeVisible();
    await expect(usersPage.deleteButtonFor(AGENT_EMAIL)).not.toBeVisible();
  });

  // Requires real DB mutation — cannot be unit tested.
  test("restoring a deleted user changes the row back to Active", async ({ page }) => {
    const usersPage = await setupUsersPage(page);
    await usersPage.deleteUser(AGENT_EMAIL);
    await usersPage.restoreUser(AGENT_EMAIL);
    await expect(usersPage.statusBadgeFor(AGENT_EMAIL)).toHaveText("Active");
    await expect(usersPage.deleteButtonFor(AGENT_EMAIL)).toBeVisible();
    await expect(usersPage.restoreButtonFor(AGENT_EMAIL)).not.toBeVisible();
  });

  // Session persistence across page reload — cannot be unit tested.
  test("deleted state persists after a full page refresh", async ({ page }) => {
    const usersPage = await setupUsersPage(page);
    await usersPage.deleteUser(AGENT_EMAIL);
    await page.reload();
    await expect(usersPage.heading).toBeVisible();
    await expect(usersPage.statusBadgeFor(AGENT_EMAIL)).toHaveText("Deleted");
  });
});
