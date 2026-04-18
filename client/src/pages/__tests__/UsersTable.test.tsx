import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import type { User } from "../UsersTable";
import { UsersTable } from "../UsersTable";
import userEvent from "@testing-library/user-event";

const mockUsers: User[] = [
	{
		id: "1",
		name: "Alice Admin",
		email: "alice@example.com",
		role: "admin",
		createdAt: "2024-01-15T00:00:00.000Z",
	},
	{
		id: "2",
		name: "Bob Agent",
		email: "bob@example.com",
		role: "agent",
		createdAt: "2024-03-20T00:00:00.000Z",
	},
];

const defaultProps = {
	users: mockUsers,
	isLoading: false,
	fetchError: null,
	deletingId: null,
	onDeleteClick: vi.fn(),
	onEditClick: vi.fn(),
};

beforeEach(() => vi.clearAllMocks());

describe("UsersTable", () => {

	it("shows skeleton rows when loading — no user data visible", () => {
		render(<UsersTable {...defaultProps} isLoading />);
		expect(screen.queryByText("Alice Admin")).not.toBeInTheDocument();
		expect(screen.queryByText("Name")).not.toBeInTheDocument();
		expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
	});

	it("shows error alert when fetchError is provided", () => {
		render(<UsersTable {...defaultProps} users={[]} fetchError="Network error" />);
		expect(screen.getByText("Network error")).toBeInTheDocument();
	});

	it("shows empty state when the users array is empty", () => {
		render(<UsersTable {...defaultProps} users={[]} />);
		expect(screen.getByText("No users found.")).toBeInTheDocument();
	});

	it("renders each user's name, email, and role", () => {
		render(<UsersTable {...defaultProps} />);
		expect(screen.getByText("Alice Admin")).toBeInTheDocument();
		expect(screen.getByText("alice@example.com")).toBeInTheDocument();
		expect(screen.getByText("Bob Agent")).toBeInTheDocument();
		expect(screen.getByText("bob@example.com")).toBeInTheDocument();
	});

	it("uses a purple badge for admin and blue badge for agent", () => {
		render(<UsersTable {...defaultProps} />);
		expect(screen.getByText("admin")).toHaveClass("bg-purple-100", "text-purple-700");
		expect(screen.getByText("agent")).toHaveClass("bg-blue-100", "text-blue-700");
	});

	it("disables the delete button for admin users", () => {
		render(<UsersTable {...defaultProps} />);
		expect(screen.getByTitle("Cannot delete an admin")).toBeDisabled();
		expect(screen.getByTitle("Delete user")).not.toBeDisabled();
	});

	it("disables all delete buttons when a deletion is in progress", () => {
		render(<UsersTable {...defaultProps} deletingId="2" />);
		const deleteButtons = screen.getAllByTitle(/delete user|cannot delete an admin/i);
		deleteButtons.forEach((btn) => expect(btn).toBeDisabled());
	});

	it("calls onDeleteClick with the correct user when delete is clicked", async () => {
		const onDeleteClick = vi.fn();
		render(<UsersTable {...defaultProps} onDeleteClick={onDeleteClick} />);
		await userEvent.click(screen.getByTitle("Delete user"));
		expect(onDeleteClick).toHaveBeenCalledWith(mockUsers[1]);
	});

	it("calls onEditClick with the correct user when edit is clicked", async () => {
		const onEditClick = vi.fn();
		render(<UsersTable {...defaultProps} onEditClick={onEditClick} />);
		const editButtons = screen.getAllByTitle("Edit user");
		await userEvent.click(editButtons[0]);
		expect(onEditClick).toHaveBeenCalledWith(mockUsers[0]);
	});
});
