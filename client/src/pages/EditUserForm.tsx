import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { UpdateUserInput } from "@helpdesk/core";
import { updateUserSchema } from "@helpdesk/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface EditUserFormProps {
	defaultName: string;
	onSubmit: (data: UpdateUserInput) => Promise<void>;
	onCancel: () => void;
	error: string | null;
}

export function EditUserForm({ defaultName, onSubmit, onCancel, error }: EditUserFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<UpdateUserInput>({
		resolver: zodResolver(updateUserSchema),
		defaultValues: { name: defaultName },
	});

	return (
		<form
			onSubmit={handleSubmit((data) => onSubmit(data).catch(() => {}))}
			className="space-y-4 mt-2"
		>
			<div className="space-y-1">
				<Label htmlFor="edit-name">Name</Label>
				<Input
					id="edit-name"
					{...register("name")}
					aria-invalid={!!errors.name}
				/>
				{errors.name && (
					<p className="text-xs text-destructive">{errors.name.message}</p>
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
					{isSubmitting ? "Saving..." : "Save"}
				</Button>
			</div>
		</form>
	);
}
