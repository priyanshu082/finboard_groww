import { NextRequest, NextResponse } from 'next/server';

interface CacheEntry {
  data: unknown;
  expires: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Simple in-memory cache and rate limiting
const cache = new Map<string, CacheEntry>();
const rateLimits = new Map<string, RateLimitEntry>();

const CACHE_TTL = 30 * 1000; // 30 seconds
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // per IP per minute

function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         req.headers.get('x-real-ip') || 
         'unknown';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(ip);
  
  if (!limit || now > limit.resetTime) {
    rateLimits.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (limit.count >= MAX_REQUESTS) {
    return false;
  }
  
  limit.count++;
  return true;
}

function getCached(key: string): unknown | null {
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, {
    data,
    expires: Date.now() + CACHE_TTL
  });
}

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  
  // Rate limiting
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again in a minute.' },
      { status: 429 }
    );
  }

  try {
    const { url, apiKey } = await req.json() as { url?: string; apiKey?: string };
    
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Valid URL required' },
        { status: 400 }
      );
    }

    // Create cache key
    const cacheKey = `${url}_${apiKey || 'nokey'}`;
    
    // Check cache first
    const cached = getCached(cacheKey);
    if (cached) {
      console.log(`[Proxy] Cache hit for key: ${cacheKey}`);
      return NextResponse.json({
        data: cached,
        cached: true
      });
    }

    // Build final URL with API key
    let finalUrl = url;
    if (apiKey) {
      const urlObj = new URL(url);
      if (url.includes('alphavantage.co')) {
        urlObj.searchParams.set('apikey', apiKey);
      } else if (url.includes('finnhub.io')) {
        urlObj.searchParams.set('token', apiKey);
      }
      finalUrl = urlObj.toString();
    }

    // Make request
    console.log(`[Proxy] Server hit for URL: ${finalUrl}`);
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FinBoard/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json() as unknown;
    
    // Cache the response
    setCache(cacheKey, data);

    return NextResponse.json({
      data,
      cached: false
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
