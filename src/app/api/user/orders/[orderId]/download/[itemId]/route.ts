import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string, itemId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, itemId } = await params;

    // Fetch user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the order item and ensure it belongs to this user and is PAID/COMPLETED
    const orderItem = await db.orderItem.findFirst({
      where: {
        id: itemId,
        orderId: orderId,
        order: {
          userId: user.id,
          status: {
            in: ['COMPLETED', 'PAID']
          }
        }
      },
      include: {
        product: true
      }
    });

    if (!orderItem) {
      return NextResponse.json({ error: 'Order item not found or not eligible for download' }, { status: 404 });
    }

    const fileUrl = orderItem.product?.fileUrl;

    if (!fileUrl) {
      return NextResponse.json({ error: 'No file attached to this product' }, { status: 404 });
    }

    // Handle external URLs (S3, Cloudinary, etc.)
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return NextResponse.redirect(fileUrl);
    }

    // Handle local files
    // Clean up the path (remove leading slash if exists to join properly with public)
    const cleanPath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
    const filePath = path.join(process.cwd(), 'public', cleanPath);

    try {
      const fileBuffer = await readFile(filePath);
      const filename = path.basename(filePath);
      
      // Determine content type based on extension
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === '.pdf') contentType = 'application/pdf';
      else if (ext === '.zip') contentType = 'application/zip';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } catch (fsError) {
      console.error('[Download API] File read error:', fsError);
      
      // If the file is literally not on disk, return a polite error HTML
      return new NextResponse(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px; color: #333;">
            <h2>File Not Found</h2>
            <p>The requested file could not be found on the server. Please contact support.</p>
          </body>
        </html>
      `, {
        status: 404,
        headers: { 'Content-Type': 'text/html' }
      });
    }

  } catch (error) {
    console.error('[Download API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
