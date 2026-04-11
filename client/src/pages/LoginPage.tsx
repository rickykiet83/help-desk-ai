import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigate, useNavigate } from 'react-router-dom';
import { signIn, useSession } from '../lib/auth-client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
	email: z.email('Enter a valid email address'),
	password: z.string().min(5, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
	const [serverError, setServerError] = useState('');
	const navigate = useNavigate();
	const { data: session, isPending } = useSession();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: '', password: '' },
	});

	if (isPending) {
		return (
			<div className='flex items-center justify-center h-screen text-muted-foreground'>
				<Loader2 className='animate-spin mr-2 h-5 w-5' />
				Loading...
			</div>
		);
	}

	if (session) {
		return <Navigate to='/' replace />;
	}

	async function onSubmit(data: LoginFormData) {
		setServerError('');
		const { error } = await signIn.email(data);
		if (error) {
			setServerError(error.message ?? 'Invalid email or password.');
		} else {
			navigate('/');
		}
	}

	return (
		<div className='flex min-h-screen items-center justify-center bg-muted/40'>
			<Card className='w-full max-w-sm'>
				<CardHeader>
					<CardTitle className='text-2xl'>Sign in</CardTitle>
					<CardDescription>Helpdesk — AI-powered ticket management</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
						<div className='space-y-1'>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								type='email'
								{...register('email')}
								className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
							/>
							{errors.email && <p className='text-xs text-destructive'>{errors.email.message}</p>}
						</div>

						<div className='space-y-1'>
							<Label htmlFor='password'>Password</Label>
							<Input
								id='password'
								type='password'
								{...register('password')}
								className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
							/>
							{errors.password && <p className='text-xs text-destructive'>{errors.password.message}</p>}
						</div>

						{serverError && (
							<Alert variant='destructive'>
								<AlertDescription>{serverError}</AlertDescription>
							</Alert>
						)}

						<Button type='submit' disabled={isSubmitting} className='w-full'>
							{isSubmitting && <Loader2 className='animate-spin' />}
							{isSubmitting ? 'Signing in…' : 'Sign in'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
