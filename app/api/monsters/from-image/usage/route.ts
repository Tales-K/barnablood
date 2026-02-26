import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getImageUsageToday } from '@/lib/firestore';

export async function GET() {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usage = await getImageUsageToday(session.user.email);
    return NextResponse.json(usage);
}
