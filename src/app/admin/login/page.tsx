'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, ShieldCheck } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const ADMIN_EMAIL = 'csupun205@gmail.com';

export default function AdminLoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!isUserLoading && user && user.email === ADMIN_EMAIL) {
      router.replace('/admin');
    }
  }, [user, isUserLoading, router]);

  async function onSubmit(values: LoginFormValues) {
    if (values.email !== ADMIN_EMAIL) {
        toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: 'This email address is not authorized for admin access.',
        });
        return;
    }

    setIsSubmitting(true);
    try {
      // First, try to sign in.
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: 'Login Successful',
        description: 'Redirecting to the admin dashboard...',
      });
      router.push('/admin');
    } catch (error: any) {
      // If sign-in fails, check if it's an invalid credential error.
      // This could mean the user doesn't exist or the password is wrong.
      if (error.code === 'auth/invalid-credential') {
        try {
          // As a fallback for the first-time setup, try to create the admin user.
          await createUserWithEmailAndPassword(auth, values.email, values.password);
          toast({
            title: 'Admin Account Created',
            description: 'First-time setup complete. Logging you in...',
          });
          // Successful creation also signs the user in, so we can redirect.
          router.push('/admin');
        } catch (creationError: any) {
          // This will catch if createUser fails (e.g., password too weak)
          // or if the user *does* exist but the password was wrong in the first attempt.
          console.error('Admin login/creation error:', creationError);
          toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Invalid credentials. Please check your email and password.',
          });
        }
      } else {
        // Handle other unexpected auth errors
        console.error('Admin login error:', error);
        toast({
          variant: 'destructive',
          title: 'An Error Occurred',
          description: error.message || 'Could not sign in. Please try again later.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isUserLoading || (user && user.email === ADMIN_EMAIL)) {
     return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-secondary">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-secondary">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2">
            <ShieldCheck className="text-primary" />
            Admin Panel
          </CardTitle>
          <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@example.com" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting} className="w-full font-headline">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
