export const TicketStatus = {
  Open: "Open",
  Resolved: "Resolved",
  Closed: "Closed",
} as const;

export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];
