/**
 * E2E tests for POST /api/webhooks/inbound-email
 *
 * The endpoint has two branches:
 *  - New ticket  → 200 { ticket }
 *  - Existing open ticket with same sender + subject → 200 { ticket } (reply appended)
 *
 * Auth: no session required — only the webhook secret (header or query param).
 */

import * as dotenv from "dotenv";
import * as path from "path";

import { expect, test } from "@playwright/test";

dotenv.config({ path: path.resolve(__dirname, "../../server/.env.test") });

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET ?? "";
const API_BASE_URL = `http://localhost:${process.env.PORT ?? 3001}`;
const WEBHOOK_URL = `${API_BASE_URL}/api/webhooks/inbound-email`;

const validPayload = {
  from: "customer@example.com",
  fromName: "Test Customer",
  subject: "I need help with my order",
  body: "Hello, I placed an order last week and have not received it yet.",
};

function multipart(fields: Record<string, string>) {
  return fields;
}

// Tests create real DB rows — run serially to avoid ordering surprises.
test.describe.configure({ mode: "serial" });

test.describe("POST /api/webhooks/inbound-email", () => {

  // -------------------------------------------------------------------------
  // Webhook secret validation
  // -------------------------------------------------------------------------
  test.describe("Webhook secret validation", () => {
    test("missing secret returns 401", async ({ request }) => {
      const res = await request.post(WEBHOOK_URL, {
        multipart: multipart(validPayload),
      });
      expect(res.status()).toBe(401);
      expect(await res.json()).toHaveProperty("error");
    });

    test("wrong secret in header returns 401", async ({ request }) => {
      const res = await request.post(WEBHOOK_URL, {
        headers: { "x-webhook-secret": "wrong-secret" },
        multipart: multipart(validPayload),
      });
      expect(res.status()).toBe(401);
      expect(await res.json()).toHaveProperty("error");
    });

    test("wrong secret in query param returns 401", async ({ request }) => {
      const res = await request.post(`${WEBHOOK_URL}?secret=wrong-secret`, {
        multipart: multipart(validPayload),
      });
      expect(res.status()).toBe(401);
      expect(await res.json()).toHaveProperty("error");
    });
  });

  // -------------------------------------------------------------------------
  // Payload validation (correct secret, bad body)
  // -------------------------------------------------------------------------
  test.describe("Payload validation", () => {
    const headers = { "x-webhook-secret": WEBHOOK_SECRET };

    test("missing `from` field returns 400", async ({ request }) => {
      const { from: _, ...payload } = validPayload;
      const res = await request.post(WEBHOOK_URL, {
        headers,
        multipart: multipart(payload),
      });
      expect(res.status()).toBe(400);
      expect(await res.json()).toHaveProperty("error");
    });

    test("invalid email in `from` returns 400", async ({ request }) => {
      const res = await request.post(WEBHOOK_URL, {
        headers,
        multipart: multipart({ ...validPayload, from: "not-an-email" }),
      });
      expect(res.status()).toBe(400);
      expect(await res.json()).toHaveProperty("error");
    });

    test("missing `fromName` field returns 400", async ({ request }) => {
      const { fromName: _, ...payload } = validPayload;
      const res = await request.post(WEBHOOK_URL, {
        headers,
        multipart: multipart(payload),
      });
      expect(res.status()).toBe(400);
      expect(await res.json()).toHaveProperty("error");
    });

    test("missing `subject` field returns 400", async ({ request }) => {
      const { subject: _, ...payload } = validPayload;
      const res = await request.post(WEBHOOK_URL, {
        headers,
        multipart: multipart(payload),
      });
      expect(res.status()).toBe(400);
      expect(await res.json()).toHaveProperty("error");
    });

    test("missing `body` field returns 400", async ({ request }) => {
      const { body: _, ...payload } = validPayload;
      const res = await request.post(WEBHOOK_URL, {
        headers,
        multipart: multipart(payload),
      });
      expect(res.status()).toBe(400);
      expect(await res.json()).toHaveProperty("error");
    });

    test("empty multipart body returns 400", async ({ request }) => {
      const res = await request.post(WEBHOOK_URL, {
        headers,
        multipart: {},
      });
      expect(res.status()).toBe(400);
      expect(await res.json()).toHaveProperty("error");
    });
  });

  // -------------------------------------------------------------------------
  // Happy path — new ticket
  // -------------------------------------------------------------------------
  test.describe("Happy path — new ticket", () => {
    test("valid payload via header secret creates ticket and returns 200", async ({ request }) => {
      const res = await request.post(WEBHOOK_URL, {
        headers: { "x-webhook-secret": WEBHOOK_SECRET },
        multipart: multipart({ ...validPayload, subject: "New ticket via header secret" }),
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("ticket");
      expect(body.ticket).toMatchObject({
        subject: "New ticket via header secret",
        senderEmail: validPayload.from,
        status: "Open",
      });
    });

    test("valid payload via query-param secret creates ticket and returns 200", async ({ request }) => {
      const res = await request.post(`${WEBHOOK_URL}?secret=${WEBHOOK_SECRET}`, {
        multipart: multipart({ ...validPayload, subject: "New ticket via query param" }),
      });
      expect(res.status()).toBe(200);
      expect(await res.json()).toHaveProperty("ticket");
    });

    test("optional bodyHtml field is accepted and returns 200", async ({ request }) => {
      const res = await request.post(WEBHOOK_URL, {
        headers: { "x-webhook-secret": WEBHOOK_SECRET },
        multipart: multipart({
          ...validPayload,
          subject: "New ticket with bodyHtml",
          bodyHtml: "<p>Hello</p>",
        }),
      });
      expect(res.status()).toBe(200);
      expect(await res.json()).toHaveProperty("ticket");
    });

    test("Re: prefix is stripped from the subject", async ({ request }) => {
      const res = await request.post(WEBHOOK_URL, {
        headers: { "x-webhook-secret": WEBHOOK_SECRET },
        multipart: multipart({ ...validPayload, subject: "Re: Stripped subject test" }),
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.ticket.subject).toBe("Stripped subject test");
    });
  });

  // -------------------------------------------------------------------------
  // Thread continuation — reply appended to existing open ticket
  // -------------------------------------------------------------------------
  test.describe("Thread continuation", () => {
    const threadSubject = "Thread continuation test ticket";
    const threadPayload = { ...validPayload, subject: threadSubject };

    test("second email with same sender + subject appends a reply and returns 200", async ({ request }) => {
      const headers = { "x-webhook-secret": WEBHOOK_SECRET };

      // First email — creates the ticket.
      const first = await request.post(WEBHOOK_URL, {
        headers,
        multipart: multipart(threadPayload),
      });
      expect(first.status()).toBe(200);

      // Second email — same sender, same subject → reply appended.
      const second = await request.post(WEBHOOK_URL, {
        headers,
        multipart: multipart({ ...threadPayload, body: "This is a follow-up." }),
      });
      expect(second.status()).toBe(200);
      const body = await second.json();
      expect(body).toHaveProperty("ticket");
      expect(body.ticket.subject).toBe(threadSubject);
    });
  });
});
