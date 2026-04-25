import { Alert, AlertDescription } from "@/components/ui/alert";
import type { DefaultValues, FieldValues, Resolver } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Both create and edit schemas have name + optional password + optional email.
type UserFormValues = {
	name: string;
	password?: string;
	email?: string;
};

interface UserFormProps<T extends UserFormValues & FieldValues> {
	// Typed as what zodResolver actually accepts — T is inferred from onSubmit/defaultValues.
	schema: Parameters<typeof zodResolver>[0];
	defaultValues: DefaultValues<T>;
	/** Render the email field (create flow only) */
	showEmail?: boolean;
	/** Placeholder shown below the password field */
	passwordHint?: string;
	submitLabel: string;
	submittingLabel: string;
	onSubmit: (data: T) => Promise<void>;
	onCancel: () => void;
	error: string | null;
}

export function UserForm<T extends UserFormValues & FieldValues>({
	schema,
	defaultValues,
	showEmail,
	passwordHint,
	submitLabel,
	submittingLabel,
	onSubmit,
	onCancel,
	error,
}: UserFormProps<T>) {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<T>({
		resolver: zodResolver(schema) as Resolver<T>,
		defaultValues,
	});

	return (
		<form
			onSubmit={handleSubmit((data) => onSubmit(data as unknown as T).catch(() => {}))}
			className="space-y-4 mt-2"
		>
			<div className="space-y-1">
				<Label htmlFor="uf-name">Name</Label>
				<Input
					id="uf-name"
					{...register("name" as Parameters<typeof register>[0])}
					aria-invalid={!!errors["name"]}
				/>
				{errors["name"] && (
					<p className="text-xs text-destructive">{errors["name"].message as string}</p>
				)}
			</div>

			{showEmail && (
				<div className="space-y-1">
					<Label htmlFor="uf-email">Email</Label>
					<Input
						id="uf-email"
						type="email"
						{...register("email" as Parameters<typeof register>[0])}
						aria-invalid={!!errors["email"]}
					/>
					{errors["email"] && (
						<p className="text-xs text-destructive">{errors["email"].message as string}</p>
					)}
				</div>
			)}

			<div className="space-y-1">
				<Label htmlFor="uf-password">{showEmail ? "Password" : "New Password"}</Label>
				<Input
					id="uf-password"
					type="password"
					{...(passwordHint ? { placeholder: passwordHint } : {})}
					{...register("password" as Parameters<typeof register>[0])}
					aria-invalid={!!errors["password"]}
				/>
				{errors["password"] && (
					<p className="text-xs text-destructive">{errors["password"].message as string}</p>
				)}
				{showEmail && (
					<p className="text-xs text-muted-foreground">Minimum 6 characters.</p>
				)}
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
					{isSubmitting ? submittingLabel : submitLabel}
				</Button>
			</div>
		</form>
	);
}
