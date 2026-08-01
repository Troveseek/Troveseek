import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'misc';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + '-' + file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    if (supabase) {
      // Upload to Supabase Storage
      const { data, error } = await supabase
        .storage
        .from('uploads')
        .upload(`${folder}/${filename}`, buffer, {
          contentType: file.type,
          upsert: false
        });

      if (error) {
        console.error('[Supabase Upload Error]', error);
        return NextResponse.json({ error: 'Failed to upload to cloud storage' }, { status: 500 });
      }

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('uploads')
        .getPublicUrl(`${folder}/${filename}`);

      return NextResponse.json({ url: publicUrl });
    } else {
      // Fallback for local testing if Supabase is not configured (will not work on Vercel)
      console.warn("Supabase not configured, attempting local upload (WARNING: Ephemeral on Vercel)");
      const { writeFile, mkdir } = require('fs/promises');
      const path = require('path');
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
      await mkdir(uploadDir, { recursive: true });
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      return NextResponse.json({ url: `/uploads/${folder}/${filename}` });
    }
  } catch (error) {
    console.error('[POST /api/upload]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
