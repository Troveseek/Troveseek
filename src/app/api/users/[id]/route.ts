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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const currentUserId = (session?.user as any)?.id;
  const currentRole = (session?.user as any)?.role;
  
  // Only SUPER_ADMIN can permanently delete users
  if (currentRole !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Only Super Admins can delete users' }, { status: 403 });
  }

  const { id } = await params;

  // Prevent self-deletion
  if (id === currentUserId) {
    return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
  }

  try {
    // Check user exists
    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deleting other SUPER_ADMINs
    if (user.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Cannot delete another Super Admin' }, { status: 403 });
    }

    // Delete related records first (cascade safety)
    await db.session.deleteMany({ where: { userId: id } });
    await db.account.deleteMany({ where: { userId: id } });
    if (user.email) {
      await db.verificationToken.deleteMany({ where: { identifier: user.email } });
    }

    // Delete the user
    await db.user.delete({ where: { id } });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: currentUserId,
        action: 'DELETE_USER',
        resource: 'User',
        resourceId: id,
        details: JSON.stringify({ 
          deletedEmail: user.email, 
          deletedName: user.name,
          deletedRole: user.role 
        }),
        ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
      },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
