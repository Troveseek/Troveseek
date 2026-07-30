import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    
    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const results: any[] = [];

    // Search Products (Only ACTIVE)
    const products = await db.product.findMany({
      where: { 
        name: { contains: query },
        status: 'ACTIVE'
      },
      include: {
        category: true
      },
      take: 6
    });

    products.forEach(p => {
      let image = null;
      try {
        const parsedImages = JSON.parse(p.images);
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          image = parsedImages[0];
        }
      } catch (e) {
        // Ignore
      }

      results.push({ 
        id: p.id, 
        type: 'Product', 
        title: p.name,
        price: p.price,
        salePrice: p.salePrice,
        category: p.category?.name,
        image,
        link: `/shop/${p.slug}` 
      });
    });

    // Search Categories
    const categories = await db.category.findMany({
      where: { name: { contains: query } },
      take: 3
    });

    categories.forEach(c => {
      results.push({
        id: c.id,
        type: 'Category',
        title: c.name,
        link: `/shop?category=${c.slug}`
      });
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Client search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
