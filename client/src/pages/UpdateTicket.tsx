import type { Agent, Ticket } from "@helpdesk/core";
import { TicketCategory, TicketStatus } from "@helpdesk/core";
import { TICKET_CATEGORY_LABELS, formatDateTime } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const api = axios.create({ withCredentials: true });

interface Props {
  ticket: Ticket;
  agents: Agent[];
}

export function UpdateTicket({ ticket, agents }: Props) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (patch: { assignedToId?: string | null; status?: string; category?: string | null }) => {
      await api.patch(`/api/tickets/${ticket.id}`, patch);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
      <div>
        <label htmlFor="status" className="text-xs font-medium uppercase tracking-wide text-gray-400">
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
        <label htmlFor="category" className="text-xs font-medium uppercase tracking-wide text-gray-400">
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
        <label htmlFor="assignee" className="text-xs font-medium uppercase tracking-wide text-gray-400">
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
            <option key={agent.id} value={agent.id}>{agent.name}</option>
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
  );
}
