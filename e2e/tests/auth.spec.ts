import { test, expect, type Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

const ADMIN_EMAIL = "admin@test.com";
const ADMIN_PASSWORD = "testpassword123";
const AGENT_EMAIL = "agent@test.com";
const AGENT_PASSWORD = "agentpassword123";

async function loginViaUI(page: Page, email: string, password: string) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password);
  await expect(page).toHaveURL("/");
}

// ---------------------------------------------------------------------------
// 1. Login — happy path (real Better Auth session creation)
// ---------------------------------------------------------------------------
test.describe("Login — happy path", () => {
  test("valid admin credentials redirect to /", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "Dashboard", level: 1 })).toBeVisible();
  });

  test("valid agent credentials redirect to /", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(AGENT_EMAIL, AGENT_PASSWORD);
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "Dashboard", level: 1 })).toBeVisible();
  });

  test("already-authenticated user visiting /login is redirected to /", async ({ page }) => {
    await loginViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto("/login");
    await expect(page).toHaveURL("/");
  });
});

// ---------------------------------------------------------------------------
// 2. Login — server-side errors (requires real auth backend)
// ---------------------------------------------------------------------------
test.describe("Login — server-side errors", () => {
  test("wrong password shows server error alert", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(ADMIN_EMAIL, "wrongpassword123");
    await expect(loginPage.serverErrorAlert).toBeVisible();
    await expect(page).toHaveURL("/login");
  });

  test("non-existent email shows server error alert", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("nobody@example.com", "somepassword123");
    await expect(loginPage.serverErrorAlert).toBeVisible();
    await expect(page).toHaveURL("/login");
  });
});

// ---------------------------------------------------------------------------
// 3. Protected routes — session required (cannot be unit tested)
// ---------------------------------------------------------------------------
test.describe("Protected routes — unauthenticated", () => {
  test("unauthenticated user visiting / is redirected to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/login");
  });

  test("unauthenticated user visiting /users is redirected to /login", async ({ page }) => {
    await page.goto("/users");
    await expect(page).toHaveURL("/login");
  });
});

// ---------------------------------------------------------------------------
// 4. RBAC — role-based access enforced by real session (cannot be unit tested)
// ---------------------------------------------------------------------------
test.describe("RBAC — /users page", () => {
  test("admin can access /users", async ({ page }) => {
    await loginViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto("/users");
    await expect(page).toHaveURL("/users");
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
  });

  test("agent visiting /users is redirected to /", async ({ page }) => {
    await loginViaUI(page, AGENT_EMAIL, AGENT_PASSWORD);
    await page.goto("/users");
    await expect(page).toHaveURL("/");
  });

  test("Users nav link is visible for admin but not for agent", async ({ page }) => {
    await loginViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await expect(page.getByRole("link", { name: "Users" })).toBeVisible();

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL("/login");

    await loginViaUI(page, AGENT_EMAIL, AGENT_PASSWORD);
    await expect(page.getByRole("link", { name: "Users" })).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 5. Logout — session destruction (cannot be unit tested)
// ---------------------------------------------------------------------------
test.describe("Logout", () => {
  test("clicking Sign out redirects to /login", async ({ page }) => {
    await loginViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL("/login");
  });

  test("after logout, visiting / redirects back to /login", async ({ page }) => {
    await loginViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.goto("/");
    await expect(page).toHaveURL("/login");
  });
});
