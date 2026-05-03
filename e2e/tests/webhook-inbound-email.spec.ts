import * as dotenv from "dotenv";
import * as path from "path";

import { expect, test } from "@playwright/test";

dotenv.config({ path: path.resolve(__dirname, "../../server/.env.test") });

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET ?? "";
const API_BASE_URL = `http://localhost:${process.env.PORT ?? 3001}`;
const WEBHOOK_URL = `${API_BASE_URL}/api/webhooks/inbound-email`;

// A valid payload that satisfies inboundEmailSchema
const validPayload = {
  from: "customer@example.com",
  fromName: "Test Customer",
  subject: "I need help with my order",
  body: "Hello, I placed an order last week and have not received it yet.",
};

// ---------------------------------------------------------------------------
// Helper — build a multipart form body from a plain object.
// Playwright's request.post accepts a `multipart` record; every value must be
// a string, Buffer, or ReadStream.
// ---------------------------------------------------------------------------
function toMultipart(fields: Record<string, string>) {
  return fields;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

// These tests create tickets in the DB (and rely on WEBHOOK_SECRET being
// constant), so serial mode avoids any ordering surprises.
test.describe.configure({ mode: "serial" });

test.describe("POST /api/webhooks/inbound-email", () => {
  // -------------------------------------------------------------------------
  // Auth / secret checks
  // -------------------------------------------------------------------------
  test.describe("Webhook secret validation", () => {
    test("missing secret returns 401", async ({ request }) => {
      const response = await request.post(WEBHOOK_URL, {
        multipart: toMultipart({
          ...validPayload,
          // No x-webhook-secret header and no ?secret= query param
        }),
      });

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body).toHaveProperty("error");
    });

    test("wrong secret in header returns 401", async ({ request }) => {
      const response = await request.post(WEBHOOK_URL, {
        headers: {
          "x-webhook-secret": "this-is-the-wrong-secret",
        },
        multipart: toMultipart(validPayload),
      });

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body).toHaveProperty("error");
    });

    test("wrong secret in query param returns 401", async ({ request }) => {
      const response = await request.post(
        `${WEBHOOK_URL}?secret=wrong-secret`,
        {
          multipart: toMultipart(validPayload),
        }
      );

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body).toHaveProperty("error");
    });
  });

  // -------------------------------------------------------------------------
  // Validation — correct secret, bad payload
  // -------------------------------------------------------------------------
  test.describe("Payload validation", () => {
    test("missing `from` field returns 400", async ({ request }) => {
      const { from: _omitted, ...withoutFrom } = validPayload;

      const response = await request.post(WEBHOOK_URL, {
        headers: { "x-webhook-secret": WEBHOOK_SECRET },
        multipart: toMultipart(withoutFrom),
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty("error");
    });

    test("invalid email in `from` field returns 400", async ({ request }) => {
      const response = await request.post(WEBHOOK_URL, {
        headers: { "x-webhook-secret": WEBHOOK_SECRET },
        multipart: toMultipart({ ...validPayload, from: "not-an-email" }),
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty("error");
    });

    test("missing `subject` field returns 400", async ({ request }) => {
      const { subject: _omitted, ...withoutSubject } = validPayload;

      const response = await request.post(WEBHOOK_URL, {
        headers: { "x-webhook-secret": WEBHOOK_SECRET },
        multipart: toMultipart(withoutSubject),
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty("error");
    });

    test("missing `body` field returns 400", async ({ request }) => {
      const { body: _omitted, ...withoutBody } = validPayload;

      const response = await request.post(WEBHOOK_URL, {
        headers: { "x-webhook-secret": WEBHOOK_SECRET },
        multipart: toMultipart(withoutBody),
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty("error");
    });

    test("missing `fromName` field returns 400", async ({ request }) => {
      const { fromName: _omitted, ...withoutFromName } = validPayload;

      const response = await request.post(WEBHOOK_URL, {
        headers: { "x-webhook-secret": WEBHOOK_SECRET },
        multipart: toMultipart(withoutFromName),
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty("error");
    });

    test("empty body after correct secret returns 400", async ({ request }) => {
      const response = await request.post(WEBHOOK_URL, {
        headers: { "x-webhook-secret": WEBHOOK_SECRET },
        multipart: {},
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty("error");
    });
  });

  // -------------------------------------------------------------------------
  // Happy path
  // -------------------------------------------------------------------------
  test.describe("Happy path", () => {
    test("valid request via header secret returns 200 { received: true }", async ({
      request,
    }) => {
      const response = await request.post(WEBHOOK_URL, {
        headers: { "x-webhook-secret": WEBHOOK_SECRET },
        multipart: toMultipart(validPayload),
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ received: true });
    });

    test("valid request via query-param secret returns 200 { received: true }", async ({
      request,
    }) => {
      const response = await request.post(
        `${WEBHOOK_URL}?secret=${WEBHOOK_SECRET}`,
        {
          multipart: toMultipart({
            ...validPayload,
            // Use a slightly different subject to distinguish from the test above
            subject: "Query param secret test",
          }),
        }
      );

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ received: true });
    });

    test("optional bodyHtml field is accepted and request succeeds", async ({
      request,
    }) => {
      const response = await request.post(WEBHOOK_URL, {
        headers: { "x-webhook-secret": WEBHOOK_SECRET },
        multipart: toMultipart({
          ...validPayload,
          bodyHtml: "<p>Hello, I placed an order last week.</p>",
        }),
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ received: true });
    });
  });
});
