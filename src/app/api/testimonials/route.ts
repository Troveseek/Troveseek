import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

// GET /api/testimonials
export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ data: testimonials });
  } catch (error) {
    console.error('[GET /api/testimonials]', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

// POST /api/testimonials
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { quote, quoteAr, name, nameAr, role: memberRole, roleAr, avatarUrl, isActive } = body;

    if (!quote || !name) {
      return NextResponse.json({ error: 'Quote and name are required.' }, { status: 400 });
    }

    const testimonial = await db.testimonial.create({
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

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error('[POST /api/testimonials]', error);
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}
