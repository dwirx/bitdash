
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Settings, Key, Trash2, ArrowLeft, Shield, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface User {
    id: string;
    email: string;
    role: string;
    created_at: string;
}

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Change Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    // Delete Account State
    const [deletePassword, setDeletePassword] = useState('');
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (!res.ok) throw new Error('Failed to fetch user');
            const data = await res.json();
            setUser(data);
        } catch (err) {
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setChangingPassword(true);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to change password');

            toast.success('Password changed successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to change password');
        } finally {
            setChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            toast.error('Password is required');
            return;
        }

        setDeletingAccount(true);
        try {
            const res = await fetch('/api/auth/delete-account', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: deletePassword }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete account');

            toast.success('Account deleted successfully');
            router.push('/login');
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete account');
        } finally {
            setDeletingAccount(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 lg:p-12 relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-2xl mx-auto space-y-8 relative z-10">
                <header className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="shrink-0">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-primary to-purple-600 rounded-lg shadow-lg shadow-primary/20">
                            <Settings className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>
                </header>

                {/* Profile Info */}
                <Card className="border-zinc-200 dark:border-zinc-800 bg-card/80 backdrop-blur-md">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <CardTitle>Profile</CardTitle>
                        </div>
                        <CardDescription>Your account information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-muted-foreground text-xs">Email</Label>
                                <p className="font-mono text-sm">{user?.email}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-xs">Role</Label>
                                <p className="text-sm capitalize">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user?.role === 'superadmin'
                                            ? 'bg-purple-500/10 text-purple-500'
                                            : 'bg-blue-500/10 text-blue-500'
                                        }`}>
                                        {user?.role}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Change Password */}
                <Card className="border-zinc-200 dark:border-zinc-800 bg-card/80 backdrop-blur-md">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Key className="h-5 w-5 text-primary" />
                            <CardTitle>Change Password</CardTitle>
                        </div>
                        <CardDescription>Update your account password</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        placeholder="Min 6 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                                    <Input
                                        id="confirmNewPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" disabled={changingPassword}>
                                {changingPassword ? 'Changing...' : 'Change Password'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-red-500/30 bg-card/80 backdrop-blur-md">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <CardTitle className="text-red-500">Danger Zone</CardTitle>
                        </div>
                        <CardDescription>Irreversible and destructive actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="destructive" className="gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    Delete Account
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-red-500">Delete Account</DialogTitle>
                                    <DialogDescription>
                                        This action cannot be undone. This will permanently delete your account and all your stored credentials.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="deletePassword">Enter your password to confirm</Label>
                                        <Input
                                            id="deletePassword"
                                            type="password"
                                            value={deletePassword}
                                            onChange={(e) => setDeletePassword(e.target.value)}
                                            placeholder="Your current password"
                                        />
                                    </div>
                                </div>
                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteAccount}
                                        disabled={deletingAccount || !deletePassword}
                                    >
                                        {deletingAccount ? 'Deleting...' : 'Delete My Account'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
