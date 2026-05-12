import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { TicketStatus, TicketCategory } from "@helpdesk/core";
import type { Ticket } from "@helpdesk/core";
import { TicketsTable } from "../TicketsTable";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const mockTickets: Ticket[] = [
	{
		id: 1,
		subject: "Cannot login to my account",
		body: "I have been unable to login since yesterday.",
		status: TicketStatus.Open,
		category: TicketCategory.Technical_Question,
		senderName: "Jane Smith",
		senderEmail: "jane@example.com",
		assignedToId: null,
		createdAt: "2024-01-15T10:00:00.000Z",
	},
	{
		id: 2,
		subject: "Refund request for order #1234",
		body: "I would like a refund.",
		status: TicketStatus.Resolved,
		category: TicketCategory.Refund_Request,
		senderName: null,
		senderEmail: "bob@example.com",
		assignedToId: null,
		createdAt: "2024-03-20T14:30:00.000Z",
	},
];

beforeEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("TicketsTable", () => {
	describe("loading state", () => {
		it("renders the loading skeleton when isLoading is true", () => {
			render(<TicketsTable tickets={[]} isLoading />);
			expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
		});

		it("does not render any ticket data while loading", () => {
			render(<TicketsTable tickets={mockTickets} isLoading />);
			expect(screen.queryByText("Cannot login to my account")).not.toBeInTheDocument();
			expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
		});
	});

	describe("ticket data rendering", () => {
		it("renders the ticket id, subject, sender name, category label, and status", () => {
			render(<TicketsTable tickets={mockTickets} />);
			// Ticket 1
			expect(screen.getByText("1")).toBeInTheDocument();
			expect(screen.getByText("Cannot login to my account")).toBeInTheDocument();
			expect(screen.getByText("Jane Smith")).toBeInTheDocument();
			expect(screen.getByText("Technical")).toBeInTheDocument();
			expect(screen.getByText("Open")).toBeInTheDocument();
			// Ticket 2
			expect(screen.getByText("2")).toBeInTheDocument();
			expect(screen.getByText("Refund request for order #1234")).toBeInTheDocument();
			expect(screen.getByText("Refund")).toBeInTheDocument();
			expect(screen.getByText("Resolved")).toBeInTheDocument();
		});

		it("renders an empty table body when the tickets array is empty", () => {
			render(<TicketsTable tickets={[]} />);
			// Header columns still present
			expect(screen.getByText("Subject")).toBeInTheDocument();
			// No ticket rows
			expect(screen.queryByText("Cannot login to my account")).not.toBeInTheDocument();
		});
	});

	describe("sender display", () => {
		it("shows senderName when it is present", () => {
			render(<TicketsTable tickets={[mockTickets[0]]} />);
			expect(screen.getByText("Jane Smith")).toBeInTheDocument();
			expect(screen.queryByText("jane@example.com")).not.toBeInTheDocument();
		});

		it("falls back to senderEmail when senderName is null", () => {
			render(<TicketsTable tickets={[mockTickets[1]]} />);
			expect(screen.getByText("bob@example.com")).toBeInTheDocument();
		});

		it("shows an em dash when both senderName and senderEmail are null", () => {
			const ticket: Ticket = {
				...mockTickets[0],
				id: 3,
				senderName: null,
				senderEmail: null,
			};
			render(<TicketsTable tickets={[ticket]} />);
			expect(screen.getByText("—")).toBeInTheDocument();
		});
	});

	describe("category label", () => {
		it("maps General_Question to 'General'", () => {
			const ticket: Ticket = {
				...mockTickets[0],
				category: TicketCategory.General_Question,
			};
			render(<TicketsTable tickets={[ticket]} />);
			expect(screen.getByText("General")).toBeInTheDocument();
		});

		it("maps Technical_Question to 'Technical'", () => {
			render(<TicketsTable tickets={[mockTickets[0]]} />);
			expect(screen.getByText("Technical")).toBeInTheDocument();
		});

		it("maps Refund_Request to 'Refund'", () => {
			render(<TicketsTable tickets={[mockTickets[1]]} />);
			expect(screen.getByText("Refund")).toBeInTheDocument();
		});

		it("shows an em dash when category is null", () => {
			const ticket: Ticket = { ...mockTickets[0], id: 4, category: null };
			render(<TicketsTable tickets={[ticket]} />);
			expect(screen.getByText("—")).toBeInTheDocument();
		});
	});

	describe("status badge styles", () => {
		it("applies blue classes to an Open status badge", () => {
			render(<TicketsTable tickets={[mockTickets[0]]} />);
			const badge = screen.getByText("Open");
			expect(badge).toHaveClass("bg-blue-100", "text-blue-700");
		});

		it("applies green classes to a Resolved status badge", () => {
			render(<TicketsTable tickets={[mockTickets[1]]} />);
			const badge = screen.getByText("Resolved");
			expect(badge).toHaveClass("bg-green-100", "text-green-700");
		});

		it("applies gray classes to a Closed status badge", () => {
			const ticket: Ticket = {
				...mockTickets[0],
				id: 5,
				status: TicketStatus.Closed,
			};
			render(<TicketsTable tickets={[ticket]} />);
			const badge = screen.getByText("Closed");
			expect(badge).toHaveClass("bg-gray-100", "text-gray-600");
		});
	});

	describe("date formatting", () => {
		it("formats the createdAt date as a short-month date string containing the month abbreviation and year", () => {
			render(<TicketsTable tickets={[mockTickets[0]]} />);
			// "2024-01-15T10:00:00.000Z" → e.g. "Jan 15, 2024"
			// Match on the full formatted date cell to avoid partial matches on sender names
			const dateCell = screen.getByText(/Jan\s+\d+,\s+2024/);
			expect(dateCell).toBeInTheDocument();
		});

		it("renders a distinct formatted date for each ticket", () => {
			render(<TicketsTable tickets={mockTickets} />);
			// Ticket 1: January 2024
			expect(screen.getByText(/Jan\s+\d+,\s+2024/)).toBeInTheDocument();
			// Ticket 2: March 2024
			expect(screen.getByText(/Mar\s+\d+,\s+2024/)).toBeInTheDocument();
		});
	});
});
