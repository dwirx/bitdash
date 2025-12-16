
export interface Account {
    id: string;
    user_id?: string;
    service_name: string;
    username: string;
    password?: string;
    otp_secret?: string;
    created_at?: string;
    updated_at?: string;
    website?: string;
    icon?: string;
}

export async function fetchAccounts() {
    const res = await fetch('/api/accounts');
    if (!res.ok) {
        throw new Error('Failed to fetch accounts');
    }
    return res.json();
}

export async function createAccount(account: Omit<Account, 'id' | 'created_at' | 'updated_at'>) {
    const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(account),
    });
    if (!res.ok) {
        throw new Error('Failed to create account');
    }
    return res.json();
}

export async function deleteAccount(id: string) {
    const res = await fetch(`/api/accounts/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) {
        throw new Error('Failed to delete account');
    }
    return res.json();
}

export async function updateAccount(id: string, updates: Partial<Account>) {
    const res = await fetch(`/api/accounts/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
    });
    if (!res.ok) {
        throw new Error('Failed to update account');
    }
    return res.json();
}
