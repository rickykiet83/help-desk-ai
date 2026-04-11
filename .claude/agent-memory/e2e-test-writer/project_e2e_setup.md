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
- `e2e/pages/LoginPage.ts` — POM for the login page

**Why:** Self-registration is disabled in Better Auth (`disableSignUp: true`), so agent users cannot be created via the UI — must be seeded directly via Prisma.
