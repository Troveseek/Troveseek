import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const products = await db.product.findMany({ select: { slug: true, updatedAt: true }, where: { status: 'PUBLISHED' } });
    const blogs = await db.blogPost.findMany({ select: { slug: true, updatedAt: true }, where: { status: 'PUBLISHED' } });
    const saas = await db.saaS.findMany({ select: { slug: true, updatedAt: true }, where: { status: 'ACTIVE' } });
    const services = await db.service.findMany({ select: { slug: true, updatedAt: true }, where: { status: 'ACTIVE' } });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://troveseek.com';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    const staticPages = ['', '/about', '/contact', '/shop', '/blog', '/saas', '/services'];
    for (const page of staticPages) {
      xml += `  <url>\n    <loc>${baseUrl}${page}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
    }

    // Dynamic pages
    const addUrl = (urlPath: string, date: Date) => {
      xml += `  <url>\n    <loc>${baseUrl}${urlPath}</loc>\n    <lastmod>${date.toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    };

    products.forEach(p => addUrl(`/shop/${p.slug}`, p.updatedAt));
    blogs.forEach(b => addUrl(`/blog/${b.slug}`, b.updatedAt));
    saas.forEach(s => addUrl(`/saas/${s.slug}`, s.updatedAt));
    services.forEach(s => addUrl(`/services/${s.slug}`, s.updatedAt));

    xml += `</urlset>`;

    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(sitemapPath, xml);

    return NextResponse.json({ success: true, message: 'Sitemap regenerated successfully.' });
  } catch (error) {
    console.error('Sitemap Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate sitemap' }, { status: 500 });
  }
}
