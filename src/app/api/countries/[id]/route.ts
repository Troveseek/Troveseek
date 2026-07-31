import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const { id } = await params;
    const body = await req.json();
    const { code, name, nameAr, currency, taxRate, methods, defaultLanguage, isActive } = body;

    const updated = await db.country.update({
      where: { id },
      data: {
        code,
        name,
        nameAr,
        currency,
        taxRate: Number(taxRate),
        methods: JSON.stringify(methods),
        defaultLanguage,
        isActive
      }
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Countries PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update country' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const { id } = await params;
    
    await db.country.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Countries DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete country' }, { status: 500 });
  }
}
