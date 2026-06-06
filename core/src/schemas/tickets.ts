import type { Ticket } from "../constants/ticket";
import { TicketCategory } from "../constants/ticket-category";
import { TicketStatus } from "../constants/ticket-status";
import { z } from "zod";

export const ticketSchema: z.ZodType<Ticket> = z.object({
  id: z.number(),
  subject: z.string(),
  body: z.string(),
  status: z.enum(Object.values(TicketStatus) as [TicketStatus, ...TicketStatus[]]),
  category: z
    .enum(Object.values(TicketCategory) as [TicketCategory, ...TicketCategory[]])
    .nullable(),
  aiSummary: z.string().nullable(),
  senderName: z.string().nullable(),
  senderEmail: z.string().nullable(),
  assignedToId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const sortableColumns = ["id", "subject", "status", "category", "createdAt", "senderName"] as const;

export const ticketListQuerySchema = z.object({
  sortBy: z.enum(sortableColumns).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  status: z.enum(Object.values(TicketStatus) as [TicketStatus, ...TicketStatus[]]).optional(),
  category: z.enum(Object.values(TicketCategory) as [TicketCategory, ...TicketCategory[]]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export type TicketQuery = z.infer<typeof ticketListQuerySchema>;

export const assignTicketSchema = z.object({
  assignedToId: z.string().nullable(),
});

export const updateTicketSchema = z.object({
  assignedToId: z.string().nullable().optional(),
  status: z.enum(Object.values(TicketStatus) as [TicketStatus, ...TicketStatus[]]).optional(),
  category: z
    .enum(Object.values(TicketCategory) as [TicketCategory, ...TicketCategory[]])
    .nullable()
    .optional(),
});
