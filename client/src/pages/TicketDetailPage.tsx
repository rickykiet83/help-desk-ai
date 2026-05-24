import { Link, useParams } from "react-router-dom";
import { TICKET_CATEGORY_LABELS, TICKET_STATUS_STYLES, formatDate, formatDateTime } from "@/lib/utils";
import { TicketCategory, TicketStatus } from "@helpdesk/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ArrowLeft } from "lucide-react";
import type { Reply, Ticket } from "@helpdesk/core";
import axios from "axios";
import { ReplyThread } from "./ReplyThread";
import { ReplyForm } from "./ReplyForm";

const api = axios.create({ withCredentials: true });

interface Agent {
  id: string;
  name: string;
  email: string;
}

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: ticket, isLoading, isError } = useQuery<Ticket>({
    queryKey: ["tickets", id],
    queryFn: async () => {
      const res = await api.get<Ticket>(`/api/tickets/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const { data: agentsData } = useQuery<{ agents: Agent[] }>({
    queryKey: ["agents"],
    queryFn: async () => {
      const res = await api.get<{ agents: Agent[] }>("/api/agents");
      return res.data;
    },
  });

  const agents = agentsData?.agents ?? [];

  const { data: repliesData } = useQuery<{ replies: Reply[] }>({
    queryKey: ["tickets", id, "replies"],
    queryFn: async () => {
      const res = await api.get<{ replies: Reply[] }>(`/api/tickets/${id}/replies`);
      return res.data;
    },
    enabled: !!id,
  });

  const replies = repliesData?.replies ?? [];

  const updateMutation = useMutation({
    mutationFn: async (patch: { assignedToId?: string | null; status?: string; category?: string | null }) => {
      await api.patch(`/api/tickets/${id}`, patch);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  const senderLabel = ticket
    ? ticket.senderName
      ? ticket.senderEmail
        ? `${ticket.senderName} <${ticket.senderEmail}>`
        : ticket.senderName
      : (ticket.senderEmail ?? "—")
    : "—";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
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
            <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
              <div>
                <label
                  htmlFor="status"
                  className="text-xs font-medium uppercase tracking-wide text-gray-400"
                >
                  Status
                </label>
                <select
                  id="status"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  value={ticket.status}
                  disabled={updateMutation.isPending}
                  onChange={(e) => {
                    updateMutation.mutateAsync({ status: e.target.value }).catch(() => {});
                  }}
                >
                  {Object.values(TicketStatus).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="text-xs font-medium uppercase tracking-wide text-gray-400"
                >
                  Category
                </label>
                <select
                  id="category"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  value={ticket.category ?? ""}
                  disabled={updateMutation.isPending}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateMutation.mutateAsync({ category: value === "" ? null : value }).catch(() => {});
                  }}
                >
                  <option value="">Uncategorized</option>
                  {Object.values(TicketCategory).map((c) => (
                    <option key={c} value={c}>{TICKET_CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="assignee"
                  className="text-xs font-medium uppercase tracking-wide text-gray-400"
                >
                  Assigned to
                </label>
                <select
                  id="assignee"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  value={ticket.assignedToId ?? ""}
                  disabled={updateMutation.isPending}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateMutation.mutateAsync({ assignedToId: value === "" ? null : value }).catch(() => {});
                  }}
                >
                  <option value="">Unassigned</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
                {updateMutation.isError && (
                  <p className="mt-1 text-xs text-red-600">Failed to update ticket.</p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Updated</p>
                <p className="mt-1 text-sm text-gray-800">{formatDateTime(ticket.updatedAt)}</p>
              </div>
            </div>
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
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {ticket.body}
              </p>
            </div>
          </div>

          {/* Reply thread + form */}
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-3">
              <p className="text-sm font-medium text-gray-700">
                Replies{" "}
                {replies.length > 0 && (
                  <span className="text-gray-400">({replies.length})</span>
                )}
              </p>
            </div>
            <ReplyThread replies={replies} />
            <div className="border-t border-gray-200">
              <ReplyForm ticketId={ticket.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
