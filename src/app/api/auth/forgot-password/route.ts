import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    const user = await db.user.findUnique({ where: { email } });

    // We don't want to expose if a user exists or not for security reasons,
    // so we always return a success message even if the user is not found.
    if (!user) {
      return NextResponse.json({ message: 'If the email exists, a reset link was sent.' }, { status: 200 });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Save token (reusing VerificationToken model)
    await db.verificationToken.upsert({
      where: { identifier_token: { identifier: email, token } },
      create: { identifier: email, token, expires: new Date(Date.now() + 60 * 60 * 1000) }, // 1 hour expiry
      update: { expires: new Date(Date.now() + 60 * 60 * 1000) },
    });

    // Delete old tokens for this email
    await db.verificationToken.deleteMany({
      where: { identifier: email, token: { not: token } }
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || 'https://troveseek.com'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Send email via Resend
    await sendEmail({
      to: email,
      subject: 'Reset your password',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; text-align: center; border: 1px solid #eaeaea; padding: 30px; border-radius: 12px;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">We received a request to reset your password. Click the button below to choose a new one:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; margin: 24px 0; background-color: #7c6fff; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Reset Password</a>
          <p style="font-size: 13px; color: #888;">If you didn't request this, you can safely ignore this email.</p>
          <p style="font-size: 12px; color: #aaa; margin-top: 30px;">This link will expire in 1 hour.</p>
        </div>
      `
    });

    return NextResponse.json(
      { message: 'If the email exists, a reset link was sent.' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Forgot Password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
