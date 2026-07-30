import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import { hashPassword } from '@/lib/auth/password';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const session = await auth();
  const currentRole = (session?.user as any)?.role;
  
  if (!['ADMIN', 'SUPER_ADMIN'].includes(currentRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { name, email, role } = await req.json();

  if (!email || !role) {
    return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
  }

  try {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const defaultPassword = 'TempPassword123!';
    const passwordHash = await hashPassword(defaultPassword);

    const newUser = await db.user.create({
      data: {
        name,
        email,
        role,
        passwordHash,
        isActive: true,
        emailVerified: new Date(),
      }
    });
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Send invitation email
    await sendEmail({
      to: email,
      subject: 'Welcome to TroveSeek Admin Portal',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2>Welcome to the Team, ${name}!</h2>
          <p>You have been invited to join the TroveSeek Admin Portal as a <strong>${role}</strong>.</p>
          
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p style="margin-top: 0;"><strong>Your Login Credentials:</strong></p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${defaultPassword}</p>
          </div>

          <p>Please log in using the link below and change your password immediately from your profile settings.</p>
          
          <div style="margin: 32px 0;">
            <a href="${baseUrl}/login" style="background-color: #635BFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Login to Admin Portal</a>
          </div>

          <hr style="border: 1px solid #eaeaea; margin-top: 32px;"/>
          <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply directly to this email.</p>
        </div>
      `
    });

    return NextResponse.json({ data: newUser });
  } catch (error) {
    console.error('Failed to invite user', error);
    return NextResponse.json({ error: 'Failed to invite user' }, { status: 500 });
  }
}
