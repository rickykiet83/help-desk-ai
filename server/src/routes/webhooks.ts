import { TicketStatus, inboundEmailSchema } from "@helpdesk/core";

import type { RequestHandler } from "express";
import { Router } from "express";
import { classifyTicketCategory } from "../lib/ai";
import multer from "multer";
import { prisma } from "../db";
import { requireWebhookSecret } from "../middleware/require-webhook-secret";

export const router = Router();

const upload = multer();

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

    const { from, fromName, subject, body } = parsed.data;

    const category = await classifyTicketCategory(subject, body);

    await prisma.ticket.create({
      data: { subject, body, senderName: fromName, senderEmail: from, category, status: TicketStatus.Open },
    });

    res.json({ received: true });
  }) as RequestHandler
);
