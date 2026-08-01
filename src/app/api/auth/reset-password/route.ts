import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';
import { hashPassword } from '@/lib/auth/password';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, token, password } = schema.parse(body);

    // Verify token
    const tokenRecord = await db.verificationToken.findUnique({
      where: { identifier_token: { identifier: email, token } },
    });

    if (!tokenRecord || tokenRecord.expires < new Date()) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Update user password
    await db.user.update({
      where: { email },
      data: { passwordHash: hashedPassword }
    });

    // Delete token so it can't be reused
    await db.verificationToken.delete({
      where: { identifier_token: { identifier: email, token } },
    });

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Reset Password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
