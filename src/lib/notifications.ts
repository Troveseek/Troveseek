import db from '@/lib/db';

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}

export interface BroadcastNotificationParams {
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}

/**
 * Send an in-app real-time notification to a specific user.
 */
export async function sendNotification({
  userId,
  title,
  message,
  type = 'INFO',
  link,
}: CreateNotificationParams) {
  if (!userId) return null;

  try {
    const notification = await db.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
      },
    });
    return notification;
  } catch (error) {
    console.error(`[Notification Service] Failed to send notification to user ${userId}:`, error);
    return null;
  }
}

/**
 * Send an in-app real-time notification to all system administrators.
 */
export async function notifyAdmins({
  title,
  message,
  type = 'INFO',
  link,
}: BroadcastNotificationParams) {
  try {
    const admins = await db.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN'],
        },
        isActive: true,
      },
      select: { id: true },
    });

    if (admins.length === 0) return [];

    await db.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        title,
        message,
        type,
        link,
      })),
    });

    return admins.map((a) => a.id);
  } catch (error) {
    console.error('[Notification Service] Failed to notify admins:', error);
    return [];
  }
}

/**
 * Broadcast an in-app notification to all active platform users.
 */
export async function broadcastToAllUsers({
  title,
  message,
  type = 'INFO',
  link,
}: BroadcastNotificationParams) {
  try {
    const users = await db.user.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    if (users.length === 0) return 0;

    const result = await db.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        title,
        message,
        type,
        link,
      })),
    });

    return result.count;
  } catch (error) {
    console.error('[Notification Service] Failed to broadcast notification:', error);
    return 0;
  }
}
