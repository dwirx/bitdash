
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [registrationEnabled, setRegistrationEnabled] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/settings', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => setRegistrationEnabled(data.registration_enabled !== false))
            .catch(() => { });
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) throw new Error('Invalid credentials');

            router.push('/');
            toast.success('Welcome back!');
        } catch (err) {
            toast.error('Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            <Card className="w-full max-w-sm z-10 border-zinc-200 dark:border-zinc-800 bg-card/80 backdrop-blur-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-primary to-purple-600 rounded-xl w-fit shadow-lg shadow-primary/20">
                        <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">OTP Vault Login</CardTitle>
                    <CardDescription>Enter your credentials to access your secure vault.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Logging in...' : 'Sign in'}
                        </Button>
                    </form>
                    {registrationEnabled && (
                        <div className="mt-6 text-center">
                            <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors">
                                Don&apos;t have an account? Create one
                                <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
