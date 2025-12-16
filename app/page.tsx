
'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { fetchAccounts, type Account } from '@/lib/api';
import { OtpCard } from '@/components/otp-card';
import { AddAccountDialog } from '@/components/add-account-dialog';
import { ShieldCheck, LogOut, Settings, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  role: string;
}

export default function Home() {
  const { data: accounts, error, mutate } = useSWR<Account[]>('accounts', fetchAccounts, { refreshInterval: 5000 });
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setUser(data);
      })
      .catch(() => { });
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 p-4 md:p-8 lg:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-purple-600 rounded-lg shadow-lg shadow-primary/20">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                OTP Vault
              </h1>
              <p className="text-zinc-500 text-sm">Secure Encrypted Storage</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AddAccountDialog onAccountAdded={() => mutate()} />
            {user?.role === 'superadmin' && (
              <Link href="/admin">
                <Button variant="outline" size="icon" className="text-yellow-500 hover:text-yellow-600 hover:border-yellow-500/50">
                  <Crown className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link href="/settings">
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="icon" onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/login';
            }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* User Info Badge */}
        {user && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Logged in as</span>
            <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{user.email}</span>
            {user.role === 'superadmin' && (
              <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full">Superadmin</span>
            )}
          </div>
        )}

        {error && (
          <div className="p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-lg">
            Failed to load accounts. Check your database connection.
          </div>
        )}

        {!accounts && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-xl bg-zinc-800/50 animate-pulse" />
            ))}
          </div>
        )}

        {accounts && accounts.length === 0 && (
          <div className="text-center py-20 text-zinc-500 bg-zinc-900/50 rounded-xl border border-dashed border-zinc-800">
            <h3 className="text-lg font-medium text-zinc-300">No accounts yet</h3>
            <p className="mb-4">Add your first service to start generating OTPs.</p>
          </div>
        )}

        {accounts && accounts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {accounts.map((account) => (
              <OtpCard key={account.id} account={account} onRefresh={() => mutate()} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
