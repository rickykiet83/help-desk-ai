import type { UpdateUserInput } from "@helpdesk/core";
import { updateUserSchema } from "@helpdesk/core";
import { UserForm } from "./UserForm";

interface EditUserFormProps {
	defaultName: string;
	onSubmit: (data: UpdateUserInput) => Promise<void>;
	onCancel: () => void;
	error: string | null;
}

export function EditUserForm({ defaultName, onSubmit, onCancel, error }: EditUserFormProps) {
	return (
		<UserForm
			schema={updateUserSchema}
			defaultValues={{ name: defaultName, password: "" }}
			passwordHint="Leave blank to keep current password"
			submitLabel="Save"
			submittingLabel="Saving..."
			onSubmit={onSubmit}
			onCancel={onCancel}
			error={error}
		/>
	);
}
