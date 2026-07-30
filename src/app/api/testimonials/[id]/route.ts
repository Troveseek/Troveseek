import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

// PUT /api/testimonials/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { quote, quoteAr, name, nameAr, role: memberRole, roleAr, avatarUrl, isActive } = body;

    if (!quote || !name) {
      return NextResponse.json({ error: 'Quote and name are required.' }, { status: 400 });
    }

    const testimonial = await db.testimonial.update({
      where: { id },
      data: {
        quote,
        quoteAr: quoteAr || null,
        name,
        nameAr: nameAr || null,
        role: memberRole || null,
        roleAr: roleAr || null,
        avatarUrl: avatarUrl || null,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error('[PUT /api/testimonials/[id]]', error);
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}

// DELETE /api/testimonials/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await db.testimonial.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/testimonials/[id]]', error);
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}
