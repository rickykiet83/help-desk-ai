import type { RequestHandler } from "express";
import { Router } from "express";
import { prisma } from "../db";

export const ticketsRouter = Router();

// GET /api/tickets — list all tickets, newest first
ticketsRouter.get("/", (async (_req, res) => {
  const tickets = await prisma.ticket.findMany({
    select: {
      id: true,
      subject: true,
      body: true,
      status: true,
      category: true,
      senderName: true,
      senderEmail: true,
      assignedToId: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ tickets });
}) as RequestHandler);
