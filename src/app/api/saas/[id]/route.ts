import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  nameAr: z.string().nullable().optional(),
  slug: z.string().min(1, "Slug is required").optional(),
  tagline: z.string().nullable().optional(),
  taglineAr: z.string().nullable().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().nullable().optional(),
  demoUrl: z.string().nullable().optional(),
  platform: z.string().nullable().optional(),
  hasFreeTrial: z.boolean().optional(),
  monthlyPrice: z.number().min(0).optional(),
  yearlyPrice: z.number().min(0).optional(),
  features: z.string().optional(),
  featuresAr: z.string().optional(),
  plans: z.string().optional(),
  plansAr: z.string().optional(),
  logo: z.string().nullable().optional(),
  images: z.string().optional(),
  whyChooseUs: z.string().optional(),
  whyChooseUsAr: z.string().optional(),
  faqs: z.string().optional(),
  faqsAr: z.string().optional(),
  documentationUrl: z.string().nullable().optional(),
  communityUrl: z.string().nullable().optional(),
  githubUrl: z.string().nullable().optional(),
  metaTitle: z.string().nullable().optional(),
  metaTitleAr: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  metaDescriptionAr: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
  categoryId: z.string().optional().nullable(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Support lookup by either id OR slug
    const saas = await db.saaS.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { category: true },
    });

    if (!saas) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ data: saas });
  } catch (error) {
    console.error('[GET /api/saas/[id]]', error);
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
    const body = await req.json();
    const data = updateSchema.parse(body);

    const saas = await db.saaS.update({
      where: { id },
      data,
    });

    return NextResponse.json({ data: saas });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issue = error.issues[0];
      const path = issue.path.join('.');
      return NextResponse.json({ error: path ? `${path}: ${issue.message}` : issue.message }, { status: 400 });
    }
    console.error('[PUT /api/saas/[id]]', error);
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
    await db.saaS.delete({ where: { id } });

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('[DELETE /api/saas/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
