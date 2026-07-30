import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET — Public: Fetch spec for signing (no auth)
export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;

    const spec = await db.techSpec.findUnique({
      where: { signatureToken: token },
      include: { service: { select: { name: true } } },
    });

    if (!spec) {
      return NextResponse.json({ error: 'Spec not found or link is invalid' }, { status: 404 });
    }

    if (spec.status === 'SIGNED') {
      return NextResponse.json({
        error: 'already_signed',
        message: 'This document has already been signed.',
        signedAt: spec.signedAt,
      }, { status: 400 });
    }

    if (spec.status === 'DECLINED') {
      return NextResponse.json({
        error: 'declined',
        message: 'This document has been declined.',
      }, { status: 400 });
    }

    let isExpired = false;
    let shouldUpdateStatus = false;
    
    if (spec.validUntil) {
      // Set to end of the day (23:59:59.999) so it remains valid throughout the final day
      const expirationDate = new Date(spec.validUntil);
      expirationDate.setHours(23, 59, 59, 999);
      
      if (expirationDate < new Date()) {
        isExpired = true;
      }
    } else if (spec.status === 'EXPIRED') {
      isExpired = true;
    }

    // If it was wrongly marked as expired previously (bug fix), or if it's newly expired
    if (isExpired && spec.status !== 'EXPIRED') {
      await db.techSpec.update({ where: { id: spec.id }, data: { status: 'EXPIRED' } });
    } else if (!isExpired && spec.status === 'EXPIRED' && spec.validUntil) {
      // Un-expire if it was marked expired due to the previous midnight bug
      await db.techSpec.update({ where: { id: spec.id }, data: { status: 'SENT' } });
      spec.status = 'SENT'; // Reflect locally
    }

    if (isExpired) {
      return NextResponse.json({
        error: 'expired',
        message: 'This document has expired.',
      }, { status: 400 });
    }

    // Track first view
    if (!spec.viewedAt) {
      await db.techSpec.update({
        where: { id: spec.id },
        data: { viewedAt: new Date(), status: spec.status === 'SENT' ? 'VIEWED' : spec.status },
      });
    }

    // Return safe data (no internal fields)
    return NextResponse.json({
      title: spec.title,
      specNumber: spec.specNumber,
      clientName: spec.clientName,
      sections: spec.sections,
      totalPrice: spec.totalPrice,
      currency: spec.currency,
      validUntil: spec.validUntil,
      serviceName: spec.service?.name || null,
      status: spec.status,
      companySignature: spec.companySignature || null,
      companySignedAt: spec.companySignedAt || null,
    });
  } catch (error) {
    console.error('Error fetching spec for signing:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST — Public: Submit signature
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const data = await req.json();

    if (!data.signerName || !data.signatureData) {
      return NextResponse.json({ error: 'Signer name and signature are required' }, { status: 400 });
    }

    const spec = await db.techSpec.findUnique({ where: { signatureToken: token } });
    if (!spec) {
      return NextResponse.json({ error: 'Spec not found' }, { status: 404 });
    }

    if (spec.status === 'SIGNED') {
      return NextResponse.json({ error: 'Already signed' }, { status: 400 });
    }
    if (spec.status === 'DECLINED') {
      return NextResponse.json({ error: 'Already declined' }, { status: 400 });
    }

    // Get IP from headers
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    await db.techSpec.update({
      where: { id: spec.id },
      data: {
        status: 'SIGNED',
        signedAt: new Date(),
        signatureData: data.signatureData,
        signerName: data.signerName,
        signerIp: ip,
      },
    });

    return NextResponse.json({ success: true, message: 'Document signed successfully' });
  } catch (error) {
    console.error('Error signing tech spec:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
