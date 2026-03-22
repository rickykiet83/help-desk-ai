# Helpdesk — AI-Powered Ticket Management System

## Project Overview

A full-stack ticket management system that uses AI (Claude API) to auto-classify, summarize, and suggest replies for support tickets.

## Tech Stack

| Layer      | Tech                                      |
|------------|-------------------------------------------|
| Runtime    | Bun                                       |
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS, React Router v6 |
| Backend    | Express 4, TypeScript, express-session    |
| Database   | PostgreSQL + Prisma ORM                   |
| AI         | Claude API (Anthropic)                    |
| Email      | SendGrid or Mailgun                       |
| Deployment | Docker + cloud provider                   |

## Monorepo Structure

```
helpdesk/
├── package.json          # Bun workspace root (workspaces: ["client", "server"])
├── client/               # React + Vite frontend (port 5173)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css     # Tailwind directives
│   ├── vite.config.ts    # Proxies /api/* → localhost:3001
│   └── tailwind.config.js
└── server/               # Express backend (port 3001)
    └── src/
        ├── index.ts      # App entry point — cors, session, routes
        └── routes/
            └── health.ts # GET /api/health
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

- Client: http://localhost:5173
- Server: http://localhost:3001
- Vite proxies `/api/*` to the server, so no CORS issues in dev

## Domain Model

**Ticket statuses:** Open, Resolved, Closed

**Ticket categories:** General Question, Technical Question, Refund Request

**User roles:**
- `admin` — seeded at deploy time; can create/manage agents
- `agent` — created by admin; can view and manage tickets

## Auth

Session-based authentication via `express-session`. Session cookie is `httpOnly`, `secure` in production only.

## Environment Variables

Server (`server/.env`):
```
PORT=3001
CLIENT_URL=http://localhost:5173
SESSION_SECRET=your-secret-here
DATABASE_URL=postgresql://user:pass@localhost:5432/helpdesk
ANTHROPIC_API_KEY=sk-ant-...
```
