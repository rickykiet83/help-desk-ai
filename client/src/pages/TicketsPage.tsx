import type { Ticket } from "@helpdesk/core";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { TicketsTable } from "./TicketsTable";

const api = axios.create({ withCredentials: true });

async function getTickets(): Promise<Ticket[]> {
  const { data } = await api.get<{ tickets: Ticket[] }>("/api/tickets");
  return data.tickets;
}

export function TicketsPage() {
  const { data: tickets, isLoading, isError } = useQuery({
    queryKey: ["tickets"],
    queryFn: getTickets,
  });

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white">
        {isError && (
          <p className="px-4 py-8 text-center text-sm text-red-500">
            Failed to load tickets.
          </p>
        )}
        {!isLoading && tickets && tickets.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-gray-500">
            No tickets yet.
          </p>
        )}
        {(isLoading || (tickets && tickets.length > 0)) && (
          <TicketsTable tickets={tickets ?? []} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
