import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

// PUT /api/categories/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, nameAr, slug, description, descriptionAr } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required.' }, { status: 400 });
    }

    // Check slug collision (exclude self)
    const existing = await db.category.findFirst({ where: { slug, NOT: { id } } });
    if (existing) {
      return NextResponse.json({ error: 'A category with this slug already exists.' }, { status: 409 });
    }

    const category = await db.category.update({
      where: { id },
      data: { name, nameAr: nameAr || null, slug, description: description || null, descriptionAr: descriptionAr || null },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('[PUT /api/categories/[id]]', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE /api/categories/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Safety guard: don't delete if items are linked
    const counts = await db.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true, saas: true, services: true } },
      },
    });

    if (!counts) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    const total = counts._count.products + counts._count.saas + counts._count.services;
    if (total > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${total} item(s) are linked to this category.` },
        { status: 409 }
      );
    }

    await db.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/categories/[id]]', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
