import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "../helpers/auth";
import { UsersPage } from "../pages/UsersPage";

// ---------------------------------------------------------------------------
// Credentials — from server/.env.test via global-setup seeding
// ---------------------------------------------------------------------------
const AGENT_EMAIL = "agent@test.com";
const ADMIN_EMAIL = "admin@test.com";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Log in as admin and navigate to /users.
 * Returns a fully-loaded UsersPage instance.
 */
async function setupUsersPage(page: Parameters<typeof loginAsAdmin>[0]) {
  await loginAsAdmin(page);
  const usersPage = new UsersPage(page);
  await usersPage.goto();
  // Wait for the table data to load — agent row must be present
  await expect(usersPage.rowFor(AGENT_EMAIL)).toBeVisible();
  return usersPage;
}

// ---------------------------------------------------------------------------
// Test suite
// These tests share one database user (agent@test.com) and mutate its state,
// so they must run serially to avoid race conditions between parallel workers.
// ---------------------------------------------------------------------------

test.describe.configure({ mode: "serial" });

test.describe("Soft-delete and restore users", () => {
  // After each test, ensure the agent is restored so the next test starts with
  // a clean Active state.  The admin session is still active — navigate
  // directly to /users rather than re-logging in (loginAsAdmin would bounce
  // immediately back to / if a session already exists).
  test.afterEach(async ({ page }) => {
    const usersPage = new UsersPage(page);
    await usersPage.goto();

    // Re-read badge text from the live page
    const statusBadge = usersPage.statusBadgeFor(AGENT_EMAIL);
    const badgeText = await statusBadge.textContent().catch(() => null);
    if (badgeText?.trim() === "Deleted") {
      await usersPage.restoreButtonFor(AGENT_EMAIL).click();
      await expect(statusBadge).toHaveText("Active");
    }
  });

  // -------------------------------------------------------------------------
  // 1. Delete flow
  // -------------------------------------------------------------------------
  test.describe("Delete flow", () => {
    test("clicking Delete on an agent opens a confirmation dialog", async ({
      page,
    }) => {
      const usersPage = await setupUsersPage(page);
      await usersPage.deleteButtonFor(AGENT_EMAIL).click();

      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText(/delete user/i);
      await expect(dialog).toContainText(
        /marked as deleted and can be restored later/i
      );

      // Cancel — leave the user undeleted
      await dialog.getByRole("button", { name: "Cancel" }).click();
      await expect(dialog).not.toBeVisible();
    });

    test("confirming delete changes the row to show Deleted badge and Restore button", async ({
      page,
    }) => {
      const usersPage = await setupUsersPage(page);

      // Before: Active badge and Delete button are visible
      await expect(usersPage.statusBadgeFor(AGENT_EMAIL)).toHaveText("Active");
      await expect(usersPage.deleteButtonFor(AGENT_EMAIL)).toBeVisible();

      await usersPage.deleteUser(AGENT_EMAIL);

      // After: Deleted badge and only Restore button
      await expect(usersPage.statusBadgeFor(AGENT_EMAIL)).toHaveText("Deleted");
      await expect(usersPage.restoreButtonFor(AGENT_EMAIL)).toBeVisible();
      await expect(usersPage.deleteButtonFor(AGENT_EMAIL)).not.toBeVisible();
      await expect(usersPage.editButtonFor(AGENT_EMAIL)).not.toBeVisible();
    });

    test("cancelling the confirmation dialog leaves the user as Active", async ({
      page,
    }) => {
      const usersPage = await setupUsersPage(page);

      await usersPage.deleteButtonFor(AGENT_EMAIL).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();

      await dialog.getByRole("button", { name: "Cancel" }).click();
      await expect(dialog).not.toBeVisible();

      // Row must still show Active — no mutation occurred
      await expect(usersPage.statusBadgeFor(AGENT_EMAIL)).toHaveText("Active");
      await expect(usersPage.deleteButtonFor(AGENT_EMAIL)).toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // 2. Restore flow
  // -------------------------------------------------------------------------
  test.describe("Restore flow", () => {
    test("clicking Restore on a deleted user changes the row back to Active", async ({
      page,
    }) => {
      const usersPage = await setupUsersPage(page);

      // Set up: delete the agent first
      await usersPage.deleteUser(AGENT_EMAIL);
      await expect(usersPage.statusBadgeFor(AGENT_EMAIL)).toHaveText("Deleted");

      // Restore
      await usersPage.restoreUser(AGENT_EMAIL);

      // Row must show Active badge and Edit + Delete buttons
      await expect(usersPage.statusBadgeFor(AGENT_EMAIL)).toHaveText("Active");
      await expect(usersPage.editButtonFor(AGENT_EMAIL)).toBeVisible();
      await expect(usersPage.deleteButtonFor(AGENT_EMAIL)).toBeVisible();
      // Restore button must be gone for an active user
      await expect(usersPage.restoreButtonFor(AGENT_EMAIL)).not.toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // 3. Deleted user persists across page refresh
  // -------------------------------------------------------------------------
  test.describe("Persistence", () => {
    test("deleted user still appears with Deleted badge after a full page refresh", async ({
      page,
    }) => {
      const usersPage = await setupUsersPage(page);

      await usersPage.deleteUser(AGENT_EMAIL);
      await expect(usersPage.statusBadgeFor(AGENT_EMAIL)).toHaveText("Deleted");

      // Hard-reload — triggers a fresh API call with ?includeDeleted=true
      await page.reload();
      await expect(usersPage.heading).toBeVisible();
      await expect(usersPage.rowFor(AGENT_EMAIL)).toBeVisible();

      await expect(usersPage.statusBadgeFor(AGENT_EMAIL)).toHaveText("Deleted");
      await expect(usersPage.restoreButtonFor(AGENT_EMAIL)).toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // 4. Admin protection
  // -------------------------------------------------------------------------
  test.describe("Admin protection", () => {
    test("the Delete button for an admin user is disabled", async ({
      page,
    }) => {
      const usersPage = await setupUsersPage(page);

      const adminRow = usersPage.rowFor(ADMIN_EMAIL);
      await expect(adminRow).toBeVisible();

      // The delete button is present in the DOM but disabled
      const adminDeleteButton = adminRow.getByRole("button", {
        name: "Cannot delete an admin",
      });
      await expect(adminDeleteButton).toBeVisible();
      await expect(adminDeleteButton).toBeDisabled();
    });

    test("clicking the disabled admin delete button does not open a dialog", async ({
      page,
    }) => {
      const usersPage = await setupUsersPage(page);

      const adminRow = usersPage.rowFor(ADMIN_EMAIL);
      const adminDeleteButton = adminRow.getByRole("button", {
        name: "Cannot delete an admin",
      });

      // force: true bypasses the disabled check so we can verify no dialog opens
      await adminDeleteButton.click({ force: true });
      await expect(page.getByRole("dialog")).not.toBeVisible();
    });
  });
});
