import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/components/ui/button';

interface AppDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: ReactNode;
	children: ReactNode;
}

export function ModalDialog({ open, onOpenChange, title, description, children }: AppDialogProps) {
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
	confirmVariant?: VariantProps<typeof buttonVariants>['variant'];
	onConfirm: () => void;
	isPending?: boolean;
}

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = 'Confirm',
	confirmVariant = 'default',
	onConfirm,
	isPending = false,
}: ConfirmDialogProps) {
	return (
		<ModalDialog open={open} onOpenChange={onOpenChange} title={title} description={description}>
			<div className='flex justify-end gap-2 pt-2'>
				<Button variant='outline' onClick={() => onOpenChange(false)} disabled={isPending}>
					Cancel
				</Button>
				<Button variant={confirmVariant} onClick={onConfirm} disabled={isPending}>
					{isPending && <Loader2 className='animate-spin mr-2 h-4 w-4' />}
					{confirmLabel}
				</Button>
			</div>
		</ModalDialog>
	);
}
