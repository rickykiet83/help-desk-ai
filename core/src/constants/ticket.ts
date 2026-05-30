import { TicketCategory } from "./ticket-category";
import { TicketStatus } from "./ticket-status";

export interface Ticket {
  id: number;
  subject: string;
  body: string;
  status: TicketStatus;
  category: TicketCategory | null;
  senderName: string | null;
  senderEmail: string | null;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
}
