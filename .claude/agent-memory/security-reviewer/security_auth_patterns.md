---
name: Auth & RBAC Security Patterns
description: Known vulnerabilities and security controls in the helpdesk auth/RBAC implementation, found during initial audit
type: project
---

No server-side `requireAdmin` middleware exists — all admin-only enforcement is client-side only (AdminRoute.tsx). Any future admin API routes must add server-side role checks manually; there is no shared guard to reach for.

**Why:** The role field is stored in Better Auth additionalFields with `input: false`, which correctly prevents client-supplied role escalation on signup. However, no server middleware enforces the admin role for protected endpoints.

**How to apply:** When reviewing or building admin API routes (user management, etc.), always flag missing server-side role checks. The pattern to recommend is a `requireAdmin` middleware that checks `req.user.role === "admin"` after `requireAuth`.

---

BETTER_AUTH_SECRET is present in .env.example but not validated at startup — empty string is the example default, which is a critical misconfiguration risk.

The seed script uses hardcoded fallback credentials (`admin@example.com` / `password123`) when env vars are not set.

The `/api/me` endpoint returns the full session object including `session` (token, IP, user agent) — this is more data than most clients need and increases exposure surface.

`req.user` and `req.session` are typed as optional (`?`) in express.d.ts, requiring defensive null checks in every route handler that uses them after `requireAuth`.
