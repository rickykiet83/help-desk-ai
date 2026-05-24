import type { RequestHandler } from "express";
import { Router } from "express";
import { prisma } from "../db";
import { ticketListQuerySchema } from "@helpdesk/core";

export const ticketsRouter = Router();

// GET /api/tickets — list all tickets with optional server-side sorting
ticketsRouter.get("/", (async (req, res) => {
  const parsed = ticketListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid query params" });
    return;
  }
  const { sortBy, order } = parsed.data;
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
    orderBy: { [sortBy]: order },
  });
  res.json({ tickets });
}) as RequestHandler);
