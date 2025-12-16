
import { NextResponse } from 'next/server';
import { parse } from 'node-html-parser';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function isPrivateHostname(hostname: string) {
    const h = hostname.toLowerCase();
    if (h === 'localhost' || h === '0.0.0.0' || h === '::1') return true;
    if (h.startsWith('127.')) return true;
    if (h.startsWith('10.')) return true;
    if (h.startsWith('192.168.')) return true;
    const m = h.match(/^172\.(\d+)\./);
    if (m) {
        const second = Number(m[1]);
        if (second >= 16 && second <= 31) return true;
    }
    return false;
}

export async function GET(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        // Ensure protocol
        const targetUrl = url.startsWith('http') ? url : `https://${url}`;
        const parsed = new URL(targetUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return NextResponse.json({ error: 'Invalid URL protocol' }, { status: 400 });
        }
        if (isPrivateHostname(parsed.hostname)) {
            return NextResponse.json({ error: 'Blocked hostname' }, { status: 400 });
        }

        const response = await fetch(targetUrl);
        const html = await response.text();
        const root = parse(html);

        const title = root.querySelector('title')?.text || '';

        const icon = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`;

        return NextResponse.json({ title, icon });
    } catch (error) {
        console.error('Metadata Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
    }
}
