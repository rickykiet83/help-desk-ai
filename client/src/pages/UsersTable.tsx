import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type User = {
	id: string;
	name: string;
	email: string;
	role: string;
	createdAt: string;
};

type Props = {
	users: User[];
	isLoading: boolean;
	fetchError: string | null;
	deletingId: string | null;
	onDeleteClick: (user: User) => void;
	onEditClick: (user: User) => void;
};

export function UsersTable({
	users,
	isLoading,
	fetchError,
	deletingId,
	onDeleteClick,
	onEditClick,
}: Props) {
	if (isLoading) return <LoadingSkeleton />;

	if (fetchError) {
		return (
			<Alert variant="destructive">
				<AlertDescription>{fetchError}</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="rounded-xl border overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Role</TableHead>
						<TableHead>Joined</TableHead>
						<TableHead>Action</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={5}
								className="py-8 text-center text-muted-foreground"
							>
								No users found.
							</TableCell>
						</TableRow>
					) : (
						users.map((user) => (
							<TableRow key={user.id}>
								<TableCell className="font-medium">{user.name}</TableCell>
								<TableCell className="text-muted-foreground">
									{user.email}
								</TableCell>
								<TableCell>
									<span
										className={cn(
											"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
											user.role === "admin"
												? "bg-purple-100 text-purple-700"
												: "bg-blue-100 text-blue-700",
										)}
									>
										{user.role}
									</span>
								</TableCell>
								<TableCell className="text-muted-foreground">
									{new Intl.DateTimeFormat("en-US", {
										dateStyle: "medium",
									}).format(new Date(user.createdAt))}
								</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end gap-1">
										<Button
											variant="ghost"
											size="icon-sm"
											title="Edit user"
											onClick={() => onEditClick(user)}
										>
											<Pencil className="h-4 w-4" />
										</Button>
										<Button
											variant="destructive"
											size="icon-sm"
											disabled={user.role === "admin" || deletingId !== null}
											title={
												user.role === "admin"
													? "Cannot delete an admin"
													: "Delete user"
											}
											onClick={() => onDeleteClick(user)}
										>
											{deletingId === user.id ? (
												<Loader2 className="animate-spin h-4 w-4" />
											) : (
												<Trash2 className="h-4 w-4" />
											)}
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
}

function Bone({ className }: { className?: string }) {
	return <div className={cn("rounded bg-gray-200 animate-pulse", className)} />;
}

function LoadingSkeleton() {
	return (
		<div className="rounded-xl border overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead><Bone className="h-4 w-10" /></TableHead>
						<TableHead><Bone className="h-4 w-12" /></TableHead>
						<TableHead><Bone className="h-4 w-8" /></TableHead>
						<TableHead><Bone className="h-4 w-14" /></TableHead>
						<TableHead />
					</TableRow>
				</TableHeader>
				<TableBody>
					{[1, 2, 3, 4, 5].map((i) => (
						<TableRow key={i}>
							<TableCell><Bone className="h-4 w-32" /></TableCell>
							<TableCell><Bone className="h-4 w-48" /></TableCell>
							<TableCell><Bone className="h-5 w-14 rounded-full" /></TableCell>
							<TableCell><Bone className="h-4 w-24" /></TableCell>
							<TableCell className="text-right">
								<div className="flex justify-end gap-1">
									<Bone className="h-7 w-7 rounded-md" />
									<Bone className="h-7 w-7 rounded-md" />
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
