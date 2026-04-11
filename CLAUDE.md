# Helpdesk — AI-Powered Ticket Management System

## Project Overview

A full-stack ticket management system that uses AI (Claude API) to auto-classify, summarize, and suggest replies for support tickets.

## Tech Stack

| Layer      | Tech                                                                   |
|------------|------------------------------------------------------------------------|
| Runtime    | Bun                                                                    |
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS, Shadcn/ui, React Router v6  |
| Backend    | Express 4, TypeScript, Better Auth                                     |
| Database   | PostgreSQL + Prisma ORM                                                |
| AI         | Claude API (Anthropic)                                                 |
| Email      | SendGrid or Mailgun                                                    |
| Deployment | Docker + cloud provider                                                |

## Monorepo Structure

```
helpdesk/
├── package.json                  # Bun workspace root (workspaces: ["client", "server"])
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
        │   └── auth.ts           # Better Auth config (Prisma adapter, emailAndPassword, role field)
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

## Environment Variables

Server (`server/.env`):

```env
PORT=3001
CLIENT_URL=http://localhost:5173
TRUSTED_ORIGINS=http://localhost:5173
BETTER_AUTH_URL=http://localhost:3001
DATABASE_URL=postgresql://user:pass@localhost:5432/helpdesk
ANTHROPIC_API_KEY=sk-ant-...
```
