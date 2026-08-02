import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const userId = (session.user as any).id;
  
  let lastCheck = new Date(Date.now() - 5000);
  let isClosed = false;

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  let pollInterval: NodeJS.Timeout | null = null;

  req.signal.addEventListener('abort', () => {
    isClosed = true;
    if (pollInterval) clearInterval(pollInterval);
    writer.close().catch(() => {});
  });

  const sendEvent = async (event: string, data: any) => {
    if (isClosed) return;
    try {
      await writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
    } catch (e) {
      isClosed = true;
      if (pollInterval) clearInterval(pollInterval);
    }
  };

  // Send initial connection event
  await sendEvent('connected', { status: 'ok' });

  pollInterval = setInterval(async () => {
    if (isClosed) {
      if (pollInterval) clearInterval(pollInterval);
      return;
    }
    try {
      const now = new Date();
      const newNotifications = await db.notification.findMany({
        where: {
          userId,
          createdAt: { gt: lastCheck },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      
      if (newNotifications.length > 0) {
        await sendEvent('notification', newNotifications);
      } else {
        await sendEvent('ping', { time: now.toISOString() });
      }
      
      lastCheck = now;
    } catch (error) {
      console.error('SSE polling error:', error);
    }
  }, 2500); // 2.5 second polling for fast real-time response

  return new NextResponse(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
