import type { Request, RequestHandler } from "express";
import { createUserSchema, updateUserSchema } from "@helpdesk/core";

import { Role } from "@helpdesk/core";
import { Router } from "express";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "../db";
import { validate } from "../lib/validate";

export const usersRouter = Router();

// GET /api/users — list all users (excludes soft-deleted by default; ?includeDeleted=true to include)
usersRouter.get("/", (async (req, res) => {
  const includeDeleted = req.query["includeDeleted"] === "true";
  const users = await prisma.user.findMany({
    where: includeDeleted ? undefined : { deletedAt: null },
    select: { id: true, name: true, email: true, role: true, createdAt: true, deletedAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ users });
}) as RequestHandler);

// POST /api/users — create a new agent
usersRouter.post("/", (async (req, res) => {
  const data = validate(createUserSchema, req.body, res);
  if (!data) return;

  const { name, email, password } = data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "A user with this email already exists" });
    return;
  }

  const hashedPassword = await hashPassword(password);
  const userId = crypto.randomUUID();
  const now = new Date();

  await prisma.$transaction([
    prisma.user.create({
      data: {
        id: userId,
        name,
        email,
        emailVerified: false,
        role: Role.agent,
        createdAt: now,
        updatedAt: now,
      },
    }),
    prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: userId,
        providerId: "credential",
        userId,
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
      },
    }),
  ]);

  res.status(201).json({ message: "User created" });
}) as RequestHandler);

// PATCH /api/users/:id — update a user's name and optionally their password
usersRouter.patch("/:id", (async (req: Request, res) => {
  const id = req.params["id"] as string;

  const data = validate(updateUserSchema, req.body, res);
  if (!data) return;

  const { name, password } = data;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const now = new Date();

  const [updated] = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id },
      data: { name: name.trim(), updatedAt: now },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (password) {
      const hashedPassword = await hashPassword(password);
      await tx.account.updateMany({
        where: { userId: id, providerId: "credential" },
        data: { password: hashedPassword, updatedAt: now },
      });
    }

    return [user];
  });

  res.json({ user: updated });
}) as RequestHandler);

// DELETE /api/users/:id — soft-delete a non-admin user
usersRouter.delete("/:id", (async (req: Request, res) => {
  const id = req.params["id"] as string;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  if (target.role === Role.admin) {
    res.status(403).json({ error: "Cannot delete an admin user" });
    return;
  }
  if (target.deletedAt) {
    res.status(409).json({ error: "User is already deleted" });
    return;
  }

  await prisma.$transaction([
    prisma.ticket.updateMany({ where: { assignedToId: id }, data: { assignedToId: null } }),
    prisma.user.update({ where: { id }, data: { deletedAt: new Date() } }),
  ]);
  res.status(204).send();
}) as RequestHandler);

// POST /api/users/:id/restore — restore a soft-deleted user
usersRouter.post("/:id/restore", (async (req: Request, res) => {
  const id = req.params["id"] as string;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  if (!target.deletedAt) {
    res.status(409).json({ error: "User is not deleted" });
    return;
  }

  await prisma.user.update({ where: { id }, data: { deletedAt: null } });
  res.status(204).send();
}) as RequestHandler);
