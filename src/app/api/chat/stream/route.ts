import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { chatEmitter } from '@/lib/chatEventEmitter';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');

  // If client, subscribe to their specific session.
  // If admin, subscribe to 'ADMIN' channel (or handle appropriately).
  const channel = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN' 
    ? 'ADMIN' 
    : (sessionId || session.user.id); // For simplicity, clients can subscribe to their own user ID channel, but using sessionId is better.

  if (!channel) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection success message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));

      const listener = (message: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
      };

      const unsubscribe = chatEmitter.subscribe(channel, listener);

      req.signal.addEventListener('abort', () => {
        unsubscribe();
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
