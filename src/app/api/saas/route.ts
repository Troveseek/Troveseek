import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { withApiSecurity } from '@/lib/api-middleware';

export async function GET(req: Request) {
  return withApiSecurity(req, async () => {
    const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const where: any = {};
  if (status) where.status = status;

  try {
    const saas = await db.saaS.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ data: saas });
    } catch (error) {
      console.error('[GET /api/saas]', error);
      return NextResponse.json({ error: 'Failed to fetch SaaS products' }, { status: 500 });
    }
  }, { enforcePublicToggle: true });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    if (!data.name || !data.slug || !data.description || data.monthlyPrice === undefined || data.yearlyPrice === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const saas = await db.saaS.create({
      data: {
        name: data.name,
        nameAr: data.nameAr || null,
        slug: data.slug,
        tagline: data.tagline || null,
        taglineAr: data.taglineAr || null,
        description: data.description,
        descriptionAr: data.descriptionAr || null,
        demoUrl: data.demoUrl || null,
        platform: data.platform || 'Web App',
        hasFreeTrial: !!data.hasFreeTrial,
        monthlyPrice: parseFloat(data.monthlyPrice) || 0,
        yearlyPrice: parseFloat(data.yearlyPrice) || 0,
        features: data.features || '[]',
        featuresAr: data.featuresAr || '[]',
        plans: data.plans || '[]',
        plansAr: data.plansAr || '[]',
        logo: data.logo || null,
        images: data.images || '[]',
        whyChooseUs: data.whyChooseUs || '[]',
        whyChooseUsAr: data.whyChooseUsAr || '[]',
        faqs: data.faqs || '[]',
        faqsAr: data.faqsAr || '[]',
        documentationUrl: data.documentationUrl || null,
        communityUrl: data.communityUrl || null,
        githubUrl: data.githubUrl || null,
        metaTitle: data.metaTitle || null,
        metaTitleAr: data.metaTitleAr || null,
        metaDescription: data.metaDescription || null,
        metaDescriptionAr: data.metaDescriptionAr || null,
        status: data.status || 'ACTIVE',
        ...(data.categoryId ? { categoryId: data.categoryId } : {})
      }
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_SAAS',
        resource: 'SaaS',
        resourceId: saas.id,
        details: JSON.stringify({ name: saas.name })
      }
    });

    return NextResponse.json(saas, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }
    console.error('Error creating SaaS:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
