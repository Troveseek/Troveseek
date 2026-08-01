import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'fake-key');

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const { id } = await params;
    
    const campaign = await db.campaign.findUnique({ where: { id } });
    if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (campaign.status === 'SENT') {
      return NextResponse.json({ error: 'Campaign already sent' }, { status: 400 });
    }

    // Get all users who opted in to marketing
    const subscribers = await db.user.findMany({
      where: { notifyMarketing: true, isActive: true },
      select: { email: true }
    });

    const emails = subscribers.map(s => s.email).filter(Boolean) as string[];

    if (emails.length === 0) {
      return NextResponse.json({ error: 'No active subscribers found' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('No RESEND_API_KEY set. Simulating send.');
      // Simulate sending if no key
      const updated = await db.campaign.update({
        where: { id },
        data: { status: 'SENT', sentAt: new Date() }
      });
      return NextResponse.json({ data: updated, simulated: true });
    }

    // Send emails via Resend (BCC is limited in Resend, standard practice is to use batch sending, but for simplicity we'll send a single email with BCC, or loop. Batch API is better.)
    // Note: Resend limits up to 50 recipients per request in BCC. For a real app, use the Batch API.
    // We'll use the Batch API here.
    const batch = emails.map(email => ({
      from: 'Marketing <marketing@troveseek.com>', // User needs a verified domain in Resend
      to: [email],
      subject: campaign.subject,
      html: campaign.content,
    }));

    // Send in chunks of 100
    const chunkSize = 100;
    for (let i = 0; i < batch.length; i += chunkSize) {
      const chunk = batch.slice(i, i + chunkSize);
      await resend.batch.send(chunk);
    }

    const updated = await db.campaign.update({
      where: { id },
      data: { status: 'SENT', sentAt: new Date() }
    });

    return NextResponse.json({ data: updated, sentCount: emails.length });
  } catch (error) {
    console.error('Campaigns Send Error:', error);
    return NextResponse.json({ error: 'Failed to send campaign' }, { status: 500 });
  }
}
