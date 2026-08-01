import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'png';
    const filename = `avatar_${session.user.id}_${Date.now()}.${ext}`;
    
    let imageUrl = '';

    if (supabase) {
      const { data, error } = await supabase
        .storage
        .from('uploads')
        .upload(`avatars/${filename}`, buffer, {
          contentType: file.type,
          upsert: false
        });

      if (error) {
        console.error('[Supabase Upload Error]', error);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
      }

      const { data: { publicUrl } } = supabase
        .storage
        .from('uploads')
        .getPublicUrl(`avatars/${filename}`);
      
      imageUrl = publicUrl;
    } else {
      console.warn("Supabase not configured, attempting local upload (WARNING: Ephemeral on Vercel)");
      const { writeFile, mkdir } = require('fs/promises');
      const path = require('path');
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (e) {}
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

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
