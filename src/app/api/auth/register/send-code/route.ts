import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save token
    await db.verificationToken.upsert({
      where: { identifier_token: { identifier: email, token: code } },
      create: { identifier: email, token: code, expires: new Date(Date.now() + 15 * 60 * 1000) },
      update: { expires: new Date(Date.now() + 15 * 60 * 1000) },
    });

    // Delete old tokens for this email
    await db.verificationToken.deleteMany({
      where: { identifier: email, token: { not: code } }
    });

    // Send email
    await sendEmail({
      to: email,
      subject: 'Your Registration Verification Code',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; text-align: center;">
          <h2>Verify Your Email</h2>
          <p>Please enter the following 6-digit code to complete your registration:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 20px; background: #f0f0f0; border-radius: 8px; margin: 20px 0;">
            ${code}
          </div>
          <p style="font-size: 13px; color: #666;">This code expires in 15 minutes.</p>
        </div>
      `
    });

    return NextResponse.json(
      { message: 'Verification code sent' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Send Code error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
