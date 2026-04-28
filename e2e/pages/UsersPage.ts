import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object Model for the /users admin page.
 * Wraps interactions with the UsersTable, confirmation dialog, and
 * the action buttons (Edit, Delete, Restore) for each row.
 */
export class UsersPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly newUserButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Users", level: 1 });
    this.newUserButton = page.getByRole("button", { name: "New User" });
  }

  async goto() {
    await this.page.goto("/users");
    await expect(this.heading).toBeVisible();
  }

  // ---------------------------------------------------------------------------
  // Row helpers — scoped to a <tr> that contains the given user email
  // ---------------------------------------------------------------------------

  /** Returns the <tr> whose cells contain the given email address. */
  rowFor(email: string): Locator {
    return this.page.getByRole("row").filter({ hasText: email });
  }

  statusBadgeFor(email: string): Locator {
    return this.rowFor(email).getByText(/^(Active|Deleted)$/);
  }

  deleteButtonFor(email: string): Locator {
    return this.rowFor(email).getByRole("button", { name: "Delete user" });
  }

  editButtonFor(email: string): Locator {
    return this.rowFor(email).getByRole("button", { name: "Edit user" });
  }

  restoreButtonFor(email: string): Locator {
    return this.rowFor(email).getByRole("button", { name: "Restore user" });
  }

  // ---------------------------------------------------------------------------
  // Delete confirmation dialog
  // ---------------------------------------------------------------------------

  /** Clicks the Delete button for a user then confirms in the dialog. */
  async deleteUser(email: string) {
    await this.deleteButtonFor(email).click();

    // Confirm dialog should appear — wait for it
    const dialog = this.page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // The description mentions "marked as deleted and can be restored later"
    await expect(dialog).toContainText(/marked as deleted and can be restored later/i);

    // Click the destructive "Delete" button inside the dialog
    await dialog.getByRole("button", { name: "Delete" }).click();

    // Wait for dialog to close AND for the row to reflect the Deleted state
    await expect(dialog).not.toBeVisible();
    await expect(this.statusBadgeFor(email)).toHaveText("Deleted");
  }

  /** Clicks the Restore button for a (deleted) user and waits for the row to update. */
  async restoreUser(email: string) {
    await this.restoreButtonFor(email).click();
    // After restore the Restore button should disappear and Active badge should appear
    await expect(this.statusBadgeFor(email)).toHaveText("Active");
  }
}
