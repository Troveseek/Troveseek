import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import { normalizeMethodsForDb, parsePaymentMethods, COUNTRY_PRESETS } from '@/lib/data/countries';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('active') === 'true';

    const whereClause = activeOnly ? { isActive: true } : {};

    const countries = await db.country.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    });

    // Ensure methods are parsed and normalized in response
    const formatted = countries.map(c => ({
      ...c,
      methodsList: parsePaymentMethods(c.methods)
    }));

    return NextResponse.json({ data: formatted });
  } catch (error) {
    console.error('Countries API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if this is a bulk preset seeding action
    if (body.action === 'seed_presets') {
      const existing = await db.country.findMany({ select: { code: true } });
      const existingCodes = new Set(existing.map(e => e.code.toLowerCase()));

      const created = [];
      for (const preset of COUNTRY_PRESETS) {
        if (!existingCodes.has(preset.code.toLowerCase())) {
          const newCountry = await db.country.create({
            data: {
              code: preset.code.toLowerCase().trim(),
              name: preset.name.trim(),
              nameAr: preset.nameAr?.trim() || null,
              currency: preset.currency.toUpperCase().trim(),
              taxRate: Number(preset.taxRate) || 0,
              methods: normalizeMethodsForDb(preset.methods),
              defaultLanguage: preset.defaultLanguage || 'en',
              isActive: true
            }
          });
          created.push(newCountry);
        }
      }

      return NextResponse.json({ 
        message: `Successfully seeded ${created.length} countries`,
        createdCount: created.length 
      }, { status: 201 });
    }

    const { code, name, nameAr, currency, taxRate, methods, defaultLanguage, isActive } = body;

    if (!code || !name || !currency) {
      return NextResponse.json({ error: 'Country Name, ISO Code, and Currency are required.' }, { status: 400 });
    }

    const cleanCode = code.toLowerCase().trim();

    // Check for duplicate ISO code
    const existing = await db.country.findUnique({
      where: { code: cleanCode }
    });

    if (existing) {
      return NextResponse.json({ error: `A country with ISO code "${cleanCode.toUpperCase()}" already exists.` }, { status: 409 });
    }

    const newCountry = await db.country.create({
      data: {
        code: cleanCode,
        name: name.trim(),
        nameAr: nameAr ? nameAr.trim() : null,
        currency: currency.toUpperCase().trim(),
        taxRate: Number(taxRate) || 0,
        methods: normalizeMethodsForDb(methods),
        defaultLanguage: defaultLanguage || 'en',
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    });

    return NextResponse.json({ 
      data: {
        ...newCountry,
        methodsList: parsePaymentMethods(newCountry.methods)
      } 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Countries POST Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create country' }, { status: 500 });
  }
}
