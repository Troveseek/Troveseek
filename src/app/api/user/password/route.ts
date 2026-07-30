import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { comparePassword, hashPassword } from '@/lib/auth/password';
import { z } from 'zod';

const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = passwordUpdateSchema.parse(body);

    const user = await db.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'User not found or no password set (OAuth)' }, { status: 400 });
    }

    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(newPassword);

    await db.user.update({
      where: { id: session.user.id },
      data: { passwordHash: hashedPassword }
    });

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Failed to update password:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
