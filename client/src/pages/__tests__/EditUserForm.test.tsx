import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EditUserForm } from "../EditUserForm";
import userEvent from "@testing-library/user-event";

describe("EditUserForm", () => {
	const onSubmit = vi.fn();
	const onCancel = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		onSubmit.mockResolvedValue(undefined);
	});

	function renderForm(defaultName = "Alice Agent", error: string | null = null) {
		render(
			<EditUserForm
				defaultName={defaultName}
				onSubmit={onSubmit}
				onCancel={onCancel}
				error={error}
			/>,
		);
	}

	it("renders all fields and action buttons", () => {
		renderForm();
		expect(screen.getByLabelText("Name")).toBeInTheDocument();
		expect(screen.getByLabelText("New Password")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
	});

	it("pre-fills the name field with defaultName", () => {
		renderForm("Bob Agent");
		expect(screen.getByLabelText("Name")).toHaveValue("Bob Agent");
	});

	it("starts with an empty password field", () => {
		renderForm();
		expect(screen.getByLabelText("New Password")).toHaveValue("");
	});

	it("calls onCancel when Cancel is clicked", async () => {
		renderForm();
		await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
		expect(onCancel).toHaveBeenCalledOnce();
	});

	it("shows the server error when the error prop is set", () => {
		renderForm("Alice Agent", "Something went wrong on the server.");
		expect(
			screen.getByText("Something went wrong on the server."),
		).toBeInTheDocument();
	});

	it("does not show an error banner when error is null", () => {
		renderForm();
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});

	describe("validation", () => {
		it("shows 'Name is required' and does not submit when name is cleared", async () => {
			renderForm();
			await userEvent.clear(screen.getByLabelText("Name"));
			await userEvent.click(screen.getByRole("button", { name: /^save$/i }));
			await waitFor(() =>
				expect(screen.getByText('Name is required and must be at least 3 characters')).toBeInTheDocument(),
			);
			expect(onSubmit).not.toHaveBeenCalled();
		});

		it("shows a validation error when password is too short", async () => {
			renderForm();
			await userEvent.type(screen.getByLabelText("New Password"), "abc");
			await userEvent.click(screen.getByRole("button", { name: /^save$/i }));
			await waitFor(() =>
				expect(
					screen.getByText("Password must be at least 6 characters"),
				).toBeInTheDocument(),
			);
			expect(onSubmit).not.toHaveBeenCalled();
		});
	});

	describe("successful submission", () => {
		it("submits with updated name and no password when password is left blank", async () => {
			renderForm("Alice Agent");
			await userEvent.clear(screen.getByLabelText("Name"));
			await userEvent.type(screen.getByLabelText("Name"), "Alice Updated");
			await userEvent.click(screen.getByRole("button", { name: /^save$/i }));
			await waitFor(() =>
				expect(onSubmit).toHaveBeenCalledWith({
					name: "Alice Updated",
					password: "",
				}),
			);
		});

		it("submits with both name and password when a valid password is provided", async () => {
			renderForm("Alice Agent");
			await userEvent.clear(screen.getByLabelText("Name"));
			await userEvent.type(screen.getByLabelText("Name"), "Alice Updated");
			await userEvent.type(screen.getByLabelText("New Password"), "newpass123");
			await userEvent.click(screen.getByRole("button", { name: /^save$/i }));
			await waitFor(() =>
				expect(onSubmit).toHaveBeenCalledWith({
					name: "Alice Updated",
					password: "newpass123",
				}),
			);
		});

		it("disables buttons and shows 'Saving…' while submitting", async () => {
			let resolve!: () => void;
			onSubmit.mockReturnValue(
				new Promise<void>((res) => {
					resolve = res;
				}),
			);
			renderForm();
			await userEvent.click(screen.getByRole("button", { name: /^save$/i }));
			await waitFor(() =>
				expect(
					screen.getByRole("button", { name: /saving/i }),
				).toBeDisabled(),
			);
			expect(
				screen.getByRole("button", { name: /cancel/i }),
			).toBeDisabled();
			await act(async () => { resolve(); });
		});
	});
});
