
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getSession, clearSession } from '@/lib/auth';

export async function DELETE(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json({ error: 'Password is required to delete account' }, { status: 400 });
        }

        // Verify password
        const result = await pool.query<{ password_hash: string }>('SELECT * FROM users WHERE id = $1', [session.userId]);
        const user = result.rows[0];

        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
            return NextResponse.json({ error: 'Incorrect password' }, { status: 400 });
        }

        // Delete user's accounts first (foreign key constraint)
        await pool.query('DELETE FROM accounts WHERE user_id = $1', [session.userId]);

        // Delete user
        await pool.query('DELETE FROM users WHERE id = $1', [session.userId]);

        // Clear session
        await clearSession();

        return NextResponse.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete Account Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
