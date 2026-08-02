import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { Resend } from 'resend';

// Initialize Resend if API key is present
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, email, company, subject, message } = data;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Find all admins to notify via in-app notifications
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

    // 2. Fetch the dynamic destination email from SiteSettings
    const setting = await db.siteSetting.findUnique({
      where: { key: 'contact_email' }
    });
    
    const destinationEmail = setting?.value || 'admin@troveseek.com';

    // 3. Send the actual email using Resend
    if (resend) {
      await resend.emails.send({
        from: 'TroveSeek Contact Form <onboarding@resend.dev>', // Use a verified domain in production
        to: destinationEmail,
        replyTo: email,
        subject: `New Contact Request: ${subject || 'General Inquiry'}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Company:</strong> ${company || 'N/A'}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr />
          <h3>Message:</h3>
          <p style="white-space: pre-wrap;">${message}</p>
        `
      });
    } else {
      console.warn('RESEND_API_KEY is not set. Email was not sent, but notification was saved.');
    }

    return NextResponse.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
