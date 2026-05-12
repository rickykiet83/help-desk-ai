import { z } from "zod";
import { TicketCategory } from "../constants/ticket-category";
import { TicketStatus } from "../constants/ticket-status";

export const ticketSchema = z.object({
  id: z.number(),
  subject: z.string(),
  body: z.string(),
  status: z.enum(Object.values(TicketStatus) as [TicketStatus, ...TicketStatus[]]),
  category: z
    .enum(Object.values(TicketCategory) as [TicketCategory, ...TicketCategory[]])
    .nullable(),
  senderName: z.string().nullable(),
  senderEmail: z.string().nullable(),
  assignedToId: z.string().nullable(),
  createdAt: z.string(),
});

export type Ticket = z.infer<typeof ticketSchema>;
