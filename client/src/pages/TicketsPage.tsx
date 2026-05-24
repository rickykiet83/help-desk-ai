import { DEFAULT_FILTERS, TicketsFilter } from "./TicketsFilter";

import type { Filters } from "./TicketsFilter";
import type { SortingState } from "@tanstack/react-table";
import type { Ticket } from "@helpdesk/core";
import { TicketsPagination } from "./TicketsPagination";
import { TicketsTable } from "./TicketsTable";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const api = axios.create({ withCredentials: true });

const DEFAULT_SORTING: SortingState = [{ id: "createdAt", desc: true }];
const PAGE_SIZE = 10;

interface TicketsResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  pageSize: number;
}

async function getTickets(
  sortBy: string,
  order: "asc" | "desc",
  filters: Filters,
  page: number,
): Promise<TicketsResponse> {
  const { data } = await api.get<TicketsResponse>("/api/tickets", {
    params: {
      sortBy,
      order,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.search ? { search: filters.search } : {}),
      page,
      pageSize: PAGE_SIZE,
    },
  });
  return data;
}

export function TicketsPage() {
  const [sorting, setSorting] = useState<SortingState>(DEFAULT_SORTING);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const sortBy = sorting[0]?.id ?? "createdAt";
  const order: "asc" | "desc" = sorting[0]?.desc === false ? "asc" : "desc";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tickets", { sortBy, order, ...filters, page }],
    queryFn: () => getTickets(sortBy, order, filters, page),
  });

  const tickets = data?.tickets;
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const hasFilters =
    filters.status !== "" || filters.category !== "" || filters.search !== "";

  function handleFiltersChange(newFilters: Filters) {
    setFilters(newFilters);
    setPage(1);
  }

  function handleSortingChange(newSorting: SortingState | ((prev: SortingState) => SortingState)) {
    setSorting(newSorting);
    setPage(1);
  }

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>

      <div className="mt-4">
        <TicketsFilter filters={filters} onChange={handleFiltersChange} />
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
            onSortingChange={handleSortingChange}
          />
        )}
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="mt-4">
          <TicketsPagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
