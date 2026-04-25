import type { CreateUserInput } from "@helpdesk/core";
import { createUserSchema } from "@helpdesk/core";
import { UserForm } from "./UserForm";

interface CreateUserFormProps {
	onSubmit: (data: CreateUserInput) => Promise<void>;
	onCancel: () => void;
	error: string | null;
}

export function CreateUserForm({ onSubmit, onCancel, error }: CreateUserFormProps) {
	return (
		<UserForm
			schema={createUserSchema}
			defaultValues={{ name: "", email: "", password: "" }}
			showEmail
			submitLabel="Create Agent"
			submittingLabel="Creating..."
			onSubmit={onSubmit}
			onCancel={onCancel}
			error={error}
		/>
	);
}
