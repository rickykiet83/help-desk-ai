import type { Request, RequestHandler } from "express";
import { ticketListQuerySchema, updateTicketSchema } from "@helpdesk/core";

import { Prisma } from "../generated/prisma/client";
import { Router } from "express";
import { prisma } from "../db";
import { validate } from "../lib/validate";

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
        updatedAt: true,
      },
      orderBy: { [sortBy]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.ticket.count({ where }),
  ]);

  res.json({ tickets, total, page, pageSize });
}) as RequestHandler);

// GET /api/tickets/:id — get a single ticket by ID
ticketsRouter.get("/:id", (async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id },
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
      updatedAt: true,
    },
  });

  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  res.json(ticket);
}) as RequestHandler);

// PATCH /api/tickets/:id — update assignee, status, or category
ticketsRouter.patch("/:id", (async (req: Request, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const data = validate(updateTicketSchema, req.body, res);
  if (!data) return;

  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  if (data.assignedToId != null) {
    const agent = await prisma.user.findUnique({
      where: { id: data.assignedToId },
      select: { role: true, deletedAt: true },
    });
    if (!agent || agent.role !== "agent" || agent.deletedAt !== null) {
      res.status(422).json({ error: "assignedToId must refer to an active agent" });
      return;
    }
  }

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      ...(data.assignedToId !== undefined ? { assignedToId: data.assignedToId } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
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
      updatedAt: true,
    },
  });

  res.json(updated);
}) as RequestHandler);
