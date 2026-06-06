import { Loader2, Sparkles } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import type { Ticket } from "@helpdesk/core";
import axios from "axios";

const api = axios.create({ withCredentials: true });

interface TicketSummaryProps {
  ticketId: number;
}

export function TicketSummary({ ticketId }: TicketSummaryProps) {
  const queryClient = useQueryClient();

  const { data: ticket } = useQuery<Ticket>({
    queryKey: ["tickets", String(ticketId)],
    queryFn: async () => {
      const res = await api.get<Ticket>(`/api/tickets/${ticketId}`);
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<{ summary: string }>(`/api/tickets/${ticketId}/summarize`);
      return res.data.summary;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", String(ticketId)] });
    },
  });

  const summary = mutation.data ?? ticket?.aiSummary;

  return (
    <div className="border-t border-gray-200 px-6 py-4 space-y-3">
      {summary && (
        <div className="rounded-md bg-purple-50 border border-purple-100 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-purple-400 mb-1">AI Summary</p>
          <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
        </div>
      )}

      {mutation.isError && (
        <p className="text-sm text-red-600">Failed to generate summary. Please try again.</p>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="gap-1.5 text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700"
      >
        {mutation.isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        {summary ? "Re-generate Summary" : "Summarize"}
      </Button>
    </div>
  );
}
