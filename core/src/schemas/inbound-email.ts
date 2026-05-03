import { z } from "zod";

export const inboundEmailSchema = z
  .object({
    from: z.email('Invalid email address'),
    fromName: z.string().min(1, 'Sender name is required'),
    subject: z.string().min(1, 'Subject is required'),
    body: z.string().min(1, 'Body is required'),
    bodyHtml: z.string().optional()
  });

export type InboundEmail = z.infer<typeof inboundEmailSchema>;
