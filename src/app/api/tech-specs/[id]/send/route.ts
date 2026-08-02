import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { sendNotification } from '@/lib/notifications';

// POST — Mark spec as SENT
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.techSpec.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Tech spec not found' }, { status: 404 });
    }

    if (existing.status !== 'DRAFT') {
      return NextResponse.json({ error: `Cannot send a spec with status "${existing.status}"` }, { status: 400 });
    }

    const spec = await db.techSpec.update({
      where: { id },
      data: { status: 'SENT' },
    });

    // Create a notification for audit trail
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'SEND_TECH_SPEC',
        resource: 'TechSpec',
        resourceId: spec.id,
        details: JSON.stringify({
          specNumber: spec.specNumber,
          clientEmail: spec.clientEmail,
          signingUrl: `/sign/${spec.signatureToken}`,
        }),
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const signingUrl = `${baseUrl}/sign/${spec.signatureToken}`;

    // Send Email to Client
    await sendEmail({
      to: spec.clientEmail,
      subject: `Tech Specification Ready for Signature: ${spec.specNumber}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2>Hello ${spec.clientName},</h2>
          <p>The Technical Specification (<strong>${spec.specNumber}</strong>) for <strong>${spec.title}</strong> is now ready for your review and digital signature.</p>
          <p>Please review the document and sign it at your earliest convenience by clicking the link below:</p>
          <div style="margin: 32px 0;">
            <a href="${signingUrl}" style="background-color: #635BFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Review & Sign Document</a>
          </div>
          <p style="font-size: 14px; color: #666;">If the button does not work, copy and paste this link into your browser:<br/>
          <a href="${signingUrl}">${signingUrl}</a></p>
          <hr style="border: 1px solid #eaeaea; margin-top: 32px;"/>
          <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply directly to this email.</p>
        </div>
      `
    });

    // If user has an account with this email, send an in-app notification
    const clientUser = await db.user.findUnique({
      where: { email: spec.clientEmail.toLowerCase() },
      select: { id: true },
    });
    if (clientUser) {
      await sendNotification({
        userId: clientUser.id,
        title: 'New Technical Specification Ready',
        message: `Proposal #${spec.specNumber} (${spec.title}) is ready for your digital signature.`,
        type: 'INFO',
        link: `/sign/${spec.signatureToken}`,
      });
    }

    // Return the signing URL so admin can share it
    return NextResponse.json({
      success: true,
      signingUrl,
      specNumber: spec.specNumber,
    });
  } catch (error) {
    console.error('Error sending tech spec:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
