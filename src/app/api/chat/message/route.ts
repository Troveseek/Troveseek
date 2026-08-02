import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { chatEmitter } from '@/lib/chatEventEmitter';
import { sendNotification, notifyAdmins } from '@/lib/notifications';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { sessionId, content } = body;

  if (!sessionId || !content) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const chatSession = await db.chatSession.findUnique({
    where: { id: sessionId }
  });

  if (!chatSession) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';

  // Make sure client owns this session, or user is an admin
  if (chatSession.userId !== session.user.id && !isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const message = await db.chatMessage.create({
    data: {
      sessionId,
      senderId: session.user.id,
      senderRole: isAdmin ? 'ADMIN' : 'CLIENT',
      content,
    }
  });

  // Update session updatedAt timestamp
  await db.chatSession.update({
    where: { id: sessionId },
    data: { updatedAt: new Date() }
  });

  // Emit event to chat stream
  chatEmitter.emit(sessionId, message);

  // If client sent this, notify ADMIN stream & send admin in-app notification
  if (!isAdmin) {
    chatEmitter.emit('ADMIN', { ...message, _sessionUpdate: sessionId });
    
    // In-app notification for Admins
    await notifyAdmins({
      title: 'New Support Message',
      message: `${session.user.name || 'A customer'} sent a message: "${content.length > 50 ? content.slice(0, 50) + '...' : content}"`,
      type: 'INFO',
      link: `/admin/support`,
    });
  } else {
    // Admin replied -> Notify the client in-app
    if (chatSession.userId) {
      await sendNotification({
        userId: chatSession.userId,
        title: 'Support Team Replied',
        message: content.length > 60 ? `${content.slice(0, 60)}...` : content,
        type: 'INFO',
        link: `/profile?tab=support`,
      });
    }
  }

  return NextResponse.json({ message });
}

// Mark messages as read
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { sessionId } = body;
  
  const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';

  await db.chatMessage.updateMany({
    where: {
      sessionId,
      isRead: false,
      senderRole: isAdmin ? 'CLIENT' : 'ADMIN' // Mark opposite role's messages as read
    },
    data: { isRead: true }
  });

  return NextResponse.json({ success: true });
}
