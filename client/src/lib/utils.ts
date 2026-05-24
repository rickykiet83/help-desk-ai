import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { TicketStatus, TicketCategory } from "@helpdesk/core"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const TICKET_STATUS_STYLES: Record<TicketStatus, string> = {
  Open: "bg-blue-100 text-blue-700",
  Resolved: "bg-green-100 text-green-700",
  Closed: "bg-gray-100 text-gray-600",
};

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  General_Question: "General Question",
  Technical_Question: "Technical Question",
  Refund_Request: "Refund Request",
};

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
