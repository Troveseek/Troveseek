import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = await db.service.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!service) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: service });
  } catch (error) {
    console.error('[GET /api/services/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await db.service.delete({ where: { id } });

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    console.error('[DELETE /api/services/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    const service = await db.service.update({
      where: { id },
      data: {
        name: data.name,
        nameAr: data.nameAr,
        slug: data.slug,
        description: data.description,
        descriptionAr: data.descriptionAr,
        basePrice: data.basePrice ? parseFloat(data.basePrice) : undefined,
        estimatedDays: data.estimatedDays ? parseInt(data.estimatedDays, 10) : undefined,
        status: data.status,
        tagline: data.tagline,
        taglineAr: data.taglineAr,
        logo: data.logo !== undefined ? data.logo : undefined,
        images: data.images,
        process: data.process,
        processAr: data.processAr,
        portfolio: data.portfolio,
        portfolioAr: data.portfolioAr,
        testimonials: data.testimonials,
        testimonialsAr: data.testimonialsAr,
        tiers: data.tiers,
        tiersAr: data.tiersAr,
        features: data.features,
        featuresAr: data.featuresAr,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        metaTitle: data.metaTitle,
        metaTitleAr: data.metaTitleAr,
        metaDescription: data.metaDescription,
        metaDescriptionAr: data.metaDescriptionAr,
        categoryId: data.categoryId || null,
      }
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_SERVICE',
        resource: 'Service',
        resourceId: service.id,
        details: JSON.stringify({ name: service.name })
      }
    });

    return NextResponse.json(service);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }
    console.error('[PUT /api/services/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
