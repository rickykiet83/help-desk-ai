# Help Desk AI - Ticket Management System

An AI-powered ticket management system that automatically classifies, summarizes, and suggests replies for support tickets using Claude API.

## Tech Stack

| Layer      | Technology                                                     |
|------------|----------------------------------------------------------------|
| Runtime    | Bun                                                            |
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS, Shadcn/ui, React Router v6 |
| Backend    | Express 4, TypeScript, Better Auth                             |
| Database   | PostgreSQL + Prisma ORM                                        |
| AI         | Claude API (Anthropic)                                         |
| Email      | SendGrid or Mailgun                                            |
| Deployment | Docker + cloud provider                                        |

## Project Structure

```
helpdesk/
├── package.json                  # Bun workspace root
├── client/                       # React frontend (port 5173)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── NavBar.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── ui/               # Shadcn/ui components
│   │   ├── lib/
│   │   │   ├── auth-client.ts    # Better Auth React client
│   │   │   └── utils.ts
│   │   └── pages/
│   │       ├── LoginPage.tsx
│   │       └── HomePage.tsx
│   ├── vite.config.ts            # Proxies /api/* → localhost:3001
│   └── tailwind.config.js
└── server/                       # Express backend (port 3001)
    └── src/
        ├── index.ts              # App entry — cors, auth, routes
        ├── db.ts                 # Prisma client instance
        ├── lib/
        │   └── auth.ts           # Better Auth configuration
        ├── middleware/
        │   └── require-auth.ts   # Auth guard (attaches req.user)
        ├── routes/
        │   └── health.ts         # GET /api/health
        ├── types/
        │   └── express.d.ts      # req.user type augmentation
        └── generated/prisma/     # Generated Prisma client
```

## Development Setup

### Prerequisites

- [Bun](https://bun.sh/) (latest version)
- [PostgreSQL](https://postgresql.org/)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd helpdesk

# Install all dependencies
bun install

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your configuration
```

### Environment Variables

**Server (`server/.env`):**
```env
PORT=3001
CLIENT_URL=http://localhost:5173
TRUSTED_ORIGINS=http://localhost:5173
BETTER_AUTH_URL=http://localhost:3001
DATABASE_URL=postgresql://username:password@localhost:5432/helpdesk
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-key
```

**Client (`client/.env`):**
```env
VITE_API_URL=http://localhost:3001
```

## Development Commands

```bash
# Run both client and server concurrently (from root)
bun run dev

# Run individually
cd client && bun run dev   # Vite HMR dev server
cd server && bun run dev   # Express with --watch (hot reload)

# Add dependency to specific workspace
bun add <package> --filter client
bun add <package> --filter server
```

## Database Commands (Prisma)

```bash
# Run from server/ directory
cd server

bunx prisma generate          # Regenerate Prisma client
bunx prisma migrate dev       # Run migrations
bunx prisma migrate dev --name <name>  # Create new migration
bunx prisma migrate reset     # Reset database
bunx prisma db seed           # Seed database (creates admin user)
bunx prisma studio            # Open Prisma Studio GUI
bunx prisma migrate deploy    # Deploy migrations to production
```

## Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Run migrations in container
docker-compose exec server bunx prisma migrate dev
```

## Authentication

- **Better Auth** with email/password (sign-up disabled — agents are created by admins)
- Auth endpoints mounted at `/api/auth/*`
- Protected routes use `requireAuth` middleware on the server and `ProtectedRoute` component on the client
- **User roles**: `admin`, `agent`

## Domain Model

**Ticket statuses:** Open, Resolved, Closed

**Ticket categories:** General Question, Technical Question, Refund Request

## Deployment

```bash
# Build client
cd client && bun run build

# Build server
cd server && bun run build

# Start production server
cd server && bun start

# Or with Docker
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml exec server bunx prisma migrate deploy
```

## Troubleshooting

**Database connection failed:**
```bash
brew services start postgresql
# or
docker-compose up postgres
```

**Port already in use:**
```bash
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

**Dependencies issues:**
```bash
bun pm cache rm
rm -rf node_modules
bun install
```
