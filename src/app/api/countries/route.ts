import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getServerSession } from 'next-auth/next';

export async function GET(req: NextRequest) {
  try {
    const countries = await db.country.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json({ data: countries });
  } catch (error) {
    console.error('Countries API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    // if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { code, name, nameAr, currency, taxRate, methods, defaultLanguage, isActive } = body;

    const newCountry = await db.country.create({
      data: {
        code,
        name,
        nameAr,
        currency,
        taxRate: Number(taxRate) || 0,
        methods: JSON.stringify(methods || []),
        defaultLanguage: defaultLanguage || 'en',
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json({ data: newCountry }, { status: 201 });
  } catch (error) {
    console.error('Countries POST Error:', error);
    return NextResponse.json({ error: 'Failed to create country' }, { status: 500 });
  }
}
