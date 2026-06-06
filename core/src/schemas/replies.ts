import { z } from "zod";

export const SenderType = { Agent: "Agent", Customer: "Customer" } as const;
export type SenderType = (typeof SenderType)[keyof typeof SenderType];

export const replySchema = z.object({
  id: z.number(),
  body: z.string(),
  bodyHtml: z.string().nullable(),
  senderType: z.enum(["Agent", "Customer"]),
  authorId: z.string().nullable(),
  authorName: z.string(),
  ticketId: z.number(),
  createdAt: z.string(),
});

export type Reply = z.infer<typeof replySchema>;

export const createReplySchema = z.object({
  body: z.string().min(1, "Reply cannot be empty"),
});

export type CreateReplyInput = z.infer<typeof createReplySchema>;

export const polishReplySchema = z.object({
  body: z.string().min(1, "Reply body is required").max(1000),
});

export type PolishReplyInput = z.infer<typeof polishReplySchema>;