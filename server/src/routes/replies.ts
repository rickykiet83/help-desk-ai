import type { Request, RequestHandler } from "express";
import { parseId, validate } from "../lib/validate";

import type { AuthenticatedRequest } from "../types/express";
import { Router } from "express";
import { createReplySchema } from "@helpdesk/core";
import { prisma } from "../db";

export const repliesRouter = Router({ mergeParams: true });

// GET /api/tickets/:id/replies — list all replies for a ticket
repliesRouter.get("/", (async (req, res) => {
  const id = parseId(req.params.id, res);
  if (!id) return;

  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const replies = await prisma.reply.findMany({
    where: { ticketId: id },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, name: true } } }
  });

  res.json({
    replies: replies.map((r) => ({
      id: r.id,
      body: r.body,
      senderType: r.senderType,
      authorId: r.authorId,
      authorName: r.authorName,
      ticketId: r.ticketId,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}) as RequestHandler);

// POST /api/tickets/:id/replies — create a new agent reply
repliesRouter.post("/", (async (req: Request, res) => {
  const authedReq = req as AuthenticatedRequest;
  const id = parseId(req.params.id, res);
  if (!id) return;

  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const data = validate(createReplySchema, req.body, res);
  if (!data) return;

  const reply = await prisma.reply.create({
    data: {
      body: data.body,
      senderType: "Agent",
      authorId: authedReq.user.id,
      authorName: authedReq.user.name,
      ticketId: id,
    },
  });

  res.status(201).json({
    id: reply.id,
    body: reply.body,
    senderType: reply.senderType,
    authorId: reply.authorId,
    authorName: reply.authorName,
    ticketId: reply.ticketId,
    createdAt: reply.createdAt.toISOString(),
  });
}) as RequestHandler);
