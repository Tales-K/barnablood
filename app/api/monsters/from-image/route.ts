import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { extractMonsterFromImage } from '@/lib/openaiMonsterExtractor';
import { validateExtractedMonster } from '@/lib/validateExtractedMonster';
import { checkAndIncrementImageUsage } from '@/lib/firestore';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check daily rate limit before doing anything expensive
    const rateLimit = await checkAndIncrementImageUsage(session.user.email);
    if (!rateLimit.allowed) {
        return NextResponse.json(
            {
                error: `Daily limit reached. You can process up to ${rateLimit.limit} images per day. Try again tomorrow.`,
                used: rateLimit.used,
                limit: rateLimit.limit,
            },
            { status: 429 }
        );
    }

    try {
        const formData = await request.formData();
        const file = formData.get('image') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: `Unsupported image type: ${file.type}. Use JPEG, PNG, WebP or GIF.` },
                { status: 400 }
            );
        }

        if (file.size > MAX_IMAGE_BYTES) {
            return NextResponse.json(
                { error: 'Image is too large. Maximum size is 10 MB.' },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        const rawJson = await extractMonsterFromImage(base64, file.type);
        const outcome = validateExtractedMonster(rawJson);

        if (!outcome.success) {
            return NextResponse.json(
                { error: outcome.error, details: outcome.details },
                { status: 422 }
            );
        }

        return NextResponse.json({
            monster: outcome.data,
            usage: { used: rateLimit.used, limit: 20 },
        });
    } catch (error) {
        console.error('[POST /api/monsters/from-image] Error:', error);
        return NextResponse.json(
            { error: 'Failed to extract monster from image. Please try again.' },
            { status: 500 }
        );
    }
}
