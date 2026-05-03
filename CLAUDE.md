# Helpdesk — AI-Powered Ticket Management System

## Project Overview

A full-stack ticket management system that uses AI (Claude API) to auto-classify, summarize, and suggest replies for support tickets.

## Tech Stack

| Layer      | Tech                                                                   |
|------------|------------------------------------------------------------------------|
| Runtime    | Bun                                                                    |
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS, Shadcn/ui, React Router v6, Axios, TanStack Query, React Hook Form + Zod  |
| Backend    | Express 4, TypeScript, Better Auth                                     |
| Database   | PostgreSQL + Prisma ORM                                                |
| AI         | Claude API (Anthropic)                                                 |
| Email      | SendGrid or Mailgun                                                    |
| Deployment | Docker + cloud provider                                                |

## Monorepo Structure

```
helpdesk/
├── package.json                  # Bun workspace root (workspaces: ["client", "server", "core"])
├── core/                         # Shared package (@helpdesk/core) — Zod schemas and inferred types
│   └── src/
│       ├── index.ts
│       └── schemas/              # One file per domain (e.g. users.ts)
├── client/                       # React + Vite frontend (port 5173)
│   ├── src/
│   │   ├── App.tsx               # Route definitions
│   │   ├── main.tsx
│   │   ├── index.css             # Tailwind directives
│   │   ├── components/
│   │   │   ├── Layout.tsx        # Shared page shell (NavBar + Outlet)
│   │   │   ├── NavBar.tsx        # Shows "Users" link for admins
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── AdminRoute.tsx    # Redirects non-admins to /
│   │   │   └── ui/               # Shadcn/ui components (button, card, input, label, alert)
│   │   ├── lib/
│   │   │   ├── auth-client.ts    # Better Auth React client with inferAdditionalFields plugin
│   │   │   └── utils.ts          # cn() helper for Tailwind class merging
│   │   └── pages/
│   │       ├── LoginPage.tsx
│   │       ├── HomePage.tsx
│   │       └── UsersPage.tsx     # Admin-only users management page
│   ├── vite.config.ts            # Proxies /api/* → localhost:3001
│   └── tailwind.config.js
└── server/                       # Express backend (port 3001)
    ├── prisma/
    │   └── seed.ts               # Seeds admin user from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD env vars
    └── src/
        ├── index.ts              # App entry — cors, auth handler, routes
        ├── db.ts                 # Prisma client singleton
        ├── lib/
        │   ├── auth.ts           # Better Auth config (Prisma adapter, emailAndPassword, role field)
        │   └── validate.ts       # validate<T>(schema, data, res) — parses with Zod, sends 400 on failure
        ├── middleware/
        │   └── require-auth.ts   # Calls auth.api.getSession(); attaches req.user / req.session
        ├── routes/
        │   └── health.ts         # GET /api/health
        ├── types/
        │   └── express.d.ts      # Augments Express Request with user and session fields
        └── generated/prisma/     # Generated Prisma client output
```

## Commands

```bash
# Install all dependencies (run from root)
bun install

# Run both apps (from root)
bun run dev

# Run individually
cd server && bun run dev   # Express with --watch (hot reload)
cd client && bun run dev   # Vite HMR dev server

# E2E tests
bun test:e2e               # Run Playwright tests (resets test DB, seeds, starts both servers)
```

## Ports

- Client: <http://localhost:5173>
- Server: <http://localhost:3001>
- Vite proxies `/api/*` to the server, so no CORS issues in dev

## Domain Model

**Ticket statuses:** Open, Resolved, Closed

**Ticket categories:** General Question, Technical Question, Refund Request

**User roles:**

- `admin` — seeded at deploy time; can create/manage agents
- `agent` — created by admin; can view and manage tickets

Always import and use `Role` from `@helpdesk/core` — never use bare `"admin"` or `"agent"` strings. This applies to both client and server. The Prisma-generated Role enum (`@/generated/prisma/enums`) is not the canonical source; `@helpdesk/core` is.

```ts
import { Role } from "@helpdesk/core";
// ✓ Role.admin, Role.agent
// ✗ "admin", "agent"
```

## Authentication

Auth is handled by **Better Auth** with email/password strategy. Self-registration is disabled — agents are created by admins only.

### Server

- `server/src/lib/auth.ts` — configures Better Auth with the Prisma adapter, `disableSignUp: true`, and a custom `role` field (`"agent"` by default) on the user model.
- `server/src/index.ts` — mounts Better Auth at `/api/auth/*` via `toNodeHandler(auth)`. **Must be registered before `express.json()`.**
- `server/src/middleware/require-auth.ts` — calls `auth.api.getSession()` with request headers; attaches `req.user` and `req.session`, or returns 401.
- `server/src/types/express.d.ts` — augments the Express `Request` type with `user` and `session` typed from `auth.$Infer.Session`.

### Client

- `client/src/lib/auth-client.ts` — creates the Better Auth client via `createAuthClient()`, exporting `signIn`, `signOut`, and `useSession`. Uses the `inferAdditionalFields<typeof auth>()` plugin so that `session.user.role` is correctly typed.
- `client/src/components/ProtectedRoute.tsx` — reads `useSession()`; shows a spinner while pending, redirects to `/login` if no session, renders `<Outlet />` otherwise.
- `client/src/components/AdminRoute.tsx` — extends `ProtectedRoute` behavior; additionally redirects to `/` if `session.user.role !== "admin"`.
- Route layout in `App.tsx`: `/login` is public; all other routes are wrapped in `<ProtectedRoute>` → `<Layout>`; admin-only routes are further wrapped in `<AdminRoute>`.

## Shadcn/ui

Components live in `client/src/components/ui/` and are copied in directly (not imported from a package). Currently installed:

- `alert`
- `button`
- `card`
- `input`
- `label`

To add a new component: `bunx shadcn@latest add <component>` from the `client/` directory. The `cn()` utility in `lib/utils.ts` merges Tailwind classes using `clsx` + `tailwind-merge`.

## Data Validation

Use **Zod** for all runtime data validation — on both client and server.

- Define schemas with `z.object(...)` and infer TypeScript types with `z.infer<typeof schema>`.
- **Shared schemas belong in `core/src/schemas/`** (package `@helpdesk/core`) and are imported by both client and server. Never duplicate a schema — if it's used in more than one package, it lives in `core`.
- On the server, validate request bodies using the `validate` helper from `server/src/lib/validate.ts`. It parses with Zod, sends a `400` with the first error message on failure, and returns `null` — call it and guard with `if (!data) return`.

```ts
import { validate } from "../lib/validate";

const data = validate(mySchema, req.body, res);
if (!data) return;
```

All client-side forms use **React Hook Form** (`react-hook-form`) with the Zod resolver (`@hookform/resolvers/zod`). Never use uncontrolled `useState` for form fields.

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(3, "Name is required and must be at least 3 characters"),
  email: z.string().email("Invalid email"),
});
type FormData = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

## Data Fetching

All client-side HTTP requests use **Axios** (`axios`) and all server state is managed with **TanStack Query** (`@tanstack/react-query`).

- A shared axios instance with `withCredentials: true` is created per-page or in a shared module — do not use `fetch` directly.
- Use `useQuery` for reads and `useMutation` for writes.
- After a successful mutation, call `queryClient.invalidateQueries` to keep the cache in sync.
- Catch axios errors with `axios.isAxiosError(err)` and extract the message from `err.response?.data?.error`. Map specific status codes (e.g. 409) to user-friendly messages before throwing.
- The `QueryClientProvider` is mounted in `client/src/main.tsx`.

## Component Testing

Vitest + React Testing Library is configured in `client/`. Tests live next to the components they test in a `__tests__/` subfolder.

```
client/src/
├── test/
│   ├── setup.ts          # Imports @testing-library/jest-dom (runs before every test file)
│   └── render.tsx        # Shared renderWithClient() helper — wraps UI in QueryClientProvider
└── pages/
    └── __tests__/
        ├── UsersTable.test.tsx
        └── UsersPage.test.tsx
```

### Running tests

```bash
# From repo root
bun run test:unit          # Single run
# From client/
bunx vitest                # Watch mode
bunx vitest run            # Single run
```

> **Do NOT use `bun test`** — that runs Bun's native runner, not Vitest.

### Writing tests

**Rendering:** use `renderWithClient` for any component that depends on TanStack Query. It creates a fresh `QueryClient` (with `retry: false`) per test.

```tsx
import { renderWithClient } from "@/test/render";
renderWithClient(<MyPage />);
```

Plain `render` from `@testing-library/react` is fine for presentational components with no query hooks.

**Mocking axios:** the axios instance is created at module level with `axios.create()`. Use `vi.hoisted` so the mock is available before the module loads, then `vi.mock` to intercept `create`.

```ts
const mockAxiosInstance = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    create: () => mockAxiosInstance,
    isAxiosError: (err: unknown): boolean =>
      err instanceof Object && "response" in (err as object),
  },
}));
```

Reset mocks between tests with `beforeEach(() => vi.clearAllMocks())`.

**Async data:** use `waitFor` to assert after queries resolve.

```ts
await waitFor(() => expect(screen.getByText("Bob Agent")).toBeInTheDocument());
```

**mutateAsync:** always append `.catch(() => {})` on `mutateAsync` calls in `onSubmit` handlers — errors are displayed via `mutation.error`, and swallowing the rejection prevents unhandled-rejection warnings in tests.

## E2E Testing

Playwright is configured at the repo root. Tests live in `e2e/`.

```
helpdesk/
├── playwright.config.ts          # Root config — baseURL, webServer, globalSetup
├── tsconfig.json                 # Root TS config scoped to e2e/ and playwright.config.ts
└── e2e/
    ├── global-setup.ts           # Resets + migrates + seeds helpdesk_test before each run
    └── global-teardown.ts        # Placeholder
```

**Test database:** `helpdesk_test` — a separate database in the same Docker PostgreSQL container as dev. Created once with:

```bash
docker exec helpdesk-db-1 createdb -U helpdesk helpdesk_test
```

The global setup runs `prisma migrate reset --force` (with `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION`) then seeds an admin user (`admin@test.com` / `testpassword123`) from `server/.env.test`.

The server webServer process receives env vars from `server/.env.test` (injected by `playwright.config.ts`), so it connects to `helpdesk_test` and never touches dev data.

Rate limiting (`express-rate-limit`) is **production-only** (`NODE_ENV === "production"`), so it does not interfere with tests.

**Writing tests:** Use the `e2e-test-writer` subagent. It has full context on the Playwright setup, test conventions, page object model patterns, and auth helpers for this project.

## Environment Variables

Server (`server/.env`):

```env
PORT=3001
CLIENT_URL=http://localhost:5173
BETTER_AUTH_URL=http://localhost:3001
DATABASE_URL=postgresql://user:pass@localhost:5432/helpdesk
ANTHROPIC_API_KEY=sk-ant-...
BETTER_AUTH_SECRET=""
SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_PASSWORD="password123"
TRUSTED_ORIGINS="http://localhost:5173"
WEBHOOK_SECRET=<from Mailgun dashboard under Routes>
```
