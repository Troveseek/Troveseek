import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

// GET /api/categories
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            products: true,
            saas: true,
            services: true,
          },
        },
      },
    });
    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error('[GET /api/categories]', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/categories
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, nameAr, slug, description, descriptionAr } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required.' }, { status: 400 });
    }

    const existing = await db.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'A category with this slug already exists.' }, { status: 409 });
    }

    const category = await db.category.create({
      data: { name, nameAr: nameAr || null, slug, description: description || null, descriptionAr: descriptionAr || null },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('[POST /api/categories]', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
