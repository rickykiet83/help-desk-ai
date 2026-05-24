import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Ticket, TicketCategory, TicketStatus } from "@helpdesk/core";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { cn } from "@/lib/utils";

// Augment column meta to support className on <TableHead>
declare module "@tanstack/react-table" {
  // biome-ignore lint: type params required by interface
  interface ColumnMeta<TData, TValue> {
    className?: string;
  }
}

const STATUS_STYLES: Record<TicketStatus, string> = {
  Open: "bg-blue-100 text-blue-700",
  Resolved: "bg-green-100 text-green-700",
  Closed: "bg-gray-100 text-gray-600",
};

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  General_Question: "General",
  Technical_Question: "Technical",
  Refund_Request: "Refund",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const columnHelper = createColumnHelper<Ticket>();

const columns = [
	columnHelper.accessor('id', {
		header: '#',
		enableSorting: true,
		meta: { className: 'w-8' },
		cell: (row) => <span className='text-gray-400'>{row.getValue()}</span>,
	}),
	columnHelper.accessor('subject', {
		header: 'Subject',
		enableSorting: true,
		cell: (row) => <span className='max-w-xs truncate font-medium text-gray-900'>{row.getValue()}</span>,
	}),
	columnHelper.accessor((row) => row.senderName ?? row.senderEmail ?? '—', {
		id: 'senderName',
		header: 'Sender',
		enableSorting: true,
		cell: (row) => <span className='text-gray-600'>{row.getValue()}</span>,
	}),
	columnHelper.accessor('category', {
		header: 'Category',
		enableSorting: true,
		cell: (row) => {
			const cat = row.getValue();
			return <span className='text-gray-600'>{cat ? (CATEGORY_LABELS[cat] ?? cat) : '—'}</span>;
		},
	}),
	columnHelper.accessor('status', {
		header: 'Status',
		enableSorting: true,
		cell: (row) => {
			const status = row.getValue();
			return (
				<span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
					{status}
				</span>
			);
		},
	}),
	columnHelper.accessor('createdAt', {
		header: 'Created',
		enableSorting: true,
		cell: (row) => <span className='text-gray-500'>{formatDate(row.getValue())}</span>,
	}),
];

interface Props {
  tickets: Ticket[];
  isLoading?: boolean;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
}

export function TicketsTable({
  tickets,
  isLoading,
  sorting = [],
  onSortingChange = () => {},
}: Props) {
  const table = useReactTable({
    data: tickets,
    columns,
    state: { sorting },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  if (isLoading) return <LoadingSkeleton />;

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((hg) => (
          <TableRow key={hg.id}>
            {hg.headers.map((header) => {
              const sortable = header.column.getCanSort();
              const dir = header.column.getIsSorted();
              return (
                <TableHead
                  key={header.id}
                  className={cn(
                    sortable ? "cursor-pointer select-none" : "",
                    header.column.columnDef.meta?.className,
                  )}
                  onClick={
                    sortable
                      ? header.column.getToggleSortingHandler()
                      : undefined
                  }
                >
                  <span className="inline-flex items-center gap-1">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {sortable &&
                      (dir === "asc" ? (
                        <ChevronUp className="h-3.5 w-3.5 text-gray-500" />
                      ) : dir === "desc" ? (
                        <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 text-gray-300" />
                      ))}
                  </span>
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function Bone({ className }: { className?: string }) {
  return <div className={cn("rounded bg-gray-200 animate-pulse", className)} />;
}

function LoadingSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><Bone className="h-4 w-6" /></TableHead>
          <TableHead><Bone className="h-4 w-32" /></TableHead>
          <TableHead><Bone className="h-4 w-24" /></TableHead>
          <TableHead><Bone className="h-4 w-20" /></TableHead>
          <TableHead><Bone className="h-4 w-16" /></TableHead>
          <TableHead><Bone className="h-4 w-20" /></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[1, 2, 3, 4, 5].map((i) => (
          <TableRow key={i}>
            <TableCell><Bone className="h-4 w-6" /></TableCell>
            <TableCell><Bone className="h-4 w-64" /></TableCell>
            <TableCell><Bone className="h-4 w-32" /></TableCell>
            <TableCell><Bone className="h-5 w-16 rounded-full" /></TableCell>
            <TableCell><Bone className="h-5 w-14 rounded-full" /></TableCell>
            <TableCell><Bone className="h-4 w-24" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
