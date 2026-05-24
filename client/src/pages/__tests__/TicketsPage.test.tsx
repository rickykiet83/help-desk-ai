import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";

import { TicketStatus, TicketCategory } from "@helpdesk/core";
import type { Ticket } from "@helpdesk/core";
import { TicketsPage } from "../TicketsPage";
import { renderWithClient } from "@/test/render";

// ---------------------------------------------------------------------------
// Axios mock — vi.hoisted ensures the mock factory runs before module eval.
// ---------------------------------------------------------------------------
const mockAxiosInstance = vi.hoisted(() => ({
	get: vi.fn(),
	post: vi.fn(),
	patch: vi.fn(),
	delete: vi.fn(),
}));

vi.mock("axios", () => ({
	default: {
		create: () => mockAxiosInstance,
		isAxiosError: (err: unknown): boolean =>
			err instanceof Object && "response" in (err as object),
	},
}));

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
		updatedAt: "2024-01-15T10:00:00.000Z",
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

// ---------------------------------------------------------------------------
// Default setup: successful fetch returning both tickets
// ---------------------------------------------------------------------------
beforeEach(() => {
	vi.clearAllMocks();
	mockAxiosInstance.get.mockResolvedValue({ data: { tickets: mockTickets } });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("TicketsPage", () => {
	it("calls GET /api/tickets on mount", async () => {
		renderWithClient(<TicketsPage />);
		await waitFor(() =>
			expect(mockAxiosInstance.get).toHaveBeenCalledWith("/api/tickets", {
				params: { sortBy: "createdAt", order: "desc", page: 1, pageSize: 10 },
			}),
		);
	});

	it("shows the loading skeleton while the query is in flight, then renders ticket data", async () => {
		renderWithClient(<TicketsPage />);
		// Skeleton is present immediately — ticket subjects are not yet visible
		expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
		expect(screen.queryByText("Cannot login to my account")).not.toBeInTheDocument();

		// After the query resolves the skeleton disappears and data appears
		await waitFor(() =>
			expect(
				screen.getByText("Cannot login to my account"),
			).toBeInTheDocument(),
		);
		expect(document.querySelector(".animate-pulse")).not.toBeInTheDocument();
	});

	it("shows 'Failed to load tickets.' when the API call rejects", async () => {
		mockAxiosInstance.get.mockRejectedValue(new Error("Network error"));
		renderWithClient(<TicketsPage />);
		await waitFor(() =>
			expect(
				screen.getByText("Failed to load tickets."),
			).toBeInTheDocument(),
		);
	});

	it("does not show the error message on a successful fetch", async () => {
		renderWithClient(<TicketsPage />);
		await waitFor(() =>
			expect(screen.getByText("Cannot login to my account")).toBeInTheDocument(),
		);
		expect(
			screen.queryByText("Failed to load tickets."),
		).not.toBeInTheDocument();
	});

	it("shows 'No tickets yet.' when the API returns an empty array", async () => {
		mockAxiosInstance.get.mockResolvedValue({ data: { tickets: [] } });
		renderWithClient(<TicketsPage />);
		await waitFor(() =>
			expect(screen.getByText("No tickets yet.")).toBeInTheDocument(),
		);
	});

	it("does not show 'No tickets yet.' when tickets are present", async () => {
		renderWithClient(<TicketsPage />);
		await waitFor(() =>
			expect(screen.getByText("Cannot login to my account")).toBeInTheDocument(),
		);
		expect(screen.queryByText("No tickets yet.")).not.toBeInTheDocument();
	});

	it("renders all ticket subjects after a successful fetch", async () => {
		renderWithClient(<TicketsPage />);
		await waitFor(() =>
			expect(
				screen.getByText("Cannot login to my account"),
			).toBeInTheDocument(),
		);
		expect(
			screen.getByText("Refund request for order #1234"),
		).toBeInTheDocument();
	});

	it("renders the page heading", () => {
		renderWithClient(<TicketsPage />);
		expect(
			screen.getByRole("heading", { name: /tickets/i }),
		).toBeInTheDocument();
	});
});
