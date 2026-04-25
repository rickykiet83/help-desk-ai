import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppDialog, ConfirmDialog } from "@/components/AppDialog";
import type { CreateUserInput, UpdateUserInput } from "@helpdesk/core";
import { createUserSchema, updateUserSchema } from "@helpdesk/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import type { User } from "./UsersTable";
import { UserForm } from "./UserForm";
import { UserPlus } from "lucide-react";
import { UsersTable } from "./UsersTable";
import axios from "axios";
import { useState } from "react";

const api = axios.create({ withCredentials: true });

type DialogState =
	| { mode: "create" }
	| { mode: "edit"; user: User };

async function getUsers(): Promise<User[]> {
	const { data } = await api.get<{ users: User[] }>("/api/users?includeDeleted=true");
	return data.users;
}

async function createUser(data: CreateUserInput): Promise<void> {
	try {
		await api.post("/api/users", data);
	} catch (err) {
		if (axios.isAxiosError(err)) {
			if (err.response?.status === 409) {
				throw new Error("Email already exists, please choose a new one.");
			}
			throw new Error(err.response?.data?.error ?? "Failed to create user.");
		}
		throw err;
	}
}

async function updateUser(userId: string, data: UpdateUserInput): Promise<void> {
	await api.patch(`/api/users/${userId}`, data);
}

async function deleteUser(userId: string): Promise<void> {
	await api.delete(`/api/users/${userId}`);
}

async function restoreUser(userId: string): Promise<void> {
	await api.post(`/api/users/${userId}/restore`);
}

export function UsersPage() {
	const queryClient = useQueryClient();
	const [dialog, setDialog] = useState<DialogState | null>(null);
	const [confirmDeleteUser, setConfirmDeleteUser] = useState<User | null>(null);

	const {
		data: users = [],
		isLoading,
		error: fetchError,
	} = useQuery({ queryKey: ["users"], queryFn: getUsers });

	const createMutation = useMutation({
		mutationFn: createUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			setDialog(null);
		},
	});

	const editMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
			updateUser(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			setDialog(null);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});

	const restoreMutation = useMutation({
		mutationFn: restoreUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});

	function closeDialog() {
		createMutation.reset();
		editMutation.reset();
		setDialog(null);
	}

	async function handleFormSubmit(data: CreateUserInput | UpdateUserInput) {
		if (dialog?.mode === "create") {
			await createMutation.mutateAsync(data as CreateUserInput);
		} else if (dialog?.mode === "edit") {
			await editMutation.mutateAsync({ id: dialog.user.id, data: data as UpdateUserInput });
		}
	}

	async function handleDelete() {
		if (!confirmDeleteUser) return;
		setConfirmDeleteUser(null);
		deleteMutation.mutate(confirmDeleteUser.id);
	}

	const isCreate = dialog?.mode === "create";
	const activeError = (isCreate ? createMutation : editMutation).error?.message ?? null;

	return (
		<div className="px-6 py-8 max-w-5xl mx-auto">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold text-gray-900">Users</h1>
				<Button onClick={() => setDialog({ mode: "create" })}>
					<UserPlus className="mr-2 h-4 w-4" />
					New User
				</Button>
			</div>

			{deleteMutation.error && (
				<Alert variant="destructive" className="mb-4">
					<AlertDescription>{deleteMutation.error.message}</AlertDescription>
				</Alert>
			)}

			{restoreMutation.error && (
				<Alert variant="destructive" className="mb-4">
					<AlertDescription>{restoreMutation.error.message}</AlertDescription>
				</Alert>
			)}

			<UsersTable
				users={users}
				isLoading={isLoading}
				fetchError={fetchError?.message ?? null}
				deletingId={deleteMutation.isPending ? (confirmDeleteUser?.id ?? null) : null}
				restoringId={restoreMutation.isPending ? (restoreMutation.variables ?? null) : null}
				onDeleteClick={setConfirmDeleteUser}
				onEditClick={(user) => setDialog({ mode: "edit", user })}
				onRestoreClick={(user) => restoreMutation.mutate(user.id)}
			/>

			<AppDialog
				open={dialog !== null}
				onOpenChange={(open) => { if (!open) closeDialog(); }}
				title={isCreate ? "Add User" : "Edit User"}
				description={
					isCreate
						? "Create a new user account. They can sign in immediately with the password you set."
						: "Update the user's name or password."
				}
			>
				{dialog && (
					<UserForm
						key={dialog.mode === "edit" ? dialog.user.id : "create"}
						schema={isCreate ? createUserSchema : updateUserSchema}
						defaultValues={
							isCreate
								? { name: "", email: "", password: "" }
								: { name: dialog.mode === "edit" ? dialog.user.name : "", password: "" }
						}
						showEmail={isCreate}
						passwordHint={isCreate ? undefined : "Leave blank to keep current password"}
						submitLabel={isCreate ? "Create User" : "Save"}
						submittingLabel={isCreate ? "Creating..." : "Saving..."}
						onSubmit={handleFormSubmit}
						onCancel={closeDialog}
						error={activeError}
					/>
				)}
			</AppDialog>

			<ConfirmDialog
				open={confirmDeleteUser !== null}
				onOpenChange={(open) => {
					if (!open) setConfirmDeleteUser(null);
				}}
				title="Delete user"
				description={
					<>
						Are you sure you want to delete{" "}
						<span className="font-medium text-foreground">
							{confirmDeleteUser?.name}
						</span>
						? They will be marked as deleted and can be restored later.
					</>
				}
				confirmLabel="Delete"
				confirmVariant="destructive"
				onConfirm={handleDelete}
				isPending={deleteMutation.isPending}
			/>
		</div>
	);
}
