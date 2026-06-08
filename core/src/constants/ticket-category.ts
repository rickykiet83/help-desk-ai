export const ticketCategories = [
  "General_Question",
  "Technical_Question",
  "Refund_Request",
] as const;

export const TicketCategory = {
  General_Question: "General_Question",
  Technical_Question: "Technical_Question",
  Refund_Request: "Refund_Request",
} as const;

export type TicketCategory = (typeof TicketCategory)[keyof typeof TicketCategory];
