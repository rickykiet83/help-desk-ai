import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import { CreateUserForm } from "../CreateUserForm";
import userEvent from "@testing-library/user-event";

describe("CreateUserForm", () => {
	const onSubmit = vi.fn();
	const onCancel = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		onSubmit.mockResolvedValue(undefined);
	});

	function renderForm(error: string | null = null) {
		render(
			<CreateUserForm onSubmit={onSubmit} onCancel={onCancel} error={error} />,
		);
	}

	it("renders all fields and action buttons", () => {
		renderForm();
		expect(screen.getByLabelText("Name")).toBeInTheDocument();
		expect(screen.getByLabelText("Email")).toBeInTheDocument();
		expect(screen.getByLabelText("Password")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /create agent/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /cancel/i }),
		).toBeInTheDocument();
	});

	it("calls onCancel when Cancel is clicked", async () => {
		renderForm();
		await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
		expect(onCancel).toHaveBeenCalledOnce();
	});

	it("shows the server error when the error prop is set", () => {
		renderForm("Email already exists, please choose a new one.");
		expect(
			screen.getByText("Email already exists, please choose a new one."),
		).toBeInTheDocument();
	});

	it("does not show an error banner when error is null", () => {
		renderForm(null);
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});

	describe("validation", () => {
		it("shows 'Name is required' and does not submit when form is empty", async () => {
			renderForm();
			await userEvent.click(
				screen.getByRole("button", { name: /create agent/i }),
			);
			await waitFor(() =>
				expect(screen.getByText("Name is required")).toBeInTheDocument(),
			);
			expect(onSubmit).not.toHaveBeenCalled();
		});

		it("shows 'Invalid email address' when email is left empty", async () => {
			renderForm();
			await userEvent.type(screen.getByLabelText("Name"), "Alice");
			// intentionally leave email blank
			await userEvent.type(screen.getByLabelText("Password"), "secret123");
			await userEvent.click(
				screen.getByRole("button", { name: /create agent/i }),
			);
			await waitFor(() =>
				expect(
					screen.getByText("Invalid email address"),
				).toBeInTheDocument(),
			);
			expect(onSubmit).not.toHaveBeenCalled();
		});

		it("shows 'Password must be at least 6 characters' for a short password", async () => {
			renderForm();
			await userEvent.type(screen.getByLabelText("Name"), "Alice");
			await userEvent.type(
				screen.getByLabelText("Email"),
				"alice@example.com",
			);
			await userEvent.type(screen.getByLabelText("Password"), "abc");
			await userEvent.click(
				screen.getByRole("button", { name: /create agent/i }),
			);
			await waitFor(() =>
				expect(
					screen.getByText("Password must be at least 6 characters"),
				).toBeInTheDocument(),
			);
			expect(onSubmit).not.toHaveBeenCalled();
		});
	});

	describe("successful submission", () => {
		it("calls onSubmit with the correct values", async () => {
			renderForm();
			await userEvent.type(screen.getByLabelText("Name"), "Alice");
			await userEvent.type(
				screen.getByLabelText("Email"),
				"alice@example.com",
			);
			await userEvent.type(screen.getByLabelText("Password"), "secret123");
			await userEvent.click(
				screen.getByRole("button", { name: /create agent/i }),
			);
			await waitFor(() =>
				expect(onSubmit).toHaveBeenCalledWith({
					name: "Alice",
					email: "alice@example.com",
					password: "secret123",
				}),
			);
		});

		it("disables buttons and shows 'Creating…' while submitting", async () => {
			let resolve!: () => void;
			onSubmit.mockReturnValue(
				new Promise<void>((res) => {
					resolve = res;
				}),
			);
			renderForm();
			await userEvent.type(screen.getByLabelText("Name"), "Alice");
			await userEvent.type(
				screen.getByLabelText("Email"),
				"alice@example.com",
			);
			await userEvent.type(screen.getByLabelText("Password"), "secret123");
			await userEvent.click(
				screen.getByRole("button", { name: /create agent/i }),
			);
			await waitFor(() =>
				expect(
					screen.getByRole("button", { name: /creating/i }),
				).toBeDisabled(),
			);
			expect(
				screen.getByRole("button", { name: /cancel/i }),
			).toBeDisabled();
			resolve();
		});
	});
});
