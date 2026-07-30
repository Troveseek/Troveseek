import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Create directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignore if exists
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'png';
    const filename = `avatar_${session.user.id}_${Date.now()}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    const imageUrl = `/uploads/${filename}`;

    // Update user in DB
    const user = await db.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
      select: { id: true, image: true }
    });

    return NextResponse.json({ message: 'Image uploaded successfully', user });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Just remove from DB
    const user = await db.user.update({
      where: { id: session.user.id },
      data: { image: null },
      select: { id: true, image: true }
    });

    return NextResponse.json({ message: 'Image removed successfully', user });
  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
