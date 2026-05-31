import type { Agent, Ticket } from "@helpdesk/core";
import { TICKET_CATEGORY_LABELS, TICKET_STATUS_STYLES, formatDate, sanitize } from "@/lib/utils";

import { UpdateTicket } from "./UpdateTicket";

interface TicketDetailProps {
  ticket: Ticket;
  agents: Agent[];
}

export function TicketDetail({ ticket, agents }: TicketDetailProps) {
  const senderLabel = ticket.senderName
    ? ticket.senderEmail
      ? `${ticket.senderName} <${ticket.senderEmail}>`
      : ticket.senderName
    : (ticket.senderEmail ?? "—");

  return (
    <div className="space-y-6">
      {/* Title + badges */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{ticket.subject}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <span>#{ticket.id}</span>
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TICKET_STATUS_STYLES[ticket.status]}`}
          >
            {ticket.status}
          </span>
          {ticket.category && (
            <span className="text-gray-600">
              {TICKET_CATEGORY_LABELS[ticket.category] ?? ticket.category}
            </span>
          )}
        </div>
      </div>

      {/* 2-column metadata grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">From</p>
            <p className="mt-1 text-sm text-gray-800">{senderLabel}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Created</p>
            <p className="mt-1 text-sm text-gray-800">{formatDate(ticket.createdAt)}</p>
          </div>
        </div>

        {/* Right column */}
        <UpdateTicket ticket={ticket} agents={agents} />
      </div>

      {/* Message card */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-3">
          <p className="text-sm font-medium text-gray-700">Message</p>
        </div>
        <div className="border-b border-gray-200 px-6 py-3">
          <p className="text-sm text-gray-500">{senderLabel}</p>
        </div>
        <div className="px-6 py-5">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{sanitize(ticket.body)}</p>
        </div>
      </div>
    </div>
  );
}
