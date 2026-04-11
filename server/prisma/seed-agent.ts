/**
 * Seeds a test agent user into the test database.
 * Run via global-setup.ts after prisma migrate reset + seed.ts.
 *
 * Uses the same pattern as seed.ts so it works with the test
 * DATABASE_URL injected by global-setup.
 */
import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "../src/db";

const email = "agent@test.com";
const password = "agentpassword123";

async function seedAgent() {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Agent ${email} already exists — skipping.`);
    return;
  }

  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      email,
      name: "Test Agent",
      emailVerified: true,
      role: "agent",
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

  console.log(`Created agent: ${user.email} (${user.id})`);
}

seedAgent()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
