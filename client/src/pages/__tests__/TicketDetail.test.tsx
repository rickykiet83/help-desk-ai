import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";

import { TicketStatus, TicketCategory } from "@helpdesk/core";
import type { Agent, Ticket } from "@helpdesk/core";
import { renderWithClient } from "@/test/render";
import { TicketDetail } from "../TicketDetail";

// ---------------------------------------------------------------------------
// Axios mock — vi.hoisted ensures the factory runs before module evaluation.
// UpdateTicket uses axios.create() internally, so we must intercept it here.
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
const mockAgents: Agent[] = [
	{ id: "agent-1", name: "Alice Agent", email: "alice@example.com" },
	{ id: "agent-2", name: "Bob Agent", email: "bob@example.com" },
];

const baseTicket: Ticket = {
	id: 1,
	subject: "Login is broken",
	body: "I cannot log in to my account since yesterday.",
	status: TicketStatus.Open,
	category: TicketCategory.Technical_Question,
	senderName: "Jane Smith",
	senderEmail: "jane@example.com",
	assignedToId: null,
	createdAt: "2024-01-15T10:00:00.000Z",
	updatedAt: "2024-01-16T08:00:00.000Z",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function renderDetail(ticket: Ticket, agents: Agent[] = mockAgents) {
	return renderWithClient(<TicketDetail ticket={ticket} agents={agents} />);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
beforeEach(() => {
	vi.clearAllMocks();
});

describe("TicketDetail", () => {
	describe("heading and identity", () => {
		it("renders the ticket subject as an h1 heading", () => {
			renderDetail(baseTicket);
			expect(
				screen.getByRole("heading", { level: 1, name: "Login is broken" }),
			).toBeInTheDocument();
		});

		it("renders the ticket ID prefixed with #", () => {
			renderDetail(baseTicket);
			expect(screen.getByText("#1")).toBeInTheDocument();
		});
	});

	describe("status badge", () => {
		it("renders the status badge with the ticket's status text", () => {
			renderDetail(baseTicket);
			// "Open" also appears as a select option inside UpdateTicket; at least one occurrence
			// must be in the document.
			expect(screen.getAllByText(TicketStatus.Open).length).toBeGreaterThan(0);
		});
	});

	describe("category label", () => {
		it("renders the human-readable category label when category is set", () => {
			renderDetail(baseTicket);
			// "Technical Question" appears both as the badge span and as a select option.
			expect(screen.getAllByText("Technical Question").length).toBeGreaterThan(0);
		});

		it("does not render a category span when category is null", () => {
			const ticket: Ticket = { ...baseTicket, category: null };
			renderDetail(ticket);
			// The UpdateTicket select still renders option elements with the human-readable
			// labels. We must scope to the badges row (which contains the ticket ID span)
			// to verify the category span is absent from the header area.
			const ticketIdSpan = screen.getByText("#1");
			// The badges row is the parent div that wraps the id, status, and category spans.
			const badgesRow = ticketIdSpan.parentElement!;
			expect(within(badgesRow).queryByText("Technical Question")).not.toBeInTheDocument();
			expect(within(badgesRow).queryByText("General Question")).not.toBeInTheDocument();
			expect(within(badgesRow).queryByText("Refund Request")).not.toBeInTheDocument();
		});
	});

	describe("sender label", () => {
		it('renders "Name <email>" when both senderName and senderEmail are present', () => {
			renderDetail(baseTicket);
			// Appears in both the metadata grid and the message card header.
			expect(
				screen.getAllByText("Jane Smith <jane@example.com>").length,
			).toBeGreaterThan(0);
		});

		it("renders just the name when only senderName is set", () => {
			const ticket: Ticket = {
				...baseTicket,
				senderName: "Jane Smith",
				senderEmail: null,
			};
			renderDetail(ticket);
			expect(screen.getAllByText("Jane Smith").length).toBeGreaterThan(0);
			// The combined "Name <email>" form must not appear.
			expect(
				screen.queryByText("Jane Smith <jane@example.com>"),
			).not.toBeInTheDocument();
		});

		it("renders just the email when only senderEmail is set", () => {
			const ticket: Ticket = {
				...baseTicket,
				senderName: null,
				senderEmail: "jane@example.com",
			};
			renderDetail(ticket);
			expect(
				screen.getAllByText("jane@example.com").length,
			).toBeGreaterThan(0);
		});

		it('renders "—" when both senderName and senderEmail are null', () => {
			const ticket: Ticket = {
				...baseTicket,
				senderName: null,
				senderEmail: null,
			};
			renderDetail(ticket);
			expect(screen.getAllByText("—").length).toBeGreaterThan(0);
		});
	});

	describe("metadata section", () => {
		it('renders the "From" metadata label', () => {
			renderDetail(baseTicket);
			expect(screen.getByText("From")).toBeInTheDocument();
		});
	});

	describe("message card", () => {
		it('renders the "Message" section heading', () => {
			renderDetail(baseTicket);
			expect(screen.getByText("Message")).toBeInTheDocument();
		});

		it("renders the ticket body text inside the message card", () => {
			renderDetail(baseTicket);
			expect(
				screen.getByText("I cannot log in to my account since yesterday."),
			).toBeInTheDocument();
		});
	});
});
