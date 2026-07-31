import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  // WhatsApp webhook verification
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  const settings = await db.siteSetting.findUnique({ where: { key: 'whatsapp_verify_token' } });
  const VERIFY_TOKEN = settings?.value || process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse('Forbidden', { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verify signature if APP_SECRET is available
    const settings = await db.siteSetting.findUnique({ where: { key: 'whatsapp_app_secret' } });
    const APP_SECRET = settings?.value || process.env.WHATSAPP_APP_SECRET;

    if (APP_SECRET) {
      const signature = req.headers.get('x-hub-signature-256');
      if (signature) {
        const hmac = crypto.createHmac('sha256', APP_SECRET);
        const digest = 'sha256=' + hmac.update(JSON.stringify(body)).digest('hex');
        if (signature !== digest) {
          return new NextResponse('Invalid signature', { status: 401 });
        }
      }
    }

    // Process incoming WhatsApp messages
    if (body.object) {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0] &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id;
        const from = body.entry[0].changes[0].value.messages[0].from;
        const msgBody = body.entry[0].changes[0].value.messages[0].text.body;

        // Save incoming message to database or send an auto-reply
        console.log(`Received WhatsApp message from ${from}: ${msgBody}`);

        // Example: save to a generic Inbox model if it exists, or just log
      }
      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    } else {
      return new NextResponse('Not Found', { status: 404 });
    }
  } catch (error) {
    console.error('WhatsApp Webhook Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
