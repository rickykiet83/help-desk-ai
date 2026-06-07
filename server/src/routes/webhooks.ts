import { SenderType, TicketStatus, inboundEmailSchema } from "@helpdesk/core";

import type { RequestHandler } from "express";
import { Router } from "express";
import { classifyTicketCategory } from "../lib/classify-ticket";
import multer from "multer";
import { prisma } from "../db";
import { requireWebhookSecret } from "../middleware/require-webhook-secret";
import sanitizeHtml from "sanitize-html";

export const router = Router();

const upload = multer();

function stripSubjectPrefixes(subject: string): string {
  return subject.replace(/^(Re:\s*|Fwd:\s*)+/i, "").trim();
}

router.post(
  "/inbound-email",
  upload.none() as RequestHandler,
  requireWebhookSecret as RequestHandler,
  (async (req, res) => {
    const parsed = inboundEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" });
      return;
    }

    const { from, fromName, subject, body, bodyHtml: rawBodyHtml } = parsed.data;
    const bodyHtml = rawBodyHtml ? sanitizeHtml(rawBodyHtml) : undefined;
    const normalizedSubject = stripSubjectPrefixes(subject);

    const existingTicket = await prisma.ticket.findFirst({
      where: {
        senderEmail: from,
        status: { notIn: [TicketStatus.Resolved, TicketStatus.Closed] },
        subject: { equals: normalizedSubject, mode: "insensitive" },
      }
    });

    if (existingTicket) {
      await prisma.reply.create({
        data: {
          body,
          bodyHtml,
          senderType: SenderType.Customer,
          authorId: null,
          authorName: fromName ?? from,
          ticketId: existingTicket.id,
        },
      });
      res.status(200).json({ ticket: existingTicket });
      return;
    }
    const ticket = await prisma.ticket.create({
      data: {
        subject: normalizedSubject,
        body,
        senderName: fromName,
        senderEmail: from,
        status: TicketStatus.Open
      },
    });

    res.status(200).json({ ticket });

    classifyTicketCategory(ticket).then((category) => {
      if (category) {
        prisma.ticket.update({ where: { id: ticket.id }, data: { category } }).catch(() => { });
      }
    }).catch(() => { });
  }) as RequestHandler
);
