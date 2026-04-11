import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UsersTable } from "./UsersTable";
import type { User } from "./UsersTable";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const createAgentSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.email("Enter a valid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});
type CreateAgentFormData = z.infer<typeof createAgentSchema>;

export function UsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [confirmDeleteUser, setConfirmDeleteUser] = useState<User | null>(null);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [createError, setCreateError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<CreateAgentFormData>({
		resolver: zodResolver(createAgentSchema),
		defaultValues: { name: "", email: "", password: "" },
	});

	async function fetchUsers() {
		setIsLoading(true);
		setFetchError(null);
		const res = await fetch("/api/users", { credentials: "include" });
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			setFetchError(body.error ?? "Failed to load users.");
		} else {
			const body = await res.json();
			setUsers(body.users);
		}
		setIsLoading(false);
	}

	useEffect(() => {
		fetchUsers();
	}, []);

	async function onCreateAgent(data: CreateAgentFormData) {
		setCreateError(null);
		const res = await fetch("/api/users", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			setCreateError(body.error ?? "Failed to create user.");
			return;
		}
		setShowCreateDialog(false);
		reset();
		await fetchUsers();
	}

	function handleDialogOpenChange(open: boolean) {
		if (!open) {
			reset();
			setCreateError(null);
		}
		setShowCreateDialog(open);
	}

	async function handleDelete() {
		if (!confirmDeleteUser) return;
		const userId = confirmDeleteUser.id;
		setConfirmDeleteUser(null);
		setDeleteError(null);
		setDeletingId(userId);
		const res = await fetch(`/api/users/${userId}`, {
			method: "DELETE",
			credentials: "include",
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			setDeleteError(body.error ?? "Failed to delete user.");
		} else {
			setUsers((prev) => prev.filter((u) => u.id !== userId));
		}
		setDeletingId(null);
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

			{deleteError && (
				<Alert variant="destructive" className="mb-4">
					<AlertDescription>{deleteError}</AlertDescription>
				</Alert>
			)}

			<UsersTable
				users={users}
				isLoading={isLoading}
				fetchError={fetchError}
				deletingId={deletingId}
				onDeleteClick={setConfirmDeleteUser}
			/>

			<Dialog open={showCreateDialog} onOpenChange={handleDialogOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add Agent</DialogTitle>
						<DialogDescription>
							Create a new agent account. They can sign in immediately with the
							password you set.
						</DialogDescription>
					</DialogHeader>

					<form
						onSubmit={handleSubmit(onCreateAgent)}
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

						{createError && (
							<Alert variant="destructive">
								<AlertDescription>{createError}</AlertDescription>
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
				</DialogContent>
			</Dialog>

			<Dialog
				open={confirmDeleteUser !== null}
				onOpenChange={(open) => { if (!open) setConfirmDeleteUser(null); }}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete user</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete{" "}
							<span className="font-medium text-foreground">
								{confirmDeleteUser?.name}
							</span>
							? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-end gap-2 pt-2">
						<Button
							variant="outline"
							onClick={() => setConfirmDeleteUser(null)}
							disabled={deletingId !== null}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDelete}
							disabled={deletingId !== null}
						>
							{deletingId !== null && (
								<Loader2 className="animate-spin mr-2 h-4 w-4" />
							)}
							Delete
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
