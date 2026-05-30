---
name: E2E test infrastructure and credentials
description: How the Playwright test suite is structured, seeded, and what credentials are used
type: project
---

**Test DB:** `helpdesk_test` — a separate PostgreSQL DB in the same Docker container. Seeded fresh on every `bun test:e2e` run via `e2e/global-setup.ts` which runs `prisma migrate reset --force` then `prisma/seed.ts` (admin) and `prisma/seed-agent.ts` (agent).

**Seeded credentials:**
- Admin: `admin@test.com` / `testpassword123`
- Agent: `agent@test.com` / `agentpassword123`

**agent seed script:** `server/prisma/seed-agent.ts` — mirrors `seed.ts` pattern, runs with `cwd: serverDir` in global-setup so it can import from `better-auth/crypto` and `../src/db`.

**Test files:**
- `e2e/tests/auth.spec.ts` — 16 auth tests covering login happy path, validation, server errors, protected routes, RBAC, and logout
- `e2e/tests/soft-delete.spec.ts` — 7 tests covering delete flow, restore flow, persistence, and admin protection (serial mode)
- `e2e/tests/webhook-inbound-email.spec.ts` — 12 API-only tests for POST /api/webhooks/inbound-email: secret validation (missing/wrong via header and query), payload validation (missing fields, invalid email), happy path (header secret, query-param secret, optional bodyHtml field)
- `e2e/tests/ticket-detail.spec.ts` — 7 tests for /tickets/:id: rendering (h1, status badge, from field, body, back link), status update via select, empty reply thread, unauthenticated redirect (serial mode)
- `e2e/pages/LoginPage.ts` — POM for the login page
- `e2e/pages/UsersPage.ts` — POM for /users: rowFor(), statusBadgeFor(), deleteUser(), restoreUser(), edit/delete/restore button locators
- `e2e/pages/TicketDetailPage.ts` — POM for /tickets/:id: heading, statusBadge, backLink, messageBody, statusSelect, categorySelect, assignedToSelect, noRepliesText, goto(ticketId), getStatusBadgeText(), getStatusSelectValue()

**Webhook secret in tests:** `requireWebhookSecret` middleware reads from `x-webhook-secret` header or `?secret=` query param — NOT `req.body.signature`. `WEBHOOK_SECRET` is set to `"test-webhook-secret"` in `server/.env.test`. Since `testEnv` is only passed to the webServer process (not the test runner), webhook tests hardcode this known value as a constant in the spec file.

**Why:** Self-registration is disabled in Better Auth (`disableSignUp: true`), so agent users cannot be created via the UI — must be seeded directly via Prisma.

**Serial mode for shared-user tests:** Any test suite that mutates a single seeded user's state (e.g., soft-delete) MUST use `test.describe.configure({ mode: "serial" })`. With `fullyParallel: true` (7 workers default), parallel tests race on the same DB row and produce flaky results. Serial mode coalesces the suite to 1 worker without affecting other files.

**afterEach restore pattern:** After a test that may soft-delete the agent, restore in `afterEach` by navigating to `/users` directly (not via `loginAsAdmin` — the session is still active and `loginAsAdmin` would bounce back to `/` if already authenticated, causing `LoginPage.goto()` to time out waiting for "Sign in" button).
