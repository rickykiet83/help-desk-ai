import { Prisma } from "../generated/prisma/client";
import type { RequestHandler } from "express";
import { Router } from "express";
import { prisma } from "../db";
import { ticketListQuerySchema } from "@helpdesk/core";

export const ticketsRouter = Router();

// GET /api/tickets — list all tickets with optional server-side sorting and filtering
ticketsRouter.get("/", (async (req, res) => {
  const parsed = ticketListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid query params" });
    return;
  }

  const { sortBy, order, status, category, search, page, pageSize } = parsed.data;

  const where = {
    ...(status ? { status } : {}),
    ...(category ? { category } : {}),
    ...(search
      ? {
        OR: [
          { subject: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { senderName: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { senderEmail: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }
      : {}),
  };

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
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
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.ticket.count({ where }),
  ]);

  res.json({ tickets, total, page, pageSize });
}) as RequestHandler);
