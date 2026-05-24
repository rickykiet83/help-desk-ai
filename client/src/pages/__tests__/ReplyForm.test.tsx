import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TicketStatus, TicketCategory } from "@helpdesk/core";
import type { Ticket } from "@helpdesk/core";
import { renderWithClient } from "@/test/render";
import ReplyForm from "../ReplyForm";

// ---------------------------------------------------------------------------
// Axios mock — bare axios.post is used directly in this component (not via
// an axios instance created with axios.create), so we mock axios.post at the
// top-level default export.
// ---------------------------------------------------------------------------
const mockAxiosPost = vi.hoisted(() => vi.fn());

vi.mock("axios", () => ({
	default: {
		create: () => ({
			get: vi.fn(),
			post: vi.fn(),
			patch: vi.fn(),
			delete: vi.fn(),
		}),
		isAxiosError: (err: unknown): boolean =>
			err instanceof Object && "response" in (err as object),
		post: mockAxiosPost,
	},
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const mockTicket: Ticket = {
	id: 5,
	subject: "Can't access my account",
	body: "I have been locked out since this morning.",
	status: TicketStatus.Open,
	category: TicketCategory.Technical_Question,
	senderName: "Alice Customer",
	senderEmail: "alice@customer.com",
	assignedToId: null,
	createdAt: "2024-03-01T09:00:00.000Z",
	updatedAt: "2024-03-01T09:00:00.000Z",
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
beforeEach(() => {
	vi.clearAllMocks();
});

describe("ReplyForm", () => {
	describe("initial rendering", () => {
		it("renders the reply textarea", () => {
			renderWithClient(<ReplyForm ticket={mockTicket} />);
			expect(
				screen.getByPlaceholderText("Type your reply..."),
			).toBeInTheDocument();
		});

		it("renders the Polish button", () => {
			renderWithClient(<ReplyForm ticket={mockTicket} />);
			expect(
				screen.getByRole("button", { name: "Polish" }),
			).toBeInTheDocument();
		});

		it("renders the Send Reply button", () => {
			renderWithClient(<ReplyForm ticket={mockTicket} />);
			expect(
				screen.getByRole("button", { name: "Send Reply" }),
			).toBeInTheDocument();
		});
	});

	describe("button disabled state", () => {
		it("disables the Polish button when the textarea is empty", () => {
			renderWithClient(<ReplyForm ticket={mockTicket} />);
			expect(screen.getByRole("button", { name: "Polish" })).toBeDisabled();
		});

		it("disables the Send Reply button when the textarea is empty", () => {
			renderWithClient(<ReplyForm ticket={mockTicket} />);
			expect(screen.getByRole("button", { name: "Send Reply" })).toBeDisabled();
		});

		it("disables both buttons when the textarea contains only whitespace", async () => {
			renderWithClient(<ReplyForm ticket={mockTicket} />);
			const textarea = screen.getByPlaceholderText("Type your reply...");
			await userEvent.type(textarea, "   ");
			expect(screen.getByRole("button", { name: "Polish" })).toBeDisabled();
			expect(screen.getByRole("button", { name: "Send Reply" })).toBeDisabled();
		});

		it("enables both buttons after typing text into the textarea", async () => {
			renderWithClient(<ReplyForm ticket={mockTicket} />);
			const textarea = screen.getByPlaceholderText("Type your reply...");
			await userEvent.type(textarea, "This is my reply.");
			expect(screen.getByRole("button", { name: "Polish" })).not.toBeDisabled();
			expect(
				screen.getByRole("button", { name: "Send Reply" }),
			).not.toBeDisabled();
		});
	});

	describe("form validation", () => {
		it("shows a validation error when the form is submitted with an empty body", async () => {
			renderWithClient(<ReplyForm ticket={mockTicket} />);

			// Submit the form directly by finding and submitting, bypassing the
			// disabled button. The schema validation should still fire via RHF.
			const form = document.querySelector("form")!;
			// We trigger submit via the button after clearing the textarea; the
			// button is disabled on empty input so we type then clear to get a
			// mounted form state that triggers validation on submit.
			const textarea = screen.getByPlaceholderText("Type your reply...");
			await userEvent.type(textarea, "a");
			await userEvent.clear(textarea);

			// Even though the button is disabled we can submit the form programmatically
			// to exercise the Zod resolver path.
			form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

			await waitFor(() =>
				expect(
					screen.getByText("Reply cannot be empty"),
				).toBeInTheDocument(),
			);
		});
	});

	describe("successful reply submission", () => {
		it("calls axios.post with the correct URL and body on submit", async () => {
			mockAxiosPost.mockResolvedValue({ data: { id: 1, body: "Great, thanks!" } });

			renderWithClient(<ReplyForm ticket={mockTicket} />);

			const textarea = screen.getByPlaceholderText("Type your reply...");
			await userEvent.type(textarea, "Great, thanks!");

			await userEvent.click(screen.getByRole("button", { name: "Send Reply" }));

			await waitFor(() =>
				expect(mockAxiosPost).toHaveBeenCalledWith(
					"/api/tickets/5/replies",
					{ body: "Great, thanks!" },
				),
			);
		});

		it("clears the textarea after a successful reply submission", async () => {
			mockAxiosPost.mockResolvedValue({ data: { id: 1, body: "Great, thanks!" } });

			renderWithClient(<ReplyForm ticket={mockTicket} />);

			const textarea = screen.getByPlaceholderText("Type your reply...");
			await userEvent.type(textarea, "Great, thanks!");
			await userEvent.click(screen.getByRole("button", { name: "Send Reply" }));

			await waitFor(() =>
				expect(
					screen.getByPlaceholderText("Type your reply..."),
				).toHaveValue(""),
			);
		});

		it("invalidates the replies query cache after a successful submission", async () => {
			mockAxiosPost.mockResolvedValue({ data: { id: 1, body: "Got it." } });

			const { queryClient } = renderWithClient(<ReplyForm ticket={mockTicket} />);

			// Pre-populate the query cache with a result to ensure invalidation fires.
			queryClient.setQueryData(["tickets", "5", "replies"], []);

			const textarea = screen.getByPlaceholderText("Type your reply...");
			await userEvent.type(textarea, "Got it.");
			await userEvent.click(screen.getByRole("button", { name: "Send Reply" }));

			await waitFor(() =>
				expect(
					queryClient.getQueryState(["tickets", "5", "replies"])?.isInvalidated,
				).toBe(true),
			);
		});
	});

	describe("polish functionality", () => {
		it("calls axios.post with the polish URL and current body when Polish is clicked", async () => {
			mockAxiosPost.mockResolvedValue({ data: { body: "Polished text here." } });

			renderWithClient(<ReplyForm ticket={mockTicket} />);

			const textarea = screen.getByPlaceholderText("Type your reply...");
			await userEvent.type(textarea, "rough draft");

			await userEvent.click(screen.getByRole("button", { name: "Polish" }));

			await waitFor(() =>
				expect(mockAxiosPost).toHaveBeenCalledWith(
					"/api/tickets/5/replies/polish",
					{ body: "rough draft" },
				),
			);
		});

		it("replaces the textarea value with the polished text on success", async () => {
			mockAxiosPost.mockResolvedValue({ data: { body: "Polished text here." } });

			renderWithClient(<ReplyForm ticket={mockTicket} />);

			const textarea = screen.getByPlaceholderText("Type your reply...");
			await userEvent.type(textarea, "rough draft");

			await userEvent.click(screen.getByRole("button", { name: "Polish" }));

			await waitFor(() =>
				expect(
					screen.getByPlaceholderText("Type your reply..."),
				).toHaveValue("Polished text here."),
			);
		});

		it("shows 'Polishing...' on the Polish button while the mutation is in flight", async () => {
			let resolvePolish!: (value: unknown) => void;
			mockAxiosPost.mockReturnValue(
				new Promise((resolve) => {
					resolvePolish = resolve;
				}),
			);

			renderWithClient(<ReplyForm ticket={mockTicket} />);

			const textarea = screen.getByPlaceholderText("Type your reply...");
			await userEvent.type(textarea, "some draft");

			await userEvent.click(screen.getByRole("button", { name: "Polish" }));

			await waitFor(() =>
				expect(
					screen.getByRole("button", { name: "Polishing..." }),
				).toBeInTheDocument(),
			);

			resolvePolish({ data: { body: "Polished." } });
			await waitFor(() =>
				expect(
					screen.getByRole("button", { name: "Polish" }),
				).toBeInTheDocument(),
			);
		});

		it("disables the Send Reply button while the polish mutation is in flight", async () => {
			let resolvePolish!: (value: unknown) => void;
			mockAxiosPost.mockReturnValue(
				new Promise((resolve) => {
					resolvePolish = resolve;
				}),
			);

			renderWithClient(<ReplyForm ticket={mockTicket} />);

			const textarea = screen.getByPlaceholderText("Type your reply...");
			await userEvent.type(textarea, "some draft");

			await userEvent.click(screen.getByRole("button", { name: "Polish" }));

			await waitFor(() => {
				expect(screen.getByRole("button", { name: "Polishing..." })).toBeDisabled();
				expect(screen.getByRole("button", { name: "Send Reply" })).toBeDisabled();
			});

			resolvePolish({ data: { body: "Polished." } });
			await waitFor(() =>
				expect(
					screen.getByRole("button", { name: "Send Reply" }),
				).not.toBeDisabled(),
			);
		});
	});

	describe("pending states on reply submission", () => {
		it("shows 'Sending...' on the Send Reply button while the mutation is in flight", async () => {
			let resolveReply!: (value: unknown) => void;
			mockAxiosPost.mockReturnValue(
				new Promise((resolve) => {
					resolveReply = resolve;
				}),
			);

			renderWithClient(<ReplyForm ticket={mockTicket} />);

			const textarea = screen.getByPlaceholderText("Type your reply...");
			await userEvent.type(textarea, "This needs a moment.");

			await userEvent.click(screen.getByRole("button", { name: "Send Reply" }));

			await waitFor(() =>
				expect(
					screen.getByRole("button", { name: "Sending..." }),
				).toBeInTheDocument(),
			);

			resolveReply({ data: { id: 1, body: "This needs a moment." } });
			await waitFor(() =>
				expect(
					screen.getByRole("button", { name: "Send Reply" }),
				).toBeInTheDocument(),
			);
		});

		it("disables the Polish button while the reply mutation is in flight", async () => {
			mockAxiosPost.mockReturnValue(new Promise(() => {}));

			renderWithClient(<ReplyForm ticket={mockTicket} />);

			const textarea = screen.getByPlaceholderText("Type your reply...");
			await userEvent.type(textarea, "This needs a moment.");

			await userEvent.click(screen.getByRole("button", { name: "Send Reply" }));

			await waitFor(() =>
				expect(screen.getByRole("button", { name: "Polish" })).toBeDisabled(),
			);

		});
	});

	describe("error states", () => {
		it("shows an error message when the reply mutation fails", async () => {
			const error = Object.assign(new Error("Server error"), {
				response: { data: { error: "Failed to send reply" } },
			});
			mockAxiosPost.mockRejectedValue(error);

			renderWithClient(<ReplyForm ticket={mockTicket} />);

			const textarea = screen.getByPlaceholderText("Type your reply...");
			await userEvent.type(textarea, "This will fail.");

			await userEvent.click(screen.getByRole("button", { name: "Send Reply" }));

			await waitFor(() =>
				expect(
					screen.getByText("Failed to send reply"),
				).toBeInTheDocument(),
			);
		});

		it("shows the fallback error message when the reply mutation fails without a server message", async () => {
			mockAxiosPost.mockRejectedValue(new Error("Network error"));

			renderWithClient(<ReplyForm ticket={mockTicket} />);

			const textarea = screen.getByPlaceholderText("Type your reply...");
			await userEvent.type(textarea, "This will fail.");

			await userEvent.click(screen.getByRole("button", { name: "Send Reply" }));

			await waitFor(() =>
				expect(
					screen.getByText("Failed to send reply"),
				).toBeInTheDocument(),
			);
		});

		it("shows an error message when the polish mutation fails", async () => {
			const error = Object.assign(new Error("AI error"), {
				response: { data: { error: "Failed to polish reply" } },
			});
			mockAxiosPost.mockRejectedValue(error);

			renderWithClient(<ReplyForm ticket={mockTicket} />);

			const textarea = screen.getByPlaceholderText("Type your reply...");
			await userEvent.type(textarea, "rough draft to polish");

			await userEvent.click(screen.getByRole("button", { name: "Polish" }));

			await waitFor(() =>
				expect(
					screen.getByText("Failed to polish reply"),
				).toBeInTheDocument(),
			);
		});

		it("shows the fallback error message when the polish mutation fails without a server message", async () => {
			mockAxiosPost.mockRejectedValue(new Error("Network error"));

			renderWithClient(<ReplyForm ticket={mockTicket} />);

			const textarea = screen.getByPlaceholderText("Type your reply...");
			await userEvent.type(textarea, "rough draft to polish");

			await userEvent.click(screen.getByRole("button", { name: "Polish" }));

			await waitFor(() =>
				expect(
					screen.getByText("Failed to polish reply"),
				).toBeInTheDocument(),
			);
		});

		it("does not show any error alert before any interaction", () => {
			renderWithClient(<ReplyForm ticket={mockTicket} />);
			// No error alerts should appear on initial render
			expect(screen.queryByRole("alert")).not.toBeInTheDocument();
		});
	});
});
