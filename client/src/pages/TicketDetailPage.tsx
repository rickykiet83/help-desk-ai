import type { Reply, Ticket } from "@helpdesk/core";

import { BackLink } from "@/components/BackLink";
import ErrorAlert from "@/components/ErrorAlert";
import ReplyForm from './ReplyForm';
import { ReplyThread } from "./ReplyThread";
import { TicketDetail } from "./TicketDetail";
import { TicketDetailSkeleton } from "./TicketDetailSkeleton";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const api = axios.create({ withCredentials: true });

interface Agent {
  id: string;
  name: string;
  email: string;
}

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: ticket, isLoading, error } = useQuery<Ticket>({
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

  return (
		<div className='mx-auto max-w-4xl px-4 py-8'>
			<BackLink to="/tickets" label="Back to tickets" />

			{isLoading && <TicketDetailSkeleton />}

			{error && <ErrorAlert message={axios.isAxiosError(error) && error.response?.status === 404 ? 'Ticket not found' : 'Failed to load ticket'} className="mt-8" />}

			{ticket && (
				<div className='space-y-6'>
					<TicketDetail ticket={ticket} agents={agents} />

					{/* Reply thread + form */}
					<div className='rounded-lg border border-gray-200 bg-white'>
						<div className='border-b border-gray-200 px-6 py-3'>
							<p className='text-sm font-medium text-gray-700'>
								Replies {replies.length > 0 && <span className='text-gray-400'>({replies.length})</span>}
							</p>
						</div>
						<ReplyThread replies={replies} />
					</div>

					<div className='rounded-lg border border-gray-200 bg-white'>
						<ReplyForm ticket={ticket} />
					</div>
				</div>
			)}
		</div>
	);
}
