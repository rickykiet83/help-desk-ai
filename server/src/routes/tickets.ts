import type { RequestHandler } from "express";
import { Router } from "express";
import { ticketListQuerySchema } from "@helpdesk/core";
import { prisma } from "../db";

export const ticketsRouter = Router();

// GET /api/tickets — list all tickets with optional server-side sorting and filtering
ticketsRouter.get("/", (async (req, res) => {
  const parsed = ticketListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid query params" });
    return;
  }
  const { sortBy, order, status, category, search } = parsed.data;

  const tickets = await prisma.ticket.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
      ...(search
        ? {
            OR: [
              { subject: { contains: search, mode: "insensitive" } },
              { senderName: { contains: search, mode: "insensitive" } },
              { senderEmail: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
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
