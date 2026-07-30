import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import { withApiSecurity } from '@/lib/api-middleware';

// GET /api/products - Fetch all products with filters
export async function GET(req: Request) {
  return withApiSecurity(req, async () => {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '20');

    const where: any = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { category: { select: { name: true, nameAr: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      data: products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }, { enforcePublicToggle: true });
}

// POST /api/products - Create new product (Admin/Sales Manager only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = (session.user as any).role;
  if (!['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { name, nameAr, description, descriptionAr, fullDescription, fullDescriptionAr, price, salePrice, bulkPricing, currency, stock, status, logo, images, tags, faqs, faqsAr, features, featuresAr, specifications, specificationsAr, requirements, requirementsAr, categoryId, metaTitle, metaTitleAr, metaDescription, metaDescriptionAr, fileUrl } = body;

  if (!name || price == null) {
    return NextResponse.json({ error: 'Missing required fields: name, price' }, { status: 400 });
  }

  const slug = (body.slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const product = await db.product.create({
    data: {
      name,
      nameAr: nameAr || null,
      slug,
      description: description || name,
      descriptionAr: descriptionAr || null,
      fullDescription: fullDescription || null,
      fullDescriptionAr: fullDescriptionAr || null,
      price: parseFloat(price),
      salePrice: salePrice ? parseFloat(salePrice) : null,
      bulkPricing: bulkPricing ?? '[]',
      currency: currency ?? 'USD',
      stock: parseInt(stock ?? '0'),
      status: status ?? 'DRAFT',
      logo: logo || null,
      images: images ?? '[]',
      tags: tags ?? '[]',
      faqs: faqs ?? '[]',
      faqsAr: faqsAr ?? '[]',
      features: features ?? '[]',
      featuresAr: featuresAr ?? '[]',
      specifications: specifications ?? '[]',
      specificationsAr: specificationsAr ?? '[]',
      requirements: requirements ?? '[]',
      requirementsAr: requirementsAr ?? '[]',
      categoryId: categoryId ?? null,
      metaTitle: metaTitle || null,
      metaTitleAr: metaTitleAr || null,
      metaDescription: metaDescription || null,
      metaDescriptionAr: metaDescriptionAr || null,
      fileUrl: fileUrl || null,
    },
  });

  return NextResponse.json({ data: product }, { status: 201 });
}
