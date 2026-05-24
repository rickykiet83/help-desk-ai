import type { TicketCategory, TicketStatus } from "@helpdesk/core";
import { TicketCategory as TC, TicketStatus as TS } from "@helpdesk/core";

export interface Filters {
  status: TicketStatus | "";
  category: TicketCategory | "";
  search: string;
}

export const DEFAULT_FILTERS: Filters = { status: "", category: "", search: "" };

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: TS.Open, label: "Open" },
  { value: TS.Resolved, label: "Resolved" },
  { value: TS.Closed, label: "Closed" },
];

const CATEGORY_OPTIONS: { value: TicketCategory; label: string }[] = [
  { value: TC.General_Question, label: "General" },
  { value: TC.Technical_Question, label: "Technical" },
  { value: TC.Refund_Request, label: "Refund" },
];

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function TicketsFilter({ filters, onChange }: Props) {
  const hasFilters =
    filters.status !== "" || filters.category !== "" || filters.search !== "";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        placeholder="Search subject or sender…"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        className="h-9 w-64 rounded-md border border-gray-300 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
      />
      <select
        value={filters.status}
        onChange={(e) =>
          onChange({ ...filters, status: e.target.value as TicketStatus | "" })
        }
        className="h-9 rounded-md border border-gray-300 px-3 text-sm text-gray-700 focus:border-gray-400 focus:outline-none"
      >
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <select
        value={filters.category}
        onChange={(e) =>
          onChange({ ...filters, category: e.target.value as TicketCategory | "" })
        }
        className="h-9 rounded-md border border-gray-300 px-3 text-sm text-gray-700 focus:border-gray-400 focus:outline-none"
      >
        <option value="">All categories</option>
        {CATEGORY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {hasFilters && (
        <button
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
