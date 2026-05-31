import { z } from "zod";

export const inboundEmailSchema = z
  .object({
    from: z.email('Invalid email address').max(255, 'Email address is too long'),
    fromName: z.string().min(1, 'Sender name is required').max(255, 'Sender name is too long'),
    subject: z.string().min(1, 'Subject is required').max(255, 'Subject is too long'),
    body: z.string().min(1, 'Body is required').max(1000, 'Body is too long'),
    bodyHtml: z.string().max(2000, 'HTML body is too long').optional(),
  });

export type InboundEmail = z.infer<typeof inboundEmailSchema>;
