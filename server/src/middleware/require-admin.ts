import { NextFunction, Request, Response } from "express";
import { Role } from "@helpdesk/core";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.user.role !== Role.admin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}
