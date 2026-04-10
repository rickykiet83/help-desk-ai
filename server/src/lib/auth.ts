import { betterAuth } from "better-auth";
import { prisma } from "../db";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  basePath: '/api/auth',
  trustedOrigins: [process.env.CLIENT_URL || "http://localhost:5173"],
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
        defaultValue: "agent",
        input: false,
      },
    },
  },
});
