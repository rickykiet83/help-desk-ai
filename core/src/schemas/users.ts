import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Invalid email address").trim(),
  password: z.string().trim().min(6, "Password must be at least 6 characters"),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
