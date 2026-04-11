import "dotenv/config";

if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) {
  console.error("FATAL: BETTER_AUTH_SECRET is missing or too short. Refusing to start.");
  process.exit(1);
}

import { auth } from "./lib/auth";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { healthRouter } from "./routes/health";
import { prisma } from "./db";
import { requireAuth } from './middleware/require-auth';
import { toNodeHandler } from "better-auth/node";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

app.use("/api/auth", authLimiter);

// Must be BEFORE express.json()
app.all("/api/auth/{*any}", (req, res, next) => toNodeHandler(auth)(req, res).catch(next));

app.use(express.json());

app.use("/api/health", healthRouter);

app.get("/api/me", requireAuth, (req, res) => {
  const { id, email, name, role } = req.user!;
  res.json({ user: { id, email, name, role } });
});

app.listen(PORT, async () => {
  await prisma.$connect();
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
