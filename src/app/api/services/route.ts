import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    if (!data.name || !data.slug || !data.description || data.basePrice === undefined || data.estimatedDays === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const service = await db.service.create({
      data: {
        name: data.name,
        nameAr: data.nameAr || null,
        slug: data.slug,
        description: data.description,
        descriptionAr: data.descriptionAr || null,
        basePrice: parseFloat(data.basePrice),
        estimatedDays: parseInt(data.estimatedDays, 10),
        status: data.status || 'ACTIVE',
        tagline: data.tagline || null,
        taglineAr: data.taglineAr || null,
        logo: data.logo || null,
        images: data.images || '[]',
        process: data.process || '[]',
        processAr: data.processAr || '[]',
        portfolio: data.portfolio || '[]',
        portfolioAr: data.portfolioAr || '[]',
        testimonials: data.testimonials || '[]',
        testimonialsAr: data.testimonialsAr || '[]',
        tiers: data.tiers || '[]',
        tiersAr: data.tiersAr || '[]',
        features: data.features || '[]',
        featuresAr: data.featuresAr || '[]',
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
        metaTitle: data.metaTitle || null,
        metaTitleAr: data.metaTitleAr || null,
        metaDescription: data.metaDescription || null,
        metaDescriptionAr: data.metaDescriptionAr || null,
        ...(data.categoryId ? { categoryId: data.categoryId } : {})
      }
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_SERVICE',
        resource: 'Service',
        resourceId: service.id,
        details: JSON.stringify({ name: service.name })
      }
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }
    console.error('Error creating Service:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const services = await db.service.findMany({
      select: { id: true, name: true, status: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching Services:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
