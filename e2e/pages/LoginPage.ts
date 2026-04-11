import { type Page, type Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly serverErrorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password");
    this.submitButton = page.getByRole("button", { name: "Sign in" });
    // Client-side field errors: <p> rendered inside the same wrapper div as the input.
    // Scope to the wrapper div so we avoid any ambiguity.
    this.emailError = page.locator("div:has(> #email) > p");
    this.passwordError = page.locator("div:has(> #password) > p");
    // Server errors are rendered inside an Alert component
    this.serverErrorAlert = page.getByRole("alert");
  }

  async goto() {
    await this.page.goto("/login");
    await expect(this.submitButton).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async waitForLoggedIn() {
    await expect(this.page).toHaveURL("/");
  }
}
