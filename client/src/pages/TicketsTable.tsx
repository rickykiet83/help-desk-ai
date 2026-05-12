import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Ticket, TicketCategory, TicketStatus } from "@helpdesk/core";

import { cn } from "@/lib/utils";

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

interface Props {
  tickets: Ticket[];
  isLoading?: boolean;
}

export function TicketsTable({ tickets, isLoading }: Props) {
  if (isLoading) return <LoadingSkeleton />;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8">#</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Sender</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((ticket) => (
          <TableRow key={ticket.id}>
            <TableCell className="text-gray-400">{ticket.id}</TableCell>
            <TableCell className="max-w-xs truncate font-medium text-gray-900">
              {ticket.subject}
            </TableCell>
            <TableCell className="text-gray-600">
              {ticket.senderName ?? ticket.senderEmail ?? "—"}
            </TableCell>
            <TableCell className="text-gray-600">
              {ticket.category
                ? (CATEGORY_LABELS[ticket.category] ?? ticket.category)
                : "—"}
            </TableCell>
            <TableCell>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[ticket.status] ?? ""}`}
              >
                {ticket.status}
              </span>
            </TableCell>
            <TableCell className="text-gray-500">
              {formatDate(ticket.createdAt)}
            </TableCell>
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
