import type { Request, RequestHandler, Response } from "express";
import { createUserSchema, updateUserSchema } from "@helpdesk/core";

import { Role } from "@/generated/prisma/enums";
import { Router } from "express";
import type { ZodType } from "zod";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "../db";

export const usersRouter = Router();

function validate<T>(schema: ZodType<T>, data: unknown, res: Response): T | null {
  const result = schema.safeParse(data);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0]?.message ?? "Invalid input" });
    return null;
  }
  return result.data;
}

// GET /api/users — list all users
usersRouter.get("/", (async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
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

// DELETE /api/users/:id — delete a non-admin user
usersRouter.delete("/:id", (async (req: Request, res) => {
  const id = req.params["id"] as string;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  if (target.role === "admin") {
    res.status(403).json({ error: "Cannot delete an admin user" });
    return;
  }

  await prisma.user.delete({ where: { id } });
  res.status(204).send();
}) as RequestHandler);
