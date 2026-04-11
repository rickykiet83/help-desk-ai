import { Role } from '../generated/prisma/enums';
import { admin } from "better-auth/plugins";
import { betterAuth } from "better-auth";
import { prisma } from "../db";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  basePath: '/api/auth',
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",") ?? ["http://localhost:5173"],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 6,
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
  plugins: [
    admin({
      adminRoles: ["admin"],
      defaultRole: Role.agent,
    }),
  ],
});
