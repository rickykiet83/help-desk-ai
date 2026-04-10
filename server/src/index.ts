import "dotenv/config";

import { auth } from "./lib/auth";
import cors from "cors";
import express from "express";
import { healthRouter } from "./routes/health";
import { prisma } from "./db";
import { requireAuth } from './middleware/require-auth';
import { toNodeHandler } from "better-auth/node";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Must be BEFORE express.json()
app.all("/api/auth/{*any}", (req, res, next) => toNodeHandler(auth)(req, res).catch(next));

app.use(express.json());

app.use("/api/health", healthRouter);

app.get("/api/me", requireAuth, (req, res) => {
  res.json({ user: req.user, session: req.session })
});

app.listen(PORT, async () => {
  await prisma.$connect();
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
