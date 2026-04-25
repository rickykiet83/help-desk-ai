import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { Role } from "@helpdesk/core";
import type { User } from "../UsersTable";
import { UsersTable } from "../UsersTable";
import userEvent from "@testing-library/user-event";

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

const defaultProps = {
	users: mockUsers,
	isLoading: false,
	fetchError: null,
	deletingId: null,
	restoringId: null,
	onDeleteClick: vi.fn(),
	onEditClick: vi.fn(),
	onRestoreClick: vi.fn(),
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

	describe("soft-delete / restore", () => {
		const deletedUser: User = {
			id: "3",
			name: "Carol Deleted",
			email: "carol@example.com",
			role: Role.agent,
			createdAt: "2024-05-01T00:00:00.000Z",
			deletedAt: "2024-06-01T00:00:00.000Z",
		};

		it("shows a green 'Active' badge for users with deletedAt: null", () => {
			render(<UsersTable {...defaultProps} />);
			const activeBadges = screen.getAllByText("Active");
			activeBadges.forEach((badge) =>
				expect(badge).toHaveClass("bg-green-100", "text-green-700"),
			);
		});

		it("shows a red 'Deleted' badge for a user with a non-null deletedAt", () => {
			render(<UsersTable {...defaultProps} users={[...mockUsers, deletedUser]} />);
			const deletedBadge = screen.getByText("Deleted");
			expect(deletedBadge).toHaveClass("bg-red-100", "text-red-700");
		});

		it("applies opacity-50 to the row of a deleted user", () => {
			render(<UsersTable {...defaultProps} users={[...mockUsers, deletedUser]} />);
			// The deleted user's name cell is inside the opacity-50 row
			const nameCell = screen.getByText("Carol Deleted");
			// Walk up to the <tr> element
			const row = nameCell.closest("tr");
			expect(row).toHaveClass("opacity-50");
		});

		it("shows a restore button and no edit or delete buttons for a deleted user", () => {
			render(<UsersTable {...defaultProps} users={[deletedUser]} />);
			expect(screen.getByTitle("Restore user")).toBeInTheDocument();
			expect(screen.queryByTitle("Edit user")).not.toBeInTheDocument();
			expect(screen.queryByTitle("Delete user")).not.toBeInTheDocument();
			expect(screen.queryByTitle("Cannot delete an admin")).not.toBeInTheDocument();
		});

		it("calls onRestoreClick with the correct user when restore is clicked", async () => {
			const onRestoreClick = vi.fn();
			render(
				<UsersTable
					{...defaultProps}
					users={[deletedUser]}
					onRestoreClick={onRestoreClick}
				/>,
			);
			await userEvent.click(screen.getByTitle("Restore user"));
			expect(onRestoreClick).toHaveBeenCalledWith(deletedUser);
		});

		it("disables the restore button when restoringId matches the deleted user's id", () => {
			render(
				<UsersTable
					{...defaultProps}
					users={[deletedUser]}
					restoringId={deletedUser.id}
				/>,
			);
			expect(screen.getByTitle("Restore user")).toBeDisabled();
		});

		it("disables all restore buttons when any restore is in progress", () => {
			const anotherDeletedUser: User = {
				id: "4",
				name: "Dave Deleted",
				email: "dave@example.com",
				role: Role.agent,
				createdAt: "2024-05-10T00:00:00.000Z",
				deletedAt: "2024-06-10T00:00:00.000Z",
			};
			render(
				<UsersTable
					{...defaultProps}
					users={[deletedUser, anotherDeletedUser]}
					restoringId={deletedUser.id}
				/>,
			);
			const restoreButtons = screen.getAllByTitle("Restore user");
			expect(restoreButtons).toHaveLength(2);
			restoreButtons.forEach((btn) => expect(btn).toBeDisabled());
		});
	});
});
