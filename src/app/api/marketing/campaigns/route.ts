import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const campaigns = await db.campaign.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ data: campaigns });
  } catch (error) {
    console.error('Campaigns GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const { subject, content, status } = body;

    const newCampaign = await db.campaign.create({
      data: {
        subject,
        content,
        status: status || 'DRAFT',
      }
    });

    return NextResponse.json({ data: newCampaign });
  } catch (error) {
    console.error('Campaigns POST Error:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
