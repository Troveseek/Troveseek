import { NextResponse } from 'next/server';
import db from '@/lib/db';

// POST — Public: Client declines the spec
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const data = await req.json();

    const spec = await db.techSpec.findUnique({ where: { signatureToken: token } });
    if (!spec) {
      return NextResponse.json({ error: 'Spec not found' }, { status: 404 });
    }

    if (spec.status === 'SIGNED') {
      return NextResponse.json({ error: 'Cannot decline an already signed document' }, { status: 400 });
    }
    if (spec.status === 'DECLINED') {
      return NextResponse.json({ error: 'Already declined' }, { status: 400 });
    }

    await db.techSpec.update({
      where: { id: spec.id },
      data: {
        status: 'DECLINED',
        declinedAt: new Date(),
        declineReason: data.reason || null,
      },
    });

    return NextResponse.json({ success: true, message: 'Document declined' });
  } catch (error) {
    console.error('Error declining tech spec:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
