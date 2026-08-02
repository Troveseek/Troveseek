import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, email, company, subject, message } = data;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find all admins to notify
    const admins = await db.user.findMany({
      where: { role: 'ADMIN' }
    });

    const notifTitle = `New Contact Message: ${subject || 'General Inquiry'}`;
    const notifMessage = `From: ${name} (${email})\nCompany: ${company || 'N/A'}\n\nMessage:\n${message}`;

    // Create a notification for each admin
    if (admins.length > 0) {
      await Promise.all(
        admins.map(admin => 
          db.notification.create({
            data: {
              userId: admin.id,
              title: notifTitle,
              message: notifMessage,
              type: 'INFO'
            }
          })
        )
      );
    }

    // In a real production app, you would also use SendGrid/Resend here to send a real email.

    return NextResponse.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
