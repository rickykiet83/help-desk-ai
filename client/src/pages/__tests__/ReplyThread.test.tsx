import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import type { Reply } from "@helpdesk/core";
import { ReplyThread } from "../ReplyThread";
import { SenderType } from "@helpdesk/core";

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
});
