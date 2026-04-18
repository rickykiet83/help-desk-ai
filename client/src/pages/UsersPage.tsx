import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppDialog, ConfirmDialog } from "@/components/AppDialog";
import type { CreateUserInput, UpdateUserInput } from "@helpdesk/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { CreateUserForm } from "./CreateUserForm";
import { EditUserForm } from "./EditUserForm";
import type { User } from "./UsersTable";
import { UserPlus } from "lucide-react";
import { UsersTable } from "./UsersTable";
import axios from "axios";
import { useState } from "react";

const api = axios.create({ withCredentials: true });

async function getUsers(): Promise<User[]> {
	const { data } = await api.get<{ users: User[] }>("/api/users");
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

export function UsersPage() {
	const queryClient = useQueryClient();
	const [confirmDeleteUser, setConfirmDeleteUser] = useState<User | null>(null);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [editUser, setEditUser] = useState<User | null>(null);

	const {
		data: users = [],
		isLoading,
		error: fetchError,
	} = useQuery({ queryKey: ["users"], queryFn: getUsers });

	const createMutation = useMutation({
		mutationFn: createUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			setShowCreateDialog(false);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});

	const editMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
			updateUser(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			setEditUser(null);
		},
	});

	function handleDialogOpenChange(open: boolean) {
		if (!open) createMutation.reset();
		setShowCreateDialog(open);
	}

	function handleEditOpenChange(open: boolean) {
		if (!open) {
			editMutation.reset();
			setEditUser(null);
		}
	}

	async function handleDelete() {
		if (!confirmDeleteUser) return;
		setConfirmDeleteUser(null);
		deleteMutation.mutate(confirmDeleteUser.id);
	}

	return (
		<div className="px-6 py-8 max-w-5xl mx-auto">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold text-gray-900">Users</h1>
				<Button onClick={() => setShowCreateDialog(true)}>
					<UserPlus className="mr-2 h-4 w-4" />
					New User
				</Button>
			</div>

			{deleteMutation.error && (
				<Alert variant="destructive" className="mb-4">
					<AlertDescription>{deleteMutation.error.message}</AlertDescription>
				</Alert>
			)}

			<UsersTable
				users={users}
				isLoading={isLoading}
				fetchError={fetchError?.message ?? null}
				deletingId={deleteMutation.isPending ? (confirmDeleteUser?.id ?? null) : null}
				onDeleteClick={setConfirmDeleteUser}
				onEditClick={setEditUser}
			/>

			<AppDialog
				open={showCreateDialog}
				onOpenChange={handleDialogOpenChange}
				title="Add Agent"
				description="Create a new agent account. They can sign in immediately with the password you set."
			>
				<CreateUserForm
					onSubmit={createMutation.mutateAsync}
					onCancel={() => handleDialogOpenChange(false)}
					error={createMutation.error?.message ?? null}
				/>
			</AppDialog>

			<AppDialog
				open={editUser !== null}
				onOpenChange={handleEditOpenChange}
				title="Edit user"
				description="Update the user's display name."
			>
				{editUser && (
					<EditUserForm
						key={editUser.id}
						defaultName={editUser.name}
						onSubmit={(data) => editMutation.mutateAsync({ id: editUser.id, data })}
						onCancel={() => handleEditOpenChange(false)}
						error={editMutation.error?.message ?? null}
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
						? This action cannot be undone.
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
