/**
 * E2E tests for the TicketDetailPage (/tickets/:id).
 *
 * Only covers flows that cannot be unit tested:
 *  - Real server PATCH + DB mutation for status update
 *  - Unauthenticated redirect via real Better Auth session
 *
 * Rendering and empty-state assertions (subject h1, status badge, body text,
 * "No replies yet.", etc.) are covered by component unit tests in
 * client/src/pages/__tests__/TicketDetail.test.tsx and ReplyThread.test.tsx.
 */

import * as dotenv from "dotenv";
import * as path from "path";

import { expect, test } from "@playwright/test";

import { TicketDetailPage } from "../pages/TicketDetailPage";
import { loginAsAdmin } from "../helpers/auth";

dotenv.config({ path: path.resolve(__dirname, "../../server/.env.test") });

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

// Create a fresh ticket (unique subject prevents thread-continuation) and
// navigate directly to it using the ID from the webhook response.
async function createTicketAndNavigateToDetail(
  page: Parameters<typeof loginAsAdmin>[0],
  request: { post: (url: string, options: object) => Promise<{ status(): number; json(): Promise<{ ticket: { id: number } }> }> }
): Promise<number> {
  const subject = `${ticketPayload.subject} [${Date.now()}]`;
  const response = await request.post(WEBHOOK_URL, {
    headers: { "x-webhook-secret": WEBHOOK_SECRET },
    multipart: { ...ticketPayload, subject },
  });
  expect(response.status()).toBe(200);
  const { ticket } = await response.json();
  await page.goto(`/tickets/${ticket.id}`);
  await expect(new TicketDetailPage(page).heading).toBeVisible();
  return ticket.id;
}

// ---------------------------------------------------------------------------
// Status update — real PATCH to server + DB, cannot be unit tested
// ---------------------------------------------------------------------------
test.describe("Ticket detail page — status update", () => {
  test.beforeEach(async ({ page, request }) => {
    await loginAsAdmin(page);
    await createTicketAndNavigateToDetail(page, request);
  });

  test("selecting 'Resolved' from the Status dropdown persists via PATCH and updates the badge", async ({ page }) => {
    const detailPage = new TicketDetailPage(page);
    await expect(detailPage.statusSelect).toBeEnabled();
    await expect(detailPage.statusSelect).toHaveValue("Open");

    await detailPage.statusSelect.selectOption("Resolved");

    await expect(detailPage.statusSelect).toHaveValue("Resolved");
    await expect(detailPage.statusBadge).toHaveText("Resolved");
  });
});

// ---------------------------------------------------------------------------
// Protected access — real Better Auth session, cannot be unit tested
// ---------------------------------------------------------------------------
test.describe("Ticket detail page — protected access", () => {
  test("unauthenticated visit to /tickets/1 redirects to /login", async ({ page }) => {
    await page.goto("/tickets/1");
    await expect(page).toHaveURL("/login");
  });
});
