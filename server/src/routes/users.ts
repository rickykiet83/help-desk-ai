import type { Request, RequestHandler } from "express";

import { Router } from "express";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "../db";

export const usersRouter = Router();

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
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email, and password are required" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

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
        role: "agent",
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

// PATCH /api/users/:id — update a user's name
usersRouter.patch("/:id", (async (req: Request, res) => {
  const id = req.params["id"] as string;
  const { name } = req.body as { name?: string };

  if (!name || !name.trim()) {
    res.status(400).json({ error: "Name is required" });
    return;
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { name: name.trim(), updatedAt: new Date() },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
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
