import "dotenv/config";

import { Role } from '../src/generated/prisma/enums';
import { hashPassword } from "better-auth/crypto";
import { prisma } from "../src/db";

const email = process.env.SEED_ADMIN_EMAIL;
const password = process.env.SEED_ADMIN_PASSWORD;

if (!email || !password) {
  throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set.");
}

async function seed(email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`User ${email} already exists — skipping.`);
    return;
  }

  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      email,
      name: "Admin",
      emailVerified: true,
      role: Role.admin,
      createdAt: new Date(),
      updatedAt: new Date(),
      accounts: {
        create: {
          id: crypto.randomUUID(),
          accountId: email,
          providerId: "credential",
          password: hashed,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    },
  });

  console.log(`Created admin: ${user.email} (${user.id})`);
}

seed(email, password)
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
