import { Link, useParams } from "react-router-dom";
import { TICKET_CATEGORY_LABELS, TICKET_STATUS_STYLES, formatDateTime } from "@/lib/utils";

import { ArrowLeft } from "lucide-react";
import type { Ticket } from "@helpdesk/core";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const api = axios.create({ withCredentials: true });

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: ticket, isLoading, isError } = useQuery<Ticket>({
    queryKey: ["tickets", id],
    queryFn: async () => {
      const res = await api.get<Ticket>(`/api/tickets/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        to="/tickets"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tickets
      </Link>

      {isLoading && (
        <div className="mt-8 space-y-4">
          <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
          <div className="mt-6 h-40 animate-pulse rounded bg-gray-200" />
        </div>
      )}

      {isError && (
        <div className="mt-8 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Ticket not found or failed to load.
        </div>
      )}

      {ticket && (
        <div className="space-y-6">
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
              <span>{formatDateTime(ticket.createdAt)}</span>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
            <span className="font-medium text-gray-700">From: </span>
            {ticket.senderName ? (
              <>
                {ticket.senderName}
                {ticket.senderEmail && (
                  <span className="ml-1 text-gray-400">&lt;{ticket.senderEmail}&gt;</span>
                )}
              </>
            ) : (
              ticket.senderEmail ?? "—"
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {ticket.body}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
