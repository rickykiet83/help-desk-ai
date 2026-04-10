# Help Desk AI - Ticket Management System

An AI-powered ticket management system that automatically classifies, summarizes, and suggests replies for support tickets using Claude API.

## 🚀 Tech Stack

| Layer      | Technology                                |
|------------|-------------------------------------------|
| Runtime    | Bun                                       |
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS, React Router v6 |
| Backend    | Express 4, TypeScript, express-session    |
| Database   | PostgreSQL + Prisma ORM                   |
| AI         | Claude API (Anthropic)                    |
| Email      | SendGrid or Mailgun                       |
| Deployment | Docker + cloud provider                   |

## 📁 Project Structure

```
helpdesk/
├── package.json          # Bun workspace root
├── client/               # React frontend (port 5173)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── vite.config.ts
│   └── tailwind.config.js
└── server/               # Express backend (port 3001)
    └── src/
        ├── index.ts
        └── routes/
            └── health.ts
```

## 🛠️ Development Setup

### Prerequisites

- [Bun](https://bun.sh/) (latest version)
- [PostgreSQL](https://postgresql.org/)
- [Docker](https://docker.com/) (optional)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd help-desk-ai

# Install all dependencies
bun install

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your configuration
```

## 🏃‍♂️ Development Commands

### Bun Commands

```bash
# Run both client and server concurrently
bun run dev

# Install dependencies for all workspaces
bun install

# Add dependency to specific workspace
bun add <package> --filter client
bun add <package> --filter server

# Run commands in specific workspace
bun --filter client run build
bun --filter server run dev

# Clean all node_modules
bun run clean
```

### Individual Services

```bash
# Run client only (React + Vite)
cd client && bun run dev

# Run server only (Express)
cd server && bun run dev

# Build for production
cd client && bun run build
cd server && bun run build
```

## 🗄️ Database Commands (Prisma)

```bash
# Navigate to server directory first
cd server

# Generate Prisma client
bunx prisma generate

# Run database migrations
bunx prisma migrate dev

# Reset database
bunx prisma migrate reset

# Seed database
bunx prisma db seed

# Open Prisma Studio
bunx prisma studio

# Create new migration
bunx prisma migrate dev --name <migration-name>

# Deploy migrations to production
bunx prisma migrate deploy

# Format schema
bunx prisma format
```

## 🐳 Docker Commands

### Development with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Start services in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose build client
docker-compose build server

# Run database migrations in container
docker-compose exec server bunx prisma migrate dev
```

### Production Docker

```bash
# Build production images
docker build -t helpdesk-client ./client
docker build -t helpdesk-server ./server

# Run with production settings
docker run -p 5173:5173 helpdesk-client
docker run -p 3001:3001 helpdesk-server
```

## 🌐 Environment Variables

### Server (.env)

```env
PORT=3001
CLIENT_URL=http://localhost:5173
SESSION_SECRET=your-super-secret-session-key
BETTER_AUTH_URL=http://localhost:3001
DATABASE_URL=postgresql://username:password@localhost:5432/helpdesk
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-key
```

### Client (.env)

```env
VITE_API_URL=http://localhost:3001
```

## 🔒 Authentication & Authorization

- **Session-based authentication** using `express-session`
- **User roles**: `admin`, `agent`
- **Ticket statuses**: Open, Resolved, Closed
- **Ticket categories**: General Question, Technical Question, Refund Request

## 🚀 Deployment

### Using Docker

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Run migrations in production
docker-compose -f docker-compose.prod.yml exec server bunx prisma migrate deploy
```

### Manual Deployment

```bash
# Build client
cd client && bun run build

# Build server
cd server && bun run build

# Start production server
cd server && bun start
```

## 🧪 Testing

```bash
# Run all tests
bun test

# Run client tests
cd client && bun test

# Run server tests
cd server && bun test

# Run tests in watch mode
bun test --watch
```

## 📊 Monitoring & Debugging

```bash
# Check application health
curl http://localhost:3001/api/health

# View application logs
docker-compose logs -f server
docker-compose logs -f client

# Database connection test
cd server && bunx prisma db pull
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development servers |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run test` | Run test suite |
| `bun run lint` | Run ESLint |
| `bun run format` | Format code with Prettier |

## 🆘 Troubleshooting

### Common Issues

**Database connection failed:**
```bash
# Check PostgreSQL is running
brew services start postgresql
# or
docker-compose up postgres
```

**Port already in use:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

**Dependencies issues:**
```bash
# Clear Bun cache
bun pm cache rm

# Reinstall dependencies
rm -rf node_modules
bun install
```

## 📞 Support

For support and questions, please create an issue in the repository.