import type { SortingState } from "@tanstack/react-table";
import type { Ticket } from "@helpdesk/core";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { TicketsTable } from "./TicketsTable";

const api = axios.create({ withCredentials: true });

const DEFAULT_SORTING: SortingState = [{ id: "createdAt", desc: true }];

async function getTickets(sortBy: string, order: "asc" | "desc"): Promise<Ticket[]> {
  const { data } = await api.get<{ tickets: Ticket[] }>("/api/tickets", {
    params: { sortBy, order },
  });
  return data.tickets;
}

export function TicketsPage() {
  const [sorting, setSorting] = useState<SortingState>(DEFAULT_SORTING);

  const sortBy = sorting[0]?.id ?? "createdAt";
  const order: "asc" | "desc" = sorting[0]?.desc === false ? "asc" : "desc";

  const { data: tickets, isLoading, isError } = useQuery({
    queryKey: ["tickets", { sortBy, order }],
    queryFn: () => getTickets(sortBy, order),
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
          <TicketsTable
            tickets={tickets ?? []}
            isLoading={isLoading}
            sorting={sorting}
            onSortingChange={setSorting}
          />
        )}
      </div>
    </div>
  );
}
