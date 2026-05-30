/**
 * E2E tests for the TicketDetailPage (/tickets/:id).
 *
 * Setup strategy
 * --------------
 * Each beforeEach creates a genuinely new ticket by appending Date.now() to
 * the subject. This prevents the webhook's thread-continuation logic from
 * routing subsequent calls into an existing open ticket (same sender + subject
 * = reply appended, not new ticket). The ticket ID is extracted from the
 * webhook response and used to navigate directly to /tickets/:id, avoiding
 * fragile table-click navigation.
 *
 * Serial mode prevents race conditions when fullyParallel is enabled globally.
 */

import * as dotenv from "dotenv";
import * as path from "path";

import { expect, test } from "@playwright/test";

import { TicketDetailPage } from "../pages/TicketDetailPage";
import { loginAsAdmin } from "../helpers/auth";

dotenv.config({
  path: path.resolve(__dirname, "../../server/.env.test"),
});

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET ?? "";
const API_BASE_URL = `http://localhost:${process.env.PORT ?? 3001}`;
const WEBHOOK_URL = `${API_BASE_URL}/api/webhooks/inbound-email`;

const ticketPayload = {
  from: "customer@example.com",
  fromName: "Test Customer",
  subject: "Login is broken",
  body: "I cannot log in to my account since yesterday.",
};

test.describe.configure({ mode: "serial" });

// ---------------------------------------------------------------------------
// Helper — create a fresh ticket and navigate directly to its detail page.
//
// A unique suffix is appended to the subject so the webhook always creates a
// new ticket (never triggers the thread-continuation / reply-append path).
// The ticket ID comes directly from the webhook JSON response.
// ---------------------------------------------------------------------------
async function createTicketAndNavigateToDetail(
  page: Parameters<typeof loginAsAdmin>[0],
  request: { post: (url: string, options: object) => Promise<{ status(): number; json(): Promise<{ ticket: { id: number } }> }> }
): Promise<{ ticketId: number; subject: string }> {
  const subject = `${ticketPayload.subject} [${Date.now()}]`;

  const response = await request.post(WEBHOOK_URL, {
    headers: { "x-webhook-secret": WEBHOOK_SECRET },
    multipart: { ...ticketPayload, subject },
  });
  expect(response.status()).toBe(200);

  const { ticket } = await response.json();
  await page.goto(`/tickets/${ticket.id}`);
  await expect(new TicketDetailPage(page).heading).toBeVisible();

  return { ticketId: ticket.id, subject };
}

// ===========================================================================
// Group 1 — Ticket detail rendering
// ===========================================================================
test.describe("Ticket detail page — rendering", () => {
  let subject: string;

  test.beforeEach(async ({ page, request }) => {
    await loginAsAdmin(page);
    ({ subject } = await createTicketAndNavigateToDetail(page, request));
  });

  test("shows the ticket subject as an h1", async ({ page }) => {
    const detailPage = new TicketDetailPage(page);
    await expect(detailPage.heading).toHaveText(subject);
  });

  test("shows an 'Open' status badge for a freshly created ticket", async ({ page }) => {
    const detailPage = new TicketDetailPage(page);
    await expect(detailPage.statusBadge).toHaveText("Open");
  });

  test("shows the sender name in the From metadata field", async ({ page }) => {
    // The sender label appears in both the metadata column and the message card
    // header — scope to the first occurrence (the "From" value).
    await expect(
      page.getByText(`${ticketPayload.fromName} <${ticketPayload.from}>`).first()
    ).toBeVisible();
  });

  test("shows the ticket body in the message card", async ({ page }) => {
    const detailPage = new TicketDetailPage(page);
    await expect(detailPage.messageBody).toHaveText(ticketPayload.body);
  });

  test("has a 'Back to tickets' link that points to /tickets", async ({ page }) => {
    const detailPage = new TicketDetailPage(page);
    await expect(detailPage.backLink).toBeVisible();
    await expect(detailPage.backLink).toHaveAttribute("href", "/tickets");
  });
});

// ===========================================================================
// Group 2 — Status update
// ===========================================================================
test.describe("Ticket detail page — status update", () => {
  test.beforeEach(async ({ page, request }) => {
    await loginAsAdmin(page);
    await createTicketAndNavigateToDetail(page, request);
  });

  test("selecting 'Resolved' from the Status dropdown updates the badge", async ({ page }) => {
    const detailPage = new TicketDetailPage(page);

    await expect(detailPage.statusSelect).toBeEnabled();
    await expect(detailPage.statusSelect).toHaveValue("Open");

    await detailPage.statusSelect.selectOption("Resolved");

    await expect(detailPage.statusSelect).toHaveValue("Resolved");
    await expect(detailPage.statusBadge).toHaveText("Resolved");
  });
});

// ===========================================================================
// Group 3 — Reply thread empty state
// ===========================================================================
test.describe("Ticket detail page — reply thread", () => {
  test.beforeEach(async ({ page, request }) => {
    await loginAsAdmin(page);
    await createTicketAndNavigateToDetail(page, request);
  });

  test("shows 'No replies yet.' when no replies have been added", async ({ page }) => {
    const detailPage = new TicketDetailPage(page);
    await expect(detailPage.noRepliesText).toBeVisible();
  });
});

// ===========================================================================
// Group 4 — Protected access (unauthenticated redirect)
// ===========================================================================
test.describe("Ticket detail page — protected access", () => {
  test("unauthenticated visit to /tickets/1 redirects to /login", async ({ page }) => {
    await page.goto("/tickets/1");
    await expect(page).toHaveURL("/login");
  });
});
