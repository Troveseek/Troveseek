import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Failed to get profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name } = profileUpdateSchema.parse(body);

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: 'No data to update' }, { status: 400 });
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      }
    });

    return NextResponse.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Failed to update profile:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete the user from the database
    // Thanks to cascading deletes, related records (like accounts, sessions) will be deleted if set up in schema
    await db.user.delete({
      where: { id: session.user.id }
    });

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Failed to delete account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
