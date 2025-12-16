
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.ENCRYPTION_KEY;
if (!SECRET_KEY) {
    throw new Error('ENCRYPTION_KEY is not defined');
}
const key = new TextEncoder().encode(SECRET_KEY);

export type SessionPayload = JWTPayload & {
    userId: string;
    role: string;
    expiresAt: number;
};

export async function signSession(payload: SessionPayload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, key);
        return payload as SessionPayload;
    } catch {
        return null;
    }
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return null;
    return await verifySession(session);
}

export async function setSession(user: { id: string; role: string }) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await signSession({ userId: user.id, role: user.role, expiresAt: expires.getTime() });
    const cookieStore = await cookies();

    cookieStore.set('session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires,
        sameSite: 'lax',
        path: '/',
    });
}

export async function clearSession() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
}
