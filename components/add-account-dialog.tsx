
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createAccount } from '@/lib/api';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export function AddAccountDialog({ onAccountAdded }: { onAccountAdded: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingMeta, setLoadingMeta] = useState(false);

    const [formData, setFormData] = useState({
        service_name: '',
        username: '',
        password: '',
        otp_secret: '',
        website: '',
        icon: ''
    });

    const handleAutoFill = async () => {
        if (!formData.website) return toast.error('Please enter a website URL');
        setLoadingMeta(true);
        try {
            const res = await fetch(`/api/metadata?url=${encodeURIComponent(formData.website)}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setFormData(prev => ({
                ...prev,
                service_name: data.title || prev.service_name,
                icon: data.icon || prev.icon
            }));
            toast.success('Metadata fetched!');
        } catch (e) {
            toast.error('Failed to fetch metadata');
        } finally {
            setLoadingMeta(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Clean secret key (remove spaces)
            const cleanSecret = formData.otp_secret.replace(/\s/g, '');
            await createAccount({ ...formData, otp_secret: cleanSecret });
            toast.success('Account added successfully');
            setFormData({ service_name: '', username: '', password: '', otp_secret: '', website: '', icon: '' });
            setOpen(false);
            onAccountAdded();
        } catch (e) {
            toast.error('Failed to add account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 shadow-lg shadow-indigo-500/20 font-medium">
                    <Plus className="h-4 w-4" /> New
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-background border-zinc-200 dark:border-zinc-800">
                <DialogHeader>
                    <DialogTitle>Add New Account</DialogTitle>
                    <DialogDescription>
                        Store your credentials securely. OTP secrets are encrypted.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="website" className="text-right">
                            Website
                        </Label>
                        <div className="col-span-3 flex gap-2">
                            <Input
                                id="website"
                                value={formData.website || ''}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                onBlur={handleAutoFill}
                                placeholder="https://example.com"
                                className="flex-1"
                            />
                            <Button type="button" variant="secondary" onClick={handleAutoFill} disabled={loadingMeta} className="text-xs">
                                {loadingMeta ? 'Loading...' : 'Auto-fill'}
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="service" className="text-right">
                            Service
                        </Label>
                        <div className="col-span-3 relative">
                            <Input
                                id="service"
                                value={formData.service_name}
                                onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                                placeholder="Google, Facebook..."
                                className={formData.icon ? "pl-10" : ""}
                                required
                            />
                            {formData.icon && (
                                <img
                                    src={formData.icon}
                                    alt="icon"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full object-cover bg-white"
                                />
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                            Username
                        </Label>
                        <Input
                            id="username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="email@example.com"
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="secret" className="text-right">
                            OTP Secret
                        </Label>
                        <Input
                            id="secret"
                            value={formData.otp_secret}
                            onChange={(e) => setFormData({ ...formData, otp_secret: e.target.value })}
                            placeholder="JBSWY3DPEHPK3PXP"
                            className="col-span-3 font-mono text-xs"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Account'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
