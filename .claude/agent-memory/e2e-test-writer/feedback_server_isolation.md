---
name: Test server isolation — reuseExistingServer must be false for backend
description: Playwright config change required to prevent test DB pollution from dev server reuse
type: feedback
---

Set `reuseExistingServer: false` for the Express backend webServer in `playwright.config.ts`. Do NOT set it for the Vite frontend (reuse is fine there).

**Why:** When a dev server is already running on port 3001 (connected to `helpdesk` dev DB), Playwright reuses it instead of starting a fresh instance with the `testEnv` vars. This means seeded test credentials (`admin@test.com`) fail because the dev DB doesn't have them. Setting `reuseExistingServer: false` forces Playwright to always start a fresh backend with `server/.env.test` injected.

**How to apply:** Any time `playwright.config.ts` webServer entries are set up, the backend entry must have `reuseExistingServer: false`. Killing the existing server from global-setup is dangerous (SIGTERM propagates to the Playwright process group).
