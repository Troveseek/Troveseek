import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { z } from 'zod';
import { verifyRecaptcha, isDisposableEmail } from '@/lib/recaptcha';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
  recaptchaToken: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, code, recaptchaToken } = registerSchema.parse(body);

    // --- Security: reCAPTCHA v3 verification ---
    if (recaptchaToken) {
      const captchaResult = await verifyRecaptcha(recaptchaToken);
      if (!captchaResult.success) {
        return NextResponse.json(
          { error: 'Security verification failed. Please try again.' },
          { status: 403 }
        );
      }
    }

    // --- Security: Block disposable email domains ---
    if (isDisposableEmail(email)) {
      return NextResponse.json(
        { error: 'Disposable email addresses are not allowed. Please use a real email.' },
        { status: 400 }
      );
    }

    // Verify code
    const tokenRecord = await db.verificationToken.findUnique({
      where: { identifier_token: { identifier: email, token: code } },
    });

    if (!tokenRecord || tokenRecord.expires < new Date()) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

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

    const hashedPassword = await hashPassword(password);

    // Create the user and set emailVerified
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: 'CLIENT',
        isActive: true,
        emailVerified: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });

    // Delete token
    await db.verificationToken.delete({
      where: { identifier_token: { identifier: email, token: code } },
    });

    return NextResponse.json(
      { message: 'User created successfully', user },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
