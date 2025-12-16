
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { UserPlus, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [registrationEnabled, setRegistrationEnabled] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/settings', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => setRegistrationEnabled(data.registration_enabled !== false))
            .catch(() => setRegistrationEnabled(true));
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, confirmPassword }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Registration failed');

            toast.success('Account created successfully! Please login.');
            router.push('/login');
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (registrationEnabled === false) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
                <Card className="w-full max-w-sm z-10 border-zinc-200 dark:border-zinc-800 bg-card/80 backdrop-blur-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-fit">
                            <Lock className="h-8 w-8 text-zinc-500" />
                        </div>
                        <CardTitle className="text-2xl">Registration Closed</CardTitle>
                        <CardDescription>New user registration is currently disabled.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Link href="/login">
                            <Button className="w-full" variant="outline">
                                Back to Login
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (registrationEnabled === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            <Card className="w-full max-w-sm z-10 border-zinc-200 dark:border-zinc-800 bg-card/80 backdrop-blur-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl w-fit shadow-lg shadow-green-500/20">
                        <UserPlus className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Create Account</CardTitle>
                    <CardDescription>Register for a new OTP Vault account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Min 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Repeat password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" disabled={loading}>
                            {loading ? 'Creating account...' : 'Create Account'}
                        </Button>
                    </form>
                    <div className="mt-6 text-center">
                        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors">
                            <ArrowLeft className="h-3 w-3" />
                            Already have an account? Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
