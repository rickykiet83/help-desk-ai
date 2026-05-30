import type { Agent } from "../constants/agent";
import { z } from "zod";

export const agentSchema: z.ZodType<Agent> = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(3, "Name is required and must be at least 3 characters"),
  email: z.email("Invalid email address").trim(),
  password: z.string().trim().min(6, "Password must be at least 6 characters"),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(3, "Name is required and must be at least 3 characters"),
  password: z
    .string()
    .trim()
    .refine((val) => !val || val.length >= 6, "Password must be at least 6 characters")
    .optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
