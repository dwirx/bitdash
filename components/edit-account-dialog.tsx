
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateAccount, Account } from '@/lib/api';
import { toast } from 'sonner';

interface EditAccountDialogProps {
    account: Account;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAccountUpdated: () => void;
}

export function EditAccountDialog({ account, open, onOpenChange, onAccountUpdated }: EditAccountDialogProps) {
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

    useEffect(() => {
        if (account && open) {
            setFormData({
                service_name: account.service_name || '',
                username: account.username || '',
                password: account.password || '',
                otp_secret: account.otp_secret || '',
                website: account.website || '',
                icon: account.icon || ''
            });
        }
    }, [account, open]);

    const handleAutoFill = async () => {
        if (!formData.website) return; // Don't error on blur, just skip
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
            await updateAccount(account.id, { ...formData, otp_secret: cleanSecret });
            toast.success('Account updated successfully');
            onOpenChange(false);
            onAccountUpdated();
        } catch (e) {
            toast.error('Failed to update account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-background border-zinc-200 dark:border-zinc-800">
                <DialogHeader>
                    <DialogTitle>Edit Account</DialogTitle>
                    <DialogDescription>
                        Update your credential details. Leave password/OTP empty to keep current values.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-website" className="text-right">
                            Website
                        </Label>
                        <div className="col-span-3 flex gap-2">
                            <Input
                                id="edit-website"
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
                        <Label htmlFor="edit-service" className="text-right">
                            Service
                        </Label>
                        <Input
                            id="edit-service"
                            value={formData.service_name}
                            onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                            placeholder="Google, Facebook..."
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-username" className="text-right">
                            Username
                        </Label>
                        <Input
                            id="edit-username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="email@example.com"
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-password" className="text-right">
                            Password
                        </Label>
                        <Input
                            id="edit-password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Leave empty to keep current"
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-secret" className="text-right">
                            OTP Secret
                        </Label>
                        <Input
                            id="edit-secret"
                            value={formData.otp_secret}
                            onChange={(e) => setFormData({ ...formData, otp_secret: e.target.value })}
                            placeholder="JBSWY3DPEHPK3PXP"
                            className="col-span-3 font-mono text-xs"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
