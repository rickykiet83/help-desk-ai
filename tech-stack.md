# Tech Stack

## Frontend

- React 18 with TypeScript
- Vite (dev server, port 5173)
- Tailwind CSS
- Shadcn/ui component library
- React Router v6

## Backend

- Bun runtime
- Express 4 with TypeScript (port 3001)
- Better Auth — session-based authentication (email/password, sign-up disabled)
  - Server: `better-auth` with Prisma adapter
  - Client: `better-auth/react` (`createAuthClient`)

## Database

- PostgreSQL
- Prisma ORM (client generated to `server/src/generated/prisma/`)

## AI

- Claude API (Anthropic) for ticket classification, summaries, and suggested replies

## Email

- SendGrid or Mailgun for outbound replies and inbound webhooks

## Deployment

- Docker + cloud provider (AWS, Railway, Fly.io, etc.)
