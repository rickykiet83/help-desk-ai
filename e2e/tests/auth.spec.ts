import { test, expect, type Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

// ---------------------------------------------------------------------------
// Credentials — sourced from server/.env.test via global-setup seeding
// ---------------------------------------------------------------------------
const ADMIN_EMAIL = "admin@test.com";
const ADMIN_PASSWORD = "testpassword123";

const AGENT_EMAIL = "agent@test.com";
const AGENT_PASSWORD = "agentpassword123";

// ---------------------------------------------------------------------------
// Helper: perform a full login via the UI
// ---------------------------------------------------------------------------
async function loginViaUI(page: Page, email: string, password: string) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password);
  await expect(page).toHaveURL("/");
}

// ---------------------------------------------------------------------------
// 1. Login — happy path
// ---------------------------------------------------------------------------
test.describe("Login — happy path", () => {
  test("valid admin credentials redirect to /", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    await expect(page).toHaveURL("/");
    // h1 "Dashboard" confirms we are on the home page
    await expect(
      page.getByRole("heading", { name: "Dashboard", level: 1 })
    ).toBeVisible();
  });

  test("valid agent credentials redirect to /", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(AGENT_EMAIL, AGENT_PASSWORD);
    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { name: "Dashboard", level: 1 })
    ).toBeVisible();
  });

  test("already-authenticated user visiting /login is redirected to /", async ({
    page,
  }) => {
    // First log in
    await loginViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    // Navigate back to /login — should bounce back to /
    await page.goto("/login");
    await expect(page).toHaveURL("/");
  });
});

// ---------------------------------------------------------------------------
// 2. Login — validation errors (client-side)
// ---------------------------------------------------------------------------
test.describe("Login — client-side validation", () => {
  test("submitting an empty form shows email and password errors", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    // Click submit without filling anything
    await loginPage.submitButton.click();

    // Email error
    await expect(loginPage.emailError).toBeVisible();
    await expect(loginPage.emailError).toContainText(/valid email/i);

    // Password error
    await expect(loginPage.passwordError).toBeVisible();
    await expect(loginPage.passwordError).toContainText(/12 characters/i);

    // URL must stay on /login
    await expect(page).toHaveURL("/login");
  });

  test("empty email shows email validation error", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Leave email empty — browser does NOT block submission for empty type='email'
    // without a required attribute, so Zod fires its validation error.
    await loginPage.passwordInput.fill("somepassword123");
    await loginPage.submitButton.click();

    await expect(loginPage.emailError).toBeVisible();
    await expect(loginPage.emailError).toContainText(/valid email/i);
    await expect(page).toHaveURL("/login");
  });

  test("password shorter than 12 characters shows password validation error", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.emailInput.fill("someone@example.com");
    await loginPage.passwordInput.fill("short");
    await loginPage.submitButton.click();

    await expect(loginPage.passwordError).toBeVisible();
    await expect(loginPage.passwordError).toContainText(/12 characters/i);
    await expect(page).toHaveURL("/login");
  });
});

// ---------------------------------------------------------------------------
// 3. Login — server-side errors
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
// 4. Protected routes — unauthenticated access
// ---------------------------------------------------------------------------
test.describe("Protected routes — unauthenticated", () => {
  test("unauthenticated user visiting / is redirected to /login", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/login");
    await expect(
      page.getByRole("button", { name: "Sign in" })
    ).toBeVisible();
  });

  test("unauthenticated user visiting /users is redirected to /login", async ({
    page,
  }) => {
    await page.goto("/users");
    await expect(page).toHaveURL("/login");
    await expect(
      page.getByRole("button", { name: "Sign in" })
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 5. RBAC — /users page access control
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
    await expect(
      page.getByRole("heading", { name: "Dashboard", level: 1 })
    ).toBeVisible();
  });

  test("Users nav link is visible for admin but not for agent", async ({
    page,
  }) => {
    // Admin sees the Users nav link
    await loginViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await expect(page.getByRole("link", { name: "Users" })).toBeVisible();

    // Sign out then log in as agent
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL("/login");

    await loginViaUI(page, AGENT_EMAIL, AGENT_PASSWORD);
    await expect(page.getByRole("link", { name: "Users" })).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 6. Logout
// ---------------------------------------------------------------------------
test.describe("Logout", () => {
  test("clicking Sign out redirects to /login", async ({ page }) => {
    await loginViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL("/login");
  });

  test("after logout, visiting / redirects back to /login", async ({
    page,
  }) => {
    await loginViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL("/login");

    // Try to navigate to the protected home page — session must be gone
    await page.goto("/");
    await expect(page).toHaveURL("/login");
  });

  test("after logout, visiting /users redirects to /login", async ({
    page,
  }) => {
    await loginViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL("/login");

    await page.goto("/users");
    await expect(page).toHaveURL("/login");
  });
});
