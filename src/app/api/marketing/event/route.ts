import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventName, eventData, userAgent, ipAddress, fbp, fbc, ttp } = body;

    // Fetch API keys
    const settings = await db.siteSetting.findMany({
      where: { key: { in: ['meta_capi_token', 'meta_pixel_id', 'tiktok_access_token', 'seo_tiktok'] } }
    });
    
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;

    const metaToken = map.meta_capi_token || process.env.META_CAPI_TOKEN;
    const metaPixelId = map.meta_pixel_id || process.env.META_PIXEL_ID;
    const tiktokToken = map.tiktok_access_token || process.env.TIKTOK_ACCESS_TOKEN;
    const tiktokPixelId = map.seo_tiktok || process.env.TIKTOK_PIXEL_ID;

    // 1. Send to Meta CAPI
    if (metaToken && metaPixelId) {
      const metaPayload = {
        data: [
          {
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            action_source: "website",
            user_data: {
              client_ip_address: ipAddress,
              client_user_agent: userAgent,
              fbp: fbp,
              fbc: fbc,
            },
            custom_data: eventData
          }
        ]
      };

      fetch(`https://graph.facebook.com/v19.0/${metaPixelId}/events?access_token=${metaToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metaPayload)
      }).catch(err => console.error("Meta CAPI Error:", err));
    }

    // 2. Send to TikTok Events API
    if (tiktokToken && tiktokPixelId) {
      const tiktokPayload = {
        pixel_code: tiktokPixelId,
        events: [
          {
            type: "track",
            event: eventName,
            event_id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            timestamp: new Date().toISOString(),
            context: {
              ip: ipAddress,
              user_agent: userAgent,
              ad: { callback: ttp }
            },
            properties: eventData
          }
        ]
      };

      fetch('https://business-api.tiktok.com/open_api/v1.3/pixel/track/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Access-Token': tiktokToken
        },
        body: JSON.stringify(tiktokPayload)
      }).catch(err => console.error("TikTok API Error:", err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Marketing Event Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
