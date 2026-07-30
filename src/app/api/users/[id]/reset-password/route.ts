import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import { hashPassword } from '@/lib/auth/password';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const currentRole = (session?.user as any)?.role;
  
  if (!['ADMIN', 'SUPER_ADMIN'].includes(currentRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const defaultPassword = 'TempPassword123!';
    const passwordHash = await hashPassword(defaultPassword);

    await db.user.update({
      where: { id },
      data: { passwordHash }
    });

    return NextResponse.json({ success: true, message: 'Password reset to default.' });
  } catch (error) {
    console.error('Failed to reset password', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
