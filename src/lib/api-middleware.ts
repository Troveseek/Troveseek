import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import db from '@/lib/db';

// Simple in-memory rate limiter
const rateLimitCache = new Map<string, { count: number, resetTime: number }>();

export async function withApiSecurity(
  req: Request, 
  handler: () => Promise<NextResponse>, 
  options: { enforcePublicToggle?: boolean } = {}
) {
  try {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    
    // 1. Fetch API settings from DB
    const settings = await db.siteSetting.findMany({
      where: { key: { in: ['api_rate_limit', 'api_public_enabled'] } }
    });
    
    let rateLimit = 60;
    let publicEnabled = true;
    
    for (const s of settings) {
      if (s.key === 'api_rate_limit') rateLimit = parseInt(s.value, 10) || 60;
      if (s.key === 'api_public_enabled') publicEnabled = s.value === 'true';
    }

    // 2. Enforce Public API Toggle if required
    // We only enforce this if the request is NOT coming from our own frontend (no referer or cross-origin)
    if (options.enforcePublicToggle) {
      const referer = headersList.get('referer') || '';
      const host = headersList.get('host') || '';
      const isInternal = referer.includes(host);
      
      if (!isInternal && !publicEnabled) {
        return NextResponse.json({ error: 'Public API access is currently disabled.' }, { status: 403 });
      }
    }

    // 3. Enforce Rate Limiting
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    
    if (ip !== 'unknown') {
      const record = rateLimitCache.get(ip);
      if (record) {
        if (now > record.resetTime) {
          // Reset window
          rateLimitCache.set(ip, { count: 1, resetTime: now + windowMs });
        } else {
          if (record.count >= rateLimit) {
            return NextResponse.json({ error: 'Too many requests, please try again later.' }, { status: 429 });
          }
          record.count++;
        }
      } else {
        rateLimitCache.set(ip, { count: 1, resetTime: now + windowMs });
      }
    }

    // 4. Clean up old rate limit cache entries occasionally to prevent memory leaks
    if (Math.random() < 0.05) {
      for (const [key, val] of rateLimitCache.entries()) {
        if (now > val.resetTime) {
          rateLimitCache.delete(key);
        }
      }
    }

    // Proceed to handler
    return await handler();
  } catch (error) {
    console.error('API Security Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
