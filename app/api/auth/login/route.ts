
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { setSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        const result = await pool.query<{ id: string; email: string; role: string; password_hash: string }>(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        const user = result.rows[0];

        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        await setSession({ id: user.id, role: user.role });
        return NextResponse.json({ success: true, user: { email: user.email } });
    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
