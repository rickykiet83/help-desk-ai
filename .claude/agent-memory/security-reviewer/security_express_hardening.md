---
name: Express Hardening Status
description: Missing and present Express security middleware in the helpdesk server as of initial audit
type: project
---

Missing as of audit (2026-04-11):
- `helmet` — no secure HTTP headers (X-Frame-Options, CSP, HSTS, etc.)
- Rate limiting — no rate limiter on /api/auth/* or any route
- express.json() body size limit — no `limit` option set, default is 100kb but should be explicit
- No `BETTER_AUTH_SECRET` startup validation

Present:
- CORS restricted to `CLIENT_URL` env var (single origin, credentials: true) — correct
- `trustedOrigins` in Better Auth reads from `TRUSTED_ORIGINS` env var — correct
- `disableSignUp: true` in Better Auth — self-registration blocked
- `role` additionalField has `input: false` — client cannot supply role on signup
- Prisma ORM used for all DB access — no raw query concatenation found
- Auth handler mounted before express.json() — correct per Better Auth docs

**How to apply:** When reviewing new routes or server changes, always check for helmet, rate limiting, and body size limits first — they are not present and need to be added before production deployment.
