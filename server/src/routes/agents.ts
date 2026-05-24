import type { RequestHandler } from "express";
import { Router } from "express";
import { Role } from "@helpdesk/core";
import { prisma } from "../db";

export const agentsRouter = Router();

// GET /api/agents — list all active agents
agentsRouter.get("/", (async (_req, res) => {
  const agents = await prisma.user.findMany({
    where: { role: Role.agent, deletedAt: null },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
  res.json({ agents });
}) as RequestHandler);
