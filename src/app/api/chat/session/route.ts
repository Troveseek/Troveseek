import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // If ADMIN, fetch all open sessions. If CLIENT, fetch their own session(s)
  if (session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') {
    const sessions = await db.chatSession.findMany({
      include: { 
        user: { select: { id: true, name: true, email: true, image: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json({ sessions });
  } else {
    const sessions = await db.chatSession.findMany({
      where: { userId: session.user.id },
      include: { 
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json({ sessions });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { subject } = body;

  const chatSession = await db.chatSession.create({
    data: {
      userId: session.user.id,
      subject: subject || 'General Inquiry',
    }
  });

  return NextResponse.json({ session: chatSession });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const updated = await db.chatSession.update({
      where: { id },
      data: { status }
    });
    return NextResponse.json({ session: updated });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
