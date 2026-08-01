import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const products = await db.product.findMany({ select: { id: true, name: true, metaTitle: true, metaDescription: true } });
    const saas = await db.saaS.findMany({ select: { id: true, name: true, metaTitle: true, metaDescription: true } });
    const services = await db.service.findMany({ select: { id: true, name: true, metaTitle: true, metaDescription: true } });
    const blogs = await db.blogPost.findMany({ select: { id: true, title: true, metaTitle: true, metaDescription: true } });

    const allItems: any[] = [
      ...products.map(p => ({ ...p, type: 'Product' })),
      ...saas.map(s => ({ ...s, type: 'SaaS' })),
      ...services.map(s => ({ ...s, type: 'Service' })),
      ...blogs.map(b => ({ id: b.id, name: b.title, metaTitle: b.metaTitle, metaDescription: b.metaDescription, type: 'Blog' })),
    ];

    let total = allItems.length;
    let missingTitle = 0;
    let missingDesc = 0;

    const issues: any[] = [];

    allItems.forEach(item => {
      let issuesFound = [];
      if (!item.metaTitle) {
        missingTitle++;
        issuesFound.push('Missing Meta Title');
      }
      if (!item.metaDescription) {
        missingDesc++;
        issuesFound.push('Missing Meta Description');
      }
      if (issuesFound.length > 0) {
        issues.push({
          type: item.type,
          name: item.name,
          issues: issuesFound
        });
      }
    });

    const itemsWithFullSeo = total - missingTitle - missingDesc; // rough estimate
    const score = total === 0 ? 0 : Math.round(((total * 2 - missingTitle - missingDesc) / (total * 2)) * 100);

    return NextResponse.json({
      data: {
        score,
        totalAnalyzed: total,
        issues,
      }
    });
  } catch (error) {
    console.error('SEO Audit Error:', error);
    return NextResponse.json({ error: 'Failed to run SEO audit' }, { status: 500 });
  }
}
