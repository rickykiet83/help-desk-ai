import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { SenderType } from "@helpdesk/core";
import type { Reply } from "@helpdesk/core";
import { ReplyThread } from "../ReplyThread";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const agentReply: Reply = {
	id: 1,
	body: "Thanks for reaching out. We are looking into this.",
	senderType: SenderType.Agent,
	authorId: "agent-1",
	authorName: "Alice Agent",
	ticketId: 10,
	createdAt: "2024-01-15T11:00:00.000Z",
};

const customerReply: Reply = {
	id: 2,
	body: "Still having the same issue. Please help.",
	senderType: SenderType.Customer,
	authorId: null,
	authorName: "Jane Smith",
	ticketId: 10,
	createdAt: "2024-01-15T12:00:00.000Z",
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
beforeEach(() => {
	vi.clearAllMocks();
});

describe("ReplyThread", () => {
	describe("empty state", () => {
		it('renders "No replies yet." when the replies list is empty', () => {
			render(<ReplyThread replies={[]} />);
			expect(screen.getByText("No replies yet.")).toBeInTheDocument();
		});
	});

	describe("reply list rendering", () => {
		it("renders one reply row per item in the replies array", () => {
			render(<ReplyThread replies={[agentReply, customerReply]} />);
			// Each row renders the author name; check both are present.
			expect(screen.getByText("Alice Agent")).toBeInTheDocument();
			expect(screen.getByText("Jane Smith")).toBeInTheDocument();
		});

		it("renders the authorName for each reply", () => {
			render(<ReplyThread replies={[agentReply, customerReply]} />);
			expect(screen.getByText("Alice Agent")).toBeInTheDocument();
			expect(screen.getByText("Jane Smith")).toBeInTheDocument();
		});

		it('renders the senderType badge text "Agent" for an agent reply', () => {
			render(<ReplyThread replies={[agentReply]} />);
			expect(screen.getByText(SenderType.Agent)).toBeInTheDocument();
		});

		it('renders the senderType badge text "Customer" for a customer reply', () => {
			render(<ReplyThread replies={[customerReply]} />);
			expect(screen.getByText(SenderType.Customer)).toBeInTheDocument();
		});

		it("renders the body text for each reply", () => {
			render(<ReplyThread replies={[agentReply, customerReply]} />);
			expect(
				screen.getByText("Thanks for reaching out. We are looking into this."),
			).toBeInTheDocument();
			expect(
				screen.getByText("Still having the same issue. Please help."),
			).toBeInTheDocument();
		});
	});

	describe("styling", () => {
		it("applies bg-gray-50 to the row container for Customer replies", () => {
			const { container } = render(<ReplyThread replies={[customerReply]} />);
			// The outer div for each reply gets the conditional class.
			// We locate the row by finding the element that contains the author name
			// and then checking its parent container class.
			const authorEl = screen.getByText("Jane Smith");
			// The reply row is two levels up: span > header-div > reply-div
			const replyRow = authorEl.closest(".px-6.py-4");
			expect(replyRow).toHaveClass("bg-gray-50");
			// Suppress unused variable warning for container
			void container;
		});

		it("does NOT apply bg-gray-50 to the row container for Agent replies", () => {
			render(<ReplyThread replies={[agentReply]} />);
			const authorEl = screen.getByText("Alice Agent");
			const replyRow = authorEl.closest(".px-6.py-4");
			expect(replyRow).not.toHaveClass("bg-gray-50");
		});

		it("renders the Agent badge with bg-blue-100 and text-blue-700 classes", () => {
			render(<ReplyThread replies={[agentReply]} />);
			const badge = screen.getByText(SenderType.Agent);
			expect(badge).toHaveClass("bg-blue-100");
			expect(badge).toHaveClass("text-blue-700");
		});

		it("renders the Customer badge with bg-gray-200 and text-gray-600 classes", () => {
			render(<ReplyThread replies={[customerReply]} />);
			const badge = screen.getByText(SenderType.Customer);
			expect(badge).toHaveClass("bg-gray-200");
			expect(badge).toHaveClass("text-gray-600");
		});
	});

	describe("mixed reply list", () => {
		it("renders Agent and Customer badges with their respective classes when both are present", () => {
			render(<ReplyThread replies={[agentReply, customerReply]} />);

			const agentBadge = screen.getByText(SenderType.Agent);
			expect(agentBadge).toHaveClass("bg-blue-100");
			expect(agentBadge).toHaveClass("text-blue-700");

			const customerBadge = screen.getByText(SenderType.Customer);
			expect(customerBadge).toHaveClass("bg-gray-200");
			expect(customerBadge).toHaveClass("text-gray-600");
		});

		it("applies bg-gray-50 only to the Customer row, not the Agent row", () => {
			render(<ReplyThread replies={[agentReply, customerReply]} />);

			const agentAuthorEl = screen.getByText("Alice Agent");
			const agentRow = agentAuthorEl.closest(".px-6.py-4");
			expect(agentRow).not.toHaveClass("bg-gray-50");

			const customerAuthorEl = screen.getByText("Jane Smith");
			const customerRow = customerAuthorEl.closest(".px-6.py-4");
			expect(customerRow).toHaveClass("bg-gray-50");
		});
	});
});
