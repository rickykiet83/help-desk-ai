import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { CreateUserInput } from "@helpdesk/core";
import { createUserSchema } from "@helpdesk/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface CreateUserFormProps {
	onSubmit: (data: CreateUserInput) => Promise<void>;
	onCancel: () => void;
	error: string | null;
}

export function CreateUserForm({ onSubmit, onCancel, error }: CreateUserFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<CreateUserInput>({
		resolver: zodResolver(createUserSchema),
		defaultValues: { name: "", email: "", password: "" },
	});

	return (
		<form
			onSubmit={handleSubmit((data) => onSubmit(data).catch(() => {}))}
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
					<p className="text-xs text-destructive">{errors.email.message}</p>
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
					<p className="text-xs text-destructive">{errors.password.message}</p>
				)}
				<p className="text-xs text-muted-foreground">Minimum 6 characters.</p>
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<div className="flex justify-end gap-2 pt-2">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					disabled={isSubmitting}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
					{isSubmitting ? "Creating..." : "Create Agent"}
				</Button>
			</div>
		</form>
	);
}
