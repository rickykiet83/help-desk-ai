import { Role } from '../generated/prisma/enums';
import { betterAuth } from "better-auth";
import { prisma } from "../db";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  basePath: '/api/auth',
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",") ?? [],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.agent,
        input: false,
      },
    },
  },
});
