import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

interface CacheEntry {
  data: unknown;
  expires: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const CACHE_TTL = 60 * 1000; // 60 seconds
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // per IP per minute

function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         req.headers.get('x-real-ip') ||
         req.headers.get('cf-connecting-ip') ||
         'unknown';
}

function createCacheKey(url: string, apiKey?: string): string {
  const urlObj = new URL(url);
  urlObj.searchParams.delete('apikey');
  urlObj.searchParams.delete('token');
  urlObj.searchParams.delete('key');
  const baseKey = `${urlObj.toString()}_${apiKey ? 'with-key' : 'no-key'}`;
  if (baseKey.length > 250) {
    const hash = Buffer.from(baseKey).toString('base64').substring(0, 40);
    return `${baseKey.substring(0, 200)}_${hash}`;
  }
  return baseKey;
}

async function checkRateLimit(ip: string): Promise<boolean> {
  try {
    const key = `rate:${ip}`;
    const now = Date.now();
    const limit = await redis.get<RateLimitEntry>(key);
    if (!limit || now > limit.resetTime) {
      await redis.setex(key, 60, JSON.stringify({ 
        count: 1, 
        resetTime: now + RATE_LIMIT_WINDOW 
      }));
      return true;
    }
    if (limit.count >= MAX_REQUESTS) {
      return false;
    }
    limit.count++;
    await redis.setex(key, 60, JSON.stringify(limit));
    return true;
  } catch (error) {
    return true;
  }
}

async function getCached(key: string): Promise<unknown | null> {
  try {
    const cacheKey = `cache:${key}`;
    console.log(`[CACHE-KEY] ${cacheKey}`);
    console.log(`[CACHE-CHECK]`);
    const cached = await redis.get<CacheEntry>(cacheKey);
    if (!cached) {
      console.log(`[CACHE-MISS]`);
      return null;
    }
    const now = Date.now();
    if (now < cached.expires) {
      console.log(`[CACHE-HIT]`);
      return cached.data;
    }
    await redis.del(cacheKey);
    return null;
  } catch (error) {
    return null;
  }
}

async function setCache(key: string, data: unknown): Promise<void> {
  try {
    const cacheKey = `cache:${key}`;
    const entry: CacheEntry = {
      data,
      expires: Date.now() + CACHE_TTL
    };
    await redis.setex(cacheKey, 60, JSON.stringify(entry));
  } catch (error) {
    // Don't throw - caching failure shouldn't break the request
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const ip = getClientIP(req);

  const rateLimitPassed = await checkRateLimit(ip);
  if (!rateLimitPassed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again in a minute.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { url, apiKey } = body as { url?: string; apiKey?: string };

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Valid URL required' },
        { status: 400 }
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const cacheKey = createCacheKey(url, apiKey);
    console.log(`[CACHE-KEY] ${cacheKey}`);
    const cached = await getCached(cacheKey);
    if (cached) {
      const processingTime = Date.now() - startTime;
      console.log(`[CACHE-RESPONSE]`);
      return NextResponse.json({
        data: cached,
        cached: true
      });
    }

    let finalUrl = url;
    if (apiKey) {
      const urlObj = new URL(url);
      if (!urlObj.searchParams.has('apikey') && !urlObj.searchParams.has('token')) {
        urlObj.searchParams.set('apikey', apiKey);
      }
      finalUrl = urlObj.toString();
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000);

    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'API-Proxy/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as unknown;
    setCache(cacheKey, data).catch(() => {});

    return NextResponse.json({
      data,
      cached: false
    });

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 408 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'debug') {
    try {
      const pingResult = await redis.ping();
      const debugInfo = {
        redis_ping: pingResult,
        timestamp: new Date().toISOString(),
        cache_ttl: CACHE_TTL / 1000,
        rate_limit_window: RATE_LIMIT_WINDOW / 1000,
        max_requests: MAX_REQUESTS
      };
      return NextResponse.json(debugInfo);
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
  }

  try {
    const pingResult = await redis.ping();
    return NextResponse.json({ 
      status: 'healthy', 
      redis: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'unhealthy', 
      redis: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}