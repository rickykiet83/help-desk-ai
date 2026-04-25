import "dotenv/config";

import type { AuthenticatedRequest } from './types/express';
import { auth } from "./lib/auth";
import cors from "cors";
import express from "express";
import { healthRouter } from "./routes/health";
import helmet from "helmet";
import { prisma } from "./db";
import rateLimit from "express-rate-limit";
import { requireAdmin } from './middleware/require-admin';
import { requireAuth } from './middleware/require-auth';
import { toNodeHandler } from "better-auth/node";
import { usersRouter } from "./routes/users";

if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) {
  console.error("FATAL: BETTER_AUTH_SECRET is missing or too short. Refusing to start.");
  process.exit(1);
}


const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

if (process.env.NODE_ENV === "production") {
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  });
  app.use("/api/auth", authLimiter);
}

// Must be BEFORE express.json()
app.all("/api/auth/{*any}", (req, res, next) => toNodeHandler(auth)(req, res).catch(next));

app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/users", requireAuth as express.RequestHandler, requireAdmin as express.RequestHandler, usersRouter);

app.get("/api/me", requireAuth, ((req: AuthenticatedRequest, res) => {
  const { id, email, name, role } = req.user;
  res.json({ user: { id, email, name, role } });
}) as express.RequestHandler);

app.listen(PORT, async () => {
  await prisma.$connect();
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
