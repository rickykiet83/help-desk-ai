import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import { healthRouter } from "./routes/health";
import { prisma } from "./db";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  })
);

app.use("/api/health", healthRouter);

app.listen(PORT, async () => {
  await prisma.$connect();
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
