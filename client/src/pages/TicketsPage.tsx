import type { SortingState } from "@tanstack/react-table";
import type { Ticket } from "@helpdesk/core";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DEFAULT_FILTERS, TicketsFilter } from "./TicketsFilter";
import type { Filters } from "./TicketsFilter";
import { TicketsTable } from "./TicketsTable";

const api = axios.create({ withCredentials: true });

const DEFAULT_SORTING: SortingState = [{ id: "createdAt", desc: true }];

async function getTickets(
  sortBy: string,
  order: "asc" | "desc",
  filters: Filters,
): Promise<Ticket[]> {
  const { data } = await api.get<{ tickets: Ticket[] }>("/api/tickets", {
    params: {
      sortBy,
      order,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.search ? { search: filters.search } : {}),
    },
  });
  return data.tickets;
}

export function TicketsPage() {
  const [sorting, setSorting] = useState<SortingState>(DEFAULT_SORTING);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const sortBy = sorting[0]?.id ?? "createdAt";
  const order: "asc" | "desc" = sorting[0]?.desc === false ? "asc" : "desc";

  const { data: tickets, isLoading, isError } = useQuery({
    queryKey: ["tickets", { sortBy, order, ...filters }],
    queryFn: () => getTickets(sortBy, order, filters),
  });

  const hasFilters =
    filters.status !== "" || filters.category !== "" || filters.search !== "";

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>

      <div className="mt-4">
        <TicketsFilter filters={filters} onChange={setFilters} />
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white">
        {isError && (
          <p className="px-4 py-8 text-center text-sm text-red-500">
            Failed to load tickets.
          </p>
        )}
        {!isLoading && tickets && tickets.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-gray-500">
            {hasFilters ? "No tickets match your filters." : "No tickets yet."}
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
