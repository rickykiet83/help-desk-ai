import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render } from "@testing-library/react";
import { Route, Routes, MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { TicketStatus, TicketCategory } from "@helpdesk/core";
import type { Ticket } from "@helpdesk/core";
import { TicketDetailPage } from "../TicketDetailPage";

// ---------------------------------------------------------------------------
// Axios mock — vi.hoisted ensures the factory runs before module evaluation.
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
const mockAgents = [
	{ id: "agent-1", name: "Alice Agent", email: "alice@example.com" },
	{ id: "agent-2", name: "Bob Agent", email: "bob@example.com" },
];

const mockTicket: Ticket = {
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

const assignedTicket: Ticket = {
	...mockTicket,
	assignedToId: "agent-1",
};

// ---------------------------------------------------------------------------
// Render helper — provides QueryClient + MemoryRouter with route params.
// Uses QueryClientProvider directly to avoid nesting two Routers.
// ---------------------------------------------------------------------------
function renderPage(ticketId = "1") {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter initialEntries={[`/tickets/${ticketId}`]}>
				<Routes>
					<Route path="/tickets/:id" element={<TicketDetailPage />} />
				</Routes>
			</MemoryRouter>
		</QueryClientProvider>,
	);
}

// ---------------------------------------------------------------------------
// Default mock setup: ticket fetch succeeds, agents fetch succeeds.
// ---------------------------------------------------------------------------
beforeEach(() => {
	vi.clearAllMocks();
	mockAxiosInstance.get.mockImplementation((url: string) => {
		if (url === "/api/tickets/1") {
			return Promise.resolve({ data: mockTicket });
		}
		if (url === "/api/agents") {
			return Promise.resolve({ data: { agents: mockAgents } });
		}
		return Promise.reject(new Error(`Unexpected GET ${url}`));
	});
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("TicketDetailPage", () => {
	describe("loading state", () => {
		it("shows a skeleton while the ticket query is pending", () => {
			renderPage();
			// Skeleton pulse divs are rendered immediately; ticket content is not yet present.
			expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
			expect(
				screen.queryByText("Login is broken"),
			).not.toBeInTheDocument();
		});

		it("hides the skeleton once the ticket has loaded", async () => {
			renderPage();
			await waitFor(() =>
				expect(screen.getByText("Login is broken")).toBeInTheDocument(),
			);
			expect(document.querySelector(".animate-pulse")).not.toBeInTheDocument();
		});
	});

	describe("error state", () => {
		it("shows an error message when the ticket fetch fails", async () => {
			mockAxiosInstance.get.mockImplementation((url: string) => {
				if (url === "/api/tickets/1") {
					return Promise.reject(new Error("Network error"));
				}
				return Promise.resolve({ data: { agents: mockAgents } });
			});

			renderPage();

			await waitFor(() =>
				expect(
					screen.getByText("Ticket not found or failed to load."),
				).toBeInTheDocument(),
			);
		});

		it("does not show ticket content when the fetch has errored", async () => {
			mockAxiosInstance.get.mockImplementation((url: string) => {
				if (url === "/api/tickets/1") {
					return Promise.reject(new Error("Network error"));
				}
				return Promise.resolve({ data: { agents: mockAgents } });
			});

			renderPage();

			await waitFor(() =>
				expect(
					screen.getByText("Ticket not found or failed to load."),
				).toBeInTheDocument(),
			);

			expect(screen.queryByText("Login is broken")).not.toBeInTheDocument();
		});
	});

	describe("ticket details rendering", () => {
		it("renders the ticket subject as the page heading", async () => {
			renderPage();
			await waitFor(() =>
				expect(
					screen.getByRole("heading", { name: "Login is broken" }),
				).toBeInTheDocument(),
			);
		});

		it("renders the ticket status badge", async () => {
			renderPage();
			await waitFor(() =>
				expect(screen.getByText(TicketStatus.Open)).toBeInTheDocument(),
			);
		});

		it("renders the sender's name and email", async () => {
			renderPage();
			// The component formats it as "Name <email>"
			await waitFor(() =>
				expect(
					screen.getAllByText("Jane Smith <jane@example.com>").length,
				).toBeGreaterThan(0),
			);
		});

		it("renders the ticket body in the message card", async () => {
			renderPage();
			await waitFor(() =>
				expect(
					screen.getByText(
						"I cannot log in to my account since yesterday.",
					),
				).toBeInTheDocument(),
			);
		});

		it("renders the ticket category label", async () => {
			renderPage();
			await waitFor(() =>
				expect(screen.getByText("Technical Question")).toBeInTheDocument(),
			);
		});

		it("renders a back link to /tickets", async () => {
			renderPage();
			await waitFor(() =>
				expect(screen.getByText("Login is broken")).toBeInTheDocument(),
			);
			const backLink = screen.getByRole("link", { name: /back to tickets/i });
			expect(backLink).toHaveAttribute("href", "/tickets");
		});
	});

	describe("agent dropdown", () => {
		it("renders an 'Unassigned' option in the select", async () => {
			renderPage();
			await waitFor(() =>
				expect(screen.getByLabelText("Assigned to")).toBeInTheDocument(),
			);
			expect(
				screen.getByRole("option", { name: "Unassigned" }),
			).toBeInTheDocument();
		});

		it("renders one option per agent fetched from the API", async () => {
			renderPage();
			await waitFor(() =>
				expect(
					screen.getByRole("option", { name: "Alice Agent" }),
				).toBeInTheDocument(),
			);
			expect(
				screen.getByRole("option", { name: "Bob Agent" }),
			).toBeInTheDocument();
		});

		it("pre-selects 'Unassigned' when the ticket has no assignee", async () => {
			renderPage();
			await waitFor(() =>
				expect(screen.getByLabelText("Assigned to")).toBeInTheDocument(),
			);
			const select = screen.getByLabelText("Assigned to");
			expect((select as HTMLSelectElement).value).toBe("");
		});

		it("pre-selects the current assignee when the ticket has an assignedToId", async () => {
			mockAxiosInstance.get.mockImplementation((url: string) => {
				if (url === "/api/tickets/1") {
					return Promise.resolve({ data: assignedTicket });
				}
				if (url === "/api/agents") {
					return Promise.resolve({ data: { agents: mockAgents } });
				}
				return Promise.reject(new Error(`Unexpected GET ${url}`));
			});

			renderPage();

			await waitFor(() =>
				expect(screen.getByLabelText("Assigned to")).toBeInTheDocument(),
			);
			const select = screen.getByLabelText("Assigned to");
			expect((select as HTMLSelectElement).value).toBe("agent-1");
		});
	});

	describe("assignment interaction", () => {
		it("calls PATCH /api/tickets/1 with the selected agent id when an agent is chosen", async () => {
			mockAxiosInstance.patch.mockResolvedValue({});
			renderPage();

			await waitFor(() =>
				expect(
					screen.getByRole("option", { name: "Alice Agent" }),
				).toBeInTheDocument(),
			);

			await userEvent.selectOptions(
				screen.getByLabelText("Assigned to"),
				"agent-1",
			);

			await waitFor(() =>
				expect(mockAxiosInstance.patch).toHaveBeenCalledWith("/api/tickets/1", {
					assignedToId: "agent-1",
				}),
			);
		});

		it("calls PATCH /api/tickets/1 with null when 'Unassigned' is selected", async () => {
			mockAxiosInstance.get.mockImplementation((url: string) => {
				if (url === "/api/tickets/1") {
					return Promise.resolve({ data: assignedTicket });
				}
				if (url === "/api/agents") {
					return Promise.resolve({ data: { agents: mockAgents } });
				}
				return Promise.reject(new Error(`Unexpected GET ${url}`));
			});
			mockAxiosInstance.patch.mockResolvedValue({});

			renderPage();

			await waitFor(() =>
				expect(screen.getByLabelText("Assigned to")).toBeInTheDocument(),
			);

			await userEvent.selectOptions(
				screen.getByLabelText("Assigned to"),
				"",
			);

			await waitFor(() =>
				expect(mockAxiosInstance.patch).toHaveBeenCalledWith("/api/tickets/1", {
					assignedToId: null,
				}),
			);
		});

		it("invalidates the ticket query after a successful assignment (triggers refetch)", async () => {
			mockAxiosInstance.patch.mockResolvedValue({});

			renderPage();

			await waitFor(() =>
				expect(
					screen.getByRole("option", { name: "Alice Agent" }),
				).toBeInTheDocument(),
			);

			await userEvent.selectOptions(
				screen.getByLabelText("Assigned to"),
				"agent-1",
			);

			// After onSuccess fires, the ticket GET should be called a second time
			// (the initial fetch + the invalidation refetch).
			await waitFor(() =>
				expect(
					mockAxiosInstance.get.mock.calls.filter(
						(call: string[]) => call[0] === "/api/tickets/1",
					).length,
				).toBeGreaterThanOrEqual(2),
			);
		});
	});

	describe("mutation pending state", () => {
		it("disables the select while the PATCH mutation is in flight", async () => {
			// Hold the PATCH response so the mutation stays pending
			let resolvePatch!: () => void;
			mockAxiosInstance.patch.mockReturnValue(
				new Promise<void>((resolve) => {
					resolvePatch = resolve;
				}),
			);

			renderPage();

			await waitFor(() =>
				expect(
					screen.getByRole("option", { name: "Alice Agent" }),
				).toBeInTheDocument(),
			);

			const select = screen.getByLabelText("Assigned to");
			expect(select).not.toBeDisabled();

			// Trigger the mutation without awaiting its completion
			await userEvent.selectOptions(select, "agent-1");

			// The select must be disabled while awaiting the response
			await waitFor(() => expect(select).toBeDisabled());

			// Resolve so the component can finish and no state updates bleed into the next test
			resolvePatch();
			await waitFor(() => expect(select).not.toBeDisabled());
		});
	});

	describe("mutation error state", () => {
		it("shows 'Failed to update assignment.' when the PATCH request fails", async () => {
			mockAxiosInstance.patch.mockRejectedValue(
				new Error("Internal server error"),
			);

			renderPage();

			await waitFor(() =>
				expect(
					screen.getByRole("option", { name: "Alice Agent" }),
				).toBeInTheDocument(),
			);

			await userEvent.selectOptions(
				screen.getByLabelText("Assigned to"),
				"agent-1",
			);

			await waitFor(() =>
				expect(
					screen.getByText("Failed to update assignment."),
				).toBeInTheDocument(),
			);
		});

		it("does not show the error message before any interaction", async () => {
			renderPage();

			await waitFor(() =>
				expect(screen.getByLabelText("Assigned to")).toBeInTheDocument(),
			);

			expect(
				screen.queryByText("Failed to update assignment."),
			).not.toBeInTheDocument();
		});
	});
});
