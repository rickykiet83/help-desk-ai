import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Pencil, RotateCcw, Trash2 } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Role } from "@helpdesk/core";
import { cn } from "@/lib/utils";

export type User = {
	id: string;
	name: string;
	email: string;
	role: string;
	createdAt: string;
	deletedAt: string | null;
};

type Props = {
	users: User[];
	isLoading: boolean;
	fetchError: string | null;
	deletingId: string | null;
	restoringId: string | null;
	onDeleteClick: (user: User) => void;
	onEditClick: (user: User) => void;
	onRestoreClick: (user: User) => void;
};

export function UsersTable({
	users,
	isLoading,
	fetchError,
	deletingId,
	restoringId,
	onDeleteClick,
	onEditClick,
	onRestoreClick,
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
						<TableHead>Status</TableHead>
						<TableHead>Joined</TableHead>
						<TableHead>Action</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={6}
								className="py-8 text-center text-muted-foreground"
							>
								No users found.
							</TableCell>
						</TableRow>
					) : (
						users.map((user) => {
							const isDeleted = !!user.deletedAt;
							return (
								<TableRow key={user.id} className={cn(isDeleted && 'opacity-50')}>
									<TableCell className='font-medium'>{user.name}</TableCell>
									<TableCell className='text-muted-foreground'>{user.email}</TableCell>
									<TableCell>
										<span
											className={cn(
												'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
												user.role === Role.admin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700',
											)}
										>
											{user.role}
										</span>
									</TableCell>
									<TableCell>
										{isDeleted ? (
											<span className='inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700'>
												Deleted
											</span>
										) : (
											<span className='inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700'>
												Active
											</span>
										)}
									</TableCell>
									<TableCell className='text-muted-foreground'>
										{new Intl.DateTimeFormat('en-US', {
											dateStyle: 'medium',
										}).format(new Date(user.createdAt))}
									</TableCell>
									<TableCell className='text-right'>
										<div className='flex justify-end gap-1'>
											{isDeleted ? (
												<Button
													variant='outline'
													size='icon-sm'
													title='Restore user'
													disabled={restoringId !== null}
													onClick={() => onRestoreClick(user)}
												>
													{restoringId === user.id ? (
														<Loader2 className='animate-spin h-4 w-4' />
													) : (
														<RotateCcw className='h-4 w-4' />
													)}
												</Button>
											) : (
												<>
													<Button variant='ghost' size='icon-sm' title='Edit user' onClick={() => onEditClick(user)}>
														<Pencil className='h-4 w-4' />
													</Button>
													<Button
														variant='destructive'
														size='icon-sm'
														disabled={user.role === Role.admin || deletingId !== null}
														title={user.role === Role.admin ? 'Cannot delete an admin' : 'Delete user'}
														onClick={() => onDeleteClick(user)}
													>
														{deletingId === user.id ? (
															<Loader2 className='animate-spin h-4 w-4' />
														) : (
															<Trash2 className='h-4 w-4' />
														)}
													</Button>
												</>
											)}
										</div>
									</TableCell>
								</TableRow>
							);
						})
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
