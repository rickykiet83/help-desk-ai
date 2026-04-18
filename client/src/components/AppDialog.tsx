import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { VariantProps } from "class-variance-authority";

interface AppDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: ReactNode;
	children: ReactNode;
}

export function AppDialog({
	open,
	onOpenChange,
	title,
	description,
	children,
}: AppDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				{children}
			</DialogContent>
		</Dialog>
	);
}

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: ReactNode;
	confirmLabel?: string;
	confirmVariant?: VariantProps<typeof buttonVariants>["variant"];
	onConfirm: () => void;
	isPending?: boolean;
}

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = "Confirm",
	confirmVariant = "default",
	onConfirm,
	isPending = false,
}: ConfirmDialogProps) {
	return (
		<AppDialog
			open={open}
			onOpenChange={onOpenChange}
			title={title}
			description={description}
		>
			<div className="flex justify-end gap-2 pt-2">
				<Button
					variant="outline"
					onClick={() => onOpenChange(false)}
					disabled={isPending}
				>
					Cancel
				</Button>
				<Button
					variant={confirmVariant}
					onClick={onConfirm}
					disabled={isPending}
				>
					{isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
					{confirmLabel}
				</Button>
			</div>
		</AppDialog>
	);
}
