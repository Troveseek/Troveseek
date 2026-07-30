import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    // Check if the email already exists as a user
    const existingUser = await db.user.findUnique({ where: { email } });

    // Store the subscription in SiteSetting as a JSON list (simple approach, no separate model needed)
    const existing = await db.siteSetting.findUnique({ where: { key: 'newsletter_subscribers' } });
    
    let subscribers: string[] = [];
    if (existing?.value) {
      try { subscribers = JSON.parse(existing.value); } catch { subscribers = []; }
    }

    if (subscribers.includes(email)) {
      return NextResponse.json({ message: 'You are already subscribed!' });
    }

    subscribers.push(email);

    await db.siteSetting.upsert({
      where: { key: 'newsletter_subscribers' },
      create: { key: 'newsletter_subscribers', value: JSON.stringify(subscribers) },
      update: { value: JSON.stringify(subscribers) },
    });

    return NextResponse.json({ message: 'Successfully subscribed to the newsletter!' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 });
  }
}
