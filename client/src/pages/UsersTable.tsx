import { Loader2, Trash2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
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
};

export function UsersTable({
	users,
	isLoading,
	fetchError,
	deletingId,
	onDeleteClick,
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
						<TableHead />
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
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
}

function LoadingSkeleton() {
	return (
		<div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
			<div className="bg-gray-50 border-b border-gray-200 px-4 py-3 h-10" />
			{[1, 2, 3].map((i) => (
				<div
					key={i}
					className="flex gap-4 px-4 py-3 border-b border-gray-100 last:border-0"
				>
					<div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
					<div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
					<div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
					<div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
				</div>
			))}
		</div>
	);
}
