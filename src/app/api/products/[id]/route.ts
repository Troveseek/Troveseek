import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';

const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  nameAr: z.string().optional().nullable(),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional().nullable(),
  fullDescription: z.string().optional().nullable(),
  fullDescriptionAr: z.string().optional().nullable(),
  price: z.number().min(0).optional(),
  salePrice: z.number().min(0).optional().nullable(),
  bulkPricing: z.string().optional(),
  currency: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
  categoryId: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  images: z.string().optional(),
  tags: z.string().optional(),
  metaTitle: z.string().optional().nullable(),
  metaTitleAr: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaDescriptionAr: z.string().optional().nullable(),
  fileUrl: z.string().optional().nullable(),
  faqs: z.string().optional(),
  faqsAr: z.string().optional(),
  features: z.string().optional(),
  featuresAr: z.string().optional(),
  specifications: z.string().optional(),
  specificationsAr: z.string().optional(),
  requirements: z.string().optional(),
  requirementsAr: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        _count: { select: { orderItems: true } },
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateProductSchema.parse(body);

    const product = await db.product.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json({ data: product });
  } catch (error) {
    console.error('Failed to update product:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.product.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
