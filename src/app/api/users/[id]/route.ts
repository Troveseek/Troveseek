import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const currentRole = (session?.user as any)?.role;
  
  if (!['ADMIN', 'SUPER_ADMIN'].includes(currentRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        ...(body.role && { role: body.role }),
        ...(typeof body.isActive === 'boolean' && { isActive: body.isActive })
      }
    });

    return NextResponse.json({ data: updatedUser });
  } catch (error) {
    console.error('Failed to update user', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
