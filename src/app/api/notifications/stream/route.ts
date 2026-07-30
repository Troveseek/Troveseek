import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const userId = session.user.id;
  const role = session.user.role;

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  let isClosed = false;

  req.signal.addEventListener('abort', () => {
    isClosed = true;
    writer.close().catch(() => {});
  });

  const sendNotification = async (data: any) => {
    if (isClosed) return;
    try {
      await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    } catch (e) {
      isClosed = true;
    }
  };

  const pollInterval = setInterval(async () => {
    if (isClosed) {
      clearInterval(pollInterval);
      return;
    }
    try {
      // For Admin, fetch all unread notifications. For User, fetch their own.
      const unreadCount = await db.notification.count({
        where: {
          ...(role !== 'ADMIN' && { userId }),
          isRead: false,
        },
      });

      const recentNotifications = await db.notification.findMany({
        where: {
          ...(role !== 'ADMIN' && { userId }),
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      await sendNotification({
        type: 'ping',
        unreadCount,
        recent: recentNotifications,
      });
    } catch (error) {
      console.error('Notification polling error:', error);
    }
  }, 5000);

  // Initial immediate push
  try {
    const initialCount = await db.notification.count({
      where: {
        ...(role !== 'ADMIN' && { userId }),
        isRead: false,
      },
    });
    const initialList = await db.notification.findMany({
      where: {
        ...(role !== 'ADMIN' && { userId }),
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    
    await sendNotification({ type: 'init', unreadCount: initialCount, recent: initialList });
  } catch (e) {}

  return new NextResponse(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
