
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';

async function checkSuperAdmin() {
    const session = await getSession();
    if (!session) return null;

    const result = await pool.query<{ role: string }>('SELECT role FROM users WHERE id = $1', [session.userId]);

    if (result.rows.length === 0 || result.rows[0].role !== 'superadmin') {
        return null;
    }

    return session;
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await checkSuperAdmin();
        if (!session) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const p = await params;
        const { id } = p;

        const result = await pool.query<{ id: string; email: string; role: string; created_at: string }>(
            'SELECT id, email, role, created_at FROM users WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Get User Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await checkSuperAdmin();
        if (!session) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const p = await params;
        const { id } = p;
        const body = await request.json();
        const { email, password, role } = body;

        // Build dynamic query
        const updates: string[] = [];
        const values: unknown[] = [];
        let idx = 1;

        if (email) {
            updates.push(`email = $${idx}`);
            values.push(email);
            idx++;
        }

        if (password) {
            updates.push(`password_hash = $${idx}`);
            values.push(bcrypt.hashSync(password, 10));
            idx++;
        }

        if (role && ['user', 'superadmin'].includes(role)) {
            updates.push(`role = $${idx}`);
            values.push(role);
            idx++;
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        values.push(id);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, email, role, created_at`;

        const result = await pool.query<{ id: string; email: string; role: string; created_at: string }>(query, values);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Update User Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await checkSuperAdmin();
        if (!session) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const p = await params;
        const { id } = p;

        // Prevent self-deletion
        if (id === session.userId) {
            return NextResponse.json({ error: 'Cannot delete your own account from admin panel' }, { status: 400 });
        }

        // Delete user's accounts first
        await pool.query('DELETE FROM accounts WHERE user_id = $1', [id]);

        // Delete user
        const result = await pool.query<{ id: string }>('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete User Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
