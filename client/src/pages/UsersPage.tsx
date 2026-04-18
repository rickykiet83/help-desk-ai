import { Loader2, UserPlus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppDialog, ConfirmDialog } from "@/components/AppDialog";
import { UsersTable } from "./UsersTable";
import type { User } from "./UsersTable";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const createAgentSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.email("Enter a valid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});
type CreateAgentFormData = z.infer<typeof createAgentSchema>;

const api = axios.create({ withCredentials: true });

async function fetchUsers(): Promise<User[]> {
	const { data } = await api.get<{ users: User[] }>("/api/users");
	return data.users;
}

async function createUser(data: CreateAgentFormData): Promise<void> {
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

async function deleteUser(userId: string): Promise<void> {
	await api.delete(`/api/users/${userId}`);
}

export function UsersPage() {
	const queryClient = useQueryClient();
	const [confirmDeleteUser, setConfirmDeleteUser] = useState<User | null>(null);
	const [showCreateDialog, setShowCreateDialog] = useState(false);

	const {
		data: users = [],
		isLoading,
		error: fetchError,
	} = useQuery({ queryKey: ["users"], queryFn: fetchUsers });

	const createMutation = useMutation({
		mutationFn: createUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			setShowCreateDialog(false);
			reset();
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<CreateAgentFormData>({
		resolver: zodResolver(createAgentSchema),
		defaultValues: { name: "", email: "", password: "" },
	});

	function handleDialogOpenChange(open: boolean) {
		if (!open) {
			reset();
			createMutation.reset();
		}
		setShowCreateDialog(open);
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
					Add Agent
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
			/>

			<AppDialog
				open={showCreateDialog}
				onOpenChange={handleDialogOpenChange}
				title="Add Agent"
				description="Create a new agent account. They can sign in immediately with the password you set."
			>
				<form
					onSubmit={handleSubmit((data) => createMutation.mutateAsync(data))}
					className="space-y-4 mt-2"
				>
					<div className="space-y-1">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							{...register("name")}
							aria-invalid={!!errors.name}
						/>
						{errors.name && (
							<p className="text-xs text-destructive">{errors.name.message}</p>
						)}
					</div>

					<div className="space-y-1">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							{...register("email")}
							aria-invalid={!!errors.email}
						/>
						{errors.email && (
							<p className="text-xs text-destructive">
								{errors.email.message}
							</p>
						)}
					</div>

					<div className="space-y-1">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							{...register("password")}
							aria-invalid={!!errors.password}
						/>
						{errors.password && (
							<p className="text-xs text-destructive">
								{errors.password.message}
							</p>
						)}
						<p className="text-xs text-muted-foreground">
							Minimum 6 characters.
						</p>
					</div>

					{createMutation.error && (
						<Alert variant="destructive">
							<AlertDescription>
								{createMutation.error.message}
							</AlertDescription>
						</Alert>
					)}

					<div className="flex justify-end gap-2 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => handleDialogOpenChange(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting && (
								<Loader2 className="animate-spin mr-2 h-4 w-4" />
							)}
							{isSubmitting ? "Creating..." : "Create Agent"}
						</Button>
					</div>
				</form>
			</AppDialog>

			<ConfirmDialog
				open={confirmDeleteUser !== null}
				onOpenChange={(open) => { if (!open) setConfirmDeleteUser(null); }}
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
