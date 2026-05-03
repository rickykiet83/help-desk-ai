import type { NextFunction, Request, Response } from "express";

export function requireWebhookSecret(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    res.status(500).json({ error: "WEBHOOK_SECRET is not configured" });
    return;
  }
  const { signature } = req.body as Record<string, string>;
  if (signature !== secret) {
    res.status(401).json({ error: "Invalid webhook signature" });
    return;
  }
  next();
}
