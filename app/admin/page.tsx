
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Users, Plus, Edit, Trash2, ArrowLeft, Shield, Crown, User, Settings as SettingsIcon } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface UserData {
    id: string;
    email: string;
    role: string;
    created_at: string;
}

export default function AdminPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [registrationEnabled, setRegistrationEnabled] = useState(true);

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [formData, setFormData] = useState({ email: '', password: '', role: 'user' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        checkAdminAndFetch();
    }, []);

    const checkAdminAndFetch = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (!res.ok) {
                router.push('/login');
                return;
            }
            const user = await res.json();
            if (user.role !== 'superadmin') {
                toast.error('Access denied');
                router.push('/');
                return;
            }
            setCurrentUser(user);
            await Promise.all([fetchUsers(), fetchSettings()]);
        } catch (err) {
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setRegistrationEnabled(data.registration_enabled !== false);
            }
        } catch (e) {
            console.error('Failed to fetch settings');
        }
    };

    const toggleRegistration = async (enabled: boolean) => {
        setRegistrationEnabled(enabled);
        try {
            await fetch('/api/settings', {
                method: 'POST',
                body: JSON.stringify({ registration_enabled: enabled }),
            });
            toast.success(`Registration ${enabled ? 'enabled' : 'disabled'}`);
        } catch {
            toast.error('Failed to update settings');
            setRegistrationEnabled(!enabled); // Revert
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            toast.error('Failed to load users');
        }
    };

    const handleOpenCreate = () => {
        setEditingUser(null);
        setFormData({ email: '', password: '', role: 'user' });
        setDialogOpen(true);
    };

    const handleOpenEdit = (user: UserData) => {
        setEditingUser(user);
        setFormData({ email: user.email, password: '', role: user.role });
        setDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingUser) {
                // Update user
                const updateData: { email: string; role: string; password?: string } = { email: formData.email, role: formData.role };
                if (formData.password) updateData.password = formData.password;

                const res = await fetch(`/api/users/${editingUser.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to update user');
                }

                toast.success('User updated successfully');
            } else {
                // Create user
                const res = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to create user');
                }

                toast.success('User created successfully');
            }

            setDialogOpen(false);
            await fetchUsers();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to save user');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (user: UserData) => {
        if (user.id === currentUser?.id) {
            toast.error('Cannot delete your own account from here');
            return;
        }

        if (!confirm(`Are you sure you want to delete ${user.email}? This action cannot be undone.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/users/${user.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete user');
            }

            toast.success('User deleted successfully');
            await fetchUsers();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete user');
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
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="shrink-0">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg shadow-lg shadow-yellow-500/20">
                                <Crown className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
                                <p className="text-sm text-muted-foreground">Manage all users</p>
                            </div>
                        </div>
                    </div>
                    <Button onClick={handleOpenCreate} className="gap-2 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 shadow-lg shadow-yellow-500/20">
                        <Plus className="h-4 w-4" />
                        Add User
                    </Button>
                </header>

                <Card className="border-zinc-200 dark:border-zinc-800 bg-card/80 backdrop-blur-md">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <SettingsIcon className="h-5 w-5 text-primary" />
                            <CardTitle>Global Settings</CardTitle>
                        </div>
                        <CardDescription>Configure application-wide settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-5 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                            <div className="space-y-0.5">
                                <Label className="text-base">User Registration</Label>
                                <p className="text-sm text-muted-foreground">
                                    Allow new users to sign up for an account
                                </p>
                            </div>
                            <Switch
                                checked={registrationEnabled}
                                onCheckedChange={toggleRegistration}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200 dark:border-zinc-800 bg-card/80 backdrop-blur-md">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            <CardTitle>Users ({users.length})</CardTitle>
                        </div>
                        <CardDescription>Manage user accounts and roles</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${user.role === 'superadmin'
                                            ? 'bg-yellow-500/10 text-yellow-500'
                                            : 'bg-blue-500/10 text-blue-500'
                                            }`}>
                                            {user.role === 'superadmin' ? <Crown className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                        </div>
                                        <div>
                                            <p className="font-medium">{user.email}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span className={`px-2 py-0.5 rounded-full ${user.role === 'superadmin'
                                                    ? 'bg-yellow-500/10 text-yellow-500'
                                                    : 'bg-blue-500/10 text-blue-500'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                                <span>•</span>
                                                <span>{new Date(user.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleOpenEdit(user)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                            onClick={() => handleDelete(user)}
                                            disabled={user.id === currentUser?.id}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {users.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No users found
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Create/Edit User Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingUser ? 'Edit User' : 'Create User'}</DialogTitle>
                            <DialogDescription>
                                {editingUser ? 'Update user details' : 'Add a new user account'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="userEmail">Email</Label>
                                    <Input
                                        id="userEmail"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="user@example.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="userPassword">
                                        {editingUser ? 'New Password (leave empty to keep current)' : 'Password'}
                                    </Label>
                                    <Input
                                        id="userPassword"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder={editingUser ? 'Leave empty to keep current' : 'Min 6 characters'}
                                        required={!editingUser}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="userRole">Role</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(value) => setFormData({ ...formData, role: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="superadmin">Superadmin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={saving}>
                                    {saving ? 'Saving...' : editingUser ? 'Update' : 'Create'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
