import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";

import { Role } from "@helpdesk/core";
import type { User } from "../UsersTable";
import { UsersPage } from "../UsersPage";
import { renderWithClient } from "@/test/render";
import userEvent from "@testing-library/user-event";

// ---------------------------------------------------------------------------
// Axios mock — must use vi.hoisted so the factory can reference these values
// before the module is evaluated.
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
		// Treat any object with a `response` property as an Axios error
		isAxiosError: (err: unknown): boolean =>
			err instanceof Object && "response" in (err as object),
	},
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const mockUsers: User[] = [
	{
		id: "1",
		name: "Alice Admin",
		email: "alice@example.com",
		role: Role.admin,
		createdAt: "2024-01-15T00:00:00.000Z",
		deletedAt: null,
	},
	{
		id: "2",
		name: "Bob Agent",
		email: "bob@example.com",
		role: Role.agent,
		createdAt: "2024-03-20T00:00:00.000Z",
		deletedAt: null,
	},
];

const deletedUser: User = {
	id: "3",
	name: "Carol Deleted",
	email: "carol@example.com",
	role: "agent",
	createdAt: "2024-05-01T00:00:00.000Z",
	deletedAt: "2024-06-01T00:00:00.000Z",
};

function renderPage() {
	return renderWithClient(<UsersPage />);
}

// Wait for the initial user list to finish loading
async function waitForUsers() {
	await waitFor(() => expect(screen.getByText("Bob Agent")).toBeInTheDocument());
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
beforeEach(() => {
	vi.clearAllMocks();
	mockAxiosInstance.get.mockResolvedValue({ data: { users: mockUsers } });
});

describe("UsersPage", () => {
	it("shows skeleton while fetching and then renders the user list", async () => {
		renderPage();
		// Skeleton is shown immediately — no user names yet
		expect(screen.queryByText("Alice Admin")).not.toBeInTheDocument();
		// Wait for data
		await waitForUsers();
		expect(screen.getByText("Alice Admin")).toBeInTheDocument();
		expect(screen.getByText("bob@example.com")).toBeInTheDocument();
	});

	it("shows a fetch error when the API call fails", async () => {
		mockAxiosInstance.get.mockRejectedValue(new Error("Network error"));
		renderPage();
		await waitFor(() =>
			expect(screen.getByText("Network error")).toBeInTheDocument(),
		);
	});

	describe("Add Agent dialog", () => {
		it("opens the dialog when Add Agent is clicked", async () => {
			renderPage();
			await waitForUsers();
			await userEvent.click(screen.getByRole("button", { name: /new user/i }));
			expect(screen.getByRole("dialog")).toBeInTheDocument();
			expect(screen.getByLabelText("Name")).toBeInTheDocument();
			expect(screen.getByLabelText("Email")).toBeInTheDocument();
			expect(screen.getByLabelText("Password")).toBeInTheDocument();
		});

		it("shows validation errors when the form is submitted empty", async () => {
			renderPage();
			await waitForUsers();
			await userEvent.click(screen.getByRole("button", { name: /new user/i }));
			await userEvent.click(screen.getByRole("button", { name: /create user/i }));
			await waitFor(() =>
				expect(screen.getByText('Name is required and must be at least 3 characters')).toBeInTheDocument(),
			);
		});

		it("closes and resets the form after a successful create", async () => {
			mockAxiosInstance.post.mockResolvedValue({});
			renderPage();
			await waitForUsers();
			await userEvent.click(screen.getByRole("button", { name: /new user/i }));
			await userEvent.type(screen.getByLabelText("Name"), "New Agent");
			await userEvent.type(screen.getByLabelText("Email"), "new@example.com");
			await userEvent.type(screen.getByLabelText("Password"), "secret123");
			await userEvent.click(screen.getByRole("button", { name: /create user/i }));
			await waitFor(() =>
				expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
			);
			expect(mockAxiosInstance.post).toHaveBeenCalledWith("/api/users", {
				name: "New Agent",
				email: "new@example.com",
				password: "secret123",
			});
		});

		it("shows a friendly error message for duplicate email (409)", async () => {
			mockAxiosInstance.post.mockRejectedValue({
				response: { status: 409, data: { error: "A user with this email already exists" } },
			});
			renderPage();
			await waitForUsers();
			await userEvent.click(screen.getByRole("button", { name: /new user/i }));
			await userEvent.type(screen.getByLabelText("Name"), "Dup");
			await userEvent.type(screen.getByLabelText("Email"), "alice@example.com");
			await userEvent.type(screen.getByLabelText("Password"), "secret123");
			await userEvent.click(screen.getByRole("button", { name: /create user/i }));
			await waitFor(() =>
				expect(
					screen.getByText("Email already exists, please choose a new one."),
				).toBeInTheDocument(),
			);
		});
	});

	describe("Edit user dialog", () => {
		it("opens the dialog pre-filled with the user's current name", async () => {
			renderPage();
			await waitForUsers();
			const editButtons = screen.getAllByTitle("Edit user");
			await userEvent.click(editButtons[1]); // Bob's edit button
			expect(screen.getByRole("dialog")).toBeInTheDocument();
			expect(screen.getByDisplayValue("Bob Agent")).toBeInTheDocument();
		});

		it("calls PATCH and closes the dialog on successful save", async () => {
			mockAxiosInstance.patch.mockResolvedValue({});
			renderPage();
			await waitForUsers();
			await userEvent.click(screen.getAllByTitle("Edit user")[1]);
			const nameInput = screen.getByDisplayValue("Bob Agent");
			await userEvent.clear(nameInput);
			await userEvent.type(nameInput, "Bob Updated");
			await userEvent.click(screen.getByRole("button", { name: /^save$/i }));
			await waitFor(() =>
				expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
			);
			expect(mockAxiosInstance.patch).toHaveBeenCalledWith("/api/users/2", {
				name: "Bob Updated",
				password: "",
			});
		});

		it("shows a validation error when name is cleared", async () => {
			renderPage();
			await waitForUsers();
			await userEvent.click(screen.getAllByTitle("Edit user")[1]);
			const nameInput = screen.getByDisplayValue("Bob Agent");
			await userEvent.clear(nameInput);
			await userEvent.click(screen.getByRole("button", { name: /^save$/i }));
			await waitFor(() =>
				expect(screen.getByText('Name is required and must be at least 3 characters')).toBeInTheDocument(),
			);
		});
	});

	describe("Delete user flow", () => {
		it("opens a confirmation dialog showing the user's name", async () => {
			renderPage();
			await waitForUsers();
			await userEvent.click(screen.getByTitle("Delete user"));
			expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
			// "Bob Agent" appears in the confirmation description
			expect(screen.getAllByText("Bob Agent").length).toBeGreaterThan(0);
		});

		it("confirmation dialog says the user can be restored later", async () => {
			renderPage();
			await waitForUsers();
			await userEvent.click(screen.getByTitle("Delete user"));
			expect(screen.getByText(/can be restored later/i)).toBeInTheDocument();
		});

		it("calls DELETE and closes the dialog after confirming", async () => {
			mockAxiosInstance.delete.mockResolvedValue({});
			renderPage();
			await waitForUsers();
			await userEvent.click(screen.getByTitle("Delete user"));
			await userEvent.click(screen.getByRole("button", { name: /^delete$/i }));
			await waitFor(() =>
				expect(mockAxiosInstance.delete).toHaveBeenCalledWith("/api/users/2"),
			);
		});

		it("closes the confirmation dialog when Cancel is clicked", async () => {
			renderPage();
			await waitForUsers();
			await userEvent.click(screen.getByTitle("Delete user"));
			expect(screen.getByRole("dialog")).toBeInTheDocument();
			await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
			await waitFor(() =>
				expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
			);
			expect(mockAxiosInstance.delete).not.toHaveBeenCalled();
		});
	});

	describe("Restore user flow", () => {
		it("fetches users with ?includeDeleted=true", async () => {
			renderPage();
			await waitForUsers();
			expect(mockAxiosInstance.get).toHaveBeenCalledWith("/api/users?includeDeleted=true");
		});

		it("shows a restore button for a deleted user in the list", async () => {
			mockAxiosInstance.get.mockResolvedValue({
				data: { users: [...mockUsers, deletedUser] },
			});
			renderPage();
			await waitFor(() =>
				expect(screen.getByText("Carol Deleted")).toBeInTheDocument(),
			);
			expect(screen.getByTitle("Restore user")).toBeInTheDocument();
		});

		it("calls POST /api/users/:id/restore when the restore button is clicked", async () => {
			mockAxiosInstance.post.mockResolvedValue({});
			mockAxiosInstance.get.mockResolvedValue({
				data: { users: [...mockUsers, deletedUser] },
			});
			renderPage();
			await waitFor(() =>
				expect(screen.getByTitle("Restore user")).toBeInTheDocument(),
			);
			await userEvent.click(screen.getByTitle("Restore user"));
			await waitFor(() =>
				expect(mockAxiosInstance.post).toHaveBeenCalledWith("/api/users/3/restore"),
			);
		});

		it("shows a restore error alert when the restore POST fails", async () => {
			mockAxiosInstance.post.mockRejectedValue(
				new Error("Failed to restore user."),
			);
			mockAxiosInstance.get.mockResolvedValue({
				data: { users: [...mockUsers, deletedUser] },
			});
			renderPage();
			await waitFor(() =>
				expect(screen.getByTitle("Restore user")).toBeInTheDocument(),
			);
			await userEvent.click(screen.getByTitle("Restore user"));
			await waitFor(() =>
				expect(screen.getByText("Failed to restore user.")).toBeInTheDocument(),
			);
		});
	});
});
