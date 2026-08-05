import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { normalizeMethodsForDb, parsePaymentMethods } from '@/lib/data/countries';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const country = await db.country.findUnique({ where: { id } });
    if (!country) return NextResponse.json({ error: 'Country not found' }, { status: 404 });
    
    return NextResponse.json({ 
      data: {
        ...country,
        methodsList: parsePaymentMethods(country.methods)
      } 
    });
  } catch (error) {
    console.error('Countries GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch country' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { code, name, nameAr, currency, taxRate, methods, defaultLanguage, isActive } = body;

    const cleanCode = code ? code.toLowerCase().trim() : undefined;

    // Check if new code conflicts with another country
    if (cleanCode) {
      const existing = await db.country.findFirst({
        where: {
          code: cleanCode,
          NOT: { id }
        }
      });
      if (existing) {
        return NextResponse.json({ error: `Another country already uses ISO code "${cleanCode.toUpperCase()}".` }, { status: 409 });
      }
    }

    const updated = await db.country.update({
      where: { id },
      data: {
        ...(cleanCode && { code: cleanCode }),
        ...(name !== undefined && { name: name.trim() }),
        ...(nameAr !== undefined && { nameAr: nameAr ? nameAr.trim() : null }),
        ...(currency !== undefined && { currency: currency.toUpperCase().trim() }),
        ...(taxRate !== undefined && { taxRate: Number(taxRate) || 0 }),
        ...(methods !== undefined && { methods: normalizeMethodsForDb(methods) }),
        ...(defaultLanguage !== undefined && { defaultLanguage: defaultLanguage.trim() }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) })
      }
    });

    return NextResponse.json({ 
      data: {
        ...updated,
        methodsList: parsePaymentMethods(updated.methods)
      } 
    });
  } catch (error: any) {
    console.error('Countries PUT Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update country' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const dataToUpdate: any = {};
    if (body.isActive !== undefined) dataToUpdate.isActive = Boolean(body.isActive);
    if (body.taxRate !== undefined) dataToUpdate.taxRate = Number(body.taxRate) || 0;
    if (body.currency !== undefined) dataToUpdate.currency = body.currency.toUpperCase().trim();
    if (body.methods !== undefined) dataToUpdate.methods = normalizeMethodsForDb(body.methods);

    const updated = await db.country.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json({ 
      data: {
        ...updated,
        methodsList: parsePaymentMethods(updated.methods)
      } 
    });
  } catch (error: any) {
    console.error('Countries PATCH Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to patch country' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    await db.country.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Country deleted successfully' });
  } catch (error: any) {
    console.error('Countries DELETE Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete country' }, { status: 500 });
  }
}
