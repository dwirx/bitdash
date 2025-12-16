'use client';

import { useState, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Eye, EyeOff, Trash2, Edit, Copy, ExternalLink } from 'lucide-react';
import { OtpDisplay } from './otp-display';
import { Account, deleteAccount } from '@/lib/api';
import { toast } from 'sonner';
import { EditAccountDialog } from './edit-account-dialog';

interface OtpCardProps {
    account: Account;
    onRefresh: () => void;
}

export const OtpCard = memo(function OtpCard({ account, onRefresh }: OtpCardProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this account?')) return;
        setIsDeleting(true);
        try {
            await deleteAccount(account.id);
            toast.success('Account deleted');
            onRefresh();
        } catch (e) {
            toast.error('Failed to delete');
        } finally {
            setIsDeleting(false);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied`);
    };

    return (
        <>
            <Card className="w-full bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden relative group ring-0 hover:ring-1 hover:ring-purple-500/30 transition-all duration-300">
                {/* Hover Actions (Edit/Delete) - Absolute Top Right */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-white/10" onClick={() => setEditDialogOpen(true)}>
                        <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-red-400 hover:bg-red-500/10" onClick={handleDelete} disabled={isDeleting}>
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>

                <div className="p-5 flex flex-col gap-4">
                    {/* Header Section: Icon + Name */}
                    <div className="flex items-start gap-4">
                        {/* Service Icon */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg text-white font-bold text-lg overflow-hidden">
                            {account.icon ? (
                                <img
                                    src={account.icon}
                                    alt={account.service_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                account.service_name.charAt(0).toUpperCase()
                            )}
                        </div>

                        {/* Name & Email */}
                        <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-white truncate leading-tight">
                                    {account.service_name}
                                </h3>
                                {account.website && (
                                    <a
                                        href={account.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-zinc-500 hover:text-purple-400 transition-colors"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                            <div
                                className="flex items-center gap-1.5 cursor-pointer group/email"
                                onClick={() => copyToClipboard(account.username, 'Username')}
                            >
                                <p className="text-xs text-zinc-500 font-medium truncate group-hover/email:text-zinc-300 transition-colors">
                                    {account.username}
                                </p>
                                <Copy className="h-2.5 w-2.5 text-zinc-600 group-hover/email:text-zinc-300 opacity-0 group-hover/email:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </div>

                    {/* OTP Display Section */}
                    <div className="mt-[-5px]"> {/* Slight negative margin to pull code up closer if needed */}
                        {account.otp_secret && <OtpDisplay secret={account.otp_secret} />}
                    </div>
                </div>

                {/* Password Section (Hidden by default or subtle footer) - Let's keep it very subtle */}
                {account.password && (
                    <div className="px-5 pb-4">
                        <div className="flex items-center justify-between bg-zinc-950/50 rounded-lg p-2 border border-zinc-800/50 group/pass">
                            <div className="text-xs font-mono text-zinc-600 group-hover/pass:text-zinc-400 transition-colors truncate mr-2 select-all">
                                {showPassword ? account.password : '••••••••••••'}
                            </div>
                            <div className="flex gap-1 opacity-50 group-hover/pass:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-5 w-5 hover:text-white" onClick={() => copyToClipboard(account.password!, 'Password')}>
                                    <Copy className="h-2.5 w-2.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-5 w-5 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff className="h-2.5 w-2.5" /> : <Eye className="h-2.5 w-2.5" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Card>
            <EditAccountDialog
                account={account}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onAccountUpdated={onRefresh}
            />
        </>
    );
}, (prev: Readonly<OtpCardProps>, next: Readonly<OtpCardProps>) => {
    // Custom comparison for memo
    return prev.account.id === next.account.id &&
        prev.account.service_name === next.account.service_name &&
        prev.account.username === next.account.username &&
        prev.account.password === next.account.password &&
        prev.account.otp_secret === next.account.otp_secret;
});
