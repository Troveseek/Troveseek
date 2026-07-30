import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        notifyEmailOrders: true,
        notifyMarketing: true,
        notifySecurity: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ preferences: user });
  } catch (error) {
    console.error('Failed to get preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const data = await req.json();

    const { notifyEmailOrders, notifyMarketing, notifySecurity } = data;

    const user = await db.user.update({
      where: { id: userId },
      data: {
        ...(notifyEmailOrders !== undefined && { notifyEmailOrders: Boolean(notifyEmailOrders) }),
        ...(notifyMarketing !== undefined && { notifyMarketing: Boolean(notifyMarketing) }),
        ...(notifySecurity !== undefined && { notifySecurity: Boolean(notifySecurity) }),
      },
      select: {
        notifyEmailOrders: true,
        notifyMarketing: true,
        notifySecurity: true,
      }
    });

    return NextResponse.json({ preferences: user });
  } catch (error) {
    console.error('Failed to update preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
